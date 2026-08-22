// ==========================================
// USER MODEL
// B3 - DATABASE ACCESS
// ==========================================

const bcrypt = require("bcryptjs");

const {
  pool,
} = require("../config/database");


// ------------------------------------------
// GET ALL USERS
// ------------------------------------------

const getAllUsers =
  async () => {

    const result =
      await pool.query(`
        SELECT
          id,
          name,
          email,
          role,
          avatar,
          is_active,
          is_super_admin,
          must_change_password,
          created_at,
          updated_at
        FROM users
        ORDER BY is_super_admin DESC, id ASC
      `);

    return result.rows;
  };


// ------------------------------------------
// GET USER BY ID
// ------------------------------------------

const getUserById =
  async (id) => {

    const result =
      await pool.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          avatar,
          is_active,
          is_super_admin,
          must_change_password,
          created_at,
          updated_at
        FROM users
        WHERE id = $1
        `,
        [id]
      );

    return result.rows[0];
  };

// ------------------------------------------
// GET MINI ADMIN COUNT (Admins excluding Super Admin)
// ------------------------------------------

const getMiniAdminCount = async () => {
  const result = await pool.query(`
    SELECT COUNT(*)::INTEGER AS count
    FROM users
    WHERE role = 'ADMIN' AND is_super_admin = FALSE
  `);
  return result.rows[0]?.count || 0;
};



// ------------------------------------------
// GET USER BY EMAIL (USERS + EMPLOYEES FALLBACK)
// ------------------------------------------

const getUserByEmail =
  async (email) => {

    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check in users table
    const result =
      await pool.query(
        `
        SELECT *
        FROM users
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
        `,
        [cleanEmail]
      );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // 2. Fallback: Check if employee exists in employees table
    const empResult = await pool.query(
      `
      SELECT *
      FROM employees
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
      `,
      [cleanEmail]
    );

    if (empResult.rows.length > 0) {
      const emp = empResult.rows[0];
      const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee";
      const defaultHash = await bcrypt.hash("Employee@123", 10);

      // Auto-provision user record for this employee
      const newUser = await createUser({
        name: fullName,
        email: cleanEmail,
        passwordHash: defaultHash,
        role: "EMPLOYEE",
        mustChangePassword: false,
      });

      return newUser;
    }

    return null;
  };


// ------------------------------------------
// SYNC ALL EMPLOYEES INTO USERS TABLE
// ------------------------------------------

const syncAllEmployeesToUsers = async () => {
  try {
    const emps = await pool.query("SELECT * FROM employees");
    const defaultHash = await bcrypt.hash("Employee@123", 10);

    for (const emp of emps.rows) {
      if (!emp.email) continue;
      const cleanEmail = emp.email.trim().toLowerCase();
      const existing = await pool.query(
        "SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))",
        [cleanEmail]
      );

      if (existing.rows.length === 0) {
        const fullName = `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || "Employee";
        await pool.query(
          `INSERT INTO users (name, email, password_hash, role, must_change_password)
           VALUES ($1, $2, $3, $4, $5)`,
          [fullName, cleanEmail, defaultHash, "EMPLOYEE", false]
        );
        console.log(`[SYNC] Created user account for employee: ${cleanEmail}`);
      }
    }
  } catch (err) {
    console.warn("Employee-to-user sync error:", err.message);
  }
};


// ------------------------------------------
// CREATE USER
// ------------------------------------------

const createUser =
  async ({
    name,
    email,
    passwordHash,
    role = "EMPLOYEE",
    isSuperAdmin = false,
    mustChangePassword = false,
  }) => {

    const result =
      await pool.query(
        `
        INSERT INTO users
        (
          name,
          email,
          password_hash,
          role,
          is_super_admin,
          must_change_password
        )
        VALUES
        ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          name,
          email,
          role,
          is_active,
          is_super_admin,
          must_change_password,
          created_at
        `,
        [
          name,
          email,
          passwordHash,
          role,
          isSuperAdmin,
          mustChangePassword,
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// UPDATE USER
// ------------------------------------------

const updateUser =
  async (
    id,
    {
      name,
      role,
      isActive,
    }
  ) => {

    const result =
      await pool.query(
        `
        UPDATE users
        SET
          name = COALESCE($1, name),
          role = COALESCE($2, role),
          is_active = COALESCE($3, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING
          id,
          name,
          email,
          role,
          is_active,
          is_super_admin,
          updated_at
        `,
        [
          name,
          role,
          isActive,
          id,
        ]
      );

    return result.rows[0];
  };

// ------------------------------------------
// DELETE USER
// ------------------------------------------

const deleteUser = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING id, name, email, role, is_super_admin;`,
    [id]
  );
  return result.rows[0];
};



// ------------------------------------------
// UPDATE USER PASSWORD
// ------------------------------------------

const updateUserPassword =
  async (
    email,
    passwordHash
  ) => {

    const result =
      await pool.query(
        `
        UPDATE users
        SET
          password_hash = $1,
          must_change_password = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($2))
        RETURNING
          id,
          name,
          email,
          role,
          is_active,
          must_change_password,
          updated_at
        `,
        [
          passwordHash,
          email,
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// COMPLETE FIRST LOGIN PASSWORD CHANGE
// ------------------------------------------

const completeFirstLoginPasswordChange =
  async (
    email,
    newPasswordHash
  ) => {

    const result =
      await pool.query(
        `
        UPDATE users
        SET
          password_hash = $1,
          must_change_password = false,
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(TRIM(email)) = LOWER(TRIM($2))
        RETURNING
          id,
          name,
          email,
          role,
          is_active,
          must_change_password,
          updated_at
        `,
        [
          newPasswordHash,
          email,
        ]
      );

    return result.rows[0];
  };


// ------------------------------------------
// UPDATE USER PROFILE (NAME & AVATAR)
// ------------------------------------------

const updateUserProfile =
  async (
    userId,
    newName,
    newAvatar
  ) => {

    const cleanName = newName ? newName.trim() : null;

    let query = "";
    let params = [];

    if (cleanName && newAvatar !== undefined) {
      query = `
        UPDATE users
        SET
          name = $1,
          avatar = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING
          id,
          name,
          email,
          role,
          avatar,
          is_active,
          updated_at
      `;
      params = [cleanName, newAvatar, userId];
    } else if (cleanName) {
      query = `
        UPDATE users
        SET
          name = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
          id,
          name,
          email,
          role,
          avatar,
          is_active,
          updated_at
      `;
      params = [cleanName, userId];
    } else if (newAvatar !== undefined) {
      query = `
        UPDATE users
        SET
          avatar = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
          id,
          name,
          email,
          role,
          avatar,
          is_active,
          updated_at
      `;
      params = [newAvatar, userId];
    } else {
      return await getUserById(userId);
    }

    const result = await pool.query(query, params);
    const updatedUser = result.rows[0];

    // Synchronize first_name, last_name and avatar in employees table if exists
    if (updatedUser?.email) {
      if (cleanName && newAvatar !== undefined) {
        const parts = cleanName.split(" ");
        const firstName = parts[0] || "Employee";
        const lastName = parts.slice(1).join(" ") || "";
        await pool.query(
          `
          UPDATE employees
          SET
            first_name = $1,
            last_name = $2,
            avatar = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE LOWER(TRIM(email)) = LOWER(TRIM($4))
          `,
          [firstName, lastName, newAvatar, updatedUser.email]
        );
      } else if (cleanName) {
        const parts = cleanName.split(" ");
        const firstName = parts[0] || "Employee";
        const lastName = parts.slice(1).join(" ") || "";
        await pool.query(
          `
          UPDATE employees
          SET
            first_name = $1,
            last_name = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE LOWER(TRIM(email)) = LOWER(TRIM($3))
          `,
          [firstName, lastName, updatedUser.email]
        );
      } else if (newAvatar !== undefined) {
        await pool.query(
          `
          UPDATE employees
          SET
            avatar = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE LOWER(TRIM(email)) = LOWER(TRIM($2))
          `,
          [newAvatar, updatedUser.email]
        );
      }
    }

    return updatedUser;
  };


// ------------------------------------------
// EXPORT
// ------------------------------------------

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getMiniAdminCount,
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword,
  completeFirstLoginPasswordChange,
  syncAllEmployeesToUsers,
  updateUserProfile,
};