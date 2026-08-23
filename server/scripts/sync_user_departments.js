const { pool } = require("../config/database");
const { getOrCreateDepartmentService } = require("../services/departmentService");

async function syncDepartments() {
  console.log("--- Synchronizing User & Admin Departments ---");
  try {
    const adminDept = await getOrCreateDepartmentService("Administration");
    const hrDept = await getOrCreateDepartmentService("Human Resources");
    const finDept = await getOrCreateDepartmentService("Finance");

    console.log(`Administration Dept ID: ${adminDept.id}`);
    console.log(`Human Resources Dept ID: ${hrDept.id}`);
    console.log(`Finance Dept ID: ${finDept.id}`);

    // Update Secondary Admins
    const adminUsers = await pool.query("SELECT id, name, email FROM users WHERE role = 'ADMIN' AND is_super_admin = FALSE");
    for (const u of adminUsers.rows) {
      await pool.query(
        "UPDATE employees SET department_id = $1, last_name = CASE WHEN last_name = 'Staff' THEN '' ELSE last_name END WHERE email = $2 OR user_id = $3",
        [adminDept.id, u.email, u.id]
      );
      console.log(`  Linked Admin ${u.name} (${u.email}) -> Administration`);
    }

    // Update HR Users
    const hrUsers = await pool.query("SELECT id, name, email FROM users WHERE role = 'HR'");
    for (const u of hrUsers.rows) {
      await pool.query(
        "UPDATE employees SET department_id = $1, last_name = CASE WHEN last_name = 'Staff' THEN '' ELSE last_name END WHERE email = $2 OR user_id = $3",
        [hrDept.id, u.email, u.id]
      );
      console.log(`  Linked HR ${u.name} (${u.email}) -> Human Resources`);
    }

    // Update Finance Users
    const finUsers = await pool.query("SELECT id, name, email FROM users WHERE role = 'FINANCE'");
    for (const u of finUsers.rows) {
      await pool.query(
        "UPDATE employees SET department_id = $1, last_name = CASE WHEN last_name = 'Staff' THEN '' ELSE last_name END WHERE email = $2 OR user_id = $3",
        [finDept.id, u.email, u.id]
      );
      console.log(`  Linked Finance ${u.name} (${u.email}) -> Finance`);
    }

    console.log("=== Department synchronization completed successfully. ===");
    process.exit(0);
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
}

syncDepartments();
