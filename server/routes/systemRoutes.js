// ==========================================
// SYSTEM ROUTES
// Express Router for System Monitoring & Telemetry
// ==========================================

const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { getSystemMetrics } = require("../controllers/systemMetricsController");

router.get("/metrics", authenticateToken, getSystemMetrics);

module.exports = router;
