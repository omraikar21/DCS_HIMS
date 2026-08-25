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
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="employee-modal"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.28)",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className="modal-header"
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8FC 100%)",
          }}
        >
          <div>
            <p className="section-label" style={{ margin: 0, fontSize: "11px", fontWeight: "800", color: "#DB2777", letterSpacing: "0.8px", textTransform: "uppercase" }}>
              EMPLOYEE MANAGEMENT
            </p>
            <h2 style={{ margin: "4px 0 0", fontSize: "19px", color: "#0F172A", fontWeight: "800" }}>
              {employee ? "Edit Employee Profile" : "Add New Employee"}
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #CBD5E1",
              borderRadius: "50%",
              background: "#FFFFFF",
              color: "#64748B",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {generalError && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#FEE2E2",
              color: "#B91C1C",
              borderRadius: "8px",
              margin: "12px 24px 0",
              fontSize: "13px",
              fontWeight: "600",
              flexShrink: 0,
            }}
          >
            {generalError}
          </div>
        )}

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              flex: "1 1 auto",
              overscrollBehavior: "contain",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            {/* ROW 1: FULL NAME & EMAIL */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Full Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
              />
              {errors.name && (
                <span style={{ color: "#E11D48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.name}
                </span>
              )}
            </div>

            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. alex@dcs.com"
                required
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
              />
              {errors.email && (
                <span style={{ color: "#E11D48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.email}
                </span>
              )}
            </div>

            {/* ROW 2: PHONE & DEPARTMENT */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Phone Number (10 Digits) *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="e.g. 9876543210"
                maxLength={10}
                required
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
              />
              {errors.phone && (
                <span style={{ color: "#E11D48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.phone}
                </span>
              )}
            </div>

            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Department *
              </label>
              {departments.length > 0 ? (
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  required
                  style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
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
                  style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
                />
              )}
              {errors.department && (
                <span style={{ color: "#E11D48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.department}
                </span>
              )}
            </div>

            {/* ROW 3: DESIGNATION & JOINING DATE */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Designation / Role *
              </label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                required
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
              />
              {errors.designation && (
                <span style={{ color: "#E11D48", fontSize: "12px", marginTop: "4px" }}>
                  {errors.designation}
                </span>
              )}
            </div>

            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
              />
            </div>

            {/* ROW 4: OFFICE LOCATION & DETAILED ADDRESS */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Office / Work Location
              </label>
              <input
                name="officeLocation"
                value={form.officeLocation || form.location || ""}
                onChange={(e) => setForm({ ...form, officeLocation: e.target.value, location: e.target.value })}
                placeholder="e.g. Belagavi Branch / Bangalore Office"
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Office / Residential Address
              </label>
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="e.g. 4th Floor, Tech Hub, MG Road"
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="modal-footer"
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #F1F5F9",
              background: "#FAFCFF",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div>
              {employee && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(employee);
                  }}
                  style={{
                    backgroundColor: "#FFF1F2",
                    color: "#E11D48",
                    border: "1px solid #FECDD3",
                    height: "40px",
                    padding: "0 16px",
                    borderRadius: "10px",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Delete Employee
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="secondary-button"
                onClick={onClose}
                disabled={saving}
                style={{
                  height: "40px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  border: "1.5px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
                style={{
                  height: "40px",
                  padding: "0 22px",
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: "800",
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(219, 39, 119, 0.3)",
                }}
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