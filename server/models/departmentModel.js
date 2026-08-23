// ==========================================
// DEPARTMENT MODEL
// ==========================================

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET ALL DEPARTMENTS
// ------------------------------------------

const getAllDepartments =
  async () => {

    const result =
      await pool.query(`
        SELECT 
          d.*,
          COALESCE(COUNT(e.id), 0)::INTEGER AS employee_count
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id
        GROUP BY d.id
        ORDER BY d.id ASC
      `);

    return result.rows;
  };


// ------------------------------------------
// GET DEPARTMENT BY ID (WITH EMPLOYEES)
// ------------------------------------------

const getDepartmentById =
  async (id) => {

    const result =
      await pool.query(
        `
        SELECT 
          d.*,
          COALESCE(COUNT(e.id), 0)::INTEGER AS employee_count
        FROM departments d
        LEFT JOIN employees e ON e.department_id = d.id
        WHERE d.id = $1
        GROUP BY d.id
        `,
        [id]
      );

    if (!result.rows[0]) {
      return null;
    }

    const empResult = await pool.query(
      `
      SELECT 
        e.id,
        e.employee_code,
        e.first_name,
        e.last_name,
        e.email,
        e.phone,
        e.designation,
        e.employment_status,
        e.joining_date,
        e.salary,
        e.address,
        e.avatar,
        u.role AS user_role
      FROM employees e
      LEFT JOIN users u ON u.id = e.user_id
      WHERE e.department_id = $1
      ORDER BY e.id ASC
      `,
      [id]
    );

    return {
      ...result.rows[0],
      employees_list: empResult.rows,
    };
  };


// ------------------------------------------
// CREATE DEPARTMENT
// ------------------------------------------

const createDepartment =
  async ({
    name,
    description,
  }) => {

    const result =
      await pool.query(
        `
        INSERT INTO departments
        (
          name,
          description
        )
        VALUES
        ($1, $2)
        RETURNING *
        `,
        [
          name,
          description,
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// UPDATE DEPARTMENT
// ------------------------------------------

const updateDepartment =
  async (
    id,
    {
      name,
      description,
      isActive,
    }
  ) => {

    const result =
      await pool.query(
        `
        UPDATE departments
        SET
          name = $1,
          description = $2,
          is_active = $3,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,
        [
          name,
          description,
          isActive,
          id,
        ]
      );

    return result.rows[0];
  };



// ------------------------------------------
// DELETE DEPARTMENT
// ------------------------------------------

const deleteDepartment =
  async (id) => {

    const result =
      await pool.query(
        `
        DELETE FROM departments
        WHERE id = $1
        RETURNING *
        `,
        [id]
      );

    return result.rows[0];
  };


// ------------------------------------------
// GET DEPARTMENT BY NAME
// ------------------------------------------

const getDepartmentByName =
  async (name) => {
    if (!name) {
      return null;
    }

    const trimmed = name.trim();

    // 1. Exact match
    const exact =
      await pool.query(
        `
        SELECT *
        FROM departments
        WHERE LOWER(TRIM(name)) = LOWER($1)
        LIMIT 1
        `,
        [trimmed]
      );

    if (exact.rows.length > 0) {
      return exact.rows[0];
    }

    // 2. Partial match
    const partial =
      await pool.query(
        `
        SELECT *
        FROM departments
        WHERE LOWER(name) LIKE '%' || LOWER($1) || '%'
        LIMIT 1
        `,
        [trimmed]
      );

    if (partial.rows.length > 0) {
      return partial.rows[0];
    }

    // 3. Fallback to first active department
    const fallback =
      await pool.query(
        `
        SELECT *
        FROM departments
        WHERE is_active = TRUE
        ORDER BY id ASC
        LIMIT 1
        `
      );

    return fallback.rows[0] || null;
  };



const getOrCreateDepartment = async (name) => {
  if (!name || name === "Unassigned") return null;
  const trimmed = name.trim();

  // 1. Exact match
  const exact = await pool.query(
    "SELECT * FROM departments WHERE LOWER(TRIM(name)) = LOWER($1) LIMIT 1",
    [trimmed]
  );
  if (exact.rows.length > 0) return exact.rows[0];

  // 2. Partial match
  const partial = await pool.query(
    "SELECT * FROM departments WHERE LOWER(name) LIKE '%' || LOWER($1) || '%' LIMIT 1",
    [trimmed]
  );
  if (partial.rows.length > 0) return partial.rows[0];

  // 3. Create new department
  const inserted = await pool.query(
    `INSERT INTO departments (name, description, is_active)
     VALUES ($1, $2, TRUE)
     ON CONFLICT (name) DO UPDATE SET is_active = TRUE
     RETURNING *`,
    [trimmed, `${trimmed} Department`]
  );
  return inserted.rows[0];
};

module.exports = {
  getAllDepartments,
  getDepartmentById,
  getDepartmentByName,
  getOrCreateDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};