import {
    useState
} from "react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({
    children,
    role: propRole,
    onLogout: propOnLogout,
}) {
    const { role: authRole, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    const location = useLocation();

    // Prioritize authRole from context, fallback to propRole, then ADMIN
    const activeRole = authRole || propRole || "ADMIN";

    const handleLogout = () => {
        if (propOnLogout) {
            propOnLogout();
        } else {
            logout();
            navigate("/login");
        }
    };

    const pageTitles = {
        "/dashboard": "Dashboard",
        "/employees": "Employees",
        "/departments": "Departments",
        "/attendance": "Attendance",
        "/leave": "Leave Management",
        "/payroll": "Payroll",
        "/documents": "Documents",
        "/reports": "Reports",
        "/announcements": "Announcements",
        "/notifications": "Notifications",
        "/settings": "Settings",
        "/profile": "My Profile",
        "/audit-logs": "Audit Logs",
        "/payslips": "Payslips",
        "/recruitment": "Recruitment",
        "/onboarding": "Onboarding",
        "/hr-dashboard": "HR Dashboard",
        "/employee-dashboard": "Employee Dashboard",
        "/finance-dashboard": "Finance Dashboard",
    };

    const pageTitle =
        pageTitles[location.pathname] ||
        "Dashboard";

    return (
        <div className="app-layout">

            <Sidebar
                role={activeRole}
                isOpen={sidebarOpen}
                onClose={() =>
                    setSidebarOpen(false)
                }
                onLogout={handleLogout}
            />


            <main className="main-area">

                <Navbar
                    pageTitle={pageTitle}
                    onMenuClick={() =>
                        setSidebarOpen(true)
                    }
                />

                <div className="content">
                    {children}
                </div>

            </main>

        </div>
    );
}

export default Layout;