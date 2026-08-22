// ==========================================
// DOCUMENT CONTROLLER
// B14
// ==========================================

const {
  getDocumentRecords,
  getDocument,
  getEmployeeDocuments,
  addDocument,
  editDocument,
  removeDocument,
} = require("../services/documentService");


// ------------------------------------------
// GET ALL DOCUMENTS
// ------------------------------------------

const getAll = async (req, res) => {

  try {

    const documents =
      await getDocumentRecords();

    return res.status(200).json({

      success: true,

      count:
        documents.length,

      data:
        documents,

    });

  } catch (error) {

    console.error(
      "Get documents error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch documents",

      error:
        error.message,

    });

  }
};


// ------------------------------------------
// GET DOCUMENT BY ID
// ------------------------------------------

const getById = async (req, res) => {

  try {

    const document =
      await getDocument(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      data:
        document,

    });

  } catch (error) {

    return res.status(404).json({

      success: false,

      message:
        error.message,

    });

  }
};


// ------------------------------------------
// GET DOCUMENTS BY EMPLOYEE
// ------------------------------------------

const getByEmployee = async (
  req,
  res
) => {

  try {

    const employeeId =
      Number(req.params.employeeId);


    if (
      !Number.isInteger(employeeId) ||
      employeeId <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Employee ID must be a valid positive number",

      });

    }


    const documents =
      await getEmployeeDocuments(
        employeeId
      );


    return res.status(200).json({

      success: true,

      count:
        documents.length,

      data:
        documents,

    });

  } catch (error) {

    console.error(
      "Get employee documents error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch employee documents",

      error:
        error.message,

    });

  }
};


// ------------------------------------------
// CREATE DOCUMENT
// ------------------------------------------

const create = async (req, res) => {

  try {

    const {
      employeeId,
      documentName,
      documentType,
      fileName,
      filePath,
      fileSize,
      mimeType,
      uploadedBy,
    } = req.body;


    // Required fields
    if (
      employeeId === undefined ||
      employeeId === null ||
      employeeId === "" ||
      !documentName
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Employee ID and document name are required",

      });

    }


    const employeeIdNumber =
      Number(employeeId);


    if (
      !Number.isInteger(
        employeeIdNumber
      ) ||
      employeeIdNumber <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Employee ID must be a valid positive number",

      });

    }


    let fileSizeNumber = null;


    if (
      fileSize !== undefined &&
      fileSize !== null &&
      fileSize !== ""
    ) {

      fileSizeNumber =
        Number(fileSize);


      if (
        !Number.isInteger(
          fileSizeNumber
        ) ||
        fileSizeNumber < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "File size must be a valid positive number",

        });

      }

    }


    const document =
      await addDocument({

        employeeId:
          employeeIdNumber,

        documentName,

        documentType:
          documentType || null,

        fileName:
          fileName || null,

        filePath:
          filePath || null,

        fileSize:
          fileSizeNumber,

        mimeType:
          mimeType || null,

        uploadedBy:
          uploadedBy
            ? Number(uploadedBy)
            : null,

      });


    return res.status(201).json({

      success: true,

      message:
        "Document created successfully",

      data:
        document,

    });

  } catch (error) {

    console.error(
      "Create document error:",
      error
    );


    if (
      error.code === "23503"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Employee or uploader does not exist",

      });

    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to create document",

      error:
        error.message,

    });

  }
};


// ------------------------------------------
// UPDATE DOCUMENT
// ------------------------------------------

const update = async (req, res) => {

  try {

    const {
      documentName,
      documentType,
      fileName,
      filePath,
      fileSize,
      mimeType,
    } = req.body;


    if (!documentName) {

      return res.status(400).json({

        success: false,

        message:
          "Document name is required",

      });

    }


    let fileSizeNumber = null;


    if (
      fileSize !== undefined &&
      fileSize !== null &&
      fileSize !== ""
    ) {

      fileSizeNumber =
        Number(fileSize);


      if (
        !Number.isInteger(
          fileSizeNumber
        ) ||
        fileSizeNumber < 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "File size must be a valid positive number",

        });

      }

    }


    const document =
      await editDocument(

        req.params.id,

        {

          documentName,

          documentType:
            documentType || null,

          fileName:
            fileName || null,

          filePath:
            filePath || null,

          fileSize:
            fileSizeNumber,

          mimeType:
            mimeType || null,

        }

      );


    return res.status(200).json({

      success: true,

      message:
        "Document updated successfully",

      data:
        document,

    });

  } catch (error) {

    return res.status(404).json({

      success: false,

      message:
        error.message,

    });

  }
};


// ------------------------------------------
// DELETE DOCUMENT
// ------------------------------------------

const remove = async (req, res) => {

  try {

    const document =
      await removeDocument(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      message:
        "Document deleted successfully",

      data:
        document,

    });

  } catch (error) {

    return res.status(404).json({

      success: false,

      message:
        error.message,

    });

  }
};


module.exports = {
  getAll,
  getById,
  getByEmployee,
  create,
  update,
  remove,
};