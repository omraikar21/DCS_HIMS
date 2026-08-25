// ==========================================
// USER & ROLE MANAGEMENT SERVICE
// Strict Hierarchical Access Control & Administrator Quotas
// ==========================================

const bcrypt = require("bcryptjs");
const { pool } = require("../config/database");

const {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getMiniAdminCount,
  createUser,
  updateUser,
  deleteUser,
} = require("../models/userModel");

const { createAuditLog } = require("../models/auditModel");
const { getOrCreateDepartmentService } = require("./departmentService");
const { generateDepartmentEmployeeCode } = require("../models/employeeModel");

// ------------------------------------------
// GET USERS DIRECTORY & TELEMETRY
// ------------------------------------------
const fetchUsersList = async (requester) => {
  const users = await getAllUsers();
  const coAdminCount = await getMiniAdminCount();
  const requesterRole = (requester?.role || "EMPLOYEE").toUpperCase();
  const reqEmail = (requester?.email || "").toLowerCase().trim();
  const isSuperAdmin = Boolean(
    requester?.is_super_admin ||
    reqEmail === "omraikar2128@gmail.com" ||
    reqEmail === "omraikar2128@gamil.com"
  );

  return {
    users,
    telemetry: {
      totalUsers: users.length,
      superAdminCount: 1,
      primaryAdminCount: coAdminCount,
      maxPrimaryAdmin: 1,
      canAddPrimaryAdmin: isSuperAdmin && coAdminCount < 1,
      remainingSlots: Math.max(0, 1 - coAdminCount),
    },
    permissions: {
      canAddAdmin: isSuperAdmin && coAdminCount < 1,
      canAddHR: ["ADMIN", "SUPER_ADMIN"].includes(requesterRole) || isSuperAdmin,
      canAddFinance: ["ADMIN", "SUPER_ADMIN"].includes(requesterRole) || isSuperAdmin,
      canAddTeamLead: ["ADMIN", "HR"].includes(requesterRole) || isSuperAdmin,
      canEditEmployee: ["ADMIN", "HR"].includes(requesterRole) || isSuperAdmin,
      canEditTeamLead: ["ADMIN", "HR"].includes(requesterRole) || isSuperAdmin,
      canDeleteEmployee: ["ADMIN", "HR"].includes(requesterRole) || isSuperAdmin,
      canDeleteTeamLead: ["ADMIN", "HR"].includes(requesterRole) || isSuperAdmin,
      canDeleteFinance: requesterRole === "ADMIN" || isSuperAdmin,
      canDeleteHR: requesterRole === "ADMIN" || isSuperAdmin,
      canDeleteAdmin: isSuperAdmin,
      canDeletePrimaryAdmin: false, // Permanently protected
    },
  };
};

// ------------------------------------------
// PROVISION USER ACCOUNT WITH ROLE
// ------------------------------------------
const createNewUser = async ({ name, email, role, department, departmentName, password, requester: reqInPayload }, requesterParam) => {
  const requester = requesterParam || reqInPayload;
  const cleanName = (name || "").trim();
  const cleanEmail = (email || "").trim().toLowerCase();
  const targetRole = (role || "").trim().toUpperCase();
  const requesterRole = (requester?.role || "EMPLOYEE").toUpperCase();

  if (!cleanName || !cleanEmail || !targetRole) {
    throw new Error("Full name, email address, and role are required.");
  }

  // 1. Check existing user in `users` table
  const existing = await getUserByEmail(cleanEmail);
  if (existing) {
    throw new Error(`An account with email ${cleanEmail} already exists.`);
  }

  // 2. Enforce Role Creation Hierarchy
  const reqEmailClean = (requester?.email || "").toLowerCase().trim();
  const isRequesterSuperAdmin = Boolean(
    requester?.is_super_admin ||
    reqEmailClean === "omraikar2128@gmail.com" ||
    reqEmailClean === "omraikar2128@gamil.com"
  );

  if (isRequesterSuperAdmin && targetRole !== "ADMIN") {
    throw new Error("Super Administrator can only provision Primary Administrator.");
  }

  if (targetRole === "ADMIN") {
    if (!isRequesterSuperAdmin) {
      throw new Error("Unauthorized: Only Super Admin (omraikar2128@gmail.com) can provision Primary Admin. Primary Admin cannot add administrators.");
    }
    const currentCoAdmins = await getMiniAdminCount();
    if (currentCoAdmins >= 1) {
      throw new Error("Quota exceeded: Only two administrator roles exist in the system (Super Admin & Primary Admin). Primary Admin is already provisioned.");
    }
  } else if (targetRole === "HR") {
    if (!["ADMIN", "SUPER_ADMIN"].includes(requesterRole) && !isRequesterSuperAdmin) {
      throw new Error("Unauthorized: Only Primary Admin can add HR managers.");
    }
  } else if (targetRole === "FINANCE") {
    if (!["ADMIN", "SUPER_ADMIN"].includes(requesterRole) && !isRequesterSuperAdmin) {
      throw new Error("Unauthorized: Only Primary Admin can add Finance team members.");
    }
  } else if (targetRole === "TEAM_LEAD") {
    if (!["ADMIN", "HR"].includes(requesterRole) && !isRequesterSuperAdmin) {
      throw new Error("Unauthorized: Only Primary Admin or HR managers can add Team Leads.");
    }
  } else if (targetRole === "EMPLOYEE") {
    if (!["ADMIN", "HR"].includes(requesterRole) && !isRequesterSuperAdmin) {
      throw new Error("Unauthorized: Only Primary Admin or HR managers can create employee user logins.");
    }
  } else {
    throw new Error(`Invalid user role: ${targetRole}`);
  }

  // 3. Hash Password
  const defaultPassword =
    password ||
    (targetRole === "ADMIN"
      ? "Admin@123"
      : targetRole === "HR"
      ? "HR@123"
      : targetRole === "FINANCE"
      ? "Finance@123"
      : targetRole === "TEAM_LEAD"
      ? "TeamLead@123"
      : "Employee@123");

  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 4. Create User in PostgreSQL `users` table
  const newUser = await createUser({
    name: cleanName,
    email: cleanEmail,
    passwordHash,
    role: targetRole,
    isSuperAdmin: false,
    mustChangePassword: false,
  });

  // 5. Ensure synchronized Employee Record in `employees` table with dedicated department (Except for ADMIN)
  try {
    if (targetRole === "ADMIN") {
      await pool.query("DELETE FROM employees WHERE user_id = $1 OR LOWER(email) = LOWER($2)", [newUser.id, cleanEmail]);
    } else {
      const nameParts = cleanName.split(" ");
      const firstName = nameParts[0] || cleanName;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const designation =
        targetRole === "HR"
          ? "HR Manager"
          : targetRole === "FINANCE"
          ? "Finance Executive"
          : targetRole === "TEAM_LEAD"
          ? "Team Lead"
          : "Software Engineer";

      const targetDeptName =
        departmentName ||
        department ||
        (targetRole === "HR"
          ? "Human Resources"
          : targetRole === "FINANCE"
          ? "Finance"
          : "General");

      let deptId = null;
      try {
        const deptRecord = await getOrCreateDepartmentService(targetDeptName);
        if (deptRecord) {
          deptId = deptRecord.id;
        }
      } catch (dErr) {
        console.warn("Auto-department provisioning notice:", dErr.message);
      }

      const empCheck = await pool.query(`SELECT id FROM employees WHERE email = $1`, [cleanEmail]);
      if (empCheck.rows.length === 0) {
        const empCode = await generateDepartmentEmployeeCode(deptId, designation, targetDeptName);

        await pool.query(
          `INSERT INTO employees 
          (user_id, employee_code, first_name, last_name, email, department_id, designation, joining_date, salary, employment_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 75000, 'ACTIVE')`,
          [newUser.id, empCode, firstName, lastName, cleanEmail, deptId, designation]
        );
      } else {
        await pool.query(
          `UPDATE employees SET user_id = $1, department_id = COALESCE($2, department_id), designation = $3, first_name = $4, last_name = $5 WHERE email = $6`,
          [newUser.id, deptId, designation, firstName, lastName, cleanEmail]
        );
      }

      // Synchronize team_lead_id and department_head in departments database table
      if (deptId && targetRole === "TEAM_LEAD") {
        try {
          await pool.query(`
            ALTER TABLE departments ADD COLUMN IF NOT EXISTS team_lead_id INTEGER;
            ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_head VARCHAR(150);
          `);
          await pool.query(
            `UPDATE departments 
             SET team_lead_id = $1, department_head = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 OR LOWER(TRIM(name)) = LOWER(TRIM($4))`,
            [newUser.id, cleanName, deptId, targetDeptName]
          );
        } catch (deptSyncErr) {
          console.warn("Department team lead sync notice:", deptSyncErr.message);
        }
      }
    }
  } catch (empErr) {
    console.warn("Employee sync notice:", empErr.message);
  }

  // 6. Audit Event
  try {
    await createAuditLog({
      action: "PROVISION_USER_ACCOUNT",
      user_id: requester?.id || null,
      user_email: requester?.email || "omraikar2128@gmail.com",
      user_role: requesterRole,
      ip_address: "127.0.0.1",
      details: {
        createdUserId: newUser.id,
        createdEmail: cleanEmail,
        createdRole: targetRole,
        isPrimaryAdmin: false,
      },
    });
  } catch (auditErr) {
    console.warn("User creation audit log warning:", auditErr.message);
  }

  return newUser;
};

// ------------------------------------------
// MODIFY USER
// ------------------------------------------
const modifyUser = async (id, { name, role, department, departmentName, isActive }, requester) => {
  const targetUser = await getUserById(id);
  if (!targetUser) {
    throw new Error("User not found.");
  }

  const requesterRole = (requester?.role || "EMPLOYEE").toUpperCase();
  const requesterEmail = (requester?.email || "").toLowerCase().trim();
  const targetEmail = (targetUser.email || "").toLowerCase().trim();

  const isRequesterSuper = Boolean(
    requester?.is_super_admin ||
    requesterEmail === "omraikar2128@gmail.com" ||
    requesterEmail === "omraikar2128@gamil.com"
  );

  const isTargetSuper = Boolean(
    targetUser.is_super_admin ||
    targetUser.id === 1 ||
    targetEmail === "omraikar2128@gmail.com" ||
    targetEmail === "omraikar2128@gamil.com"
  );

  const isTargetAdmin = targetUser.role === "ADMIN";

  // 1. Protect Super Admin & Primary Admin Accounts
  if (!isRequesterSuper) {
    if (isTargetSuper) {
      throw new Error("Unauthorized: Admin cannot edit or modify Super Admin data.");
    }
    if (isTargetAdmin) {
      throw new Error("Unauthorized: Only Super Admin has authority for editing/updating Primary Admin.");
    }
  }

  if (isTargetSuper) {
    if (role && role !== "ADMIN") {
      throw new Error("The Primary Administrator role cannot be demoted or altered.");
    }
    if (isActive === false) {
      throw new Error("The Primary Administrator account cannot be deactivated.");
    }
  }

  // 2. HR Permissions Enforcement (HR can edit Employee and Team Lead accounts)
  if (requesterRole === "HR") {
    if (!["EMPLOYEE", "TEAM_LEAD"].includes(targetUser.role)) {
      throw new Error("HR managers are authorized to edit Employee and Team Lead accounts only.");
    }
    if (role && !["EMPLOYEE", "TEAM_LEAD"].includes(role)) {
      throw new Error("HR managers cannot change user roles to Admin, HR, or Finance.");
    }
  }

  // 3. Administrator quota check if promoting to ADMIN
  if (role === "ADMIN" && targetUser.role !== "ADMIN") {
    if (!isRequesterSuper) {
      throw new Error("Only Super Admin can promote users to Administrator.");
    }
    const currentCoAdmins = await getMiniAdminCount();
    if (currentCoAdmins >= 1) {
      throw new Error("Quota exceeded: Only 1 Primary Admin account can exist in the system.");
    }
  }

  const updatedUser = await updateUser(id, {
    name: name !== undefined ? name.trim() : undefined,
    role: role || undefined,
    isActive: isActive !== undefined ? isActive : undefined,
  });

  // Sync with employees table
  if (name || role || department || departmentName) {
    try {
      const nameParts = (name || targetUser.name).split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");
      const newRole = role || targetUser.role;
      const designation =
        newRole === "ADMIN"
          ? "System Administrator"
          : newRole === "HR"
          ? "HR Manager"
          : newRole === "FINANCE"
          ? "Finance Executive"
          : "Software Engineer";

      const targetDeptName =
        departmentName ||
        department ||
        (newRole === "ADMIN"
          ? "Administration"
          : newRole === "HR"
          ? "Human Resources"
          : newRole === "FINANCE"
          ? "Finance"
          : "General");

      let deptId = null;
      try {
        const deptRecord = await getOrCreateDepartmentService(targetDeptName);
        if (deptRecord) {
          deptId = deptRecord.id;
        }
      } catch (dErr) {
        console.warn("Department sync notice:", dErr.message);
      }

      await pool.query(
        `UPDATE employees 
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             designation = COALESCE($3, designation),
             department_id = COALESCE($4, department_id)
         WHERE user_id = $5 OR email = $6`,
        [firstName, lastName, designation, deptId, id, targetUser.email]
      );

      // Synchronize allocated_admin, allocated_user & department_head in departments table
      if (targetDeptName) {
        const adminName = name ? name.trim() : targetUser.name;
        try {
          await pool.query(`
            ALTER TABLE departments ADD COLUMN IF NOT EXISTS allocated_admin VARCHAR(150);
            ALTER TABLE departments ADD COLUMN IF NOT EXISTS allocated_user VARCHAR(150);
            ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_head VARCHAR(150);
          `);
          await pool.query(
            `UPDATE departments 
             SET allocated_admin = $1, allocated_user = $1, department_head = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE LOWER(TRIM(name)) = LOWER(TRIM($2)) OR id = $3`,
            [adminName, targetDeptName, deptId]
          );
        } catch (deptSyncErr) {
          console.warn("Department admin sync notice:", deptSyncErr.message);
        }
      }
    } catch (empSyncErr) {
      console.warn("Employee profile sync notice:", empSyncErr.message);
    }
  }

  // Audit Event
  try {
    await createAuditLog({
      action: "UPDATE_USER_ACCOUNT",
      user_id: requester?.id || null,
      user_email: requesterEmail,
      user_role: requesterRole,
      ip_address: "127.0.0.1",
      details: {
        updatedUserId: id,
        updatedEmail: targetUser.email,
        changes: { name, role, isActive },
      },
    });
  } catch (auditErr) {
    console.warn("User update audit log warning:", auditErr.message);
  }

  return updatedUser;
};

// ------------------------------------------
// DELETE USER
// ------------------------------------------
const removeUser = async (id, requester) => {
  const targetUser = await getUserById(id);
  if (!targetUser) {
    throw new Error("User not found.");
  }

  const requesterRole = (requester?.role || "EMPLOYEE").toUpperCase();
  const requesterId = requester?.id || requester?.userId;
  const targetEmail = (targetUser.email || "").toLowerCase();

  // 1. Strict Primary Admin Protection (CANNOT BE DELETED)
  if (targetUser.is_super_admin || targetEmail === "omraikar2128@gmail.com") {
    throw new Error("The Primary Administrator account is permanent and cannot be deleted.");
  }

  // 2. Prevent self-deletion
  if (Number(targetUser.id) === Number(requesterId)) {
    throw new Error("You cannot delete your own active account.");
  }

  // 3. HR Permissions: HR can delete Employee and Team Lead accounts
  if (requesterRole === "HR") {
    if (!["EMPLOYEE", "TEAM_LEAD"].includes(targetUser.role)) {
      throw new Error("HR managers are authorized to delete Employee and Team Lead accounts only.");
    }
  } else if (requesterRole !== "ADMIN" && !isRequesterSuper) {
    throw new Error("Unauthorized. You do not have permission to delete users.");
  }

  // 4. Delete user from PostgreSQL `users` table
  const deleted = await deleteUser(id);

  // 5. Unlink from departments & delete associated employee record
  try {
    if (targetUser.name) {
      await pool.query(
        `UPDATE departments 
         SET allocated_admin = NULL, allocated_user = NULL, department_head = NULL 
         WHERE LOWER(TRIM(department_head)) = LOWER(TRIM($1)) OR LOWER(TRIM(allocated_admin)) = LOWER(TRIM($1))`,
        [targetUser.name.trim()]
      );
    }
    await pool.query("UPDATE departments SET team_lead_id = NULL WHERE team_lead_id = $1", [id]);
    await pool.query("DELETE FROM employees WHERE user_id = $1 OR LOWER(email) = LOWER($2)", [id, targetEmail]);
  } catch (empCleanErr) {
    console.warn("Employee cleanup warning:", empCleanErr.message);
  }

  // 6. Audit Event
  try {
    await createAuditLog({
      action: "DELETE_USER_ACCOUNT",
      user_id: requester?.id || null,
      user_email: requester?.email || "omraikar2128@gmail.com",
      user_role: requesterRole,
      ip_address: "127.0.0.1",
      details: {
        deletedUserId: id,
        deletedEmail: targetUser.email,
        deletedRole: targetUser.role,
      },
    });
  } catch (auditErr) {
    console.warn("User delete audit log warning:", auditErr.message);
  }

  return deleted;
};

module.exports = {
  fetchUsersList,
  createNewUser,
  createUserWithRole: createNewUser,
  modifyUser,
  removeUser,
};
