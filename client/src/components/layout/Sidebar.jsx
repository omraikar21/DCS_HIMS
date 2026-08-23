import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    ClipboardList,
    WalletCards,
    FileText,
    BarChart3,
    Megaphone,
    Bell,
    Settings,
    ScrollText,
    UserCircle,
    LogOut,
    X,
    UserPlus,
    ShieldCheck,
    BellRing,
    BadgeCheck,
} from "lucide-react";


import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { getLoadedSettings } from "../../services/settingsService";
import { createAnnouncement } from "../../services/notificationService";

const menuItems = {
    SUPER_ADMIN: [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Add Admin / Roles",
            path: "/user-management",
            icon: ShieldCheck,
        },
        {
            name: "Server Notices",
            path: "#server-notices",
            action: "OPEN_SERVER_NOTICE",
            icon: BellRing,
        },
        {
            name: "Audit Logs",
            path: "/audit-logs",
            icon: ScrollText,
        },
        {
            name: "Settings",
            path: "/settings",
            icon: Settings,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: UserCircle,
        },
    ],

    ADMIN: [
        {
            name: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Employees",
            path: "/employees",
            icon: Users,
        },
        {
            name: "Departments",
            path: "/departments",
            icon: Building2,
        },
        {
            name: "Attendance",
            path: "/attendance",
            icon: CalendarCheck,
        },
        {
            name: "Leave Management",
            path: "/leave",
            icon: ClipboardList,
        },
        {
            name: "Payroll",
            path: "/payroll",
            icon: WalletCards,
        },
        {
            name: "Documents",
            path: "/documents",
            icon: FileText,
        },
        {
            name: "Reports",
            path: "/reports",
            icon: BarChart3,
        },
        {
            name: "Announcements",
            path: "/announcements",
            icon: Megaphone,
        },
        {
            name: "Audit Logs",
            path: "/audit-logs",
            icon: ScrollText,
        },
        {
            name: "Team & Roles",
            path: "/user-management",
            icon: ShieldCheck,
        },
        {
            name: "Settings",
            path: "/settings",
            icon: Settings,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: UserCircle,
        },
    ],

    HR: [
        {
            name: "Dashboard",
            path: "/hr-dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Recruitment",
            path: "/recruitment",
            icon: Users,
        },
        {
            name: "Onboarding",
            path: "/onboarding",
            icon: UserPlus,
        },
        {
            name: "Employees",
            path: "/employees",
            icon: Users,
        },
        {
            name: "Departments",
            path: "/departments",
            icon: Building2,
        },
        {
            name: "Attendance",
            path: "/attendance",
            icon: CalendarCheck,
        },
        {
            name: "Leave Management",
            path: "/leave",
            icon: ClipboardList,
        },
        {
            name: "Finance Team",
            path: "/user-management",
            icon: ShieldCheck,
        },
        {
            name: "Documents",
            path: "/documents",
            icon: FileText,
        },
        {
            name: "Reports",
            path: "/reports",
            icon: BarChart3,
        },
        {
            name: "Announcements",
            path: "/announcements",
            icon: Megaphone,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: UserCircle,
        },
    ],


    EMPLOYEE: [
        {
            name: "Dashboard",
            path: "/employee-dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "My Attendance",
            path: "/attendance",
            icon: CalendarCheck,
        },
        {
            name: "My Leave",
            path: "/leave",
            icon: ClipboardList,
        },
        {
            name: "My Payslips",
            path: "/payslips",
            icon: WalletCards,
        },
        {
            name: "My Documents",
            path: "/documents",
            icon: FileText,
        },
        {
            name: "Reports",
            path: "/reports",
            icon: BarChart3,
        },
        {
            name: "Announcements",
            path: "/announcements",
            icon: Megaphone,
        },
        {
            name: "Notifications",
            path: "/notifications",
            icon: Bell,
        },
        {
            name: "My Profile",
            path: "/profile",
            icon: UserCircle,
        },
    ],

    FINANCE: [
        {
            name: "Dashboard",
            path: "/finance-dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Payroll",
            path: "/payroll",
            icon: WalletCards,
        },
        {
            name: "Payslips",
            path: "/payslips",
            icon: FileText,
        },
        {
            name: "Financial Reports",
            path: "/reports",
            icon: BarChart3,
        },
        {
            name: "Announcements",
            path: "/announcements",
            icon: Megaphone,
        },
        {
            name: "Profile",
            path: "/profile",
            icon: UserCircle,
        },
    ],
};

function Sidebar({
    role = "ADMIN",
    isOpen,
    onClose,
    onLogout,
}) {
    const navigate = useNavigate();
    const location = useLocation();

    const [settings, setSettings] = useState(() => getLoadedSettings());

    useEffect(() => {
        const handleSettingsUpdate = () => {
            setSettings(getLoadedSettings());
        };
        window.addEventListener("dcsSettingsUpdated", handleSettingsUpdate);
        return () => window.removeEventListener("dcsSettingsUpdated", handleSettingsUpdate);
    }, []);

    const { user, role: authRole } = useAuth();
    const isSuperAdmin = Boolean(
        user?.is_super_admin ||
        (user?.email && user.email.toLowerCase().trim() === "omraikar2128@gmail.com")
    );

    const normalizedRole = (role || authRole || "ADMIN").toUpperCase();
    const activeRoleKey = isSuperAdmin ? "SUPER_ADMIN" : normalizedRole;
    const items = menuItems[activeRoleKey] || menuItems.ADMIN;

    const notification = useNotification();
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [noticeData, setNoticeData] = useState({
        title: "Server Operations & Low Load Status Notice",
        timeframe: "Today 03:00 PM – 04:00 PM IST",
        message: "All backend services and PostgreSQL database nodes are operating normally under low load (12%). System latency < 40ms.",
        priority: "NORMAL",
        isShutdown: false,
    });
    const [sendingNotice, setSendingNotice] = useState(false);

    const handleSendNotice = async (e) => {
        if (e) e.preventDefault();
        if (!noticeData.title.trim() || !noticeData.message.trim()) {
            if (notification?.error) notification.error("Title and message are required");
            return;
        }

        try {
            setSendingNotice(true);
            const fullMessage = noticeData.timeframe.trim()
                ? `[TIMEFRAME: ${noticeData.timeframe.trim()}] ${noticeData.message.trim()}`
                : noticeData.message.trim();

            await createAnnouncement({
                title: noticeData.title.trim(),
                message: fullMessage,
                priority: noticeData.priority || "NORMAL",
                category: noticeData.isShutdown ? "Platform Maintenance / Downtime" : "Server Infrastructure",
            });
            setNoticeModalOpen(false);
            if (notification?.success) {
                notification.success("Server notice broadcast to all platform user dashboards!");
            }
        } catch (err) {
            console.error("Failed to broadcast server notice:", err);
            if (notification?.error) {
                notification.error(err.message || "Failed to broadcast notice");
            }
        } finally {
            setSendingNotice(false);
        }
    };

    const handleNavigation = (item) => {
        if (item.action === "OPEN_SERVER_NOTICE") {
            setNoticeModalOpen(true);
            onClose();
            return;
        }
        navigate(item.path);
        onClose();
    };

    const companyTitle = settings.companyName || "Dharam Consultancy Services";
    const titleParts = companyTitle.split(" ");
    const firstWord = titleParts[0] || "DCS";
    const restWords = titleParts.slice(1).join(" ") || "Corporate System";

    return (
        <>
            <aside
                className={`sidebar ${isOpen ? "sidebar-open" : ""
                    }`}
            >

                {/* SIDEBAR HEADER */}

                <div className="sidebar-header">

                    <div className="sidebar-logo">
                        <div
                            style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                border: "2px solid #F3D3E7",
                                boxShadow: "0 3px 10px rgba(219, 39, 119, 0.12)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "#FFFFFF",
                                flexShrink: 0,
                            }}
                        >
                            <img
                                src="/dcs-logo.png"
                                alt="DCS Logo"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transform: "scale(1.42)",
                                    display: "block",
                                }}
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <strong style={{ fontSize: "19px", fontWeight: "900", color: "#0F172A", letterSpacing: "1px", lineHeight: "1.1", margin: 0 }}>
                                DCS
                            </strong>
                            <span style={{ fontSize: "9px", fontWeight: "800", color: "#DB2777", letterSpacing: "1.2px", marginTop: "3px", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                DHARAM CONSULTANCY
                            </span>
                        </div>
                    </div>

                    <button
                        className="sidebar-close"
                        onClick={onClose}
                        type="button"
                        title="Close Menu"
                    >
                        <X size={20} />
                    </button>

                </div>


                {/* ROLE */}

                <div className="sidebar-role">
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10B981", display: "inline-block", flexShrink: 0 }} />
                        <span className="sidebar-role-label">ACTIVE ROLE</span>
                    </div>

                    <strong className="sidebar-role-value">
                        {isSuperAdmin ? "SUPER ADMIN" : normalizedRole}
                    </strong>
                </div>


                {/* MENU */}

                <nav className="sidebar-menu">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <button
                                key={item.name}
                                className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                                onClick={() => handleNavigation(item)}
                                type="button"
                                title={item.name}
                            >
                                <span className="sidebar-item-icon">
                                    <Icon size={18} />
                                </span>

                                <span className="sidebar-item-text">
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </nav>


                {/* LOGOUT */}

                <button
                    className="sidebar-logout"
                    onClick={onLogout}
                    type="button"
                    title="Sign Out of Session"
                >
                    <LogOut size={17} />
                    <span>Sign Out</span>
                </button>


            </aside>


            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onClose}
                />
            )}

            {/* SUPER ADMIN SERVER & DOWNTIME NOTICE MODAL */}
            {noticeModalOpen && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="employee-modal" style={{ maxWidth: "560px" }}>
                        <div className="modal-header">
                            <div>
                                <p className="section-label">PLATFORM GOVERNANCE</p>
                                <h2>Broadcast Server / Downtime Notice</h2>
                            </div>
                            <button className="modal-close" onClick={() => setNoticeModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendNotice}>
                            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                                    Broadcast real-time server health notifications, maintenance adjustments, or scheduled application downtime alerts directly from the developer console.
                                </p>

                                <div className="form-field">
                                    <label>Notification Subject / Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Server Maintenance & Temporary Downtime Alert"
                                        value={noticeData.title}
                                        onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Scheduled Timeframe / Window</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Today 03:00 PM – 04:00 PM IST (or Immediate)"
                                        value={noticeData.timeframe}
                                        onChange={(e) => setNoticeData({ ...noticeData, timeframe: e.target.value })}
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Notice Priority</label>
                                    <select
                                        value={noticeData.priority}
                                        onChange={(e) => setNoticeData({ ...noticeData, priority: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid #EACEE3",
                                            backgroundColor: "#FFFFFF",
                                            fontSize: "13.5px",
                                            color: "#18243A",
                                            fontWeight: "600",
                                        }}
                                    >
                                        <option value="NORMAL">Normal / Low Load Status Notice</option>
                                        <option value="HIGH">High Priority / Scheduled Maintenance</option>
                                        <option value="CRITICAL">Critical Infrastructure / Application Shutdown</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>Detailed System Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="e.g. The application will undergo scheduled server optimization..."
                                        value={noticeData.message}
                                        onChange={(e) => setNoticeData({ ...noticeData, message: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid #EACEE3",
                                            fontFamily: "inherit",
                                            fontSize: "13px",
                                            resize: "vertical",
                                        }}
                                    />
                                </div>

                                <div style={{ padding: "12px", background: "#EDF9F2", borderRadius: "8px", border: "1px solid #A3E4C3", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <BadgeCheck size={18} color="#2E9B67" style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: "12px", color: "#2E9B67", lineHeight: "1.4" }}>
                                        <strong>Immediate Delivery:</strong> Recorded in database audit logs and instantly pushed to all active user dashboards.
                                    </span>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ borderTop: "1px solid #EACEE3", padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => setNoticeModalOpen(false)}
                                    disabled={sendingNotice}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={sendingNotice}
                                    style={{ background: "#9E2682", borderColor: "#9E2682" }}
                                >
                                    {sendingNotice ? "Broadcasting..." : "Broadcast Server Notice"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default Sidebar;