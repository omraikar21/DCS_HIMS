import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarCheck,
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

import {
    getAttendance,
    updateAttendance,
} from "../../services/attendanceService";

import AttendanceSummary
    from "../../components/attendance/AttendanceSummary";

import AttendanceFilters
    from "../../components/attendance/AttendanceFilters";

import AttendanceTable
    from "../../components/attendance/AttendanceTable";

import AttendanceModal
    from "../../components/attendance/AttendanceModal";

import ChartCard
    from "../../components/dashboard/ChartCard";

import { useAuth } from "../../hooks/useAuth";

const statusToUI = {
    PRESENT: "Present",
    ABSENT: "Absent",
    LEAVE: "On Leave",
    HALF_DAY: "Half Day",
    WORK_FROM_HOME: "WFH",
};

const statusToBackend = {
    "Present": "PRESENT",
    "Absent": "ABSENT",
    "On Leave": "LEAVE",
    "Late": "PRESENT",
    "Half Day": "HALF_DAY",
    "WFH": "WORK_FROM_HOME",
};

function Attendance() {
    const { role, user } = useAuth();
    const isAdminOrHR = ["ADMIN", "HR"].includes((role || "").toUpperCase());
    const isSelfView = !isAdminOrHR;
    const canEditAttendance = isAdminOrHR;

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All Departments");
    const [status, setStatus] = useState("All Status");
    const defaultDate = "";
    const [date, setDate] = useState(defaultDate);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);

    const mapAttendanceToUI = (rec) => {
        const rawDate = rec.attendance_date || rec.date;
        const dateStr = rawDate ? (typeof rawDate === "string" ? rawDate.slice(0, 10) : new Date(rawDate).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10);
        const empName = `${rec.first_name || ""} ${rec.last_name || ""}`.trim() || rec.employee_code || "Unknown Employee";
        
        let calculatedHours = "0.0 hrs";
        if (rec.work_hours) {
            calculatedHours = `${rec.work_hours} hrs`;
        } else if (rec.check_in && rec.check_out) {
            const [hIn, mIn] = String(rec.check_in).split(":").map(Number);
            const [hOut, mOut] = String(rec.check_out).split(":").map(Number);
            const diff = (hOut + (mOut || 0) / 60) - (hIn + (mIn || 0) / 60);
            if (diff > 0) calculatedHours = `${diff.toFixed(1)} hrs`;
        } else if (rec.status === "PRESENT") {
            calculatedHours = "8.5 hrs";
        }

        return {
            id: rec.id,
            employeeId: rec.employee_code || `EMP-${rec.employee_id}`,
            employeeName: empName,
            department: rec.department_name || "General",
            date: dateStr,
            checkIn: rec.check_in || "--:--",
            checkOut: rec.check_out || "--:--",
            workHours: calculatedHours,
            status: statusToUI[rec.status] || rec.status || "Present",
            rawStatus: rec.status,
            remarks: rec.remarks || "",
        };
    };

    const loadAttendance = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getAttendance();
            const mapped = (data || []).map(mapAttendanceToUI);
            setRecords(mapped);
        } catch (err) {
            console.error("Failed to load attendance:", err);
            setError(err.message || "Failed to load attendance");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, []);

    /* FILTER RECORDS */
    const filteredRecords = useMemo(() => {
        return records.filter((record) => {
            if (isSelfView) {
                const matchesStatus = status === "All Status" || record.status === status;
                const matchesDate = !date || record.date === date;
                return matchesStatus && matchesDate;
            }

            const searchText = search.toLowerCase();
            const matchesSearch =
                record.employeeName.toLowerCase().includes(searchText) ||
                record.employeeId.toLowerCase().includes(searchText);

            const matchesDepartment =
                department === "All Departments" ||
                record.department === department;

            const matchesStatus =
                status === "All Status" ||
                record.status === status;

            const matchesDate = !date || record.date === date;

            return (
                matchesSearch &&
                matchesDepartment &&
                matchesStatus &&
                matchesDate
            );
        });
    }, [
        records,
        search,
        department,
        status,
        date,
        isSelfView,
    ]);

    /* WEEKLY CHART DATA FOR COMPANY (ADMIN/HR) */
    const weeklyChartData = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const counts = {
            Mon: { present: 0, absent: 0, late: 0, leave: 0 },
            Tue: { present: 0, absent: 0, late: 0, leave: 0 },
            Wed: { present: 0, absent: 0, late: 0, leave: 0 },
            Thu: { present: 0, absent: 0, late: 0, leave: 0 },
            Fri: { present: 0, absent: 0, late: 0, leave: 0 },
        };

        records.forEach((rec) => {
            if (rec.date) {
                const dayIndex = new Date(rec.date).getDay();
                const dayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
                if (counts[dayKey]) {
                    if (rec.status === "Present") counts[dayKey].present++;
                    else if (rec.status === "Absent") counts[dayKey].absent++;
                    else if (rec.status === "On Leave") counts[dayKey].leave++;
                    else counts[dayKey].late++;
                }
            }
        });

        return days.map((day) => ({
            day,
            present: counts[day].present || (records.filter(r => r.status === "Present").length),
            absent: counts[day].absent,
            late: counts[day].late,
            leave: counts[day].leave,
        }));
    }, [records]);

    /* WEEKLY WORKING HOURS CHART DATA FOR INDIVIDUAL (EMPLOYEE / FINANCE) */
    const myWeeklyHoursData = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
        const dayHours = { Mon: 8.5, Tue: 8.0, Wed: 8.5, Thu: 8.0, Fri: 8.5 };

        records.forEach((rec) => {
            if (rec.date) {
                const dayIndex = new Date(rec.date).getDay();
                const dayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
                if (dayHours[dayKey] !== undefined) {
                    const parsed = parseFloat(rec.workHours);
                    if (!isNaN(parsed) && parsed > 0) {
                        dayHours[dayKey] = parsed;
                    }
                }
            }
        });

        return days.map((day) => ({
            day,
            hours: dayHours[day],
        }));
    }, [records]);

    /* EDIT */
    const handleEdit = (record) => {
        setSelectedRecord(record);
        setModalOpen(true);
    };

    /* SAVE */
    const handleSave = async (formData) => {
        if (!selectedRecord) return;

        try {
            setLoading(true);
            setError("");

            const backendStatus = statusToBackend[formData.status] || "PRESENT";
            await updateAttendance(
                selectedRecord.databaseId || selectedRecord.id,
                {
                    status: backendStatus,
                    checkIn: formData.checkIn || null,
                    checkOut: formData.checkOut || null,
                }
            );

            await loadAttendance();
            setModalOpen(false);
            setSelectedRecord(null);
        } catch (err) {
            console.error("Failed to update attendance:", err);
            setError(err.message || "Failed to update attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="attendance-page">
            {/* HEADER */}
            <div className="module-heading">
                <div>
                    <p className="section-label">
                        {isSelfView ? "MY ATTENDANCE" : "TIME & ATTENDANCE"}
                    </p>
                    <h1>
                        {isSelfView ? "My Attendance" : "Attendance"}
                    </h1>
                    <p>
                        {isSelfView
                            ? "Track your personal attendance history, check-in details, and daily working hours."
                            : "Track employee attendance, monitor check-in/out times, and review working hours."}
                    </p>
                </div>
            </div>

            {error && (
                <div className="dashboard-card">
                    <p style={{ color: "#e11d48" }}>{error}</p>
                </div>
            )}

            {/* SUMMARY STAT CARDS */}
            <AttendanceSummary
                records={isSelfView ? records : filteredRecords}
                isSelfView={isSelfView}
            />

            {/* FILTERS + TABLE */}
            <section className="dashboard-card">
                <div className="attendance-section-header">
                    <div>
                        <h3>
                            {isSelfView ? "My Attendance Records" : "Daily Attendance"}
                        </h3>
                        <p>
                            {isSelfView
                                ? "View your personal check-in logs and status history."
                                : "View and update employee attendance across DCS."}
                        </p>
                    </div>

                    {date && (
                        <div className="attendance-date-label">
                            <CalendarCheck size={16} />
                            {date}
                        </div>
                    )}
                </div>

                <AttendanceFilters
                    search={search}
                    setSearch={setSearch}
                    department={department}
                    setDepartment={setDepartment}
                    status={status}
                    setStatus={setStatus}
                    date={date}
                    setDate={setDate}
                    defaultDate={defaultDate}
                    isSelfView={isSelfView}
                />

                <AttendanceTable
                    records={filteredRecords}
                    onEdit={handleEdit}
                    canEdit={canEditAttendance}
                    isSelfView={isSelfView}
                />
            </section>

            {/* CHART SECTION */}
            <div className="attendance-chart-section">
                {isSelfView ? (
                    <ChartCard
                        title="My Weekly Working Hours"
                        action="This Week"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={myWeeklyHoursData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis unit="h" domain={[0, 12]} />
                                <Tooltip formatter={(val) => [`${val} hrs`, "Working Hours"]} />
                                <Legend />
                                <Bar
                                    dataKey="hours"
                                    name="Working Hours"
                                    fill="#A1238E"
                                    radius={[5, 5, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                ) : (
                    <ChartCard
                        title="Weekly Attendance Overview"
                        action="This Week"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={weeklyChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    dataKey="present"
                                    name="Present"
                                    fill="#A1238E"
                                    radius={[5, 5, 0, 0]}
                                />
                                <Bar
                                    dataKey="absent"
                                    name="Absent"
                                    fill="#D9534F"
                                    radius={[5, 5, 0, 0]}
                                />
                                <Bar
                                    dataKey="late"
                                    name="Late"
                                    fill="#F0A500"
                                    radius={[5, 5, 0, 0]}
                                />
                                <Bar
                                    dataKey="leave"
                                    name="Leave"
                                    fill="#2563EB"
                                    radius={[5, 5, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>

            {/* MODAL (ADMIN / HR) */}
            {canEditAttendance && (
                <AttendanceModal
                    isOpen={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setSelectedRecord(null);
                    }}
                    onSave={handleSave}
                    record={selectedRecord}
                />
            )}
        </div>
    );
}

export default Attendance;