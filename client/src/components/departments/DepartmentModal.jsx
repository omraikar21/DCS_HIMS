import {
  useEffect,
  useState,
} from "react";
import {
  X,
} from "lucide-react";

const initialForm = {
  name: "",
  code: "",
  employees: 0,
  location: "",
  description: "",
  status: "Active",
};

function DepartmentModal({
  isOpen,
  onClose,
  onSave,
  department,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (department) {
      setForm(department);
    } else {
      setForm(initialForm);
    }
  }, [department, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "16px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        className="department-modal"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "620px",
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
            <p
              className="section-label"
              style={{
                margin: 0,
                fontSize: "11px",
                fontWeight: "800",
                color: "#DB2777",
                letterSpacing: "0.8px",
                textTransform: "uppercase",
              }}
            >
              DEPARTMENT MANAGEMENT
            </p>
            <h2
              style={{
                margin: "4px 0 0",
                fontSize: "19px",
                color: "#0F172A",
                fontWeight: "800",
              }}
            >
              {department ? "Edit Department" : "Add Department"}
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
              transition: "all 0.15s ease",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: "1 1 auto",
            overflow: "hidden",
          }}
        >
          <div
            className="form-grid"
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              flex: "1 1 auto",
              overscrollBehavior: "contain",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            {/* DEPARTMENT NAME */}
            <div className="form-field">
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Department Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Development"
                required
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* DEPARTMENT CODE */}
            <div className="form-field">
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Department Code *
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="DEV"
                required
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* EMPLOYEES */}
            <div className="form-field">
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Employees
              </label>
              <input
                type="number"
                name="employees"
                value={form.employees}
                onChange={handleChange}
                min="0"
                placeholder="0"
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* LOCATION */}
            <div className="form-field">
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Location
              </label>
              <input
                name="location"
                value={form.location || ""}
                onChange={handleChange}
                placeholder="e.g. Main Office / Bangalore"
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* STATUS */}
            <div className="form-field">
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{
                  width: "100%",
                  height: "42px",
                  padding: "0 14px",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* EMPTY FILLER FOR PERFECT 2-COLUMN BALANCE IF NEEDED OR SPREAD */}
            <div className="form-field" style={{ display: "none" }}></div>

            {/* DESCRIPTION */}
            <div className="form-field full-form-field" style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontSize: "11.5px",
                  fontWeight: "800",
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                placeholder="Department description"
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1.5px solid #CBD5E1",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  minHeight: "75px",
                }}
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
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
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
              style={{
                height: "40px",
                padding: "0 22px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: "800",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(219, 39, 119, 0.3)",
              }}
            >
              {department ? "Update Department" : "Add Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DepartmentModal;