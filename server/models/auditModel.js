// ==========================================
// AUDIT LOG MODEL
// PostgreSQL Database Access & Security Trail
// ==========================================

const { pool } = require("../config/database");

// Ensure audit_logs table exists
const ensureAuditTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        log_code VARCHAR(50) UNIQUE,
        event_action VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        actor_name VARCHAR(100) NOT NULL,
        actor_email VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        details TEXT,
        status VARCHAR(50) DEFAULT 'SUCCESS',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.warn("Audit table initialization error:", err.message);
  }
};

// Initialize table on module load
ensureAuditTable();

// ------------------------------------------
// CREATE AUDIT LOG
// ------------------------------------------
const createAuditLog = async ({
  eventAction,
  category = "SYSTEM",
  actorName = "System",
  actorEmail = "system@dcshims.internal",
  role = "SYSTEM",
  details = "",
  status = "SUCCESS",
}) => {
  try {
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.floor(Math.random() * 900 + 100);
    const logCode = `LOG-2026-${timestamp}${randomHex}`;

    const result = await pool.query(
      `
      INSERT INTO audit_logs
      (
        log_code,
        event_action,
        category,
        actor_name,
        actor_email,
        role,
        details,
        status,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING *
      `,
      [
        logCode,
        eventAction,
        category.toUpperCase(),
        actorName,
        actorEmail,
        role.toUpperCase(),
        details,
        status.toUpperCase(),
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error("[AUDIT LOG ERROR]", err.message);
    return null;
  }
};

// ------------------------------------------
// GET ALL AUDIT LOGS
// ------------------------------------------
const getAllAuditLogs = async () => {
  try {
    await ensureAuditTable();
    const result = await pool.query(`
      SELECT
        id,
        log_code AS "logCode",
        event_action AS "eventAction",
        category,
        actor_name AS "actorName",
        actor_email AS "actorEmail",
        role,
        details,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') || ' IST' AS "formattedTimestamp",
        created_at AS "createdAt"
      FROM audit_logs
      ORDER BY id DESC
    `);
    return result.rows;
  } catch (err) {
    console.error("[GET AUDIT LOGS ERROR]", err.message);
    return [];
  }
};

module.exports = {
  createAuditLog,
  getAllAuditLogs,
};
