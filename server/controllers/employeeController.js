const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const {
  getEmployees,
  getEmployee,
  addEmployee,
  editEmployee,
  editEmployeeCompensation,
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
  getOrCreateDepartmentService,
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
        "Get employee by id error:",
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
        firstName,
        lastName,
        email,
        phone,
        departmentId,
        department,
        designation,
        joiningDate,
        salary,
        hra,
        allowances,
        pfDeduction,
        taxDeduction,
        employmentStatus,
        bankName,
        bankAccount,
        ifscCode,
        address,
        autoCreateUser,
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
            "First name, email, and designation are required",

        });

      }


      if (!isValidEmail(email)) {

        return res.status(400).json({

          success: false,

          message:
            "Valid corporate email is required",

        });

      }


      if (
        salary !== undefined &&
        salary !== null &&
        salary !== "" &&
        !isPositiveNumber(salary)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Salary must be a positive number",

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
            await getOrCreateDepartmentService(
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

      // 1. Auto-Provision DCS Portal Login Account if requested
      let generatedPassword = null;
      let createdUserId = null;

      if (autoCreateUser !== false) {
        try {
          const existingUser = await getUserByEmail(email.trim().toLowerCase());
          if (!existingUser) {
            // Generate clean secure temp password
            const rawRandom = crypto.randomBytes(4).toString("hex");
            generatedPassword = `DCS@${rawRandom}`;
            const passwordHash = await bcrypt.hash(generatedPassword, 10);

            // Determine system role
            let userRole = "EMPLOYEE";
            const roleDesignation = (designation || "").toUpperCase();
            if (roleDesignation.includes("ADMIN")) userRole = "ADMIN";
            else if (roleDesignation.includes("HR") || roleDesignation.includes("HUMAN RESOURCE")) userRole = "HR";
            else if (roleDesignation.includes("FINANCE") || roleDesignation.includes("ACCOUNT")) userRole = "FINANCE";

            const newUser = await createUser({
              name: `${firstName} ${lastName || ""}`.trim(),
              email: email.trim().toLowerCase(),
              passwordHash,
              role: userRole,
            });

            createdUserId = newUser.id;

            // Send Welcome Email with credentials via Nodemailer
            sendEmployeeWelcomeEmail({
              employeeName: `${firstName} ${lastName || ""}`.trim(),
              employeeEmail: email.trim().toLowerCase(),
              temporaryPassword: generatedPassword,
              role: userRole,
              designation: designation || "Staff",
            }).catch((emailErr) => {
              console.warn("Welcome email async error:", emailErr.message);
            });
          } else {
            createdUserId = existingUser.id;
          }
        } catch (authErr) {
          console.warn("Auto user creation notice:", authErr.message);
        }
      }

      // ------------------------------------
      // CREATE EMPLOYEE
      // ------------------------------------

      const employee =
        await addEmployee({

          userId:
            createdUserId,

          firstName,

          lastName,

          email,

          phone,

          departmentId:
            resolvedDepartmentId,

          designation,

          joiningDate:
            joiningDate || null,

          salary:
            salary ? Number(salary) : 0,

          hra:
            hra ? Number(hra) : 0,

          allowances:
            allowances ? Number(allowances) : 0,

          pfDeduction:
            pfDeduction ? Number(pfDeduction) : 0,

          taxDeduction:
            taxDeduction ? Number(taxDeduction) : 0,

          employmentStatus:
            employmentStatus ||
            "ACTIVE",

          bankName,
          bankAccount,
          ifscCode,
          address,

        });


      // Record Audit Event
      createAuditLog({
        eventAction: "Employee Onboarded",
        category: "EMPLOYEE",
        actorName: req.user?.name || "Om Raikar",
        actorEmail: req.user?.email || "omraikar2128@gmail.com",
        role: req.user?.role || "HR",
        details: `Successfully added employee ${firstName} ${lastName || ""} (${email}) under ${designation}.`,
        status: "SUCCESS",
      }).catch(() => {});

      return res.status(201).json({

        success: true,

        message:
          "Employee created successfully",

        data:
          employee,

      });

    } catch (error) {

      console.error(
        "Create employee error:",
        error
      );


      if (
        error.message &&
        error.message.includes(
          "duplicate key"
        )
      ) {

        return res.status(409).json({

          success: false,

          message:
            "An employee with this email or code already exists",

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
        hra,
        allowances,
        pfDeduction,
        taxDeduction,
        employmentStatus,
        bankName,
        bankAccount,
        ifscCode,
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
        salary !== null &&
        salary !== "" &&
        !isPositiveNumber(salary)
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Salary must be a positive number",

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
            await getOrCreateDepartmentService(
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
              salary !== undefined ? Number(salary) : undefined,

            hra:
              hra !== undefined ? Number(hra) : undefined,

            allowances:
              allowances !== undefined ? Number(allowances) : undefined,

            pfDeduction:
              pfDeduction !== undefined ? Number(pfDeduction) : undefined,

            taxDeduction:
              taxDeduction !== undefined ? Number(taxDeduction) : undefined,

            employmentStatus:
              employmentStatus ||
              "ACTIVE",

            bankName,
            bankAccount,
            ifscCode,
            address,

          }

        );


      // Record Audit Event
      createAuditLog({
        eventAction: "Employee Profile Updated",
        category: "EMPLOYEE",
        actorName: req.user?.name || "Om Raikar",
        actorEmail: req.user?.email || "omraikar2128@gmail.com",
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
// UPDATE EMPLOYEE COMPENSATION (FINANCE & ADMIN)
// ------------------------------------------

const updateCompensation =
  async (req, res) => {
    try {
      const requesterRole = (req.user?.role || "").toUpperCase();
      const requesterEmail = (req.user?.email || "").toLowerCase().trim();

      // Check target employee
      const targetEmp = await getEmployee(req.params.id);
      if (!targetEmp) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const targetEmail = (targetEmp.email || "").toLowerCase().trim();
      const isTargetAdmin =
        targetEmail === "omraikar2128@gmail.com" ||
        (targetEmp.designation && targetEmp.designation.toLowerCase().includes("admin")) ||
        (targetEmp.designation && targetEmp.designation.toLowerCase().includes("executive")) ||
        (targetEmp.role && targetEmp.role.toUpperCase() === "ADMIN");

      // Finance can only edit HR and Employee salaries (NOT Admin)
      if (requesterRole === "FINANCE" && isTargetAdmin) {
        return res.status(403).json({
          success: false,
          message: "Finance team can only update salary structures for HR and Employees. Administrator compensation is managed solely by the Administrator.",
        });
      }

      const {
        salary = 0,
        hra = 0,
        allowances = 0,
        pfDeduction = 0,
        taxDeduction = 0,
        bankName = "",
        bankAccount = "",
        ifscCode = "",
      } = req.body;

      const employee = await editEmployeeCompensation(req.params.id, {
        salary: Number(salary) || 0,
        hra: Number(hra) || 0,
        allowances: Number(allowances) || 0,
        pfDeduction: Number(pfDeduction) || 0,
        taxDeduction: Number(taxDeduction) || 0,
        bankName,
        bankAccount,
        ifscCode,
      });

      // Record Audit Event
      createAuditLog({
        eventAction: "Employee Compensation & Salary Structure Updated",
        category: "PAYROLL",
        actorName: req.user?.name || "Finance Manager",
        actorEmail: req.user?.email || "finance@dcs.com",
        role: req.user?.role || "FINANCE",
        details: `Updated salary structure for ${employee?.first_name} ${employee?.last_name || ""} (ID: ${req.params.id}): Basic ₹${salary}, Net ₹${(Number(salary) + Number(hra) + Number(allowances) - Number(pfDeduction) - Number(taxDeduction))}.`,
        status: "SUCCESS",
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: "Employee salary structure and banking details updated successfully",
        data: employee,
      });
    } catch (error) {
      console.error("Update employee compensation error:", error);
      return res.status(404).json({
        success: false,
        message: error.message || "Failed to update compensation",
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
        actorName: req.user?.name || "Om Raikar",
        actorEmail: req.user?.email || "omraikar2128@gmail.com",
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
  updateCompensation,
  remove,
};