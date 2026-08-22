const { pool } = require("./config/database");

async function run() {
  try {
    await pool.query(`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100) DEFAULT 'HDFC Bank';
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100) DEFAULT '50100482910482';
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50) DEFAULT 'HDFC0001234';

      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100);
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50);
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100);

      UPDATE employees
      SET
        bank_name = 'HDFC Bank',
        bank_account = '50100482910482',
        ifsc_code = 'HDFC0001234'
      WHERE bank_name IS NULL;
    `);

    console.log("Migration executed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

run();
