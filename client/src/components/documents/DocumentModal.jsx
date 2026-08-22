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

  const handleEmployeeSelect = (e) => {
    const val = e.target.value;
    const selected = employees.find(
      (emp) =>
        emp.employee_code === val ||
        `EMP-${emp.id}` === val ||
        String(emp.id) === String(val)
    );
    if (selected) {
      setForm({
        ...form,
        employeeId: selected.employee_code || `EMP-${selected.id}`,
        employeeName: `${selected.first_name || ""} ${selected.last_name || ""}`.trim(),
        department: selected.department_name || form.department,
      });
    } else {
      setForm({
        ...form,
        employeeId: val,
      });
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
    if (!form.documentName.trim()) {
      setError("Document name is required.");
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
      <div className="document-modal" style={{ maxWidth: "520px" }}>
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
          <div className="form-grid" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {/* EMPLOYEE ID REFERENCE */}
            <div className="form-field">
              <label>Employee ID (Main Reference)</label>
              {employees.length > 0 ? (
                <select
                  value={form.employeeId}
                  onChange={handleEmployeeSelect}
                  required
                >
                  <option value="">-- Select Employee ID --</option>
                  {employees.map((emp) => {
                    const code = emp.employee_code || `EMP-${emp.id}`;
                    return (
                      <option key={emp.id} value={code}>
                        {code} · {emp.first_name} {emp.last_name} ({emp.department_name || "General"})
                      </option>
                    );
                  })}
                </select>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    placeholder="Employee ID (e.g. EMP-1001)"
                    required
                  />
                  <input
                    name="employeeName"
                    value={form.employeeName}
                    onChange={handleChange}
                    placeholder="Employee Full Name"
                    required
                  />
                </div>
              )}
            </div>

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

            {/* PDF FILE PICKER */}
            <div className="form-field">
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
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: "#f8fafc",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#A1238E")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
              >
                <Upload size={22} color="#A1238E" style={{ margin: "0 auto 6px" }} />
                <p style={{ margin: 0, fontSize: "13.5px", fontWeight: "600", color: "#334155" }}>
                  Click to select PDF document
                </p>
                <span style={{ fontSize: "11.5px", color: "#64748b" }}>
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
                    padding: "8px 12px",
                    backgroundColor: "#f0dced",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    color: "#A1238E",
                    fontWeight: "600",
                  }}
                >
                  <FileText size={16} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {form.fileName}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
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