// ==========================================
// ONBOARDING ROUTES
// B17
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
} = require("../controllers/onboardingController");


const router =
  express.Router();


// ------------------------------------------
// GET ALL
// ADMIN + HR
// ------------------------------------------

router.get(
  "/",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  getAll
);


// ------------------------------------------
// GET BY EMPLOYEE
// IMPORTANT: BEFORE /:id
// ------------------------------------------

router.get(
  "/employee/:employeeId",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  getByEmployee
);


// ------------------------------------------
// GET BY ID
// ------------------------------------------

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
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