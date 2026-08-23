// ==========================================
// ATTENDANCE MODEL
// B11
// ==========================================

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET ALL ATTENDANCE
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


// ------------------------------------------
// FACE DETECTION / BIOMETRIC PUNCH RECORD
// ------------------------------------------

const recordFacePunch = async ({
  employeeCode,
  employeeId,
  email,
  punchTime,
  deviceId = "FACE_DETECTION_SYS",
  confidence = 1.0,
  punchType = "AUTO",
  remarks = "Face Recognition Biometric Punch",
}) => {
  // 1. Locate employee
  let employee = null;
  if (employeeCode) {
    const res = await pool.query(
      "SELECT * FROM employees WHERE LOWER(TRIM(employee_code)) = LOWER(TRIM($1)) LIMIT 1",
      [employeeCode]
    );
    employee = res.rows[0];
  } else if (employeeId) {
    const res = await pool.query(
      "SELECT * FROM employees WHERE id = $1 LIMIT 1",
      [employeeId]
    );
    employee = res.rows[0];
  } else if (email) {
    const res = await pool.query(
      "SELECT * FROM employees WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1",
      [email]
    );
    employee = res.rows[0];
  }

  if (!employee) {
    throw new Error(
      `Employee not found for reference: ${employeeCode || employeeId || email}`
    );
  }

  const parsedPunchDate = punchTime ? new Date(punchTime) : new Date();
  const dateStr = parsedPunchDate.toISOString().slice(0, 10);
  const timeStr = parsedPunchDate.toTimeString().slice(0, 8);

  const deviceNote = `[Face AI: ${deviceId}${confidence ? ` (${(Number(confidence) * 100).toFixed(1)}%)` : ""}]`;
  const fullRemarks = `${remarks ? `${remarks} ` : ""}${deviceNote}`.trim();

  // 2. Check if attendance already exists for today
  const existingRes = await pool.query(
    "SELECT * FROM attendance WHERE employee_id = $1 AND attendance_date = $2 LIMIT 1",
    [employee.id, dateStr]
  );

  if (existingRes.rows.length === 0) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const isLate = hours > 9 || (hours === 9 && minutes > 30);
    const status = isLate ? "LATE" : "PRESENT";

    const insertRes = await pool.query(
      `INSERT INTO attendance (employee_id, attendance_date, check_in, status, remarks)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [employee.id, dateStr, timeStr, status, fullRemarks]
    );

    return {
      action: "CHECK_IN_RECORDED",
      attendance: insertRes.rows[0],
      employee: {
        id: employee.id,
        code: employee.employee_code,
        name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
        email: employee.email,
        designation: employee.designation,
      },
    };
  } else {
    const current = existingRes.rows[0];
    let newCheckIn = current.check_in;
    let newCheckOut = current.check_out;

    if (punchType === "CHECK_IN") {
      newCheckIn = timeStr;
    } else {
      newCheckOut = timeStr;
    }

    let updatedStatus = current.status;
    if (newCheckIn && newCheckOut) {
      const [hIn, mIn] = String(newCheckIn).split(":").map(Number);
      const [hOut, mOut] = String(newCheckOut).split(":").map(Number);
      const workedHours = (hOut + mOut / 60) - (hIn + mIn / 60);

      if (workedHours >= 8) {
        updatedStatus = "PRESENT";
      } else if (workedHours >= 4) {
        updatedStatus = "HALF_DAY";
      }
    }

    const updatedRemarks = `${current.remarks ? `${current.remarks} | ` : ""}${fullRemarks}`.slice(0, 500);

    const updateRes = await pool.query(
      `UPDATE attendance
       SET check_in = $1, check_out = $2, status = $3, remarks = $4
       WHERE id = $5
       RETURNING *`,
      [newCheckIn, newCheckOut, updatedStatus, updatedRemarks, current.id]
    );

    return {
      action: punchType === "CHECK_IN" ? "CHECK_IN_UPDATED" : "CHECK_OUT_RECORDED",
      attendance: updateRes.rows[0],
      employee: {
        id: employee.id,
        code: employee.employee_code,
        name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
        email: employee.email,
        designation: employee.designation,
      },
    };
  }
};

module.exports = {
  getAllAttendance,
  getAttendanceById,
  getEmployeeAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  recordFacePunch,
};