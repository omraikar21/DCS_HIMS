// ==========================================
// NOTIFICATION & ANNOUNCEMENT ROUTES
// Express Router
// ==========================================

const express = require("express");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const {
  getNotifications,
  getAnnouncements,
  createAnnouncement,
  sendFinanceNotice,
  markRead,
  markAllRead,
} = require("../controllers/notificationController");

const router = express.Router();

// ------------------------------------------
// GET LOGGED-IN USER NOTIFICATIONS
// ALL ROLES
// ------------------------------------------
router.get("/", authenticateToken, getNotifications);

// ------------------------------------------
// GET COMPANY ANNOUNCEMENTS
// ALL ROLES
// ------------------------------------------
router.get("/announcements", authenticateToken, getAnnouncements);

// ------------------------------------------
// POST COMPANY ANNOUNCEMENT
// ADMIN + HR
// ------------------------------------------
router.post(
  "/announcements",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  createAnnouncement
);

// ------------------------------------------
// POST FINANCE NOTICE (TARGET EMPLOYEE + ADMIN)
// FINANCE + ADMIN
// ------------------------------------------
router.post(
  "/finance-statement",
  authenticateToken,
  authorizeRoles("FINANCE", "ADMIN"),
  sendFinanceNotice
);

// ------------------------------------------
// PUT MARK SINGLE NOTIFICATION AS READ
// ------------------------------------------
router.put("/:id/read", authenticateToken, markRead);

// ------------------------------------------
// PUT MARK ALL AS READ
// ------------------------------------------
router.put("/read-all", authenticateToken, markAllRead);

module.exports = router;
