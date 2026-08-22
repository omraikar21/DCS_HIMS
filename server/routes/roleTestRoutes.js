// ==========================================
// ROLE TEST ROUTES
// B6
// ==========================================

const express = require("express");


const {
  authenticateToken,
} = require("../middleware/authMiddleware");


const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");


const {
  getAdminResource,
  getHRResource,
  getFinanceResource,
} = require("../controllers/roleTestController");


const router =
  express.Router();


// ==========================================
// ADMIN TEST
// ==========================================

router.get(
  "/admin",
  authenticateToken,
  authorizeRoles("ADMIN"),
  getAdminResource
);


// ==========================================
// HR TEST
// ==========================================

router.get(
  "/hr",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  getHRResource
);


// ==========================================
// FINANCE TEST
// ==========================================

router.get(
  "/finance",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE"
  ),
  getFinanceResource
);


module.exports = router;