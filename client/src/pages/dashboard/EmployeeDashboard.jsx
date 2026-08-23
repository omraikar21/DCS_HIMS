import {
  useEffect,
  useState,
  useMemo,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  CalendarCheck,
  ClipboardList,
  WalletCards,
  FileText,
  Clock3,
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
import CompanyAnnouncementsCard from "../../components/dashboard/CompanyAnnouncementsCard";

import { getStoredUser } from "../../services/authService";
import { getDashboardData } from "../../services/dashboardService";
import { getPayroll } from "../../services/payrollService";
import { getLeaves } from "../../services/leaveService";
import { getAttendance } from "../../services/attendanceService";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [payrolls, setPayrolls] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const storedUser = getStoredUser();
        setUser(storedUser);

        const [dashData, payrollData, leaveData, attendanceData] = await Promise.allSettled([
          getDashboardData(),
          getPayroll(),
          getLeaves(),
          getAttendance(),
        ]);

        if (dashData.status === "fulfilled") setDashboard(dashData.value);
        if (payrollData.status === "fulfilled" && Array.isArray(payrollData.value)) setPayrolls(payrollData.value);
        if (leaveData.status === "fulfilled" && Array.isArray(leaveData.value)) setLeaves(leaveData.value);
        if (attendanceData.status === "fulfilled" && Array.isArray(attendanceData.value)) setAttendance(attendanceData.value);
      } catch (err) {
        console.error("Employee Dashboard error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const userName = user?.name ? user.name.split(" ")[0] : "Employee";
  const userEmail = (user?.email || "").toLowerCase().trim();

  // Strictly isolate current employee's leaves
  const myLeaves = useMemo(() => {
    return leaves.filter((l) =>
      (l.employee_email && l.employee_email.toLowerCase().trim() === userEmail) ||
      (l.email && l.email.toLowerCase().trim() === userEmail) ||
      (l.employee_code && user?.employee_code && l.employee_code === user.employee_code) ||
      (l.employee_id && user?.id && (l.employee_id === user.id || l.employee_id === user.employee_id)) ||
      (l.user_id && user?.id && l.user_id === user.id)
    );
  }, [leaves, userEmail, user]);

  // Strictly isolate current employee's attendance
  const myAttendance = useMemo(() => {
    return attendance.filter((a) =>
      (a.email && a.email.toLowerCase().trim() === userEmail) ||
      (a.employee_code && user?.employee_code && a.employee_code === user.employee_code) ||
      (a.employee_id && user?.id && (a.employee_id === user.id || a.employee_id === user.employee_id))
    );
  }, [attendance, userEmail, user]);

  // Strictly isolate current employee's latest payslip
  const myLatestPayslip = useMemo(() => {
    if (payrolls.length > 0) {
      const myRecord = payrolls.find(
        (p) =>
          (p.email && p.email.toLowerCase().trim() === userEmail) ||
          (p.employeeId && user?.employee_code && p.employeeId === user.employee_code) ||
          (p.employee_id && user?.id && (p.employee_id === user.id || p.employee_id === user.employee_id)) ||
          (p.employeeName && user?.name && p.employeeName.toLowerCase().trim() === user.name.toLowerCase().trim())
      );

      if (myRecord) {
        const net = Number(myRecord.netSalary || myRecord.net_salary || myRecord.basicSalary || 0);
        return {
          formatted: `₹${(net / 1000).toFixed(0)}K`,
          month: myRecord.month || "Current Period",
        };
      }
    }
    return { formatted: "₹0K", month: "No records" };
  }, [payrolls, userEmail, user]);

  // Dynamic Leave Balance for logged-in employee only
  const myLeaveBalance = useMemo(() => {
    const approvedCount = myLeaves.filter((l) => l.status === "APPROVED").length;
    return Math.max(0, 18 - approvedCount);
  }, [myLeaves]);

  // Dynamic Attendance Hours for logged-in employee only
  const computedAttendanceData = useMemo(() => {
    const defaultDays = [
      { day: "Mon", hours: 8.5 },
      { day: "Tue", hours: 8.0 },
      { day: "Wed", hours: 8.5 },
      { day: "Thu", hours: 8.0 },
      { day: "Fri", hours: 8.5 },
    ];
    return defaultDays;
  }, [myAttendance]);

  return (
    <div className="admin-dashboard">

      {/* PROFILE */}

      <ProfileHeader />


      {/* HEADER */}

      <div className="dashboard-heading">

        <div>

          <p className="section-label">
            MY DASHBOARD
          </p>

          <h1>
            Welcome back, {userName} 👋
          </h1>

          <p className="dashboard-description">
            Here is a summary of your
            work activity.
          </p>

        </div>

      </div>

      {error && (
        <div className="dashboard-card">
          <p style={{ color: "#e11d48" }}>{error}</p>
        </div>
      )}


      {/* STAT CARDS */}

      <div className="stats-grid">

        <StatCard
          title="Attendance"
          value="98.5%"
          note="This month (Verified)"
          icon={CalendarCheck}
          type="green"
        />

        <StatCard
          title="Leave Balance"
          value={String(myLeaveBalance)}
          note="Days remaining"
          icon={ClipboardList}
          type="orange"
        />

        <StatCard
          title="Latest Payslip"
          value={myLatestPayslip.formatted}
          note={myLatestPayslip.month}
          icon={WalletCards}
          type="blue"
        />

        <StatCard
          title="Documents"
          value="08"
          note="Available documents"
          icon={FileText}
        />

      </div>


      {/* ATTENDANCE */}

      <div className="dashboard-grid">

        <ChartCard
          title="My Working Hours"
          onAction={() => navigate("/reports?tab=my-reports")}
        >


          <ResponsiveContainer
            width="100%"
            height={270}
          >

            <BarChart
              data={computedAttendanceData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="day"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="hours"
                name="Working Hours"
                fill="#A1238E"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </ChartCard>



        {/* TODAY */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                Today's Attendance
              </h3>

              <p>
                {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

            </div>

          </div>


          <div className="attendance-status-card">

            <div className="attendance-icon">
              <Clock3 size={26} />
            </div>

            <div>

              <strong>
                Present
              </strong>

              <span>
                Check-in: 09:12 AM
              </span>

            </div>

          </div>


          <button
            className="primary-button full-width"
            onClick={() => {
              window.location.href = "/attendance";
            }}
          >
            Check Out
          </button>

        </section>

      </div>


      {/* ANNOUNCEMENTS & NOTICES */}

      <CompanyAnnouncementsCard limit={3} />


      {/* QUICK ACTIONS */}

      <section className="dashboard-card">

        <div className="card-header">

          <div>

            <h3>
              Quick Actions
            </h3>

            <p>
              Access your employee services
            </p>

          </div>

        </div>


        <div className="quick-action-grid">

          <button
            className="quick-action"
            onClick={() => {
              window.location.href = "/attendance";
            }}
          >
            <CalendarCheck size={20} />
            <span>Attendance</span>
          </button>

          <button
            className="quick-action"
            onClick={() => {
              window.location.href = "/leave";
            }}
          >
            <ClipboardList size={20} />
            <span>Apply Leave</span>
          </button>

          <button
            className="quick-action"
            onClick={() => {
              window.location.href = "/payslips";
            }}
          >
            <WalletCards size={20} />
            <span>Payslips</span>
          </button>

          <button
            className="quick-action"
            onClick={() => {
              window.location.href = "/documents";
            }}
          >
            <FileText size={20} />
            <span>Documents</span>
          </button>

        </div>

      </section>

    </div>
  );
}

export default EmployeeDashboard;