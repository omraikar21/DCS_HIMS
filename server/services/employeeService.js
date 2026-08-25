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
// DELETE EMPLOYEE & CASCADE CONNECTED TABLES
// ------------------------------------------

const removeEmployee = async (id) => {
  const existing = await getEmployeeById(id);
  if (!existing) {
    throw new Error("Employee not found");
  }

  const { pool } = require("../config/database");

  // 1. Delete associated user login account from users table
  if (existing.user_id || existing.email) {
    try {
      await pool.query(
        "DELETE FROM users WHERE id = $1 OR LOWER(email) = LOWER($2)",
        [existing.user_id || -1, (existing.email || "").toLowerCase().trim()]
      );
    } catch (uErr) {
      console.warn("Associated user account deletion notice:", uErr.message);
    }
  }

  // 2. Clear department team lead and department head references
  try {
    const fullName = `${existing.first_name || ""} ${existing.last_name || ""}`.trim();
    if (existing.user_id) {
      await pool.query("UPDATE departments SET team_lead_id = NULL WHERE team_lead_id = $1", [existing.user_id]);
    }
    if (fullName) {
      await pool.query(
        `UPDATE departments 
         SET allocated_admin = NULL, allocated_user = NULL, department_head = NULL 
         WHERE LOWER(TRIM(department_head)) = LOWER(TRIM($1)) OR LOWER(TRIM(allocated_admin)) = LOWER(TRIM($1))`,
        [fullName]
      );
    }
  } catch (dErr) {
    console.warn("Department unlinking notice:", dErr.message);
  }

  // 3. Delete employee record (attendance, leaves, payroll cascade via FK)
  const employee = await deleteEmployee(id);
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