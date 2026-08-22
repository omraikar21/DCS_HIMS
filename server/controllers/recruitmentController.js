// ==========================================
// RECRUITMENT CONTROLLER
// B16
// ==========================================

const {
  getRecruitmentRecords,
  getRecruitment,
  addRecruitment,
  editRecruitment,
  removeRecruitment,
} = require("../services/recruitmentService");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getAll = async (req, res) => {

  try {

    const records =
      await getRecruitmentRecords();

    return res.status(200).json({

      success: true,

      count:
        records.length,

      data:
        records,

    });

  } catch (error) {

    console.error(
      "Get recruitment error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch recruitment records",

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
      await getRecruitment(
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
// CREATE
// ------------------------------------------

const create = async (req, res) => {

  try {

    const {
      candidateName,
      email,
      phone,
      position,
      departmentId,
      experienceYears,
      applicationDate,
      status,
      interviewDate,
      notes,
    } = req.body;


    // Required fields
    if (
      !candidateName ||
      !email ||
      !position
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Candidate name, email and position are required",

      });

    }


    // Email validation
    if (
      !email.includes("@")
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid email address",

      });

    }


    // Valid recruitment statuses
    const validStatuses = [
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "SELECTED",
      "REJECTED",
    ];


    const finalStatus =
      status || "APPLIED";


    if (
      !validStatuses.includes(
        finalStatus
      )
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid recruitment status",

      });

    }


    const record =
      await addRecruitment({

        candidateName,

        email,

        phone:
          phone || null,

        position,

        departmentId:
          departmentId
            ? Number(departmentId)
            : null,

        experienceYears:
          experienceYears !== undefined &&
          experienceYears !== ""
            ? Number(experienceYears)
            : null,

        applicationDate:
          applicationDate ||
          new Date(),

        status:
          finalStatus,

        interviewDate:
          interviewDate ||
          null,

        notes:
          notes || null,

      });


    return res.status(201).json({

      success: true,

      message:
        "Recruitment record created successfully",

      data:
        record,

    });

  } catch (error) {

    console.error(
      "Create recruitment error:",
      error
    );


    if (
      error.code === "23503"
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Department does not exist",

      });

    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to create recruitment record",

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
      candidateName,
      email,
      phone,
      position,
      departmentId,
      experienceYears,
      status,
      interviewDate,
      notes,
    } = req.body;


    if (
      !candidateName ||
      !email ||
      !position
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Candidate name, email and position are required",

      });

    }


    const validStatuses = [
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "SELECTED",
      "REJECTED",
    ];


    if (
      !validStatuses.includes(status)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid recruitment status",

      });

    }


    const record =
      await editRecruitment(

        req.params.id,

        {

          candidateName,

          email,

          phone:
            phone || null,

          position,

          departmentId:
            departmentId
              ? Number(departmentId)
              : null,

          experienceYears:
            experienceYears !== undefined &&
            experienceYears !== ""
              ? Number(experienceYears)
              : null,

          status,

          interviewDate:
            interviewDate ||
            null,

          notes:
            notes || null,

        }

      );


    return res.status(200).json({

      success: true,

      message:
        "Recruitment record updated successfully",

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
// DELETE
// ------------------------------------------

const remove = async (req, res) => {

  try {

    const record =
      await removeRecruitment(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      message:
        "Recruitment record deleted successfully",

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
  create,
  update,
  remove,
};