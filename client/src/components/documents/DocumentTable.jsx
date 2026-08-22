import {
  Eye,
  Download,
  Trash2,
  FileText,
} from "lucide-react";

function DocumentTable({
  records,
  onView,
  onDownload,
  onDelete,
  canDelete = true,
}) {
  return (
    <div className="document-table-wrapper">
      <table className="document-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Employee</th>
            <th>Category</th>
            <th>Size</th>
            <th>Uploaded</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="7" className="empty-table" style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
                No documents found.
              </td>
            </tr>
          ) : (
            records.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="document-name-cell" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      className="document-file-icon"
                      style={{
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        fontWeight: "700",
                        fontSize: "11px",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      PDF
                    </div>

                    <div>
                      <strong style={{ fontSize: "14px", color: "#1e293b", display: "block" }}>
                        {record.documentName}
                      </strong>
                      <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                        {record.id}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <div>
                    <strong style={{ fontSize: "13.5px", color: "#1e293b", display: "block" }}>
                      {record.employeeName}
                    </strong>
                    <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "600" }}>
                      {record.employeeId}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "11.5px" }}>
                    {record.category}
                  </span>
                </td>
                <td>{record.fileSize}</td>
                <td>{record.uploadedOn}</td>
                <td>
                  <span className="status-badge success" style={{ fontSize: "11.5px" }}>
                    {record.status}
                  </span>
                </td>

                <td>
                  <div className="document-actions" style={{ display: "flex", gap: "6px" }}>
                    <button
                      title="View PDF"
                      onClick={() => onView(record)}
                      style={{ padding: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer" }}
                    >
                      <Eye size={15} color="#475569" />
                    </button>

                    <button
                      title="Download PDF"
                      onClick={() => onDownload(record)}
                      style={{ padding: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer" }}
                    >
                      <Download size={15} color="#475569" />
                    </button>

                    {canDelete && (
                      <button
                        className="delete-button"
                        title="Delete Document"
                        onClick={() => onDelete(record)}
                        style={{ padding: "6px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "6px", cursor: "pointer" }}
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentTable;