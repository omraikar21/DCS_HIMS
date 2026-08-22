// ==========================================
// USER & ROLE MANAGEMENT ROUTES
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
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

// ------------------------------------------
// GET ALL USERS (ADMIN & HR)
// ------------------------------------------
router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  getUsers
);

// ------------------------------------------
// CREATE USER (ADMIN & HR)
// ------------------------------------------
router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  createUser
);

// ------------------------------------------
// UPDATE USER (ADMIN & HR)
// ------------------------------------------
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  updateUser
);

// ------------------------------------------
// DELETE USER (ADMIN & HR)
// ------------------------------------------
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  deleteUser
);

module.exports = router;
