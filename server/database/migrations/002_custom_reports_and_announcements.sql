-- ==========================================
-- MIGRATION 002: CUSTOM REPORTS & ANNOUNCEMENTS PERSISTENCE
-- Unifies client-side browser localStorage into PostgreSQL
-- ==========================================

-- 1. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) DEFAULT 'Notice',
  content TEXT NOT NULL,
  author VARCHAR(100) DEFAULT 'Management',
  pinned BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOM REPORTS TABLE
CREATE TABLE IF NOT EXISTS custom_reports (
  id SERIAL PRIMARY KEY,
  report_title VARCHAR(255) NOT NULL,
  report_type VARCHAR(100) NOT NULL,
  period VARCHAR(100),
  parameters JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '[]'::jsonb,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_by_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_announcements_pinned ON announcements(pinned);
CREATE INDEX IF NOT EXISTS idx_custom_reports_type ON custom_reports(report_type);
