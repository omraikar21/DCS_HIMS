import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Megaphone, Calendar, ArrowRight, PlusCircle, X, Send } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getAnnouncements, createAnnouncement } from "../../services/notificationService";

function CompanyAnnouncementsCard({ limit = 3 }) {
  const { user, role } = useAuth();
  const notification = useNotification();
  const userRole = (role || user?.role || "EMPLOYEE").toUpperCase();
  const canPublish = ["ADMIN", "HR"].includes(userRole);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    category: "HR Policy",
    priority: "HIGH",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load company announcements:", err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      notification.error("Please provide both title and message.");
      return;
    }

    try {
      setSubmitting(true);
      await createAnnouncement({
        title: formData.title.trim(),
        message: formData.message.trim(),
        category: formData.category,
        priority: formData.priority,
      });

      notification.success("Company-wide announcement deployed to all employees!");
      setModalOpen(false);
      setFormData({
        title: "",
        message: "",
        category: "HR Policy",
        priority: "HIGH",
      });
      await loadAnnouncements();
      window.dispatchEvent(new Event("dcsNotificationsUpdated"));
    } catch (err) {
      notification.error(err.message || "Failed to deploy announcement");
    } finally {
      setSubmitting(false);
    }
  };

  const isSuperAdmin = Boolean(
    user?.is_super_admin ||
    (user?.email && user.email.toLowerCase().trim() === "omraikar2128@gmail.com")
  );

  const displayList = announcements.slice(0, limit);

  return (
    <section className="dashboard-card" style={{ display: "flex", flexDirection: "column" }}>
      <div className="card-header" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
            <Megaphone size={18} color="#DB2777" />
            Company Notices & Announcements
          </h3>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "13px" }}>
            {isSuperAdmin
              ? "Read-only view of internal company announcements posted by Secondary Administrators and HR managers."
              : "Live circulars, policy updates, and executive broadcasts"}
          </p>
        </div>

        {!isSuperAdmin && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {canPublish && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "1px solid #F3D3E7",
                  background: "#FFF0F7",
                  color: "#DB2777",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#DB2777";
                  e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FFF0F7";
                  e.currentTarget.style.color = "#DB2777";
                }}
              >
                <PlusCircle size={14} />
                <span>Post Announcement</span>
              </button>
            )}

            <Link
              to="/reports"
              style={{
                color: "#DB2777",
                fontSize: "13px",
                fontWeight: "700",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              View Reports <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
        {loading ? (
          <p style={{ color: "#94a3b8", fontSize: "13.5px", padding: "16px 0" }}>Loading notices...</p>
        ) : displayList.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: "13.5px", padding: "16px 0" }}>No announcements posted yet.</p>
        ) : (
          displayList.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #F3D3E7",
                boxShadow: "0 2px 8px rgba(219, 39, 119, 0.04)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 9px",
                      borderRadius: "14px",
                      fontWeight: "700",
                      backgroundColor: "#FFF0F7",
                      color: "#DB2777",
                      border: "1px solid #FCE7F3",
                    }}
                  >
                    {item.category || "Company Notice"}
                  </span>
                  <span style={{ fontSize: "11.5px", color: "#64748B", display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
                    <Calendar size={12} color="#DB2777" />
                    {new Date(item.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "10.5px",
                    fontWeight: "800",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    backgroundColor: item.priority === "HIGH" ? "#FEF2F2" : "#F0FDF4",
                    color: item.priority === "HIGH" ? "#DC2626" : "#16A34A",
                    border: `1px solid ${item.priority === "HIGH" ? "#FECDD3" : "#BBF7D0"}`,
                  }}
                >
                  {item.priority || "NORMAL"}
                </span>
              </div>

              <strong style={{ fontSize: "14.5px", color: "#0F172A", fontWeight: "800" }}>{item.title}</strong>
              <p
                style={{
                  margin: 0,
                  color: "#475569",
                  fontSize: "13px",
                  lineHeight: "1.5",
                }}
              >
                {item.message || item.content}
              </p>

              <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                Deployed by: <strong style={{ color: "#0F172A" }}>{item.sender_name || item.sender_role}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POST ANNOUNCEMENT MODAL */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "520px",
              border: "1px solid #F3D3E7",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.2)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #FCE7F3",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #FFFFFF 0%, #FFF8FC 100%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Megaphone size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "17px", color: "#0F172A", fontWeight: "800" }}>
                    Broadcast Company Announcement
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748B" }}>
                    Published to all employees across the organization
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  border: "none",
                  background: "#FFF0F7",
                  color: "#64748B",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Announcement Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Townhall Meeting & Policy Updates"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13.5px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      outline: "none",
                      backgroundColor: "#FFFFFF",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="HR Policy">HR Policy</option>
                    <option value="Company Event">Company Event</option>
                    <option value="Executive Update">Executive Update</option>
                    <option value="Holiday & Schedule">Holiday & Schedule</option>
                    <option value="General Notice">General Notice</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1",
                      fontSize: "13px",
                      outline: "none",
                      backgroundColor: "#FFFFFF",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent Broadcast</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12.5px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Announcement Content / Details *
                </label>
                <textarea
                  rows={4}
                  placeholder="Type the announcement details and instructions for the staff..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "13.5px",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    background: "#FFFFFF",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #DB2777 0%, #BE185D 100%)",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: submitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 14px rgba(219, 39, 119, 0.3)",
                  }}
                >
                  <Send size={14} />
                  <span>{submitting ? "Broadcasting..." : "Deploy Announcement"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CompanyAnnouncementsCard;

