const { pool } = require("../config/database");

async function checkCounts() {
  const tables = [
    "users",
    "departments",
    "employees",
    "attendance",
    "leaves",
    "payroll",
    "payslips",
    "documents",
    "recruitment",
    "onboarding",
    "notifications",
    "audit_logs"
  ];

  console.log("--- Current Database Row Counts ---");
  for (const t of tables) {
    const res = await pool.query(`SELECT COUNT(*)::int AS count FROM ${t}`);
    console.log(`  ${t.padEnd(16)}: ${res.rows[0].count}`);
  }

  const usersRes = await pool.query(`SELECT id, name, email, role, is_super_admin FROM users`);
  console.log("--- Active User Accounts ---");
  usersRes.rows.forEach(u => {
    console.log(`  User: ${u.name} (${u.email}) | Role: ${u.role} | is_super_admin: ${u.is_super_admin}`);
  });

  process.exit(0);
}

checkCounts().catch(err => {
  console.error("Check counts error:", err);
  process.exit(1);
});
