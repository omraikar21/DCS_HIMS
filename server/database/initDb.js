// ==========================================
// AUTOMATIC DATABASE INITIALIZER
// Creates all tables, indexes, and default seeds
// ==========================================

const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

const initDatabase = async () => {
  try {
    console.log("[DB INIT] Verifying and creating tables if not present...");

    // 1. USERS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'EMPLOYEE',
        avatar TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        is_super_admin BOOLEAN DEFAULT FALSE,
        must_change_password BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. DEPARTMENTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        department_head VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. EMPLOYEES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        employee_code VARCHAR(50) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(150) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        designation VARCHAR(100),
        joining_date DATE,
        salary NUMERIC(12,2) DEFAULT 0,
        hra NUMERIC(12,2) DEFAULT 0,
        allowances NUMERIC(12,2) DEFAULT 0,
        pf_deduction NUMERIC(12,2) DEFAULT 0,
        tax_deduction NUMERIC(12,2) DEFAULT 0,
        employment_status VARCHAR(30) DEFAULT 'ACTIVE',
        bank_name VARCHAR(100),
        bank_account VARCHAR(100),
        ifsc_code VARCHAR(50),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure compensation columns exist on existing databases
    await pool.query(`
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS hra NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS allowances NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS pf_deduction NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS tax_deduction NUMERIC(12,2) DEFAULT 0;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100);
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50);
      ALTER TABLE employees ALTER COLUMN bank_name DROP DEFAULT;
      ALTER TABLE employees ALTER COLUMN bank_account DROP DEFAULT;
      ALTER TABLE employees ALTER COLUMN ifsc_code DROP DEFAULT;
    `);

    // Clean any hardcoded placeholder bank accounts
    await pool.query(`
      UPDATE employees 
      SET bank_name = NULL, bank_account = NULL, ifsc_code = NULL 
      WHERE bank_account = '50100482910482';
    `);

    // 4. ATTENDANCE TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        attendance_date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status VARCHAR(30) DEFAULT 'PRESENT',
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (employee_id, attendance_date)
      );
    `);

    // 5. LEAVES TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leaves (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        leave_type VARCHAR(50) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status VARCHAR(30) DEFAULT 'PENDING',
        approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. PAYROLL TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payroll (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        payroll_month INTEGER NOT NULL,
        payroll_year INTEGER NOT NULL,
        basic_salary NUMERIC(12,2) DEFAULT 0,
        allowances NUMERIC(12,2) DEFAULT 0,
        deductions NUMERIC(12,2) DEFAULT 0,
        gross_salary NUMERIC(12,2) DEFAULT 0,
        net_salary NUMERIC(12,2) DEFAULT 0,
        payment_status VARCHAR(30) DEFAULT 'PENDING',
        payment_date DATE,
        bank_name VARCHAR(100),
        bank_account VARCHAR(100),
        ifsc_code VARCHAR(50),
        transaction_ref VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (employee_id, payroll_month, payroll_year)
      );
    `);

    // Ensure columns exist on existing databases
    await pool.query(`
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100);
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50);
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100);
    `);

    // 7. PAYSLIPS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payslips (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        payroll_id INTEGER REFERENCES payroll(id) ON DELETE CASCADE,
        payslip_number VARCHAR(100) UNIQUE NOT NULL,
        file_path TEXT,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. DOCUMENTS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        document_name VARCHAR(200) NOT NULL,
        document_type VARCHAR(100),
        file_name VARCHAR(255),
        file_path TEXT,
        file_size BIGINT,
        mime_type VARCHAR(100),
        uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. RECRUITMENT TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recruitment (
        id SERIAL PRIMARY KEY,
        candidate_name VARCHAR(150) NOT NULL,
        email VARCHAR(150),
        phone VARCHAR(20),
        position VARCHAR(100),
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        experience_years NUMERIC(5,2),
        application_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(30) DEFAULT 'APPLIED',
        interview_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. ONBOARDING TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS onboarding (
        id SERIAL PRIMARY KEY,
        candidate_id INTEGER REFERENCES recruitment(id) ON DELETE SET NULL,
        employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
        joining_date DATE,
        department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
        designation VARCHAR(100),
        onboarding_status VARCHAR(30) DEFAULT 'PENDING',
        documents_completed BOOLEAN DEFAULT FALSE,
        orientation_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. NOTIFICATIONS TABLE
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'NOTIFICATION',
        sender_role VARCHAR(50) DEFAULT 'SYSTEM',
        sender_name VARCHAR(100) DEFAULT 'System Sentinel',
        sender_email VARCHAR(150) DEFAULT 'system@dcshims.internal',
        target_role VARCHAR(50) DEFAULT 'ALL',
        target_email VARCHAR(150) DEFAULT 'ALL',
        target_name VARCHAR(100),
        target_user_id INTEGER,
        category VARCHAR(50) DEFAULT 'GENERAL',
        priority VARCHAR(30) DEFAULT 'MEDIUM',
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. AUDIT LOGS TABLE
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

    // 13. INDEXES
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
      CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
      CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
      CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
      CREATE INDEX IF NOT EXISTS idx_documents_employee ON documents(employee_id);
      CREATE INDEX IF NOT EXISTS idx_recruitment_status ON recruitment(status);
    `);

    // 14. PURGE ALL LEGACY DUMMY USERS & DUMMY SEED DEPARTMENTS
    try {
      await pool.query(`
        DELETE FROM users 
        WHERE email LIKE '%@dcshims.com' 
           OR email IN ('admin@dcshims.com', 'hr@dcshims.com', 'finance@dcshims.com', 'employee@dcshims.com');
      `);

      await pool.query(`
        DELETE FROM departments 
        WHERE description IN (
          'Core web architecture, backend APIs, and microservices',
          'LLM pipelines, agentic workflows, and predictive modeling',
          'Kubernetes infrastructure, CI/CD, and multi-cloud reliability',
          'Smart sensors, edge telemetry, and firmware development',
          'Talent management, employee relations, and HR policies',
          'Financial planning, statutory tax compliance, and payroll',
          'Design systems, prototyping, and modern user experiences',
          'Automated testing, load testing, and release certification',
          'Handles employee management and HR operations',
          'Handles software and technology operations',
          'Handles payroll and financial operations',
          'Handles administrative activities',
          'Handles daily organizational operations'
        );
      `);
    } catch (cleanupErr) {
      console.warn("[DB INIT] Cleanup notice:", cleanupErr.message);
    }

    // 15. SEED SUPER ADMIN (omraikar2128@gmail.com / Admin@123)
    const adminEmail = "omraikar2128@gmail.com";
    const adminCheck = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [adminEmail]
    );

    if (adminCheck.rows.length === 0) {
      const adminPass = await bcrypt.hash("Admin@123", 10);
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, is_super_admin, is_active)
        VALUES ('Om Raikar', $1, $2, 'ADMIN', TRUE, TRUE)
        ON CONFLICT (email) DO NOTHING;
      `, [adminEmail, adminPass]);
      console.log(`[DB INIT] Primary Super Admin created (${adminEmail} / Admin@123).`);
    } else {
      // Ensure Om Raikar is set as permanent super admin
      await pool.query(
        "UPDATE users SET is_super_admin = TRUE, role = 'ADMIN', name = 'Om Raikar' WHERE email = $1",
        [adminEmail]
      );
    }

    console.log("[DB INIT] Database initialization completed successfully.");
  } catch (err) {
    console.error("[DB INIT ERROR] Failed to initialize database tables:", err.message);
  }
};

module.exports = { initDatabase };
