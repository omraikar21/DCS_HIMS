// ==========================================
// DCS-HIMS BACKEND SERVER - RELOADED
// B1/B2/B3 - SERVER FOUNDATION
// ==========================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================

dotenv.config();


// ==========================================
// DATABASE
// ==========================================

const {
  testDatabaseConnection,
} = require("./config/database");


// ==========================================
// ROUTES
// ==========================================

const databaseRoutes =
  require("./routes/databaseRoutes");

// ==========================================
// CREATE EXPRESS APP
// ==========================================

const app = express();


// ==========================================
// PORT
// ==========================================

const PORT =
  process.env.PORT || 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

// Allow frontend to communicate
// with backend.
const authRoutes =
  require("./routes/authRoutes");


const authTestRoutes =
  require("./routes/authTestRoutes");

const roleTestRoutes =
  require("./routes/roleTestRoutes");


const dashboardRoutes =
  require("./routes/dashboardRoutes");

const employeeRoutes =
  require("./routes/employeeRoutes");

const departmentRoutes =
  require("./routes/departmentRoutes");

const attendanceRoutes =
  require("./routes/attendanceRoutes");

const leaveRoutes =
  require("./routes/leaveRoutes");

const payrollRoutes =
  require("./routes/payrollRoutes");

const payslipRoutes =
  require("./routes/payslipRoutes");


const recruitmentRoutes =
  require("./routes/recruitmentRoutes");

const documentRoutes =
  require("./routes/documentRoutes");

const onboardingRoutes =
  require("./routes/onboardingRoutes");

const settingsRoutes =
  require("./routes/settingsRoutes");

const auditRoutes =
  require("./routes/auditRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");

const userRoutes =
  require("./routes/userRoutes");





app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin) ||
        origin === process.env.CLIENT_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);



// ------------------------------------------
// JSON REQUEST BODY (SUPPORT BASE64 AVATARS & PDFS)
// ------------------------------------------

app.use(
  express.json({
    limit: "25mb",
  })
);


// ------------------------------------------
// FORM DATA
// ------------------------------------------

app.use(
  express.urlencoded({
    limit: "25mb",
    extended: true,
  })
);


// ==========================================
// BASIC SERVER ROUTE
// ==========================================

app.get(
  "/",
  (req, res) => {

    res.json({

      success: true,

      message:
        "DCS-HIMS Backend Server is running",

    });

  }
);


// ==========================================
// HEALTH CHECK
// ==========================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      success: true,

      message:
        "DCS-HIMS API is healthy",

      server:
        "running",

      database:
        "PostgreSQL",

    });

  }
);


// ==========================================
// DATABASE TEST ROUTE
// B2
// ==========================================

app.use(
  "/api/database",
  databaseRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/auth-test",
  authTestRoutes
);

app.use(
  "/api/role-test",
  roleTestRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/employees",
  employeeRoutes
);


app.use(
  "/api/departments",
  departmentRoutes
);

app.use(
  "/api/attendance",
  attendanceRoutes
);


app.use(
  "/api/leaves",
  leaveRoutes
);


app.use(
  "/api/payroll",
  payrollRoutes
);

app.use(
  "/api/payslips",
  payslipRoutes
);


app.use(
  "/api/recruitment",
  recruitmentRoutes
);

app.use(
  "/api/documents",
  documentRoutes
);

app.use(
  "/api/onboarding",
  onboardingRoutes
);

app.use(
  "/api/settings",
  settingsRoutes
);

app.use(
  "/api/audit-logs",
  auditRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);

app.use(
  "/api/users",
  userRoutes
);




// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "API route not found",

    });

  }
);




// ==========================================
// START SERVER
// ==========================================

const startServer =
  async () => {

    try {

      // Test PostgreSQL
      // before starting server.
      await testDatabaseConnection();

      // Ensure all database tables, relations, and initial seeds exist
      const { initDatabase } = require("./database/initDb");
      await initDatabase();

      // Ensure system settings table & defaults exist
      const { initSettingsTable } = require("./models/settingsModel");
      await initSettingsTable();

      // Ensure all enrolled employees have active user accounts
      const { syncAllEmployeesToUsers } = require("./models/userModel");
      await syncAllEmployeesToUsers();


      app.listen(
        PORT,
        () => {

          console.log(
            "=================================="
          );

          console.log(
            "DCS-HIMS Backend Server"
          );

          console.log(
            "PostgreSQL connected"
          );

          console.log(
            `Server running on port ${PORT}`
          );

          console.log(
            `http://localhost:${PORT}`
          );

          console.log(
            "=================================="
          );

        }
      );


    } catch (error) {

      console.error(
        "Unable to start server:"
      );

      console.error(
        error.message
      );

      process.exit(1);

    }

  };


startServer();