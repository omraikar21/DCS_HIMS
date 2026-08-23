// ==========================================
// ATTENDANCE CONTROLLER
// B11
// ==========================================

const {
  getAttendanceRecords,
  getAttendance,
  addAttendance,
  editAttendance,
  removeAttendance,
  processFacePunchService,
  processBiometricBatchService,
} = require("../services/attendanceService");


const {
  isRequired,
} = require("../utils/validation");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getAll =
  async (req, res) => {

    try {

      const records =
        await getAttendanceRecords();


      return res.status(200).json({

        success: true,

        count:
          records.length,

        data:
          records,

      });

    } catch (error) {

      console.error(
        "Get attendance error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch attendance",

      });

    }

  };


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getById =
  async (req, res) => {

    try {

      const record =
        await getAttendance(
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

const create =
  async (req, res) => {

    try {

      const {
        employeeId,
        attendanceDate,
        checkIn,
        checkOut,
        status,
        remarks,
      } = req.body;


      // ------------------------------------
      // REQUIRED FIELDS
      // ------------------------------------

      if (
        !isRequired(employeeId) ||
        !isRequired(attendanceDate) ||
        !isRequired(status)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Employee, attendance date and status are required",

        });

      }


      // ------------------------------------
      // VALID STATUS
      // ------------------------------------

      const validStatuses = [
        "PRESENT",
        "ABSENT",
        "LEAVE",
        "HALF_DAY",
        "WORK_FROM_HOME",
      ];


      if (
        !validStatuses.includes(status)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid attendance status",

        });

      }


      // ------------------------------------
      // CREATE
      // ------------------------------------

      const record =
        await addAttendance({

          employeeId:
            Number(employeeId),

          attendanceDate,

          checkIn:
            checkIn || null,

          checkOut:
            checkOut || null,

          status,

          remarks:
            remarks || null,

        });


      return res.status(201).json({

        success: true,

        message:
          "Attendance recorded successfully",

        data:
          record,

      });

    } catch (error) {

      console.error(
        "Create attendance error:",
        error
      );


      if (
        error.code === "23505"
      ) {

        return res.status(409).json({

          success: false,

          message:
            "Attendance already exists for this employee and date",

        });

      }


      if (
        error.code === "23503"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Employee does not exist",

        });

      }


      return res.status(500).json({

        success: false,

        message:
          "Failed to create attendance",

      });

    }

  };


// ------------------------------------------
// UPDATE
// ------------------------------------------

const update =
  async (req, res) => {

    try {

      const {
        checkIn,
        checkOut,
        status,
        remarks,
      } = req.body;


      const validStatuses = [
        "PRESENT",
        "ABSENT",
        "LEAVE",
        "HALF_DAY",
        "WORK_FROM_HOME",
      ];


      if (
        !isRequired(status)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Attendance status is required",

        });

      }


      if (
        !validStatuses.includes(status)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid attendance status",

        });

      }


      const record =
        await editAttendance(

          req.params.id,

          {

            checkIn:
              checkIn || null,

            checkOut:
              checkOut || null,

            status,

            remarks:
              remarks || null,

          }

        );


      return res.status(200).json({

        success: true,

        message:
          "Attendance updated successfully",

        data:
          record,

      });

    } catch (error) {

      console.error(
        "Update attendance error:",
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

const remove =
  async (req, res) => {

    try {

      const record =
        await removeAttendance(
          req.params.id
        );


      return res.status(200).json({

        success: true,

        message:
          "Attendance deleted successfully",

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
// FACE RECOGNITION BIOMETRIC PUNCH (SINGLE)
// ------------------------------------------

const BIOMETRIC_API_KEY =
  process.env.BIOMETRIC_API_KEY || "dcs_face_recognition_secure_key_2026";

const verifyBiometricApiKey = (req) => {
  const headerKey =
    req.headers["x-api-key"] ||
    req.headers["authorization"]?.replace("Bearer ", "");
  const queryKey = req.query.apiKey;
  return (
    headerKey === BIOMETRIC_API_KEY ||
    queryKey === BIOMETRIC_API_KEY ||
    req.user
  );
};

const recordFacePunchController = async (req, res) => {
  try {
    if (!verifyBiometricApiKey(req)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or missing Face Recognition API Key (X-API-KEY).",
      });
    }

    const {
      employee_code,
      employee_id,
      email,
      punch_time,
      device_id,
      confidence,
      punch_type,
      remarks,
    } = req.body;

    if (!employee_code && !employee_id && !email) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide employee_code (e.g. DCS-EMP-001), employee_id, or email.",
      });
    }

    const result = await processFacePunchService({
      employeeCode: employee_code,
      employeeId: employee_id,
      email,
      punchTime: punch_time,
      deviceId: device_id || "FACE_DETECTION_DEVICE_01",
      confidence,
      punchType: punch_type || "AUTO",
      remarks,
    });

    return res.status(200).json({
      success: true,
      message: `Face attendance logged for ${result.employee.name} (${result.employee.code}). Action: ${result.action}`,
      data: result,
    });
  } catch (error) {
    console.error("Face punch error:", error);
    return res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({
        success: false,
        message:
          error.message || "Failed to process face attendance punch",
      });
  }
};

// ------------------------------------------
// FACE RECOGNITION BIOMETRIC BATCH SYNC
// ------------------------------------------

const recordBatchBiometricController = async (req, res) => {
  try {
    if (!verifyBiometricApiKey(req)) {
      return res.status(401).json({
        success: false,
        message: "Invalid or missing Face Recognition API Key (X-API-KEY).",
      });
    }

    const { records, device_id } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of punch records.",
      });
    }

    const result = await processBiometricBatchService(
      records,
      device_id
    );

    return res.status(200).json({
      success: true,
      message: `Batch face punches processed: ${result.successful} successful, ${result.failed} failed.`,
      data: result,
    });
  } catch (error) {
    console.error("Batch biometric error:", error);
    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to process batch biometric punches",
    });
  }
};

// ------------------------------------------
// GET BIOMETRIC API CONFIG FOR ADMIN
// ------------------------------------------

const getBiometricConfigController = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        apiKey: BIOMETRIC_API_KEY,
        endpoint: "/api/attendance/face-punch",
        batchEndpoint: "/api/attendance/biometric-batch",
        supportedIdentifiers: [
          "employee_code",
          "employee_id",
          "email",
        ],
        status: "ACTIVE",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve biometric config",
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  recordFacePunchController,
  recordBatchBiometricController,
  getBiometricConfigController,
};