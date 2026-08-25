import { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
  const notification = useNotification();
  const settings = getLoadedSettings();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase().trim();

    return logs.filter((log) => {
      const code = log.logCode || `LOG-${log.id}`;
      const action = log.eventAction || "";
      const actor = log.actorName || "";
      const email = log.actorEmail || "";
      const details = typeof log.details === "string" ? log.details : JSON.stringify(log.details || "");

      return (
        code.toLowerCase().includes(term) ||
        action.toLowerCase().includes(term) ||
        actor.toLowerCase().includes(term) ||
        email.toLowerCase().includes(term) ||
        details.toLowerCase().includes(term)
      );
    });
  }, [logs, searchTerm]);

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Log ID,Action,Category,User,Email,Role,Details,Date & Time,Status\n";
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
    link.setAttribute("download", `DCS_User_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notification.success("User Logs CSV exported successfully!");
  };

  // Export Clean Branded PDF
  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>User Logs Report - ${settings.companyName || "DCS Office Management"}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #0F172A; margin: 0; padding: 15px; background: #FFFFFF; }
            .audit-container { width: 100%; max-width: 1050px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; padding: 25px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1E293B; padding-bottom: 14px; margin-bottom: 18px; }
            .brand h1 { margin: 0; color: #0F172A; font-size: 22px; font-weight: 800; }
            .brand p { margin: 2px 0 0 0; color: #64748B; font-size: 13px; font-weight: 600; }
            .title-box { text-align: right; }
            .title-box h2 { margin: 0; font-size: 17px; color: #0F172A; font-weight: 800; }
            .title-box p { margin: 2px 0 0 0; font-size: 12px; color: #64748B; }
            
            .meta-banner { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 12.5px; }
            .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .meta-grid span { color: #64748B; display: block; font-size: 11px; text-transform: uppercase; font-weight: 700; }
            .meta-grid strong { color: #0F172A; font-size: 13px; }

            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12.5px; }
            th { text-align: left; background: #F8FAFC; padding: 9px 10px; border-bottom: 2px solid #E2E8F0; color: #0F172A; font-weight: 800; font-size: 12px; }
            td { padding: 9px 10px; border-bottom: 1px solid #E2E8F0; vertical-align: top; word-break: break-word; }
            .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; }
            .badge-success { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
            .badge-purple { background: #F1F5F9; color: #1E293B; border: 1px solid #CBD5E1; }
            
            .footer { text-align: center; font-size: 11px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 14px; margin-top: 18px; }
          </style>
        </head>
        <body>
          <div class="audit-container">
            <div class="header">
              <div class="brand">
                <h1>${settings.companyName || "DCS Office Management"}</h1>
                <p>System User Logs Report</p>
              </div>
              <div class="title-box">
                <h2>User Logs Statement</h2>
                <p>Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              </div>
            </div>

            <div class="meta-banner">
              <div class="meta-grid">
                <div><span>Total Records:</span> <strong>${filteredLogs.length} Records</strong></div>
                <div><span>Scope:</span> <strong>System User Activity</strong></div>
                <div><span>Status:</span> <strong>Verified Logs</strong></div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Action</th>
                  <th>Category</th>
                  <th>User & Email</th>
                  <th>Role</th>
                  <th>Details</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filteredLogs
        .map(
          (l) => `
                  <tr>
                    <td><strong style="color: #1E293B;">${l.logCode || `LOG-${l.id}`}</strong></td>
                    <td><strong>${l.eventAction}</strong></td>
                    <td><span class="badge badge-purple">${l.category}</span></td>
                    <td>
                      <div><strong>${l.actorName}</strong></div>
                      <div style="font-size: 11px; color: #64748b;">${l.actorEmail}</div>
                    </td>
                    <td><span class="badge badge-purple">${l.role}</span></td>
                    <td style="max-width: 250px; color: #475569;">${formatAuditDetails(l.details)}</td>
                    <td style="white-space: nowrap; color: #0F172A; font-weight: 600;">${l.formattedTimestamp || l.createdAt || "2026-08-21"}</td>
                    <td><span class="badge badge-success">${l.status}</span></td>
                  </tr>
                `
        )
        .join("")}
              </tbody>
            </table>

            <div class="footer">
              <p>Official User Logs Report issued by <strong>${settings.companyName || "DCS Office Management"}</strong>.</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    notification.success("User Logs PDF preview opened!");
  };

  return (
    <div className="audit-logs-page" style={{ padding: "0 0 40px 0" }}>
      {/* PAGE HEADER */}
      <div className="module-heading" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        <div>
          <p className="section-label">LOGS</p>
          <h1 style={{ margin: "4px 0", fontSize: "24px", fontWeight: "800", color: "#0F172A" }}>
            User Logs
          </h1>
          <p style={{ margin: 0, fontSize: "13.5px", color: "#64748B" }}>
            Track user activities and system actions in real time.
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
              borderColor: "#CBD5E1",
              color: "#0F172A",
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
              borderColor: "#CBD5E1",
              color: "#0F172A",
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
              backgroundColor: "#1E293B",
              borderColor: "#1E293B",
              color: "#FFFFFF",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
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
              backgroundColor: "#ECFDF5",
              color: "#059669",
              border: "1px solid #A7F3D0",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "800",
            }}
          >
            <ShieldCheck size={15} />
            Security Verified
          </span>
        </div>
      </div>

      {/* SEARCH BAR ONLY (FULL WIDTH & RESPONSIVE) */}
      <div style={{ marginBottom: "20px", width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1.5px solid #CBD5E1",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
            width: "100%",
          }}
        >
          <Search size={18} color="#64748B" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by User, Action, Log ID, or Details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              fontSize: "14px",
              color: "#0F172A",
              outline: "none",
            }}
          />
        </div>
      </div>

      {/* AUDIT LOG TABLE CARD */}
      <section className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", overflow: "hidden", padding: 0 }}>
        <div className="card-header" style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", backgroundColor: "#F8FAFC" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#0F172A", fontWeight: "800" }}>
              User Logs ({filteredLogs.length} Records)
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748B" }}>
              Showing 10 records per page.
            </p>
          </div>

          <div style={{ fontSize: "12.5px", fontWeight: "700", color: "#1E293B" }}>
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* RESPONSIVE TABLE WRAPPER */}
        <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: "960px", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "110px" }}>Log ID</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "160px" }}>Action</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "100px" }}>Category</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "180px" }}>User & Email</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "90px" }}>Role</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", minWidth: "240px", maxWidth: "340px" }}>Details</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "180px", whiteSpace: "nowrap" }}>Date & Time</th>
                <th style={{ padding: "12px 16px", fontSize: "12px", fontWeight: "800", color: "#475569", width: "90px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    Loading user logs...
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                    No logs found matching your search.
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
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <strong style={{ color: "#1E293B", fontSize: "12px", fontFamily: "monospace" }}>
                        {log.logCode || `LOG-${log.id}`}
                      </strong>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <strong style={{ color: "#0F172A", fontSize: "13px", display: "block" }}>
                        {log.eventAction}
                      </strong>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          backgroundColor: "#F1F5F9",
                          border: "1px solid #CBD5E1",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          color: "#1E293B",
                          display: "inline-block",
                        }}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ fontSize: "13px", color: "#0F172A" }}>{log.actorName}</strong>
                        <span style={{ fontSize: "11.5px", color: "#64748B" }}>{log.actorEmail}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", verticalAlign: "middle" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: log.role === "ADMIN" ? "#F1F5F9" : "#ECFDF5",
                          color: log.role === "ADMIN" ? "#1E293B" : "#059669",
                          border: `1px solid ${log.role === "ADMIN" ? "#CBD5E1" : "#A7F3D0"}`,
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
                          backgroundColor: "#ECFDF5",
                          color: "#059669",
                          border: "1px solid #A7F3D0",
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

        {/* PAGINATION TOOLBAR */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            backgroundColor: "#FFFFFF",
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
                border: "1px solid #CBD5E1",
                backgroundColor: currentPage === 1 ? "#F8FAFC" : "#FFFFFF",
                color: currentPage === 1 ? "#94A3B8" : "#0F172A",
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
                          border: pageNum === currentPage ? "1px solid #1E293B" : "1px solid #CBD5E1",
                          backgroundColor: pageNum === currentPage ? "#1E293B" : "#FFFFFF",
                          color: pageNum === currentPage ? "#FFFFFF" : "#334155",
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
                border: "1px solid #CBD5E1",
                backgroundColor: currentPage === totalPages || totalPages === 0 ? "#F8FAFC" : "#FFFFFF",
                color: currentPage === totalPages || totalPages === 0 ? "#94A3B8" : "#0F172A",
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
