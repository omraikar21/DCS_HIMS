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
    const canEditAttendance = ["ADMIN", "HR"].includes((role || "").toUpperCase());
    const isEmployee = (role || "").toUpperCase() === "EMPLOYEE";

    const [records, setRecords] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [department, setDepartment] =
        useState("All Departments");

    const [status, setStatus] =
        useState("All Status");

    const [date, setDate] =
        useState(new Date().toISOString().slice(0, 10));

    const [modalOpen, setModalOpen] =
        useState(false);

    const [selectedRecord, setSelectedRecord] =
        useState(null);

    const mapAttendanceToUI = (rec) => {
        const rawDate = rec.attendance_date || rec.date;
        const dateStr = rawDate ? (typeof rawDate === "string" ? rawDate.slice(0, 10) : new Date(rawDate).toISOString().slice(0, 10)) : new Date().toISOString().slice(0, 10);
        const empName = `${rec.first_name || ""} ${rec.last_name || ""}`.trim() || rec.employee_code || "Unknown Employee";
        return {
            id: rec.id,
            employeeId: rec.employee_code || `EMP-${rec.employee_id}`,
            employeeName: empName,
            department: rec.department_name || "General",
            date: dateStr,
            checkIn: rec.check_in || "--:--",
            checkOut: rec.check_out || "--:--",
            workHours: rec.work_hours ? `${rec.work_hours} hrs` : "0.0 hrs",
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
            if (mapped.length > 0 && !mapped.some(r => r.date === date)) {
                setDate(mapped[0].date);
            }
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

    const filteredRecords =
        useMemo(() => {

            return records.filter(
                (record) => {

                    // If logged in as employee, only show own records
                    if (isEmployee && user?.name) {
                        const employeeNameMatch = record.employeeName.toLowerCase().includes(user.name.toLowerCase()) ||
                            user.name.toLowerCase().includes(record.employeeName.toLowerCase());
                        if (!employeeNameMatch) return false;
                    }

                    const searchText =
                        search.toLowerCase();


                    const matchesSearch =
                        record.employeeName
                            .toLowerCase()
                            .includes(searchText) ||

                        record.employeeId
                            .toLowerCase()
                            .includes(searchText);


                    const matchesDepartment =
                        department ===
                        "All Departments" ||
                        record.department ===
                        department;


                    const matchesStatus =
                        status === "All Status" ||
                        record.status ===
                        status;


                    const matchesDate =
                        !date || record.date === date;


                    return (
                        matchesSearch &&
                        matchesDepartment &&
                        matchesStatus &&
                        matchesDate
                    );

                }
            );

        }, [
            records,
            search,
            department,
            status,
            date,
            isEmployee,
            user,
        ]);

    /* WEEKLY CHART DATA COMPUTATION FROM LIVE RECORDS */

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
                const dayIndex = new Date(rec.date).getDay(); // 0 Sun, 1 Mon, etc.
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


    /* EDIT */

    const handleEdit = (
        record
    ) => {

        setSelectedRecord(record);

        setModalOpen(true);

    };


    /* SAVE */

    const handleSave = async (
        formData
    ) => {
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
                        TIME & ATTENDANCE
                    </p>

                    <h1>
                        Attendance
                    </h1>

                    <p>
                        Track employee attendance
                        and working hours.
                    </p>

                </div>

            </div>

            {error && (
                <div className="dashboard-card">
                    <p style={{ color: "#e11d48" }}>{error}</p>
                </div>
            )}


            {/* SUMMARY */}

            <AttendanceSummary
                records={filteredRecords}
            />


            {/* FILTERS + TABLE */}

            <section className="dashboard-card">

                <div className="attendance-section-header">

                    <div>

                        <h3>
                            Daily Attendance
                        </h3>

                        <p>
                            View and update employee
                            attendance.
                        </p>

                    </div>

                    <div className="attendance-date-label">

                        <CalendarCheck size={16} />

                        {date}

                    </div>

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
                />


                <AttendanceTable
                    records={filteredRecords}
                    onEdit={handleEdit}
                    canEdit={canEditAttendance}
                />

            </section>


            {/* WEEKLY GRAPH */}

            <div className="attendance-chart-section">

                <ChartCard
                    title="Weekly Attendance Overview"
                    action="This Week"
                >

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <BarChart
                            data={weeklyChartData}
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
                                fill="#D9534F"
                                radius={[
                                    5,
                                    5,
                                    0,
                                    0,
                                ]}
                            />

                            <Bar
                                dataKey="late"
                                name="Late"
                                fill="#F0A500"
                                radius={[
                                    5,
                                    5,
                                    0,
                                    0,
                                ]}
                            />

                            <Bar
                                dataKey="leave"
                                name="Leave"
                                fill="#2563EB"
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

            </div>


            {/* MODAL */}

            <AttendanceModal
                isOpen={modalOpen}
                onClose={() => {

                    setModalOpen(false);

                    setSelectedRecord(null);

                }}
                onSave={handleSave}
                record={selectedRecord}
            />

        </div>
    );
}

export default Attendance;