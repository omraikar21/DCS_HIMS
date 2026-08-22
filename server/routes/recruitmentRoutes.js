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
} = require("../controllers/recruitmentController");


const router =
  express.Router();


router.get(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  getAll
);


router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  getById
);


router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  create
);


router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  update
);


router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ADMIN", "HR"),
  remove
);


module.exports = router;