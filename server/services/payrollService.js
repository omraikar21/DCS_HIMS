// ==========================================
// PAYROLL SERVICE
// B13
// ==========================================

const {
  getAllPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
} = require("../models/payrollModel");


// ------------------------------------------
// GET ALL PAYROLL
// ------------------------------------------

const getPayrollRecords = async () => {

  return await getAllPayroll();

};


// ------------------------------------------
// GET PAYROLL BY ID
// ------------------------------------------

const getPayroll = async (id) => {

  const payroll =
    await getPayrollById(id);

  if (!payroll) {

    throw new Error(
      "Payroll record not found"
    );

  }

  return payroll;

};


// ------------------------------------------
// CREATE PAYROLL
// ------------------------------------------

const addPayroll = async (payrollData) => {

  return await createPayroll(
    payrollData
  );

};


// ------------------------------------------
// UPDATE PAYROLL
// ------------------------------------------

const editPayroll = async (
  id,
  payrollData
) => {

  const existing =
    await getPayrollById(id);

  if (!existing) {

    throw new Error(
      "Payroll record not found"
    );

  }

  return await updatePayroll(
    id,
    payrollData
  );

};


// ------------------------------------------
// DELETE PAYROLL
// ------------------------------------------

const removePayroll = async (id) => {

  const existing =
    await getPayrollById(id);

  if (!existing) {

    throw new Error(
      "Payroll record not found"
    );

  }

  return await deletePayroll(id);

};


module.exports = {
  getPayrollRecords,
  getPayroll,
  addPayroll,
  editPayroll,
  removePayroll,
};