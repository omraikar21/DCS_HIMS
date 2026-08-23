// ==========================================
// PAYSLIP SERVICE
// B14
// ==========================================

const {
  getAllPayslips,
  getPayslipById,
  getPayrollForPayslip,
  getPayrollByMonth,
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
// CREATE (single payslip from payrollId)
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

      employeeId: payroll.employee_id,

      payslipNumber,

      generatedAt:
        new Date(),

    });


  return payslip;
};


// ------------------------------------------
// BULK GENERATE for a full month
// Called by Finance via the "Generate" button
// Returns { generated, skipped, errors }
// ------------------------------------------

const generatePayslipsForMonth = async (month, year) => {

  const payrollRows = await getPayrollByMonth(month, year);

  if (!payrollRows || payrollRows.length === 0) {
    throw new Error(
      `No payroll records found for ${month}/${year}. Please add payroll entries first.`
    );
  }

  const generated = [];
  const skipped   = [];
  const errors    = [];

  for (const row of payrollRows) {

    // Check if payslip already exists
    const existing = await getPayslipByPayrollId(row.id);

    if (existing) {
      skipped.push({ payrollId: row.id, reason: "Payslip already exists" });
      continue;
    }

    try {

      const payslipNumber =
        `PS-${row.payroll_year}-${String(row.payroll_month).padStart(2, "0")}-${row.id}`;

      const ps = await createPayslip({
        payrollId:   row.id,
        employeeId:  row.employee_id,
        payslipNumber,
        generatedAt: new Date(),
      });

      generated.push(ps);

    } catch (err) {
      errors.push({ payrollId: row.id, error: err.message });
    }
  }

  return { generated, skipped, errors };
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
  generatePayslipsForMonth,
  editPayslip,
  removePayslip,
};