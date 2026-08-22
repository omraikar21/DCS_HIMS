// ==========================================
// SYSTEM SETTINGS CONTROLLER
// ==========================================

const {
  getSettings,
  saveSettings,
} = require("../services/settingsService");

// GET ALL SETTINGS (ALL AUTHENTICATED ROLES)
const fetchSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("Get settings error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch system settings",
    });
  }
};

// UPDATE SETTINGS (ADMIN ONLY)
const updateSettings = async (req, res) => {
  try {
    const settings = await saveSettings(req.body);
    return res.status(200).json({
      success: true,
      message: "System settings updated successfully in database",
      data: settings,
    });
  } catch (err) {
    console.error("Update settings error:", err);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to update system settings",
    });
  }
};

module.exports = {
  fetchSettings,
  updateSettings,
};
