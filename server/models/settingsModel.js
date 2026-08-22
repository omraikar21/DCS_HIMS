// ==========================================
// SYSTEM SETTINGS MODEL
// PostgreSQL Storage for Global Configs
// ==========================================

const { pool } = require("../config/database");

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

// Ensure settings table exists and initialize defaults
const initSettingsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'GENERAL',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await pool.query(
        `INSERT INTO system_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO NOTHING`,
        [key, String(value)]
      );
    }
  } catch (err) {
    console.warn("Failed to initialize system_settings table:", err.message);
  }
};

const getAllSettings = async () => {
  await initSettingsTable();
  const result = await pool.query("SELECT key, value FROM system_settings");
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of result.rows) {
    settings[row.key] = row.value;
  }
  return settings;
};

const updateSystemSettings = async (settingsObj) => {
  await initSettingsTable();
  for (const [key, value] of Object.entries(settingsObj)) {
    if (value !== undefined && value !== null) {
      await pool.query(
        `INSERT INTO system_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }
  }
  return await getAllSettings();
};

module.exports = {
  initSettingsTable,
  getAllSettings,
  updateSystemSettings,
};
