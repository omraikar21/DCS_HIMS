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
} from "lucide-react";


import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getLoadedSettings } from "../../services/settingsService";

const menuItems = {
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

    const normalizedRole = (role || "ADMIN").toUpperCase();
    const items =
        menuItems[normalizedRole] || menuItems.ADMIN;

    const handleNavigation = (path) => {
        navigate(path);
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
                        {normalizedRole}
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
                                onClick={() => handleNavigation(item.path)}
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
        </>
    );
}

export default Sidebar;