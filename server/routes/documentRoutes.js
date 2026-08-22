// ==========================================
// DOCUMENT ROUTES
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
  getByEmployee,
  create,
  update,
  remove,
} = require("../controllers/documentController");


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
// GET BY EMPLOYEE
// ALL AUTHENTICATED ROLES
// ------------------------------------------
// Keep this BEFORE /:id

router.get(
  "/employee/:employeeId",
  authenticateToken,
  getByEmployee
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