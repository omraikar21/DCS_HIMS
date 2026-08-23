import { lazy, Suspense } from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout & Route Guards (Static)
import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import PageLoader from "../components/common/PageLoader";

// Lazy-Loaded Page Components (Route-Based Code Splitting)
const Login = lazy(() => import("../pages/auth/Login"));
const ApiTestPage = lazy(() => import("../pages/ApiTestPage"));
const AdminDashboard = lazy(() => import("../components/dashboard/AdminDashboard"));
const HRDashboard = lazy(() => import("../pages/dashboard/HRDashboard"));
const EmployeeDashboard = lazy(() => import("../pages/dashboard/EmployeeDashboard"));
const FinanceDashboard = lazy(() => import("../pages/dashboard/FinanceDashboard"));
const Employees = lazy(() => import("../pages/employees/Employees"));
const EmployeeProfile = lazy(() => import("../pages/employees/EmployeeProfile"));
const Departments = lazy(() => import("../pages/departments/Departments"));
const DepartmentProfile = lazy(() => import("../pages/departments/DepartmentProfile"));
const Attendance = lazy(() => import("../pages/attendance/Attendance"));
const LeaveManagement = lazy(() => import("../pages/leave/LeaveManagement"));
const Payroll = lazy(() => import("../pages/payroll/Payroll"));
const Documents = lazy(() => import("../pages/documents/Documents"));
const Payslips = lazy(() => import("../pages/payslips/Payslips"));
const Recruitment = lazy(() => import("../pages/recruitment/Recruitment"));
const Onboarding = lazy(() => import("../pages/onboarding/Onboarding"));
const Unauthorized = lazy(() => import("../pages/errors/Unauthorized"));
const StateTest = lazy(() => import("../pages/errors/StateTest"));
const Reports = lazy(() => import("../pages/reports/Reports"));
const Announcements = lazy(() => import("../pages/announcements/Announcements"));
const Notifications = lazy(() => import("../pages/notifications/Notifications"));
const Settings = lazy(() => import("../pages/settings/Settings"));
const AuditLogs = lazy(() => import("../pages/audit/AuditLogs"));
const Profile = lazy(() => import("../pages/profile/Profile"));
const UserManagement = lazy(() => import("../pages/users/UserManagement"));



// ============================================
// APP ROUTES
// ============================================

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>


      {/* ======================================
          PUBLIC ROUTES
      ====================================== */}

      <Route
        path="/login"
        element={
          <Login />
        }
      />


      {/* ======================================
          ALL PROTECTED APPLICATION ROUTES

          Everything inside this route requires
          the user to be authenticated.
      ====================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >


        {/* ====================================
            A10 API TEST PAGE & STATE TEST (DEV ONLY)
        ==================================== */}
        {import.meta.env.DEV && (
          <>
            <Route
              path="/api-test"
              element={
                <ApiTestPage />
              }
            />
            <Route
              path="/state-test"
              element={
                <StateTest />
              }
            />
          </>
        )}


        {/* ====================================
            ADMIN DASHBOARD
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
              ]}
            />
          }
        >

          <Route
            path="/dashboard"
            element={
              <Layout role="ADMIN">
                <AdminDashboard />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            HR DASHBOARD
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "HR",
              ]}
            />
          }
        >

          <Route
            path="/hr-dashboard"
            element={
              <Layout role="HR">
                <HRDashboard />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            EMPLOYEE DASHBOARD
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/employee-dashboard"
            element={
              <Layout role="EMPLOYEE">
                <EmployeeDashboard />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            FINANCE DASHBOARD
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "FINANCE",
              ]}
            />
          }
        >

          <Route
            path="/finance-dashboard"
            element={
              <Layout role="FINANCE">
                <FinanceDashboard />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            EMPLOYEE MANAGEMENT
            ADMIN + HR
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
              ]}
            />
          }
        >

          <Route
            path="/employees"
            element={
              <Layout>
                <Employees />
              </Layout>
            }
          />

          <Route
            path="/employees/:id"
            element={
              <Layout>
                <EmployeeProfile />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            DEPARTMENT MANAGEMENT
            ADMIN + HR
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
              ]}
            />
          }
        >

          <Route
            path="/departments"
            element={
              <Layout>
                <Departments />
              </Layout>
            }
          />

          <Route
            path="/departments/:id"
            element={
              <Layout>
                <DepartmentProfile />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            ATTENDANCE
            ADMIN + HR + EMPLOYEE + FINANCE
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
                "EMPLOYEE",
                "FINANCE",
              ]}
            />
          }
        >

          <Route
            path="/attendance"
            element={
              <Layout>
                <Attendance />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            LEAVE
            ADMIN + HR + EMPLOYEE
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/leave"
            element={
              <Layout>
                <LeaveManagement />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            PAYROLL
            ADMIN + FINANCE
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "FINANCE",
              ]}
            />
          }
        >

          <Route
            path="/payroll"
            element={
              <Layout>
                <Payroll />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            DOCUMENTS
            ADMIN + HR + EMPLOYEE
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/documents"
            element={
              <Layout>
                <Documents />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            PAYSLIPS
            ADMIN + FINANCE + EMPLOYEE
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "FINANCE",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/payslips"
            element={
              <Layout>
                <Payslips />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            RECRUITMENT
            ADMIN + HR
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
              ]}
            />
          }
        >

          <Route
            path="/recruitment"
            element={
              <Layout>
                <Recruitment />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            ONBOARDING
            ADMIN + HR
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
              ]}
            />
          }
        >

          <Route
            path="/onboarding"
            element={
              <Layout>
                <Onboarding />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            REPORTS
            ADMIN + HR + FINANCE
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
                "FINANCE",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/reports"
            element={
              <Layout>
                <Reports />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            ANNOUNCEMENTS
            ALL AUTHENTICATED USERS
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
                "FINANCE",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/announcements"
            element={
              <Layout>
                <Announcements />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            NOTIFICATIONS
            ALL AUTHENTICATED USERS
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
                "FINANCE",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/notifications"
            element={
              <Layout>
                <Notifications />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            SETTINGS
            ADMIN ONLY
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
              ]}
            />
          }
        >

          <Route
            path="/settings"
            element={
              <Layout>
                <Settings />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            PROFILE
            ALL AUTHENTICATED USERS
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
                "FINANCE",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            TASKS
            EMPLOYEE
        {/* ====================================
            AUDIT LOGS
            ADMIN ONLY
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
              ]}
            />
          }
        >

          <Route
            path="/audit-logs"
            element={
              <Layout>
                <AuditLogs />
              </Layout>
            }
          />

        </Route>


        {/* ====================================
            SALARY
            ADMIN + FINANCE + EMPLOYEE
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "FINANCE",
                "EMPLOYEE",
              ]}
            />
          }
        >

          <Route
            path="/salary"
            element={
              <Navigate to="/payslips" replace />
            }
          />

        </Route>


        {/* ====================================
            USER & ROLE MANAGEMENT
            ADMIN + HR
        ==================================== */}

        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "ADMIN",
                "HR",
              ]}
            />
          }
        >

          <Route
            path="/user-management"
            element={
              <Layout>
                <UserManagement />
              </Layout>
            }
          />

        </Route>



      </Route>


      {/* ======================================
          DEFAULT ROUTE
      ====================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* ======================================
          UNKNOWN URL
      ====================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />


      {/* ======================================
          UNAUTHORIZED PAGE

          IMPORTANT:
          This must be outside ProtectedRoute,
          otherwise an unauthorized user would
          be redirected to login again.
      ====================================== */}

      <Route
        path="/unauthorized"
        element={
          <Unauthorized />
        }
      />


      </Routes>
    </Suspense>
  );
}


export default AppRoutes;