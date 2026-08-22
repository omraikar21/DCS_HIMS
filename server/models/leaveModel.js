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
          e.last_name

        FROM leaves l

        JOIN employees e
          ON l.employee_id = e.id

        ORDER BY
          l.created_at DESC
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
          e.last_name

        FROM leaves l

        JOIN employees e
          ON l.employee_id = e.id

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