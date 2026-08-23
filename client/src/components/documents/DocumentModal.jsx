import { useEffect, useState, useRef } from "react";
import { X, FileText, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

const initialForm = {
  employeeName: "",
  employeeId: "",
  department: "Development",
  documentName: "",
  category: "Identity",
  fileData: "",
  fileName: "",
  fileSize: 0,
};

function DocumentModal({ isOpen, onClose, onSave, employees = [] }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setForm(initialForm);
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleEmployeeIdChange = (e) => {
    const val = e.target.value;
    const selected = employees.find(
      (emp) =>
        emp.employee_code === val ||
        `DCS-EMP-${String(emp.id).padStart(3, "0")}` === val ||
        `EMP-${emp.id}` === val ||
        String(emp.id) === String(val)
    );
    if (selected) {
      setForm((prev) => ({
        ...prev,
        employeeId: selected.employee_code || `DCS-EMP-${String(selected.id).padStart(3, "0")}`,
        employeeName: `${selected.first_name || ""} ${selected.last_name || ""}`.trim(),
        department: selected.department_name || prev.department,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        employeeId: val,
      }));
    }
  };

  const handleEmployeeNameChange = (e) => {
    const val = e.target.value;
    const selected = employees.find(
      (emp) =>
        `${emp.first_name || ""} ${emp.last_name || ""}`.trim().toLowerCase() === val.trim().toLowerCase() ||
        String(emp.id) === String(val)
    );
    if (selected) {
      setForm((prev) => ({
        ...prev,
        employeeId: selected.employee_code || `DCS-EMP-${String(selected.id).padStart(3, "0")}`,
        employeeName: `${selected.first_name || ""} ${selected.last_name || ""}`.trim(),
        department: selected.department_name || prev.department,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        employeeName: val,
      }));
    }
  };

  // PDF File Upload & Validation (Strictly PDF, Max 5MB)
  const handlePdfUpload = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Only PDF format documents (.pdf) are permitted.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("PDF document size exceeds the 5MB storage limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        fileData: reader.result,
        fileName: file.name,
        fileSize: file.size,
        documentName: prev.documentName || file.name.replace(/\.pdf$/i, ""),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.employeeId.trim()) {
      setError("Employee ID is required.");
      return;
    }
    if (!form.employeeName.trim()) {
      setError("Employee Name is required.");
      return;
    }
    if (!form.documentName.trim()) {
      setError("Document title is required.");
      return;
    }
    if (!form.fileData) {
      setError("Please attach a valid PDF document (Max 5MB).");
      return;
    }

    onSave(form);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="modal-overlay">
      <div className="document-modal" style={{ maxWidth: "640px", width: "100%" }}>
        <div className="modal-header">
          <div>
            <p className="section-label">DOCUMENT DEPLOYMENT</p>
            <h2>Upload PDF Document</h2>
          </div>

          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              borderRadius: "8px",
              margin: "12px 24px 0",
              fontSize: "13px",
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ padding: "20px 24px" }}>
            {/* ROW 1: INDIVIDUAL EMPLOYEE ID SELECTION */}
            <div className="form-field">
              <label>Employee ID</label>
              {employees.length > 0 ? (
                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleEmployeeIdChange}
                  required
                >
                  <option value="">-- Select Employee ID --</option>
                  {employees.map((emp) => {
                    const code = emp.employee_code || `DCS-EMP-${String(emp.id).padStart(3, "0")}`;
                    return (
                      <option key={emp.id} value={code}>
                        {code}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. DCS-EMP-001"
                  required
                />
              )}
            </div>

            {/* ROW 1: INDIVIDUAL EMPLOYEE NAME SELECTION */}
            <div className="form-field">
              <label>Employee Name</label>
              {employees.length > 0 ? (
                <select
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleEmployeeNameChange}
                  required
                >
                  <option value="">-- Select Employee Name --</option>
                  {employees.map((emp) => {
                    const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee";
                    return (
                      <option key={emp.id} value={fullName}>
                        {fullName}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                />
              )}
            </div>

            {/* ROW 2: DOCUMENT CATEGORY */}
            <div className="form-field">
              <label>Document Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <option value="Identity">Identity & KYC (Aadhaar / PAN)</option>
                <option value="Employment">Employment Contract & Offer</option>
                <option value="Financial">Financial Sheet & Tax Forms</option>
                <option value="Education">Education & Certifications</option>
                <option value="Policy">Company Policy & Notice</option>
              </select>
            </div>

            {/* ROW 2: DOCUMENT TITLE */}
            <div className="form-field">
              <label>Document Title</label>
              <input
                name="documentName"
                value={form.documentName}
                onChange={handleChange}
                placeholder="e.g. Identity Proof / Salary Agreement"
                required
              />
            </div>

            {/* ROW 3: ATTACH PDF FILE (SPAN FULL WIDTH) */}
            <div className="form-field full-width" style={{ gridColumn: "1 / -1" }}>
              <label>Attach PDF File (Max 5MB)</label>
              <input
                type="file"
                accept="application/pdf,.pdf"
                ref={fileInputRef}
                onChange={handlePdfUpload}
                style={{ display: "none" }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed #cbd5e1",
                  borderRadius: "8px",
                  padding: "18px 16px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#f8fafc",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#A1238E")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
              >
                <Upload size={24} color="#A1238E" style={{ margin: "0 auto 8px" }} />
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                  Click to select PDF document
                </p>
                <span style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", display: "inline-block" }}>
                  PDF format only · Maximum file size 5MB
                </span>
              </div>

              {form.fileName && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginTop: "10px",
                    padding: "10px 14px",
                    backgroundColor: "#fdf2f8",
                    border: "1px solid #fbcfe8",
                    borderRadius: "6px",
                    fontSize: "13px",
                    color: "#A1238E",
                    fontWeight: "600",
                  }}
                >
                  <FileText size={18} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {form.fileName}
                  </span>
                  <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                    {formatFileSize(form.fileSize)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
            >
              Upload PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentModal;