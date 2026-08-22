// ==========================================
// ROLE TEST CONTROLLER
// B6
// ==========================================


const getAdminResource =
  (req, res) => {

    return res.status(200).json({

      success: true,

      message:
        "ADMIN resource accessed successfully",

      user: req.user,

    });

  };


const getHRResource =
  (req, res) => {

    return res.status(200).json({

      success: true,

      message:
        "HR resource accessed successfully",

      user: req.user,

    });

  };


const getFinanceResource =
  (req, res) => {

    return res.status(200).json({

      success: true,

      message:
        "FINANCE resource accessed successfully",

      user: req.user,

    });

  };


module.exports = {
  getAdminResource,
  getHRResource,
  getFinanceResource,
};