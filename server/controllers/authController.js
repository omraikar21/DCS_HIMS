const {
  loginUser,
  firstLoginChangePassword,
  resetUserPassword,
  requestPasswordResetOtp,
  resetUserPasswordWithOtp,
  updateProfile,
} = require("../services/authService");


// ------------------------------------------
// LOGIN
// ------------------------------------------

const login =
  async (req, res) => {

    try {

      const {
        email,
        password,
      } = req.body;


      const emailVal = (email || "").trim();
      const passwordVal = (password || "").trim();

      if (!emailVal && !passwordVal) {
        return res.status(400).json({
          success: false,
          message: "Both credentials are required",
        });
      }

      if (!emailVal) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      if (!passwordVal) {
        return res.status(400).json({
          success: false,
          message: "Password is required",
        });
      }



      // ------------------------------------
      // LOGIN SERVICE
      // ------------------------------------

      const result =
        await loginUser(
          email,
          password
        );


      // ------------------------------------
      // SUCCESS
      // ------------------------------------

      return res.status(200).json({

        success: true,

        message:
          result.mustChangePassword
            ? "First-time sign-in detected. Please set your new permanent password."
            : "Login successful",

        data:
          result,

      });


    } catch (error) {

      console.error(
        "Login error:",
        error.message
      );


      return res.status(401).json({

        success: false,

        message:
          error.message ||
          "Login failed",

      });

    }

  };


// ------------------------------------------
// FIRST-LOGIN PASSWORD CHANGE
// ------------------------------------------

const changeFirstLoginPassword =
  async (req, res) => {

    try {

      const {
        email,
        currentPassword,
        newPassword,
      } = req.body;

      if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, temporary password, and new password are required",
        });
      }

      const result = await firstLoginChangePassword(email, currentPassword, newPassword);

      return res.status(200).json({
        success: true,
        message: "Your permanent password has been set successfully. Welcome to DCS!",
        data: result,
      });

    } catch (error) {
      console.error("First-login change password error:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update permanent password",
      });
    }

  };


// ------------------------------------------
// SEND OTP (GMAIL SERVICE)
// ------------------------------------------

const sendOtp =
  async (req, res) => {

    try {

      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email address is required to send verification code",
        });
      }

      const result = await requestPasswordResetOtp(email);

      return res.status(200).json({
        success: true,
        message: `Verification code sent to ${result.email} via Gmail SMTP service.`,
        data: {
          email: result.email,
        },
      });

    } catch (error) {
      console.error("Send OTP error:", error.message);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to send verification code",
      });
    }

  };


// ------------------------------------------
// FORGOT / RESET PASSWORD (WITH OTP SUPPORT)
// ------------------------------------------

const forgotPassword =
  async (req, res) => {

    try {

      const {
        email,
        otp,
        newPassword,
      } = req.body;


      if (
        !email ||
        !otp ||
        !newPassword
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Email, valid OTP code, and new password are required",

        });

      }


      const updatedUser =
        await resetUserPasswordWithOtp(
          email,
          otp,
          newPassword
        );


      return res.status(200).json({

        success: true,

        message:
          "Password has been successfully updated in database. You can now sign in.",

        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },

      });


    } catch (error) {

      console.error(
        "Forgot password error:",
        error.message
      );


      return res.status(400).json({

        success: false,

        message:
          error.message ||
          "Failed to reset password",

      });

    }

  };


// ------------------------------------------
// UPDATE USER PROFILE (NAME ONLY)
// ------------------------------------------

const updateUserProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const updatedUser = await updateProfile(userId, name ? name.trim() : null, avatar);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully in database",
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar || avatar || "",
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};


module.exports = {
  login,
  changeFirstLoginPassword,
  sendOtp,
  forgotPassword,
  updateUserProfile,
};