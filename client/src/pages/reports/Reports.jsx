import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileSpreadsheet,
  Download,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  Building2,
  WalletCards,
  Award,
  Receipt,
  Printer,
  Eye,
  X,
  FileCheck,
  CheckCircle2,
  Lock,
  PlusCircle,
  Send,
  UserCheck,
  Info,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getLoadedSettings } from "../../services/settingsService";
import { getEmployees } from "../../services/employeeService";
import { recordAuditEvent } from "../../services/auditService";
import { sendFinanceNotification } from "../../services/notificationService";



function Reports() {
  const [searchParams] = useSearchParams();
  const { user, role } = useAuth();
  const notification = useNotification();
  const userRole = (role || user?.role || "EMPLOYEE").toUpperCase();
  const userEmail = (user?.email || "").trim().toLowerCase();
  const isEmployee = userRole === "EMPLOYEE";
  const isHR = ["HR", "ADMIN"].includes(userRole);
  const isFinance = ["FINANCE", "ADMIN"].includes(userRole);

  const settings = getLoadedSettings();
  const currencySymbol = settings.currencySymbol || "₹";

  const initialTab = searchParams.get("tab") || (isEmployee ? "my-reports" : "all");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedReport, setSelectedReport] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Live Employee List for targeting reports
  const [employees, setEmployees] = useState([]);

  // Fetch employees for Finance/Admin targeting
  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const data = await getEmployees();
        setEmployees(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("Failed to load employee list for reports targeting:", err);
      }
    };
    fetchEmps();
  }, []);

  // Available Target Employees: Exclude the logged-in user (self cannot be receiver)
  const availableTargetEmployees = useMemo(() => {
    const currentEmail = (userEmail || "").toLowerCase().trim();

    return employees.filter((emp) => {
      const empEmail = (emp.email || "").toLowerCase().trim();
      // 1. Exclude self (Self receiver report cannot be made)
      if (empEmail === currentEmail) return false;

      // 2. If sender is Finance, they can only send reports to HR and Employees (not Admin)
      if (userRole === "FINANCE") {
        const empRole = (emp.user_role || emp.role || "").toUpperCase();
        const empDesignation = (emp.designation || "").toUpperCase();
        const empDept = (emp.department_name || emp.department || "").toUpperCase();
        if (empRole === "ADMIN" || empDesignation.includes("ADMIN") || empDept.includes("ADMIN")) {
          return false;
        }
      }

      return true;
    });
  }, [employees, userEmail, userRole]);

  // Form State for creating and sending Finance Report
  const [financeForm, setFinanceForm] = useState({
    targetEmail: "",
    reportTitle: "Monthly Salary Statement",
    fiscalPeriod: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
    grossSalary: "55000",
    allowances: "5000",
    deductions: "3000",
    specialNotes: "Regular monthly salary credit with verified statutory deductions.",
  });

  const handleOpenCreateModal = () => {
    const firstEmp = availableTargetEmployees[0];
    const initialTargetEmail = firstEmp?.email || "";
    setFinanceForm({
      targetEmail: initialTargetEmail,
      reportTitle: "Monthly Salary Statement",
      fiscalPeriod: new Date().toLocaleString("en-US", { month: "long", year: "numeric" }),
      grossSalary: firstEmp?.salary ? String(Number(firstEmp.salary)) : "55000",
      allowances: firstEmp?.allowances ? String(Number(firstEmp.allowances)) : "5000",
      deductions: (firstEmp?.pf_deduction || firstEmp?.tax_deduction)
        ? String((Number(firstEmp.pf_deduction) || 0) + (Number(firstEmp.tax_deduction) || 0))
        : "3000",
      specialNotes: "Regular monthly salary credit with verified statutory deductions.",
    });
    setCreateModalOpen(true);
  };

  const handleTargetEmployeeChange = (e) => {
    const selectedEmail = e.target.value;
    const emp = availableTargetEmployees.find(
      (em) => (em.email || "").toLowerCase() === selectedEmail.toLowerCase()
    );
    setFinanceForm((prev) => ({
      ...prev,
      targetEmail: selectedEmail,
      grossSalary: emp?.salary ? String(Number(emp.salary)) : prev.grossSalary,
      allowances: emp?.allowances ? String(Number(emp.allowances)) : prev.allowances,
      deductions: (emp?.pf_deduction || emp?.tax_deduction)
        ? String((Number(emp.pf_deduction) || 0) + (Number(emp.tax_deduction) || 0))
        : prev.deductions,
    }));
  };

  // Local Storage Custom Finance Reports
  const [customReports, setCustomReports] = useState(() => {
    try {
      const stored = localStorage.getItem("dcs_custom_finance_reports");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (r) =>
              r.id !== "REP-FIN-ANAND-01" &&
              !r.title?.includes("August 2026 Salary")
          );
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  // Base Corporate Catalog
  const standardReports = [];

  const allReports = useMemo(() => {
    return [...customReports, ...standardReports];
  }, [customReports]);

  const visibleReports = useMemo(() => {
    if (isEmployee) {
      return allReports.filter((rep) => {
        const isTargetedToMe =
          rep.targetEmployeeEmail &&
          (rep.targetEmployeeEmail.trim().toLowerCase() === userEmail ||
            rep.targetEmployeeEmail === "ALL");
        return isTargetedToMe && rep.targetRoles.includes("EMPLOYEE");
      });
    }
    return allReports.filter((rep) => {
      return rep.targetRoles.includes(userRole);
    });
  }, [allReports, isEmployee, userEmail, userRole]);

  // Auto-open target report preview when deep-linked from dashboard graphs/charts
  useEffect(() => {
    const reportId = searchParams.get("reportId");
    if (reportId && allReports.length > 0) {
      const target = allReports.find((r) => r.id === reportId);
      if (target) {
        setSelectedReport(target);
        setPreviewModalOpen(true);
      }
    }
  }, [searchParams, allReports]);

  const handlePublishFinanceReport = (e) => {

    e.preventDefault();
    const targetEmp = employees.find(
      (emp) => emp.email?.toLowerCase() === financeForm.targetEmail.toLowerCase()
    );
    const targetName = targetEmp
      ? `${targetEmp.first_name || ""} ${targetEmp.last_name || ""}`.trim() || targetEmp.email
      : financeForm.targetEmail === "ALL"
      ? "All Employees"
      : financeForm.targetEmail;

    const gross = Number(financeForm.grossSalary) || 0;
    const allowances = Number(financeForm.allowances) || 0;
    const deductions = Number(financeForm.deductions) || 0;
    const net = gross + allowances - deductions;

    const newReport = {
      id: `REP-FIN-${Date.now().toString().slice(-6)}`,
      title: `${financeForm.fiscalPeriod} - ${financeForm.reportTitle}`,
      category: "Personal Finance & Compensation",
      generatedBy: `Finance Team (${user?.name || "Finance Manager"})`,
      targetRoles: ["EMPLOYEE", "FINANCE", "ADMIN"],
      targetEmployeeEmail: financeForm.targetEmail,
      targetEmployeeName: targetName,
      purpose: "Official Salary Disbursement & Statutory Tax Slip",
      usage: `Referred and issued by Finance Team directly to ${targetName} for verification and record.`,
      format: "PDF / Verified Slip",
      scope: "Confidential Financial Statement",
      date: new Date().toISOString().slice(0, 10),
      icon: Receipt,
      color: "#A51D8D",
      data: {
        summary: [
          { label: "Gross Earnings", value: `${currencySymbol}${gross.toLocaleString("en-IN")}` },
          { label: "Allowances & Bonus", value: `${currencySymbol}${allowances.toLocaleString("en-IN")}` },
          { label: "Total Deductions", value: `${currencySymbol}${deductions.toLocaleString("en-IN")}` },
          { label: "Net Bank Transfer", value: `${currencySymbol}${net.toLocaleString("en-IN")}` },
        ],
        details: [
          { item: "Base Salary Package", dept: "Earnings", metric: "Monthly Basic", score: `${currencySymbol}${gross.toLocaleString("en-IN")}` },
          { item: "Special & Travel Allowance", dept: "Earnings", metric: "Allowance", score: `${currencySymbol}${allowances.toLocaleString("en-IN")}` },
          { item: "PF Contribution & TDS", dept: "Deductions", metric: "Statutory", score: `-${currencySymbol}${deductions.toLocaleString("en-IN")}` },
          { item: "Special Remarks", dept: "Finance Note", metric: "Status", score: financeForm.specialNotes || "Verified" },
        ],
      },
    };

    const updated = [newReport, ...customReports];
    setCustomReports(updated);
    try {
      localStorage.setItem("dcs_custom_finance_reports", JSON.stringify(updated));
    } catch {
      // storage
    }

    // Record Live Audit Event in Database
    recordAuditEvent({
      eventAction: "Finance Report Generated & Sent",
      category: "FINANCE",
      actorName: user?.name || "Om Raikar",
      actorEmail: user?.email || "omraikar2128@gmail.com",
      role: userRole,
      details: `Generated ${newReport.title} issued to ${targetName} (${currencySymbol}${net.toLocaleString("en-IN")}).`,
      status: "SUCCESS",
    }).catch(() => {});

    // Dispatch Persistent Backend Notification to Target Employee + Executive Admin Copy
    sendFinanceNotification({
      title: newReport.title,
      message: `Official financial statement issued for ${targetName}. Net bank transfer: ${currencySymbol}${net.toLocaleString("en-IN")}.`,
      targetEmail: financeForm.targetEmail,
      targetName: targetName,
      amount: net,
      month: financeForm.fiscalPeriod,
      reportId: newReport.id,
      type: "PAYROLL",
    }).catch((notifErr) => console.warn("Finance notification error:", notifErr));

    setCreateModalOpen(false);
    notification.success(`Finance report successfully generated and referred to ${targetName}! (Executive copy sent to Admin)`);
  };


  const handleOpenPreview = (report) => {
    setSelectedReport(report);
    setPreviewModalOpen(true);
  };

  const handleDownload = (report) => {
    // Record Live Audit Event on Export
    recordAuditEvent({
      eventAction: "Report Exported / Printed",
      category: "REPORT",
      actorName: user?.name || "Om Raikar",
      actorEmail: user?.email || "omraikar2128@gmail.com",
      role: userRole,
      details: `Exported printable PDF for '${report.title}' (${report.id}).`,
      status: "SUCCESS",
    }).catch(() => {});

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;


    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${report.title} - DCS Official Report</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #18243A; margin: 0; padding: 20px; background: #FFFFFF; }
            .report-container { max-width: 800px; margin: 0 auto; border: 2px solid #DDD2E2; border-radius: 8px; padding: 30px; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #A51D8D; padding-bottom: 16px; margin-bottom: 20px; }
            .brand h1 { margin: 0; color: #A51D8D; font-size: 22px; font-weight: 900; }
            .brand p { margin: 2px 0 0 0; color: #7B2A9B; font-size: 13px; font-weight: 700; }
            .title-box { text-align: right; }
            .title-box h2 { margin: 0; font-size: 17px; color: #18243A; font-weight: 800; }
            .title-box p { margin: 2px 0 0 0; font-size: 12px; color: #64748b; }
            
            .meta-banner { background: #F8F2FA; border: 1px solid #DDD2E2; border-radius: 6px; padding: 12px 16px; margin-bottom: 20px; font-size: 12.5px; }
            .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .meta-grid strong { color: #A51D8D; }

            .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 24px; }
            .summary-card { background: #F8F2FA; border: 1px solid #DDD2E2; border-radius: 6px; padding: 14px; }
            .summary-card span { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 4px; }
            .summary-card strong { font-size: 18px; color: #A51D8D; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13.5px; }
            th { text-align: left; background: #F8F2FA; padding: 10px 12px; border-bottom: 2px solid #DDD2E2; color: #18243A; }
            td { padding: 10px 12px; border-bottom: 1px solid #DDD2E2; }
            .footer { text-align: center; font-size: 11px; color: #8492A6; border-top: 1px solid #DDD2E2; padding-top: 16px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <div class="brand">
                <h1>${settings.companyName || "DHARAM CONSULTANCY SERVICES"}</h1>
                <p>Enterprise Business Intelligence & Finance Hub</p>
              </div>
              <div class="title-box">
                <h2>${report.title}</h2>
                <p>Ref: ${report.id} · Issued: ${report.date || "2026-08-21"}</p>
              </div>
            </div>

            <div class="meta-banner">
              <div class="meta-grid">
                <div><span>Generated By:</span> <strong>${report.generatedBy || "Finance Team"}</strong></div>
                <div><span>Referred To / Target:</span> <strong>${report.targetEmployeeName || "Employee"}</strong></div>
                <div><span>Purpose:</span> <strong>${report.purpose || "Official Record"}</strong></div>
                <div><span>Usage / Scope:</span> <strong>${report.usage || report.scope || "Verified"}</strong></div>
              </div>
            </div>

            <div class="summary-grid">
              ${report.data.summary
                .map(
                  (stat) => `
                <div class="summary-card">
                  <span>${stat.label}</span>
                  <strong>${stat.value}</strong>
                </div>
              `
                )
                .join("")}
            </div>

            <table>
              <thead>
                <tr>
                  <th>Particulars / Item</th>
                  <th>Category</th>
                  <th>Component Details</th>
                  <th style="text-align: right;">Amount / Score</th>
                </tr>
              </thead>
              <tbody>
                ${report.data.details
                  .map(
                    (row) => `
                  <tr>
                    <td><strong>${row.item}</strong></td>
                    <td>${row.dept}</td>
                    <td>${row.metric}</td>
                    <td style="text-align: right; font-weight: bold; color: #A51D8D;">${row.score}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="footer">
              <p>CONFIDENTIAL & PROPRIETARY — This certified document was cryptographically logged and issued for <strong>${report.targetEmployeeName}</strong> by Dharam Consultancy Services.</p>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="reports-page">
      <div className="module-heading">
        <div>
          <p className="section-label">BUSINESS INTELLIGENCE & COMPENSATION EXPORTS</p>
          <h1>Enterprise Reports Hub</h1>
          <p>
            {isEmployee
              ? `Personalized finance & compensation reports sent by the Finance Team to ${user?.name || "you"}.`
              : "Generate, review, and export employee salary reports, executive payroll analytics, and department audits."}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {isFinance && (
            <button
              className="primary-button"
              onClick={handleOpenCreateModal}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                fontSize: "13.5px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #A51D8D 0%, #7B2A9B 100%)",
                boxShadow: "0 4px 14px rgba(165, 29, 141, 0.25)",
              }}
            >
              <PlusCircle size={16} />
              Create & Send Finance Report
            </button>
          )}

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              backgroundColor: "#F8F2FA",
              color: "#A51D8D",
              border: "1px solid #DDD2E2",
              borderRadius: "20px",
              fontSize: "12.5px",
              fontWeight: "800",
            }}
          >
            <BarChart3 size={15} />
            {userRole} Workspace
          </span>
        </div>
      </div>

      <div
        style={{
          background: "linear-gradient(135deg, rgba(165, 29, 141, 0.06) 0%, rgba(123, 42, 155, 0.04) 100%)",
          border: "1px solid #DDD2E2",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "#A51D8D",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ color: "#18243A", fontSize: "14px", display: "block" }}>
            {isEmployee
              ? `Personalized Compensation Slips & Financial Statements for ${user?.name || "Employee"}`
              : "Role-Based Report Governance & Employee Referral"}
          </strong>
          <span style={{ color: "#475569", fontSize: "13px", lineHeight: "1.4" }}>
            {isEmployee
              ? "The reports displayed below were generated directly by the Finance Team and linked to your employee profile. Click 'Preview' or 'Generate & Export' for verified documentation."
              : "Finance and Admin teams can develop tailored financial reports for individual employees or company-wide. When published, each report is automatically routed to the target employee's personal dashboard."}
          </span>
        </div>
      </div>

      <div
        className="dashboard-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px",
        }}
      >
        {visibleReports.length === 0 ? (
          <div
            className="dashboard-card full-width"
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "48px 24px",
              color: "#64748B",
              background: "#FFFFFF",
              borderRadius: "12px",
              border: "1px solid #DDD2E2",
            }}
          >
            <FileSpreadsheet size={44} color="#A51D8D" style={{ margin: "0 auto 12px", opacity: 0.7 }} />
            <h3 style={{ fontSize: "17px", fontWeight: "700", color: "#18243A", margin: "0 0 6px" }}>
              No Reports Published Yet
            </h3>
            <p style={{ fontSize: "13.5px", margin: "0 0 16px", color: "#64748B", maxWidth: "520px", marginLeft: "auto", marginRight: "auto" }}>
              {isFinance || userRole === "ADMIN"
                ? "Click 'Create & Send Finance Report' above to issue a formal salary statement or financial report for any employee."
                : "No personal compensation slips or organizational statements have been issued to your profile yet."}
            </p>
          </div>
        ) : (
          visibleReports.map((report) => {
            const Icon = report.icon || Receipt;
          const isPersonalToMe =
            isEmployee &&
            report.targetEmployeeEmail &&
            report.targetEmployeeEmail.trim().toLowerCase() === userEmail;

          return (
            <div
              key={report.id}
              className="dashboard-card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderTop: `4px solid ${report.color || "#A51D8D"}`,
                position: "relative",
                height: "100%",
                background: "#FFFFFF",
                borderColor: isPersonalToMe ? "#A51D8D" : "#DDD2E2",
                boxShadow: isPersonalToMe ? "0 8px 24px rgba(165, 29, 141, 0.12)" : "var(--shadow-small)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                {isPersonalToMe && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      background: "linear-gradient(135deg, #A51D8D 0%, #7B2A9B 100%)",
                      color: "#FFFFFF",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "800",
                      marginBottom: "12px",
                      alignSelf: "flex-start",
                    }}
                  >
                    <Sparkles size={13} />
                    Referred to You by Finance Team
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius: "10px",
                      backgroundColor: `${report.color}15`,
                      color: report.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <div>
                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 800 }}>
                      {report.category}
                    </span>
                    <h3 style={{ margin: "2px 0 0", fontSize: "16px", color: "#18243A", fontWeight: "800" }}>
                      {report.title}
                    </h3>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: "#F8F2FA",
                    border: "1px solid #DDD2E2",
                    borderRadius: "8px",
                    padding: "10px 12px",
                    marginBottom: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "5px",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Generated By:</span>
                    <strong style={{ color: "#A51D8D" }}>{report.generatedBy || "Finance Team"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Referred To:</span>
                    <strong style={{ color: "#18243A" }}>{report.targetEmployeeName || "All Staff"}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Purpose:</span>
                    <span style={{ color: "#475569", fontWeight: "600", textAlign: "right", maxWidth: "65%" }}>
                      {report.purpose || "Verification & Audit"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    fontSize: "11.5px",
                    color: "#64748b",
                    marginTop: "auto",
                    marginBottom: "16px",
                  }}
                >
                  <span><strong>Format:</strong> {report.format}</span>
                  <span><strong>Issued:</strong> {report.date || "2026-08-21"}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
                <button
                  className="secondary-button"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    fontSize: "13px",
                    borderColor: "#DDD2E2",
                    color: "#18243A",
                  }}
                  onClick={() => handleOpenPreview(report)}
                >
                  <Eye size={14} />
                  Preview
                </button>

                <button
                  className="primary-button"
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    fontSize: "13px",
                    background: "linear-gradient(135deg, #A51D8D 0%, #7B2A9B 100%)",
                  }}
                  onClick={() => handleDownload(report)}
                >
                  <Download size={14} />
                  Export PDF
                </button>
              </div>
            </div>
          );
        }))}
      </div>

      {createModalOpen && (
        <div className="modal-overlay">
          <div className="employee-modal" style={{ maxWidth: "620px", width: "100%", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div className="modal-header" style={{ padding: "20px 24px", borderBottom: "1px solid #F1F5F9" }}>
              <div>
                <p className="section-label" style={{ fontSize: "11px", fontWeight: "700", color: "#9E2682", letterSpacing: "0.6px", textTransform: "uppercase", margin: 0 }}>
                  FINANCE DEPARTMENT ACTION
                </p>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", margin: "4px 0 0" }}>
                  Create & Send Finance Report
                </h2>
              </div>
              <button className="modal-close" onClick={() => setCreateModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePublishFinanceReport} style={{ display: "flex", flexDirection: "column", flex: 1, margin: 0 }}>
              <div className="modal-body" style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: "18px", maxHeight: "75vh", overflowY: "auto" }}>
                {/* TARGET EMPLOYEE */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    Select Target Employee to Receive Report: *
                  </label>
                  <select
                    value={financeForm.targetEmail}
                    onChange={handleTargetEmployeeChange}
                    required
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 36px 0 14px",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#0F172A",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {availableTargetEmployees.length === 0 ? (
                      <option value="" disabled>No eligible recipient employees found</option>
                    ) : (
                      availableTargetEmployees.map((emp) => (
                        <option key={emp.id} value={emp.email} style={{ padding: "8px", background: "#FFFFFF", color: "#0F172A" }}>
                          {emp.first_name} {emp.last_name || ""} ({emp.employee_code || `DCS-EMP-${emp.id}`}) — {emp.email}
                        </option>
                      ))
                    )}
                    <option value="ALL" style={{ padding: "8px", background: "#FFFFFF", color: "#0F172A" }}>All Company Employees (General Broadcast)</option>
                  </select>
                  {availableTargetEmployees.length === 0 && (
                    <span style={{ fontSize: "12px", color: "#E11D48", marginTop: "4px", display: "block" }}>
                      Self-recipient reporting is disabled. Other staff members must be onboarded to receive reports.
                    </span>
                  )}
                </div>

                {/* REPORT TITLE & FISCAL PERIOD */}
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Report Title: *
                    </label>
                    <input
                      type="text"
                      value={financeForm.reportTitle}
                      onChange={(e) => setFinanceForm({ ...financeForm, reportTitle: e.target.value })}
                      required
                      placeholder="e.g. Monthly Salary Statement"
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 14px",
                        border: "1.5px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "13.5px",
                        color: "#0F172A",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                      Fiscal Period: *
                    </label>
                    <input
                      type="text"
                      value={financeForm.fiscalPeriod}
                      onChange={(e) => setFinanceForm({ ...financeForm, fiscalPeriod: e.target.value })}
                      required
                      placeholder="e.g. August 2026"
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 14px",
                        border: "1.5px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "13.5px",
                        color: "#0F172A",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* SALARY EARNINGS / DEDUCTIONS 3 COLUMNS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                      Gross Base ({currencySymbol}):
                    </label>
                    <input
                      type="number"
                      value={financeForm.grossSalary}
                      onChange={(e) => setFinanceForm({ ...financeForm, grossSalary: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 12px",
                        border: "1.5px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0F172A",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                      Allowances ({currencySymbol}):
                    </label>
                    <input
                      type="number"
                      value={financeForm.allowances}
                      onChange={(e) => setFinanceForm({ ...financeForm, allowances: e.target.value })}
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 12px",
                        border: "1.5px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0F172A",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                      Deductions ({currencySymbol}):
                    </label>
                    <input
                      type="number"
                      value={financeForm.deductions}
                      onChange={(e) => setFinanceForm({ ...financeForm, deductions: e.target.value })}
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 12px",
                        border: "1.5px solid #CBD5E1",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#0F172A",
                        backgroundColor: "#FFFFFF",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                {/* NET PAYOUT CALCULATION */}
                <div
                  style={{
                    backgroundColor: "#FDF2F8",
                    border: "1.5px solid #FBCFE8",
                    borderRadius: "10px",
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F172A", display: "block" }}>
                      Calculated Net Take-Home Payout:
                    </span>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                      Gross + Allowances − Deductions
                    </span>
                  </div>
                  <strong style={{ fontSize: "20px", color: "#9E2682", fontWeight: "800" }}>
                    {currencySymbol}
                    {(
                      (Number(financeForm.grossSalary) || 0) +
                      (Number(financeForm.allowances) || 0) -
                      (Number(financeForm.deductions) || 0)
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                {/* REMARKS */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                    Finance Remarks & Notes for Employee:
                  </label>
                  <textarea
                    rows={2}
                    value={financeForm.specialNotes}
                    onChange={(e) => setFinanceForm({ ...financeForm, specialNotes: e.target.value })}
                    placeholder="Enter notes or statutory remarks..."
                    style={{
                      width: "100%",
                      minHeight: "65px",
                      padding: "10px 14px",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      color: "#0F172A",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <div className="modal-actions" style={{ padding: "16px 24px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#F8FAFC" }}>
                <button type="button" className="secondary-button" onClick={() => setCreateModalOpen(false)} style={{ padding: "10px 20px", borderRadius: "8px" }}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!financeForm.targetEmail && availableTargetEmployees.length === 0}
                  style={{
                    background: "linear-gradient(135deg, #9E2682 0%, #D946EF 100%)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 22px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(158, 38, 130, 0.25)",
                  }}
                >
                  <Send size={15} />
                  Publish & Send to Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewModalOpen && selectedReport && (
        <div className="modal-overlay">
          <div className="employee-modal" style={{ maxWidth: "660px", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
            <div className="modal-header">
              <div>
                <p className="section-label">REPORT PREVIEW & VERIFICATION</p>
                <h2>{selectedReport.title}</h2>
              </div>

              <button className="modal-close" onClick={() => setPreviewModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: "auto", flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#F8F2FA",
                  border: "1px solid #DDD2E2",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                  fontSize: "12.5px",
                }}
              >
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Issued By:</span>
                  <strong style={{ color: "#A51D8D" }}>{selectedReport.generatedBy || "Finance Team"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Referred Recipient:</span>
                  <strong style={{ color: "#18243A" }}>{selectedReport.targetEmployeeName || "All Staff"}</strong>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ color: "#64748b", display: "block" }}>Business Usage & Scope:</span>
                  <span style={{ color: "#18243A", fontWeight: "600" }}>{selectedReport.usage || selectedReport.purpose}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {selectedReport.data.summary.map((stat, i) => (
                  <div key={i} style={{ padding: "12px 14px", backgroundColor: "#F8F2FA", borderRadius: "8px", border: "1px solid #DDD2E2" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>{stat.label}</span>
                    <div style={{ fontSize: "16px", fontWeight: "800", color: "#A51D8D", marginTop: "2px" }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="table-wrapper" style={{ border: "1px solid #DDD2E2", borderRadius: "8px" }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Particulars / Item</th>
                      <th>Category</th>
                      <th>Details</th>
                      <th style={{ textAlign: "right" }}>Amount / Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReport.data.details.map((row, i) => (
                      <tr key={i}>
                        <td><strong>{row.item}</strong></td>
                        <td><span className="status-badge success" style={{ fontSize: "11px", padding: "2px 8px" }}>{row.dept}</span></td>
                        <td>{row.metric}</td>
                        <td style={{ textAlign: "right", fontWeight: "bold", color: "#A51D8D" }}>{row.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-actions" style={{ padding: "16px 24px", borderTop: "1px solid #DDD2E2", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} color="#2E9B67" />
                Verified by {settings.companyName || "DCS Corporate"}
              </span>

              <div style={{ display: "flex", gap: "10px" }}>
                <button className="secondary-button" onClick={() => setPreviewModalOpen(false)}>
                  Close
                </button>
                <button
                  className="primary-button"
                  style={{ background: "linear-gradient(135deg, #A51D8D 0%, #7B2A9B 100%)" }}
                  onClick={() => handleDownload(selectedReport)}
                >
                  <Printer size={15} />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
