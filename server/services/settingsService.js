// ==========================================
// SYSTEM SETTINGS SERVICE
// ==========================================

const {
  getAllSettings,
  updateSystemSettings,
} = require("../models/settingsModel");

const getSettings = async () => {
  return await getAllSettings();
};

const saveSettings = async (settingsObj) => {
  if (!settingsObj || typeof settingsObj !== "object") {
    throw new Error("Settings data must be a valid object");
  }
  return await updateSystemSettings(settingsObj);
};

module.exports = {
  getSettings,
  saveSettings,
};
