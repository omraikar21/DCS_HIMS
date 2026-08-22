// ==========================================
// LEAVE ROUTES
// B12
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
  approveLeaveRequest,
  rejectLeaveRequest,
  holdLeaveRequest,
} = require("../controllers/leaveController");


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
// CREATE / APPLY LEAVE
// ALL AUTHENTICATED ROLES
// ------------------------------------------

router.post(
  "/",
  authenticateToken,
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


// ------------------------------------------
// APPROVE
// ADMIN + HR
// ------------------------------------------

router.put(
  "/:id/approve",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  approveLeaveRequest
);


// ------------------------------------------
// REJECT
// ADMIN + HR
// ------------------------------------------

router.put(
  "/:id/reject",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  rejectLeaveRequest
);


// ------------------------------------------
// HOLD / PENDING
// ADMIN + HR
// ------------------------------------------

router.put(
  "/:id/hold",
  authenticateToken,
  authorizeRoles(
    "ADMIN",
    "HR"
  ),
  holdLeaveRequest
);


module.exports = router;