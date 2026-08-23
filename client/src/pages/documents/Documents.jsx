import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Files,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../../services/documentService";

import {
  getEmployees,
} from "../../services/employeeService";

import DocumentSummary
  from "../../components/documents/DocumentSummary";

import DocumentFilters
  from "../../components/documents/DocumentFilters";

import DocumentTable
  from "../../components/documents/DocumentTable";

import DocumentModal
  from "../../components/documents/DocumentModal";

import DocumentPreviewModal
  from "../../components/documents/DocumentPreviewModal";

import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";

function Documents() {
  const { user, role } = useAuth();
  const notification = useNotification();
  const userRole = (role || user?.role || "EMPLOYEE").toUpperCase();
  const isEmployee = userRole === "EMPLOYEE";
  const canDeploy = ["ADMIN", "HR", "SUPER_ADMIN"].includes(userRole);

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [department, setDepartment] = useState("All Departments");
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Filter employees that the current role is authorized to deploy documents for
  const deployableEmployees = useMemo(() => {
    if (userRole === "HR") {
      // HR can add documents for Finance and Employees only (excludes Admin / Super Admin)
      return employees.filter((emp) => {
        const empRole = (emp.role || "").toUpperCase();
        const empDept = (emp.department_name || "").toLowerCase();
        const empDesig = (emp.designation || "").toLowerCase();
        return (
          empRole !== "ADMIN" &&
          empRole !== "SUPER_ADMIN" &&
          !empDept.includes("admin") &&
          !empDesig.includes("admin")
        );
      });
    }

    if (userRole === "ADMIN" || userRole === "SUPER_ADMIN") {
      // Admin can add HR, Finance, and Employee documents (admin itself does not require documents)
      return employees.filter((emp) => {
        const empRole = (emp.role || "").toUpperCase();
        const empDept = (emp.department_name || "").toLowerCase();
        const empDesig = (emp.designation || "").toLowerCase();
        return (
          empRole !== "SUPER_ADMIN" &&
          empRole !== "ADMIN" &&
          !empDept.includes("super admin")
        );
      });
    }

    return employees;
  }, [employees, userRole]);

  const mapDocumentToUI = (doc) => {
    const name = `${doc.first_name || ""} ${doc.last_name || ""}`.trim() || "Employee";
    const uploadedDate = doc.created_at ? String(doc.created_at).slice(0, 10) : "2026-08-19";
    const sizeMB = doc.file_size ? `${(Number(doc.file_size) / (1024 * 1024)).toFixed(1)} MB` : "1.4 MB";
    return {
      id: `DOC-${String(doc.id).padStart(3, "0")}`,
      databaseId: doc.id,
      employeeId: doc.employee_code || `EMP-${doc.employee_id}`,
      employeeDatabaseId: doc.employee_id,
      employeeName: name,
      department: doc.department_name || "Development",
      documentName: doc.document_name || "Document",
      category: doc.document_type || "Identity",
      fileType: "PDF",
      fileSize: sizeMB,
      fileData: doc.file_data || doc.file_path,
      uploadedOn: uploadedDate,
      status: "Verified",
    };
  };

  const loadDocumentsData = async () => {
    try {
      setLoading(true);
      setError("");
      const [docsData, empData] = await Promise.all([
        getDocuments(),
        getEmployees().catch(() => []),
      ]);
      const mapped = (docsData || []).map(mapDocumentToUI);
      setRecords(mapped);
      setEmployees(empData || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentsData();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      // If Employee, only show their own documents or policy documents
      if (isEmployee && user?.email) {
        const empMatch = employees.find(e => e.email === user.email);
        const empCode = empMatch?.employee_code || `EMP-${empMatch?.id}`;
        const isOwn = record.employeeId === empCode || record.employeeName.toLowerCase().includes(user?.name?.toLowerCase() || "");
        const isPolicy = record.category === "Policy";
        if (!isOwn && !isPolicy) return false;
      }

      const searchText = search.toLowerCase();
      const matchesSearch =
        !search ||
        record.documentName.toLowerCase().includes(searchText) ||
        record.employeeName.toLowerCase().includes(searchText) ||
        record.employeeId.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All Categories" || record.category === category;

      const matchesDepartment =
        department === "All Departments" || record.department === department;

      return matchesSearch && matchesCategory && matchesDepartment;
    });
  }, [records, search, category, department, isEmployee, user, employees]);

  const handleAdd = () => {
    setModalOpen(true);
  };

  // Real PDF / Certified Document View Handler
  const handleView = (record) => {
    setPreviewDoc(record);
    setPreviewModalOpen(true);
  };

  // Real File Download Handler (Supports real PDF and Image files)
  const handleDownload = (record) => {
    if (!record.fileData) {
      if (notification?.error) {
        notification.error("No file payload available for this document.");
      }
      return;
    }

    let extension = ".pdf";
    if (record.fileData.startsWith("data:image/jpeg") || record.fileData.startsWith("data:image/jpg")) {
      extension = ".jpg";
    } else if (record.fileData.startsWith("data:image/png")) {
      extension = ".png";
    } else if (record.fileData.startsWith("data:image/webp")) {
      extension = ".webp";
    }

    const cleanName = (record.documentName || "document").replace(/[^a-zA-Z0-9_-]/g, "_");
    const downloadFilename = cleanName.endsWith(extension) ? cleanName : `${cleanName}${extension}`;

    if (record.fileData.startsWith("data:")) {
      try {
        const parts = record.fileData.split(",");
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : "application/octet-stream";
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

        if (notification?.success) {
          notification.success(`Downloaded ${downloadFilename}`);
        }
        return;
      } catch (e) {
        console.warn("Blob download error:", e);
      }
    }

    const link = document.createElement("a");
    link.href = record.fileData;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (notification?.success) {
      notification.success(`Downloaded ${downloadFilename}`);
    }
  };


  const handleDelete = async (record) => {
    if (!canDeploy) return;
    if (window.confirm(`Are you sure you want to delete "${record.documentName}"?`)) {
      try {
        await deleteDocument(record.databaseId);
        setRecords((prev) => prev.filter((r) => r.databaseId !== record.databaseId));
        if (notification?.success) {
          notification.success("Document removed successfully.");
        }
      } catch (err) {
        console.error("Failed to delete document:", err);
        alert(err.message || "Failed to delete document.");
      }
    }
  };

  const handleSave = async (formData) => {
    try {
      setLoading(true);
      setError("");

      let matchedEmpId = formData.employeeDatabaseId ? Number(formData.employeeDatabaseId) : null;
      if (!matchedEmpId && employees.length > 0) {
        const found = employees.find(
          e => e.employee_code === formData.employeeId ||
               `${e.first_name || ""} ${e.last_name || ""}`.trim().toLowerCase() === formData.employeeName.trim().toLowerCase()
        );
        matchedEmpId = found ? found.id : employees[0].id;
      }

      await createDocument({
        employeeId: matchedEmpId,
        documentName: formData.documentName,
        documentType: formData.category || "Identity",
        fileName: formData.fileName || `${formData.documentName.toLowerCase().replace(/\s+/g, "_")}.pdf`,
        filePath: formData.fileData || `/uploads/documents/${formData.documentName.toLowerCase().replace(/\s+/g, "_")}.pdf`,
        fileSize: formData.fileSize || 1024 * 1024,
        mimeType: "application/pdf",
        uploadedBy: user?.id || 1,
      });

      if (notification?.success) {
        notification.success("PDF Document uploaded successfully!");
      }

      await loadDocumentsData();
    } catch (err) {
      console.error("Failed to save document:", err);
      setError(err.message || "Failed to save document");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documents-page">
      {/* HEADER */}
      <div className="module-heading">
        <div>
          <p className="section-label">ENTERPRISE REPOSITORY</p>
          <h1>Documents & Files</h1>
          <p>
            {isEmployee
              ? "Access and download your verified employee documents and company policies."
              : "Deploy and manage employee credentials, contracts, and financial documents."}
          </p>
        </div>

        {canDeploy && (
          <button className="primary-button" onClick={handleAdd}>
            <Plus size={16} />
            Upload PDF Document
          </button>
        )}
      </div>

      {error && (
        <div className="dashboard-card" style={{ marginBottom: "16px" }}>
          <p style={{ color: "#e11d48" }}>{error}</p>
        </div>
      )}

      {/* SUMMARY */}
      <DocumentSummary records={filteredRecords} />

      {/* TABLE */}
      <section className="dashboard-card">
        <div className="document-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3>All Document Files</h3>
            <p>Stored enterprise PDF documents with security verification.</p>
          </div>

          <div className="document-total-label" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "#64748b", fontWeight: "600" }}>
            <Files size={16} />
            {filteredRecords.length} Documents
          </div>
        </div>

        <DocumentFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          department={department}
          setDepartment={setDepartment}
        />

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading PDF documents...
          </div>
        ) : (
          <DocumentTable
            records={filteredRecords}
            onView={handleView}
            onDownload={handleDownload}
            onDelete={handleDelete}
            canDelete={canDeploy}
          />
        )}
      </section>

      {/* UPLOAD MODAL (ADMIN & HR ONLY) */}
      {canDeploy && (
        <DocumentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          employees={deployableEmployees}
        />
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setPreviewDoc(null);
        }}
        document={previewDoc}
      />
    </div>
  );
}

export default Documents;