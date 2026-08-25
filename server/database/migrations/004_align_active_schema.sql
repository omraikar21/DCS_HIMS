-- ==========================================
-- MIGRATION 004: ALIGN ACTIVE APPLICATION SCHEMA
-- Adds the columns used by current models to databases created by 001-003.
-- Legacy columns remain nullable for backwards compatibility.
-- ==========================================

ALTER TABLE attendance ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE leaves ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

ALTER TABLE payroll ADD COLUMN IF NOT EXISTS payroll_month INTEGER;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS payroll_year INTEGER;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS gross_salary NUMERIC(12,2) DEFAULT 0;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100);
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50);
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100);
UPDATE payroll
SET gross_salary = COALESCE(gross_salary, basic_salary + COALESCE(allowances, 0))
WHERE gross_salary IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payroll' AND column_name = 'month'
  ) THEN
    EXECUTE 'UPDATE payroll SET payroll_month = COALESCE(payroll_month, month) WHERE payroll_month IS NULL';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payroll' AND column_name = 'year'
  ) THEN
    EXECUTE 'UPDATE payroll SET payroll_year = COALESCE(payroll_year, year) WHERE payroll_year IS NULL';
  END IF;
END $$;
ALTER TABLE payroll ALTER COLUMN payroll_month SET NOT NULL;
ALTER TABLE payroll ALTER COLUMN payroll_year SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_employee_period
  ON payroll(employee_id, payroll_month, payroll_year);

ALTER TABLE payslips ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE documents ADD COLUMN IF NOT EXISTS document_name VARCHAR(200);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'title'
  ) THEN
    EXECUTE 'UPDATE documents SET document_name = COALESCE(document_name, title) WHERE document_name IS NULL';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'file_url'
  ) THEN
    EXECUTE 'UPDATE documents SET file_path = COALESCE(file_path, file_url) WHERE file_path IS NULL';
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'title'
  ) THEN
    ALTER TABLE documents ALTER COLUMN title DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'documents' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE documents ALTER COLUMN file_url DROP NOT NULL;
  END IF;
END $$;
ALTER TABLE documents ALTER COLUMN document_name SET NOT NULL;

ALTER TABLE recruitment ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE recruitment ADD COLUMN IF NOT EXISTS experience_years NUMERIC(5,2);

ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS candidate_id INTEGER REFERENCES recruitment(id) ON DELETE SET NULL;
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS joining_date DATE;
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS designation VARCHAR(100);
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(30) DEFAULT 'PENDING';
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS documents_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE onboarding ADD COLUMN IF NOT EXISTS orientation_completed BOOLEAN DEFAULT FALSE;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'onboarding' AND column_name = 'task_name'
  ) THEN
    ALTER TABLE onboarding ALTER COLUMN task_name DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'onboarding' AND column_name = 'employee_id'
  ) THEN
    ALTER TABLE onboarding ALTER COLUMN employee_id DROP NOT NULL;
  END IF;
END $$;

ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS key VARCHAR(100);
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE system_settings ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'GENERAL';
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'system_settings' AND column_name = 'id'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'system_settings' AND column_name = 'company_name'
    ) THEN
      EXECUTE 'UPDATE system_settings SET key = COALESCE(key, ''legacy_'' || id::text), value = COALESCE(value, company_name, '''') WHERE key IS NULL OR value IS NULL';
    ELSE
      EXECUTE 'UPDATE system_settings SET key = COALESCE(key, ''legacy_'' || id::text), value = COALESCE(value, '''') WHERE key IS NULL OR value IS NULL';
    END IF;
  ELSE
    EXECUTE 'UPDATE system_settings SET value = COALESCE(value, '''') WHERE value IS NULL';
  END IF;
END $$;
ALTER TABLE system_settings ALTER COLUMN key SET NOT NULL;
ALTER TABLE system_settings ALTER COLUMN value SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);