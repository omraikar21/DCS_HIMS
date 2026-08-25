// ==========================================
// CUSTOM REPORT CONTROLLER
// Express Handler for Reports
// ==========================================

const {
  getAllReports,
  createReport,
  deleteReport,
} = require("../models/reportModel");

// GET ALL REPORTS
const getReports = async (req, res) => {
  try {
    const reports = await getAllReports();
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve custom reports",
    });
  }
};

const { createNotification } = require("../models/notificationModel");

// CREATE REPORT
const addReport = async (req, res) => {
  try {
    const { reportTitle, reportType, period, parameters, data } = req.body;

    if (!reportTitle) {
      return res.status(400).json({
        success: false,
        message: "reportTitle is required",
      });
    }

    const newReport = await createReport({
      reportTitle,
      reportType: reportType || "FINANCE_REPORT",
      period: period || "",
      parameters: parameters || {},
      data: data || [],
      createdBy: req.user?.id || null,
      createdByName: req.user?.name || "Finance Manager",
    });

    // Notify Primary Admin instantly
    try {
      await createNotification({
        title: `Finance Report Submitted: ${reportTitle}`,
        message: `Finance executive ${req.user?.name || "Finance Team"} submitted a financial report for period: ${period || "Current"}.`,
        type: "NOTIFICATION",
        sender_role: "FINANCE",
        sender_name: req.user?.name || "Finance Team",
        sender_email: req.user?.email || "finance@dcstechnology.com",
        target_role: "ADMIN",
        category: "FINANCE_REPORT",
        priority: "HIGH",
        link: "/reports",
      });
    } catch (notifErr) {
      console.warn("Report notification warning:", notifErr.message);
    }

    return res.status(201).json({
      success: true,
      data: newReport,
      message: "Finance report submitted to Primary Admin successfully",
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create custom report",
    });
  }
};

// DELETE REPORT
const removeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteReport(id);
    return res.status(200).json({
      success: true,
      data: deleted,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete report",
    });
  }
};

module.exports = {
  getReports,
  addReport,
  removeReport,
};
