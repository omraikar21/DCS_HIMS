// ==========================================
// PAYSLIP CONTROLLER
// B14
// ==========================================

const {
  getPayslipRecords,
  getPayslip,
  generatePayslip,
  generatePayslipsForMonth,
  editPayslip,
  removePayslip,
} = require("../services/payslipService");


// ------------------------------------------
// GET ALL PAYSLIPS
// ------------------------------------------

const getAll = async (req, res) => {

  try {

    const payslips =
      await getPayslipRecords();


    return res.status(200).json({

      success: true,

      count:
        payslips.length,

      data:
        payslips,

    });

  } catch (error) {

    console.error(
      "Get payslips error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch payslips",

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

    const payslip =
      await getPayslip(
        req.params.id
      );


    return res.status(200).json({

      success: true,

      data:
        payslip,

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
// CREATE PAYSLIP
// ------------------------------------------

const create = async (req, res) => {

  try {

    const {
      payrollId,
    } = req.body;


    // Validation
    if (
      payrollId === undefined ||
      payrollId === null ||
      payrollId === ""
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payroll ID is required",

      });

    }


    const payrollIdNumber =
      Number(payrollId);


    if (
      !Number.isInteger(
        payrollIdNumber
      ) ||
      payrollIdNumber <= 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payroll ID must be a valid positive number",

      });

    }


    const payslip =
      await generatePayslip(
        payrollIdNumber
      );


    return res.status(201).json({

      success: true,

      message:
        "Payslip generated successfully",

      data:
        payslip,

    });

  } catch (error) {

    console.error(
      "Create payslip error:",
      error
    );


    if (
      error.message ===
      "Payroll record not found"
    ) {

      return res.status(404).json({

        success: false,

        message:
          error.message,

      });

    }


    if (
      error.message ===
      "Payslip already exists for this payroll"
    ) {

      return res.status(409).json({

        success: false,

        message:
          error.message,

      });

    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to generate payslip",

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

    const payslip =
      await editPayslip(
        req.params.id
      );


    return res.status(200).json({

      success: true,

      message:
        "Payslip checked successfully",

      data:
        payslip,

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

    const payslip =
      await removePayslip(
        req.params.id
      );


    return res.status(200).json({

      success: true,

      message:
        "Payslip deleted successfully",

      data:
        payslip,

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
// BULK GENERATE FOR MONTH
// POST /api/payslips/generate-month
// Body: { month: 8, year: 2026 }
// ------------------------------------------

const generateForMonth = async (req, res) => {

  try {

    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const monthNum = Number(month);
    const yearNum  = Number(year);

    if (
      !Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12 ||
      !Number.isInteger(yearNum)  || yearNum  < 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid month or year",
      });
    }

    const result = await generatePayslipsForMonth(monthNum, yearNum);

    return res.status(200).json({
      success: true,
      message: `Payslip generation complete: ${result.generated.length} generated, ${result.skipped.length} already existed.`,
      data: result,
    });

  } catch (error) {

    console.error("Bulk generate payslips error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to generate payslips",
    });

  }

};


module.exports = {
  getAll,
  getById,
  create,
  generateForMonth,
  update,
  remove,
};