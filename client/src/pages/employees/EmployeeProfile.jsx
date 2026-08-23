import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Building2,
  Trash2,
} from "lucide-react";

import { getEmployee, deleteEmployee } from "../../services/employeeService";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import ConfirmDialog from "../../components/common/ConfirmDialog";

function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const notification = useNotification();
  const canManage = ["ADMIN", "HR"].includes((role || "").toUpperCase());

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleDelete = () => {
    if (!employee) return;
    setConfirmOpen(true);
  };

  const confirmDeleteAction = async () => {
    if (!employee) return;
    try {
      setDeleting(true);
      await deleteEmployee(employee.databaseId);
      if (notification?.success) {
        notification.success(`Employee ${employee.name} deleted successfully.`);
      }
      navigate("/employees");
    } catch (err) {
      console.error("Delete employee error:", err);
      if (notification?.error) {
        notification.error(err.message || "Failed to delete employee");
      } else {
        alert(err.message || "Failed to delete employee");
      }
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button
          className="back-button"
          onClick={() =>
            navigate("/employees")
          }
        >
          <ArrowLeft size={16} />
          Back to Employees
        </button>

        {canManage && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              backgroundColor: "#fff1f2",
              color: "#e11d48",
              border: "1px solid #fecdd3",
              padding: "9px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13.5px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete / Offboard Employee"}
          </button>
        )}
      </div>

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

      <ConfirmDialog
        open={confirmOpen}
        title="Delete Employee Profile?"
        message={`Are you sure you want to offboard and permanently delete ${employee?.name} (${employee?.id})? This action cannot be undone.`}
        confirmText="Delete Profile"
        cancelText="Cancel"
        onConfirm={confirmDeleteAction}
        onCancel={() => setConfirmOpen(false)}
      />

    </div>
  );
}

export default EmployeeProfile;