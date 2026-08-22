// ==========================================
// PAYROLL ROUTES
// B13
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
  update,
  remove,
} = require("../controllers/payrollController");


const router =
  express.Router();


// ------------------------------------------
// GET ALL
// ADMIN + FINANCE
// ------------------------------------------

router.get(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE"
  ),
  getAll
);


// ------------------------------------------
// GET BY ID
// ADMIN + FINANCE
// ------------------------------------------

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE"
  ),
  getById
);


// ------------------------------------------
// CREATE
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