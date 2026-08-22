import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Clock, FileText, Check, Trash2, Megaphone, Receipt, ArrowRight } from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationService";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handleUpdate = () => {
      load();
    };
    window.addEventListener("dcsNotificationsUpdated", handleUpdate);
    return () => window.removeEventListener("dcsNotificationsUpdated", handleUpdate);
  }, []);

  const markAllRead = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleItemClick = async (item) => {
    if (!item.is_read) {
      await markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <Megaphone size={17} color="#DB2777" />;
      case "PAYROLL":
        return <Receipt size={17} color="#059669" />;
      case "REPORT":
        return <FileText size={17} color="#2563EB" />;
      case "ATTENDANCE":
        return <Clock size={17} color="#D97706" />;
      default:
        return <Bell size={17} color="#DB2777" />;
    }
  };

  return (
    <div className="notifications-page">
      <div className="module-heading">
        <div>
          <p className="section-label">ACTIVITY & ALERTS</p>
          <h1>Notifications</h1>
          <p>Real-time circulars, leave updates, payslip alerts, and company broadcasts.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" onClick={markAllRead}>
            <Check size={16} />
            Mark all read
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {loading ? (
          <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b" }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="dashboard-card" style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#64748b" }}>No notifications at this time.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="dashboard-card"
              onClick={() => handleItemClick(item)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                borderLeft: item.is_read ? "1px solid #E2E8F0" : "4px solid #DB2777",
                backgroundColor: item.is_read ? "#FFFFFF" : "#FFF8FC",
                cursor: item.link ? "pointer" : "default",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  backgroundColor: item.is_read ? "#F1F5F9" : "#FFF0F7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {getTypeIcon(item.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexWrap: "wrap", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <strong style={{ fontSize: "15px", color: "#0F172A" }}>{item.title}</strong>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: "#F1F5F9",
                        color: "#475569",
                      }}
                    >
                      {item.sender_role}
                    </span>
                  </div>

                  <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                    {new Date(item.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <p style={{ color: "#475569", fontSize: "13.5px", margin: "0 0 6px 0", lineHeight: "1.5" }}>
                  {item.message}
                </p>

                {item.link && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#DB2777", fontWeight: "700" }}>
                    <span>Open details</span>
                    <ArrowRight size={13} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;

