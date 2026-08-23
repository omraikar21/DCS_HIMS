-- ==========================================
-- MIGRATION 001: INITIAL SCHEMA
-- ==========================================

-- 1. USERS TABLE
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

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  department_head VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMPLOYEES TABLE
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

-- 4. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  status VARCHAR(30) DEFAULT 'PRESENT',
  work_type VARCHAR(30) DEFAULT 'OFFICE',
  total_hours NUMERIC(4,2) DEFAULT 8.0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, attendance_date)
);

-- 5. LEAVES TABLE
CREATE TABLE IF NOT EXISTS leaves (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  status VARCHAR(30) DEFAULT 'PENDING',
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. PAYROLL TABLE
CREATE TABLE IF NOT EXISTS payroll (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  hra NUMERIC(12,2) DEFAULT 0,
  allowances NUMERIC(12,2) DEFAULT 0,
  deductions NUMERIC(12,2) DEFAULT 0,
  net_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'BANK_TRANSFER',
  payment_status VARCHAR(30) DEFAULT 'PENDING',
  payment_date DATE,
  transaction_id VARCHAR(100),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, month, year)
);

-- 7. PAYSLIPS TABLE
CREATE TABLE IF NOT EXISTS payslips (
  id SERIAL PRIMARY KEY,
  payroll_id INTEGER NOT NULL REFERENCES payroll(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payslip_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  file_path TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  document_type VARCHAR(100),
  file_url TEXT NOT NULL,
  file_size VARCHAR(50),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. RECRUITMENT TABLE
CREATE TABLE IF NOT EXISTS recruitment (
  id SERIAL PRIMARY KEY,
  candidate_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  position VARCHAR(150),
  status VARCHAR(50) DEFAULT 'APPLIED',
  interview_date TIMESTAMP,
  notes TEXT,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. ONBOARDING TABLE
CREATE TABLE IF NOT EXISTS onboarding (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_name VARCHAR(255) NOT NULL,
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. NOTIFICATIONS TABLE
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

-- 12. AUDIT LOGS TABLE
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

-- 13. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) DEFAULT 'DCS Technology Corporation',
  contact_email VARCHAR(150) DEFAULT 'support@dcstechnology.com',
  timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
  date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
  currency VARCHAR(10) DEFAULT 'INR',
  email_alerts BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  two_factor_auth BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_employee ON documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_status ON recruitment(status);
