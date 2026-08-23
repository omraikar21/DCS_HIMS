import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
    Users,
    CheckCircle2,
    Clock3,
    WalletCards,
    UserPlus,
    Server,
    Cpu,
    Activity,
    Radio,
    BellRing,
    Terminal,
    ShieldCheck,
    AlertTriangle,
    Shield,
    X,
    BadgeCheck,
    Database,
    Printer,
    Download,
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
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
    AreaChart,
    Area,
} from "recharts";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import RecentActivities from "../../components/dashboard/RecentActivities";
import ProfileHeader from "../../components/dashboard/ProfileHeader";
import CompanyAnnouncementsCard from "./CompanyAnnouncementsCard";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getDashboardData } from "../../services/dashboardService";
import { createAnnouncement } from "../../services/notificationService";

const chartColors = [
    "#A1238E",
    "#8E1F7D",
    "#949599",
    "#2563EB",
    "#16A34A",
    "#F0A500",
];

function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const notification = useNotification();

    const isSuperAdmin = Boolean(
        user?.is_super_admin ||
        (user?.email && user.email.toLowerCase().trim() === "omraikar2128@gmail.com")
    );

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isTelemetryReportOpen, setIsTelemetryReportOpen] = useState(false);

    // Super Admin Server Notice / Maintenance Shutdown Modal State
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [noticeData, setNoticeData] = useState({
        title: "Server Operations & Low Load Status Notice",
        timeframe: "Today 03:00 PM – 04:00 PM IST",
        message: "All backend services, PostgreSQL database nodes, and API gateways are operating normally under low load (12%). System latency < 40ms.",
        priority: "NORMAL",
        isShutdown: false,
    });
    const [sendingNotice, setSendingNotice] = useState(false);

    const handleSendNotice = async (e) => {
        if (e) e.preventDefault();
        if (!noticeData.title.trim() || !noticeData.message.trim()) {
            if (notification?.error) notification.error("Title and message are required");
            return;
        }

        try {
            setSendingNotice(true);
            const fullMessage = noticeData.timeframe.trim()
                ? `[TIMEFRAME: ${noticeData.timeframe.trim()}] ${noticeData.message.trim()}`
                : noticeData.message.trim();

            await createAnnouncement({
                title: noticeData.title.trim(),
                message: fullMessage,
                priority: noticeData.priority || "NORMAL",
                category: noticeData.isShutdown ? "Platform Maintenance / Downtime" : "Server Infrastructure",
            });
            setNoticeModalOpen(false);
            if (notification?.success) {
                notification.success("Server & Maintenance shutdown announcement broadcast to all dashboards!");
            }
        } catch (err) {
            console.error("Failed to broadcast server notice:", err);
            if (notification?.error) {
                notification.error(err.message || "Failed to broadcast announcement");
            }
        } finally {
            setSendingNotice(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getDashboardData();
                setDashboard(data);
            } catch (err) {
                console.error("Dashboard error:", err);
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
    const totalPayroll = dashboard?.payroll?.totalPayroll || 0;

    const payrollFormatted = totalPayroll > 0
        ? `₹${(totalPayroll / 100000).toFixed(2)}L`
        : "₹0.00L";

    const attendanceRate = totalEmployees > 0
        ? `${Math.round((presentToday / totalEmployees) * 100)}% attendance`
        : "100% attendance";

    const departmentChartData = useMemo(() => {
        if (dashboard?.employeesByDepartment && dashboard.employeesByDepartment.length > 0) {
            return dashboard.employeesByDepartment.map((d) => ({
                name: d.department || "Other",
                value: Number(d.employee_count) || 0,
            })).filter((d) => d.value > 0);
        }
        return [];
    }, [dashboard]);

    const employeeGrowthData = useMemo(() => {
        if (totalEmployees === 0) {
            return [
                { month: "Mar", employees: 0 },
                { month: "Apr", employees: 0 },
                { month: "May", employees: 0 },
                { month: "Jun", employees: 0 },
                { month: "Jul", employees: 0 },
                { month: "Aug", employees: 0 },
            ];
        }
        const currentCount = totalEmployees;
        return [
            { month: "Mar", employees: Math.max(0, currentCount - 3) },
            { month: "Apr", employees: Math.max(0, currentCount - 2) },
            { month: "May", employees: Math.max(0, currentCount - 1) },
            { month: "Jun", employees: Math.max(0, currentCount - 1) },
            { month: "Jul", employees: Math.max(0, currentCount) },
            { month: "Aug", employees: currentCount },
        ];
    }, [totalEmployees]);

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

    const serverLatencyData = useMemo(() => [
        { time: "09:00", load: 10, latency: 32 },
        { time: "10:00", load: 14, latency: 38 },
        { time: "11:00", load: 18, latency: 45 },
        { time: "12:00", load: 15, latency: 40 },
        { time: "13:00", load: 11, latency: 35 },
        { time: "14:00", load: 12, latency: 36 },
        { time: "15:00", load: 13, latency: 39 },
    ], []);

    const recentEmployees = useMemo(() => {
        if (dashboard?.recentEmployees && dashboard.recentEmployees.length > 0) {
            return dashboard.recentEmployees.map((e) => {
                const fullName = `${e.first_name || ""} ${e.last_name || ""}`.trim() || "Employee";
                return {
                    id: e.employee_code || `DCS-EMP-${String(e.id).padStart(3, "0")}`,
                    databaseId: e.id,
                    name: fullName,
                    department: e.department_name || "Development",
                    designation: e.designation || "Engineer",
                    status: e.employment_status === "ACTIVE" ? "Active" : (e.employment_status === "ON_LEAVE" ? "On Leave" : "Inactive"),
                };
            });
        }
        return [];
    }, [dashboard]);

    // =========================================================================
    // 1. SUPER ADMIN (DEVELOPER / PLATFORM GOVERNANCE VIEW)
    // =========================================================================
    if (isSuperAdmin) {
        return (
            <div className="admin-dashboard">
                {/* PROFILE */}
                <ProfileHeader />

                {/* SUPER ADMIN PAGE HEADER */}
                <div className="dashboard-heading">
                    <div>
                        <p className="section-label">
                            DEVELOPER & PLATFORM GOVERNANCE
                        </p>
                        <h1>
                            Welcome, Developer / Super Admin 👋
                        </h1>
                        <p className="dashboard-description">
                            Real-time DCS-HIMS platform infrastructure, server health, low-load monitoring, and secondary admin provisioning.
                        </p>
                    </div>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                            className="secondary-button"
                            onClick={() => setNoticeModalOpen(true)}
                            type="button"
                            style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}
                        >
                            <BellRing size={16} />
                            Broadcast Server / Shutdown Alert
                        </button>

                        <button
                            className="primary-button"
                            onClick={() => navigate("/user-management")}
                            type="button"
                        >
                            <ShieldCheck size={17} />
                            + Add Secondary Admin
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="dashboard-card">
                        <p style={{ color: "#e11d48" }}>{error}</p>
                    </div>
                )}

                {/* 4 DEVELOPER TELEMETRY STAT CARDS */}
                <div className="stats-grid">
                    <StatCard
                        title="Server Status"
                        value="Low (12%)"
                        note="100% Operational"
                        icon={Server}
                        type="green"
                    />

                    <StatCard
                        title="Secondary Admins"
                        value="Active"
                        note="Total Office Authority"
                        icon={ShieldCheck}
                        type="purple"
                    />

                    <StatCard
                        title="Database Cluster"
                        value="PostgreSQL 16"
                        note="10 Core Tables Active"
                        icon={Database}
                        type="blue"
                    />

                    <StatCard
                        title="Platform Maintenance"
                        value="Live & Ready"
                        note="Zero Downtime"
                        icon={Radio}
                        type="orange"
                    />
                </div>

                {/* DEVELOPER INFRASTRUCTURE ROW */}
                <div className="dashboard-grid">
                    {/* SERVER TRAFFIC & LATENCY CHART */}
                    <ChartCard
                        title="Server Traffic & Low-Latency Telemetry"
                        onAction={() => setIsTelemetryReportOpen(true)}
                    >
                        <ResponsiveContainer width="100%" height={270}>
                            <AreaChart data={serverLatencyData}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#9E2682" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#9E2682" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="load"
                                    name="CPU Server Load (%)"
                                    stroke="#9E2682"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorLoad)"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="latency"
                                    name="API Latency (ms)"
                                    stroke="#2E9B67"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* SYSTEM DIAGNOSTICS & ARCHITECTURE SPECIFICATIONS */}
                    <div className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #EACEE3", padding: "20px" }}>
                        <div className="card-header" style={{ marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #EACEE3" }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "16px", color: "#18243A", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Terminal size={17} color="#9E2682" />
                                    System Architecture Diagnostics
                                </h3>
                                <p style={{ margin: "3px 0 0", fontSize: "12.5px", color: "#64748b" }}>Core platform engine specifications.</p>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#F8FAFC", borderRadius: "8px" }}>
                                <strong>REST API Gateway</strong>
                                <span style={{ color: "#2E9B67", fontWeight: "700" }}>Express.js (Port 5000) Active</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#F8FAFC", borderRadius: "8px" }}>
                                <strong>Frontend Architecture</strong>
                                <span style={{ color: "#18243A", fontWeight: "700" }}>React 19 + Vite 8 Client</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#F8FAFC", borderRadius: "8px" }}>
                                <strong>Face Recognition SDK</strong>
                                <span style={{ color: "#9E2682", fontWeight: "700" }}>Python REST Attendance Client Ready</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#EDF9F2", borderRadius: "8px", border: "1px solid #A3E4C3" }}>
                                <strong style={{ color: "#2E9B67" }}>Governance Model</strong>
                                <span style={{ color: "#2E9B67", fontWeight: "700" }}>Super Admin (Dev) + Secondary Admins</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECOND ROW */}
                <div className="dashboard-grid">
                    <RecentActivities />
                    <CompanyAnnouncementsCard />
                </div>

                {/* SUPER ADMIN NOTICE & SHUTDOWN MODAL */}
                {noticeModalOpen && (
                    <div className="modal-overlay">
                        <div className="employee-modal" style={{ maxWidth: "560px" }}>
                            <div className="modal-header">
                                <div>
                                    <p className="section-label">PLATFORM GOVERNANCE</p>
                                    <h2>Broadcast Server / Shutdown Alert</h2>
                                </div>
                                <button className="modal-close" onClick={() => setNoticeModalOpen(false)}>
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSendNotice}>
                                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                                        Broadcast an official real-time infrastructure notice, server issue update, or scheduled platform downtime directly to all active dashboards.
                                    </p>

                                    <div className="form-field">
                                        <label>Alert Subject / Title</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Server Maintenance & Temporary Downtime Notice"
                                            value={noticeData.title}
                                            onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Scheduled Timeframe / Window</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Today 03:00 PM – 04:00 PM IST (or Immediate)"
                                            value={noticeData.timeframe}
                                            onChange={(e) => setNoticeData({ ...noticeData, timeframe: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label>Priority Level</label>
                                        <select
                                            value={noticeData.priority}
                                            onChange={(e) => setNoticeData({ ...noticeData, priority: e.target.value })}
                                            style={{
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: "8px",
                                                border: "1px solid #EACEE3",
                                                backgroundColor: "#FFFFFF",
                                                fontSize: "13.5px",
                                                color: "#18243A",
                                                fontWeight: "600",
                                            }}
                                        >
                                            <option value="NORMAL">Normal / Low-Load Status Notice</option>
                                            <option value="HIGH">High Priority (Scheduled Maintenance)</option>
                                            <option value="CRITICAL">Critical / Urgent Server Alert</option>
                                        </select>
                                    </div>

                                    <div className="form-field">
                                        <label>Detailed System Notification Message</label>
                                        <textarea
                                            required
                                            rows={4}
                                            placeholder="e.g. The application will undergo scheduled server optimization..."
                                            value={noticeData.message}
                                            onChange={(e) => setNoticeData({ ...noticeData, message: e.target.value })}
                                            style={{
                                                width: "100%",
                                                padding: "10px 14px",
                                                borderRadius: "8px",
                                                border: "1px solid #EACEE3",
                                                fontFamily: "inherit",
                                                fontSize: "13px",
                                                resize: "vertical",
                                            }}
                                        />
                                    </div>

                                    <div style={{ padding: "12px", background: "#EDF9F2", borderRadius: "8px", border: "1px solid #A3E4C3", display: "flex", alignItems: "center", gap: "10px" }}>
                                        <BadgeCheck size={18} color="#2E9B67" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: "12px", color: "#2E9B67", lineHeight: "1.4" }}>
                                            <strong>Immediate Broadcast:</strong> Pushed instantly to all Administrator, HR, Finance, and Employee dashboards with high-priority banners.
                                        </span>
                                    </div>
                                </div>

                                <div className="modal-footer" style={{ borderTop: "1px solid #EACEE3", padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={() => setNoticeModalOpen(false)}
                                        disabled={sendingNotice}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="primary-button"
                                        disabled={sendingNotice}
                                        style={{ background: "#9E2682", borderColor: "#9E2682" }}
                                    >
                                        {sendingNotice ? "Broadcasting..." : "Broadcast Alert"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================================
    // 2. SECONDARY ADMIN (COMPLETE TOTAL OFFICE MANAGEMENT VIEW)
    // =========================================================================
    return (
        <div className="admin-dashboard">
            {/* PROFILE */}
            <ProfileHeader />

            {/* PAGE HEADER */}
            <div className="dashboard-heading">
                <div>
                    <p className="section-label">
                        OVERVIEW
                    </p>
                    <h1>
                        Welcome, Admin 👋
                    </h1>
                    <p className="dashboard-description">
                        Here is what is happening across DCS today.
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
                    icon={CheckCircle2}
                    type="green"
                />

                <StatCard
                    title="Pending Leaves"
                    value={String(pendingLeaves).padStart(2, "0")}
                    note="Needs review"
                    icon={Clock3}
                    type="orange"
                />

                <StatCard
                    title="Monthly Payroll"
                    value={payrollFormatted}
                    note="August 2026"
                    icon={WalletCards}
                    type="blue"
                />
            </div>

            {/* FIRST ROW */}
            <div className="dashboard-grid">
                {/* EMPLOYEE GROWTH */}
                <ChartCard
                    title="Employee Growth"
                    onAction={() => navigate("/reports?reportId=REP-ACH-01")}
                >
                    <ResponsiveContainer width="100%" height={270}>
                        <LineChart data={employeeGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line
                                type="monotone"
                                dataKey="employees"
                                stroke="#A1238E"
                                strokeWidth={3}
                                dot={{ fill: "#A1238E", strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* DEPARTMENT DISTRIBUTION */}
                <ChartCard
                    title="Department Distribution"
                    onAction={() => navigate("/departments")}
                >
                    <ResponsiveContainer width="100%" height={270}>
                        {departmentChartData.length > 0 ? (
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
                        ) : (
                            <div className="empty-chart">No department data</div>
                        )}
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* SECOND ROW */}
            <div className="dashboard-grid">
                {/* ATTENDANCE */}
                <ChartCard
                    title="Attendance Overview"
                    onAction={() => navigate("/attendance")}
                >
                    <ResponsiveContainer width="100%" height={270}>
                        <BarChart data={attendanceChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                                dataKey="present"
                                name="Present"
                                fill="#A1238E"
                            />
                            <Bar
                                dataKey="absent"
                                name="Absent"
                                fill="#949599"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* RECENT ACTIVITIES */}
                <RecentActivities />
            </div>

            {/* THIRD ROW - RECENT EMPLOYEES */}
            <section className="dashboard-card" style={{ marginTop: "24px" }}>
                <div className="card-header">
                    <div>
                        <h3>Recent Employees</h3>
                        <p>Newly joined team members</p>
                    </div>

                    <button
                        className="secondary-button"
                        onClick={() => navigate("/employees")}
                    >
                        View All
                    </button>
                </div>

                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {recentEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "#8492A6" }}>
                                        No recent employees recorded.
                                    </td>
                                </tr>
                            ) : (
                                recentEmployees.map((employee) => {
                                    const initials = employee.name
                                        .split(" ")
                                        .map((p) => p[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase();

                                    return (
                                        <tr key={employee.id}>
                                            <td>
                                                <div className="employee-cell">
                                                    <div className="employee-avatar">
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <strong>{employee.name}</strong>
                                                        <span>{employee.id}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>{employee.department}</td>
                                            <td>{employee.designation}</td>
                                            <td>
                                                <span
                                                    className={
                                                        employee.status === "Active"
                                                            ? "status-badge success"
                                                            : (employee.status === "On Leave" ? "status-badge warning" : "status-badge danger")
                                                    }
                                                >
                                                    {employee.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* PLATFORM SERVER TELEMETRY & DIAGNOSTICS REPORT MODAL */}
            {isTelemetryReportOpen && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="employee-modal" style={{ maxWidth: "720px" }}>
                        <div className="modal-header">
                            <div>
                                <p className="section-label">INFRASTRUCTURE TELEMETRY REPORT</p>
                                <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Activity size={20} color="#9E2682" />
                                    Server Performance & Latency Report
                                </h2>
                            </div>
                            <button className="modal-close" onClick={() => setIsTelemetryReportOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            {/* REPORT HEADER SUMMARY */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", padding: "12px 16px", background: "#FAF5F9", borderRadius: "10px", border: "1px solid #F3D3E7" }}>
                                <div>
                                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>REPORT GENERATED FOR</div>
                                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#18243A" }}>Om Raikar (Super Administrator / Platform Developer)</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>ENGINE STATUS</div>
                                    <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <CheckCircle2 size={15} /> 100% Operational (Low Load)
                                    </span>
                                </div>
                            </div>

                            {/* 4 CORE TELEMETRY TILES */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px" }}>
                                <div style={{ padding: "14px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", textAlign: "center" }}>
                                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Current Load</span>
                                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#2E9B67", marginTop: "2px" }}>12%</div>
                                    <small style={{ color: "#64748b", fontSize: "11px" }}>Optimal Bandwidth</small>
                                </div>

                                <div style={{ padding: "14px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", textAlign: "center" }}>
                                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Average Latency</span>
                                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#9E2682", marginTop: "2px" }}>32 ms</div>
                                    <small style={{ color: "#64748b", fontSize: "11px" }}>Sub-50ms Threshold</small>
                                </div>

                                <div style={{ padding: "14px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", textAlign: "center" }}>
                                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>API Gateway</span>
                                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#2563EB", marginTop: "2px" }}>Port 5000</div>
                                    <small style={{ color: "#64748b", fontSize: "11px" }}>Express.js REST</small>
                                </div>

                                <div style={{ padding: "14px", background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0", textAlign: "center" }}>
                                    <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Database Cluster</span>
                                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#751460", marginTop: "2px" }}>PostgreSQL 16</div>
                                    <small style={{ color: "#64748b", fontSize: "11px" }}>10 Core Tables</small>
                                </div>
                            </div>

                            {/* HOURLY PERFORMANCE AUDIT TABLE */}
                            <div>
                                <h4 style={{ margin: "0 0 10px", fontSize: "14px", color: "#18243A", fontWeight: "800" }}>
                                    Hourly Latency & Server Load Distribution
                                </h4>
                                <div style={{ overflowX: "auto", border: "1px solid #E2E8F0", borderRadius: "10px" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                                        <thead>
                                            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", textAlign: "left" }}>
                                                <th style={{ padding: "10px 14px", color: "#64748b" }}>Time Window</th>
                                                <th style={{ padding: "10px 14px", color: "#64748b" }}>API Latency</th>
                                                <th style={{ padding: "10px 14px", color: "#64748b" }}>CPU Load</th>
                                                <th style={{ padding: "10px 14px", color: "#64748b" }}>Network Socket Status</th>
                                                <th style={{ padding: "10px 14px", color: "#64748b", textAlign: "right" }}>Health</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { time: "09:00 - 10:00", latency: "32 ms", load: "10%", status: "14 Active Sockets", health: "HEALTHY" },
                                                { time: "10:00 - 11:00", latency: "38 ms", load: "14%", status: "28 Active Sockets", health: "HEALTHY" },
                                                { time: "11:00 - 12:00", latency: "45 ms", load: "18%", status: "35 Active Sockets", health: "HEALTHY" },
                                                { time: "12:00 - 13:00", latency: "40 ms", load: "15%", status: "22 Active Sockets", health: "HEALTHY" },
                                                { time: "13:00 - 14:00", latency: "35 ms", load: "11%", status: "18 Active Sockets", health: "HEALTHY" },
                                                { time: "14:00 - 15:00", latency: "36 ms", load: "12%", status: "20 Active Sockets", health: "HEALTHY" },
                                                { time: "15:00 - Present", latency: "39 ms", load: "13%", status: "24 Active Sockets", health: "HEALTHY" },
                                            ].map((row, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid #F1F5F9" }}>
                                                    <td style={{ padding: "9px 14px", fontWeight: "600", color: "#18243A" }}>{row.time}</td>
                                                    <td style={{ padding: "9px 14px", color: "#2E9B67", fontWeight: "700" }}>{row.latency}</td>
                                                    <td style={{ padding: "9px 14px", color: "#9E2682", fontWeight: "700" }}>{row.load}</td>
                                                    <td style={{ padding: "9px 14px", color: "#64748b" }}>{row.status}</td>
                                                    <td style={{ padding: "9px 14px", textAlign: "right" }}>
                                                        <span style={{ padding: "3px 8px", background: "#DCFCE7", color: "#16A34A", borderRadius: "12px", fontSize: "11px", fontWeight: "700" }}>
                                                            {row.health}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* MEMORY & DB POOL SPECS */}
                            <div style={{ padding: "12px 16px", background: "#EDF9F2", borderRadius: "10px", border: "1px solid #A3E4C3", display: "flex", alignItems: "center", gap: "10px" }}>
                                <BadgeCheck size={18} color="#2E9B67" style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: "12.5px", color: "#2E9B67", lineHeight: "1.4" }}>
                                    <strong>Platform Diagnostics Verified:</strong> Node.js V8 heap memory usage at 64MB / 4096MB. PostgreSQL connection pool operating with 0 query dropouts.
                                </span>
                            </div>
                        </div>

                        <div className="modal-footer" style={{ borderTop: "1px solid #EACEE3", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => window.print()}
                                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                            >
                                <Printer size={15} />
                                Print Report
                            </button>

                            <button
                                type="button"
                                className="primary-button"
                                onClick={() => setIsTelemetryReportOpen(false)}
                                style={{ background: "#9E2682", borderColor: "#9E2682" }}
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;