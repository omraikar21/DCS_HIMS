// ==========================================
// AUTHENTICATION TEST CONTROLLER
// B5
// ==========================================

const getAuthenticatedUser =
  (req, res) => {

    return res.status(200).json({

      success: true,

      message:
        "Authentication successful",

      user:
        req.user,

    });

  };


module.exports = {
  getAuthenticatedUser,
};