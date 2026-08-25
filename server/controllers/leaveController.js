// ==========================================
// LEAVE CONTROLLER
// B12
// ==========================================

const {
  getLeaves,
  getLeave,
  addLeave,
  editLeave,
  removeLeave,
  approve,
  reject,
  hold,
} = require("../services/leaveService");


const {
  isRequired,
} = require("../utils/validation");


// ------------------------------------------
// VALID LEAVE TYPES
// ------------------------------------------

const validLeaveTypes = [
  "CASUAL",
  "SICK",
  "EARNED",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
];


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getAll =
  async (req, res) => {

    try {

      const leaves =
        await getLeaves();

      return res.status(200).json({

        success: true,

        count:
          leaves.length,

        data:
          leaves,

      });

    } catch (error) {

      console.error(
        "Get leaves error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch leaves",

      });

    }

  };


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getById =
  async (req, res) => {

    try {

      const leave =
        await getLeave(
          req.params.id
        );

      return res.status(200).json({

        success: true,

        data:
          leave,

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

      const rawEmployeeId = req.body.employeeId || req.body.employee_id || req.user?.employee_id || req.user?.id;
      const rawLeaveType = (req.body.leaveType || req.body.leave_type || "").toUpperCase().trim();
      const rawStartDate = req.body.startDate || req.body.start_date;
      const rawEndDate = req.body.endDate || req.body.end_date;
      const rawReason = req.body.reason || "";

      if (
        !isRequired(rawEmployeeId) ||
        !isRequired(rawLeaveType) ||
        !isRequired(rawStartDate) ||
        !isRequired(rawEndDate)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Employee, leave type, start date and end date are required",

        });

      }


      if (
        !validLeaveTypes.includes(
          rawLeaveType
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid leave type",

        });

      }


      if (
        new Date(rawStartDate) >
        new Date(rawEndDate)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Start date cannot be after end date",

        });

      }


      const leave =
        await addLeave({

          employeeId:
            Number(rawEmployeeId),

          leaveType: rawLeaveType,

          startDate: rawStartDate,

          endDate: rawEndDate,

          reason:
            rawReason || null,

          status:
            "PENDING",

        });


      return res.status(201).json({

        success: true,

        message:
          "Leave request created successfully",

        data:
          leave,

      });

    } catch (error) {

      console.error(
        "Create leave error:",
        error
      );


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
          "Failed to create leave request",

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
        leaveType,
        startDate,
        endDate,
        reason,
      } = req.body;


      if (
        !isRequired(leaveType) ||
        !isRequired(startDate) ||
        !isRequired(endDate)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Leave type, start date and end date are required",

        });

      }


      if (
        !validLeaveTypes.includes(
          leaveType
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid leave type",

        });

      }


      if (
        new Date(startDate) >
        new Date(endDate)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Start date cannot be after end date",

        });

      }


      const leave =
        await editLeave(

          req.params.id,

          {
            leaveType,
            startDate,
            endDate,
            reason:
              reason || null,
          }

        );


      return res.status(200).json({

        success: true,

        message:
          "Leave request updated successfully",

        data:
          leave,

      });

    } catch (error) {

      return res.status(400).json({

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

      const leave =
        await removeLeave(
          req.params.id
        );


      return res.status(200).json({

        success: true,

        message:
          "Leave request deleted successfully",

        data:
          leave,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ------------------------------------------
// APPROVE
// ------------------------------------------

const approveLeaveRequest =
  async (req, res) => {

    try {

      const leave =
        await approve(

          req.params.id,

          req.user.id

        );


      return res.status(200).json({

        success: true,

        message:
          "Leave request approved successfully",

        data:
          leave,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ------------------------------------------
// REJECT
// ------------------------------------------

const rejectLeaveRequest =
  async (req, res) => {

    try {

      const {
        rejectionReason,
      } = req.body;


      if (
        !isRequired(rejectionReason)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Rejection reason is required",

        });

      }


      const leave =
        await reject(

          req.params.id,

          rejectionReason

        );


      return res.status(200).json({

        success: true,

        message:
          "Leave request rejected successfully",

        data:
          leave,

      });

    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          error.message,

      });

    }

  };


// ------------------------------------------
// HOLD / PENDING
// ------------------------------------------

const holdLeaveRequest =
  async (req, res) => {

    try {

      const leave =
        await hold(
          req.params.id
        );

      return res.status(200).json({

        success: true,

        message:
          "Leave request set to hold/pending status",

        data:
          leave,

      });

    } catch (error) {

      return res.status(400).json({

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
  approveLeaveRequest,
  rejectLeaveRequest,
  holdLeaveRequest,
};