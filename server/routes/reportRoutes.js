// ==========================================
// CUSTOM REPORT ROUTES
// ==========================================

const express = require("express");
const router = express.Router();

const {
  getReports,
  addReport,
  removeReport,
} = require("../controllers/reportController");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

// GET /api/reports - All authenticated users
router.get("/", authenticateToken, getReports);

// POST /api/reports - Admin, Finance, HR
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "FINANCE", "HR"),
  addReport
);

// DELETE /api/reports/:id - Admin, Finance
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "FINANCE"),
  removeReport
);

module.exports = router;
