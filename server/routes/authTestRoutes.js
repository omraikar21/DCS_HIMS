// ==========================================
// AUTHENTICATION TEST ROUTES
// B5
// ==========================================

const express = require("express");


const {
  authenticateToken,
} = require("../middleware/authMiddleware");


const {
  getAuthenticatedUser,
} = require("../controllers/authTestController");


const router =
  express.Router();


// ------------------------------------------
// PROTECTED TEST
// ------------------------------------------

router.get(
  "/me",
  authenticateToken,
  getAuthenticatedUser
);


module.exports = router;