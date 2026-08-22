// ==========================================
// ONBOARDING SERVICE
// B17
// ==========================================

const {
  getAllOnboarding,
  getOnboardingById,
  getOnboardingByEmployee,
  createOnboarding,
  updateOnboarding,
  deleteOnboarding,
} = require("../models/onboardingModel");


// ------------------------------------------
// GET ALL
// ------------------------------------------

const getOnboardingRecords = async () => {

  return await getAllOnboarding();

};


// ------------------------------------------
// GET BY ID
// ------------------------------------------

const getOnboarding = async (id) => {

  const record =
    await getOnboardingById(id);

  if (!record) {

    throw new Error(
      "Onboarding record not found"
    );

  }

  return record;
};


// ------------------------------------------
// GET BY EMPLOYEE
// ------------------------------------------

const getEmployeeOnboarding = async (
  employeeId
) => {

  return await getOnboardingByEmployee(
    employeeId
  );

};


// ------------------------------------------
// CREATE
// ------------------------------------------

const addOnboarding = async (data) => {

  return await createOnboarding(data);

};


// ------------------------------------------
// UPDATE
// ------------------------------------------

const editOnboarding = async (
  id,
  data
) => {

  const existing =
    await getOnboardingById(id);

  if (!existing) {

    throw new Error(
      "Onboarding record not found"
    );

  }

  return await updateOnboarding(
    id,
    data
  );
};


// ------------------------------------------
// DELETE
// ------------------------------------------

const removeOnboarding = async (id) => {

  const existing =
    await getOnboardingById(id);

  if (!existing) {

    throw new Error(
      "Onboarding record not found"
    );

  }

  return await deleteOnboarding(id);
};


module.exports = {
  getOnboardingRecords,
  getOnboarding,
  getEmployeeOnboarding,
  addOnboarding,
  editOnboarding,
  removeOnboarding,
};