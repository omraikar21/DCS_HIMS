// ==========================================
// ONBOARDING CONTROLLER
// B17
// ==========================================

const {
  getOnboardingRecords,
  getOnboarding,
  getEmployeeOnboarding,
  addOnboarding,
  editOnboarding,
  removeOnboarding,
} = require("../services/onboardingService");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getAll = async (req, res) => {

  try {

    const records =
      await getOnboardingRecords();

    return res.status(200).json({

      success: true,

      count:
        records.length,

      data:
        records,

    });

  } catch (error) {

    console.error(
      "Get onboarding error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch onboarding records",

      error:
        error.message,

    });

  }
};


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getById = async (req, res) => {

  try {

    const record =
      await getOnboarding(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      data:
        record,

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
// GET BY EMPLOYEE
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


    const records =
      await getEmployeeOnboarding(
        employeeId
      );


    return res.status(200).json({

      success: true,

      count:
        records.length,

      data:
        records,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch employee onboarding",

      error:
        error.message,

    });

  }
};


// ------------------------------------------
// CREATE
// ------------------------------------------

const create = async (req, res) => {

  try {

    const {
      candidateId,
      employeeId,
      joiningDate,
      departmentId,
      designation,
      onboardingStatus,
      documentsCompleted,
      orientationCompleted,
    } = req.body;


    // --------------------------------------
    // ID VALIDATION
    // --------------------------------------

    const candidateIdNumber =
      candidateId !== undefined &&
      candidateId !== null &&
      candidateId !== ""
        ? Number(candidateId)
        : null;


    const employeeIdNumber =
      employeeId !== undefined &&
      employeeId !== null &&
      employeeId !== ""
        ? Number(employeeId)
        : null;


    const departmentIdNumber =
      departmentId !== undefined &&
      departmentId !== null &&
      departmentId !== ""
        ? Number(departmentId)
        : null;


    if (
      candidateIdNumber !== null &&
      (
        !Number.isInteger(candidateIdNumber) ||
        candidateIdNumber <= 0
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Candidate ID must be a valid positive number",

      });

    }


    if (
      employeeIdNumber !== null &&
      (
        !Number.isInteger(employeeIdNumber) ||
        employeeIdNumber <= 0
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Employee ID must be a valid positive number",

      });

    }


    if (
      departmentIdNumber !== null &&
      (
        !Number.isInteger(departmentIdNumber) ||
        departmentIdNumber <= 0
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Department ID must be a valid positive number",

      });

    }


    // --------------------------------------
    // CREATE RECORD
    // --------------------------------------

    const record =
      await addOnboarding({

        candidateId:
          candidateIdNumber,

        employeeId:
          employeeIdNumber,

        joiningDate:
          joiningDate || null,

        departmentId:
          departmentIdNumber,

        designation:
          designation || null,

        onboardingStatus:
          onboardingStatus || "PENDING",

        documentsCompleted:
          documentsCompleted === true,

        orientationCompleted:
          orientationCompleted === true,

      });


    return res.status(201).json({

      success: true,

      message:
        "Onboarding record created successfully",

      data:
        record,

    });

  } catch (error) {

    console.error(
      "Create onboarding error:",
      error
    );


    if (
      error.code === "23503"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Candidate, employee or department does not exist",

      });

    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to create onboarding record",

      error:
        error.message,

    });

  }
};


// ------------------------------------------
// UPDATE
// ------------------------------------------

const update = async (req, res) => {

  try {

    const {
      candidateId,
      employeeId,
      joiningDate,
      departmentId,
      designation,
      onboardingStatus,
      documentsCompleted,
      orientationCompleted,
    } = req.body;


    const candidateIdNumber =
      candidateId !== undefined &&
      candidateId !== null &&
      candidateId !== ""
        ? Number(candidateId)
        : null;


    const employeeIdNumber =
      employeeId !== undefined &&
      employeeId !== null &&
      employeeId !== ""
        ? Number(employeeId)
        : null;


    const departmentIdNumber =
      departmentId !== undefined &&
      departmentId !== null &&
      departmentId !== ""
        ? Number(departmentId)
        : null;


    const record =
      await editOnboarding(

        req.params.id,

        {

          candidateId:
            candidateIdNumber,

          employeeId:
            employeeIdNumber,

          joiningDate:
            joiningDate || null,

          departmentId:
            departmentIdNumber,

          designation:
            designation || null,

          onboardingStatus:
            onboardingStatus || "PENDING",

          documentsCompleted:
            documentsCompleted === true,

          orientationCompleted:
            orientationCompleted === true,

        }

      );


    return res.status(200).json({

      success: true,

      message:
        "Onboarding record updated successfully",

      data:
        record,

    });

  } catch (error) {

    console.error(
      "Update onboarding error:",
      error
    );

    return res.status(404).json({

      success: false,

      message:
        error.message,

    });

  }
};


// ------------------------------------------
// DELETE
// ------------------------------------------

const remove = async (req, res) => {

  try {

    const record =
      await removeOnboarding(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      message:
        "Onboarding record deleted successfully",

      data:
        record,

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