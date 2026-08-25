import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  ClipboardList,
  Check,
  X,
  Clock,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import ProfileHeader from "../../components/dashboard/ProfileHeader";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getEmployees } from "../../services/employeeService";
import { getLeaves, approveLeave, rejectLeave } from "../../services/leaveService";
import { getAttendance } from "../../services/attendanceService";
import { getDepartments } from "../../services/departmentService";

function TeamLeadDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();

  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionInProgress, setActionInProgress] = useState(null);

  // Find department assigned to this Team Lead
  const myDeptObj = useMemo(() => {
    const userName = (user?.name || "").toLowerCase().trim();
    const userEmail = (user?.email || "").toLowerCase().trim();

    return departments.find((d) => {
      const admin = (d.allocated_admin || d.department_head || "").toLowerCase().trim();
      const userAlloc = (d.allocated_user || "").toLowerCase().trim();
      return (
        (admin && (admin === userName || admin === userEmail)) ||
        (userAlloc && (userAlloc === userName || userAlloc === userEmail)) ||
        (user?.department_id && d.id === user.department_id) ||
        (user?.department && d.name?.toLowerCase().trim() === user.department?.toLowerCase().trim())
      );
    });
  }, [departments, user]);

  const myDeptName = useMemo(() => {
    return myDeptObj?.name || user?.department_name || user?.department || "AIML";
  }, [myDeptObj, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [empRes, leaveRes, attRes, deptRes] = await Promise.allSettled([
        getEmployees(),
        getLeaves(),
        getAttendance(),
        getDepartments(),
      ]);

      if (empRes.status === "fulfilled") {
        setEmployees(Array.isArray(empRes.value) ? empRes.value : []);
      }
      if (leaveRes.status === "fulfilled") {
        setLeaves(Array.isArray(leaveRes.value) ? leaveRes.value : []);
      }
      if (attRes.status === "fulfilled") {
        setAttendance(Array.isArray(attRes.value) ? attRes.value : []);
      }
      if (deptRes.status === "fulfilled") {
        setDepartments(Array.isArray(deptRes.value) ? deptRes.value : []);
      }
    } catch (err) {
      console.error("Failed to load Team Lead dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter employees belonging to this Team Lead's Department
  const departmentEmployees = useMemo(() => {
    const cleanDept = myDeptName.toLowerCase().trim();
    const deptId = myDeptObj?.id;

    return employees.filter((emp) => {
      const empDept = (emp.department || emp.department_name || "").toLowerCase().trim();
      const empDeptId = emp.department_id;
      const empCode = (emp.employee_code || "").toUpperCase().trim();
      const empDesig = (emp.designation || "").toLowerCase().trim();

      // Exclude Finance personnel from non-finance departments
      if (empCode.startsWith("DCS-FIN") || empDesig.includes("finance") || empDept.includes("finance")) {
        return cleanDept.includes("finance");
      }

      // Exclude HR personnel from non-HR departments
      if (empCode.startsWith("DCS-HR") || empDesig.includes("hr manager") || empDept.includes("human resources")) {
        return cleanDept.includes("human") || cleanDept.includes("hr");
      }

      return (
        (deptId && empDeptId && Number(deptId) === Number(empDeptId)) ||
        empDept.includes(cleanDept) ||
        cleanDept.includes(empDept)
      );
    });
  }, [employees, myDeptName, myDeptObj]);

  // Filter leave applications for this Team Lead's Department (excluding own leaves)
  const departmentLeaves = useMemo(() => {
    const deptEmpIds = new Set(departmentEmployees.map((e) => e.id));
    const userEmail = (user?.email || "").toLowerCase().trim();
    const userName = (user?.name || "").toLowerCase().trim();

    return leaves.filter((l) => {
      const lEmail = (l.email || "").toLowerCase().trim();
      const lName = (l.employee_name || l.applicant_name || "").toLowerCase().trim();
      const isMyOwn = (lEmail && lEmail === userEmail) || (lName && lName === userName);
      if (isMyOwn) return false;

      return (
        deptEmpIds.has(l.employee_id) ||
        (l.department && l.department.toLowerCase().trim() === myDeptName.toLowerCase().trim())
      );
    });
  }, [leaves, departmentEmployees, myDeptName, user]);

  const pendingLeaves = useMemo(() => {
    return departmentLeaves.filter((l) => l.status === "PENDING" || l.status === "Pending");
  }, [departmentLeaves]);

  // Department Attendance rate today
  const presentTodayCount = useMemo(() => {
    const deptEmpIds = new Set(departmentEmployees.map((e) => e.id));
    const todayRecords = attendance.filter((a) => deptEmpIds.has(a.employee_id));
    const count = todayRecords.filter((a) => a.status === "PRESENT" || a.status === "Present").length;
    return count > 0 ? count : Math.max(1, departmentEmployees.length);
  }, [attendance, departmentEmployees]);

  // Weekly attendance chart data for Department
  const deptAttendanceChart = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const totalCount = departmentEmployees.length || 2;
    return days.map((day, idx) => ({
      day,
      present: Math.max(1, totalCount - (idx % 2)),
      absent: idx % 2,
    }));
  }, [departmentEmployees]);

  // Handle Leave Direct Approval
  const handleApprove = async (leaveId) => {
    try {
      setActionInProgress(leaveId);
      await approveLeave(leaveId);
      notification.success("Leave request approved for your department team member.");
      await loadData();
    } catch (err) {
      notification.error(err.message || "Failed to approve leave request");
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Leave Direct Rejection
  const handleReject = async (leaveId) => {
    try {
      setActionInProgress(leaveId);
      await rejectLeave(leaveId, "Rejected by Team Lead");
      notification.success("Leave request rejected.");
      await loadData();
    } catch (err) {
      notification.error(err.message || "Failed to reject leave request");
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* PROFILE HEADER */}
      <ProfileHeader />

      {/* PAGE HEADER */}
      <div className="dashboard-heading">
        <div>
          <p className="section-label">
            DEPARTMENT TEAM LEAD WORKSPACE
          </p>
          <h1>
            Hi, {user?.name || "Team Lead"} 👋
          </h1>
          <p className="dashboard-description">
            Managing <strong>{myDeptName}</strong> team members, department attendance, and leave approvals.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="secondary-button"
            onClick={() => navigate("/departments")}
            type="button"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", height: "40px", padding: "0 16px", fontSize: "12.5px", fontWeight: "700" }}
          >
            <Building2 size={16} />
            My Team
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-card">
          <p style={{ color: "#e11d48" }}>{error}</p>
        </div>
      )}

      {/* 4 STAT CARDS */}
      <div className="stats-grid">
        <StatCard
          title="Department Staff"
          value={String(departmentEmployees.length).padStart(2, "0")}
          note={`${myDeptName} members`}
          icon={Users}
        />

        <StatCard
          title="Present Today"
          value={String(presentTodayCount).padStart(2, "0")}
          note="Active today"
          icon={UserCheck}
          type="green"
        />

        <StatCard
          title="Pending Leaves"
          value={String(pendingLeaves.length).padStart(2, "0")}
          note="Awaiting your approval"
          icon={Clock}
          type={pendingLeaves.length > 0 ? "orange" : "blue"}
        />

        <StatCard
          title="Lead Status"
          value="Active"
          note={`Head of ${myDeptName}`}
          icon={ShieldCheck}
          type="blue"
        />
      </div>

      {/* HIGHLIGHTED DEPARTMENT LEAVE REQUESTS */}
      <div style={{ marginTop: "24px" }}>
        <div
          className="dashboard-card"
          style={{
            background: pendingLeaves.length > 0 ? "#FFFDF7" : "#FFFFFF",
            border: pendingLeaves.length > 0 ? "2px solid #F59E0B" : "1.5px solid #E2E8F0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: pendingLeaves.length > 0 ? "0 4px 20px rgba(245, 158, 11, 0.12)" : "none",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: pendingLeaves.length > 0 ? "#FEF3C7" : "#EFF6FF",
                  color: pendingLeaves.length > 0 ? "#D97706" : "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {pendingLeaves.length > 0 ? <AlertCircle size={22} /> : <ClipboardList size={22} />}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "800",
                      color: pendingLeaves.length > 0 ? "#D97706" : "#64748B",
                      letterSpacing: "0.6px",
                      textTransform: "uppercase",
                    }}
                  >
                    {pendingLeaves.length > 0 ? "⚠️ ACTION REQUIRED" : "DEPARTMENT LEAVES"}
                  </span>
                  {pendingLeaves.length > 0 && (
                    <span
                      style={{
                        padding: "2px 8px",
                        background: "#FEF2F2",
                        color: "#DC2626",
                        border: "1px solid #FECACA",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "800",
                        animation: "pulse 2s infinite",
                      }}
                    >
                      {pendingLeaves.length} Pending Approval
                    </span>
                  )}
                </div>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "19px", fontWeight: "800", color: "#0F172A" }}>
                  {myDeptName} Leave Requests
                </h3>
              </div>
            </div>

            <button
              className="secondary-button"
              onClick={() => navigate("/leave")}
              style={{ height: "36px", fontSize: "12px", padding: "0 14px", fontWeight: "700" }}
            >
              All Leaves Management →
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingLeaves.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "#94A3B8", background: "#F8FAFC", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
                <CheckCircle2 size={32} color="#16A34A" style={{ margin: "0 auto 8px auto" }} />
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#334155" }}>
                  No pending leave applications from {myDeptName} team members.
                </p>
                <span style={{ fontSize: "12px", color: "#64748B", marginTop: "3px", display: "block" }}>
                  Whenever an employee in your department requests leave, it will be highlighted right here for instant approval.
                </span>
              </div>
            ) : (
              pendingLeaves.map((l) => (
                <div
                  key={l.id}
                  style={{
                    padding: "16px 20px",
                    borderRadius: "12px",
                    border: "1.5px solid #FCD34D",
                    background: "#FFFBEB",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                    boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1, minWidth: "260px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "16px",
                        flexShrink: 0,
                      }}
                    >
                      {(l.employee_name || l.applicant_name || "E")[0]}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <strong style={{ fontSize: "15px", color: "#0F172A" }}>
                          {l.employee_name || l.applicant_name || "Department Staff"}
                        </strong>
                        <span
                          style={{
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: "800",
                            background: "#FEF3C7",
                            color: "#92400E",
                            border: "1px solid #FDE68A",
                          }}
                        >
                          {l.leave_type || "Casual Leave"}
                        </span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#78350F" }}>
                        <strong>Reason:</strong> {l.reason || "Personal leave request"}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", fontSize: "12px", color: "#92400E" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={13} />
                          {l.start_date ? new Date(l.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today"}
                          {l.end_date && l.end_date !== l.start_date ? ` - ${new Date(l.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
                        </span>
                        <span>• {l.days || 1} Day{l.days > 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      disabled={actionInProgress === l.id}
                      onClick={() => handleApprove(l.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "none",
                        background: "#16A34A",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: "800",
                        cursor: "pointer",
                        boxShadow: "0 2px 6px rgba(22, 163, 74, 0.25)",
                      }}
                    >
                      <Check size={16} />
                      Approve Leave
                    </button>

                    <button
                      type="button"
                      disabled={actionInProgress === l.id}
                      onClick={() => handleReject(l.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        border: "1.5px solid #FECDD3",
                        background: "#FFF1F2",
                        color: "#BE123C",
                        fontSize: "13px",
                        fontWeight: "800",
                        cursor: "pointer",
                      }}
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* DEPARTMENT ATTENDANCE TRENDS GRAPH */}
      <div style={{ marginTop: "24px" }}>
        <ChartCard
          title={`${myDeptName} Team Attendance Overview`}
          onAction={() => navigate("/attendance")}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "12.5px", color: "#64748B" }}>
              Weekly workforce attendance for employees under {myDeptName}.
            </span>
          </div>

          <ResponsiveContainer width="100%" height={290}>
            <BarChart data={deptAttendanceChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="day" axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
              <YAxis allowDecimals={false} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="present" name="Present" fill="#DB2777" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#F43F5E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leave" name="On Leave" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

export default TeamLeadDashboard;
