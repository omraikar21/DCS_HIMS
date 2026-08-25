// ==========================================
// AUTHENTICATION MIDDLEWARE
// B5 - JWT VERIFICATION
// ==========================================

const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

// ------------------------------------------
// VERIFY JWT & ACCOUNT ACTIVE STATUS
// ------------------------------------------

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify real-time active status in database
    const userResult = await pool.query(
      `SELECT is_active, is_super_admin FROM users WHERE id = $1 OR LOWER(TRIM(email)) = LOWER(TRIM($2))`,
      [decoded.userId, decoded.email]
    );

    if (userResult.rows.length > 0) {
      const dbUser = userResult.rows[0];
      if (dbUser.is_active === false && !dbUser.is_super_admin) {
        return res.status(403).json({
          success: false,
          accountSuspended: true,
          message: "Account Suspended: Your account is inactive or suspended. Access denied.",
        });
      }
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: decoded.role,
      isSuperAdmin: userResult.rows[0]?.is_super_admin || false,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};


module.exports = {
  authenticateToken,
};