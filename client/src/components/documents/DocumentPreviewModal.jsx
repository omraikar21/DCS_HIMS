import {
  X,
  Download,
  Printer,
  FileText,
  ShieldCheck,
  Building,
  User,
  Calendar,
  HardDrive,
} from "lucide-react";

function DocumentPreviewModal({
  isOpen,
  onClose,
  document: doc,
}) {
  if (!isOpen || !doc) return null;

  const isPdfData = doc.fileData && doc.fileData.startsWith("data:application/pdf");
  const isImageData =
    doc.fileData &&
    (doc.fileData.startsWith("data:image/") ||
      doc.fileData.startsWith("http") ||
      doc.fileData.startsWith("blob:"));

  // Detect proper file extension
  const getFileExtension = () => {
    if (!doc.fileData) return ".pdf";
    if (doc.fileData.startsWith("data:image/jpeg") || doc.fileData.startsWith("data:image/jpg")) return ".jpg";
    if (doc.fileData.startsWith("data:image/png")) return ".png";
    if (doc.fileData.startsWith("data:image/webp")) return ".webp";
    if (doc.fileData.startsWith("data:application/pdf")) return ".pdf";
    if (doc.fileName && doc.fileName.includes(".")) {
      return `.${doc.fileName.split(".").pop()}`;
    }
    return isImageData ? ".png" : ".pdf";
  };

  // Real Document Print Handler (Prints actual image or PDF directly)
  const handlePrint = () => {
    if (!doc.fileData) return;

    if (isImageData) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${doc.documentName}</title>
            <style>
              @page { size: auto; margin: 8mm; }
              html, body { margin: 0; padding: 0; background: #ffffff; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 95vw; max-height: 95vh; object-fit: contain; display: block; margin: auto; }
            </style>
          </head>
          <body>
            <img src="${doc.fileData}" alt="${doc.documentName}" onload="setTimeout(function(){ window.focus(); window.print(); }, 250);" />
            <script>
              window.onload = function() {
                setTimeout(function() { window.focus(); window.print(); }, 400);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      return;
    }

    if (isPdfData) {
      try {
        const parts = doc.fileData.split(",");
        const byteCharacters = atob(parts[1] || "");
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        const printWindow = window.open(blobUrl, "_blank");
        if (printWindow) {
          printWindow.focus();
        }
        return;
      } catch (e) {
        console.warn("PDF print fallback:", e);
      }
    }

    // Default fallback
    const printWindow = window.open(doc.fileData, "_blank");
    if (printWindow) printWindow.focus();
  };

  // Real Document Download Handler
  const handleDownload = () => {
    if (!doc.fileData) return;

    const extension = getFileExtension();
    const cleanDocName = (doc.documentName || "document").replace(/[^a-zA-Z0-9_-]/g, "_");
    const downloadFilename = cleanDocName.endsWith(extension)
      ? cleanDocName
      : `${cleanDocName}${extension}`;

    // If base64 data URL, convert to Blob for reliable cross-browser download
    if (doc.fileData.startsWith("data:")) {
      try {
        const parts = doc.fileData.split(",");
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
        return;
      } catch (err) {
        console.warn("Blob conversion failed, using direct data link:", err);
      }
    }

    const link = document.createElement("a");
    link.href = doc.fileData;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div
        className="document-modal"
        style={{
          maxWidth: "680px",
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
        {/* HEADER */}
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
              DOCUMENT PREVIEW
            </p>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a" }}>
              {doc.documentName}
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

        {/* BODY */}
        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
          {isPdfData ? (
            <div style={{ width: "100%", height: "360px", borderRadius: "10px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
              <iframe
                src={doc.fileData}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="PDF Preview"
              />
            </div>
          ) : isImageData ? (
            <div style={{ width: "100%", maxHeight: "360px", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a", borderRadius: "10px", overflow: "hidden", padding: "10px" }}>
              <img src={doc.fileData} alt={doc.documentName} style={{ maxHeight: "340px", maxWidth: "100%", objectFit: "contain" }} />
            </div>
          ) : (
            <div
              style={{
                padding: "24px",
                backgroundColor: "#faf5f9",
                borderRadius: "12px",
                border: "1px solid #f0dced",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9B2282",
                  boxShadow: "0 2px 8px rgba(155, 34, 130, 0.15)",
                  flexShrink: 0,
                }}
              >
                <FileText size={30} />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", color: "#9B2282", letterSpacing: "1px", textTransform: "uppercase" }}>
                    {doc.category || "General Document"}
                  </span>
                  <span style={{ padding: "2px 8px", borderRadius: "12px", backgroundColor: "#ecfdf5", color: "#059669", fontSize: "11px", fontWeight: "700" }}>
                    Verified
                  </span>
                </div>
                <strong style={{ fontSize: "16px", color: "#0f172a", display: "block" }}>
                  {doc.documentName}
                </strong>
                <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                  Assigned to {doc.employeeName || "All Organization"} · {doc.department || "General"}
                </span>
              </div>
            </div>
          )}

          {/* METADATA GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              backgroundColor: "#f8fafc",
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
              <User size={15} color="#64748b" />
              <span><strong>Employee:</strong> {doc.employeeName || "Workforce"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
              <Building size={15} color="#64748b" />
              <span><strong>Department:</strong> {doc.department || "Company Wide"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
              <Calendar size={15} color="#64748b" />
              <span><strong>Issued:</strong> {doc.uploadedOn || "Today"}</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#334155" }}>
              <HardDrive size={15} color="#64748b" />
              <span><strong>Size:</strong> {doc.fileSize || "Standard"}</span>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div
          className="modal-footer"
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            backgroundColor: "#fafbfc",
          }}
        >
          <button
            type="button"
            className="secondary-button"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={handlePrint}
          >
            <Printer size={15} />
            Print Document
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={handleDownload}
          >
            <Download size={15} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentPreviewModal;
