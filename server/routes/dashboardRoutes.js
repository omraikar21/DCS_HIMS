// ==========================================
// DASHBOARD ROUTES
// B8
// ==========================================

const express = require("express");


const {
  authenticateToken,
} = require("../middleware/authMiddleware");


const {
  getDashboard,
} = require("../controllers/dashboardController");


const router =
  express.Router();


// ------------------------------------------
// GET DASHBOARD
// ------------------------------------------

router.get(
  "/",
  authenticateToken,
  getDashboard
);


module.exports = router;