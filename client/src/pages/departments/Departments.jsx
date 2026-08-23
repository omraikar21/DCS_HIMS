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
} from "lucide-react";

import {
    getDepartments,
    createDepartment,
    updateDepartment,
    getDepartmentCodeAndId,
} from "../../services/departmentService";

import DepartmentFilters
    from "../../components/departments/DepartmentFilters";

import DepartmentTable
    from "../../components/departments/DepartmentTable";

import DepartmentModal
    from "../../components/departments/DepartmentModal";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

function Departments() {
    const navigate = useNavigate();
    const { role } = useAuth();
    const notification = useNotification();
    const canManageDepartments = ["ADMIN", "HR"].includes((role || "").toUpperCase());

    const [departments, setDepartments] =
        useState([]);

    const [loading, setLoading] =
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
            location: dept.location || "Main Office",
            description: dept.description || "",
            status: dept.is_active !== false ? "Active" : "Inactive",
        };
    };

    const loadDepartments = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getDepartments();
            const mapped = (data || []).map(mapDepartmentToUI);
            setDepartments(mapped);
        } catch (err) {
            console.error("Failed to load departments:", err);
            setError(err.message || "Failed to load departments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const filteredDepartments =
        useMemo(() => {

            return departments.filter(
                (department) => {

                    const searchText =
                        search.toLowerCase();

                    const matchesSearch =
                        department.name
                            .toLowerCase()
                            .includes(searchText) ||

                        department.code
                            .toLowerCase()
                            .includes(searchText);



                    const matchesLocation =
                        location ===
                        "All Locations" ||
                        department.location ===
                        location;


                    const matchesStatus =
                        status === "All Status" ||
                        department.status ===
                        status;


                    return (
                        matchesSearch &&
                        matchesLocation &&
                        matchesStatus
                    );

                }
            );

        }, [
            departments,
            search,
            location,
            status,
        ]);


    const handleAdd = () => {

        setSelectedDepartment(null);

        setModalOpen(true);

    };


    const handleEdit = (
        department
    ) => {

        setSelectedDepartment(
            department
        );

        setModalOpen(true);

    };


    const handleView = (department) => {
        navigate(`/departments/${department.databaseId || department.id}`);
    };


    const handleSave = async (
        formData
    ) => {
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

            await loadDepartments();
            setModalOpen(false);
            setSelectedDepartment(null);
        } catch (err) {
            console.error("Failed to save department:", err);
            setError(err.message || "Failed to save department");
        } finally {
            setLoading(false);
        }
    };


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
                        Manage departments and
                        organizational teams.
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
                    departments={
                        filteredDepartments
                    }
                    onView={handleView}
                    onEdit={handleEdit}
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
                department={
                    selectedDepartment
                }
            />

        </div>
    );
}

export default Departments;