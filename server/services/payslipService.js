// ==========================================
// PAYSLIP SERVICE
// B14
// ==========================================

const {
  getAllPayslips,
  getPayslipById,
  getPayrollForPayslip,
  createPayslip,
  updatePayslip,
  deletePayslip,
  getPayslipByPayrollId,
} = require("../models/payslipModel");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getPayslipRecords = async () => {

  return await getAllPayslips();

};


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getPayslip = async (id) => {

  const payslip =
    await getPayslipById(id);


  if (!payslip) {

    throw new Error(
      "Payslip not found"
    );

  }


  return payslip;
};


// ------------------------------------------
// CREATE
// ------------------------------------------

const generatePayslip = async (payrollId) => {

  // Check payroll
  const payroll =
    await getPayrollForPayslip(
      payrollId
    );


  if (!payroll) {

    throw new Error(
      "Payroll record not found"
    );

  }


  // Check whether payslip already exists
  const existing =
    await getPayslipByPayrollId(
      payrollId
    );


  if (existing) {

    throw new Error(
      "Payslip already exists for this payroll"
    );

  }


  // Generate payslip number
  const payslipNumber =
    `PS-${payroll.payroll_year}-${String(
      payroll.payroll_month
    ).padStart(2, "0")}-${payroll.id}`;


  // Create payslip
  const payslip =
    await createPayslip({

      payrollId,

      payslipNumber,

      generatedAt:
        new Date(),

    });


  return payslip;
};


// ------------------------------------------
// UPDATE
// ------------------------------------------

const editPayslip = async (id) => {

  const existing =
    await getPayslipById(id);


  if (!existing) {

    throw new Error(
      "Payslip not found"
    );

  }


  return await updatePayslip(id);
};


// ------------------------------------------
// DELETE
// ------------------------------------------

const removePayslip = async (id) => {

  const existing =
    await getPayslipById(id);


  if (!existing) {

    throw new Error(
      "Payslip not found"
    );

  }


  return await deletePayslip(id);
};


module.exports = {
  getPayslipRecords,
  getPayslip,
  generatePayslip,
  editPayslip,
  removePayslip,
};