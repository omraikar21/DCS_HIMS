// ==========================================
// ATTENDANCE MODEL
// B11
// ==========================================

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET ALL ATTENDANCE (ADMIN / HR)
// ------------------------------------------

const getAllAttendance =
  async () => {

    const result =
      await pool.query(`
        SELECT
          a.*,

          e.employee_code,
          e.first_name,
          e.last_name,
          e.email AS employee_email,
          e.user_id,

          d.name AS department_name

        FROM attendance a

        JOIN employees e
          ON a.employee_id = e.id

        LEFT JOIN departments d
          ON e.department_id = d.id

        ORDER BY
          a.attendance_date DESC,
          a.id DESC
      `);

    return result.rows;
  };

// ------------------------------------------
// GET ATTENDANCE FOR SPECIFIC USER / EMPLOYEE
// ------------------------------------------

const getUserAttendance = async (userId, email) => {
  const result = await pool.query(
    `
    SELECT
      a.*,

      e.employee_code,
      e.first_name,
      e.last_name,
      e.email AS employee_email,
      e.user_id,

      d.name AS department_name

    FROM attendance a

    JOIN employees e
      ON a.employee_id = e.id

    LEFT JOIN departments d
      ON e.department_id = d.id

    WHERE (e.user_id = $1 AND $1 IS NOT NULL)
       OR (LOWER(TRIM(e.email)) = LOWER(TRIM($2)) AND $2 IS NOT NULL)

    ORDER BY
      a.attendance_date DESC,
      a.id DESC
    `,
    [userId || null, email || null]
  );

  return result.rows;
};


// ------------------------------------------
// GET ATTENDANCE BY ID
// NEW B11
// ------------------------------------------

const getAttendanceById = async (id) => {

  const result = await pool.query(
    `
        SELECT
            a.id,
            a.employee_id,
            a.attendance_date,
            a.check_in,
            a.check_out,
            a.status,
            a.remarks,
            a.created_at,

            e.employee_code,
            e.first_name,
            e.last_name

        FROM attendance a

        JOIN employees e
            ON a.employee_id = e.id

        WHERE a.id = $1
        `,
    [id]
  );


  return result.rows[0] || null;
};

// ------------------------------------------
// GET EMPLOYEE ATTENDANCE
// EXISTING FUNCTION - KEEP
// ------------------------------------------

const getEmployeeAttendance =
  async (employeeId) => {

    const result =
      await pool.query(
        `
        SELECT

          a.*,

          e.employee_code,
          e.first_name,
          e.last_name,

          d.name AS department_name

        FROM attendance a

        JOIN employees e
          ON a.employee_id = e.id

        LEFT JOIN departments d
          ON e.department_id = d.id

        WHERE a.employee_id = $1

        ORDER BY
          a.attendance_date DESC,
          a.id DESC
        `,
        [employeeId]
      );

    return result.rows;
  };


// ------------------------------------------
// CREATE ATTENDANCE
// ------------------------------------------

const createAttendance = async (
  attendanceData
) => {

  const {
    employeeId,
    attendanceDate,
    checkIn,
    checkOut,
    status,
    remarks,
  } = attendanceData;


  const result = await pool.query(
    `
        INSERT INTO attendance
        (
            employee_id,
            attendance_date,
            check_in,
            check_out,
            status,
            remarks
        )
        VALUES
        ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
    [
      employeeId,
      attendanceDate,
      checkIn,
      checkOut,
      status,
      remarks,
    ]
  );


  return result.rows[0];
};

// ------------------------------------------
// UPDATE ATTENDANCE
// ------------------------------------------

const updateAttendance = async (
  id,
  attendanceData
) => {

  const {
    checkIn,
    checkOut,
    status,
    remarks,
  } = attendanceData;


  const result = await pool.query(
    `
        UPDATE attendance
        SET
            check_in = $1,
            check_out = $2,
            status = $3,
            remarks = $4
        WHERE id = $5
        RETURNING *
        `,
    [
      checkIn,
      checkOut,
      status,
      remarks,
      id,
    ]
  );


  return result.rows[0] || null;
};


// ------------------------------------------
// DELETE ATTENDANCE
// NEW B11
// ------------------------------------------

const deleteAttendance =
  async (id) => {

    const result =
      await pool.query(
        `
        DELETE FROM attendance

        WHERE id = $1

        RETURNING *
        `,
        [id]
      );

    return result.rows[0] || null;
  };

module.exports = {
  getAllAttendance,
  getUserAttendance,
  getAttendanceById,
  getEmployeeAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};