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
      // ROLE CHECK
      // ------------------------------------

      if (
        !allowedRoles.includes(
          req.user.role
        )
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