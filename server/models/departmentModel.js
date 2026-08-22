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
        SELECT *
        FROM departments
        ORDER BY id ASC
      `);

    return result.rows;
  };


// ------------------------------------------
// GET DEPARTMENT BY ID
// ------------------------------------------

const getDepartmentById =
  async (id) => {

    const result =
      await pool.query(
        `
        SELECT *
        FROM departments
        WHERE id = $1
        `,
        [id]
      );

    return result.rows[0];
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



module.exports = {
  getAllDepartments,
  getDepartmentById,
  getDepartmentByName,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};