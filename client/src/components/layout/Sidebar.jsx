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
    Settings,
    ScrollText,
    UserCircle,
    LogOut,
    X,
    ShieldCheck,
    BellRing,
    BadgeCheck,
    Activity,
} from "lucide-react";


import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import { createAnnouncement } from "../../services/notificationService";

const menuItems = {
    SUPER_ADMIN: [
        {
            name: "Server Load",
            path: "/server-load",
            icon: Activity,
        },
        {
            name: "Add Primary Admin",
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
            name: "User Logs",
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
            name: "Roles & Team Users",
            path: "/user-management",
            icon: ShieldCheck,
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
            name: "Finance Reports",
            path: "/reports",
            icon: BarChart3,
        },
        {
            name: "Announcements",
            path: "/announcements",
            icon: Megaphone,
        },
        {
            name: "User Logs",
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

    HR: [
        {
            name: "Dashboard",
            path: "/hr-dashboard",
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
            name: "Roles & Team Users",
            path: "/user-management",
            icon: ShieldCheck,
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

    FINANCE: [
        {
            name: "Dashboard",
            path: "/finance-dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Payroll (TL, HR, Emp)",
            path: "/payroll",
            icon: WalletCards,
        },
        {
            name: "Company Payslips",
            path: "/payslips",
            icon: FileText,
        },
        {
            name: "Finance Reports for Admin",
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

    TEAM_LEAD: [
        {
            name: "Dashboard",
            path: "/team-lead-dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "My Team",
            path: "/departments",
            icon: Users,
        },
        {
            name: "Leave Management",
            path: "/leave",
            icon: ClipboardList,
        },
        {
            name: "Department Attendance",
            path: "/attendance",
            icon: CalendarCheck,
        },
        {
            name: "Announcements",
            path: "/announcements",
            icon: Megaphone,
        },
        {
            name: "My Profile",
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
            name: "My Leave Application",
            path: "/leave",
            icon: ClipboardList,
        },
        {
            name: "My Payslips",
            path: "/payslips",
            icon: WalletCards,
        },
        {
            name: "Announcements",
            path: "/announcements",
            icon: Megaphone,
        },
        {
            name: "My Profile",
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

    const { user, role: authRole } = useAuth();
    const userEmailClean = (user?.email || "").toLowerCase().trim();
    const isSuperAdmin = Boolean(
        user?.is_super_admin ||
        userEmailClean === "omraikar2128@gmail.com" ||
        userEmailClean === "omraikar2128@gamil.com"
    );

    const normalizedRole = (role || authRole || "ADMIN").toUpperCase();
    const activeRoleKey = isSuperAdmin ? "SUPER_ADMIN" : (normalizedRole === "TEAM_LEAD" ? "TEAM_LEAD" : normalizedRole);
    const items = menuItems[activeRoleKey] || menuItems.ADMIN;

    const notification = useNotification();
    const [noticeModalOpen, setNoticeModalOpen] = useState(false);
    const [noticeData, setNoticeData] = useState({
        title: "",
        timeframe: "",
        message: "",
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

    return (
        <>
            {/* MOBILE BACKDROP OVERLAY */}
            <div
                className={`sidebar-backdrop ${isOpen ? "active" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <aside
                className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
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
                    <div className="employee-modal" style={{ maxWidth: "560px", width: "92%", maxHeight: "88vh", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", background: "#FFFFFF", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
                        <div className="modal-header" style={{ padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                            <div>
                                <p className="section-label" style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", letterSpacing: "0.6px", textTransform: "uppercase", margin: 0 }}>System Announcement</p>
                                <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0F172A", margin: "4px 0 0" }}>Send System Announcement</h2>
                            </div>
                            <button className="modal-close" onClick={() => setNoticeModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSendNotice} style={{ display: "flex", flexDirection: "column", flex: 1, margin: 0, overflow: "hidden" }}>
                            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", maxHeight: "calc(88vh - 130px)" }}>
                                <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
                                    Send an announcement or maintenance update to all user dashboards.
                                </p>

                                <div className="form-field">
                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Announcement Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. System Maintenance Notice"
                                        value={noticeData.title}
                                        onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                                        style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "13.5px", color: "#0F172A", outline: "none" }}
                                    />
                                </div>

                                <div className="form-field">
                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Timeframe / Schedule</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Today 03:00 PM – 04:00 PM (or Immediate)"
                                        value={noticeData.timeframe}
                                        onChange={(e) => setNoticeData({ ...noticeData, timeframe: e.target.value })}
                                        style={{ width: "100%", height: "42px", padding: "0 14px", borderRadius: "8px", border: "1.5px solid #CBD5E1", fontSize: "13.5px", color: "#0F172A", outline: "none" }}
                                    />
                                </div>

                                <div className="form-field">
                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Priority</label>
                                    <select
                                        value={noticeData.priority}
                                        onChange={(e) => setNoticeData({ ...noticeData, priority: e.target.value })}
                                        style={{
                                            width: "100%",
                                            height: "42px",
                                            padding: "0 14px",
                                            borderRadius: "8px",
                                            border: "1.5px solid #CBD5E1",
                                            backgroundColor: "#FFFFFF",
                                            fontSize: "13.5px",
                                            color: "#0F172A",
                                            fontWeight: "600",
                                            outline: "none",
                                        }}
                                    >
                                        <option value="NORMAL">Normal Notice</option>
                                        <option value="HIGH">Important Maintenance</option>
                                        <option value="CRITICAL">Critical Update</option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155" }}>Message *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Enter detailed announcement message..."
                                        value={noticeData.message}
                                        onChange={(e) => setNoticeData({ ...noticeData, message: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1.5px solid #CBD5E1",
                                            fontFamily: "inherit",
                                            fontSize: "13.5px",
                                            color: "#0F172A",
                                            resize: "vertical",
                                            outline: "none",
                                        }}
                                    />
                                </div>

                                <div style={{ padding: "12px 14px", background: "#ECFDF5", borderRadius: "8px", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <BadgeCheck size={18} color="#10B981" style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: "12px", color: "#065F46", lineHeight: "1.4" }}>
                                        <strong>Immediate Delivery:</strong> Broadcast instantly to active user dashboards.
                                    </span>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ borderTop: "1px solid #E2E8F0", padding: "14px 24px", display: "flex", justifyContent: "flex-end", gap: "10px", background: "#F8FAFC" }}>
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => setNoticeModalOpen(false)}
                                    disabled={sendingNotice}
                                    style={{ padding: "10px 18px", borderRadius: "8px" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={sendingNotice}
                                    style={{ background: "#1E293B", borderColor: "#1E293B", color: "#FFFFFF", padding: "10px 20px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)" }}
                                >
                                    {sendingNotice ? "Sending..." : "Send Announcement"}
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