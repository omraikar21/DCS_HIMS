import {
    useEffect,
    useState,
} from "react";

import {
    useParams,
    useNavigate,
} from "react-router-dom";

import {
    ArrowLeft,
    Users,
    MapPin,
    Mail,
    Calendar,
    Briefcase,
    ExternalLink,
} from "lucide-react";

import {
    getDepartment,
    getDepartmentCodeAndId,
} from "../../services/departmentService";

function DepartmentProfile() {

    const { id } =
        useParams();

    const navigate =
        useNavigate();

    const [department, setDepartment] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const loadDepartment = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getDepartment(id);
                if (data) {
                    const { uniqueId, badgeCode } = getDepartmentCodeAndId(data.name, data.id);
                    setDepartment({
                        id: uniqueId,
                        databaseId: data.id,
                        name: data.name || "",
                        code: badgeCode,
                        employees: Number(data.employee_count || 0),
                        employeesList: data.employees_list || [],
                        location: data.location || "Main Office",
                        description: data.description || "No description provided.",
                        status: data.is_active !== false ? "Active" : "Inactive",
                    });
                }

            } catch (err) {
                console.error("Failed to load department profile:", err);
                setError(err.message || "Department not found");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadDepartment();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="dashboard-card" style={{ padding: "40px", textAlign: "center" }}>
                <p style={{ color: "#64748B", fontSize: "14px" }}>Loading department details and employee roster...</p>
            </div>
        );
    }

    if (error || !department) {
        return (
            <div className="dashboard-card" style={{ padding: "40px", textAlign: "center" }}>
                <h2 style={{ fontSize: "20px", color: "#0F172A", marginBottom: "8px" }}>
                    Department not found
                </h2>
                <p style={{ color: "#64748B", marginBottom: "20px" }}>{error || "The requested department could not be located."}</p>
                <button
                    className="primary-button"
                    onClick={() => navigate("/departments")}
                >
                    Back to Departments
                </button>
            </div>
        );
    }

    return (
        <div className="department-profile-page">
            <button
                className="back-button"
                onClick={() => navigate("/departments")}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    color: "#9E2682",
                    fontWeight: "600",
                    fontSize: "13.5px",
                    cursor: "pointer",
                    marginBottom: "16px",
                }}
            >
                <ArrowLeft size={16} />
                Back to Departments
            </button>

            {/* HEADER */}
            <div
                className="department-profile-header"
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    background: "#FFFFFF",
                    padding: "20px 24px",
                    borderRadius: "14px",
                    border: "1px solid #E2E8F0",
                    marginBottom: "20px",
                }}
            >
                <div
                    style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #9E2682, #D946EF)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: "800",
                        fontSize: "18px",
                        letterSpacing: "0.5px",
                    }}
                >
                    {department.code}
                </div>

                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#9E2682", letterSpacing: "0.6px", textTransform: "uppercase", margin: 0 }}>
                        DEPARTMENT PROFILE & ROSTER
                    </p>
                    <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A", margin: "2px 0 4px" }}>
                        {department.name}
                    </h1>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", fontSize: "13px", color: "#64748B" }}>
                        <span style={{ fontWeight: "700", color: "#9E2682" }}>{department.id}</span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <MapPin size={14} /> {department.location}
                        </span>
                        <span>•</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                            <Users size={14} /> {department.employees} {department.employees === 1 ? "Employee" : "Employees"}
                        </span>
                    </div>
                </div>

                <span
                    className={`status-badge ${
                        department.status === "Active" ? "success" : "danger"
                    }`}
                    style={{ padding: "6px 14px", fontSize: "12.5px" }}
                >
                    {department.status}
                </span>
            </div>

            {/* DETAILS GRID */}
            <div className="profile-details-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px", marginBottom: "24px" }}>
                <div className="dashboard-card" style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <h3 style={{ fontSize: "14.5px", fontWeight: "700", color: "#0F172A", marginBottom: "14px" }}>
                        Overview
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#64748B" }}>Unique Code:</span>
                            <strong style={{ color: "#9E2682" }}>{department.id}</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#64748B" }}>Location:</span>
                            <span style={{ fontWeight: "600", color: "#0F172A" }}>{department.location}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ color: "#64748B" }}>Total Staff:</span>
                            <span style={{ fontWeight: "700", color: "#0F172A" }}>{department.employees}</span>
                        </div>
                    </div>
                </div>

                <div className="dashboard-card" style={{ background: "#FFFFFF", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <h3 style={{ fontSize: "14.5px", fontWeight: "700", color: "#0F172A", marginBottom: "14px" }}>
                        Department Description
                    </h3>
                    <p style={{ fontSize: "13.5px", color: "#475569", lineHeight: 1.6, margin: 0 }}>
                        {department.description || "No description provided."}
                    </p>
                </div>
            </div>

            {/* ATTACHED EMPLOYEES ROSTER */}
            <div className="dashboard-card" style={{ background: "#FFFFFF", padding: "24px", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                    <div>
                        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                            Department Employees & Team Members
                        </h3>
                        <p style={{ fontSize: "12.5px", color: "#64748B", margin: "3px 0 0" }}>
                            Active staff members assigned to {department.name} ({department.employeesList?.length || 0})
                        </p>
                    </div>
                </div>

                {(!department.employeesList || department.employeesList.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "36px 20px", background: "#F8FAFC", borderRadius: "10px", border: "1px dashed #CBD5E1" }}>
                        <Users size={36} style={{ color: "#94A3B8", marginBottom: "10px" }} />
                        <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#334155", margin: "0 0 4px" }}>
                            No Employees Assigned Yet
                        </h4>
                        <p style={{ fontSize: "12.5px", color: "#64748B", margin: "0 0 14px" }}>
                            There are currently no staff members linked to this department.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="department-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "1.5px solid #F1F5F9", textAlign: "left" }}>
                                    <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>
                                        Employee
                                    </th>
                                    <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>
                                        Designation
                                    </th>
                                    <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>
                                        Email Address
                                    </th>
                                    <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>
                                        Joining Date
                                    </th>
                                    <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase" }}>
                                        Status
                                    </th>
                                    <th style={{ padding: "10px 14px", fontSize: "11px", fontWeight: "700", color: "#475569", textTransform: "uppercase", textAlign: "right" }}>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {department.employeesList.map((emp) => {
                                    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Staff Member";
                                    const initials = ((emp.first_name?.[0] || "") + (emp.last_name?.[0] || "")).toUpperCase() || fullName.slice(0, 2).toUpperCase();
                                    const joinDateStr = emp.joining_date 
                                        ? new Date(emp.joining_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) 
                                        : "—";

                                    return (
                                        <tr key={emp.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                                            <td style={{ padding: "12px 14px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <div
                                                        style={{
                                                            width: "36px",
                                                            height: "36px",
                                                            borderRadius: "50%",
                                                            background: "#FCE7F3",
                                                            color: "#9E2682",
                                                            fontWeight: "700",
                                                            fontSize: "12.5px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <strong style={{ fontSize: "13.5px", color: "#0F172A", display: "block" }}>
                                                            {fullName}
                                                        </strong>
                                                        <span style={{ fontSize: "11px", color: "#94A3B8" }}>
                                                            {emp.employee_code || `EMP-${String(emp.id).padStart(4, "0")}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#334155" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                    <Briefcase size={14} style={{ color: "#94A3B8" }} />
                                                    {emp.designation || "Staff"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#475569" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                    <Mail size={14} style={{ color: "#94A3B8" }} />
                                                    {emp.email}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 14px", fontSize: "12.5px", color: "#64748B" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                    <Calendar size={14} style={{ color: "#94A3B8" }} />
                                                    {joinDateStr}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 14px" }}>
                                                <span
                                                    className={`status-badge ${
                                                        (emp.employment_status || "").toUpperCase() === "ACTIVE"
                                                            ? "success"
                                                            : (emp.employment_status || "").toUpperCase() === "ON_LEAVE"
                                                            ? "warning"
                                                            : "danger"
                                                    }`}
                                                    style={{ fontSize: "11px", padding: "3px 10px" }}
                                                >
                                                    {emp.employment_status || "Active"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "12px 14px", textAlign: "right" }}>
                                                <button
                                                    title="View Employee Profile"
                                                    onClick={() =>
                                                        navigate(
                                                            `/employees/${emp.id || emp.databaseId || emp.employee_code}`,
                                                            {
                                                                state: {
                                                                    fromDepartment: true,
                                                                    departmentId: id || department.databaseId || department.id,
                                                                    departmentName: department.name,
                                                                },
                                                            }
                                                        )
                                                    }
                                                    style={{
                                                        background: "#F8FAFC",
                                                        border: "1px solid #CBD5E1",
                                                        borderRadius: "6px",
                                                        padding: "5px 10px",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        color: "#9E2682",
                                                        cursor: "pointer",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                    }}
                                                >
                                                    Profile <ExternalLink size={12} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DepartmentProfile;