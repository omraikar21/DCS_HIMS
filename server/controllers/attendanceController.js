// ==========================================
// ATTENDANCE CONTROLLER
// B11
// ==========================================

const {
  getAttendanceRecords,
  getUserAttendanceRecords,
  getAttendance,
  addAttendance,
  editAttendance,
  removeAttendance,
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

      const userRole = (req.user?.role || "").toUpperCase();
      let records;

      if (["ADMIN", "HR"].includes(userRole)) {
        records = await getAttendanceRecords();
      } else {
        records = await getUserAttendanceRecords(req.user);
      }


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


module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};