import {
  useEffect,
  useState,
} from "react";
import { X, UserCheck, Building2, Trash2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getStoredUser } from "../../services/authService";

const initialForm = {
  employeeName: "",
  employeeId: "",
  department: "",
  leaveType: "Casual Leave",
  fromDate: "",
  toDate: "",
  days: 1,
  reason: "",
};

function LeaveModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  record,
}) {
  const { user: authUser } = useAuth();
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setForm({
          employeeName: record.employeeName || "",
          employeeId: record.employeeId || "",
          department: record.department || "",
          leaveType: record.leaveType || "Casual Leave",
          fromDate: record.fromDate || "",
          toDate: record.toDate || "",
          days: record.days || 1,
          reason: record.reason || "",
        });
      } else {
        // Automatically lock to logged-in user profile details
        const currentUser = authUser || getStoredUser() || {};
        const todayStr = new Date().toISOString().split("T")[0];

        const defaultName = currentUser.name ||
          `${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim() ||
          "Employee";

        const defaultEmpId = currentUser.employee_code ||
          currentUser.employee_id ||
          (currentUser.id ? `DCS-EMP-${String(currentUser.id).padStart(3, "0")}` : "DCS-EMP-001");

        const defaultDept = currentUser.department_name ||
          currentUser.department ||
          "Development";

        setForm({
          employeeName: defaultName,
          employeeId: defaultEmpId,
          department: defaultDept,
          leaveType: "Casual Leave",
          fromDate: todayStr,
          toDate: todayStr,
          days: 1,
          reason: "",
        });
      }
    }
  }, [record, isOpen, authUser]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if ((name === "fromDate" || name === "toDate") && updated.fromDate && updated.toDate) {
        const start = new Date(updated.fromDate);
        const end = new Date(updated.toDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diff = end - start;
          const calculatedDays = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
          updated.days = calculatedDays;
        }
      }
      return updated;
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
        className="leave-modal"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "580px",
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
              LEAVE APPLICATION
            </p>
            <h2 style={{ margin: "4px 0 0", fontSize: "19px", color: "#0F172A", fontWeight: "800" }}>
              {record ? "Leave Application Details" : "Apply For Leave"}
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

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", overflow: "hidden" }}>
          <div
            style={{
              padding: "20px 24px",
              overflowY: "auto",
              flex: "1 1 auto",
              overscrollBehavior: "contain",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              boxSizing: "border-box",
            }}
          >
            {/* APPLICANT & DEPARTMENT (COMBINED READ-ONLY CARD) */}
            <div
              style={{
                gridColumn: "1 / -1",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                background: "#F8FAFC",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1.5px solid #E2E8F0",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#FCE7F3", display: "flex", alignItems: "center", justifyContent: "center", color: "#DB2777", flexShrink: 0 }}>
                  <UserCheck size={18} />
                </div>
                <div>
                  <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
                    Applicant
                  </span>
                  <span style={{ fontSize: "13.5px", color: "#0F172A", fontWeight: "800", display: "block" }}>
                    {form.employeeName} <span style={{ color: "#DB2777", fontSize: "12px", fontWeight: "700" }}>({form.employeeId})</span>
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#2563EB", flexShrink: 0 }}>
                  <Building2 size={18} />
                </div>
                <div>
                  <span style={{ fontSize: "10.5px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
                    Department
                  </span>
                  <span style={{ fontSize: "13.5px", color: "#0F172A", fontWeight: "800", display: "block" }}>
                    {form.department || "Enterprise"}
                  </span>
                </div>
              </div>
            </div>

            {/* LEAVE TYPE */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Leave Type *
              </label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>

            {/* NUMBER OF DAYS */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Number of Days *
              </label>
              <input
                type="number"
                name="days"
                value={form.days}
                min="1"
                onChange={handleChange}
                required
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* FROM DATE */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                From Date *
              </label>
              <input
                type="date"
                name="fromDate"
                value={form.fromDate}
                onChange={handleChange}
                required
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
              />
            </div>

            {/* TO DATE */}
            <div className="form-field">
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                To Date *
              </label>
              <input
                type="date"
                name="toDate"
                value={form.toDate}
                onChange={handleChange}
                required
                style={{ width: "100%", height: "42px", padding: "0 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", backgroundColor: "#FFFFFF", boxSizing: "border-box" }}
              />
            </div>

            {/* REASON */}
            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "11.5px", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Reason For Leave *
              </label>
              <textarea
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Please describe the reason for your leave request..."
                rows="3"
                required
                style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #CBD5E1", borderRadius: "10px", fontSize: "13.5px", outline: "none", boxSizing: "border-box", resize: "vertical" }}
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
              justifyContent: record && onDelete && Boolean(record.canDeleteThisRecord) ? "space-between" : "flex-end",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            {record && onDelete && Boolean(record.canDeleteThisRecord) && (
              <button
                type="button"
                onClick={() => onDelete(record)}
                style={{
                  height: "40px",
                  padding: "0 16px",
                  borderRadius: "10px",
                  border: "1px solid #FECDD3",
                  background: "#FFF1F2",
                  color: "#E11D48",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Trash2 size={15} />
                Delete My Leave
              </button>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                {record ? "Save Changes" : "Submit Leave Request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeaveModal;