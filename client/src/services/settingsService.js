// ==========================================
// SYSTEM SETTINGS SERVICE (FRONTEND)
// Live synchronized settings with PostgreSQL backend
// ==========================================

import { get, put } from "./apiClient";

const DEFAULT_SETTINGS = {
  companyName: "Dharam Consultancy Services (DCS)",
  systemEmail: "admin@dcshims.com",
  timezone: "Asia/Kolkata (IST)",
  currency: "INR (₹)",
  currencySymbol: "₹",
  workingHoursPerDay: "8.5",
  annualLeaveQuota: "18",
  leaveNoticeDays: "2",
  sessionExpiry: "24 Hours",
  minPasswordLength: "6",
};

export const getLoadedSettings = () => {
  try {
    const raw = localStorage.getItem("dcs_system_settings");
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const fetchSystemSettings = async () => {
  try {
    const response = await get("/settings");
    if (response?.data) {
      localStorage.setItem("dcs_system_settings", JSON.stringify(response.data));
      window.dispatchEvent(new Event("dcsSettingsUpdated"));
      return response.data;
    }
  } catch (err) {
    console.warn("Failed to fetch settings from backend, using cached settings:", err.message);
  }
  return getLoadedSettings();
};

export const updateSystemSettings = async (settingsObj) => {
  const response = await put("/settings", settingsObj);
  const updated = response?.data || settingsObj;
  localStorage.setItem("dcs_system_settings", JSON.stringify(updated));
  window.dispatchEvent(new Event("dcsSettingsUpdated"));
  return updated;
};
