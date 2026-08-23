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
// ADMIN + FINANCE + HR
// ------------------------------------------

router.get(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE",
    "HR"
  ),
  getAll
);


// ------------------------------------------
// GET BY ID
// ADMIN + FINANCE + HR
// ------------------------------------------

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE",
    "HR"
  ),
  getById
);


// ------------------------------------------
// CREATE
// ADMIN + FINANCE + HR
// ------------------------------------------

router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE",
    "HR"
  ),
  create
);


// ------------------------------------------
// UPDATE
// ADMIN + FINANCE + HR
// ------------------------------------------

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE",
    "HR"
  ),
  update
);


// ------------------------------------------
// DELETE
// ADMIN + FINANCE + HR
// ------------------------------------------

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "FINANCE",
    "HR"
  ),
  remove
);


module.exports = router;