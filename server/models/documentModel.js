// ==========================================
// DOCUMENT MODEL
// B14
// Uses EXISTING documents table
// ==========================================

const { pool } = require("../config/database");


// ------------------------------------------
// GET ALL DOCUMENTS
// ------------------------------------------

const getAllDocuments = async () => {

  const result = await pool.query(`
    SELECT
      d.id,
      d.employee_id,

      e.employee_code,
      e.first_name,
      e.last_name,

      d.document_name,
      d.document_type,
      d.file_name,
      d.file_path,
      d.file_size,
      d.mime_type,
      d.uploaded_by,
      d.created_at

    FROM documents d

    JOIN employees e
      ON d.employee_id = e.id

    ORDER BY d.id DESC
  `);

  return result.rows;
};


// ------------------------------------------
// GET DOCUMENT BY ID
// ------------------------------------------

const getDocumentById = async (id) => {

  const result = await pool.query(
    `
    SELECT
      d.id,
      d.employee_id,

      e.employee_code,
      e.first_name,
      e.last_name,

      d.document_name,
      d.document_type,
      d.file_name,
      d.file_path,
      d.file_size,
      d.mime_type,
      d.uploaded_by,
      d.created_at

    FROM documents d

    JOIN employees e
      ON d.employee_id = e.id

    WHERE d.id = $1
    `,
    [id]
  );

  return result.rows[0];
};


// ------------------------------------------
// GET DOCUMENTS BY EMPLOYEE
// ------------------------------------------

const getDocumentsByEmployee = async (
  employeeId
) => {

  const result = await pool.query(
    `
    SELECT
      d.id,
      d.employee_id,

      e.employee_code,
      e.first_name,
      e.last_name,

      d.document_name,
      d.document_type,
      d.file_name,
      d.file_path,
      d.file_size,
      d.mime_type,
      d.uploaded_by,
      d.created_at

    FROM documents d

    JOIN employees e
      ON d.employee_id = e.id

    WHERE d.employee_id = $1

    ORDER BY d.id DESC
    `,
    [employeeId]
  );

  return result.rows;
};


// ------------------------------------------
// CREATE DOCUMENT
// ------------------------------------------

const createDocument = async (data) => {

  const {
    employeeId,
    documentName,
    documentType,
    fileName,
    filePath,
    fileSize,
    mimeType,
    uploadedBy,
  } = data;


  const result = await pool.query(
    `
    INSERT INTO documents
    (
      employee_id,
      document_name,
      document_type,
      file_name,
      file_path,
      file_size,
      mime_type,
      uploaded_by
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
      $8
    )

    RETURNING *
    `,
    [
      employeeId,
      documentName,
      documentType,
      fileName,
      filePath,
      fileSize,
      mimeType,
      uploadedBy,
    ]
  );

  return result.rows[0];
};


// ------------------------------------------
// UPDATE DOCUMENT
// ------------------------------------------

const updateDocument = async (
  id,
  data
) => {

  const {
    documentName,
    documentType,
    fileName,
    filePath,
    fileSize,
    mimeType,
  } = data;


  const result = await pool.query(
    `
    UPDATE documents

    SET
      document_name = $1,
      document_type = $2,
      file_name = $3,
      file_path = $4,
      file_size = $5,
      mime_type = $6

    WHERE id = $7

    RETURNING *
    `,
    [
      documentName,
      documentType,
      fileName,
      filePath,
      fileSize,
      mimeType,
      id,
    ]
  );

  return result.rows[0];
};


// ------------------------------------------
// DELETE DOCUMENT
// ------------------------------------------

const deleteDocument = async (id) => {

  const result = await pool.query(
    `
    DELETE FROM documents

    WHERE id = $1

    RETURNING *
    `,
    [id]
  );

  return result.rows[0];
};


module.exports = {
  getAllDocuments,
  getDocumentById,
  getDocumentsByEmployee,
  createDocument,
  updateDocument,
  deleteDocument,
};