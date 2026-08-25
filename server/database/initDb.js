// ==========================================
// AUTOMATIC DATABASE INITIALIZER
// Creates all tables, indexes, and default seeds
// ==========================================

const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

const initDatabase = async (isSeedExecution = false) => {
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

    // Ensure columns exist on existing databases
    await pool.query(`
      ALTER TABLE departments ADD COLUMN IF NOT EXISTS allocated_admin VARCHAR(150);
      ALTER TABLE departments ADD COLUMN IF NOT EXISTS allocated_user VARCHAR(150);
      ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_head VARCHAR(150);
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

    // Backfill allocated_admin / allocated_user / department_head for existing departments in database
    await pool.query(`
      UPDATE departments d
      SET allocated_admin = u.name,
          allocated_user = u.name,
          department_head = u.name
      FROM employees e
      JOIN users u ON u.id = e.user_id
      WHERE e.department_id = d.id AND u.role = 'ADMIN';
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

        DELETE FROM employees
        WHERE LOWER(email) IN ('omraikar2128@gmail.com', 'omraikar2128@gamil.com');
      `);

      await pool.query(`
        DELETE FROM departments 
        WHERE name IN ('Finance', 'Development', 'AI ML', 'Administration', 'DCS-ADM-1', 'DCS-HR-2', 'DCS-FIN-3', 'DCS-DEV-4', 'DCS-AIML-5')
           OR (description IN (
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
          ) AND name NOT IN ('Software Development', 'Human Resources', 'Finance & Accounts', 'Product & Design', 'Quality Assurance'));
      `);
    } catch (cleanupErr) {
      console.warn("[DB INIT] Cleanup notice:", cleanupErr.message);
    }

    // 15. SEED SUPER ADMIN & SYSTEM USERS
    const adminEmail = "omraikar2128@gmail.com";
    const defaultPasswordHash = await bcrypt.hash("Admin@123", 10);

    // Super Admin
    const adminCheck = await pool.query("SELECT id FROM users WHERE email = $1", [adminEmail]);
    if (adminCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, is_super_admin, is_active)
        VALUES ('Om Raikar', $1, $2, 'ADMIN', TRUE, TRUE)
        ON CONFLICT (email) DO NOTHING;
      `, [adminEmail, defaultPasswordHash]);
      console.log(`[DB INIT] Primary Super Admin created (${adminEmail}).`);
    } else {
      await pool.query(
        "UPDATE users SET is_super_admin = TRUE, role = 'ADMIN', name = 'Om Raikar' WHERE email = $1",
        [adminEmail]
      );
    }

    // Only run mock seeding if explicitly requested via seed.js
    if (!isSeedExecution) {
      console.log("[DB INIT] Database tables and schema verified. Skipping mock employee re-seeding.");
      return;
    }

    // Seed Core Roles (Primary Admin, HR, Finance, Team Leads, Employees)
    const seedUsers = [
      { name: "Executive Admin", email: "admin@dcs.com", role: "ADMIN", is_super: false },
      { name: "Priya Sharma", email: "hr@dcs.com", role: "HR", is_super: false },
      { name: "Rahul Verma", email: "finance@dcs.com", role: "FINANCE", is_super: false },
      { name: "Rajesh Gupta", email: "tl_dev@dcs.com", role: "TEAM_LEAD", is_super: false },
      { name: "Vikram Singh", email: "tl_hr@dcs.com", role: "TEAM_LEAD", is_super: false },
      { name: "Amit Patel", email: "amit@dcs.com", role: "EMPLOYEE", is_super: false },
      { name: "Neha Sen", email: "neha@dcs.com", role: "EMPLOYEE", is_super: false },
      { name: "Sneha Roy", email: "sneha@dcs.com", role: "EMPLOYEE", is_super: false },
    ];

    for (const u of seedUsers) {
      await pool.query(`
        INSERT INTO users (name, email, password_hash, role, is_super_admin, is_active)
        VALUES ($1, $2, $3, $4, $5, TRUE)
        ON CONFLICT (email) DO NOTHING;
      `, [u.name, u.email, defaultPasswordHash, u.role, u.is_super]);
    }

    // Departments start fresh - Primary Admin creates departments and assigns Team Leads dynamically

    // Seed Employee Profiles
    const devDept = (await pool.query("SELECT id FROM departments WHERE name = 'Software Development'")).rows[0]?.id;
    const hrDept = (await pool.query("SELECT id FROM departments WHERE name = 'Human Resources'")).rows[0]?.id;
    const finDept = (await pool.query("SELECT id FROM departments WHERE name = 'Finance & Accounts'")).rows[0]?.id;

    const seedEmployees = [
      { code: "EMP-001", name: "Priya Sharma", email: "hr@dcs.com", desig: "HR Manager", deptId: hrDept, salary: 85000, hra: 25000, bank: "HDFC Bank", acc: "50100482910482", ifsc: "HDFC0001234" },
      { code: "EMP-002", name: "Rahul Verma", email: "finance@dcs.com", desig: "Finance Lead", deptId: finDept, salary: 92000, hra: 28000, bank: "ICICI Bank", acc: "000401582910", ifsc: "ICIC0000004" },
      { code: "EMP-003", name: "Rajesh Gupta", email: "tl_dev@dcs.com", desig: "Senior Lead Engineer", deptId: devDept, salary: 115000, hra: 35000, bank: "Axis Bank", acc: "918010048291", ifsc: "UTIB0000123" },
      { code: "EMP-004", name: "Vikram Singh", email: "tl_hr@dcs.com", desig: "HR Team Lead", deptId: hrDept, salary: 78000, hra: 22000, bank: "SBI Bank", acc: "30192840192", ifsc: "SBIN0000301" },
      { code: "EMP-005", name: "Amit Patel", email: "amit@dcs.com", desig: "Full Stack Developer", deptId: devDept, salary: 65000, hra: 18000, bank: "HDFC Bank", acc: "501009182736", ifsc: "HDFC0001234" },
      { code: "EMP-006", name: "Neha Sen", email: "neha@dcs.com", desig: "Frontend Developer", deptId: devDept, salary: 60000, hra: 16000, bank: "Kotak Bank", acc: "8110928374", ifsc: "KKBK0000181" },
      { code: "EMP-007", name: "Sneha Roy", email: "sneha@dcs.com", desig: "QA Engineer", deptId: devDept, salary: 55000, hra: 15000, bank: "SBI Bank", acc: "20193847561", ifsc: "SBIN0000301" },
    ];

    for (const e of seedEmployees) {
      const uRes = await pool.query("SELECT id FROM users WHERE email = $1", [e.email]);
      const userId = uRes.rows[0]?.id || null;

      await pool.query(`
        INSERT INTO employees (user_id, employee_code, first_name, last_name, email, department_id, designation, salary, hra, allowances, pf_deduction, tax_deduction, bank_name, bank_account, ifsc_code, employment_status, joining_date)
        VALUES ($1, $2, $3, '', $4, $5, $6, $7, $8, 5000, 1800, 2500, $9, $10, $11, 'ACTIVE', CURRENT_DATE - INTERVAL '120 days')
        ON CONFLICT (email) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          salary = EXCLUDED.salary,
          hra = EXCLUDED.hra,
          bank_name = EXCLUDED.bank_name,
          bank_account = EXCLUDED.bank_account,
          ifsc_code = EXCLUDED.ifsc_code;
      `, [userId, e.code, e.name, e.email, e.deptId, e.desig, e.salary, e.hra, e.bank, e.acc, e.ifsc]);
    }

    // Seed Past 7 Days Attendance Records
    const empsList = (await pool.query("SELECT id FROM employees")).rows;
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      for (const emp of empsList) {
        const isPresent = (emp.id + dayOffset) % 5 !== 0;
        const status = isPresent ? "PRESENT" : (dayOffset % 2 === 0 ? "ABSENT" : "LEAVE");
        await pool.query(`
          INSERT INTO attendance (employee_id, attendance_date, check_in, check_out, status, remarks)
          VALUES ($1, CURRENT_DATE - INTERVAL '${dayOffset} days', '09:00:00', '18:00:00', $2, 'Automated Seed Record')
          ON CONFLICT (employee_id, attendance_date) DO NOTHING;
        `, [emp.id, status]);
      }
    }

    // Seed Sample Leaves
    if (empsList.length >= 2) {
      await pool.query(`
        INSERT INTO leaves (employee_id, leave_type, start_date, end_date, reason, status, applicant_role)
        VALUES 
          ($1, 'SICK', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE, 'Medical fever and recovery', 'APPROVED', 'EMPLOYEE'),
          ($2, 'CASUAL', CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', 'Personal family event', 'PENDING', 'TEAM_LEAD')
        ON CONFLICT DO NOTHING;
      `, [empsList[0].id, empsList[1].id]);
    }

    // Seed Sample Payroll Records for Past 3 Months
    for (let m = 6; m <= 8; m++) {
      for (const emp of empsList) {
        await pool.query(`
          INSERT INTO payroll (employee_id, payroll_month, payroll_year, basic_salary, allowances, deductions, gross_salary, net_salary, payment_status, payment_date)
          VALUES ($1, $2, 2026, 65000, 15000, 4300, 80000, 75700, 'PAID', CURRENT_DATE - INTERVAL '15 days')
          ON CONFLICT (employee_id, payroll_month, payroll_year) DO NOTHING;
        `, [emp.id, m]);
      }
    }

    console.log("[DB INIT] Database initialization and rich data seeding completed successfully.");
  } catch (err) {
    console.error("[DB INIT ERROR] Failed to initialize database tables:", err.message);
  }
};

module.exports = { initDatabase };
