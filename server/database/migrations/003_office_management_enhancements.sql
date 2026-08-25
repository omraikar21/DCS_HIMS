-- ==========================================
-- MIGRATION 003: OFFICE MANAGEMENT SYSTEM ROLE & WORKFLOW ENHANCEMENTS
-- ==========================================

-- 1. Ensure `users` table contains correct role constraints
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- 2. Add Team Lead reference and department allocation columns to `departments`
ALTER TABLE departments ADD COLUMN IF NOT EXISTS team_lead_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS allocated_admin VARCHAR(150);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS allocated_user VARCHAR(150);

-- 3. Enhance `leaves` table for Team Lead and Department level routing
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE leaves ADD COLUMN IF NOT EXISTS applicant_role VARCHAR(50) DEFAULT 'EMPLOYEE';

-- 4. Enhance `notifications` table for Categorized Notifications & Announcements with Timeframe
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS timeframe VARCHAR(100);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'GENERAL';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(30) DEFAULT 'MEDIUM';

-- 5. Ensure `custom_reports` table exists for Finance Reports sent to Primary Admin
CREATE TABLE IF NOT EXISTS custom_reports (
  id SERIAL PRIMARY KEY,
  report_title VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL DEFAULT 'FINANCE_REPORT',
  period VARCHAR(100),
  parameters JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '[]'::jsonb,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by_name VARCHAR(100),
  recipient_role VARCHAR(50) DEFAULT 'PRIMARY_ADMIN',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_departments_team_lead ON departments(team_lead_id);
CREATE INDEX IF NOT EXISTS idx_leaves_dept ON leaves(department_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);
