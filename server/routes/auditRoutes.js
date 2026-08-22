// ==========================================
// AUDIT LOG ROUTES
// ==========================================

const express = require("express");
const router = express.Router();

const {
  getAuditLogs,
  recordAuditEvent,
} = require("../controllers/auditController");

const {
  protect,
} = require("../middleware/authMiddleware");

// GET /api/audit-logs
router.get("/", getAuditLogs);

// POST /api/audit-logs
router.post("/", recordAuditEvent);

module.exports = router;
