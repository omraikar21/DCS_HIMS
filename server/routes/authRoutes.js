const express = require("express");

const {
  authenticateToken,
} = require("../middleware/authMiddleware");

const {
  login,
  changeFirstLoginPassword,
  sendOtp,
  forgotPassword,
  updateUserProfile,
} = require("../controllers/authController");


const router =
  express.Router();


// ------------------------------------------
// LOGIN
// ------------------------------------------

router.post(
  "/login",
  login
);


// ------------------------------------------
// FIRST-LOGIN PASSWORD CHANGE
// ------------------------------------------

router.post(
  "/first-login-change-password",
  changeFirstLoginPassword
);

router.post(
  "/change-password",
  changeFirstLoginPassword
);


// ------------------------------------------
// SEND OTP (GMAIL SERVICE)
// ------------------------------------------

router.post(
  "/send-otp",
  sendOtp
);


// ------------------------------------------
// FORGOT / RESET PASSWORD
// ------------------------------------------

router.post(
  "/reset-password",
  forgotPassword
);

router.post(
  "/forgot-password",
  forgotPassword
);


// ------------------------------------------
// UPDATE USER PROFILE (NAME ONLY)
// ------------------------------------------

router.put(
  "/profile",
  authenticateToken,
  updateUserProfile
);


module.exports = router;