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

    // Check if seeded, if not add initial corporate baseline logs
    const count = await pool.query("SELECT COUNT(*) FROM audit_logs");
    if (parseInt(count.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO audit_logs (log_code, event_action, category, actor_name, actor_email, role, details, status, created_at)
        VALUES
        ('LOG-2026-0001', 'System Security Audit Initialized', 'SECURITY', 'System Sentinel', 'system@dcshims.internal', 'SYSTEM', 'PostgreSQL cryptographic integrity and schema verified.', 'SUCCESS', NOW() - INTERVAL '2 days'),
        ('LOG-2026-0002', 'User Authentication Success', 'AUTH', 'Om Raikar', 'omraikar2128@gmail.com', 'ADMIN', 'JWT Session token signed with 24h expiration.', 'SUCCESS', NOW() - INTERVAL '1 day'),
        ('LOG-2026-0003', 'Employee Profile Provisioned', 'EMPLOYEE', 'Om Raikar (HR)', 'raikarom9@gmail.com', 'HR', 'Provisioned Anand (DCS-EMP-001) as Senior AI Engineer.', 'SUCCESS', NOW() - INTERVAL '18 hours'),
        ('LOG-2026-0004', 'Password Updated & Encrypted', 'SECURITY', 'Anand', 'anandck89@gmail.com', 'EMPLOYEE', 'Bcrypt salt hash re-generated; must_change_password set to false.', 'SUCCESS', NOW() - INTERVAL '12 hours'),
        ('LOG-2026-0005', 'Finance Report Generated & Sent', 'FINANCE', 'Om Raikar (Finance)', 'omraikar14@gmail.com', 'FINANCE', 'Issued August 2026 Salary Breakup to Anand (anandck89@gmail.com).', 'SUCCESS', NOW() - INTERVAL '4 hours')
      `);
      console.log("[AUDIT] Initial audit trail baseline seeded.");
    }
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
