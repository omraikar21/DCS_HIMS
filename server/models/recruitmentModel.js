// ==========================================
// RECRUITMENT MODEL
// B16
// ==========================================

const { pool } = require("../config/database");


// ------------------------------------------
// GET ALL RECRUITMENT
// ------------------------------------------

const getAllRecruitment = async () => {

  const result = await pool.query(`
    SELECT
      r.id,
      r.candidate_name,
      r.email,
      r.phone,
      r.position,
      r.department_id,
      d.name,
      r.experience_years,
      r.application_date,
      r.status,
      r.interview_date,
      r.notes,
      r.created_at,
      r.updated_at

    FROM recruitment r

    LEFT JOIN departments d
      ON r.department_id = d.id

    ORDER BY r.id DESC
  `);

  return result.rows;
};


// ------------------------------------------
// GET RECRUITMENT BY ID
// ------------------------------------------

const getRecruitmentById = async (id) => {

  const result = await pool.query(
    `
    SELECT
      r.id,
      r.candidate_name,
      r.email,
      r.phone,
      r.position,
      r.department_id,
      d.name,
      r.experience_years,
      r.application_date,
      r.status,
      r.interview_date,
      r.notes,
      r.created_at,
      r.updated_at

    FROM recruitment r

    LEFT JOIN departments d
      ON r.department_id = d.id

    WHERE r.id = $1
    `,
    [id]
  );

  return result.rows[0];
};


// ------------------------------------------
// CREATE RECRUITMENT
// ------------------------------------------

const createRecruitment = async (data) => {

  const {
    candidateName,
    email,
    phone,
    position,
    departmentId,
    experienceYears,
    applicationDate,
    status,
    interviewDate,
    notes,
  } = data;


  const result = await pool.query(
    `
    INSERT INTO recruitment
    (
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
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    )

    RETURNING *
    `,
    [
      candidateName,
      email,
      phone,
      position,
      departmentId,
      experienceYears,
      applicationDate,
      status,
      interviewDate,
      notes,
    ]
  );

  return result.rows[0];
};


// ------------------------------------------
// UPDATE RECRUITMENT
// ------------------------------------------

const updateRecruitment = async (
  id,
  data
) => {

  const {
    candidateName,
    email,
    phone,
    position,
    departmentId,
    experienceYears,
    status,
    interviewDate,
    notes,
  } = data;


  const result = await pool.query(
    `
    UPDATE recruitment

    SET
      candidate_name = $1,
      email = $2,
      phone = $3,
      position = $4,
      department_id = $5,
      experience_years = $6,
      status = $7,
      interview_date = $8,
      notes = $9,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = $10

    RETURNING *
    `,
    [
      candidateName,
      email,
      phone,
      position,
      departmentId,
      experienceYears,
      status,
      interviewDate,
      notes,
      id,
    ]
  );

  return result.rows[0];
};


// ------------------------------------------
// DELETE RECRUITMENT
// ------------------------------------------

const deleteRecruitment = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM recruitment
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};


module.exports = {
  getAllRecruitment,
  getRecruitmentById,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
};