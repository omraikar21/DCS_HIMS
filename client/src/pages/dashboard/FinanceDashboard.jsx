import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  WalletCards,
  Users,
  TrendingUp,
  Building2,
  ShieldCheck,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Send,
  Download,
  Check,
  Upload,
  ExternalLink,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import ProfileHeader from "../../components/dashboard/ProfileHeader";
import CompanyAnnouncementsCard from "../../components/dashboard/CompanyAnnouncementsCard";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getPayroll } from "../../services/payrollService";
import { saveCustomReport, getCustomReports } from "../../services/reportService";
import { recordAuditEvent } from "../../services/auditService";
import { sendFinanceNotification } from "../../services/notificationService";
import { getLoadedSettings } from "../../services/settingsService";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DEPT_COLORS = ["#8B5CF6", "#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#06B6D4", "#64748B"];

function FinanceDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  const settings = getLoadedSettings();
  const currencySymbol = settings.currencySymbol || "₹";

  const [payrollList, setPayrollList] = useState([]);
  const [companyReports, setCompanyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [activeRoleTab, setActiveRoleTab] = useState("ALL");
  const [sentSlips, setSentSlips] = useState({});

  const [showCompanyExcelModal, setShowCompanyExcelModal] = useState(false);
  const [excelPeriod, setExcelPeriod] = useState("August 2026");
  const [excelTitle, setExcelTitle] = useState("Company Master Payroll & Compensation Statement");
  const [excelNotes, setExcelNotes] = useState("Official monthly company payroll spreadsheet. Verified base, allowances, PF & tax deductions.");
  const [uploadedExcelFile, setUploadedExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);

  const userName = user?.name?.split(" ")[0] || "Finance Officer";

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError("");

      const [payrollRes, repRes] = await Promise.allSettled([
        getPayroll(),
        getCustomReports(),
      ]);

      if (payrollRes.status === "fulfilled" && Array.isArray(payrollRes.value)) {
        setPayrollList(payrollRes.value);
      } else if (payrollRes.status === "rejected") {
        setError("Could not load payroll records. Please check your access permissions.");
      }
      if (repRes.status === "fulfilled" && Array.isArray(repRes.value)) {
        setCompanyReports(repRes.value);
      }
    } catch (err) {
      setError(err.message || "Failed to load finance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Current Month Payroll from Real DB ────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const currentMonthPayroll = useMemo(() => {
    const filtered = payrollList.filter(
      (p) => Number(p.payroll_month) === currentMonth && Number(p.payroll_year) === currentYear
    );
    // If no current month payroll, show latest available
    return filtered.length > 0 ? filtered : payrollList.slice(0, 20);
  }, [payrollList, currentMonth, currentYear]);

  const currentMonthName = MONTH_NAMES[currentMonth - 1];

  // ── Aggregate Financial Totals (real DB numbers) ───────────────────────────
  const totalBasic = useMemo(() =>
    currentMonthPayroll.reduce((s, p) => s + Number(p.basic_salary || 0), 0),
    [currentMonthPayroll]
  );

  const totalAllowances = useMemo(() =>
    currentMonthPayroll.reduce((s, p) => s + Number(p.allowances || 0), 0),
    [currentMonthPayroll]
  );

  const totalDeductions = useMemo(() =>
    currentMonthPayroll.reduce((s, p) => s + Number(p.deductions || 0), 0),
    [currentMonthPayroll]
  );

  const totalNetPayroll = useMemo(() =>
    currentMonthPayroll.reduce((s, p) => s + Number(p.net_salary || 0), 0),
    [currentMonthPayroll]
  );

  const totalStaff = currentMonthPayroll.length;

  // ── Map payroll records to display rows with tier classification ─────────
  const staffPayrollList = useMemo(() => {
    return currentMonthPayroll.map((p) => {
      const code = (p.employee_code || "").toUpperCase();
      const desig = (p.designation || "").toLowerCase();
      const dept = (p.department_name || "").toLowerCase();

      let tier = "EMPLOYEE", tierLabel = "Employee", tierBg = "#EFF6FF", tierColor = "#1D4ED8";
      if (code.includes("-TL") || desig.includes("team lead") || desig.includes("lead")) {
        tier = "TEAM_LEAD"; tierLabel = "Team Lead (TL)"; tierBg = "#F5F3FF"; tierColor = "#6D28D9";
      } else if (code.includes("-HR") || desig.includes("hr") || dept.includes("human resources")) {
        tier = "HR"; tierLabel = "HR Management"; tierBg = "#FDF2F8"; tierColor = "#BE185D";
      } else if (code.includes("-ADM") || desig.includes("admin") || dept.includes("admin")) {
        tier = "ADMIN"; tierLabel = "Admin"; tierBg = "#ECFDF5"; tierColor = "#047857";
      } else if (code.includes("-FIN") || desig.includes("finance") || dept.includes("finance")) {
        tier = "FINANCE"; tierLabel = "Finance"; tierBg = "#FFF7ED"; tierColor = "#C2410C";
      }

      const basic = Number(p.basic_salary || 0);
      const allow = Number(p.allowances || 0);
      const ded = Number(p.deductions || 0);
      const net = Number(p.net_salary || (basic + allow - ded));
      const gross = Number(p.gross_salary || (basic + allow));

      return {
        ...p,
        tier, tierLabel, tierBg, tierColor,
        calculatedBasic: basic,
        calculatedAllow: allow,
        calculatedDed: ded,
        calculatedNet: net,
        calculatedGross: gross,
        fullName: `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email || "Staff Member",
        monthDisplay: `${MONTH_NAMES[(Number(p.payroll_month) - 1)] || "Aug"} ${p.payroll_year || currentYear}`,
      };
    });
  }, [currentMonthPayroll, currentYear]);

  const filteredStaffList = useMemo(() => {
    if (activeRoleTab === "ALL") return staffPayrollList;
    return staffPayrollList.filter((p) => p.tier === activeRoleTab);
  }, [staffPayrollList, activeRoleTab]);

  // ── Build Monthly Trend Data from payrollList grouped by year-month ──────
  const monthlyBarData = useMemo(() => {
    const monthMap = {};
    payrollList.forEach((p) => {
      const key = `${p.payroll_year}-${String(p.payroll_month).padStart(2, "0")}`;
      const label = `${(MONTH_NAMES[Number(p.payroll_month) - 1] || "").slice(0, 3)} ${p.payroll_year}`;
      if (!monthMap[key]) monthMap[key] = { month: label, NetPayroll: 0, key };
      monthMap[key].NetPayroll += Number(p.net_salary || 0);
    });
    return Object.values(monthMap)
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6);
  }, [payrollList]);

  // ── Department-wise Payroll Pie from real DB ─────────────────────────────
  const deptPieData = useMemo(() => {
    const map = {};
    currentMonthPayroll.forEach((p) => {
      const dept = p.department_name || "General";
      if (!map[dept]) map[dept] = 0;
      map[dept] += Number(p.net_salary || 0);
    });
    return Object.entries(map)
      .filter(([, v]) => v > 0)
      .map(([dept, value], i) => ({
        name: dept,
        value,
        color: DEPT_COLORS[i % DEPT_COLORS.length],
      }));
  }, [currentMonthPayroll]);

  // ── Send payslip notification to individual staff ─────────────────────────
  const handleSendIndividualPayslip = async (p) => {
    const targetEmail = (p.email || "").toLowerCase().trim();
    if (!targetEmail) {
      notification?.error?.("No email address for this employee.");
      return;
    }
    try {
      await sendFinanceNotification({
        title: `Salary Payslip Disbursed — ${p.monthDisplay}`,
        message: `Your salary slip for ${p.monthDisplay} has been disbursed by Finance. Net: ${currencySymbol}${p.calculatedNet.toLocaleString("en-IN")}.`,
        targetEmail,
        targetName: p.fullName,
        amount: p.calculatedNet,
        month: p.monthDisplay,
        type: "PAYROLL",
      });
      setSentSlips((prev) => ({ ...prev, [p.id || targetEmail]: true }));
      notification?.success?.(`Payslip notification sent to ${p.fullName}!`);
    } catch {
      notification?.error?.(`Could not send notification to ${p.fullName}.`);
    }
  };

  // ── Download Excel for device ─────────────────────────────────────────────
  const handleDownloadExcel = () => {
    let csv = "\uFEFF";
    csv += `"${settings.companyName || "DCS CORPORATE"} — MONTHLY PAYROLL MASTER"\n`;
    csv += `"Period:","${currentMonthName} ${currentYear}"\n`;
    csv += `"Total Staff:","${totalStaff}"\n`;
    csv += `"Total Net:","${currencySymbol}${totalNetPayroll.toLocaleString("en-IN")}"\n\n`;
    csv += `"Employee Code","Full Name","Email","Department","Role Tier","Designation","Basic Salary","Allowances","Deductions","Gross Salary","Net Pay","Bank Name","Bank Account","Payment Status"\n`;
    staffPayrollList.forEach((p) => {
      csv += `"${p.employee_code || ""}","${p.fullName}","${p.email || ""}","${p.department_name || "General"}","${p.tierLabel}","${p.designation || "Staff"}","${p.calculatedBasic}","${p.calculatedAllow}","${p.calculatedDed}","${p.calculatedGross}","${p.calculatedNet}","${p.bank_name || "HDFC Bank"}","${p.bank_account || "N/A"}","${p.payment_status || "PAID"}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Payroll_Master_${currentMonthName}_${currentYear}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    notification?.success?.("Payroll master Excel downloaded!");
  };

  // ── Dispatch Excel Report Directly to Admin ────────────────────────────────
  const handleSendExcelToAdmin = async (e) => {
    e.preventDefault();
    setUploadingExcel(true);
    try {
      const gross = totalBasic + totalAllowances;
      const net = totalNetPayroll;
      const fileName = uploadedExcelFile
        ? uploadedExcelFile.name
        : `Company_Payroll_Master_${excelPeriod.replace(/\s+/g, "_")}.xlsx`;

      await saveCustomReport({
        reportTitle: `${excelPeriod} — ${excelTitle}`,
        reportType: "COMPANY_PAYROLL_EXCEL",
        period: excelPeriod,
        parameters: {
          targetRole: "ADMIN",
          audience: "ADMIN_ONLY",
          targetName: "System Administrator",
          fileName,
          isExcel: true,
          grossSalary: gross,
          allowances: totalAllowances,
          deductions: totalDeductions,
          netSalary: net,
          workforceCount: totalStaff,
        },
        data: {
          format: "EXCEL_SPREADSHEET",
          fileName,
          summary: [
            { label: "Gross Corporate Total", value: `${currencySymbol}${gross.toLocaleString("en-IN")}` },
            { label: "Total Allowances & Perks", value: `${currencySymbol}${totalAllowances.toLocaleString("en-IN")}` },
            { label: "Statutory PF/Tax Deductions", value: `${currencySymbol}${totalDeductions.toLocaleString("en-IN")}` },
            { label: "Total Net Disbursed", value: `${currencySymbol}${net.toLocaleString("en-IN")}` },
          ],
          details: staffPayrollList.map((p) => ({
            item: p.fullName,
            dept: p.department_name || "General",
            metric: p.tierLabel,
            score: `${currencySymbol}${p.calculatedNet.toLocaleString("en-IN")}`,
          })),
        },
      });

      recordAuditEvent({
        eventAction: "Company Payroll Excel Sent to Admin",
        category: "FINANCE",
        actorName: user?.name || "Finance Officer",
        actorEmail: user?.email || "",
        role: "FINANCE",
        details: `Dispatched ${fileName} for ${excelPeriod} to Admin — ${currencySymbol}${net.toLocaleString("en-IN")}`,
        status: "SUCCESS",
      }).catch(() => {});

      sendFinanceNotification({
        title: `Company Payroll Excel — ${excelPeriod}`,
        message: `Finance has submitted the master payroll spreadsheet for ${excelPeriod}. Total Disbursed: ${currencySymbol}${net.toLocaleString("en-IN")}.`,
        targetEmail: "admin@dcs.com",
        targetName: "System Administrator",
        amount: net,
        month: excelPeriod,
        type: "FINANCE_EXCEL",
      }).catch(() => {});

      notification?.success?.("Company Payroll Excel sent directly to Admin!");
      setShowCompanyExcelModal(false);
      setUploadedExcelFile(null);
      loadData(true);
    } catch (err) {
      notification?.error?.(err.message || "Failed to dispatch Excel report.");
    } finally {
      setUploadingExcel(false);
    }
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const fmtLakh = (n) => {
    const num = Number(n) || 0;
    if (num >= 100000) return `${currencySymbol}${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `${currencySymbol}${(num / 1000).toFixed(1)}K`;
    return `${currencySymbol}${num.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="admin-dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E2E8F0", borderTopColor: "#A1238E", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748B", fontSize: "14px" }}>Loading Finance Dashboard...</p>
        </div>
      </div>
    );
  }

  // ── ROLE TIER COUNTS ───────────────────────────────────────────────────────
  const tlCount = staffPayrollList.filter((p) => p.tier === "TEAM_LEAD").length;
  const hrCount = staffPayrollList.filter((p) => p.tier === "HR").length;
  const empCount = staffPayrollList.filter((p) => p.tier === "EMPLOYEE").length;

  return (
    <div className="admin-dashboard">

      {/* ── PROFILE HEADER ─────────────────────────────────────────────── */}
      <ProfileHeader />

      {/* ── CLEAN HEADING ────────────────────────────────────────────────── */}
      <div className="dashboard-heading" style={{ marginBottom: "20px", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
        <div>
          <p className="section-label">FINANCE OPERATIONS &amp; CORPORATE PAYROLL</p>
          <h1 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0", flexWrap: "wrap" }}>
            Hi, {userName} 👋
            <span style={{ fontSize: "12px", padding: "3px 10px", background: "#FDF2F8", color: "#DB2777", borderRadius: "12px", border: "1px solid #FBCFE8", fontWeight: "700" }}>
              Finance Officer
            </span>
          </h1>
          <p className="dashboard-description" style={{ margin: 0 }}>
            {todayDate} &nbsp;·&nbsp; {totalStaff} active personnel · {currentMonthName} {currentYear} payroll cycle
          </p>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={handleDownloadExcel}
            className="secondary-button"
            style={{ borderColor: "#10B981", color: "#065F46", background: "#ECFDF5" }}
          >
            <Download size={14} />
            Export Excel
          </button>
          <button
            onClick={() => { setUploadedExcelFile(null); setShowCompanyExcelModal(true); }}
            className="primary-button"
            style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}
          >
            <FileSpreadsheet size={14} />
            Send to Admin
          </button>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: "flex", alignItems: "center", padding: "9px 12px", borderRadius: "8px",
              background: "#FFFFFF", border: "1.5px solid #E2E8F0", cursor: "pointer", color: "#475569",
            }}
          >
            <RefreshCw size={15} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", background: "#FEF2F2", color: "#B91C1C", borderRadius: "10px", marginBottom: "16px", fontSize: "13.5px", display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── 4 REAL-DB STAT CARDS ────────────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard
          title="Total Net Payroll"
          value={fmtLakh(totalNetPayroll)}
          note={`${totalStaff} active staff — ${currentMonthName} ${currentYear}`}
          icon={WalletCards}
          type="purple"
        />
        <StatCard
          title="Gross Base Salaries"
          value={fmtLakh(totalBasic)}
          note="Total basic component"
          icon={Building2}
          type="blue"
        />
        <StatCard
          title="Total Allowances"
          value={fmtLakh(totalAllowances)}
          note="HRA, travel &amp; special"
          icon={TrendingUp}
          type="green"
        />
        <StatCard
          title="Total Deductions"
          value={fmtLakh(totalDeductions)}
          note="PF, TDS &amp; statutory"
          icon={ShieldCheck}
          type="orange"
        />
      </div>


      {/* ── 2 DB-POWERED CHARTS: TREND BAR + DEPT PIE ──────────────────── */}
      <div className="dashboard-grid">

        <ChartCard
          title="Monthly Payroll Expenditure Trend"
          onAction={() => navigate("/payroll")}
        >
          {monthlyBarData.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "240px", color: "#94A3B8", fontSize: "13px" }}>
              No historical payroll data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyBarData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(v) => [`${currencySymbol}${Number(v).toLocaleString("en-IN")}`, "Net Disbursal"]}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="NetPayroll" name="Net Disbursal" fill="#A1238E" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Payroll Share by Department"
          onAction={() => navigate("/departments")}
        >
          {deptPieData.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "240px", color: "#94A3B8", fontSize: "13px" }}>
              No department data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={deptPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {deptPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.1)", fontSize: "12px" }}
                  formatter={(v, name) => [`${currencySymbol}${Number(v).toLocaleString("en-IN")}`, name]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} formatter={(v) => <span style={{ color: "#334155", fontWeight: "600" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>


      {/* ── PAYROLL DISBURSAL DESK: SEND TO TL, HR, EMP ─────────────────── */}
      <section className="dashboard-card" style={{ marginBottom: "20px" }}>
        <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={17} color="#A1238E" />
              Staff Payroll Disbursal — {currentMonthName} {currentYear}
            </h3>
            <p>Issue salary slips and notify Team Leads (TL), HR, and Employees from live payroll records</p>
          </div>

          {/* ROLE FILTER TABS */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {[
              { id: "ALL",       label: `All (${staffPayrollList.length})` },
              { id: "TEAM_LEAD", label: `TL (${tlCount})` },
              { id: "HR",        label: `HR (${hrCount})` },
              { id: "EMPLOYEE",  label: `Emp (${empCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveRoleTab(tab.id)}
                style={{
                  border: "none",
                  background: activeRoleTab === tab.id ? "#A1238E" : "#F1F5F9",
                  color: activeRoleTab === tab.id ? "#FFFFFF" : "#475569",
                  fontWeight: "700", fontSize: "12px", padding: "6px 12px",
                  borderRadius: "8px", cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredStaffList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 20px", background: "#F8FAFC", borderRadius: "10px", border: "1.5px dashed #CBD5E1" }}>
            <Users size={32} style={{ color: "#CBD5E1", margin: "0 auto 8px" }} />
            <p style={{ color: "#64748B", fontSize: "13.5px", margin: 0 }}>
              No payroll records found for {currentMonthName} {currentYear}. Generate payslips first from Company Payslips.
            </p>
          </div>
        ) : (
          <div className="table-responsive" style={{ border: "1px solid #E2E8F0", borderRadius: "10px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1.5px solid #E2E8F0" }}>
                  {["Employee", "Role Tier", "Department", "Basic", "Allowances", "Deductions", "Net Salary", "Bank", "Status", "Action"].map((h) => (
                    <th key={h} style={{ padding: "11px 14px", color: "#475569", fontWeight: "700", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStaffList.map((p, idx) => {
                  const isSent = sentSlips[p.id || p.email];
                  return (
                    <tr key={p.id || idx} style={{ borderBottom: idx < filteredStaffList.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                      <td style={{ padding: "11px 14px" }}>
                        <div style={{ fontWeight: "700", color: "#0F172A", fontSize: "13px" }}>{p.fullName}</div>
                        <span style={{ fontSize: "10.5px", color: "#A1238E", fontWeight: "600" }}>{p.employee_code || `EMP-${p.id}`}</span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 8px", borderRadius: "8px", background: p.tierBg, color: p.tierColor, whiteSpace: "nowrap" }}>
                          {p.tierLabel}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", color: "#475569", fontSize: "12.5px" }}>
                        {p.department_name || "General"}
                      </td>
                      <td style={{ padding: "11px 14px", color: "#334155", fontSize: "12.5px" }}>
                        {currencySymbol}{p.calculatedBasic.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "11px 14px", color: "#059669", fontSize: "12.5px" }}>
                        +{currencySymbol}{p.calculatedAllow.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "11px 14px", color: "#DC2626", fontSize: "12.5px" }}>
                        -{currencySymbol}{p.calculatedDed.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "11px 14px", fontWeight: "800", color: "#0F172A", fontSize: "13px" }}>
                        {currencySymbol}{p.calculatedNet.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "11px 14px", color: "#64748B", fontSize: "11.5px" }}>
                        {p.bank_name || "HDFC"} ••{String(p.bank_account || "8291").slice(-4)}
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ padding: "3px 8px", borderRadius: "10px", background: "#ECFDF5", color: "#065F46", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                          <CheckCircle2 size={11} /> {p.payment_status || "PAID"}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px" }}>
                        <button
                          type="button"
                          onClick={() => handleSendIndividualPayslip(p)}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: "4px",
                            padding: "5px 10px", borderRadius: "7px",
                            border: `1.5px solid ${isSent ? "#10B981" : "#CBD5E1"}`,
                            background: isSent ? "#ECFDF5" : "#FFFFFF",
                            color: isSent ? "#065F46" : "#334155",
                            fontSize: "11.5px", fontWeight: "700", cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isSent ? <Check size={12} /> : <Send size={11} />}
                          {isSent ? "Sent" : "Notify"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {/* ── COMPANY EXCEL SHEETS SENT TO ADMIN ─────────────────────────── */}
      <section className="dashboard-card" style={{ marginBottom: "20px" }}>
        <div className="card-header" style={{ flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FileSpreadsheet size={17} color="#10B981" />
              Company Excel Sheets Dispatched to Admin
            </h3>
            <p>Master payroll spreadsheets sent by Finance — accessible only by the System Administrator</p>
          </div>
          <button
            onClick={() => { setUploadedExcelFile(null); setShowCompanyExcelModal(true); }}
            className="primary-button"
            style={{ padding: "7px 14px", fontSize: "12.5px", background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}
          >
            <PlusCircle size={13} />
            Create &amp; Send New
          </button>
        </div>

        {companyReports.length === 0 ? (
          <div style={{ textAlign: "center", padding: "36px 20px", background: "#F8FAFC", borderRadius: "12px", border: "1.5px dashed #CBD5E1" }}>
            <FileSpreadsheet size={34} style={{ color: "#CBD5E1", margin: "0 auto 8px" }} />
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#475569", margin: "0 0 4px" }}>No Sheets Dispatched Yet</p>
            <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>Use "Create &amp; Send New" to prepare and dispatch a master spreadsheet to the Administrator.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
            {companyReports.slice(0, 6).map((rep) => {
              const fileName = rep.parameters?.fileName || `${rep.report_title}.xlsx`;
              return (
                <div key={rep.id} style={{ padding: "16px 18px", borderRadius: "12px", background: "#FFFFFF", border: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#1E40AF", background: "#EFF6FF", padding: "2px 8px", borderRadius: "8px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <FileSpreadsheet size={11} color="#10B981" /> Excel (.xlsx)
                      </span>
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                        {rep.created_at ? new Date(rep.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                      </span>
                    </div>
                    <h4 style={{ margin: "0 0 3px", fontSize: "13.5px", fontWeight: "800", color: "#0F172A" }}>{rep.report_title}</h4>
                    <p style={{ margin: 0, fontSize: "11.5px", color: "#64748B" }}>
                      File: <strong>{fileName}</strong>
                    </p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: "10px" }}>
                    <span style={{ fontSize: "11.5px", color: "#059669", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={12} /> Dispatched to Admin
                    </span>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ padding: "5px 10px", fontSize: "11.5px", gap: "4px" }}
                      onClick={() => navigate(`/reports?reportId=REP-DB-${rep.id}`)}
                    >
                      View <ExternalLink size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* ── ANNOUNCEMENTS ────────────────────────────────────────────────── */}
      <CompanyAnnouncementsCard limit={3} />


      {/* ================================================================
          MODAL: SEND MASTER EXCEL TO ADMIN
      ================================================================ */}
      {showCompanyExcelModal && (
        <div className="modal-overlay">
          <div className="employee-modal" style={{ maxWidth: "520px", width: "95%" }}>
            <div className="modal-header">
              <div>
                <p className="section-label" style={{ marginBottom: "4px" }}>ADMIN MASTER EXCEL</p>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0F172A" }}>
                  Send Company Excel to Admin
                </h2>
              </div>
              <button className="modal-close" onClick={() => setShowCompanyExcelModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendExcelToAdmin}>
              <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ padding: "10px 13px", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#1E40AF" }}>
                  <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: "1px" }} />
                  <span>This master sheet will be sent <strong>directly and exclusively to the System Administrator</strong>. No other role can access it.</span>
                </div>

                <div className="form-field">
                  <label>Fiscal Period</label>
                  <input type="text" value={excelPeriod} onChange={(e) => setExcelPeriod(e.target.value)} placeholder="e.g. August 2026" required />
                </div>

                <div className="form-field">
                  <label>Report Title</label>
                  <input type="text" value={excelTitle} onChange={(e) => setExcelTitle(e.target.value)} placeholder="Company Master Payroll & Compensation Statement" required />
                </div>

                {/* PAYROLL SUMMARY PREVIEW */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#F8FAFC", padding: "12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#64748B", textTransform: "uppercase", fontWeight: "700" }}>Total Net Disbursal</span>
                    <p style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: "800", color: "#0F172A" }}>{currencySymbol}{totalNetPayroll.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "10.5px", color: "#64748B", textTransform: "uppercase", fontWeight: "700" }}>Total Headcount</span>
                    <p style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: "800", color: "#0F172A" }}>{totalStaff} Employees</p>
                  </div>
                </div>

                {/* FILE ATTACHMENT */}
                <div className="form-field">
                  <label>Attach Custom Excel (.xlsx / .csv) — Optional</label>
                  <div style={{
                    border: "2px dashed #CBD5E1",
                    borderRadius: "9px", padding: "14px", textAlign: "center",
                    background: uploadedExcelFile ? "#ECFDF5" : "#F8FAFC",
                    borderColor: uploadedExcelFile ? "#10B981" : "#CBD5E1",
                  }}>
                    <input type="file" id="excelFileInput" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
                      onChange={(e) => { if (e.target.files?.[0]) setUploadedExcelFile(e.target.files[0]); }}
                    />
                    <label htmlFor="excelFileInput" style={{ cursor: "pointer", display: "block" }}>
                      <Upload size={20} color={uploadedExcelFile ? "#10B981" : "#64748B"} style={{ margin: "0 auto 4px" }} />
                      <span style={{ fontSize: "12.5px", fontWeight: "700", color: uploadedExcelFile ? "#065F46" : "#334155", display: "block" }}>
                        {uploadedExcelFile ? `Attached: ${uploadedExcelFile.name}` : "Click to attach Excel file"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                        {uploadedExcelFile ? `${(uploadedExcelFile.size / 1024).toFixed(1)} KB` : "Leave empty to auto-compile from live DB"}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>Notes for Admin</label>
                  <textarea rows={2} value={excelNotes} onChange={(e) => setExcelNotes(e.target.value)}
                    placeholder="Audit remarks for the Administrator..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "13px", outline: "none", resize: "vertical" }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowCompanyExcelModal(false)}>Cancel</button>
                <button type="submit" disabled={uploadingExcel} className="primary-button"
                  style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)" }}
                >
                  <Send size={14} />
                  {uploadingExcel ? "Sending..." : "Send Directly to Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default FinanceDashboard;