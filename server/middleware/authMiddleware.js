// ==========================================
// AUTHENTICATION MIDDLEWARE
// B5 - JWT VERIFICATION
// ==========================================

const jwt = require("jsonwebtoken");


// ------------------------------------------
// VERIFY JWT
// ------------------------------------------

const authenticateToken =
  (req, res, next) => {

    try {

      // ------------------------------------
      // GET AUTHORIZATION HEADER
      // ------------------------------------

      const authHeader =
        req.headers.authorization;


      // ------------------------------------
      // CHECK HEADER
      // ------------------------------------

      if (!authHeader) {

        return res.status(401).json({

          success: false,

          message:
            "Authentication token is required",

        });

      }


      // ------------------------------------
      // CHECK BEARER FORMAT
      // ------------------------------------

      const parts =
        authHeader.split(" ");


      if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
      ) {

        return res.status(401).json({

          success: false,

          message:
            "Invalid authorization format",

        });

      }


      const token =
        parts[1];


      // ------------------------------------
      // VERIFY TOKEN
      // ------------------------------------

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );


      // ------------------------------------
      // STORE USER IN REQUEST
      // ------------------------------------

      req.user = {

        id:
          decoded.userId,

        email:
          decoded.email,

        role:
          decoded.role,

      };


      // ------------------------------------
      // CONTINUE
      // ------------------------------------

      next();


    } catch (error) {

      console.error(
        "Authentication error:",
        error.message
      );


      return res.status(401).json({

        success: false,

        message:
          "Invalid or expired authentication token",

      });

    }

  };


module.exports = {
  authenticateToken,
};