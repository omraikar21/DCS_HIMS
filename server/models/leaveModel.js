// ==========================================
// LEAVE MODEL
// B12
// ==========================================

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET ALL LEAVES
// ------------------------------------------

const getAllLeaves =
  async () => {

    const result =
      await pool.query(`
        SELECT
          l.*,
          e.employee_code,
          e.first_name,
          e.last_name,
          e.email AS employee_email,
          COALESCE(d.name, 'General') AS department_name,
          COALESCE(l.applicant_role, u.role, 'EMPLOYEE') AS applicant_role,
          COALESCE(u.name, CONCAT(e.first_name, ' ', e.last_name)) AS applicant_name
        FROM leaves l
        LEFT JOIN employees e ON l.employee_id = e.id
        LEFT JOIN users u ON u.id = e.user_id OR LOWER(TRIM(e.email)) = LOWER(TRIM(u.email))
        LEFT JOIN departments d ON d.id = COALESCE(l.department_id, e.department_id)
        ORDER BY l.created_at DESC
      `);

    return result.rows;
  };


// ------------------------------------------
// GET LEAVE BY ID
// ------------------------------------------

const getLeaveById =
  async (id) => {

    const result =
      await pool.query(
        `
        SELECT
          l.*,
          e.employee_code,
          e.first_name,
          e.last_name,
          e.email AS employee_email,
          COALESCE(d.name, 'General') AS department_name,
          COALESCE(l.applicant_role, u.role, 'EMPLOYEE') AS applicant_role,
          COALESCE(u.name, CONCAT(e.first_name, ' ', e.last_name)) AS applicant_name
        FROM leaves l
        LEFT JOIN employees e ON l.employee_id = e.id
        LEFT JOIN users u ON u.id = e.user_id OR LOWER(TRIM(e.email)) = LOWER(TRIM(u.email))
        LEFT JOIN departments d ON d.id = COALESCE(l.department_id, e.department_id)
        WHERE l.id = $1
        `,
        [id]
      );

    return result.rows[0];
  };


// ------------------------------------------
// CREATE LEAVE
// ------------------------------------------

const createLeave =
  async ({
    employeeId,
    leaveType,
    startDate,
    endDate,
    reason,
    departmentId,
    applicantRole,
  }) => {

    const result =
      await pool.query(
        `
        INSERT INTO leaves
        (
          employee_id,
          leave_type,
          start_date,
          end_date,
          reason,
          department_id,
          applicant_role,
          status,
          created_at,
          updated_at
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
          'PENDING',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        RETURNING *
        `,
        [
          employeeId,
          leaveType,
          startDate,
          endDate,
          reason,
          departmentId || null,
          applicantRole || "EMPLOYEE",
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// UPDATE LEAVE
// Only pending requests should be updated
// ------------------------------------------

const updateLeave =
  async (
    id,
    {
      leaveType,
      startDate,
      endDate,
      reason,
    }
  ) => {

    const result =
      await pool.query(
        `
        UPDATE leaves

        SET
          leave_type = $1,
          start_date = $2,
          end_date = $3,
          reason = $4,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $5

        RETURNING *
        `,
        [
          leaveType,
          startDate,
          endDate,
          reason,
          id,
        ]
      );


    return result.rows[0];

  };


// ------------------------------------------
// DELETE LEAVE
// ------------------------------------------

const deleteLeave =
  async (id) => {

    const result =
      await pool.query(
        `
        DELETE FROM leaves

        WHERE id = $1

        RETURNING *
        `,
        [id]
      );


    return result.rows[0];

  };


// ------------------------------------------
// APPROVE LEAVE
// ------------------------------------------

const approveLeave =
  async (
    id,
    approvedBy
  ) => {

    const result =
      await pool.query(
        `
        UPDATE leaves

        SET
          status = 'APPROVED',

          approved_by = $1,

          approved_at =
            CURRENT_TIMESTAMP,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING *
        `,
        [
          approvedBy,
          id,
        ]
      );


    return result.rows[0];

  };


// ------------------------------------------
// REJECT LEAVE
// ------------------------------------------

const rejectLeave =
  async (
    id,
    rejectionReason
  ) => {

    const result =
      await pool.query(
        `
        UPDATE leaves

        SET
          status = 'REJECTED',

          rejection_reason = $1,

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $2

        RETURNING *
        `,
        [
          rejectionReason,
          id,
        ]
      );


    return result.rows[0];

  };


// ------------------------------------------
// HOLD / PENDING LEAVE
// ------------------------------------------

const holdLeave =
  async (
    id
  ) => {

    const result =
      await pool.query(
        `
        UPDATE leaves

        SET
          status = 'PENDING',

          updated_at =
            CURRENT_TIMESTAMP

        WHERE id = $1

        RETURNING *
        `,
        [
          id,
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// EXPORT
// ------------------------------------------

module.exports = {

  getAllLeaves,

  getLeaveById,

  createLeave,

  updateLeave,

  deleteLeave,

  approveLeave,

  rejectLeave,

  holdLeave,

};