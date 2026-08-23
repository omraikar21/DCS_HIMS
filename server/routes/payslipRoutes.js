// ==========================================
// PAYSLIP ROUTES
// B14
// ==========================================

const express = require("express");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  authorizeRoles,
} = require("../middleware/roleMiddleware");

const {
  getAll,
  getById,
  create,
  generateForMonth,
  update,
  remove,
} = require("../controllers/payslipController");


const router =
  express.Router();


// ------------------------------------------
// GET ALL
// ALL AUTHENTICATED ROLES
// ------------------------------------------

router.get(
  "/",
  authenticateToken,
  getAll
);


// ------------------------------------------
// GET BY ID
// ALL AUTHENTICATED ROLES
// ------------------------------------------

router.get(
  "/:id",
  authenticateToken,
  getById
);


// ------------------------------------------
// BULK GENERATE FOR MONTH
// ADMIN + FINANCE ONLY
// Body: { month: 8, year: 2026 }
// ------------------------------------------

router.post(
  "/generate-month",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE"
  ),
  generateForMonth
);


// ------------------------------------------
// CREATE (single, by payrollId)
// ADMIN + FINANCE
// ------------------------------------------

router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE"
  ),
  create
);


// ------------------------------------------
// UPDATE
// ADMIN + FINANCE
// ------------------------------------------

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE"
  ),
  update
);


// ------------------------------------------
// DELETE
// ADMIN + FINANCE
// ------------------------------------------

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE"
  ),
  remove
);


module.exports = router;