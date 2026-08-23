import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";


// ============================================
// AUTHENTICATION
// ============================================

import Login
  from "../pages/auth/Login";

import ApiTestPage
  from "../pages/ApiTestPage";


// ============================================
// LAYOUT
// ============================================

import Layout
  from "../components/layout/Layout";


// ============================================
// DASHBOARDS
// ============================================

import AdminDashboard
  from "../components/dashboard/AdminDashboard";

import HRDashboard
  from "../pages/dashboard/HRDashboard";

import EmployeeDashboard
  from "../pages/dashboard/EmployeeDashboard";

import FinanceDashboard
  from "../pages/dashboard/FinanceDashboard";


// ============================================
// EMPLOYEES
// ============================================

import Employees
  from "../pages/employees/Employees";

import EmployeeProfile
  from "../pages/employees/EmployeeProfile";


// ============================================
// DEPARTMENTS
// ============================================

import Departments
  from "../pages/departments/Departments";

import DepartmentProfile
  from "../pages/departments/DepartmentProfile";


// ============================================
// ATTENDANCE
// ============================================

import Attendance
  from "../pages/attendance/Attendance";


// ============================================
// LEAVE
// ============================================

import LeaveManagement
  from "../pages/leave/LeaveManagement";


// ============================================
// PAYROLL
// ============================================

import Payroll
  from "../pages/payroll/Payroll";


// ============================================
// DOCUMENTS
// ============================================

import Documents
  from "../pages/documents/Documents";


// ============================================
// PAYSLIPS
// ============================================

import Payslips
  from "../pages/payslips/Payslips";


// ============================================
// RECRUITMENT
// ============================================

import Recruitment
  from "../pages/recruitment/Recruitment";


// ============================================
// ONBOARDING
// ============================================

import Onboarding
  from "../pages/onboarding/Onboarding";


// ============================================
// ROUTE PROTECTION
// ============================================

import ProtectedRoute
  from "./ProtectedRoute";

import RoleRoute
  from "./RoleRoute";


// ============================================
// ERROR PAGE
// ============================================

import Unauthorized
  from "../pages/errors/Unauthorized";

import StateTest
  from "../pages/errors/StateTest";


// ============================================
// SECONDARY PAGES
// ============================================

import Reports from "../pages/reports/Reports";
import Announcements from "../pages/announcements/Announcements";
import Notifications from "../pages/notifications/Notifications";
import Settings from "../pages/settings/Settings";
import AuditLogs from "../pages/audit/AuditLogs";
import Profile from "../pages/profile/Profile";
import UserManagement from "../pages/users/UserManagement";


function Tasks() {
  return (
    <div>
      <div className="module-heading">
        <div>
          <p className="section-label">WORKFLOW</p>
          <h1>Tasks</h1>
          <p>Assigned duties, project milestones, and action items.</p>
        </div>
      </div>
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h3>Task List</h3>
            <p>Track ongoing task assignments and deliverables.</p>
          </div>
        </div>
        <div style={{ padding: "24px 0", color: "#64748b", fontSize: "14px" }}>
          <p>All assigned tasks are up to date.</p>
        </div>
      </section>
    </div>
  );
}

function Salary() {
  return (
    <div>
      <div className="module-heading">
        <div>
          <p className="section-label">FINANCE</p>
          <h1>Salary</h1>
          <p>Employee compensation and salary structures.</p>
        </div>
      </div>
      <section className="dashboard-card">
        <div className="card-header">
          <div>
            <h3>Salary Structure</h3>
            <p>Breakdown of base pay, standard allowances, and statutory deductions.</p>
          </div>
        </div>
      </section>
    </div>
  );
}



// ============================================
// APP ROUTES
// ============================================

function AppRoutes() {

  return (

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
            A10 API TEST PAGE

            TEMPORARY TEST ROUTE

            Purpose:
            Test React → API → PostgreSQL
            before full frontend integration.

            Authentication is required because
            the Employee API requires JWT.
        ==================================== */}

        <Route
          path="/api-test"
          element={
            <ApiTestPage />
          }
        />


        {/* ====================================
            STATE TEST
        ==================================== */}

        <Route
          path="/state-test"
          element={
            <StateTest />
          }
        />


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
            path="/tasks"
            element={
              <Layout>
                <Tasks />
              </Layout>
            }
          />

        </Route>


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
              <Layout>
                <Salary />
              </Layout>
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
  );
}


export default AppRoutes;