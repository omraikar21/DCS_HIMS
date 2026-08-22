// ==========================================
// PAYSLIP MODEL
// B14
// ==========================================

const { pool } = require("../config/database");


// ------------------------------------------
// GET ALL PAYSLIPS
// ------------------------------------------

const getAllPayslips = async () => {

  const result = await pool.query(`
    SELECT
      ps.id,
      ps.payroll_id,
      ps.payslip_number,
      ps.generated_at,

      p.employee_id,
      e.employee_code,
      e.first_name,
      e.last_name,
      e.email,
      e.designation,

      p.payroll_month,
      p.payroll_year,
      p.basic_salary,
      p.allowances,
      p.deductions,
      p.gross_salary,
      p.net_salary,
      p.payment_status,
      p.payment_date,
      COALESCE(p.bank_name, e.bank_name, 'HDFC Bank') AS bank_name,
      COALESCE(p.bank_account, e.bank_account, '50100482910482') AS bank_account,
      COALESCE(p.ifsc_code, e.ifsc_code, 'HDFC0001234') AS ifsc_code,
      COALESCE(p.transaction_ref, 'TXN-' || p.id || '-2026') AS transaction_ref

    FROM payslips ps

    JOIN payroll p
      ON ps.payroll_id = p.id

    JOIN employees e
      ON p.employee_id = e.id

    ORDER BY p.payroll_year DESC, p.payroll_month DESC, ps.id DESC

  `);

  return result.rows;
};


// ------------------------------------------
// GET PAYSLIP BY ID
// ------------------------------------------

const getPayslipById = async (id) => {

  const result = await pool.query(
    `
    SELECT
      ps.id,
      ps.payroll_id,
      ps.payslip_number,
      ps.generated_at,

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

    FROM payslips ps

    JOIN payroll p
      ON ps.payroll_id = p.id

    JOIN employees e
      ON p.employee_id = e.id

    WHERE ps.id = $1
    `,
    [id]
  );

  return result.rows[0];
};


// ------------------------------------------
// GET PAYROLL FOR PAYSLIP
// ------------------------------------------

const getPayrollForPayslip = async (payrollId) => {

  const result = await pool.query(
    `
    SELECT
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

    WHERE p.id = $1
    `,
    [payrollId]
  );

  return result.rows[0];
};


// ------------------------------------------
// CREATE PAYSLIP
// ------------------------------------------

const createPayslip = async (data) => {

  const {
    payrollId,
    payslipNumber,
    generatedAt,
  } = data;


  const result = await pool.query(
    `
    INSERT INTO payslips
    (
      payroll_id,
      payslip_number,
      generated_at
    )

    VALUES
    (
      $1,
      $2,
      $3
    )

    RETURNING *
    `,
    [
      payrollId,
      payslipNumber,
      generatedAt,
    ]
  );


  return result.rows[0];
};


// ------------------------------------------
// UPDATE PAYSLIP
// ------------------------------------------
// No status column is assumed yet.
// We will implement status only after
// confirming the real payslips schema.
// ------------------------------------------

const updatePayslip = async (id) => {

  const result = await pool.query(
    `
    SELECT *
    FROM payslips
    WHERE id = $1
    `,
    [id]
  );


  return result.rows[0];
};


// ------------------------------------------
// DELETE PAYSLIP
// ------------------------------------------

const deletePayslip = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM payslips
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );


  return result.rows[0];
};


// ------------------------------------------
// CHECK EXISTING PAYSLIP
// ------------------------------------------

const getPayslipByPayrollId = async (payrollId) => {

  const result = await pool.query(
    `
    SELECT *
    FROM payslips
    WHERE payroll_id = $1
    `,
    [payrollId]
  );


  return result.rows[0];
};


module.exports = {
  getAllPayslips,
  getPayslipById,
  getPayrollForPayslip,
  createPayslip,
  updatePayslip,
  deletePayslip,
  getPayslipByPayrollId,
};