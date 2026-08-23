// ==========================================
// ROLE-BASED ACCESS CONTROL
// B6
// ==========================================


const authorizeRoles =
  (...allowedRoles) => {

    return (req, res, next) => {

      // ------------------------------------
      // AUTHENTICATION CHECK
      // ------------------------------------

      if (!req.user) {

        return res.status(401).json({

          success: false,

          message:
            "Authentication required",

        });

      }


      // ------------------------------------
      // ROLE CHECK (CASE-INSENSITIVE)
      // ------------------------------------

      const userRole = (req.user.role || "").toUpperCase().replace(/[\s-]+/g, "_");
      const normalizedAllowed = allowedRoles.map(r => r.toUpperCase().replace(/[\s-]+/g, "_"));

      if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
        return next();
      }

      if (
        !normalizedAllowed.includes(userRole)
      ) {

        return res.status(403).json({

          success: false,

          message:
            "You do not have permission to access this resource",

        });

      }


      // ------------------------------------
      // ACCESS GRANTED
      // ------------------------------------

      next();

    };

  };


module.exports = {
  authorizeRoles,
};