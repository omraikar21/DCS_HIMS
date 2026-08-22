// ==========================================
// DOCUMENT SERVICE
// B14
// ==========================================

const {
  getAllDocuments,
  getDocumentById,
  getDocumentsByEmployee,
  createDocument,
  updateDocument,
  deleteDocument,
} = require("../models/documentModel");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getDocumentRecords = async () => {

  return await getAllDocuments();

};


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getDocument = async (id) => {

  const document =
    await getDocumentById(id);

  if (!document) {

    throw new Error(
      "Document not found"
    );

  }

  return document;
};


// ------------------------------------------
// GET BY EMPLOYEE
// ------------------------------------------

const getEmployeeDocuments = async (
  employeeId
) => {

  return await getDocumentsByEmployee(
    employeeId
  );

};


// ------------------------------------------
// CREATE
// ------------------------------------------

const addDocument = async (data) => {

  return await createDocument(data);

};


// ------------------------------------------
// UPDATE
// ------------------------------------------

const editDocument = async (
  id,
  data
) => {

  const existing =
    await getDocumentById(id);

  if (!existing) {

    throw new Error(
      "Document not found"
    );

  }

  return await updateDocument(
    id,
    data
  );
};


// ------------------------------------------
// DELETE
// ------------------------------------------

const removeDocument = async (id) => {

  const existing =
    await getDocumentById(id);

  if (!existing) {

    throw new Error(
      "Document not found"
    );

  }

  return await deleteDocument(id);
};


module.exports = {
  getDocumentRecords,
  getDocument,
  getEmployeeDocuments,
  addDocument,
  editDocument,
  removeDocument,
};