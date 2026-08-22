
-- ==========================================
-- DCS-HIMS DATABASE SCHEMA
-- ==========================================


-- ==========================================
-- USERS
-- ==========================================

/*CREATE TABLE IF NOT EXISTS users (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    role VARCHAR(30) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);


-- ==========================================
-- DEPARTMENTS
-- ==========================================

CREATE TABLE IF NOT EXISTS departments (

    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,

    description TEXT,

    department_head VARCHAR(100),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);*/

-- ==========================================
-- EMPLOYEES
-- ==========================================

/*CREATE TABLE IF NOT EXISTS employees (

    id SERIAL PRIMARY KEY,

    user_id INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    employee_code VARCHAR(50) UNIQUE NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100),

    email VARCHAR(150) UNIQUE NOT NULL,

    phone VARCHAR(20),

    department_id INTEGER
        REFERENCES departments(id)
        ON DELETE SET NULL,

    designation VARCHAR(100),

    joining_date DATE,

    salary NUMERIC(12,2),

    employment_status VARCHAR(30)
        DEFAULT 'ACTIVE',

    address TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);*/

-- ==========================================
-- ATTENDANCE
-- ==========================================

/*CREATE TABLE IF NOT EXISTS attendance (

    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL
        REFERENCES employees(id)
        ON DELETE CASCADE,

    attendance_date DATE NOT NULL,

    check_in TIME,

    check_out TIME,

    status VARCHAR(30)
        DEFAULT 'PRESENT',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (
        employee_id,
        attendance_date
    )

);*/

-- ==========================================
-- LEAVES
-- ==========================================

/*CREATE TABLE IF NOT EXISTS leaves (

    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL
        REFERENCES employees(id)
        ON DELETE CASCADE,

    leave_type VARCHAR(50) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    reason TEXT,

    status VARCHAR(30)
        DEFAULT 'PENDING',

    approved_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    approved_at TIMESTAMP,

    rejection_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);*/

-- ==========================================
-- PAYROLL
-- ==========================================

/*CREATE TABLE IF NOT EXISTS payroll (

    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL
        REFERENCES employees(id)
        ON DELETE CASCADE,

    payroll_month INTEGER NOT NULL,

    payroll_year INTEGER NOT NULL,

    basic_salary NUMERIC(12,2) DEFAULT 0,

    allowances NUMERIC(12,2) DEFAULT 0,

    deductions NUMERIC(12,2) DEFAULT 0,

    gross_salary NUMERIC(12,2) DEFAULT 0,

    net_salary NUMERIC(12,2) DEFAULT 0,

    payment_status VARCHAR(30)
        DEFAULT 'PENDING',

    payment_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (
        employee_id,
        payroll_month,
        payroll_year
    )

);*/


-- ==========================================
-- DOCUMENTS
-- ==========================================

/*CREATE TABLE IF NOT EXISTS documents (

    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL
        REFERENCES employees(id)
        ON DELETE CASCADE,

    document_name VARCHAR(200) NOT NULL,

    document_type VARCHAR(100),

    file_name VARCHAR(255),

    file_path TEXT,

    file_size BIGINT,

    mime_type VARCHAR(100),

    uploaded_by INTEGER
        REFERENCES users(id)
        ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);*/

-- ==========================================
-- PAYSLIPS
-- ==========================================

/*CREATE TABLE IF NOT EXISTS payslips (

    id SERIAL PRIMARY KEY,

    employee_id INTEGER NOT NULL
        REFERENCES employees(id)
        ON DELETE CASCADE,

    payroll_id INTEGER
        REFERENCES payroll(id)
        ON DELETE CASCADE,

    payslip_number VARCHAR(100)
        UNIQUE NOT NULL,

    file_path TEXT,

    generated_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP

);*/

-- ==========================================
-- RECRUITMENT
-- ==========================================

/*CREATE TABLE IF NOT EXISTS recruitment (

    id SERIAL PRIMARY KEY,

    candidate_name VARCHAR(150) NOT NULL,

    email VARCHAR(150),

    phone VARCHAR(20),

    position VARCHAR(100),

    department_id INTEGER
        REFERENCES departments(id)
        ON DELETE SET NULL,

    experience_years NUMERIC(5,2),

    application_date DATE
        DEFAULT CURRENT_DATE,

    status VARCHAR(30)
        DEFAULT 'APPLIED',

    interview_date DATE,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);*/

-- ==========================================
-- ONBOARDING
-- ==========================================

/*CREATE TABLE IF NOT EXISTS onboarding (

    id SERIAL PRIMARY KEY,

    candidate_id INTEGER
        REFERENCES recruitment(id)
        ON DELETE SET NULL,

    employee_id INTEGER
        REFERENCES employees(id)
        ON DELETE SET NULL,

    joining_date DATE,

    department_id INTEGER
        REFERENCES departments(id)
        ON DELETE SET NULL,

    designation VARCHAR(100),

    onboarding_status VARCHAR(30)
        DEFAULT 'PENDING',

    documents_completed BOOLEAN
        DEFAULT FALSE,

    orientation_completed BOOLEAN
        DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);*/

-- ==========================================
-- INDEXES
-- ==========================================

/*CREATE INDEX IF NOT EXISTS
idx_employees_department
ON employees(department_id);


CREATE INDEX IF NOT EXISTS
idx_attendance_employee
ON attendance(employee_id);


CREATE INDEX IF NOT EXISTS
idx_attendance_date
ON attendance(attendance_date);


CREATE INDEX IF NOT EXISTS
idx_leaves_employee
ON leaves(employee_id);


CREATE INDEX IF NOT EXISTS
idx_leaves_status
ON leaves(status);


CREATE INDEX IF NOT EXISTS
idx_payroll_employee
ON payroll(employee_id);


CREATE INDEX IF NOT EXISTS
idx_documents_employee
ON documents(employee_id);


CREATE INDEX IF NOT EXISTS
idx_recruitment_status
ON recruitment(status);*/


/*SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;*/

/*SELECT *
FROM departments
ORDER BY id;*/

/*INSERT INTO departments
    (name, description, department_head)
VALUES
    (
        'Human Resources',
        'Handles employee management and HR operations',
        'Anita Sharma'
    ),
    (
        'Information Technology',
        'Handles software and technology operations',
        'Rajesh Kumar'
    ),
    (
        'Finance',
        'Handles payroll and financial operations',
        'Priya Patel'
    ),
    (
        'Administration',
        'Handles administrative activities',
        'Suresh Rao'
    ),
    (
        'Operations',
        'Handles daily organizational operations',
        'Meena Joshi'
    );*/


	/*SELECT
    id,
    name,
    description,
    department_head,
    is_active
FROM departments
ORDER BY id;*/


/*SELECT
    d.id,
    d.name AS department_name,
    COUNT(e.id) AS employee_count
FROM departments d
LEFT JOIN employees e
    ON d.id = e.department_id
GROUP BY
    d.id,
    d.name
ORDER BY d.id;*/

/*SELECT *
FROM departments;*/


/*SELECT
    id,
    name,
    email,
    role,
    is_active
FROM users;
*/

/*SELECT
    id,
    name,
    email,
    role,
    is_active
FROM users
ORDER BY id;*/


/*SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;*/


/*SELECT
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.designation,
    e.salary,
    e.employment_status,
    d.name AS department
FROM employees e
LEFT JOIN departments d
    ON e.department_id = d.id
ORDER BY e.id;*/

/*INSERT INTO employees
(
    employee_code,
    first_name,
    last_name,
    email,
    phone,
    department_id,
    designation,
    joining_date,
    salary,
    employment_status,
    address
)
VALUES
(
    'EMP-1001',
    'Arjun',
    'Joshi',
    'arjun.joshi@dcshims.com',
    '9876543210',
    2,
    'Software Engineer',
    '2025-07-15',
    55000,
    'ACTIVE',
    'Hubballi'
),
(
    'EMP-1002',
    'Priya',
    'Sharma',
    'priya.sharma@dcshims.com',
    '9876543211',
    1,
    'HR Executive',
    '2025-06-10',
    48000,
    'ACTIVE',
    'Dharwad'
),
(
    'EMP-1003',
    'Rahul',
    'Patil',
    'rahul.patil@dcshims.com',
    '9876543212',
    3,
    'Finance Executive',
    '2025-08-01',
    52000,
    'ACTIVE',
    'Belagavi'
),
(
    'EMP-1004',
    'Sneha',
    'Kulkarni',
    'sneha.kulkarni@dcshims.com',
    '9876543213',
    2,
    'UI Developer',
    '2025-09-05',
    50000,
    'ACTIVE',
    'Hubballi'
);*/

/*SELECT
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.designation,
    e.salary,
    e.employment_status,
    d.name AS department
FROM employees e
LEFT JOIN departments d
    ON e.department_id = d.id
ORDER BY e.id;
*/

/*SELECT id, name FROM departments;*/

/*SELECT
    e.id,
    e.employee_code,
    e.first_name,
    e.last_name,
    e.email,
    e.phone,
    e.designation,
    e.salary,
    e.employment_status,
    d.name AS department
FROM employees e
LEFT JOIN departments d
    ON e.department_id = d.id
WHERE e.employee_code = 'EMP-B9-001';*/

/*SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'departments'
ORDER BY ordinal_position;*/


/*SELECT *
FROM departments
ORDER BY id;*/


/*SELECT
    e.id,
    e.employee_code,
    e.first_name,
    d.name AS department
FROM employees e
LEFT JOIN departments d
    ON e.department_id = d.id
ORDER BY e.id;*/

/*SELECT
    id,
    name,
    description,
    is_active
FROM departments
WHERE id = 6;*/

/*SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'attendance'
ORDER BY ordinal_position;*/


/*SELECT *
FROM attendance
ORDER BY attendance_date DESC
LIMIT 10;*/

/*SELECT
    a.id,
    a.attendance_date,
    a.status,
    e.employee_code,
    e.first_name,
    e.last_name
FROM attendance a
JOIN employees e
    ON a.employee_id = e.id
ORDER BY a.attendance_date DESC
LIMIT 10;*/

/*SELECT
    id,
    employee_code,
    first_name,
    last_name,
    employment_status
FROM employees
WHERE employment_status = 'ACTIVE'
ORDER BY id;*/


/*SELECT *
FROM attendance
ORDER BY id;*/

/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'attendance'
ORDER BY ordinal_position;*/

/*SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'attendance';*/


/*INSERT INTO attendance
(
    employee_id,
    attendance_date,
    check_in,
    check_out,
    status,
    remarks
)
VALUES
(
    1,
    '2026-08-18',
    '09:05',
    '17:30',
    'PRESENT',
    'Regular working day'
),
(
    2,
    '2026-08-18',
    '09:20',
    '17:15',
    'PRESENT',
    'Regular working day'
),
(
    3,
    '2026-08-18',
    NULL,
    NULL,
    'ABSENT',
    'Absent for the day'
);*/


/*INSERT INTO attendance
(
    employee_id,
    attendance_date,
    check_in,
    check_out,
    status,
    remarks
)
VALUES
(
    1,
    '2026-08-19',
    '09:00',
    '17:40',
    'PRESENT',
    'Regular working day'
),
(
    2,
    '2026-08-19',
    '09:15',
    '17:20',
    'PRESENT',
    'Regular working day'
),
(
    3,
    '2026-08-19',
    NULL,
    NULL,
    'LEAVE',
    'Approved leave'
);
*/


/*SELECT id FROM employees where id=21;*/

/*SELECT
    a.id,
    e.employee_code,
    a.attendance_date,
    a.check_in,
    a.check_out,
    a.status,
    a.remarks
FROM attendance a
JOIN employees e
    ON a.employee_id = e.id
ORDER BY
    a.id DESC;*/


/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'leaves'
ORDER BY ordinal_position;*/

/*SELECT COUNT(*)
FROM leaves;*/

/*SELECT
    l.id,
    l.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.status
FROM leaves l
JOIN employees e
    ON l.employee_id = e.id
ORDER BY l.id;*/

/*SELECT
    id,
    employee_code,
    first_name,
    last_name
FROM employees
ORDER BY id;*/

/*INSERT INTO leaves
(
    employee_id,
    leave_type,
    start_date,
    end_date,
    reason,
    status
)
VALUES
(
    1,
    'CASUAL',
    '2026-08-18',
    '2026-08-18',
    'Personal work',
    'PENDING'
),
(
    2,
    'SICK',
    '2026-08-19',
    '2026-08-20',
    'Not feeling well',
    'PENDING'
);*/

/*SELECT
    l.id,
    e.employee_code,
    e.first_name,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.status
FROM leaves l
JOIN employees e
    ON l.employee_id = e.id
ORDER BY l.id DESC;*/

/*SELECT
    id,
    employee_id,
    leave_type,
    start_date,
    end_date,
    reason,
    status,
    approved_by
FROM leaves
ORDER BY id DESC;*/


/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payroll'
ORDER BY ordinal_position;*/

/*SELECT *
FROM payroll
ORDER BY id
LIMIT 10;*/

/*SELECT
    id,
    employee_code,
    first_name,
    last_name
FROM employees
ORDER BY id;*/

/*SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'payroll';*/

/*SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'payroll';*/


/*SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'payroll'
ORDER BY ordinal_position;*/


/*SELECT
    p.id,
    p.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    p.payroll_month,
    p.payroll_year,
    p.basic_salary,
    p.allowances,
    p.deductions,
    p.gross_salary,
    p.net_salary,
    p.payment_status,
    p.payment_date
FROM payroll p
JOIN employees e
    ON p.employee_id = e.id
ORDER BY p.id DESC;*/

/*SELECT COUNT(*) AS total_payroll_records
FROM payroll;*/

/*SELECT
    id,
    employee_id,
    payroll_month,
    payroll_year,
    basic_salary,
    allowances,
    deductions,
    gross_salary,
    net_salary,
    payment_status,
    payment_date,
    created_at,
    updated_at
FROM payroll
ORDER BY
    payroll_year DESC,
    payroll_month DESC,
    id DESC;*/


/*SELECT
    p.id,
    p.employee_id,
    e.employee_code,
    e.first_name,
    p.payroll_month,
    p.payroll_year,
    p.basic_salary,
    p.allowances,
    p.deductions,
    p.gross_salary,
    p.net_salary,
    p.payment_status,
    p.payment_date
FROM payroll p
JOIN employees e
    ON p.employee_id = e.id
ORDER BY p.id DESC;*/


/*SELECT
    id,
    payroll_month,
    payroll_year,
    basic_salary,
    allowances,
    deductions,
    gross_salary,
    net_salary,
    payment_status
FROM payroll
WHERE id = 1;*/


/*SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payslips'
ORDER BY ordinal_position;*/

/*SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name ILIKE '%payslip%';*/

/*SELECT *
FROM payslips
LIMIT 5;*/

/*SELECT
    p.id,
    p.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    p.payroll_month,
    p.payroll_year,
    p.basic_salary,
    p.allowances,
    p.deductions,
    p.gross_salary,
    p.net_salary,
    p.payment_status
FROM payroll p
JOIN employees e
    ON p.employee_id = e.id
ORDER BY p.id DESC;*/

/*SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'payslips';*/

/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'payslips'
ORDER BY ordinal_position;*/


/*SELECT
    p.id,
    p.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    p.payroll_month,
    p.payroll_year,
    p.basic_salary,
    p.allowances,
    p.deductions,
    p.gross_salary,
    p.net_salary,
    p.payment_status
FROM payroll p
JOIN employees e
    ON p.employee_id = e.id
ORDER BY p.id DESC;*/

/*SELECT *
FROM payslips
WHERE payroll_id = 1;*/

/*SELECT
    id,
    employee_code,
    first_name,
    last_name
FROM employees
ORDER BY id;*/


/*SELECT
    id,
    employee_id,
    payroll_month,
    payroll_year,
    basic_salary,
    allowances,
    deductions,
    gross_salary,
    net_salary,
    payment_status
FROM payroll
ORDER BY id DESC;*/


/*INSERT INTO payroll
(
    employee_id,
    payroll_month,
    payroll_year,
    basic_salary,
    allowances,
    deductions,
    gross_salary,
    net_salary,
    payment_status
)
VALUES
(
    1,
    8,
    2026,
    40000,
    5000,
    2000,
    45000,
    43000,
    'PROCESSED'
)
RETURNING *;*/

/*INSERT INTO payslips
(
    employee_id,
    payroll_id,
    payslip_number,
    generated_at
)
VALUES
(
    1,
    4,
    'PS-2026-08-7',
    CURRENT_TIMESTAMP
)
RETURNING *;*/

/*SELECT
    ps.id,
    ps.employee_id,
    ps.payroll_id,
    ps.payslip_number,
    ps.generated_at
FROM payslips ps
ORDER BY ps.id DESC;*/


/*SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
    table_name ILIKE '%recruit%'
    OR table_name ILIKE '%job%'
);*/


/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'recruitment'
ORDER BY ordinal_position;*/

/*CREATE TABLE IF NOT EXISTS recruitment (
    id SERIAL PRIMARY KEY,

    candidate_code VARCHAR(50) UNIQUE NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100),

    email VARCHAR(150) NOT NULL,

    phone VARCHAR(20),

    position VARCHAR(150) NOT NULL,

    department_id INTEGER,

    application_date DATE NOT NULL DEFAULT CURRENT_DATE,

    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',

    source VARCHAR(100),

    resume_url TEXT,

    notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT recruitment_department_fk
        FOREIGN KEY (department_id)
        REFERENCES departments(id)
        ON DELETE SET NULL,

    CONSTRAINT recruitment_status_check
        CHECK (
            status IN (
                'APPLIED',
                'SCREENING',
                'INTERVIEW',
                'SELECTED',
                'REJECTED'
            )
        )
);*/


/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'recruitment'
ORDER BY ordinal_position;*/


/*SELECT *
FROM recruitment
ORDER BY id DESC;*/

/*SELECT
    id,
    name
FROM departments
ORDER BY id;*/


/*INSERT INTO recruitment
(
    id,
    candidate_name,
    email,
    phone,
    position,
    department_id,
    experience_years,
    application_date,
    status,
    interview_date,
    notes
)
VALUES
(
    1,
    'Arjun Joshi',
    'arjun.joshi@example.com',
    '9876543210',
    'Software Developer',
    1,
    2,
    CURRENT_DATE,
    'APPLIED',
    NULL,
    'Initial application'
)
RETURNING *;*/



/*INSERT INTO recruitment
(
    id,
    candidate_name,
    email,
    phone,
    position,
    department_id,
    experience_years,
    application_date,
    status,
    interview_date,
    notes
)
VALUES
(
    2,
    'Arjun Joshi',
    'arjun.joshi@example.com',
    '9876543210',
    'Software Developer',
    1,
    2,
    CURRENT_DATE,
    'APPLIED',
    NULL,
    'Initial application'
)
RETURNING *;*/

/*SELECT
    r.id,
    r.candidate_name,
    r.email,
    r.phone,
    r.position,
    r.department_id,
    r.experience_years,
    r.application_date,
    r.status,
    r.interview_date,
    r.notes
FROM recruitment r
ORDER BY r.id DESC;*/


/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'departments'
ORDER BY ordinal_position;*/


/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'documents'
ORDER BY ordinal_position;*/


/*SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;*/


/*SELECT
    id,
    employee_code,
    first_name,
    last_name
FROM employees
ORDER BY id;*/

/*SELECT
    id,
    name,
    role
FROM users
ORDER BY id;*/


/*INSERT INTO documents
(
    employee_id,
    document_name,
    document_type,
    file_name,
    file_path,
    file_size,
    mime_type,
    uploaded_by
)
VALUES
(
    2,
    'Aadhaar Card',
    'IDENTITY',
    'aadhaar_card.pdf',
    'uploads/documents/aadhaar_card.pdf',
    245760,
    'application/pdf',
    NULL
)
RETURNING *;*/

/*SELECT
    d.id,
    d.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    d.document_name,
    d.document_type,
    d.file_name,
    d.file_path,
    d.file_size,
    d.mime_type,
    d.uploaded_by,
    d.created_at
FROM documents d
JOIN employees e
    ON d.employee_id = e.id
ORDER BY d.id DESC;*/

/*SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
      table_name ILIKE '%onboard%'
      OR table_name ILIKE '%joining%'
  )
ORDER BY table_name;*/

/*SELECT
    table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND (
      table_name ILIKE '%onboard%'
      OR table_name ILIKE '%joining%'
  )
ORDER BY table_name;*/

/*SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'onboarding'
ORDER BY ordinal_position;*/


/*SELECT
    id,
    candidate_name,
    email,
    position,
    department_id,
    status
FROM recruitment
ORDER BY id DESC;*/

/*SELECT
    id,
    employee_code,
    first_name,
    last_name,
    department_id
FROM employees
ORDER BY id DESC;*/

/*SELECT
    id,
    name
FROM departments
ORDER BY id;*/


/*INSERT INTO onboarding
(
    candidate_id,
    employee_id,
    joining_date,
    department_id,
    designation,
    onboarding_status,
    documents_completed,
    orientation_completed
)
VALUES
(
    1,
    1,
    CURRENT_DATE,
    1,
    'Software Developer',
    'IN_PROGRESS',
    false,
    false
)
RETURNING *;*/

/*SELECT
    o.id,
    o.candidate_id,
    r.candidate_name,
    o.employee_id,
    e.employee_code,
    e.first_name,
    e.last_name,
    o.joining_date,
    o.department_id,
    d.name,
    o.designation,
    o.onboarding_status,
    o.documents_completed,
    o.orientation_completed,
    o.created_at,
    o.updated_at
FROM onboarding o

LEFT JOIN recruitment r
    ON o.candidate_id = r.id

LEFT JOIN employees e
    ON o.employee_id = e.id

LEFT JOIN departments d
    ON o.department_id = d.id

ORDER BY o.id DESC;*/



/*SELECT
    'employees' AS table_name,
    COUNT(*) AS record_count
FROM employees

UNION ALL

SELECT
    'departments',
    COUNT(*)
FROM departments

UNION ALL

SELECT
    'attendance',
    COUNT(*)
FROM attendance

UNION ALL

SELECT
    'payroll',
    COUNT(*)
FROM payroll

UNION ALL

SELECT
    'payslips',
    COUNT(*)
FROM payslips

UNION ALL

SELECT
    'recruitment',
    COUNT(*)
FROM recruitment

UNION ALL

SELECT
    'documents',
    COUNT(*)
FROM documents

UNION ALL

SELECT
    'onboarding',
    COUNT(*)
FROM onboarding;*/

/*SELECT
    id,
    candidate_id,
    employee_id,
    joining_date,
    department_id,
    designation,
    onboarding_status,
    documents_completed,
    orientation_completed,
    created_at,
    updated_at
FROM onboarding
ORDER BY id DESC;*/

