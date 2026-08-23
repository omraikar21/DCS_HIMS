const { createEmployee, getAllEmployees } = require("../models/employeeModel");
const { getOrCreateDepartmentService } = require("../services/departmentService");
const { pool } = require("../config/database");

async function testCreate() {
  console.log("--- Testing Employee Creation ---");
  try {
    const dept = await getOrCreateDepartmentService("AI ML");
    console.log("Resolved Dept:", dept);

    const emp = await createEmployee({
      firstName: "Anand",
      lastName: "K",
      email: "anand.test@dcshims.internal",
      phone: "8798888898",
      departmentId: dept.id,
      designation: "AI Engineer",
      joiningDate: "24-08-2026",
      salary: 55000,
      hra: 15000,
      allowances: 5000,
      pfDeduction: 2000,
      taxDeduction: 1000,
      employmentStatus: "ACTIVE",
      address: "Huballi · Gokul Road",
    });

    console.log("Successfully created employee:", emp);

    // Delete test employee and clean up
    await pool.query("DELETE FROM employees WHERE email = $1", ["anand.test@dcshims.internal"]);
    console.log("Test employee cleaned up successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}

testCreate();
