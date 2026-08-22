// ==========================================
// SYSTEM SETTINGS ROUTES
// ==========================================

const express = require("express");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const {
  fetchSettings,
  updateSettings,
} = require("../controllers/settingsController");

const router = express.Router();

// GET SETTINGS - ALL AUTHENTICATED USERS
router.get(
  "/",
  authenticateToken,
  fetchSettings
);

// UPDATE SETTINGS - ADMIN ONLY
router.put(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  updateSettings
);

module.exports = router;
