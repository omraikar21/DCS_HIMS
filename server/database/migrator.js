// ==========================================
// POSTGRESQL DATABASE MIGRATION RUNNER
// Handles automatic trackable SQL migrations
// ==========================================

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const { pool } = require("../config/database");

const ensureMigrationsTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const getAppliedMigrations = async (client) => {
  const result = await client.query(
    "SELECT name FROM schema_migrations ORDER BY id ASC;"
  );
  return new Set(result.rows.map((r) => r.name));
};

const runMigrations = async () => {
  const client = await pool.connect();
  try {
    console.log("------------------------------------------");
    console.log("[MIGRATOR] Checking database migrations...");
    await ensureMigrationsTable(client);

    const appliedSet = await getAppliedMigrations(client);
    const migrationsDir = path.resolve(__dirname, "migrations");

    if (!fs.existsSync(migrationsDir)) {
      console.log("[MIGRATOR] No migrations directory found.");
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    let appliedCount = 0;

    for (const file of files) {
      if (!appliedSet.has(file)) {
        console.log(`[MIGRATOR] Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query(
            "INSERT INTO schema_migrations (name) VALUES ($1);",
            [file]
          );
          await client.query("COMMIT");
          console.log(`[MIGRATOR] Successfully applied: ${file}`);
          appliedCount++;
        } catch (err) {
          await client.query("ROLLBACK");
          console.error(`[MIGRATOR] Error applying migration ${file}:`, err.message);
          throw err;
        }
      }
    }

    if (appliedCount === 0) {
      console.log("[MIGRATOR] Database is up-to-date. No new migrations.");
    } else {
      console.log(`[MIGRATOR] Applied ${appliedCount} migration(s) successfully.`);
    }
    console.log("------------------------------------------");
  } finally {
    client.release();
  }
};

// Execute if run directly from CLI
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log("[MIGRATOR] Migration process finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[MIGRATOR] Migration failed:", err);
      process.exit(1);
    });
}

module.exports = {
  runMigrations,
};
