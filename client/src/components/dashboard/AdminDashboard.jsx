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
} from "recharts";

import StatCard from "../../components/dashboard/StatCard";
import ChartCard from "../../components/dashboard/ChartCard";
import RecentActivities from "../../components/dashboard/RecentActivities";
import ProfileHeader from "../../components/dashboard/ProfileHeader";
import CompanyAnnouncementsCard from "./CompanyAnnouncementsCard";

import { getDashboardData } from "../../services/dashboardService";

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

    const recentEmployeesList = useMemo(() => {
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
                        Here is what is happening
                        across DCS today.
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

                    <ResponsiveContainer
                        width="100%"
                        height={270}
                    >

                        <LineChart
                            data={employeeGrowthData}
                        >

                            <CartesianGrid
                                strokeDasharray="3 3"
                            />

                            <XAxis
                                dataKey="month"
                            />

                            <YAxis />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="employees"
                                stroke="#A1238E"
                                strokeWidth={3}
                                dot={{
                                    r: 4,
                                }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </ChartCard>


                {/* DEPARTMENT */}

                <ChartCard
                    title="Department Distribution"
                    onAction={() => navigate("/reports?reportId=REP-DEP-05")}
                >

                    {departmentChartData.length > 0 ? (
                        <ResponsiveContainer
                            width="100%"
                            height={270}
                        >
                            <PieChart>
                                <Pie
                                    data={departmentChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="45%"
                                    outerRadius={85}
                                    label
                                >
                                    {departmentChartData.map(
                                        (entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={
                                                    chartColors[
                                                    index %
                                                    chartColors.length
                                                    ]
                                                }
                                            />
                                        )
                                    )}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: "270px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94A3B8", textAlign: "center", padding: "20px" }}>
                            <Users size={36} style={{ marginBottom: "10px", opacity: 0.4 }} />
                            <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#64748B" }}>No Department Data</p>
                            <span style={{ fontSize: "12px", marginTop: "4px" }}>Add employees to see department distribution</span>
                        </div>
                    )}
                </ChartCard>

            </div>


            {/* SECOND ROW */}

            <div className="dashboard-grid">

                {/* ATTENDANCE */}

                <ChartCard
                    title="Attendance This Week"
                    onAction={() => navigate("/reports?reportId=REP-ATT-04")}
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

                            <Legend />

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


                {/* ACTIVITIES */}

                <RecentActivities />

            </div>


            {/* ANNOUNCEMENTS & BROADCASTS */}

            <CompanyAnnouncementsCard limit={3} />


            {/* EMPLOYEE TABLE */}

            <section className="dashboard-card employee-table-card">

                <div className="card-header">

                    <div>

                        <h3>
                            Employees
                        </h3>

                        <p>
                            Recently active DCS employees
                        </p>

                    </div>

                    <button
                        className="secondary-button"
                        onClick={() => {
                            window.location.href = "/employees";
                        }}
                    >
                        View all
                    </button>

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Employee
                                </th>

                                <th>
                                    Department
                                </th>

                                <th>
                                    Designation
                                </th>

                                <th>
                                    Status
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {recentEmployeesList.map(
                                (employee) => {

                                    const initials =
                                        employee.name
                                            .split(" ")
                                            .map(
                                                (name) =>
                                                    name[0]
                                            )
                                            .join("")
                                            .slice(0, 2);

                                    return (
                                        <tr
                                            key={employee.id}
                                        >

                                            <td>

                                                <div className="employee-cell">

                                                    <div className="employee-avatar">
                                                        {initials}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {employee.name}
                                                        </strong>

                                                        <span>
                                                            {employee.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>
                                                {employee.department}
                                            </td>


                                            <td>
                                                {employee.designation}
                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        employee.status ===
                                                            "Active"
                                                            ? "status-badge success"
                                                            : (employee.status === "On Leave" ? "status-badge warning" : "status-badge danger")
                                                    }
                                                >
                                                    {employee.status}
                                                </span>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
}

export default AdminDashboard;