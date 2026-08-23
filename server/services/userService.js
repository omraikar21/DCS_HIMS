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

// ------------------------------------------
// GET USERS DIRECTORY & TELEMETRY
// ------------------------------------------
const fetchUsersList = async (requester) => {
  const users = await getAllUsers();
  const coAdminCount = await getMiniAdminCount();
  const requesterRole = (requester?.role || "EMPLOYEE").toUpperCase();

  return {
    users,
    telemetry: {
      totalUsers: users.length,
      primaryAdminCount: 1,
      coAdminCount,
      maxCoAdmins: 4,
      canAddCoAdmin: requesterRole === "ADMIN" && coAdminCount < 4,
      remainingSlots: Math.max(0, 4 - coAdminCount),
    },
    permissions: {
      canAddAdmin: requesterRole === "ADMIN" && coAdminCount < 4,
      canAddHR: requesterRole === "ADMIN",
      canAddFinance: ["ADMIN", "HR"].includes(requesterRole),
      canEditFinance: ["ADMIN", "HR"].includes(requesterRole),
      canDeleteFinance: ["ADMIN", "HR"].includes(requesterRole),
      canDeleteHR: requesterRole === "ADMIN",
      canDeleteAdmin: requesterRole === "ADMIN",
      canDeletePrimaryAdmin: false, // Permanently protected
    },
  };
};

// ------------------------------------------
// PROVISION USER ACCOUNT WITH ROLE
// ------------------------------------------
const createUserWithRole = async ({ name, email, role, password }, requester) => {
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
  const isRequesterSuperAdmin = Boolean(
    requester?.is_super_admin ||
    (requester?.email && requester.email.toLowerCase().trim() === "omraikar2128@gmail.com")
  );

  if (isRequesterSuperAdmin && targetRole !== "ADMIN") {
    throw new Error("Super Administrator can only provision Secondary Administrators.");
  }

  if (targetRole === "ADMIN") {
    if (requesterRole !== "ADMIN") {
      throw new Error("Unauthorized. Only administrators can create administrator accounts.");
    }
    const currentCoAdmins = await getMiniAdminCount();
    if (currentCoAdmins >= 4) {
      throw new Error("Quota exceeded. Maximum capacity of 4 additional administrators reached.");
    }
  } else if (targetRole === "HR") {
    if (requesterRole !== "ADMIN") {
      throw new Error("Unauthorized. Only administrators can add HR team members.");
    }
  } else if (targetRole === "FINANCE") {
    if (!["ADMIN", "HR"].includes(requesterRole)) {
      throw new Error("Unauthorized. Only Admin or HR managers can add Finance team members.");
    }
  } else if (targetRole === "EMPLOYEE") {
    if (!["ADMIN", "HR"].includes(requesterRole)) {
      throw new Error("Unauthorized. Only Admin or HR managers can create employee user logins.");
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

  // 5. Ensure synchronized Employee Record in `employees` table with dedicated department
  try {
    const nameParts = cleanName.split(" ");
    const firstName = nameParts[0] || cleanName;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const designation =
      targetRole === "ADMIN"
        ? "System Administrator"
        : targetRole === "HR"
        ? "HR Manager"
        : targetRole === "FINANCE"
        ? "Finance Executive"
        : "Software Engineer";

    const targetDeptName =
      targetRole === "ADMIN"
        ? "Administration"
        : targetRole === "HR"
        ? "Human Resources"
        : targetRole === "FINANCE"
        ? "Finance"
        : "General";

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
      const codeRes = await pool.query(`SELECT COUNT(*)::INTEGER AS count FROM employees`);
      const empNum = (codeRes.rows[0]?.count || 0) + 1;
      const empCode = `EMP-${String(empNum).padStart(4, "0")}`;

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
  } catch (empSyncErr) {
    console.warn("Employee profile sync notice:", empSyncErr.message);
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
const modifyUser = async (id, { name, role, isActive }, requester) => {
  const targetUser = await getUserById(id);
  if (!targetUser) {
    throw new Error("User not found.");
  }

  const requesterRole = (requester?.role || "EMPLOYEE").toUpperCase();
  const requesterEmail = (requester?.email || "").toLowerCase();
  const targetEmail = (targetUser.email || "").toLowerCase();

  // 1. Protect Primary Super Admin
  if (targetUser.is_super_admin || targetUser.id === 1 || targetEmail === "omraikar2128@gmail.com") {
    if (role && role !== "ADMIN") {
      throw new Error("The Primary Administrator role cannot be demoted or altered.");
    }
    if (isActive === false) {
      throw new Error("The Primary Administrator account cannot be deactivated.");
    }
  }

  // 2. HR Permissions Enforcement (HR can only edit Finance members)
  if (requesterRole === "HR") {
    if (targetUser.role !== "FINANCE") {
      throw new Error("HR managers are only authorized to edit Finance team members.");
    }
    if (role && role !== "FINANCE") {
      throw new Error("HR managers cannot change user roles to Admin or HR.");
    }
  }

  // 3. Administrator quota check if promoting to ADMIN
  if (role === "ADMIN" && targetUser.role !== "ADMIN") {
    if (requesterRole !== "ADMIN") {
      throw new Error("Only Admin can promote users to Administrator.");
    }
    const currentCoAdmins = await getMiniAdminCount();
    if (currentCoAdmins >= 4) {
      throw new Error("Quota exceeded. Maximum capacity of 4 additional administrators reached.");
    }
  }

  const updatedUser = await updateUser(id, {
    name: name !== undefined ? name.trim() : undefined,
    role: role || undefined,
    isActive: isActive !== undefined ? isActive : undefined,
  });

  // Sync with employees table
  if (name || role) {
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
        newRole === "ADMIN"
          ? "Administration"
          : newRole === "HR"
          ? "Human Resources"
          : newRole === "FINANCE"
          ? "Finance"
          : "General";

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

  // 3. HR Permissions: HR can only delete Finance members
  if (requesterRole === "HR") {
    if (targetUser.role !== "FINANCE") {
      throw new Error("HR managers are only authorized to delete Finance team members.");
    }
  } else if (requesterRole !== "ADMIN") {
    throw new Error("Unauthorized. You do not have permission to delete users.");
  }

  // 4. Delete user from PostgreSQL `users` table
  const deleted = await deleteUser(id);

  // 5. Clean up employee reference or mark inactive
  try {
    await pool.query(`DELETE FROM employees WHERE user_id = $1 OR email = $2`, [id, targetEmail]);
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
  modifyUser,
  removeUser,
};
