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
  recordFacePunchController,
  recordBatchBiometricController,
  getBiometricConfigController,
} = require("../controllers/attendanceController");


const router =
  express.Router();

// ------------------------------------------
// FACE RECOGNITION & BIOMETRIC API PUNCHES
// AUTHENTICATED VIA X-API-KEY HEADER
// ------------------------------------------

router.post("/face-punch", recordFacePunchController);
router.post("/biometric-punch", recordFacePunchController);
router.post("/biometric-batch", recordBatchBiometricController);
router.get("/biometric-config", authenticateToken, getBiometricConfigController);

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