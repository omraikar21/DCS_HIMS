// ==========================================
// CUSTOM REPORT MODEL
// PostgreSQL Data Access Layer
// ==========================================

const { pool } = require("../config/database");

// ------------------------------------------
// GET ALL CUSTOM REPORTS
// ------------------------------------------
const getAllReports = async () => {
  const result = await pool.query(
    "SELECT * FROM custom_reports ORDER BY created_at DESC;"
  );
  return result.rows;
};

// ------------------------------------------
// CREATE CUSTOM REPORT
// ------------------------------------------
const createReport = async ({
  reportTitle,
  reportType = "FINANCE",
  period = "",
  parameters = {},
  data = [],
  createdBy = null,
  createdByName = "",
}) => {
  const result = await pool.query(
    `
    INSERT INTO custom_reports (
      report_title, report_type, period, parameters, data, created_by, created_by_name
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
    [
      reportTitle,
      reportType,
      period,
      JSON.stringify(parameters),
      JSON.stringify(data),
      createdBy,
      createdByName,
    ]
  );
  return result.rows[0];
};

// ------------------------------------------
// DELETE CUSTOM REPORT
// ------------------------------------------
const deleteReport = async (id) => {
  const result = await pool.query(
    "DELETE FROM custom_reports WHERE id = $1 RETURNING *;",
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getAllReports,
  createReport,
  deleteReport,
};
