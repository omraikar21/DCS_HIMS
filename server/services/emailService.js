// ==========================================
// EMAIL SERVICE - GMAIL SMTP (NODEMAILER)
// ==========================================

const nodemailer = require("nodemailer");

/**
 * Creates and returns the nodemailer transporter using Gmail SMTP
 */
const getTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;

  if (!user || !pass || user.includes("your_gmail")) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends a 6-digit OTP email for password reset
 */
const sendPasswordResetOtp = async (toEmail, otpCode, userName = "Employee") => {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"DCS-HIMS Security" <${process.env.EMAIL_USER || "omraikar2128@gmail.com"}>`,
    to: toEmail,
    subject: "🔐 DCS-HIMS: Password Reset Verification Code",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #A1238E 0%, #761468 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
          .logo { font-size: 26px; font-weight: 800; letter-spacing: 1px; margin: 0; }
          .subtitle { font-size: 13px; opacity: 0.85; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .content { padding: 32px 28px; }
          .greeting { font-size: 17px; font-weight: 600; margin-bottom: 12px; }
          .otp-box { background: #fdf2f8; border: 2px dashed #A1238E; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #A1238E; font-family: monospace; }
          .otp-validity { font-size: 13px; color: #64748b; margin-top: 6px; }
          .security-note { background: #f8fafc; border-left: 4px solid #A1238E; padding: 12px 16px; font-size: 13px; color: #475569; margin: 20px 0; border-radius: 0 6px 6px 0; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">DCS-HIMS</h1>
            <div class="subtitle">Dharam Consultancy Services</div>
          </div>
          <div class="content">
            <div class="greeting">Hello ${userName},</div>
            <p>We received a request to reset the password for your DCS-HIMS account (<strong>${toEmail}</strong>).</p>
            <p>Use the one-time verification code below to authorize your password change:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
              <div class="otp-validity">⏱️ Valid for 10 minutes</div>
            </div>

            <div class="security-note">
              <strong>Security Notice:</strong> If you did not request this verification code, please ignore this email or contact your IT Administrator immediately. Never share your OTP with anyone.
            </div>

            <p style="font-size: 14px; color: #64748b; margin-top: 24px;">Best regards,<br><strong>DCS-HIMS Security Operations Team</strong></p>
          </div>
          <div class="footer">
            © 2026 Dharam Consultancy Services. All rights reserved.<br>
            Enterprise Office Management Platform
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[GMAIL SERVICE SIMULATION / NO CREDENTIALS CONFIGURED]`);
    console.log(`To: ${toEmail}`);
    console.log(`Password Reset OTP: ${otpCode}`);
    console.log(`======================================================\n`);
    return { simulated: true, otpCode };
  }

  return transporter.sendMail(mailOptions);
};

/**
 * Sends a Login Alert Notification
 */
const sendLoginAlert = async (toEmail, userName = "Employee", metadata = {}) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[LOGIN ALERT] Sign-in detected for ${toEmail}`);
    return { simulated: true };
  }

  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const mailOptions = {
    from: `"DCS-HIMS Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "🔔 DCS-HIMS: New Sign-in to Your Account",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #A1238E; margin-top: 0;">New Account Sign-in</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>A new sign-in was just recorded on your DCS-HIMS account:</p>
        <ul style="color: #475569; font-size: 14px; line-height: 1.8;">
          <li><strong>Email:</strong> ${toEmail}</li>
          <li><strong>Time:</strong> ${time} IST</li>
          <li><strong>IP / Client:</strong> Web Browser Portal</li>
        </ul>
        <p style="font-size: 13px; color: #64748b;">If this was you, no action is needed. If you did not sign in, please reset your password immediately.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">Dharam Consultancy Services — Office Management Security</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions).catch((err) => {
    console.error("Failed to send login alert email:", err.message);
  });
};

/**
 * Sends a confirmation email after password has been changed
 */
const sendPasswordChangedAlert = async (toEmail, userName = "Employee") => {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[PASSWORD CHANGED ALERT] Password updated for ${toEmail}`);
    return { simulated: true };
  }

  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const mailOptions = {
    from: `"DCS-HIMS Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "✅ DCS-HIMS: Password Successfully Changed",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #15803d; margin-top: 0;">Password Changed Successfully</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>The password for your DCS-HIMS account (<strong>${toEmail}</strong>) has been successfully updated on <strong>${time} IST</strong>.</p>
        <p>You can now sign in using your new password.</p>
        <p style="font-size: 13px; color: #dc2626;">If you did NOT make this change, please alert your System Administrator immediately.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">Dharam Consultancy Services — Office Management Security</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions).catch((err) => {
    console.error("Failed to send password changed alert:", err.message);
  });
};

/**
 * Sends a Welcome & Account Credentials Email with Temporary Password
 */
const sendEmployeeWelcomeEmail = async (
  toEmail,
  userName,
  tempPassword,
  employeeCode
) => {
  const transporter = getTransporter();
  const portalUrl = process.env.CLIENT_URL || "http://localhost:5173/login";

  const mailOptions = {
    from: `"DCS-HIMS People Operations" <${process.env.EMAIL_USER || "omraikar2128@gmail.com"}>`,
    to: toEmail,
    subject: `🎉 Welcome to Dharam Consultancy Services — Your Account Credentials (${employeeCode || "DCS"})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #A1238E 0%, #761468 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .logo { font-size: 26px; font-weight: 800; letter-spacing: 1px; margin: 0; }
          .subtitle { font-size: 13px; opacity: 0.9; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
          .content { padding: 32px 28px; }
          .welcome-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
          .cred-box { background: #faf5fa; border: 1px solid #f0dced; border-radius: 10px; padding: 20px; margin: 24px 0; }
          .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1e4ef; font-size: 14px; }
          .cred-row:last-child { border-bottom: none; }
          .cred-label { color: #64748b; font-weight: 500; }
          .cred-val { color: #1e293b; font-weight: 700; }
          .temp-pwd { color: #A1238E; font-family: monospace; font-size: 16px; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #e2c2dd; }
          .login-button { display: inline-block; background: #A1238E; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 16px 0; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo">DCS-HIMS</h1>
            <div class="subtitle">Dharam Consultancy Services</div>
          </div>
          <div class="content">
            <div class="welcome-title">Welcome to the Team, ${userName}! 🚀</div>
            <p>Your official employee profile has been created in the DCS-HIMS Office Platform. Below are your temporary sign-in credentials:</p>
            
            <div class="cred-box">
              <div class="cred-row">
                <span class="cred-label">Employee ID:</span>
                <span class="cred-val">${employeeCode || "Pending"}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Login Email:</span>
                <span class="cred-val">${toEmail}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Temporary Password:</span>
                <span class="temp-pwd">${tempPassword}</span>
              </div>
            </div>

            <div style="text-align: center; margin: 20px 0;">
              <a href="${portalUrl}" class="login-button">Sign In to DCS Portal →</a>
            </div>

            <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
              🔒 <strong>First-Time Security Policy:</strong> When you log in with this temporary password, the system will prompt you to choose your own secure, permanent password.
            </p>

            <p style="font-size: 14px; color: #64748b; margin-top: 24px;">Warm regards,<br><strong>DCS People & HR Operations Team</strong></p>
          </div>
          <div class="footer">
            © 2026 Dharam Consultancy Services. All rights reserved.<br>
            Internal Employee Platform
          </div>
        </div>
      </body>
      </html>
    `,
  };

  if (!transporter) {
    console.log(`\n======================================================`);
    console.log(`[GMAIL SIMULATION] Employee Welcome Email`);
    console.log(`To: ${toEmail} (${userName})`);
    console.log(`Employee Code: ${employeeCode}`);
    console.log(`Temporary Password: ${tempPassword}`);
    console.log(`Portal URL: ${portalUrl}`);
    console.log(`======================================================\n`);
    return { simulated: true, tempPassword };
  }

  return transporter.sendMail(mailOptions).catch((err) => {
    console.error("Failed to send welcome email:", err.message);
  });
};

module.exports = {
  sendPasswordResetOtp,
  sendLoginAlert,
  sendPasswordChangedAlert,
  sendEmployeeWelcomeEmail,
};
