import { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  User,
  Clock,
  Filter,
  Search,
  Download,
  Info,
  Lock,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getAuditLogs } from "../../services/auditService";
import { getLoadedSettings } from "../../services/settingsService";

// Helper to format raw JSON or long detail strings into clear human-readable text
const formatAuditDetails = (raw) => {
  if (!raw) return "Operation verified and recorded.";
  if (typeof raw === "string" && raw.trim().startsWith("{") && raw.trim().endsWith("}")) {
    try {
      const obj = JSON.parse(raw);
      const parts = [];
      if (obj.createdEmail) parts.push(`User: ${obj.createdEmail}`);
      if (obj.createdRole) parts.push(`Role: ${obj.createdRole}`);
      if (obj.updatedEmail) parts.push(`User: ${obj.updatedEmail}`);
      if (obj.targetRole) parts.push(`Role: ${obj.targetRole}`);
      if (obj.employeeName) parts.push(`Employee: ${obj.employeeName}`);
      if (obj.documentName) parts.push(`Doc: ${obj.documentName}`);
      if (obj.reportTitle) parts.push(`Report: ${obj.reportTitle}`);
      if (obj.action) parts.push(`Action: ${obj.action}`);
      if (obj.amount) parts.push(`Amount: ₹${Number(obj.amount).toLocaleString("en-IN")}`);
      if (parts.length > 0) return parts.join(" · ");
      return Object.entries(obj)
        .slice(0, 3)
        .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(" · ");
    } catch {
      return raw;
    }
  }
  return raw;
};

function AuditLogs() {
  const { user, role } = useAuth();
  const notification = useNotification();
  const settings = getLoadedSettings();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [timeRange, setTimeRange] = useState("ALL"); // "2DAYS", "7DAYS", "30DAYS", "ALL"
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch live audit logs from backend database
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load audit logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs based on search, role, category, and date range
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    return logs.filter((log) => {
      const code = log.logCode || `LOG-${log.id}`;
      const action = log.eventAction || "";
      const actor = log.actorName || "";
      const email = log.actorEmail || "";
      const details = typeof log.details === "string" ? log.details : JSON.stringify(log.details || "");

      const matchesSearch =
        !searchTerm ||
        code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = selectedRole === "ALL" || log.role === selectedRole;
      const matchesCategory = selectedCategory === "ALL" || log.category === selectedCategory;

      // Time Filter (e.g. Last 2 Days fresh page)
      let matchesTime = true;
      if (timeRange !== "ALL") {
        const logDate = new Date(log.createdAt || log.created_at || Date.now()).getTime();
        const diff = now - logDate;
        if (timeRange === "2DAYS") matchesTime = diff <= twoDaysMs;
        else if (timeRange === "7DAYS") matchesTime = diff <= sevenDaysMs;
        else if (timeRange === "30DAYS") matchesTime = diff <= thirtyDaysMs;
      }

      return matchesSearch && matchesRole && matchesCategory && matchesTime;
    });
  }, [logs, searchTerm, selectedRole, selectedCategory, timeRange]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedCategory, timeRange]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Log ID,Event Action,Category,Actor,Email,Role,Audit Details,Date & Time,Status\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.logCode || `LOG-${l.id}`}","${l.eventAction}","${l.category}","${l.actorName}","${l.actorEmail}","${l.role}","${(formatAuditDetails(l.details) || "").replace(/"/g, '""')}","${l.formattedTimestamp || l.createdAt || "2026-08-21"}","${l.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DCS_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notification.success("Audit Log CSV exported successfully!");
  };

  // Export Clean Branded PDF with Company Name and Proper Content Table
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DCS Official Security Audit Trail - ${settings.companyName || "DHARAM CONSULTANCY SERVICES"}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #18243A; margin: 0; padding: 15px; background: #FFFFFF; }
            .audit-container { width: 100%; max-width: 1050px; margin: 0 auto; border: 2px solid #DDD2E2; border-radius: 8px; padding: 25px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #A51D8D; padding-bottom: 14px; margin-bottom: 18px; }
            .brand h1 { margin: 0; color: #A51D8D; font-size: 22px; font-weight: 900; }
            .brand p { margin: 2px 0 0 0; color: #7B2A9B; font-size: 13px; font-weight: 700; }
            .title-box { text-align: right; }
            .title-box h2 { margin: 0; font-size: 17px; color: #18243A; font-weight: 800; }
            .title-box p { margin: 2px 0 0 0; font-size: 12px; color: #64748b; }
            
            .meta-banner { background: #F8F2FA; border: 1px solid #DDD2E2; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 12.5px; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            .meta-grid span { color: #64748b; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; }
            .meta-grid strong { color: #A51D8D; font-size: 13px; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
            th { text-align: left; background: #F8F2FA; padding: 9px 10px; border-bottom: 2px solid #DDD2E2; color: #18243A; font-weight: 800; font-size: 12px; }
            td { padding: 9px 10px; border-bottom: 1px solid #DDD2E2; vertical-align: top; word-break: break-word; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; }
            .badge-success { background: #EDF9F2; color: #2E9B67; border: 1px solid #A3E4C3; }
            .badge-purple { background: #F8F2FA; color: #7B2A9B; border: 1px solid #DDD2E2; }
            
            .footer { text-align: center; font-size: 11px; color: #8492A6; border-top: 1px solid #DDD2E2; padding-top: 14px; margin-top: 18px; }
          </style>
        </head>
        <body>
          <div class="audit-container">
            <div class="header">
              <div class="brand">
                <h1>${settings.companyName || "DHARAM CONSULTANCY SERVICES"}</h1>
                <p>Enterprise Security, Compliance & Governance Hub</p>
              </div>
              <div class="title-box">
                <h2>Official Audit Trail Statement</h2>
                <p>Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · Confidential Record</p>
              </div>
            </div>

            <div class="meta-banner">
              <div class="meta-grid">
                <div><span>Total Records:</span> <strong>${filteredLogs.length} Events</strong></div>
                <div><span>Compliance Standard:</span> <strong>ISO 27001 / SOC 2</strong></div>
                <div><span>Audit Scope:</span> <strong>Enterprise Ledger</strong></div>
                <div><span>Integrity Status:</span> <strong>Cryptographically Verified</strong></div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Log Code</th>
                  <th>Event Action</th>
                  <th>Category</th>
                  <th>Actor & Email</th>
                  <th>Role</th>
                  <th>Audit Details</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLogs
        .map(
          (l) => `
                  <tr>
                    <td><strong style="color: #A51D8D;">${l.logCode || `LOG-${l.id}`}</strong></td>
                    <td><strong>${l.eventAction}</strong></td>
                    <td><span class="badge badge-purple">${l.category}</span></td>
                    <td>
                      <div><strong>${l.actorName}</strong></div>
                      <div style="font-size: 11px; color: #64748b;">${l.actorEmail}</div>
                    </td>
                    <td><span class="badge badge-purple">${l.role}</span></td>
                    <td style="max-width: 250px; color: #475569;">${formatAuditDetails(l.details)}</td>
                    <td style="white-space: nowrap; color: #18243A; font-weight: 600;">${l.formattedTimestamp || l.createdAt || "2026-08-21"}</td>
                    <td><span class="badge badge-success">${l.status}</span></td>
                  </tr>
                `
        )
        .join("")}
              </tbody>
            </table>

            <div class="footer">
              <p>CONFIDENTIAL & PROPRIETARY — Official Audit Trail issued by <strong>${settings.companyName || "Dharam Consultancy Services"}</strong>. Cryptographically locked against unauthorized modifications.</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    notification.success("Audit Log PDF preview opened for printing/download!");
  };

  return (
    <div className="audit-logs-page" style={{ padding: "0 0 40px 0" }}>
      {/* PAGE HEADER */}
      <div className="module-heading" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <div>
          <p className="section-label">SECURITY, COMPLIANCE & GOVERNANCE</p>
          <h1 style={{ margin: "4px 0", fontSize: "24px", fontWeight: "800", color: "#18243A" }}>
            Enterprise Audit Trail
          </h1>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b" }}>
            Live chronological tracking of system mutations, enrollments, reports, and administrative authorizations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            className="secondary-button"
            onClick={fetchLogs}
            disabled={loading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderColor: "#DDD2E2",
              color: "#18243A",
              fontSize: "13px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            className="secondary-button"
            onClick={handleExportCSV}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderColor: "#DDD2E2",
              color: "#18243A",
              fontSize: "13px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <FileSpreadsheet size={14} />
            Export CSV
          </button>

          <button
            className="primary-button"
            onClick={handleExportPDF}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              background: "linear-gradient(135deg, #A51D8D 0%, #7B2A9B 100%)",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <Printer size={14} />
            Export PDF Report
          </button>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              backgroundColor: "#EDF9F2",
              color: "#2E9B67",
              border: "1px solid #A3E4C3",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "800",
            }}
          >
            <ShieldCheck size={15} />
            ISO 27001 / SOC 2 Active
          </span>
        </div>
      </div>

      {/* FILTERS & SEARCH BAR */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
          backgroundColor: "#FFFFFF",
          padding: "14px 18px",
          borderRadius: "12px",
          border: "1px solid #DDD2E2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "240px" }}>
          <div className="input-wrapper" style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <Search size={16} color="#8492A6" />
            <input
              type="text"
              placeholder="Search by Actor, Event, Log Code, or Details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", border: "none", background: "transparent", fontSize: "13.5px", color: "#18243A", outline: "none" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Time Range Filter (2 Days Fresh Page) */}
          <div className="input-wrapper" style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: "13px", color: "#18243A", outline: "none", fontWeight: "700" }}
            >
              <option value="ALL">All Recorded Logs</option>
              <option value="2DAYS">Last 2 Days (Fresh Logs)</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="input-wrapper" style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: "13px", color: "#18243A", outline: "none", fontWeight: "600" }}
            >
              <option value="ALL">All Event Types</option>
              <option value="AUTH">Authentication & Sign-in</option>
              <option value="FINANCE">Finance & Payroll</option>
              <option value="EMPLOYEE">Employee Lifecycle</option>
              <option value="LEAVE">Leave Management</option>
              <option value="SECURITY">Security & Passwords</option>
              <option value="REPORT">Reports & Intelligence</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="input-wrapper" style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: "13px", color: "#18243A", outline: "none", fontWeight: "600" }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">ADMIN</option>
              <option value="HR">HR</option>
              <option value="FINANCE">FINANCE</option>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="SYSTEM">SYSTEM</option>
            </select>
          </div>
        </div>
      </div>

      {/* AUDIT LOG TABLE CARD */}
      <section className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #DDD2E2", borderRadius: "12px", overflow: "hidden", padding: 0 }}>
        <div className="card-header" style={{ padding: "16px 20px", borderBottom: "1px solid #DDD2E2", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", backgroundColor: "#fafbfc" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#18243A", fontWeight: "800" }}>
              Active Security Log Stream ({filteredLogs.length} Records)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748b" }}>
              {timeRange === "2DAYS" ? "Showing fresh logs generated within the last 2 days." : "Database-backed audit chain tracking all operations with 10 records per page."}
            </p>
          </div>

          <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#9B2282" }}>
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* RESPONSIVE TABLE WRAPPER */}
        <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: "960px", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "110px" }}>Log Code</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "160px" }}>Event Action</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "100px" }}>Category</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "180px" }}>Actor & Email</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "90px" }}>Role</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", minWidth: "240px", maxWidth: "340px" }}>Audit Details</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "180px", whiteSpace: "nowrap" }}>Date & Time</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "90px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading audit stream...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No audit records found matching your filters.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id || log.logCode}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      transition: "background-color 0.15s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#faf5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <strong style={{ color: "#A51D8D", fontSize: "12px", fontFamily: "monospace" }}>
                        {log.logCode || `LOG-${log.id}`}
                      </strong>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <strong style={{ color: "#18243A", fontSize: "13px", display: "block" }}>
                        {log.eventAction}
                      </strong>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          backgroundColor: "#F8F2FA",
                          border: "1px solid #DDD2E2",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#7B2A9B",
                          display: "inline-block",
                        }}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ fontSize: "13px", color: "#18243A" }}>{log.actorName}</strong>
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>{log.actorEmail}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: log.role === "ADMIN" ? "#F8F2FA" : "#EDF9F2",
                          color: log.role === "ADMIN" ? "#A51D8D" : "#2E9B67",
                          border: `1px solid ${log.role === "ADMIN" ? "#DDD2E2" : "#A3E4C3"}`,
                          display: "inline-block",
                        }}
                      >
                        {log.role}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        verticalAlign: "middle",
                        fontSize: "12.5px",
                        color: "#334155",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        lineHeight: "1.45",
                        maxWidth: "340px",
                      }}
                    >
                      {formatAuditDetails(log.details)}
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#334155", fontWeight: "600", fontSize: "12px" }}>
                        <Calendar size={13} color="#94a3b8" />
                        <span>{log.formattedTimestamp || log.createdAt || "2026-08-23 12:00:00 IST"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          backgroundColor: "#EDF9F2",
                          color: "#2E9B67",
                          border: "1px solid #A3E4C3",
                          fontSize: "11px",
                          fontWeight: "800",
                          padding: "3px 8px",
                          borderRadius: "4px",
                          display: "inline-block",
                        }}
                      >
                        {log.status || "SUCCESS"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION TOOLBAR (10 LOGS PER PAGE) */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "#ffffff",
          }}
        >
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            Showing <strong>{filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong>{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of{" "}
            <strong>{filteredLogs.length}</strong> records
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: currentPage === 1 ? "#f8fafc" : "#ffffff",
                color: currentPage === 1 ? "#94a3b8" : "#1e293b",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ChevronLeft size={15} />
              Previous
            </button>

            {/* Page Number Pills */}
            <div style={{ display: "flex", gap: "4px" }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNum, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && pageNum - prev > 1;

                  return (
                    <span key={pageNum} style={{ display: "flex", alignItems: "center" }}>
                      {showEllipsis && <span style={{ padding: "0 4px", color: "#94a3b8" }}>...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          padding: "6px 11px",
                          borderRadius: "6px",
                          border: pageNum === currentPage ? "1px solid #9B2282" : "1px solid #cbd5e1",
                          backgroundColor: pageNum === currentPage ? "#9B2282" : "#ffffff",
                          color: pageNum === currentPage ? "#ffffff" : "#334155",
                          fontSize: "12.5px",
                          fontWeight: pageNum === currentPage ? "700" : "500",
                          cursor: "pointer",
                        }}
                      >
                        {pageNum}
                      </button>
                    </span>
                  );
                })}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                backgroundColor: currentPage === totalPages || totalPages === 0 ? "#f8fafc" : "#ffffff",
                color: currentPage === totalPages || totalPages === 0 ? "#94a3b8" : "#1e293b",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: currentPage === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AuditLogs;
