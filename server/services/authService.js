// ==========================================
// AUTHENTICATION SERVICE
// B4
// ==========================================

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");


const {
  getUserByEmail,
  updateUserPassword,
  completeFirstLoginPasswordChange,
  updateUserProfile,
} = require("../models/userModel");

const {
  sendPasswordResetOtp,
  sendLoginAlert,
  sendPasswordChangedAlert,
} = require("./emailService");

const {
  createAuditLog,
} = require("../models/auditModel");


const {
  generateOtp,
  verifyOtp,
  clearOtp,
} = require("./otpService");


// ------------------------------------------
// LOGIN
// ------------------------------------------

const loginUser =
  async (
    email,
    password
  ) => {

    // --------------------------------------
    // FIND USER
    // --------------------------------------

    const user =
      await getUserByEmail(
        email
      );


    if (!user) {
      throw new Error("Email is incorrect");
    }

    // --------------------------------------
    // CHECK ACTIVE STATUS
    // --------------------------------------

    if (!user.is_active) {
      throw new Error("User account is inactive. Please contact administrator.");
    }

    // --------------------------------------
    // CHECK PASSWORD
    // --------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password_hash
      );

    if (!passwordMatch) {
      throw new Error("Password is incorrect");
    }



    // --------------------------------------
    // CREATE JWT
    // --------------------------------------

    const token =
      jwt.sign(
        {
          userId: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn:
            process.env.JWT_EXPIRES_IN ||
            "1d",
        }
      );


    // --------------------------------------
    // RECORD AUTOMATIC AUDIT EVENT
    // --------------------------------------
    createAuditLog({
      eventAction: "User Authentication Success",
      category: "AUTH",
      actorName: user.name,
      actorEmail: user.email,
      role: user.role,
      details: "Signed into DCS-HIMS platform with JWT verification.",
      status: "SUCCESS",
    }).catch(() => {});

    // --------------------------------------
    // SEND ASYNC LOGIN ALERT VIA GMAIL
    // --------------------------------------

    sendLoginAlert(user.email, user.name).catch((err) => {
      console.warn("Gmail login alert failed:", err.message);
    });



    // --------------------------------------
    // RETURN SAFE USER DATA
    // --------------------------------------

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    };
  };


// ------------------------------------------
// FIRST-LOGIN PASSWORD CHANGE
// ------------------------------------------

const firstLoginChangePassword = async (email, currentPassword, newPassword) => {
  if (!email || !currentPassword || !newPassword) {
    throw new Error("Email, temporary password, and new password are required");
  }

  const trimmedEmail = email.trim();
  const user = await getUserByEmail(trimmedEmail);

  if (!user) {
    throw new Error("Account not found");
  }

  // Verify temporary password
  const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!passwordMatch) {
    throw new Error("Temporary password is incorrect");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Update in database and clear must_change_password
  const updatedUser = await completeFirstLoginPasswordChange(trimmedEmail, passwordHash);

  // Generate session token
  const token = jwt.sign(
    {
      userId: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );

  // Send confirmation email
  sendPasswordChangedAlert(trimmedEmail, updatedUser.name).catch((err) => {
    console.warn("Gmail password changed alert failed:", err.message);
  });

  // Record Audit Event
  createAuditLog({
    eventAction: "First-Login Password Configured",
    category: "SECURITY",
    actorName: updatedUser.name,
    actorEmail: updatedUser.email,
    role: updatedUser.role,
    details: "Replaced temporary credentials with permanent encrypted password.",
    status: "SUCCESS",
  }).catch(() => {});

  return {
    token,
    user: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  };
};


// ------------------------------------------
// SEND PASSWORD RESET OTP VIA GMAIL
// ------------------------------------------

const requestPasswordResetOtp = async (email) => {
  if (!email) {
    throw new Error("Email address is required");
  }

  const trimmedEmail = email.trim();
  const user = await getUserByEmail(trimmedEmail);

  if (!user) {
    throw new Error("No DCS account found with this email address");
  }

  // Generate 6-digit OTP
  const otpCode = generateOtp(trimmedEmail);

  // Send via Gmail SMTP
  await sendPasswordResetOtp(trimmedEmail, otpCode, user.name);

  // Record OTP Request Audit
  createAuditLog({
    eventAction: "Password Reset OTP Requested",
    category: "SECURITY",
    actorName: user.name,
    actorEmail: user.email,
    role: user.role,
    details: "Generated single-use 6-digit OTP code for password recovery.",
    status: "SUCCESS",
  }).catch(() => {});

  return {
    email: trimmedEmail,
    userName: user.name,
  };
};


// ------------------------------------------
// RESET PASSWORD WITH OTP VERIFICATION
// ------------------------------------------

const resetUserPasswordWithOtp = async (email, otp, newPassword) => {
  if (!email || !newPassword) {
    throw new Error("Email and new password are required");
  }

  if (!otp || typeof otp !== "string" || !otp.trim()) {
    throw new Error("Valid OTP verification code is required to reset password");
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedOtp = otp.trim();

  // Strictly verify OTP
  const otpValidation = verifyOtp(trimmedEmail, trimmedOtp);
  if (!otpValidation.valid) {
    throw new Error(otpValidation.message || "Invalid or expired OTP");
  }

  const user = await getUserByEmail(trimmedEmail);
  if (!user) {
    throw new Error("No account found with this email address");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);

  // Update in database
  const updatedUser = await updateUserPassword(trimmedEmail, passwordHash);

  // Clear used OTP
  clearOtp(trimmedEmail);

  // Send confirmation email via Gmail
  sendPasswordChangedAlert(trimmedEmail, user.name).catch((err) => {
    console.warn("Gmail password changed notification failed:", err.message);
  });

  // Record Audit Event
  createAuditLog({
    eventAction: "Password Reset via OTP Verified",
    category: "SECURITY",
    actorName: user.name,
    actorEmail: user.email,
    role: user.role,
    details: "Cryptographic bcrypt hash updated; OTP cleared.",
    status: "SUCCESS",
  }).catch(() => {});

  return updatedUser;
};

// ------------------------------------------
// DIRECT RESET PASSWORD (ENFORCES OTP)
// ------------------------------------------
const resetUserPassword = async (email, newPassword, otp) => {
  return resetUserPasswordWithOtp(email, otp, newPassword);
};


// ------------------------------------------
// UPDATE USER PROFILE (NAME ONLY)
// ------------------------------------------

const updateProfile = async (userId, name, avatar) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  return await updateUserProfile(userId, name ? name.trim() : null, avatar);
};


module.exports = {
  loginUser,
  firstLoginChangePassword,
  resetUserPassword,
  requestPasswordResetOtp,
  resetUserPasswordWithOtp,
  updateProfile,
};