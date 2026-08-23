const test = require("node:test");
const assert = require("node:assert/strict");
const { resetUserPasswordWithOtp } = require("../services/authService");
const { generateOtp, verifyOtp } = require("../services/otpService");

test("Authentication & Password Reset Security", async (t) => {
  await t.test("Mandatory OTP: Should throw error if OTP is missing or empty", async () => {
    await assert.rejects(
      async () => {
        await resetUserPasswordWithOtp("test@dcstechnology.com", null, "NewPassword123");
      },
      {
        name: "Error",
        message: /OTP verification code is required/i,
      }
    );

    await assert.rejects(
      async () => {
        await resetUserPasswordWithOtp("test@dcstechnology.com", "   ", "NewPassword123");
      },
      {
        name: "Error",
        message: /OTP verification code is required/i,
      }
    );
  });

  await t.test("Invalid OTP: Should reject incorrect OTP codes", async () => {
    generateOtp("security.test@dcstechnology.com");

    await assert.rejects(
      async () => {
        await resetUserPasswordWithOtp("security.test@dcstechnology.com", "000000", "NewPassword123");
      },
      {
        name: "Error",
        message: /Invalid verification code|Invalid or expired OTP/i,
      }
    );
  });

  await t.test("Valid OTP: OTP generation and verification flow", () => {
    const email = "otp.flow@dcstechnology.com";
    const otp = generateOtp(email);
    assert.equal(typeof otp, "string");
    assert.equal(otp.length, 6);

    const validation = verifyOtp(email, otp);
    assert.equal(validation.valid, true);
  });
});
