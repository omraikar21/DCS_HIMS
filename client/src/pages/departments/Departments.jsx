import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import {
    Plus,
    Building2,
    Users,
    Shield,
    ArrowRight,
    UserCheck,
    Search,
} from "lucide-react";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentCodeAndId,
} from "../../services/departmentService";

import { getEmployees } from "../../services/employeeService";

import DepartmentFilters
    from "../../components/departments/DepartmentFilters";

import DepartmentTable
    from "../../components/departments/DepartmentTable";

import DepartmentModal
    from "../../components/departments/DepartmentModal";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

function Departments() {
    const navigate = useNavigate();
    const { user, role } = useAuth();
    const notification = useNotification();
    const userRole = (role || "").toUpperCase();
    const isTeamLead = userRole === "TEAM_LEAD";
    const canManageDepartments = ["ADMIN", "HR"].includes(userRole);
    const [deleteConfirmDept, setDeleteConfirmDept] = useState(null);

    const [departments, setDepartments] =
        useState([]);

    const [employees, setEmployees] =
        useState([]);

    const [_loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [location, setLocation] =
        useState("All Locations");

    const [status, setStatus] =
        useState("All Status");

    const [modalOpen, setModalOpen] =
        useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState(null);

    const mapDepartmentToUI = (dept) => {
        const { uniqueId, badgeCode } = getDepartmentCodeAndId(dept.name, dept.id);
        return {
            id: uniqueId,
            databaseId: dept.id,
            name: dept.name || "",
            code: badgeCode,
            employees: Number(dept.employee_count || 0),
            allocatedAdmin: dept.allocated_admin || dept.department_head || "Unassigned",
            allocatedUser: dept.allocated_user || dept.department_head || "Unassigned",
            status: dept.is_active !== false ? "Active" : "Inactive",
        };
    };

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const [deptData, empData] = await Promise.all([
                getDepartments().catch(() => []),
                getEmployees().catch(() => []),
            ]);

            const mapped = (deptData || []).map(mapDepartmentToUI);
            setDepartments(mapped);
            setEmployees(Array.isArray(empData) ? empData : []);
        } catch (err) {
            console.error("Failed to load department data:", err);
            setError(err.message || "Failed to load department data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Resolve this Team Lead's department
    const myLeadDepartment = useMemo(() => {
        if (!isTeamLead) return null;
        const userName = (user?.name || "").toLowerCase().trim();
        const userEmail = (user?.email || "").toLowerCase().trim();

        return departments.find((d) => {
            const admin = (d.allocatedAdmin || "").toLowerCase().trim();
            const userAlloc = (d.allocatedUser || "").toLowerCase().trim();
            return (
                (admin && (admin === userName || admin === userEmail)) ||
                (userAlloc && (userAlloc === userName || userAlloc === userEmail)) ||
                (user?.department_id && d.databaseId === user.department_id) ||
                (user?.department && d.name?.toLowerCase().trim() === user.department?.toLowerCase().trim())
            );
        }) || departments[0] || null;
    }, [isTeamLead, departments, user]);

    // Team Lead: Employees belonging strictly to this department
    const myDepartmentMembers = useMemo(() => {
        if (!isTeamLead || !myLeadDepartment) return [];
        const targetDeptName = myLeadDepartment.name.toLowerCase().trim();
        const targetDeptId = myLeadDepartment.databaseId;

        return employees.filter((emp) => {
            const empDept = (emp.department || emp.department_name || "").toLowerCase().trim();
            const empDeptId = emp.department_id;
            const empCode = (emp.employee_code || "").toUpperCase().trim();
            const empDesig = (emp.designation || "").toLowerCase().trim();

            // Finance personnel belong exclusively to Finance
            if (empCode.startsWith("DCS-FIN") || empDesig.includes("finance") || empDept.includes("finance")) {
                return targetDeptName.includes("finance");
            }

            // HR personnel belong exclusively to HR
            if (empCode.startsWith("DCS-HR") || empDesig.includes("hr manager") || empDept.includes("human resources")) {
                return targetDeptName.includes("human") || targetDeptName.includes("hr");
            }

            return (
                (targetDeptId && empDeptId && Number(targetDeptId) === Number(empDeptId)) ||
                empDept.includes(targetDeptName) ||
                targetDeptName.includes(empDept)
            );
        });
    }, [isTeamLead, myLeadDepartment, employees]);

    const filteredMembers = useMemo(() => {
        if (!search) return myDepartmentMembers;
        const s = search.toLowerCase();
        return myDepartmentMembers.filter((m) => {
            const name = `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase();
            const code = (m.employee_code || "").toLowerCase();
            const email = (m.email || "").toLowerCase();
            const desig = (m.designation || "").toLowerCase();
            return name.includes(s) || code.includes(s) || email.includes(s) || desig.includes(s);
        });
    }, [myDepartmentMembers, search]);

    const filteredDepartments = useMemo(() => {
        return departments.filter((department) => {
            const searchText = search.toLowerCase();
            const matchesSearch =
                department.name.toLowerCase().includes(searchText) ||
                department.code.toLowerCase().includes(searchText);

            const matchesLocation =
                location === "All Locations" || department.location === location;

            const matchesStatus =
                status === "All Status" || department.status === status;

            return matchesSearch && matchesLocation && matchesStatus;
        });
    }, [departments, search, location, status]);

    const handleAdd = () => {
        setSelectedDepartment(null);
        setModalOpen(true);
    };

    const handleEdit = (department) => {
        setSelectedDepartment(department);
        setModalOpen(true);
    };

    const handleView = (department) => {
        navigate(`/departments/${department.databaseId || department.id}`);
    };

    const handleDeleteDepartment = (department) => {
        setDeleteConfirmDept(department);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmDept) return;
        try {
            setLoading(true);
            await deleteDepartment(deleteConfirmDept.databaseId || deleteConfirmDept.id);
            if (notification?.success) {
                notification.success(`Department "${deleteConfirmDept.name}" deleted successfully.`);
            }
            setDeleteConfirmDept(null);
            await loadData();
        } catch (err) {
            console.error("Failed to delete department:", err);
            if (notification?.error) {
                notification.error(err.message || "Failed to delete department");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            setLoading(true);
            setError("");

            const payload = {
                name: formData.name,
                description: formData.description || "",
                isActive: formData.status !== "Inactive",
            };

            if (selectedDepartment) {
                await updateDepartment(
                    selectedDepartment.databaseId || selectedDepartment.id,
                    payload
                );
                if (notification?.success) {
                    notification.success("Department updated successfully!");
                }
            } else {
                await createDepartment(payload);
                if (notification?.success) {
                    notification.success("Department created successfully!");
                }
            }

            await loadData();
            setModalOpen(false);
            setSelectedDepartment(null);
        } catch (err) {
            console.error("Failed to save department:", err);
            setError(err.message || "Failed to save department");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // TEAM LEAD VIEW: DIRECT DEPARTMENT MEMBERS
    // ==========================================
    if (isTeamLead) {
        const deptName = myLeadDepartment?.name || "AIML";

        return (
            <div className="departments-page">
                {/* PAGE HEADER */}
                <div className="module-heading">
                    <div>
                        <p className="section-label">
                            DEPARTMENT TEAM MANAGEMENT
                        </p>
                        <h1>
                            My Team ({deptName})
                        </h1>
                        <p>
                            Direct roster and active personnel assigned under your {deptName} department leadership.
                        </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                            style={{
                                padding: "6px 14px",
                                background: "#FFF0F7",
                                color: "#DB2777",
                                border: "1.5px solid #FCE7F3",
                                borderRadius: "20px",
                                fontSize: "12.5px",
                                fontWeight: "800",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                            }}
                        >
                            <Shield size={15} /> Lead: {user?.name || "Team Lead"}
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="dashboard-card">
                        <p style={{ color: "#e11d48" }}>{error}</p>
                    </div>
                )}

                {/* SUMMARY STATS FOR TEAM LEAD */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "16px",
                        marginBottom: "20px",
                    }}
                >
                    <div className="dashboard-card" style={{ padding: "18px 22px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Department Team</span>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#FFF0F7", color: "#DB2777", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Users size={16} />
                            </div>
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: "900", color: "#0F172A" }}>
                            {String(myDepartmentMembers.length).padStart(2, "0")}
                        </div>
                        <span style={{ fontSize: "12px", color: "#DB2777", marginTop: "2px", display: "block", fontWeight: "700" }}>
                            {deptName} Assigned Members
                        </span>
                    </div>

                    <div className="dashboard-card" style={{ padding: "18px 22px", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <span style={{ fontSize: "11.5px", color: "#64748B", fontWeight: "700", textTransform: "uppercase" }}>Department Status</span>
                            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#ECFDF5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <UserCheck size={16} />
                            </div>
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: "900", color: "#059669" }}>
                            Active
                        </div>
                        <span style={{ fontSize: "12px", color: "#059669", marginTop: "2px", display: "block", fontWeight: "700" }}>
                            Operational & Monitored
                        </span>
                    </div>
                </div>

                {/* SEARCH FILTER */}
                <section className="dashboard-card" style={{ padding: "20px 24px", marginBottom: "20px" }}>
                    <div style={{ position: "relative", maxWidth: "420px" }}>
                        <Search
                            size={16}
                            style={{
                                position: "absolute",
                                left: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#94A3B8",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search team member by name, code, or role..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "10px 14px 10px 38px",
                                borderRadius: "10px",
                                border: "1.5px solid #E2E8F0",
                                fontSize: "13px",
                                outline: "none",
                            }}
                        />
                    </div>
                </section>

                {/* MEMBERS ROSTER TABLE */}
                <section className="dashboard-card" style={{ padding: "24px" }}>
                    <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "17px", color: "#0F172A", fontWeight: "800" }}>
                                {deptName} Team Personnel ({filteredMembers.length})
                            </h3>
                            <p style={{ margin: "2px 0 0", fontSize: "12.5px", color: "#64748B" }}>
                                Active staff members working under {deptName}.
                            </p>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>MEMBER</th>
                                    <th>EMP CODE</th>
                                    <th>DESIGNATION</th>
                                    <th>EMAIL</th>
                                    <th>STATUS</th>
                                    <th>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", padding: "36px", color: "#8492A6" }}>
                                            <Users size={32} color="#CBD5E1" style={{ margin: "0 auto 8px auto" }} />
                                            <strong style={{ display: "block", color: "#475569" }}>No members found</strong>
                                            <span style={{ fontSize: "12px" }}>No employees currently assigned to {deptName}.</span>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((emp) => {
                                        const fullName = emp.first_name ? `${emp.first_name} ${emp.last_name || ""}`.trim() : (emp.name || "Employee");
                                        const initials = (emp.first_name?.[0] || emp.name?.[0] || "E").toUpperCase();

                                        return (
                                            <tr key={emp.id || emp.databaseId}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                        <div
                                                            style={{
                                                                width: "36px",
                                                                height: "36px",
                                                                borderRadius: "50%",
                                                                background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                                                                color: "#FFFFFF",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                fontWeight: "700",
                                                                fontSize: "13px",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <strong style={{ fontSize: "13.5px", color: "#0F172A", display: "block" }}>
                                                                {fullName}
                                                            </strong>
                                                            <span style={{ fontSize: "11.5px", color: "#64748B" }}>
                                                                {emp.department_name || deptName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ padding: "3px 8px", background: "#F1F5F9", borderRadius: "6px", fontSize: "11.5px", fontWeight: "700", color: "#475569" }}>
                                                        {emp.employee_code || `EMP-${emp.id}`}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: "13px", color: "#1E293B", fontWeight: "600" }}>
                                                        {emp.designation || "Staff Engineer"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: "12.5px", color: "#475569" }}>
                                                        {emp.email || "-"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        style={{
                                                            padding: "3px 8px",
                                                            borderRadius: "6px",
                                                            fontSize: "11px",
                                                            fontWeight: "700",
                                                            background: "#ECFDF5",
                                                            color: "#059669",
                                                            border: "1px solid #A7F3D0",
                                                        }}
                                                    >
                                                        Active
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        onClick={() => navigate(`/employees/${emp.id || emp.databaseId}`)}
                                                        style={{
                                                            padding: "5px 12px",
                                                            borderRadius: "6px",
                                                            border: "1px solid #FCE7F3",
                                                            background: "#FFF8FB",
                                                            color: "#DB2777",
                                                            fontSize: "11.5px",
                                                            fontWeight: "700",
                                                            cursor: "pointer",
                                                            display: "inline-flex",
                                                            alignItems: "center",
                                                            gap: "4px",
                                                        }}
                                                    >
                                                        View Profile <ArrowRight size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        );
    }

    // ==========================================
    // ADMIN / HR VIEW: FULL ENTERPRISE DEPARTMENTS
    // ==========================================
    return (
        <div className="departments-page">
            {/* PAGE HEADER */}
            <div className="module-heading">
                <div>
                    <p className="section-label">
                        ORGANIZATION
                    </p>
                    <h1>
                        Departments
                    </h1>
                    <p>
                        Manage departments and organizational teams.
                    </p>
                </div>

                {canManageDepartments && (
                    <button
                        className="primary-button"
                        onClick={handleAdd}
                    >
                        <Plus size={17} />
                        Add Department
                    </button>
                )}
            </div>

            {error && (
                <div className="dashboard-card">
                    <p style={{ color: "#e11d48" }}>{error}</p>
                </div>
            )}

            {/* SUMMARY */}
            <div className="department-summary">
                <div className="summary-icon">
                    <Building2 size={20} />
                </div>
                <div>
                    <strong>
                        {filteredDepartments.length}
                    </strong>
                    <span>
                        Departments displayed
                    </span>
                </div>
            </div>

            {/* TABLE */}
            <section className="dashboard-card">
                <DepartmentFilters
                    search={search}
                    setSearch={setSearch}
                    location={location}
                    setLocation={setLocation}
                    status={status}
                    setStatus={setStatus}
                    departments={departments}
                />

                <DepartmentTable
                    departments={filteredDepartments}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteDepartment}
                />
            </section>

            {/* MODAL */}
            <DepartmentModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setSelectedDepartment(null);
                }}
                onSave={handleSave}
                department={selectedDepartment}
            />

            {/* DELETE CONFIRM DIALOG */}
            <ConfirmDialog
                open={Boolean(deleteConfirmDept)}
                title="Delete Department?"
                message={`Are you sure you want to delete "${deleteConfirmDept?.name}"? Any assigned employees will become unassigned.`}
                confirmText="Delete Department"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirmDept(null)}
            />
        </div>
    );
}

export default Departments;
