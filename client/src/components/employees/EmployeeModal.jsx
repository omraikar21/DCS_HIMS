import { useEffect, useState } from "react";

import { X } from "lucide-react";
import { getDepartments } from "../../services/departmentService";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  status: "Active",
  joiningDate: "",
  location: "",
};

function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  employee,
  errors = {},
}) {
  const [form, setForm] =
    useState(initialForm);

  const [departments, setDepartments] =
    useState([]);

  const [saving, setSaving] =
    useState(false);

  const [generalError, setGeneralError] =
    useState("");

  useEffect(() => {
    if (isOpen) {
      getDepartments()
        .then((data) => setDepartments(data || []))
        .catch((err) => console.warn("Failed to load departments in modal:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (employee) {
      setForm(employee);
    } else {
      setForm(initialForm);
    }
    setGeneralError("");
  }, [employee, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSaving(true);

    try {
      const result = await onSave(form);
      if (result !== false) {
        onClose();
      }
    } catch (err) {
      console.error("Employee submit error:", err);
      setGeneralError(err.message || "Failed to save employee");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">

      <div className="employee-modal">

        <div className="modal-header">

          <div>
            <p className="section-label">
              EMPLOYEE MANAGEMENT
            </p>

            <h2>
              {employee
                ? "Edit Employee"
                : "Add Employee"}
            </h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
          >
            <X size={20} />
          </button>

        </div>

        {generalError && (
          <div style={{ padding: "12px 16px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", margin: "10px 20px 0", fontSize: "13.5px" }}>
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-field">

              <label>
                Full Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />

              {errors.name && (
                <span style={{ color: "#e11d48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.name}
                </span>
              )}

            </div>


            <div className="form-field">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="employee@example.com"
                required
              />

              {errors.email && (
                <span style={{ color: "#e11d48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.email}
                </span>
              )}

            </div>


            <div className="form-field">

              <label>
                Phone
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
              />

              {errors.phone && (
                <span style={{ color: "#e11d48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.phone}
                </span>
              )}

            </div>


            <div className="form-field">

              <label>
                Department
              </label>

              <select
                name="department"
                value={form.department}
                onChange={handleChange}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id || dept.name} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>

            </div>


            <div className="form-field">

              <label>
                Designation
              </label>

              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                required
              />

              {errors.designation && (
                <span style={{ color: "#e11d48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.designation}
                </span>
              )}

            </div>


            <div className="form-field">

              <label>
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>

            </div>


            <div className="form-field">

              <label>
                Joining Date
              </label>

              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
              />

            </div>


            <div className="form-field">

              <label>
                Location / Address
              </label>

              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Office location or address"
              />

            </div>

          </div>


          <div className="modal-footer">

            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : (employee ? "Update Employee" : "Add Employee")}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EmployeeModal;