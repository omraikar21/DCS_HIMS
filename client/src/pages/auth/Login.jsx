import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  ShieldCheck,
  RotateCw,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { sendOtp, resetPassword } from "../../services/authService";


function Login() {

  // ============================================
  // STATE
  // ============================================
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const [loginError, setLoginError] =
    useState("");

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] =
    useState(false);

  // Step 1: "email" | Step 2: "otp"
  const [resetStep, setResetStep] =
    useState("email");

  const [forgotEmail, setForgotEmail] =
    useState("");

  const [otpCode, setOtpCode] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [forgotLoading, setForgotLoading] =
    useState(false);

  const [forgotError, setForgotError] =
    useState("");

  const [forgotSuccess, setForgotSuccess] =
    useState("");


  // ============================================
  // AUTH CONTEXT
  // ============================================

  const {
    login,
    loading,
  } = useAuth();


  // ============================================
  // INPUT CHANGE
  // ============================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (loginError) {
      setLoginError("");
    }
  };


  // ============================================
  // LOGIN SUBMIT
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    const emailTrimmed = formData.email.trim();
    const passwordTrimmed = formData.password.trim();

    if (!emailTrimmed && !passwordTrimmed) {
      setLoginError("Both credentials are required");
      return;
    }

    if (!emailTrimmed) {
      setLoginError("Email is required");
      return;
    }

    if (!passwordTrimmed) {
      setLoginError("Password is required");
      return;
    }

    try {
      const response = await login(
        emailTrimmed,
        passwordTrimmed
      );

      const role = response?.user?.role?.toUpperCase();

      if (role === "ADMIN") {
        navigate("/dashboard");
      } else if (role === "HR") {
        navigate("/hr-dashboard");
      } else if (role === "FINANCE") {
        navigate("/finance-dashboard");
      } else if (role === "EMPLOYEE") {
        navigate("/employee-dashboard");
      } else {
        setLoginError("User role is not configured.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoginError(error?.message || "Invalid credentials");
    }
  };


  // ============================================
  // STEP 1: SEND OTP TO GMAIL
  // ============================================

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!forgotEmail.trim()) {
      setForgotError("Please enter your registered DCS email address.");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await sendOtp(forgotEmail.trim());

      setForgotSuccess(
        res?.message || "Verification code sent to your Gmail inbox!"
      );
      setResetStep("otp");

    } catch (err) {
      console.error("Failed to send OTP:", err);
      setForgotError(
        err.message || "Failed to send verification code. Please check your email."
      );
    } finally {
      setForgotLoading(false);
    }
  };


  // ============================================
  // STEP 2: VERIFY OTP & RESET PASSWORD
  // ============================================

  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotSuccess("");

    if (!otpCode.trim()) {
      setForgotError("Please enter the 6-digit verification code sent to your Gmail.");
      return;
    }

    if (!newPassword) {
      setForgotError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setForgotError("New passwords do not match.");
      return;
    }

    try {
      setForgotLoading(true);
      const res = await resetPassword(
        forgotEmail.trim(),
        newPassword,
        otpCode.trim()
      );

      setForgotSuccess(
        res?.message || "Password verified and updated in database!"
      );

      // Pre-fill login form with the updated credentials
      setFormData({
        email: forgotEmail.trim(),
        password: newPassword,
      });

      setTimeout(() => {
        setForgotModalOpen(false);
        setResetStep("email");
        setForgotSuccess("");
        setForgotEmail("");
        setOtpCode("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1600);

    } catch (err) {
      console.error("Password reset error:", err);
      setForgotError(
        err.message || "Invalid or expired OTP. Please verify the code and try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };


  return (

    <div className="login-page">


      {/* =========================================
          LEFT SIDE
      ========================================= */}

      <div className="login-brand-section">

        <div className="dcs-logo" style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "78px",
              height: "78px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "3.5px solid #FFFFFF",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFFFFF",
              flexShrink: 0,
            }}
          >
            <img
              src="/dcs-logo.png"
              alt="DCS Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: "scale(1.42)",
                display: "block",
              }}
            />
          </div>

          <div>
            <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#FFFFFF", margin: 0, letterSpacing: "2px", lineHeight: 1.1, textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)" }}>
              DCS
            </h3>
            <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#FCE7F3", letterSpacing: "2.2px", display: "block", marginTop: "4px", textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)" }}>
              DHARAM CONSULTANCY SERVICES
            </span>
          </div>
        </div>





        <div className="brand-content">

          <p className="brand-label">
            INTERNAL OFFICE PLATFORM
          </p>

          <h1>
            Technology.
            <br />
            People.
            <br />
            <span>
              Progress.
            </span>
          </h1>

          <p className="brand-description">
            DCS Office Management System for
            employees, HR, finance and
            administration.
          </p>

          <div className="technology-tags">
            <span>IoT</span>
            <span>Software</span>
            <span>AI / ML</span>
            <span>Consultancy</span>
          </div>

        </div>

        <div className="brand-footer">
          © 2026 Dharam Consultancy Services
        </div>

      </div>



      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <div className="login-form-section">

        <div className="login-card">


          {/* MOBILE LOGO */}

          <div className="mobile-logo">

            <div className="dcs-logo-box">
              DCS
            </div>

          </div>


          <p className="login-label">
            WELCOME BACK
          </p>


          <h2>
            Sign in to DCS
          </h2>


          <p className="login-description">
            Use your employee account to continue.
          </p>


          {/* =====================================
              LOGIN FORM
          ===================================== */}

          <form onSubmit={handleSubmit}>


            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="login-email">
                Email / Employee ID
              </label>


              <div className="input-wrapper">

                <Mail size={18} />


                <input
                  id="login-email"
                  type="text"
                  name="email"
                  placeholder="e.g. alex@dcs.com or DCS-001"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="form-group">

              <label htmlFor="login-password">
                Password
              </label>


              <div className="input-wrapper">

                <LockKeyhole size={18} />


                <input
                  id="login-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />


                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* LOGIN ERROR */}
            {loginError && (
              <div
                className="login-error"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#FFF1F2",
                  border: "1px solid #FECDD3",
                  color: "#BE123C",
                  fontSize: "13px",
                  fontWeight: "700",
                  margin: "12px 0 16px",
                  boxShadow: "0 2px 8px rgba(225, 29, 72, 0.08)",
                  animation: "fadeIn 0.2s ease-in-out",
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, color: "#E11D48" }} />
                <span style={{ flex: 1 }}>{loginError}</span>
              </div>
            )}


            {/* OPTIONS */}

            <div className="login-options">

              <label className="remember-me">

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>


              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  setForgotError("");
                  setForgotSuccess("");
                  setForgotEmail(formData.email || "");
                  setResetStep("email");
                  setForgotModalOpen(true);
                }}
              >
                Forgot password?
              </button>

            </div>


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="login-button"
            >

              {loading
                ? "Signing in..."
                : "Sign In"}

            </button>

          </form>

        </div>

      </div>


      {/* =========================================
          GMAIL OTP FORGOT / RESET PASSWORD MODAL
      ========================================= */}

      {forgotModalOpen && (
        <div className="modal-overlay">
          <div className="employee-modal" style={{ maxWidth: "460px" }}>

            <div className="modal-header">
              <div>
                <p className="section-label">GMAIL RECOVERY</p>
                <h2>{resetStep === "email" ? "Reset Password" : "Verify Gmail OTP"}</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => {
                  setForgotModalOpen(false);
                  setResetStep("email");
                }}
              >
                <X size={18} />
              </button>
            </div>

            {forgotError && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: "8px",
                  margin: "12px 20px 0",
                  fontSize: "13.5px",
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  backgroundColor: "#dcfce7",
                  color: "#15803d",
                  borderRadius: "8px",
                  margin: "12px 20px 0",
                  fontSize: "13.5px",
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: EMAIL ENTRY */}
            {resetStep === "email" ? (
              <form onSubmit={handleSendOtp}>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: "1.5" }}>
                    Enter your registered DCS email. We will send a 6-digit verification OTP to your Gmail account.
                  </p>

                  <div className="form-field">
                    <label>Registered Email Address</label>
                    <div className="input-wrapper">
                      <Mail size={16} />
                      <input
                        type="email"
                        placeholder="e.g. employee@dcs.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setForgotModalOpen(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="primary-button"
                  >
                    <Send size={15} />
                    {forgotLoading ? "Sending OTP..." : "Send OTP Code"}
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: OTP & NEW PASSWORD */
              <form onSubmit={handleVerifyOtpAndReset}>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      Code sent to <strong>{forgotEmail}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setResetStep("email");
                        setForgotError("");
                        setForgotSuccess("");
                      }}
                      style={{ background: "none", border: "none", color: "#9E2686", fontSize: "12.5px", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }}
                    >
                      Change
                    </button>
                  </div>

                  <div className="form-field">
                    <label>6-Digit Verification Code (OTP)</label>
                    <div className="input-wrapper">
                      <ShieldCheck size={16} />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="e.g. 482910"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        style={{ fontSize: "17px", letterSpacing: "4px", fontWeight: "700", fontFamily: "monospace" }}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>New Password</label>
                    <div className="input-wrapper">
                      <KeyRound size={16} />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password (min. 6 chars)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Confirm New Password</label>
                    <div className="input-wrapper">
                      <KeyRound size={16} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>


                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={forgotLoading}
                      style={{ background: "none", border: "none", color: "#64748b", fontSize: "12.5px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                    >
                      <RotateCw size={12} /> Resend OTP
                    </button>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setResetStep("email");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="primary-button"
                  >
                    {forgotLoading ? "Verifying..." : "Verify & Reset Password"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>

  );
}


export default Login;