// ==========================================
// ONBOARDING MODEL
// B17
// Uses EXISTING onboarding table
// ==========================================

const { pool } = require("../config/database");


// ------------------------------------------
// GET ALL ONBOARDING
// ------------------------------------------

const getAllOnboarding = async () => {

  const result = await pool.query(`
    SELECT
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

    ORDER BY o.id DESC
  `);

  return result.rows;
};


// ------------------------------------------
// GET ONBOARDING BY ID
// ------------------------------------------

const getOnboardingById = async (id) => {

  const result = await pool.query(
    `
    SELECT
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

    WHERE o.id = $1
    `,
    [id]
  );

  return result.rows[0];
};


// ------------------------------------------
// GET BY EMPLOYEE
// ------------------------------------------

const getOnboardingByEmployee = async (
  employeeId
) => {

  const result = await pool.query(
    `
    SELECT
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

    WHERE o.employee_id = $1

    ORDER BY o.id DESC
    `,
    [employeeId]
  );

  return result.rows;
};


// ------------------------------------------
// CREATE ONBOARDING
// ------------------------------------------

const createOnboarding = async (data) => {

  const {
    candidateId,
    employeeId,
    joiningDate,
    departmentId,
    designation,
    onboardingStatus,
    documentsCompleted,
    orientationCompleted,
  } = data;


  const result = await pool.query(
    `
    INSERT INTO onboarding
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
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    )

    RETURNING *
    `,
    [
      candidateId,
      employeeId,
      joiningDate,
      departmentId,
      designation,
      onboardingStatus,
      documentsCompleted,
      orientationCompleted,
    ]
  );

  return result.rows[0];
};


// ------------------------------------------
// UPDATE ONBOARDING
// ------------------------------------------

const updateOnboarding = async (
  id,
  data
) => {

  const {
    candidateId,
    employeeId,
    joiningDate,
    departmentId,
    designation,
    onboardingStatus,
    documentsCompleted,
    orientationCompleted,
  } = data;


  const result = await pool.query(
    `
    UPDATE onboarding

    SET
      candidate_id = $1,
      employee_id = $2,
      joining_date = $3,
      department_id = $4,
      designation = $5,
      onboarding_status = $6,
      documents_completed = $7,
      orientation_completed = $8,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = $9

    RETURNING *
    `,
    [
      candidateId,
      employeeId,
      joiningDate,
      departmentId,
      designation,
      onboardingStatus,
      documentsCompleted,
      orientationCompleted,
      id,
    ]
  );

  return result.rows[0];
};


// ------------------------------------------
// DELETE ONBOARDING
// ------------------------------------------

const deleteOnboarding = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM onboarding

    WHERE id = $1

    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};


module.exports = {
  getAllOnboarding,
  getOnboardingById,
  getOnboardingByEmployee,
  createOnboarding,
  updateOnboarding,
  deleteOnboarding,
};