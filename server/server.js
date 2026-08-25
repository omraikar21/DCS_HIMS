// ==========================================
// DCS-HIMS BACKEND SERVER
// Production Express Application Entry Point
// ==========================================

const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// ==========================================
// LOAD ENVIRONMENT VARIABLES
// ==========================================
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

// ==========================================
// DATABASE CONFIGURATION
// ==========================================
const { testDatabaseConnection } = require("./config/database");

// ==========================================
// ROUTE HANDLERS
// ==========================================
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const recruitmentRoutes = require("./routes/recruitmentRoutes");
const documentRoutes = require("./routes/documentRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const auditRoutes = require("./routes/auditRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");
const reportRoutes = require("./routes/reportRoutes");
const systemRoutes = require("./routes/systemRoutes");

// ==========================================
// INITIALIZE EXPRESS APP & PORT
// ==========================================
const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// GLOBAL MIDDLEWARES
// ==========================================
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, postman, same-origin)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
      ].filter(Boolean);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".onrender.com") ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Access denied for origin ${origin}`));
    },
    credentials: true,
  })
);

// Support JSON request body up to 25MB (for base64 avatar images & documents)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// ==========================================
// ROOT & HEALTH CHECK ROUTES
// ==========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "DCS-HIMS Backend Server is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DCS-HIMS API is healthy",
    server: "running",
    database: "PostgreSQL",
  });
});

// ==========================================
// APPLICATION API ROUTES
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/recruitment", recruitmentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/system", systemRoutes);

// ==========================================
// 404 CATCH-ALL ROUTE
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

// ==========================================
// START SERVER & DATABASE INITIALIZATION
// ==========================================
const startServer = async () => {
  try {
    // 1. Verify PostgreSQL connection
    await testDatabaseConnection();

    // 2. Run Database Migrations
    const { runMigrations } = require("./database/migrator");
    await runMigrations();

    // 3. Ensure all database tables, relations, and initial seeds exist
    const { initDatabase } = require("./database/initDb");
    await initDatabase();

    // 3. Ensure system settings table & defaults exist
    const { initSettingsTable } = require("./models/settingsModel");
    await initSettingsTable();

    // 4. Ensure all enrolled employees have active user accounts
    const { syncAllEmployeesToUsers } = require("./models/userModel");
    await syncAllEmployeesToUsers();

    // 5. Start HTTP Listener
    app.listen(PORT, () => {
      console.log("==================================");
      console.log("DCS-HIMS Backend Server");
      console.log("PostgreSQL connected");
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log("==================================");
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();