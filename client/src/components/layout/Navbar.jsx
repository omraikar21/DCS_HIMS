import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  ScrollText,
  LogOut,
  Megaphone,
  Receipt,
  FileText,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getStoredUser } from "../../services/authService";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../services/notificationService";
import { getLoadedSettings } from "../../services/settingsService";

function Navbar({
  pageTitle = "Dashboard",
  onMenuClick,
}) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || user || {});
  const [settings, setSettings] = useState(() => getLoadedSettings());
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Live notifications list from Backend
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // Polling for new notices every 15s

    const handleProfileUpdate = () => {
      const updated = getStoredUser();
      if (updated) setCurrentUser(updated);
    };
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    const handleSettingsUpdate = () => {
      setSettings(getLoadedSettings());
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    window.addEventListener("dcsNotificationsUpdated", handleNotificationUpdate);
    window.addEventListener("dcsSettingsUpdated", handleSettingsUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
      window.removeEventListener("dcsNotificationsUpdated", handleNotificationUpdate);
      window.removeEventListener("dcsSettingsUpdated", handleSettingsUpdate);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (item) => {
    setNotificationOpen(false);
    if (!item.is_read) {
      await markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
    }

    const typeStr = (item.type || "").toUpperCase();
    const catStr = (item.category || "").toLowerCase();
    const titleStr = (item.title || "").toLowerCase();
    const msgStr = (item.message || "").toLowerCase();

    // 1. If it is a Payslip, Document, Financial Report, Payroll, or Salary statement:
    if (
      typeStr === "REPORT" ||
      typeStr === "PAYROLL" ||
      typeStr === "PAYSLIP" ||
      typeStr === "DOCUMENT" ||
      catStr.includes("report") ||
      catStr.includes("payroll") ||
      catStr.includes("finance") ||
      catStr.includes("document") ||
      titleStr.includes("report") ||
      titleStr.includes("slip") ||
      titleStr.includes("payslip") ||
      titleStr.includes("payroll") ||
      titleStr.includes("salary") ||
      titleStr.includes("document") ||
      msgStr.includes("report") ||
      msgStr.includes("payslip") ||
      msgStr.includes("document") ||
      msgStr.includes("disbursed")
    ) {
      if (titleStr.includes("document") || catStr.includes("document") || typeStr === "DOCUMENT") {
        navigate("/documents");
      } else {
        navigate("/reports");
      }
      return;
    }

    // 2. If it is a Notice, Announcement, Holiday, or System broadcast:
    if (
      typeStr === "ANNOUNCEMENT" ||
      typeStr === "NOTICE" ||
      catStr.includes("announcement") ||
      catStr.includes("notice") ||
      titleStr.includes("notice") ||
      titleStr.includes("announcement") ||
      titleStr.includes("holiday") ||
      msgStr.includes("notice") ||
      msgStr.includes("holiday") ||
      msgStr.includes("announcement")
    ) {
      navigate("/announcements");
      return;
    }

    // 3. Follow explicit link if defined
    if (item.link) {
      navigate(item.link);
      return;
    }

    // Default to announcements
    navigate("/announcements");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  const userName = currentUser?.name || user?.name || "DCS User";
  const userEmail = currentUser?.email || user?.email || "user@dcs.com";
  const userRole = role || currentUser?.role || user?.role || "ADMIN";
  const userAvatar = currentUser?.avatar || "";

  const getInitials = (name) => {
    if (!name) return "OR";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const initials = getInitials(userName);

  const roleLabelMap = {
    ADMIN: "Administrator",
    HR: "HR Manager",
    FINANCE: "Finance Manager",
    EMPLOYEE: "Employee",
  };

  const displayRole = roleLabelMap[userRole?.toUpperCase()] || userRole;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "ANNOUNCEMENT":
        return <Megaphone size={14} color="#DB2777" />;
      case "PAYROLL":
        return <Receipt size={14} color="#059669" />;
      case "REPORT":
        return <FileText size={14} color="#2563EB" />;
      default:
        return <Bell size={14} color="#DB2777" />;
    }
  };

  return (
    <header className="navbar">

      {/* LEFT */}
      <div className="navbar-left">
        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="navbar-label">
            {settings.companyName?.toUpperCase() || "DCS OFFICE MANAGEMENT"}
          </p>

          <h3>
            {pageTitle}
          </h3>
        </div>
      </div>

      {/* RIGHT */}
      <div className="navbar-right">

        {/* NOTIFICATION DROPDOWN */}
        <div className="navbar-dropdown-wrapper" ref={notifRef}>
          <button
            className={`notification-button ${notificationOpen ? "active" : ""}`}
            onClick={() => {
              setNotificationOpen((prev) => !prev);
              setProfileOpen(false);
            }}
            title="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="notification-dot" />}
          </button>

          {notificationOpen && (
            <div className="navbar-popover notification-popover">
              <div className="popover-header">
                <h4>
                  Notifications
                  {unreadCount > 0 && (
                    <span className="popover-header-badge">{unreadCount} new</span>
                  )}
                </h4>
                {unreadCount > 0 && (
                  <button className="popover-mark-read" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list-mini">
                {notifications.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
                    No notifications right now.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className={`notification-item-mini ${!item.is_read ? "unread" : ""}`}
                      onClick={() => handleNotificationClick(item)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="notification-icon-mini">
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="notification-body-mini">
                        <div className="notification-title-mini" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                          <span>{item.title}</span>
                          <span style={{ fontSize: "10px", color: "#64748B", fontWeight: 700 }}>
                            {item.sender_role}
                          </span>
                        </div>
                        <div className="notification-desc-mini">{item.message}</div>
                        <div className="notification-time-mini" style={{ fontSize: "11px", color: "#94A3B8" }}>
                          {item.category || item.type} · {new Date(item.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>


        {/* PROFILE DROPDOWN */}
        <div className="navbar-dropdown-wrapper" ref={profileRef}>
          <button
            className={`navbar-profile ${profileOpen ? "active" : ""}`}
            onClick={() => {
              setProfileOpen((prev) => !prev);
              setNotificationOpen(false);
            }}
          >
            <div className="navbar-avatar" style={{ overflow: "hidden" }}>
              {userAvatar ? (
                <img src={userAvatar} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                initials
              )}
            </div>

            <div className="navbar-profile-info">
              <strong>{userName}</strong>
              <span>{displayRole}</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {profileOpen && (
            <div className="navbar-popover profile-popover">
              <div className="profile-popover-header">
                <div className="profile-popover-user">
                  <div className="profile-popover-avatar" style={{ overflow: "hidden" }}>
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="profile-popover-details">
                    <strong>{userName}</strong>
                    <span>{userEmail}</span>
                    <span className="profile-role-badge">{userRole}</span>
                  </div>
                </div>
              </div>

              <div className="profile-menu-list">
                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>

                {userRole?.toUpperCase() === "ADMIN" && (
                  <>
                    <button
                      className="profile-menu-item"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/settings");
                      }}
                    >
                      <Settings size={16} />
                      <span>System Settings</span>
                    </button>

                    <button
                      className="profile-menu-item"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/audit-logs");
                      }}
                    >
                      <ScrollText size={16} />
                      <span>User Logs</span>
                    </button>
                  </>
                )}

                <button
                  className="profile-menu-item logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}

export default Navbar;