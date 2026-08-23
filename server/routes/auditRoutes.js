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
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

// GET /api/audit-logs - ADMIN / SUPER_ADMIN only
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "SUPER_ADMIN"),
  getAuditLogs
);

// POST /api/audit-logs - All authenticated users can record system audit events
router.post(
  "/",
  authenticateToken,
  recordAuditEvent
);

module.exports = router;
