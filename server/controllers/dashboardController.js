// ==========================================
// DASHBOARD CONTROLLER
// B8
// ==========================================

const {
  getDashboardData,
} = require("../services/dashboardService");


// ------------------------------------------
// GET DASHBOARD
// ------------------------------------------

const getDashboard =
  async (req, res) => {

    try {

      const dashboard =
        await getDashboardData();


      return res.status(200).json({

        success: true,

        message:
          "Dashboard data fetched successfully",

        data:
          dashboard,

      });

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch dashboard data",

      });

    }

  };


module.exports = {
  getDashboard,
};