// ==========================================
// PAYROLL MODEL
// B13
// ==========================================
const { pool } =
  require("../config/database");

// ------------------------------------------
// GET ALL PAYROLL
// ------------------------------------------

// ------------------------------------------
// GET ALL PAYROLL
// ------------------------------------------

const getAllPayroll = async () => {
  const result = await pool.query(`
    SELECT
      p.id,
      p.employee_id,
      e.employee_code,
      e.first_name,
      e.last_name,
      e.email,
      e.designation,
      d.name AS department_name,
      p.payroll_month,
      p.payroll_year,
      p.basic_salary,
      p.allowances,
      p.deductions,
      p.gross_salary,
      p.net_salary,
      COALESCE(p.bank_name, e.bank_name, 'HDFC Bank') AS bank_name,
      COALESCE(p.bank_account, e.bank_account, '50100482910482') AS bank_account,
      COALESCE(p.ifsc_code, e.ifsc_code, 'HDFC0001234') AS ifsc_code,
      COALESCE(p.transaction_ref, 'TXN-' || p.id || '-2026') AS transaction_ref,
      p.payment_status,
      p.payment_date,
      p.created_at,
      p.updated_at
    FROM payroll p
    LEFT JOIN employees e ON p.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY
      p.payroll_year DESC,
      p.payroll_month DESC,
      p.id DESC
  `);

  return result.rows;
};

// ------------------------------------------
// GET PAYROLL BY ID
// ------------------------------------------

const getPayrollById = async (id) => {
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.employee_id,
      e.employee_code,
      e.first_name,
      e.last_name,
      e.email,
      e.designation,
      d.name AS department_name,
      p.payroll_month,
      p.payroll_year,
      p.basic_salary,
      p.allowances,
      p.deductions,
      p.gross_salary,
      p.net_salary,
      COALESCE(p.bank_name, e.bank_name, 'HDFC Bank') AS bank_name,
      COALESCE(p.bank_account, e.bank_account, '50100482910482') AS bank_account,
      COALESCE(p.ifsc_code, e.ifsc_code, 'HDFC0001234') AS ifsc_code,
      COALESCE(p.transaction_ref, 'TXN-' || p.id || '-2026') AS transaction_ref,
      p.payment_status,
      p.payment_date,
      p.created_at,
      p.updated_at
    FROM payroll p
    LEFT JOIN employees e ON p.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE p.id = $1
    `,
    [id]
  );

  return result.rows[0];
};


// ------------------------------------------
// CREATE PAYROLL
// ------------------------------------------

const createPayroll = async (data) => {
  const {
    employeeId,
    payrollMonth,
    payrollYear,
    basicSalary,
    allowances,
    deductions,
    grossSalary,
    netSalary,
    paymentStatus,
    bankName,
    bankAccount,
    ifscCode,
    paymentDate,
    transactionRef,
  } = data;

  const result = await pool.query(
    `
    INSERT INTO payroll
    (
      employee_id,
      payroll_month,
      payroll_year,
      basic_salary,
      allowances,
      deductions,
      gross_salary,
      net_salary,
      payment_status,
      bank_name,
      bank_account,
      ifsc_code,
      payment_date,
      transaction_ref
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10,
      $11,
      $12,
      $13,
      $14
    )
    RETURNING *
    `,
    [
      employeeId,
      payrollMonth,
      payrollYear,
      basicSalary,
      allowances || 0,
      deductions || 0,
      grossSalary,
      netSalary,
      paymentStatus || "PENDING",
      bankName || null,
      bankAccount || null,
      ifscCode || null,
      paymentDate || null,
      transactionRef || null,
    ]
  );

  return result.rows[0];
};



// ------------------------------------------
// UPDATE PAYROLL
// ------------------------------------------

const updatePayroll = async (
  id,
  data
) => {

  const {
    basicSalary,
    allowances,
    deductions,
    grossSalary,
    netSalary,
    paymentStatus,
    bankName,
    bankAccount,
    ifscCode,
    paymentDate,
  } = data;

  await pool.query(
    `
    UPDATE payroll
    SET
      basic_salary = COALESCE($1, basic_salary),
      allowances = COALESCE($2, allowances),
      deductions = COALESCE($3, deductions),
      gross_salary = COALESCE($4, gross_salary),
      net_salary = COALESCE($5, net_salary),
      payment_status = COALESCE($6, payment_status),
      bank_name = COALESCE($7, bank_name),
      bank_account = COALESCE($8, bank_account),
      ifsc_code = COALESCE($9, ifsc_code),
      payment_date = COALESCE($10, payment_date),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    `,
    [
      basicSalary,
      allowances,
      deductions,
      grossSalary,
      netSalary,
      paymentStatus,
      bankName || null,
      bankAccount || null,
      ifscCode || null,
      paymentDate || null,
      id,
    ]
  );

  return await getPayrollById(id);
};


// ------------------------------------------
// DELETE PAYROLL
// ------------------------------------------

const deletePayroll = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM payroll
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );


  return result.rows[0];

};


module.exports = {
  getAllPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
};