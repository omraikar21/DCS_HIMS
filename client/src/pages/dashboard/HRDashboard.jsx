import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  CalendarCheck,
  ClipboardList,
  FileText,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import ProfileHeader from "../../components/dashboard/ProfileHeader";
import CompanyAnnouncementsCard from "../../components/dashboard/CompanyAnnouncementsCard";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardData } from "../../services/dashboardService";

const chartColors = [
  "#A1238E",
  "#8E1F7D",
  "#949599",
  "#2563EB",
  "#16A34A",
  "#F0A500",
];

function HRDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const data = await getDashboardData();
        setDashboard(data);
      } catch (err) {
        console.error("HR Dashboard error:", err);
        setError(err.message || "Failed to load dashboard data");
      }
    };

    load();
  }, []);

  const totalEmployees = dashboard?.summary?.totalEmployees || 0;
  const activeEmployees = dashboard?.summary?.activeEmployees || 0;
  const presentToday = dashboard?.attendance?.present || (activeEmployees > 0 ? activeEmployees : 0);
  const pendingLeaves = dashboard?.leave?.pending || 0;

  const attendanceRate = totalEmployees > 0
    ? `${Math.round((presentToday / totalEmployees) * 100)}% attendance`
    : "100% attendance";

  const attendanceChartData = useMemo(() => {
    if (dashboard?.weeklyAttendance && dashboard.weeklyAttendance.length > 0) {
      return dashboard.weeklyAttendance.map((item) => ({
        day: item.day || "Day",
        present: Number(item.present) || 0,
        absent: Number(item.absent) || 0,
        leave: Number(item.leave) || 0,
      }));
    }
    const presentCount = presentToday || 0;
    const absentCount = Math.max(0, totalEmployees - presentCount);
    return [
      { day: "Mon", present: presentCount, absent: absentCount },
      { day: "Tue", present: presentCount, absent: absentCount },
      { day: "Wed", present: presentCount, absent: absentCount },
      { day: "Thu", present: presentCount, absent: absentCount },
      { day: "Fri", present: presentCount, absent: absentCount },
    ];
  }, [dashboard, presentToday, totalEmployees]);

  const departmentChartData = useMemo(() => {
    if (dashboard?.employeesByDepartment && dashboard.employeesByDepartment.length > 0) {
      return dashboard.employeesByDepartment.map((d) => ({
        name: d.department || "General",
        value: Number(d.employee_count) || 0,
      }));
    }
    return [];
  }, [dashboard]);

  return (
    <div className="admin-dashboard">
      {/* PROFILE */}
      <ProfileHeader />

      {/* HEADER */}
      <div className="dashboard-heading">
        <div>
          <p className="section-label">
            HR EXECUTIVE DASHBOARD
          </p>

          <h1>
            Hi, {user?.name || "HR Member"} 👋
          </h1>

          <p className="dashboard-description">
            Manage employees, team leads, attendance, and department allocations.
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
          title="Total Employees"
          value={String(totalEmployees).padStart(2, "0")}
          note={`+${Math.min(totalEmployees, 5)} this month`}
          icon={Users}
        />

        <StatCard
          title="Present Today"
          value={String(presentToday).padStart(2, "0")}
          note={attendanceRate}
          icon={CalendarCheck}
          type="green"
        />

        <StatCard
          title="Leave Requests"
          value={String(pendingLeaves).padStart(2, "0")}
          note="Pending approval"
          icon={ClipboardList}
          type="orange"
        />

        <StatCard
          title="Active Departments"
          value={String(dashboard?.summary?.totalDepartments || 4).padStart(2, "0")}
          note="Enterprise Wings"
          icon={FileText}
          type="blue"
        />
      </div>

      {/* CHARTS ROW */}
      <div className="dashboard-grid">
        <ChartCard
          title="Weekly Attendance Overview"
          onAction={() => navigate("/attendance")}
        >
          <ResponsiveContainer
            width="100%"
            height={270}
          >
            <BarChart
              data={attendanceChartData}
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
                dataKey="present"
                name="Present"
                fill="#DB2777"
                radius={[
                  5,
                  5,
                  0,
                  0,
                ]}
              />
              <Bar
                dataKey="absent"
                name="Absent"
                fill="#949599"
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

        {/* DEPARTMENT DISTRIBUTION (PIE CHART MATCHING ADMIN) */}
        <ChartCard
          title="Department Distribution"
          onAction={() => navigate("/departments")}
        >
          {departmentChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={270}>
              <PieChart>
                <Pie
                  data={departmentChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {departmentChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "270px",
                width: "100%",
                color: "#64748B",
                background: "#FAFCFF",
                borderRadius: "12px",
                border: "1px dashed #E2E8F0",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <span style={{ fontSize: "13.5px", fontWeight: "700", color: "#334155" }}>
                No department employee records available
              </span>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ANNOUNCEMENTS */}
      <CompanyAnnouncementsCard limit={3} />

      {/* HR TASKS */}
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h3>
              HR Quick Actions
            </h3>
            <p>
              Frequently used HR operations
            </p>
          </div>
        </div>

        <div className="quick-action-grid">
          <button
            className="quick-action"
            onClick={() => navigate("/employees")}
          >
            <Users size={20} />
            <span>Employees</span>
          </button>

          <button
            className="quick-action"
            onClick={() => navigate("/attendance")}
          >
            <CalendarCheck size={20} />
            <span>Attendance</span>
          </button>

          <button
            className="quick-action"
            onClick={() => navigate("/leave")}
          >
            <ClipboardList size={20} />
            <span>Leave Requests</span>
          </button>

          <button
            className="quick-action"
            onClick={() => navigate("/departments")}
          >
            <FileText size={20} />
            <span>Departments</span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default HRDashboard;