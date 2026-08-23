// ==========================================
// DEVELOPMENT SEED
// B6 - ROLE TEST USERS
// ==========================================

const bcrypt =
  require("bcryptjs");


const {
  pool,
} = require("../config/database");


// ------------------------------------------
// CREATE USER HELPER
// ------------------------------------------

const createSeedUser =
  async ({
    name,
    email,
    password,
    role,
  }) => {

    // Check existing user

    const existing =
      await pool.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        `,
        [email]
      );


    if (
      existing.rows.length > 0
    ) {

      console.log(
        `${role} user already exists: ${email}`
      );

      return;

    }


    // Hash password

    const passwordHash =
      await bcrypt.hash(
        password,
        10
      );


    // Create user

    const result =
      await pool.query(
        `
        INSERT INTO users
        (
          name,
          email,
          password_hash,
          role,
          is_active
        )
        VALUES
        ($1, $2, $3, $4, $5)
        RETURNING
          id,
          name,
          email,
          role
        `,
        [
          name,
          email,
          passwordHash,
          role,
          true,
        ]
      );


    console.log(
      `${role} user created:`,
      result.rows[0]
    );

  };


// ------------------------------------------
// RUN SEED
// ------------------------------------------

const runSeed =
  async () => {

    try {

      await createSeedUser({
        name: "Om Raikar",
        email: "omraikar2128@gmail.com",
        password: "Admin@123",
        role: "ADMIN",
      });


      console.log(
        "=================================="
      );

      console.log(
        "Seed completed successfully."
      );

      console.log(
        "=================================="
      );


    } catch (error) {

      console.error(
        "Seed failed:",
        error.message
      );

      process.exitCode = 1;

    } finally {

      await pool.end();

    }

  };


runSeed();