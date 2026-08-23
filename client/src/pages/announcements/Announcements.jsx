import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Pin,
  X,
  Send,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../../services/announcementService";

function Announcements() {
  const { role, user } = useAuth();
  const userRole = (role || "").toUpperCase();
  const canDeploy = ["ADMIN", "HR"].includes(userRole);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Notice",
    content: "",
    pinned: false,
  });
  const [error, setError] = useState("");

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed loading announcements:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
    const handleUpdate = () => {
      loadAnnouncements();
    };
    window.addEventListener("dcsAnnouncementsUpdated", handleUpdate);
    return () => window.removeEventListener("dcsAnnouncementsUpdated", handleUpdate);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError("Please provide a title and notice description.");
      return;
    }

    const authorStr = user?.name
      ? `${user.name} (${userRole === "HR" ? "HR Department" : "Management"})`
      : (userRole === "HR" ? "HR Department" : "Management");

    await createAnnouncement({
      title: formData.title.trim(),
      category: formData.category,
      pinned: formData.pinned,
      content: formData.content.trim(),
      author: authorStr,
    });

    setFormData({
      title: "",
      category: "Notice",
      content: "",
      pinned: false,
    });
    setError("");
    setModalOpen(false);
    loadAnnouncements();
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  return (
    <div className="announcements-page">
      <div className="module-heading">
        <div>
          <p className="section-label">COMMUNICATION</p>
          <h1>Company Notices & Announcements</h1>
          <p>Official company circulars, policy notices, and event broadcasts.</p>
        </div>

        {canDeploy && (
          <button
            className="primary-button"
            onClick={() => {
              setError("");
              setModalOpen(true);
            }}
          >
            <Plus size={17} />
            Deploy Notice
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {loading ? (
          <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b" }}>Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b" }}>No announcements posted yet.</p>
          </div>
        ) : (
          announcements.map((item) => (
            <div key={item.id} className="dashboard-card" style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    className={`status-badge ${
                      item.category === "HR Policy"
                        ? "pending"
                        : item.category === "Company Event"
                        ? "success"
                        : "approved"
                    }`}
                    style={{ fontSize: "11px", padding: "3px 8px" }}
                  >
                    {item.category}
                  </span>
                  <span style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={13} />
                    {item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent")}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {(item.pinned || item.priority === "HIGH") && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                        color: "#A1238E",
                        fontWeight: 600,
                        backgroundColor: "rgba(161, 35, 142, 0.08)",
                        padding: "4px 10px",
                        borderRadius: "20px",
                      }}
                    >
                      <Pin size={13} />
                      Pinned
                    </div>
                  )}

                  {canDeploy && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Delete Notice"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "4px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: "18px", marginBottom: "8px", color: "#0f172a" }}>{item.title}</h3>
              <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.6", marginBottom: "14px" }}>
                {item.content || item.message}
              </p>

              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                Posted by: <strong style={{ color: "#334155" }}>{item.author || item.sender_name || "Management"}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DEPLOY NOTICE MODAL (ADMIN & HR ONLY) */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="employee-modal" style={{ maxWidth: "520px" }}>
            <div className="modal-header">
              <div>
                <p className="section-label">COMMUNICATION</p>
                <h2>Deploy Company Notice</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={18} />
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

            <form onSubmit={handleCreate}>
              <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                <div className="form-field">
                  <label>Notice Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Performance Review Timeline"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Notice">Notice</option>
                    <option value="HR Policy">HR Policy</option>
                    <option value="Company Event">Company Event</option>
                    <option value="Holiday">Holiday Schedule</option>
                    <option value="Technical">Technical Update</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Notice Content</label>
                  <textarea
                    rows={4}
                    placeholder="Provide full details and instructions for employees..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontFamily: "inherit",
                      fontSize: "13.5px",
                      outline: "none",
                      resize: "vertical",
                    }}
                    required
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.pinned}
                    onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                  />
                  <span>Pin this notice to top of announcements</span>
                </label>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Send size={15} />
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        title="Remove Announcement?"
        message="Are you sure you want to delete this company announcement? This will remove it from all employee dashboards."
        confirmText="Delete Notice"
        cancelText="Cancel"
        onConfirm={async () => {
          if (deleteConfirmId) {
            await deleteAnnouncement(deleteConfirmId);
            setDeleteConfirmId(null);
            loadAnnouncements();
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}

export default Announcements;
