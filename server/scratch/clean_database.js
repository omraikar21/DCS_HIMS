const { pool } = require("../config/database");

async function cleanup() {
  console.log("Cleaning up dummy data from tables...");

  // 1. Clear operational tables
  await pool.query("DELETE FROM attendance");
  await pool.query("DELETE FROM leaves");
  await pool.query("DELETE FROM payslips");
  await pool.query("DELETE FROM payroll");
  await pool.query("DELETE FROM documents");

  // 2. Clean dummy employees and users
  const allowedEmails = [
    "admin@dcshims.com",
    "hr@dcshims.com",
    "finance@dcshims.com",
    "employee@dcshims.com",
    "omraikar14@gmail.com",
    "raikarom9@gmail.com",
    "anandck89@gmail.com",
  ];

  await pool.query(
    "DELETE FROM employees WHERE email != ALL($1)",
    [allowedEmails]
  );
  await pool.query(
    "DELETE FROM users WHERE email != ALL($1)",
    [allowedEmails]
  );

  // Check remaining
  const userRes = await pool.query("SELECT id, name, email, role FROM users ORDER BY id");
  console.log("Remaining Users (" + userRes.rows.length + "):", userRes.rows);

  const empRes = await pool.query("SELECT id, first_name, last_name, email, designation FROM employees ORDER BY id");
  console.log("Remaining Employees (" + empRes.rows.length + "):", empRes.rows);

  const tables = ["attendance", "leaves", "payslips", "payroll", "documents"];
  for (const t of tables) {
    const c = await pool.query("SELECT count(*) FROM " + t);
    console.log(`${t} count:`, c.rows[0].count);
  }

  console.log("Database cleanup completed successfully!");
  process.exit(0);
}

cleanup().catch((err) => {
  console.error("Cleanup Error:", err);
  process.exit(1);
});
