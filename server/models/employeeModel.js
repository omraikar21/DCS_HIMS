// ==========================================
// EMPLOYEE MODEL
// ==========================================

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET ALL EMPLOYEES
// ------------------------------------------

const getAllEmployees =
  async () => {

    const result =
      await pool.query(`
        SELECT
          e.*,
          d.name AS department_name
        FROM employees e
        LEFT JOIN departments d
          ON e.department_id = d.id
        ORDER BY e.id ASC
      `);

    return result.rows;
  };


// ------------------------------------------
// GET EMPLOYEE BY ID
// ------------------------------------------

const getEmployeeById =
  async (id) => {

    const result =
      await pool.query(
        `
        SELECT
          e.*,
          d.name AS department_name
        FROM employees e
        LEFT JOIN departments d
          ON e.department_id = d.id
        WHERE e.id = $1
        `,
        [id]
      );

    return result.rows[0];
  };


// ------------------------------------------
// GET EMPLOYEE BY USER ID
// ------------------------------------------

const getEmployeeByUserId =
  async (userId) => {

    const result =
      await pool.query(
        `
        SELECT
          e.*,
          d.name AS department_name
        FROM employees e
        LEFT JOIN departments d
          ON e.department_id = d.id
        WHERE e.user_id = $1
        `,
        [userId]
      );

    return result.rows[0];
  };


// ------------------------------------------
// CREATE EMPLOYEE
// ------------------------------------------

const createEmployee =
  async ({
    userId = null,
    employeeCode,
    firstName,
    lastName = "",
    email,
    phone = "",
    departmentId = null,
    designation,
    joiningDate = null,
    salary = 0,
    employmentStatus = "ACTIVE",
    address = "",
  }) => {

    if (!employeeCode) {
      // Find the highest existing DCS-EMP-XXX number or max(id)
      const codeResult = await pool.query(`
        SELECT COALESCE(
          MAX(
            CASE 
              WHEN employee_code ~ '^DCS-EMP-[0-9]+$' 
              THEN CAST(SUBSTRING(employee_code FROM 9) AS INTEGER)
              ELSE id 
            END
          ), 
          0
        ) + 1 AS next_number
        FROM employees
      `);

      let nextNumber = parseInt(codeResult.rows[0]?.next_number, 10) || 1;
      let candidateCode = `DCS-EMP-${String(nextNumber).padStart(3, "0")}`;

      // Check if candidate code exists, increment until free
      while (true) {
        const check = await pool.query(
          "SELECT id FROM employees WHERE employee_code = $1 LIMIT 1",
          [candidateCode]
        );
        if (check.rows.length === 0) {
          break;
        }
        nextNumber++;
        candidateCode = `DCS-EMP-${String(nextNumber).padStart(3, "0")}`;
      }

      employeeCode = candidateCode;
    }

    const cleanJoiningDate = joiningDate && String(joiningDate).trim() !== "" 
      ? String(joiningDate).slice(0, 10) 
      : null;

    const cleanSalary = salary ? Number(salary) || 0 : 0;

    const result =
      await pool.query(
        `
        INSERT INTO employees
        (
          user_id,
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
          $12
        )
        RETURNING *
        `,
        [
          userId,
          employeeCode,
          firstName.trim(),
          lastName ? lastName.trim() : "",
          email.trim(),
          phone ? phone.trim() : "",
          departmentId || null,
          designation.trim(),
          cleanJoiningDate,
          cleanSalary,
          employmentStatus || "ACTIVE",
          address ? address.trim() : "",
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// UPDATE EMPLOYEE
// ------------------------------------------

const updateEmployee =
  async (
    id,
    {
      firstName,
      lastName,
      phone,
      departmentId,
      designation,
      joiningDate,
      salary,
      employmentStatus,
      address,
    }
  ) => {

    const result =
      await pool.query(
        `
        UPDATE employees
        SET
          first_name = $1,
          last_name = $2,
          phone = $3,
          department_id = $4,
          designation = $5,
          joining_date = $6,
          salary = $7,
          employment_status = $8,
          address = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
        `,
        [
          firstName,
          lastName,
          phone,
          departmentId,
          designation,
          joiningDate,
          salary,
          employmentStatus,
          address,
          id,
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// DELETE EMPLOYEE
// ------------------------------------------

const deleteEmployee =
  async (id) => {

    const result =
      await pool.query(
        `
        DELETE FROM employees
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

    return result.rows[0];
  };


module.exports = {
  getAllEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};