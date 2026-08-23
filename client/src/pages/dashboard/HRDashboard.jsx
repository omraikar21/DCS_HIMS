import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Users,
  UserPlus,
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
} from "recharts";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import RecentActivities from "../../components/dashboard/RecentActivities";
import ProfileHeader from "../../components/dashboard/ProfileHeader";
import CompanyAnnouncementsCard from "../../components/dashboard/CompanyAnnouncementsCard";

import { getDashboardData } from "../../services/dashboardService";

function HRDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState(null);


  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboardData();
        setDashboard(data);
      } catch (err) {
        console.error("HR Dashboard error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
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
    const presentCount = presentToday || 0;
    const absentCount = Math.max(0, totalEmployees - presentCount);
    return [
      { day: "Mon", present: presentCount, absent: absentCount },
      { day: "Tue", present: presentCount, absent: absentCount },
      { day: "Wed", present: presentCount, absent: absentCount },
      { day: "Thu", present: presentCount, absent: absentCount },
      { day: "Fri", present: presentCount, absent: absentCount },
    ];
  }, [presentToday, totalEmployees]);

  return (
    <div className="admin-dashboard">

      {/* PROFILE */}

      <ProfileHeader />


      {/* HEADER */}

      <div className="dashboard-heading">

        <div>

          <p className="section-label">
            HR OVERVIEW
          </p>

          <h1>
            Welcome, HR 👋
          </h1>

          <p className="dashboard-description">
            Manage employees, attendance and
            leave requests from one place.
          </p>

        </div>

        <button
          className="primary-button"
          onClick={() => {
            window.location.href = "/employees";
          }}
        >

          <UserPlus size={17} />

          Add Employee

        </button>

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
          title="Documents"
          value="142"
          note="Employee documents"
          icon={FileText}
          type="blue"
        />

      </div>


      {/* CHARTS */}

      <div className="dashboard-grid">

        <ChartCard
          title="Weekly Attendance"
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
                fill="#A1238E"
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


        <RecentActivities />

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
            onClick={() => {
              window.location.href = "/employees";
            }}
          >
            <Users size={20} />
            <span>Employees</span>
          </button>

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
            <span>Leave Requests</span>
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

export default HRDashboard;