// ==========================================
// AUDIT CONTROLLER
// B3 - REST API for Audit Logs
// ==========================================

const {
  getAllAuditLogs,
  createAuditLog,
} = require("../models/auditModel");

// ------------------------------------------
// GET ALL AUDIT LOGS
// ------------------------------------------
const getAuditLogs = async (req, res) => {
  try {
    const logs = await getAllAuditLogs();
    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    console.error("getAuditLogs controller error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve audit logs",
    });
  }
};

// ------------------------------------------
// RECORD CUSTOM AUDIT EVENT
// ------------------------------------------
const recordAuditEvent = async (req, res) => {
  try {
    const {
      eventAction,
      category = "SYSTEM",
      actorName,
      actorEmail,
      role,
      details,
      status = "SUCCESS",
    } = req.body;

    if (!eventAction) {
      return res.status(400).json({
        success: false,
        message: "eventAction is required",
      });
    }

    const newLog = await createAuditLog({
      eventAction,
      category,
      actorName: actorName || req.user?.name || "Om Raikar",
      actorEmail: actorEmail || req.user?.email || "omraikar2128@gmail.com",
      role: role || req.user?.role || "EMPLOYEE",
      details: details || "",
      status,
    });

    res.status(201).json({
      success: true,
      data: newLog,
      message: "Audit event recorded successfully",
    });
  } catch (err) {
    console.error("recordAuditEvent controller error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to record audit event",
    });
  }
};

module.exports = {
  getAuditLogs,
  recordAuditEvent,
};
