// ==========================================
// OTP SERVICE (IN-MEMORY WITH EXPIRY)
// ==========================================

const crypto = require("crypto");

// Store OTPs: email -> { code, expiresAt, attempts }
const otpStore = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generates a secure random 6-digit OTP
 */
const generateOtp = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Generate cryptographically random 6-digit number
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0) % 900000 + 100000;
  const code = String(num);

  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  otpStore.set(normalizedEmail, {
    code,
    expiresAt,
    attempts: 0,
  });

  return code;
};

/**
 * Verifies an OTP for a given email
 */
const verifyOtp = (email, inputCode) => {
  const normalizedEmail = email.trim().toLowerCase();
  const entry = otpStore.get(normalizedEmail);

  if (!entry) {
    return {
      valid: false,
      message: "No OTP request found for this email. Please request a new code.",
    };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      message: "Verification code has expired. Please request a new one.",
    };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      message: "Too many failed attempts. Please request a new verification code.",
    };
  }

  if (entry.code !== String(inputCode).trim()) {
    entry.attempts += 1;
    return {
      valid: false,
      message: `Invalid verification code. (${MAX_ATTEMPTS - entry.attempts} attempts remaining)`,
    };
  }

  return {
    valid: true,
  };
};

/**
 * Clears the stored OTP after successful password reset
 */
const clearOtp = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  otpStore.delete(normalizedEmail);
};

module.exports = {
  generateOtp,
  verifyOtp,
  clearOtp,
};
