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
    UserCircle,
    Building2,
} from "lucide-react";

import {
    getDepartment,
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
                    setDepartment({
                        id: `DCS-DEPT-${String(data.id).padStart(3, "0")}`,
                        databaseId: data.id,
                        name: data.name || "",
                        code: data.name ? data.name.slice(0, 4).toUpperCase() : "DEPT",
                        employees: Number(data.employee_count || 0),
                        location: "Hubballi",
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
            <div className="dashboard-card">
                <p>Loading department details...</p>
            </div>
        );
    }

    if (error || !department) {

        return (
            <div className="dashboard-card">

                <h2>
                    Department not found
                </h2>

                <p>{error}</p>

                <button
                    className="primary-button"
                    onClick={() =>
                        navigate("/departments")
                    }
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
                onClick={() =>
                    navigate("/departments")
                }
            >

                <ArrowLeft size={16} />

                Back to Departments

            </button>


            {/* HEADER */}

            <div className="department-profile-header">

                <div className="department-profile-icon">

                    <Building2 size={30} />

                </div>


                <div>

                    <p className="section-label">
                        DEPARTMENT PROFILE
                    </p>

                    <h1>
                        {department.name}
                    </h1>

                    <p>
                        {department.code}
                        {" · "}
                        {department.location}
                    </p>

                    <span
                        className={`status-badge ${department.status ===
                                "Active"
                                ? "success"
                                : "danger"
                            }`}
                    >
                        {department.status}
                    </span>

                </div>

            </div>


            {/* DETAILS */}

            <div className="profile-details-grid">

                <div className="dashboard-card">

                    <h3>
                        Department Information
                    </h3>


                    <div className="profile-detail-list">



                        <p>

                            <Users size={17} />

                            <span>
                                {department.employees}
                                {" "}
                                Employees
                            </span>

                        </p>


                        <p>

                            <MapPin size={17} />

                            <span>
                                {department.location}
                            </span>

                        </p>

                    </div>

                </div>


                <div className="dashboard-card">

                    <h3>
                        Description
                    </h3>

                    <p className="department-description">
                        {department.description}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default DepartmentProfile;