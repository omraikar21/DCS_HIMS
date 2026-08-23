const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { getUserByEmail, createUser } = require("../models/userModel");
const { sendEmployeeWelcomeEmail } = require("./emailService");

const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeCompensation,
  deleteEmployee,
} = require("../models/employeeModel");

// ------------------------------------------
// PROVISION EMPLOYEE USER ACCOUNT (DCS PORTAL)
// ------------------------------------------
const provisionEmployeeAccount = async ({
  firstName,
  lastName,
  email,
  designation,
  autoCreateUser = true,
}) => {
  if (autoCreateUser === false || !email) {
    return { userId: null, generatedPassword: null, userRole: null };
  }

  const trimmedEmail = email.trim().toLowerCase();
  const existingUser = await getUserByEmail(trimmedEmail);

  if (existingUser) {
    return {
      userId: existingUser.id,
      generatedPassword: null,
      userRole: existingUser.role,
      isExisting: true,
    };
  }

  // Generate temporary password
  const rawRandom = crypto.randomBytes(4).toString("hex");
  const generatedPassword = `DCS@${rawRandom}`;
  const passwordHash = await bcrypt.hash(generatedPassword, 10);

  // Determine system role from designation
  let userRole = "EMPLOYEE";
  const roleDesignation = (designation || "").toUpperCase();
  if (roleDesignation.includes("ADMIN")) userRole = "ADMIN";
  else if (roleDesignation.includes("HR") || roleDesignation.includes("HUMAN RESOURCE")) userRole = "HR";
  else if (roleDesignation.includes("FINANCE") || roleDesignation.includes("ACCOUNT")) userRole = "FINANCE";

  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Employee";

  const newUser = await createUser({
    name: fullName,
    email: trimmedEmail,
    passwordHash,
    role: userRole,
  });

  // Dispatch Welcome Email asynchronously
  sendEmployeeWelcomeEmail({
    employeeName: fullName,
    employeeEmail: trimmedEmail,
    temporaryPassword: generatedPassword,
    role: userRole,
    designation: designation || "Staff",
  }).catch((emailErr) => {
    console.warn("Welcome email dispatch notice:", emailErr.message);
  });

  return {
    userId: newUser.id,
    generatedPassword,
    userRole,
    isExisting: false,
  };
};

// ------------------------------------------
// GET ALL EMPLOYEES
// ------------------------------------------

const getEmployees =
  async () => {

    return await getAllEmployees();

  };


// ------------------------------------------
// GET EMPLOYEE BY ID
// ------------------------------------------

const getEmployee =
  async (id) => {

    const employee =
      await getEmployeeById(id);


    if (!employee) {

      throw new Error(
        "Employee not found"
      );

    }


    return employee;

  };


// ------------------------------------------
// CREATE EMPLOYEE
// ------------------------------------------

const addEmployee =
  async (employeeData) => {

    const employee =
      await createEmployee(
        employeeData
      );


    return employee;

  };


// ------------------------------------------
// UPDATE EMPLOYEE
// ------------------------------------------

const editEmployee =
  async (
    id,
    employeeData
  ) => {

    const existing =
      await getEmployeeById(id);


    if (!existing) {

      throw new Error(
        "Employee not found"
      );

    }


    const employee =
      await updateEmployee(
        id,
        employeeData
      );


    return employee;

  };

// ------------------------------------------
// UPDATE EMPLOYEE COMPENSATION (FINANCE & ADMIN)
// ------------------------------------------

const editEmployeeCompensation =
  async (
    id,
    compensationData
  ) => {

    const existing =
      await getEmployeeById(id);

    if (!existing) {
      throw new Error(
        "Employee not found"
      );
    }

    const employee =
      await updateEmployeeCompensation(
        id,
        compensationData
      );

    return employee;
  };


// ------------------------------------------
// DELETE EMPLOYEE
// ------------------------------------------

const removeEmployee =
  async (id) => {

    const existing =
      await getEmployeeById(id);


    if (!existing) {

      throw new Error(
        "Employee not found"
      );

    }


    const employee =
      await deleteEmployee(id);


    return employee;

  };


module.exports = {
  provisionEmployeeAccount,
  getEmployees,
  getEmployee,
  addEmployee,
  editEmployee,
  editEmployeeCompensation,
  removeEmployee,
};