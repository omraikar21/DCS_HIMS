// ==========================================
// CLEAN DATABASE SCRIPT - DCS-HIMS
// Resets database to a completely fresh state
// Keeps ONLY Super Administrator: omraikar2128@gmail.com
// ==========================================

const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

async function cleanFreshDatabase() {
  console.log("--- Starting DCS-HIMS Database Cleanup & Fresh Reset ---");
  try {
    // 1. Delete dependent transactional records
    await pool.query("DELETE FROM payslips;");
    await pool.query("DELETE FROM payroll;");
    await pool.query("DELETE FROM attendance;");
    await pool.query("DELETE FROM leaves;");
    await pool.query("DELETE FROM documents;");
    await pool.query("DELETE FROM onboarding;");
    await pool.query("DELETE FROM recruitment;");
    await pool.query("DELETE FROM audit_logs;");
    await pool.query("DELETE FROM notifications;");

    // 2. Delete all employees
    await pool.query("DELETE FROM employees;");

    // 3. Delete all departments (clean fresh start)
    await pool.query("DELETE FROM departments;");

    // 4. Delete all users EXCEPT Super Administrator
    const superAdminEmail = "omraikar2128@gmail.com";
    await pool.query("DELETE FROM users WHERE email != $1;", [superAdminEmail]);

    // 5. Ensure Super Administrator exists with correct credentials
    const adminCheck = await pool.query("SELECT id, email FROM users WHERE email = $1;", [superAdminEmail]);
    const passwordHash = await bcrypt.hash("Admin@123", 10);

    if (adminCheck.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, is_super_admin, is_active)
         VALUES ('Om Raikar', $1, $2, 'ADMIN', TRUE, TRUE);`,
        [superAdminEmail, passwordHash]
      );
      console.log(`[CLEAN DB] Created Super Admin account: ${superAdminEmail}`);
    } else {
      await pool.query(
        `UPDATE users 
         SET name = 'Om Raikar',
             password_hash = $1,
             role = 'ADMIN',
             is_super_admin = TRUE,
             is_active = TRUE
         WHERE email = $2;`,
        [passwordHash, superAdminEmail]
      );
      console.log(`[CLEAN DB] Verified Super Admin account: ${superAdminEmail}`);
    }

    // 6. Reset Sequences
    try {
      await pool.query("ALTER SEQUENCE IF EXISTS departments_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS employees_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS attendance_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS leaves_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS payroll_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS payslips_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS documents_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS audit_logs_id_seq RESTART WITH 1;");
      await pool.query("ALTER SEQUENCE IF EXISTS notifications_id_seq RESTART WITH 1;");
    } catch (seqErr) {
      console.warn("[CLEAN DB] Sequence reset notice:", seqErr.message);
    }

    console.log("=== SUCCESS: Database reset complete. 0 dummy records remaining. ===");
    console.log("Active accounts: 1 (Om Raikar - omraikar2128@gmail.com / Admin@123)");
    process.exit(0);
  } catch (err) {
    console.error("[CLEAN DB ERROR] Failed to clean database:", err);
    process.exit(1);
  }
}

cleanFreshDatabase();
