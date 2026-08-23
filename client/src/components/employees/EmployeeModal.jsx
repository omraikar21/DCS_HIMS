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
  officeLocation: "",
  address: "",
  location: "",
};

function EmployeeModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  employee,
  errors = {},
}) {
  const [form, setForm] = useState(initialForm);
  const [departments, setDepartments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    if (isOpen) {
      getDepartments()
        .then((data) => setDepartments(data || []))
        .catch((err) => console.warn("Failed to load departments in modal:", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (employee) {
      const existingAddress = employee.address || employee.location || "";
      const parts = existingAddress.split("·").map((s) => s.trim());
      setForm({
        ...employee,
        officeLocation: parts[0] || employee.officeLocation || employee.location || "",
        address: parts[1] || employee.address || "",
        location: employee.location || parts[0] || "",
        status: employee.status || "Active",
      });
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

  const handlePhoneChange = (e) => {
    const numeric = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm((prev) => ({
      ...prev,
      phone: numeric,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!form.name || !form.name.trim()) {
      setGeneralError("Full Name is required.");
      return;
    }

    if (!form.email || !form.email.trim()) {
      setGeneralError("Email address is required.");
      return;
    }

    const cleanPhone = (form.phone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setGeneralError("Phone number must be exactly 10 digits (e.g. 9876543210).");
      return;
    }

    if (!form.department || !form.department.trim() || form.department === "Unassigned") {
      setGeneralError("Department is required. Please select an existing department.");
      return;
    }

    if (!form.designation || !form.designation.trim()) {
      setGeneralError("Designation is required.");
      return;
    }

    setSaving(true);

    try {
      const combinedAddress = form.address && form.officeLocation && form.address !== form.officeLocation
        ? `${form.officeLocation} · ${form.address}`
        : (form.officeLocation || form.address || form.location || "").trim();

      const payload = {
        ...form,
        location: form.officeLocation || form.location || "",
        address: combinedAddress,
        status: form.status || "Active",
      };

      const result = await onSave(payload);
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
      <div className="employee-modal" style={{ maxWidth: "660px", width: "100%" }}>
        <div className="modal-header">
          <div>
            <p className="section-label">EMPLOYEE MANAGEMENT</p>
            <h2>{employee ? "Edit Employee Profile" : "Add New Employee"}</h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {generalError && (
          <div style={{ padding: "12px 16px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", margin: "10px 20px 0", fontSize: "13.5px", fontWeight: "500" }}>
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ padding: "20px 24px" }}>
            {/* ROW 1: FULL NAME & EMAIL */}
            <div className="form-field">
              <label>Full Name *</label>
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
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. employee@example.com"
                required
              />
              {errors.email && (
                <span style={{ color: "#e11d48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* ROW 2: PHONE (EXACTLY 10 DIGITS) & DEPARTMENT (FROM DATABASE) */}
            <div className="form-field">
              <label>Phone Number (10 Digits) *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                required
              />
              {errors.phone && (
                <span style={{ color: "#e11d48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="form-field">
              <label>Department *</label>
              {departments.length > 0 ? (
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Department * --</option>
                  {departments.map((dept) => (
                    <option key={dept.id || dept.name} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="Type department name *"
                  required
                />
              )}
              {errors.department && (
                <span style={{ color: "#e11d48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.department}
                </span>
              )}
            </div>

            {/* ROW 3: DESIGNATION & JOINING DATE */}
            <div className="form-field">
              <label>Designation / Role *</label>
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
              <label>Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
              />
            </div>

            {/* ROW 4: OFFICE LOCATION & DETAILED ADDRESS */}
            <div className="form-field">
              <label>Office / Work Location</label>
              <input
                name="officeLocation"
                value={form.officeLocation || form.location || ""}
                onChange={(e) => setForm({ ...form, officeLocation: e.target.value, location: e.target.value })}
                placeholder="e.g. Belagavi Branch / Bangalore Office"
              />
            </div>

            <div className="form-field">
              <label>Office / Residential Address</label>
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="e.g. 4th Floor, Tech Hub, MG Road"
              />
            </div>
          </div>

          <div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              {employee && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete and offboard ${employee.name} (${employee.id})? This will remove their profile and system access.`)) {
                      onDelete(employee);
                      onClose();
                    }
                  }}
                  style={{
                    backgroundColor: "#fff1f2",
                    color: "#e11d48",
                    border: "1px solid #fecdd3",
                    padding: "8px 14px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Delete Employee
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
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
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeModal;