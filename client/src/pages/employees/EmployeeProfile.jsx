import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Building2,
} from "lucide-react";

import { getEmployee } from "../../services/employeeService";

function EmployeeProfile() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getEmployee(id);
        if (data) {
          const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Employee";
          const statusMap = {
            ACTIVE: "Active",
            INACTIVE: "Inactive",
            ON_LEAVE: "On Leave",
          };
          setEmployee({
            id: data.employee_code || `DCS-EMP-${String(data.id).padStart(3, "0")}`,
            databaseId: data.id,
            name: fullName,
            email: data.email || "",
            phone: data.phone || "",
            department: data.department_name || "General",
            designation: data.designation || "Staff",
            status: statusMap[data.employment_status] || "Active",
            joiningDate: data.joining_date ? String(data.joining_date).slice(0, 10) : "-",
            location: data.address || "-",
          });
        }
      } catch (err) {
        console.error("Failed to load employee profile:", err);
        setError(err.message || "Employee not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEmployee();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-card">
        <p>Loading employee details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="dashboard-card">
        <h2>Employee not found</h2>
        <p>{error}</p>

        <button
          className="primary-button"
          onClick={() =>
            navigate("/employees")
          }
        >
          Back to Employees
        </button>
      </div>
    );
  }

  const initials = employee.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="employee-profile-page">

      <button
        className="back-button"
        onClick={() =>
          navigate("/employees")
        }
      >
        <ArrowLeft size={16} />
        Back to Employees
      </button>


      <div className="employee-profile-header">

        <div className="profile-avatar large">
          {initials}
        </div>

        <div>

          <p className="section-label">
            EMPLOYEE PROFILE
          </p>

          <h1>
            {employee.name}
          </h1>

          <p>
            {employee.designation}
            {" · "}
            {employee.department}
          </p>

          <span
            className={`status-badge ${
              employee.status === "Active"
                ? "success"
                : employee.status === "On Leave"
                ? "warning"
                : "danger"
            }`}
          >
            {employee.status}
          </span>

        </div>

      </div>


      <div className="profile-details-grid">

        <div className="dashboard-card">

          <h3>
            Contact Information
          </h3>

          <div className="profile-detail-list">

            <p>
              <Mail size={17} />
              <span>
                {employee.email}
              </span>
            </p>

            <p>
              <Phone size={17} />
              <span>
                {employee.phone}
              </span>
            </p>

            <p>
              <MapPin size={17} />
              <span>
                {employee.location}
              </span>
            </p>

          </div>

        </div>


        <div className="dashboard-card">

          <h3>
            Employment Information
          </h3>

          <div className="profile-detail-list">

            <p>
              <Building2 size={17} />
              <span>
                {employee.department}
              </span>
            </p>

            <p>
              <CalendarDays size={17} />
              <span>
                Joined {employee.joiningDate}
              </span>
            </p>

            <p>
              <strong>
                Employee ID
              </strong>

              <span>
                {employee.id}
              </span>
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default EmployeeProfile;