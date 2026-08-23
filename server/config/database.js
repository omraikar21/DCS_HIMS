
// POSTGRESQL DATABASE CONNECTION
// B2

const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const {
  Pool,
} = require("pg");


// ------------------------------------------
// CREATE CONNECTION POOL
// ------------------------------------------

const dbConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool(dbConfig);


// ------------------------------------------
// DATABASE ERROR
// ------------------------------------------

pool.on(
  "error",
  (error) => {

    console.error(
      "Unexpected PostgreSQL error:",
      error
    );

  }
);


// ------------------------------------------
// TEST DATABASE CONNECTION
// ------------------------------------------

const testDatabaseConnection =
  async () => {

    try {

      const result =
        await pool.query(
          "SELECT NOW() AS current_time"
        );


      console.log(
        "=================================="
      );

      console.log(
        "PostgreSQL connected successfully"
      );

      console.log(
        "Database:",
        process.env.DB_NAME
      );

      console.log(
        "Time:",
        result.rows[0].current_time
      );

      console.log(
        "=================================="
      );


    } catch (error) {

      console.error(
        "PostgreSQL connection failed:"
      );

      console.error(
        error.message
      );

      process.exit(1);

    }

  };


module.exports = {
  pool,
  testDatabaseConnection,
};