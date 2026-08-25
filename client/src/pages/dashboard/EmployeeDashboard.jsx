import {
  useEffect,
  useState,
  useMemo,
} from "react";

import {
  CalendarCheck,
  ClipboardList,
  WalletCards,
  Clock3,
  BellRing,
  Megaphone,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  Star,
  CreditCard,
  Info,
  Calendar,
  AlertTriangle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import ProfileHeader from "../../components/dashboard/ProfileHeader";

import { getStoredUser } from "../../services/authService";
import { getPayslips } from "../../services/payslipService";
import { getLeaves } from "../../services/leaveService";
import { getAttendance } from "../../services/attendanceService";
import { getAnnouncements } from "../../services/announcementService";
import { getEmployees } from "../../services/employeeService";
import { useAuth } from "../../hooks/useAuth";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TOTAL_CASUAL_LEAVE_QUOTA = 18;

const leaveTypeToUI = {
  CASUAL: "Casual Leave",
  SICK: "Sick Leave",
  EARNED: "Earned Leave",
  MATERNITY: "Maternity Leave",
  PATERNITY: "Paternity Leave",
  UNPAID: "Unpaid Leave",
};

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const norm = (status || "PENDING").toUpperCase();
  const config = {
    APPROVED: { bg: "#ECFDF5", border: "#A7F3D0", color: "#065F46", icon: CheckCircle2, text: "Approved" },
    REJECTED: { bg: "#FEF2F2", border: "#FECACA", color: "#991B1B", icon: XCircle, text: "Rejected" },
    PENDING:  { bg: "#FFFBEB", border: "#FDE68A", color: "#92400E", icon: Clock, text: "Pending Review" },
    ON_HOLD:  { bg: "#EEF2FF", border: "#C7D2FE", color: "#3730A3", icon: AlertTriangle, text: "On Hold" },
  };
  const s = config[norm] || config.PENDING;
  const Icon = s.icon;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "700",
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
      whiteSpace: "nowrap",
    }}>
      <Icon size={13} />
      {s.text}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function EmployeeDashboard() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveTabFilter, setLeaveTabFilter] = useState("ALL");

  const userEmail = useMemo(() => (user?.email || authUser?.email || "").toLowerCase().trim(), [user, authUser]);
  const userName  = useMemo(() => user?.name ? user.name.split(" ")[0] : "Employee", [user]);

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      const storedUser = getStoredUser() || authUser;
      setUser(storedUser);

      const [payslipData, leaveData, attendanceData, announcementData, employeeData] = await Promise.allSettled([
        getPayslips(),
        getLeaves(),
        getAttendance(),
        getAnnouncements(),
        getEmployees(),
      ]);

      if (payslipData.status === "fulfilled" && Array.isArray(payslipData.value)) setPayslips(payslipData.value);
      if (leaveData.status === "fulfilled" && Array.isArray(leaveData.value)) setLeaves(leaveData.value);
      if (attendanceData.status === "fulfilled" && Array.isArray(attendanceData.value)) setAttendance(attendanceData.value);
      if (announcementData.status === "fulfilled" && Array.isArray(announcementData.value)) setAnnouncements(announcementData.value);
      if (employeeData.status === "fulfilled" && Array.isArray(employeeData.value)) setEmployees(employeeData.value);
    } catch (err) {
      console.error("Employee Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Match Employee Profile ──────────────────────────────────────────────────
  const matchedEmployee = useMemo(() => {
    const u = user || authUser;
    const email = (u?.email || "").toLowerCase().trim();
    const name = (u?.name || "").toLowerCase().trim();
    return employees.find(e =>
      (e.email && e.email.toLowerCase().trim() === email) ||
      (e.employee_code && u?.employee_code && e.employee_code.toLowerCase().trim() === u.employee_code.toLowerCase().trim()) ||
      (u?.id && (e.user_id === u.id || e.id === u.id)) ||
      (name && `${e.first_name || ""} ${e.last_name || ""}`.trim().toLowerCase() === name)
    ) || null;
  }, [employees, user, authUser]);

  const employeeCode = useMemo(() => {
    return matchedEmployee?.employee_code ||
      user?.employee_code ||
      authUser?.employee_code ||
      (user?.id ? `DCS-EMP-${String(user.id).padStart(3, "0")}` : "DCS-EMP-001");
  }, [matchedEmployee, user, authUser]);

  const userDept = useMemo(() => {
    return matchedEmployee?.department_name ||
      user?.department_name ||
      user?.department ||
      authUser?.department_name ||
      authUser?.department ||
      (user?.role === "TEAM_LEAD" ? "AIML" : "Development");
  }, [matchedEmployee, user, authUser]);

  // ── My Leaves ──────────────────────────────────────────────────────────────
  const myLeaves = useMemo(() => {
    const u = user || authUser;
    if (!u) return [];
    return leaves.filter((l) =>
      (l.employee_email && l.employee_email.toLowerCase().trim() === userEmail) ||
      (l.email          && l.email.toLowerCase().trim()          === userEmail) ||
      (l.employee_code  && employeeCode && l.employee_code.toLowerCase().trim() === employeeCode.toLowerCase().trim()) ||
      (l.user_id        && u.id            && l.user_id          === u.id) ||
      (l.employee_id    && u.id            && (l.employee_id     === u.id || l.employee_id === u.employee_id))
    ).sort((a, b) => new Date(b.start_date || b.created_at || 0) - new Date(a.start_date || a.created_at || 0));
  }, [leaves, userEmail, user, authUser, employeeCode]);

  // Dynamic casual leave deduction calculation
  const approvedCasualLeaveDays = useMemo(() => {
    return myLeaves
      .filter(l => (l.status || "").toUpperCase() === "APPROVED" && ((l.leave_type || "").toUpperCase().includes("CASUAL") || !(l.leave_type || "").toUpperCase().includes("UNPAID")))
      .reduce((sum, l) => {
        const fromDate = l.start_date ? String(l.start_date).slice(0, 10) : "";
        const toDate = l.end_date ? String(l.end_date).slice(0, 10) : "";
        const days = fromDate && toDate
          ? Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1)
          : (Number(l.days) || 1);
        return sum + Number(days);
      }, 0);
  }, [myLeaves]);

  const approvedLeaves = approvedCasualLeaveDays;
  const rejectedLeaves = myLeaves.filter(l => (l.status || "").toUpperCase() === "REJECTED").length;
  const pendingLeaves  = myLeaves.filter(l => ["PENDING", "ON_HOLD"].includes((l.status || "").toUpperCase())).length;
  const leaveBalance   = Math.max(0, TOTAL_CASUAL_LEAVE_QUOTA - approvedCasualLeaveDays);

  const filteredLeaves = useMemo(() => {
    if (leaveTabFilter === "ALL") return myLeaves;
    if (leaveTabFilter === "APPROVED") return myLeaves.filter(l => (l.status || "").toUpperCase() === "APPROVED");
    if (leaveTabFilter === "REJECTED") return myLeaves.filter(l => (l.status || "").toUpperCase() === "REJECTED");
    if (leaveTabFilter === "PENDING") return myLeaves.filter(l => ["PENDING", "ON_HOLD"].includes((l.status || "").toUpperCase()));
    return myLeaves;
  }, [myLeaves, leaveTabFilter]);

  // ── My Attendance ──────────────────────────────────────────────────────────
  const myAttendance = useMemo(() => {
    const u = user || authUser;
    if (!u) return [];
    return attendance.filter((a) =>
      (a.email          && a.email.toLowerCase().trim()          === userEmail) ||
      (a.employee_email && a.employee_email.toLowerCase().trim() === userEmail) ||
      (a.employee_code  && employeeCode && a.employee_code.toLowerCase().trim() === employeeCode.toLowerCase().trim()) ||
      (a.employee_id    && u.id            && (a.employee_id     === u.id || a.employee_id === u.employee_id))
    );
  }, [attendance, userEmail, user, authUser, employeeCode]);

  const presentCount = myAttendance.filter(a => (a.status || "").toUpperCase() === "PRESENT").length;

  // ── My Payslips (from Finance) ─────────────────────────────────────────────
  const myPayslips = useMemo(() => {
    const u = user || authUser;
    if (!payslips.length || !u) return [];
    return payslips.filter(p =>
      (p.email          && p.email.toLowerCase().trim()          === userEmail) ||
      (p.employee_email && p.employee_email.toLowerCase().trim() === userEmail) ||
      (p.employee_code  && employeeCode && p.employee_code.toLowerCase().trim() === employeeCode.toLowerCase().trim()) ||
      (p.employee_id    && u.id            && (p.employee_id     === u.id || p.employee_id === u.employee_id))
    );
  }, [payslips, userEmail, user, authUser, employeeCode]);

  const myLatestPayslip = myPayslips[0] || null;
  const payslipAmount = myLatestPayslip
    ? Number(myLatestPayslip.net_salary || myLatestPayslip.netSalary || myLatestPayslip.basic_salary || myLatestPayslip.basicSalary || 0)
    : 0;

  // ── Announcements (department + HR/Admin) ─────────────────────────────────
  const myAnnouncements = useMemo(() => {
    const cleanDept  = userDept.toLowerCase().trim();
    const cleanEmail = userEmail;

    return announcements.filter((a) => {
      const targetDept  = (a.metadata?.target_department || "").toLowerCase().trim();
      const targetRole  = (a.target_role || "ALL").toUpperCase();
      const audienceType = a.metadata?.audience_type || "TEAM";
      const targetUserEmail = (a.metadata?.target_user_email || a.target_email || "").toLowerCase().trim();

      // Individual notices
      if (audienceType === "INDIVIDUAL" && targetUserEmail && targetUserEmail !== "all") {
        return targetUserEmail === cleanEmail;
      }
      // Dept-scoped or universal
      if (targetRole === "ALL" && !targetDept) return true;
      if (cleanDept && targetDept && targetDept === cleanDept) return true;
      if (cleanDept && targetRole && targetRole === cleanDept.toUpperCase()) return true;
      if (targetRole === "ALL") return true;
      return false;
    }).slice(0, 5);
  }, [announcements, userDept, userEmail]);

  // ── Attendance chart data ──────────────────────────────────────────────────
  const attendanceChartData = useMemo(() => {
    return WEEKDAYS.map((day, idx) => {
      const record = myAttendance[idx] || null;
      const present = record ? (record.status === "PRESENT" ? 1 : 0) : (idx < 3 ? 1 : 0);
      return {
        day,
        Present: present,
        Absent:  record ? (record.status === "ABSENT" ? 1 : 0) : (idx >= 3 ? 1 : 0),
        Leave:   record ? (record.status === "LEAVE" ? 1 : 0) : 0,
      };
    });
  }, [myAttendance]);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  if (loading) {
    return (
      <div className="admin-dashboard" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #E2E8F0", borderTopColor: "#DB2777", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748B", fontSize: "14px" }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">

      {/* ── PROFILE HEADER ─────────────────────────────────────────────── */}
      <ProfileHeader />

      {/* ── WELCOME HEADING ────────────────────────────────────────────── */}
      <div className="dashboard-heading">
        <div>
          <p className="section-label">MY DASHBOARD</p>
          <h1>Hi, {userName} 👋</h1>
          <p className="dashboard-description">
            {todayDate} &nbsp;·&nbsp; {userDept} &nbsp;({employeeCode})
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "8px",
            background: refreshing ? "#F1F5F9" : "#F8FAFC",
            border: "1.5px solid #E2E8F0", cursor: "pointer",
            fontSize: "13px", fontWeight: "700", color: "#475569",
          }}
        >
          <RefreshCw size={15} style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
      <div className="stats-grid">
        <StatCard
          title="Days Present"
          value={String(presentCount).padStart(2, "0")}
          note={`${myAttendance.length} records recorded`}
          icon={CalendarCheck}
          type="green"
        />
        <StatCard
          title="Leave Balance"
          value={String(leaveBalance).padStart(2, "0")}
          note={`${approvedLeaves} Used · ${TOTAL_CASUAL_LEAVE_QUOTA} Allocated`}
          icon={ClipboardList}
          type="orange"
        />
        <StatCard
          title="Latest Payslip"
          value={payslipAmount > 0 ? `₹${payslipAmount >= 1000 ? `${(payslipAmount / 1000).toFixed(0)}K` : payslipAmount}` : "₹0"}
          note={myLatestPayslip ? (myLatestPayslip.month || (myLatestPayslip.payroll_month ? `Month ${myLatestPayslip.payroll_month}` : "Generated")) : "Not yet generated"}
          icon={WalletCards}
          type="blue"
        />
        <StatCard
          title="Notifications"
          value={String(myAnnouncements.length).padStart(2, "0")}
          note="Active notices for you"
          icon={BellRing}
        />
      </div>


      {/* ── ROW 1: Attendance Graph + Today Status ──────────────────────── */}
      <div className="dashboard-grid">

        <ChartCard title="My Attendance This Week">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceChartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} domain={[0, 1]} tickCount={2} />
              <Tooltip
                contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 8px 20px rgba(0,0,0,0.12)", fontSize: "12px" }}
                formatter={(v, name) => [v ? "Yes" : "No", name]}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Present" fill="#10B981" radius={[5, 5, 0, 0]} />
              <Bar dataKey="Absent"  fill="#F43F5E" radius={[5, 5, 0, 0]} />
              <Bar dataKey="Leave"   fill="#F59E0B" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* TODAY STATUS */}
        <section className="dashboard-card">
          <div className="card-header">
            <div>
              <h3>Today's Status</h3>
              <p>{todayDate}</p>
            </div>
          </div>

          <div className="attendance-status-card">
            <div className="attendance-icon">
              <Clock3 size={26} />
            </div>
            <div>
              <strong>Present</strong>
              <span>Check-in: 09:12 AM</span>
            </div>
          </div>

          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "Department", value: userDept, icon: Building2 },
              { label: "Employee Code", value: employeeCode, icon: Star },
              { label: "Leave Balance", value: `${leaveBalance} days remaining`, icon: CalendarDays },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 14px", borderRadius: "8px",
                background: "#F8FAFC", border: "1px solid #E2E8F0",
              }}>
                <Icon size={16} color="#A1238E" />
                <span style={{ fontSize: "12.5px", color: "#64748B", fontWeight: "600", flex: 1 }}>{label}</span>
                <span style={{ fontSize: "13px", color: "#0F172A", fontWeight: "800" }}>{value}</span>
              </div>
            ))}
          </div>

          <button
            className="primary-button"
            style={{ marginTop: "14px", width: "100%", justifyContent: "center", gap: "8px" }}
            onClick={() => window.location.href = "/attendance"}
          >
            <CalendarCheck size={16} />
            View Full Attendance
          </button>
        </section>
      </div>


      {/* ── ANNOUNCEMENTS & NOTIFICATIONS ──────────────────────────────── */}
      <section className="dashboard-card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Megaphone size={18} color="#DB2777" />
              Announcements & Notices
            </h3>
            <p>Department updates, HR circulars & personal directives</p>
          </div>
          <button
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", cursor: "pointer", fontSize: "12px", fontWeight: "700", color: "#475569" }}
            onClick={() => window.location.href = "/announcements"}
          >
            View All <ChevronRight size={13} />
          </button>
        </div>

        {myAnnouncements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", color: "#94A3B8" }}>
            <BellRing size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
            <p style={{ fontSize: "13px" }}>No announcements right now. Check back later.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {myAnnouncements.map((ann) => {
              const isIndividual = ann.metadata?.audience_type === "INDIVIDUAL";
              const targetDept   = ann.metadata?.target_department || ann.target_role || "";
              const isDeptScoped = Boolean(targetDept && targetDept !== "ALL");
              const reason       = ann.metadata?.reason;

              return (
                <div key={ann.id} style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: isIndividual ? "#EFF6FF" : isDeptScoped ? "#FAF5FF" : "#F8FAFC",
                  border: `1.5px solid ${isIndividual ? "#BFDBFE" : isDeptScoped ? "#E9D5FF" : "#E2E8F0"}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {isIndividual ? (
                        <span style={{ fontSize: "11px", padding: "2px 9px", background: "#DBEAFE", color: "#1D4ED8", borderRadius: "10px", fontWeight: "700" }}>
                          📨 Direct Notice
                        </span>
                      ) : isDeptScoped ? (
                        <span style={{ fontSize: "11px", padding: "2px 9px", background: "#EDE9FE", color: "#6D28D9", borderRadius: "10px", fontWeight: "700" }}>
                          🏢 {targetDept} Dept.
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", padding: "2px 9px", background: "#D1FAE5", color: "#065F46", borderRadius: "10px", fontWeight: "700" }}>
                          📣 Company Notice
                        </span>
                      )}
                      {reason && (
                        <span style={{ fontSize: "11px", padding: "2px 8px", background: "#F1F5F9", color: "#475569", borderRadius: "6px", fontWeight: "600" }}>
                          📌 {reason}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: "#94A3B8", whiteSpace: "nowrap" }}>
                      {ann.date || (ann.created_at ? new Date(ann.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent")}
                    </span>
                  </div>
                  <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#0F172A", margin: "8px 0 4px" }}>{ann.title}</h4>
                  <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.55", margin: 0 }}>
                    {(ann.content || ann.message || "").slice(0, 160)}{(ann.content || ann.message || "").length > 160 ? "..." : ""}
                  </p>
                  {ann.author || ann.sender_name ? (
                    <p style={{ fontSize: "11px", color: "#94A3B8", margin: "6px 0 0" }}>
                      Posted by: <strong style={{ color: "#64748B" }}>{ann.author || ann.sender_name}</strong>
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* ── ROW 2: LEAVE APPLICATION HISTORY & STATUS (FULL WIDTH) ────────── */}
      <section className="dashboard-card" style={{ marginBottom: "20px" }}>
        <div className="card-header" style={{ flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ClipboardList size={18} color="#DB2777" />
              My Leave Application History & Status
            </h3>
            <p>Track all submitted leave requests and approval decisions</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* TABS */}
            <div style={{ display: "flex", background: "#F1F5F9", padding: "3px", borderRadius: "8px", gap: "2px" }}>
              {[
                { id: "ALL", label: "All" },
                { id: "APPROVED", label: `Approved (${approvedLeaves}d)` },
                { id: "PENDING", label: `Pending (${pendingLeaves})` },
                { id: "REJECTED", label: `Rejected (${rejectedLeaves})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLeaveTabFilter(tab.id)}
                  style={{
                    border: "none",
                    background: leaveTabFilter === tab.id ? "#FFFFFF" : "transparent",
                    color: leaveTabFilter === tab.id ? "#0F172A" : "#64748B",
                    fontWeight: leaveTabFilter === tab.id ? "700" : "600",
                    fontSize: "12px",
                    padding: "5px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    boxShadow: leaveTabFilter === tab.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.location.href = "/leave"}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px",
                background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                cursor: "pointer", fontSize: "12px", fontWeight: "700", color: "#475569",
              }}
            >
              Full Leave Details <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* SUMMARY BALANCE TILES */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}>
          <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", color: "#065F46" }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#065F46", textTransform: "uppercase" }}>Approved Leaves</p>
              <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "800", color: "#065F46" }}>{approvedLeaves} Days</h4>
            </div>
          </div>

          <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", color: "#991B1B" }}>
              <XCircle size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#991B1B", textTransform: "uppercase" }}>Rejected Leaves</p>
              <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "800", color: "#991B1B" }}>{rejectedLeaves} Requests</h4>
            </div>
          </div>

          <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", color: "#92400E" }}>
              <Clock size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#92400E", textTransform: "uppercase" }}>Pending Review</p>
              <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "800", color: "#92400E" }}>{pendingLeaves} Requests</h4>
            </div>
          </div>

          <div style={{ padding: "12px 16px", borderRadius: "10px", background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E40AF" }}>
              <CalendarDays size={20} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#1E40AF", textTransform: "uppercase" }}>Casual Leave Balance</p>
              <h4 style={{ margin: "2px 0 0", fontSize: "18px", fontWeight: "800", color: "#1E40AF" }}>{leaveBalance} Days Left</h4>
            </div>
          </div>
        </div>

        {/* LEAVE RECORDS LIST */}
        {filteredLeaves.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "36px 20px",
            background: "#F8FAFC", borderRadius: "12px", border: "1.5px dashed #CBD5E1",
          }}>
            <CalendarDays size={36} style={{ margin: "0 auto 10px", color: "#94A3B8" }} />
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#475569", margin: "0 0 4px" }}>
              No Leave Records Found
            </p>
            <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0 }}>
              {leaveTabFilter === "ALL"
                ? "You haven't submitted any leave applications yet."
                : `No leave applications with status "${leaveTabFilter.toLowerCase()}".`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredLeaves.map((lv) => {
              const fromDate = lv.start_date ? String(lv.start_date).slice(0, 10) : "";
              const toDate = lv.end_date ? String(lv.end_date).slice(0, 10) : "";
              const days = fromDate && toDate
                ? Math.max(1, Math.round((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1)
                : (Number(lv.days) || 1);
              const appliedDate = lv.created_at ? new Date(lv.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : fromDate;

              return (
                <div
                  key={lv.id}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "12px",
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "14px",
                    flexWrap: "wrap",
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", flex: 1, minWidth: "260px" }}>
                    <div style={{
                      width: "42px", height: "42px", borderRadius: "10px",
                      background: (lv.status || "").toUpperCase() === "APPROVED" ? "#ECFDF5" : (lv.status || "").toUpperCase() === "REJECTED" ? "#FEF2F2" : "#FFFBEB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: (lv.status || "").toUpperCase() === "APPROVED" ? "#059669" : (lv.status || "").toUpperCase() === "REJECTED" ? "#DC2626" : "#D97706",
                      flexShrink: 0,
                    }}>
                      <Calendar size={20} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                        <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: "800", color: "#0F172A" }}>
                          {leaveTypeToUI[lv.leave_type] || lv.leave_type || "Leave Request"}
                        </h4>
                        <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>
                          · {days} Day{days > 1 ? "s" : ""}
                        </span>
                      </div>

                      <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#334155", fontWeight: "600" }}>
                        🗓️ {fromDate} &nbsp;→&nbsp; {toDate}
                      </p>

                      {lv.reason && (
                        <p style={{ margin: 0, fontSize: "12.5px", color: "#64748B", fontStyle: "italic" }}>
                          "{lv.reason}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    <StatusBadge status={lv.status} />
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                      Applied on: {appliedDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* ── PAYSLIPS FROM FINANCE ───────────────────────────────────────── */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CreditCard size={18} color="#DB2777" />
              My Payslips (Generated by Finance)
            </h3>
            <p>Salary records issued by the Finance department</p>
          </div>
          <button
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", background: "#F8FAFC", border: "1.5px solid #E2E8F0", cursor: "pointer", fontSize: "12px", fontWeight: "700", color: "#475569" }}
            onClick={() => window.location.href = "/payslips"}
          >
            View All Payslips <ChevronRight size={13} />
          </button>
        </div>

        {myPayslips.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "36px 20px",
            background: "linear-gradient(135deg, #F8FAFC 0%, #F0F4F8 100%)",
            borderRadius: "12px", border: "1.5px dashed #CBD5E1",
          }}>
            <WalletCards size={36} style={{ margin: "0 auto 12px", color: "#CBD5E1" }} />
            <p style={{ fontSize: "14px", fontWeight: "700", color: "#64748B", margin: "0 0 4px" }}>
              No Payslips Generated Yet
            </p>
            <p style={{ fontSize: "12.5px", color: "#94A3B8", margin: 0 }}>
              Payslips are generated by the Finance team each month. Check back after payroll processing.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
            {myPayslips.slice(0, 6).map((p, i) => {
              const net = Number(p.net_salary || p.netSalary || p.basic_salary || p.basicSalary || 0);
              const basic = Number(p.basic_salary || p.basicSalary || 0);
              const monthText = p.month || (p.payroll_month && p.payroll_year ? `Month ${p.payroll_month}, ${p.payroll_year}` : `Salary Slip #${i + 1}`);

              return (
                <div key={p.id || i} style={{
                  padding: "16px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
                  color: "#FFFFFF", position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: "80px", height: "80px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                  <p style={{ fontSize: "11px", fontWeight: "700", color: "#94A3B8", letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 6px" }}>{monthText}</p>
                  <p style={{ fontSize: "22px", fontWeight: "900", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                    ₹{net >= 1000 ? `${(net / 1000).toFixed(1)}K` : net}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94A3B8" }}>
                    <span>Basic: ₹{basic.toLocaleString("en-IN")}</span>
                    <span>Net: ₹{net.toLocaleString("en-IN")}</span>
                  </div>
                  <div style={{ marginTop: "10px", padding: "5px 10px", background: "rgba(16,185,129,0.2)", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "700", color: "#34D399" }}>
                    <CheckCircle2 size={12} /> Finance Approved
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Finance notice */}
        <div style={{
          marginTop: "14px", padding: "10px 14px",
          background: "#FEF9EC", border: "1px solid #FDE68A",
          borderRadius: "8px", display: "flex", alignItems: "center",
          gap: "8px", fontSize: "12.5px", color: "#92400E",
        }}>
          <Info size={14} style={{ flexShrink: 0 }} />
          <span>Payslips are exclusively generated by the <strong>Finance Department</strong>. Contact Finance for any payslip discrepancies.</span>
        </div>
      </section>

    </div>
  );
}

export default EmployeeDashboard;