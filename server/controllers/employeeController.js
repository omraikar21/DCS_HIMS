const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const {
  getEmployees,
  getEmployee,
  addEmployee,
  editEmployee,
  removeEmployee,
} = require("../services/employeeService");

const {
  getUserByEmail,
  createUser,
} = require("../models/userModel");

const {
  sendEmployeeWelcomeEmail,
} = require("../services/emailService");

const {
  getDepartmentByNameService,
} = require("../services/departmentService");

const {
  isRequired,
  isValidEmail,
  isPositiveNumber,
} = require("../utils/validation");

const {
  createAuditLog,
} = require("../models/auditModel");



// ------------------------------------------
// GET ALL EMPLOYEES
// ------------------------------------------

const getAll =
  async (req, res) => {

    try {

      const employees =
        await getEmployees();


      return res.status(200).json({

        success: true,

        count:
          employees.length,

        data:
          employees,

      });

    } catch (error) {

      console.error(
        "Get employees error:",
        error
      );


      return res.status(500).json({

        success: false,

        message:
          "Failed to fetch employees",

      });

    }

  };


// ------------------------------------------
// GET EMPLOYEE BY ID
// ------------------------------------------

const getById =
  async (req, res) => {

    try {

      const employee =
        await getEmployee(
          req.params.id
        );


      return res.status(200).json({

        success: true,

        data:
          employee,

      });

    } catch (error) {

      console.error(
        "Get employee error:",
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
// CREATE EMPLOYEE
// ------------------------------------------

const create =
  async (req, res) => {

    try {

      const {
        employeeCode,
        firstName,
        lastName,
        email,
        phone,
        departmentId,
        department,
        designation,
        joiningDate,
        salary,
        employmentStatus,
        address,
      } = req.body;


      // ------------------------------------
      // VALIDATION
      // ------------------------------------

      if (
        !isRequired(firstName) ||
        !isRequired(email) ||
        !isRequired(designation)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "First name, email and designation are required",

        });

      }


      if (
        !isValidEmail(email)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Please provide a valid email",

        });

      }


      if (
        salary !== undefined &&
        !isPositiveNumber(salary)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Salary must be a valid positive number",

        });

      }


      let resolvedDepartmentId =
        departmentId || null;

      if (
        !resolvedDepartmentId &&
        department
      ) {
        try {
          const departmentRecord =
            await getDepartmentByNameService(
              department
            );

          if (departmentRecord) {
            resolvedDepartmentId =
              departmentRecord.id;
          }
        } catch {
          resolvedDepartmentId = null;
        }
      }

      // ------------------------------------
      // CREATE EMPLOYEE
      // ------------------------------------

      const employee =
        await addEmployee({

          employeeCode,

          firstName,

          lastName,

          email: email.trim(),

          phone,

          departmentId:
            resolvedDepartmentId,

          designation,

          joiningDate:
            joiningDate || null,

          salary:
            salary || 0,

          employmentStatus:
            employmentStatus ||
            "ACTIVE",

          address,

        });


      // ------------------------------------
      // PROVISION USER ACCOUNT
      // ------------------------------------

      try {
        const trimmedEmail = email.trim().toLowerCase();
        const existingUser = await getUserByEmail(trimmedEmail);

        if (!existingUser) {
          const passwordHash = await bcrypt.hash("Employee@123", 10);
          const fullName = `${firstName || ""} ${lastName || ""}`.trim() || "Employee";

          await createUser({
            name: fullName,
            email: trimmedEmail,
            passwordHash,
            role: "EMPLOYEE",
            mustChangePassword: false,
          });
        }
      } catch (userProvisionErr) {
        console.warn("User account provisioning warning:", userProvisionErr.message);
      }


      // Record Audit Event
      createAuditLog({
        eventAction: "Employee Profile Provisioned",
        category: "EMPLOYEE",
        actorName: req.user?.name || "HR Manager",
        actorEmail: req.user?.email || "hr@dcshims.com",
        role: req.user?.role || "HR",
        details: `Provisioned ${firstName} ${lastName || ""} (${employee.employee_code || "Code Generated"}) as ${designation}.`,
        status: "SUCCESS",
      }).catch(() => {});

      return res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: employee,
      });


    } catch (error) {

      console.error(
        "Create employee error:",
        error
      );


      // PostgreSQL unique violation

      if (
        error.code === "23505"
      ) {

        return res.status(409).json({

          success: false,

          message:
            "Employee code or email already exists",

        });

      }


      return res.status(500).json({

        success: false,

        message:
          "Failed to create employee",

      });

    }

  };


// ------------------------------------------
// UPDATE EMPLOYEE
// ------------------------------------------

const update =
  async (req, res) => {

    try {

      const {
        firstName,
        lastName,
        phone,
        departmentId,
        department,
        designation,
        joiningDate,
        salary,
        employmentStatus,
        address,
      } = req.body;


      if (
        !isRequired(firstName) ||
        !isRequired(designation)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "First name and designation are required",

        });

      }


      if (
        salary !== undefined &&
        !isPositiveNumber(salary)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Salary must be a valid positive number",

        });

      }

      let resolvedDepartmentId =
        departmentId || null;

      if (
        !resolvedDepartmentId &&
        department
      ) {
        try {
          const departmentRecord =
            await getDepartmentByNameService(
              department
            );

          if (departmentRecord) {
            resolvedDepartmentId =
              departmentRecord.id;
          }
        } catch {
          resolvedDepartmentId = null;
        }
      }


      const employee =
        await editEmployee(

          req.params.id,

          {

            firstName,

            lastName,

            phone,

            departmentId:
              resolvedDepartmentId,

            designation,

            joiningDate:
              joiningDate || null,

            salary:
              salary || 0,

            employmentStatus:
              employmentStatus ||
              "ACTIVE",

            address,

          }

        );


      // Record Audit Event
      createAuditLog({
        eventAction: "Employee Profile Updated",
        category: "EMPLOYEE",
        actorName: req.user?.name || "HR Manager",
        actorEmail: req.user?.email || "hr@dcshims.com",
        role: req.user?.role || "HR",
        details: `Updated profile details for employee ${employee?.first_name || ""} ${employee?.last_name || ""} (ID: ${req.params.id}).`,
        status: "SUCCESS",
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: "Employee updated successfully",
        data: employee,
      });

    } catch (error) {

      console.error(
        "Update employee error:",
        error
      );

      return res.status(404).json({
        success: false,
        message: error.message,
      });

    }

  };


// ------------------------------------------
// DELETE EMPLOYEE
// ------------------------------------------

const remove =
  async (req, res) => {

    try {

      const employee =
        await removeEmployee(
          req.params.id
        );

      // Record Audit Event
      createAuditLog({
        eventAction: "Employee Record Removed",
        category: "EMPLOYEE",
        actorName: req.user?.name || "Administrator",
        actorEmail: req.user?.email || "admin@dcshims.com",
        role: req.user?.role || "ADMIN",
        details: `Archived/Deleted employee ID ${req.params.id}.`,
        status: "SUCCESS",
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: "Employee deleted successfully",
        data: employee,
      });


    } catch (error) {

      console.error(
        "Delete employee error:",
        error
      );


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