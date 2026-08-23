// ==========================================
// ATTENDANCE ROUTES
// B11
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
} = require("../controllers/attendanceController");


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
// CREATE
// ADMIN + HR
// ------------------------------------------

router.post(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  create
);


// ------------------------------------------
// UPDATE
// ADMIN + HR
// ------------------------------------------

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  update
);


// ------------------------------------------
// DELETE
// ADMIN + HR
// ------------------------------------------

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  remove
);


module.exports = router;