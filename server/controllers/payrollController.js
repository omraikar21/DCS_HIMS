// ==========================================
// PAYROLL CONTROLLER
// B13
// ==========================================

const {
  getPayrollRecords,
  getPayroll,
  addPayroll,
  editPayroll,
  removePayroll,
} = require("../services/payrollService");


const {
  isRequired,
  isPositiveNumber,
} = require("../utils/validation");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getAll = async (req, res) => {

  try {

    const payroll =
      await getPayrollRecords();

    return res.status(200).json({

      success: true,

      count:
        payroll.length,

      data:
        payroll,

    });

  }catch (error) {

  console.error(
    "================================="
  );

  console.error(
    "GET PAYROLL ERROR"
  );

  console.error(
    "Message:",
    error.message
  );

  console.error(
    "Code:",
    error.code
  );

  console.error(
    "Detail:",
    error.detail
  );

  console.error(
    "Stack:",
    error.stack
  );

  console.error(
    "================================="
  );


  return res.status(500).json({

    success: false,

    message:
      "Failed to fetch payroll records",

  });

  }

};


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getById = async (req, res) => {

  try {

    const payroll =
      await getPayroll(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      data:
        payroll,

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
// CREATE PAYROLL
// ------------------------------------------

const create = async (req, res) => {

  try {

    const {
      employeeId,
      payrollMonth,
      payrollYear,
      basicSalary,
      allowances,
      deductions,
      paymentStatus,
      bankName,
      bankAccount,
      ifscCode,
    } = req.body;


    // --------------------------------------
    // REQUIRED
    // --------------------------------------

    if (
      !isRequired(employeeId) ||
      !isRequired(payrollMonth) ||
      !isRequired(payrollYear) ||
      !isRequired(basicSalary)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Employee, payroll month, payroll year and basic salary are required",

      });

    }


    // --------------------------------------
    // MONTH VALIDATION
    // --------------------------------------

    const month =
      Number(payrollMonth);

    if (
      month < 1 ||
      month > 12
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Payroll month must be between 1 and 12",

      });

    }


    // --------------------------------------
    // YEAR VALIDATION
    // --------------------------------------

    const year =
      Number(payrollYear);

    if (
      year < 2000 ||
      year > 2100
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid payroll year",

      });

    }


    // --------------------------------------
    // SALARY VALIDATION
    // --------------------------------------

    if (
      !isPositiveNumber(basicSalary)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Basic salary must be a valid positive number",

      });

    }


    const basic =
      Number(basicSalary);

    const totalAllowances =
      Number(allowances || 0);

    const totalDeductions =
      Number(deductions || 0);


    if (
      totalAllowances < 0 ||
      totalDeductions < 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Allowances and deductions cannot be negative",

      });

    }


    // --------------------------------------
    // CALCULATE
    // --------------------------------------

    const grossSalary =
      basic +
      totalAllowances;


    const netSalary =
      grossSalary -
      totalDeductions;


    if (
      netSalary < 0
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Deductions cannot exceed gross salary",

      });

    }


    const payroll =
      await addPayroll({

        employeeId:
          Number(employeeId),

        payrollMonth:
          month,

        payrollYear:
          year,

        basicSalary:
          basic,

        allowances:
          totalAllowances,

        deductions:
          totalDeductions,

        grossSalary,

        netSalary,

        paymentStatus:
          paymentStatus ||
          "PENDING",

        bankName:
          bankName || null,

        bankAccount:
          bankAccount || null,

        ifscCode:
          ifscCode || null,

      });

    // Also persist bank details to employee if provided
    if (bankName || bankAccount || ifscCode) {
      try {
        const { pool } = require("../config/database");
        await pool.query(
          `UPDATE employees
           SET bank_name = COALESCE($1, bank_name),
               bank_account = COALESCE($2, bank_account),
               ifsc_code = COALESCE($3, ifsc_code)
           WHERE id = $4`,
          [bankName || null, bankAccount || null, ifscCode || null, Number(employeeId)]
        );
      } catch (bankErr) {
        console.warn("Sync employee bank info warning:", bankErr);
      }
    }


    return res.status(201).json({

      success: true,

      message:
        "Payroll record created successfully",

      data:
        payroll,

    });

  } catch (error) {

    console.error(
      "Create payroll error:",
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


    if (
      error.code === "23505"
    ) {

      return res.status(409).json({

        success: false,

        message:
          "Payroll already exists for this employee and month",

      });

    }


    return res.status(500).json({

      success: false,

      message:
        "Failed to create payroll record",

    });

  }

};


// ------------------------------------------
// UPDATE
// ------------------------------------------

const update = async (req, res) => {
  try {
    const existing = await getPayroll(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    const {
      basicSalary,
      allowances,
      deductions,
      paymentStatus,
      bankName,
      bankAccount,
      ifscCode,
      paymentDate,
    } = req.body;

    const basic =
      basicSalary !== undefined && basicSalary !== null && basicSalary !== ""
        ? Number(basicSalary)
        : Number(existing.basic_salary || 0);

    const totalAllowances =
      allowances !== undefined && allowances !== null && allowances !== ""
        ? Number(allowances)
        : Number(existing.allowances || 0);

    const totalDeductions =
      deductions !== undefined && deductions !== null && deductions !== ""
        ? Number(deductions)
        : Number(existing.deductions || 0);

    if (totalAllowances < 0 || totalDeductions < 0 || basic < 0) {
      return res.status(400).json({
        success: false,
        message: "Salary components cannot be negative",
      });
    }

    const grossSalary = basic + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    if (netSalary < 0) {
      return res.status(400).json({
        success: false,
        message: "Deductions cannot exceed gross salary",
      });
    }

    const finalStatus = paymentStatus || existing.payment_status || "PENDING";
    const finalPaymentDate =
      paymentDate ||
      (finalStatus === "PAID"
        ? (existing.payment_date || new Date().toISOString().slice(0, 10))
        : existing.payment_date);

    const payroll = await editPayroll(
      req.params.id,
      {
        basicSalary: basic,
        allowances: totalAllowances,
        deductions: totalDeductions,
        grossSalary,
        netSalary,
        paymentStatus: finalStatus,
        bankName: bankName || existing.bank_name,
        bankAccount: bankAccount || existing.bank_account,
        ifscCode: ifscCode || existing.ifsc_code,
        paymentDate: finalPaymentDate,
      }
    );

    // Also persist bank details to employee if provided
    if ((bankName || bankAccount || ifscCode) && existing.employee_id) {
      try {
        const { pool } = require("../config/database");
        await pool.query(
          `UPDATE employees
           SET bank_name = COALESCE($1, bank_name),
               bank_account = COALESCE($2, bank_account),
               ifsc_code = COALESCE($3, ifsc_code)
           WHERE id = $4`,
          [bankName || null, bankAccount || null, ifscCode || null, existing.employee_id]
        );
      } catch (bankErr) {
        console.warn("Sync employee bank info warning:", bankErr);
      }
    }

    // If marked as PAID, ensure a payslip record exists in payslips table
    if (finalStatus === "PAID" || finalStatus === "Paid") {
      try {
        const { pool } = require("../config/database");
        const payslipNum = `PS-${existing.payroll_year}${String(existing.payroll_month).padStart(2, "0")}-${String(existing.id).padStart(4, "0")}`;
        await pool.query(
          `
          INSERT INTO payslips (employee_id, payroll_id, payslip_number, generated_at)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (payslip_number) DO NOTHING
          `,
          [existing.employee_id, existing.id, payslipNum]
        );
      } catch (slipErr) {
        console.warn("Auto payslip creation warning:", slipErr);
      }
    }

    // Auto audit log
    try {
      const { createAuditLog } = require("../models/auditModel");
      await createAuditLog({
        logCode: `AUD-PAY-${Date.now().toString().slice(-4)}`,
        eventAction: finalStatus === "PAID" ? "PAYROLL_DISBURSED" : "PAYROLL_UPDATED",
        category: "FINANCE",
        actorName: req.user?.name || "Om Raikar",
        actorEmail: req.user?.email || "omraikar2128@gmail.com",
        role: req.user?.role || "FINANCE",
        details: `Updated payroll ID PAY-${String(existing.id).padStart(3, "0")} for ${existing.first_name || ""} ${existing.last_name || ""} (${existing.employee_code || "EMP-" + existing.employee_id}) - Status: ${finalStatus}, Net: ₹${netSalary.toLocaleString("en-IN")}`,
        status: "SUCCESS",
      });
    } catch (auditErr) {
      console.warn("Payroll audit log warning:", auditErr);
    }

    return res.status(200).json({
      success: true,
      message: "Payroll record updated successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("Update payroll error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update payroll record",
    });
  }
};



// ------------------------------------------
// DELETE
// ------------------------------------------

const remove = async (req, res) => {

  try {

    const payroll =
      await removePayroll(
        req.params.id
      );

    return res.status(200).json({

      success: true,

      message:
        "Payroll record deleted successfully",

      data:
        payroll,

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