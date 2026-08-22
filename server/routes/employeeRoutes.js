// ==========================================
// EMPLOYEE ROUTES
// B9
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
} = require("../controllers/employeeController");


const router =
  express.Router();


// ------------------------------------------
// GET ALL EMPLOYEES
// ALL AUTHENTICATED ROLES
// ------------------------------------------

router.get(
  "/",
  authenticateToken,
  getAll
);


// ------------------------------------------
// GET EMPLOYEE BY ID
// ALL AUTHENTICATED ROLES
// ------------------------------------------

router.get(
  "/:id",
  authenticateToken,
  getById
);


// ------------------------------------------
// CREATE EMPLOYEE
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
// UPDATE EMPLOYEE
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
// DELETE EMPLOYEE
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