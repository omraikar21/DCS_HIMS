// ==========================================
// DCS-HIMS DATABASE SEED RUNNER
// Initializes database schema, tables, and super admin
// ==========================================

const { pool } = require("../config/database");
const { initDatabase } = require("./initDb");
const { initSettingsTable } = require("../models/settingsModel");
const { syncAllEmployeesToUsers } = require("../models/userModel");

const runSeed = async () => {
  try {
    console.log("==================================");
    console.log("DCS-HIMS Database Seed & Init");
    console.log("==================================");

    await initDatabase(true);
    await initSettingsTable();
    await syncAllEmployeesToUsers();

    console.log("==================================");
    console.log("Seed & initialization completed.");
    console.log("==================================");
  } catch (error) {
    console.error("Seed execution failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

runSeed();