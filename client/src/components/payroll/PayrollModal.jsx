import {
  useEffect,
  useState,
} from "react";

import {
  X,
  Save,
  CheckCircle2,
} from "lucide-react";

const initialForm = {
  employeeId: "",
  employeeName: "",
  payrollMonth: 8,
  payrollYear: 2026,
  basicSalary: 0,
  hra: 0,
  allowances: 0,
  deductions: 0,
  status: "Pending",
  bankName: "HDFC Bank",
  bankAccount: "50100482910482",
  ifscCode: "HDFC0001234",
};

function PayrollModal({
  isOpen,
  onClose,
  onSave,
  record,
  employees = [],
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (record) {
      setForm({
        employeeId: record.employeeDatabaseId || record.employeeId || "",
        employeeName: record.employeeName || "",
        payrollMonth: record.monthKey ? Number(record.monthKey.split("-")[1]) : 8,
        payrollYear: record.monthKey ? Number(record.monthKey.split("-")[0]) : 2026,
        basicSalary: record.basicSalary || 0,
        hra: record.hra || Math.round(Number(record.basicSalary || 0) * 0.25),
        allowances: record.allowances || 0,
        deductions: record.deductions || 0,
        status: record.status || "Pending",
        bankName: record.bankName || "HDFC Bank",
        bankAccount: record.bankAccount || "50100482910482",
        ifscCode: record.ifscCode || "HDFC0001234",
      });
    } else {
      const firstEmp = employees[0];
      setForm({
        ...initialForm,
        employeeId: firstEmp ? firstEmp.id : "",
        employeeName: firstEmp ? `${firstEmp.first_name || ""} ${firstEmp.last_name || ""}`.trim() : "",
        basicSalary: firstEmp ? Number(firstEmp.salary || 85000) : 85000,
        hra: firstEmp ? Math.round(Number(firstEmp.salary || 85000) * 0.25) : 21250,
        bankName: firstEmp?.bank_name || "HDFC Bank",
        bankAccount: firstEmp?.bank_account || "50100482910482",
        ifscCode: firstEmp?.ifsc_code || "HDFC0001234",
      });
    }
  }, [record, isOpen, employees]);

  if (!isOpen) {
    return null;
  }

  const handleEmployeeChange = (e) => {
    const empId = Number(e.target.value);
    const selected = employees.find((emp) => emp.id === empId);
    if (selected) {
      const basic = Number(selected.salary || 85000);
      setForm((prev) => ({
        ...prev,
        employeeId: selected.id,
        employeeName: `${selected.first_name || ""} ${selected.last_name || ""}`.trim(),
        basicSalary: basic,
        hra: Math.round(basic * 0.25),
        bankName: selected.bank_name || prev.bankName || "HDFC Bank",
        bankAccount: selected.bank_account || prev.bankAccount || "50100482910482",
        ifscCode: selected.ifsc_code || prev.ifscCode || "HDFC0001234",
      }));
    } else {
      setForm((prev) => ({ ...prev, employeeId: empId }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "number" ? Number(value) : value,
    });
  };

  const grossSalary =
    Number(form.basicSalary) +
    Number(form.hra) +
    Number(form.allowances);

  const netSalary =
    grossSalary -
    Number(form.deductions);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      employeeDatabaseId: form.employeeId,
      grossSalary,
      netSalary,
    });
  };

  const isEdit = Boolean(record);

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div
        className="payroll-modal"
        style={{
          maxWidth: "580px",
          width: "92%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "16px",
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="modal-header"
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#fafbfc",
            flexShrink: 0,
          }}
        >
          <div>
            <p className="section-label" style={{ color: "#9B2282", fontSize: "11px", fontWeight: "800", letterSpacing: "1.5px", margin: "0 0 2px 0" }}>
              FINANCE MANAGEMENT
            </p>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
              {isEdit ? "Edit Payroll & Salary Record" : "Insert New Payroll Record"}
            </h2>
          </div>

          <button
            className="modal-close"
            onClick={onClose}
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "6px" }}
          >
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* EMPLOYEE BADGE OR SELECTOR */}
        {isEdit ? (
          <div
            style={{
              padding: "12px 24px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div>
              <strong style={{ fontSize: "15px", color: "#0f172a", display: "block" }}>
                {record?.employeeName}
              </strong>
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                {record?.employeeId} · {record?.department}
              </span>
            </div>

            <span
              style={{
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "11.5px",
                fontWeight: "700",
                backgroundColor: form.status === "Paid" || form.status === "Processed" ? "#ecfdf5" : "#fffbeb",
                color: form.status === "Paid" || form.status === "Processed" ? "#059669" : "#d97706",
              }}
            >
              {form.status === "Paid" || form.status === "Processed" ? "Disbursed" : "Pending"}
            </span>
          </div>
        ) : (
          <div
            style={{
              padding: "14px 24px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #f1f5f9",
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Select Employee *
              </label>
              <select
                value={form.employeeId}
                onChange={handleEmployeeChange}
                required
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name || ""} ({emp.employee_code || "EMP-" + emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Month *
              </label>
              <select
                name="payrollMonth"
                value={form.payrollMonth}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              >
                {[
                  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ].map((m, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {m} ({idx + 1})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Year *
              </label>
              <input
                type="number"
                name="payrollYear"
                value={form.payrollYear}
                onChange={handleChange}
                min="2020"
                max="2030"
                required
                style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px" }}
              />
            </div>
          </div>
        )}


        {/* SCROLLABLE FORM BODY */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
            }}
          >
            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                Basic Salary (₹)
              </label>
              <input
                type="number"
                name="basicSalary"
                value={form.basicSalary}
                onChange={handleChange}
                min="0"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                HRA Allowance (₹)
              </label>
              <input
                type="number"
                name="hra"
                value={form.hra}
                onChange={handleChange}
                min="0"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                Special Allowances (₹)
              </label>
              <input
                type="number"
                name="allowances"
                value={form.allowances}
                onChange={handleChange}
                min="0"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                Deductions (PF/Tax) (₹)
              </label>
              <input
                type="number"
                name="deductions"
                value={form.deductions}
                onChange={handleChange}
                min="0"
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                Beneficiary Bank Name
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                placeholder="e.g. HDFC Bank"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                Bank Account Number
              </label>
              <input
                type="text"
                name="bankAccount"
                value={form.bankAccount}
                onChange={handleChange}
                placeholder="e.g. 50100482910482"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                IFSC Code
              </label>
              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
                required
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div className="form-field">
              <label style={{ fontSize: "12.5px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "6px" }}>
                Disbursement Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff" }}
              >
                <option value="Pending">Pending Payment</option>
                <option value="Paid">Disbursed / Paid</option>
                <option value="Processed">Processed</option>
              </select>
            </div>
          </div>

          {/* NET SALARY CALCULATION PREVIEW */}
          <div
            style={{
              margin: "0 24px 20px",
              padding: "14px 18px",
              backgroundColor: "#faf5fa",
              border: "1px solid #f0dced",
              borderRadius: "10px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              textAlign: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Gross Salary</span>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#1e293b", marginTop: "2px" }}>
                ₹{grossSalary.toLocaleString("en-IN")}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#dc2626", fontWeight: "600", textTransform: "uppercase" }}>Deductions</span>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#dc2626", marginTop: "2px" }}>
                -₹{Number(form.deductions).toLocaleString("en-IN")}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "#9B2282", fontWeight: "700", textTransform: "uppercase" }}>Net Payable</span>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#9B2282", marginTop: "2px" }}>
                ₹{netSalary.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* STICKY FOOTER WITH PROMINENT SAVE BUTTON */}
          <div
            className="modal-footer"
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              backgroundColor: "#fafbfc",
              position: "sticky",
              bottom: 0,
              zIndex: 10,
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                backgroundColor: "#ffffff",
                color: "#475569",
                fontWeight: "600",
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              style={{
                padding: "10px 22px",
                borderRadius: "8px",
                backgroundColor: "#9B2282",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13.5px",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(155, 34, 130, 0.35)",
              }}
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PayrollModal;