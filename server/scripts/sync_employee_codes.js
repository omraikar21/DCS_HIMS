const { pool } = require("../config/database");
const { generateDepartmentEmployeeCode } = require("../models/employeeModel");

async function syncEmployeeCodes() {
  console.log("--- Synchronizing Employee Codes with Department/Role Prefixes ---");
  try {
    const employees = await pool.query(`
      SELECT e.id, e.first_name, e.last_name, e.email, e.designation, e.department_id, d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      ORDER BY e.id ASC
    `);

    for (const emp of employees.rows) {
      const newCode = await generateDepartmentEmployeeCode(emp.department_id, emp.designation, emp.department_name);
      await pool.query(
        "UPDATE employees SET employee_code = $1 WHERE id = $2",
        [newCode, emp.id]
      );
      console.log(`Updated Employee ID ${emp.id} (${emp.first_name}) [${emp.department_name || 'General'}] -> ${newCode}`);
    }

    console.log("=== Employee Codes Synchronized Successfully ===");
    process.exit(0);
  } catch (err) {
    console.error("Sync error:", err);
    process.exit(1);
  }
}

syncEmployeeCodes();
