// ==========================================
// NOTIFICATION & ANNOUNCEMENT SERVICE
// Business Logic & Multi-Role Dispatch
// ==========================================

const {
  getNotificationsForUser,
  getCompanyAnnouncements,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotificationById,
} = require("../models/notificationModel");

const { createAuditLog } = require("../models/auditModel");

// ------------------------------------------
// GET USER NOTIFICATIONS
// ------------------------------------------
const fetchUserNotifications = async (user) => {
  if (!user) return [];
  return await getNotificationsForUser({
    userId: user.id || user.userId,
    email: user.email,
    role: user.role,
  });
};

// ------------------------------------------
// GET COMPANY & DEPARTMENT ANNOUNCEMENTS
// ------------------------------------------
const fetchCompanyAnnouncements = async (user) => {
  return await getCompanyAnnouncements(user);
};

// ------------------------------------------
// DEPLOY ANNOUNCEMENT (HR, ADMIN & TEAM LEAD)
// ------------------------------------------
const deployAnnouncement = async ({
  title,
  message,
  priority = "NORMAL",
  category = "Company Announcement",
  sender,
  targetDepartment,
  targetUserEmail,
  targetUserName,
  targetUserId,
  audienceType = "TEAM",
  reason = "",
}) => {
  if (!title || !message) {
    throw new Error("Announcement title and message are required.");
  }

  const { pool } = require("../config/database");
  const senderRole = (sender?.role || "ADMIN").toUpperCase();
  let resolvedDept = targetDepartment || "";

  if (senderRole === "TEAM_LEAD" && !resolvedDept) {
    try {
      const empRes = await pool.query(
        `SELECT d.name AS department_name FROM employees e 
         LEFT JOIN departments d ON e.department_id = d.id 
         WHERE e.user_id = $1 OR LOWER(e.email) = LOWER($2) LIMIT 1`,
        [sender?.id || 0, (sender?.email || "").toLowerCase().trim()]
      );
      if (empRes.rows[0]?.department_name) {
        resolvedDept = empRes.rows[0].department_name.trim();
      }
    } catch (err) {
      console.warn("Could not determine team lead department:", err.message);
    }
  }

  const senderName = sender?.name 
    ? (senderRole === "TEAM_LEAD" ? `${sender.name} (${resolvedDept || "AIML"} Lead)` : sender.name)
    : (senderRole === "ADMIN" ? "Om Raikar (Admin)" : "Om Raikar (HR)");
  const senderEmail = sender?.email || "admin@dcs.com";

  const targetRole = senderRole === "TEAM_LEAD" ? (resolvedDept || "AIML") : "ALL";
  const finalCategory = senderRole === "TEAM_LEAD" ? (category || `${resolvedDept || "AIML"} Team Notice`) : category;

  const isIndividual = audienceType === "INDIVIDUAL" && targetUserEmail;
  const targetEmailVal = isIndividual ? targetUserEmail.trim().toLowerCase() : "ALL";

  const metadataObj = {
    target_department: resolvedDept || undefined,
    audience_type: isIndividual ? "INDIVIDUAL" : "TEAM",
    target_user_email: isIndividual ? targetUserEmail.trim().toLowerCase() : undefined,
    target_user_name: isIndividual ? targetUserName : undefined,
    reason: reason || undefined,
  };

  const createdAnnouncement = await createNotification({
    title,
    message,
    type: "ANNOUNCEMENT",
    sender_role: senderRole,
    sender_name: senderName,
    sender_email: senderEmail,
    target_role: targetRole,
    target_user_id: isIndividual ? (targetUserId || null) : null,
    target_email: targetEmailVal,
    target_name: isIndividual ? (targetUserName || "") : "",
    category: finalCategory,
    priority,
    link: "/dashboard",
    metadata: metadataObj,
  });

  // Record Audit Trail
  try {
    await createAuditLog({
      action: "DEPLOY_ANNOUNCEMENT",
      user_id: sender?.id || null,
      user_email: senderEmail,
      user_role: senderRole,
      ip_address: "127.0.0.1",
      details: {
        announcementId: createdAnnouncement.id,
        title,
        priority,
        targetDepartment: resolvedDept || "ALL",
        audienceType: isIndividual ? "INDIVIDUAL" : "TEAM",
        targetUser: isIndividual ? targetUserEmail : "ENTIRE_DEPT",
      },
    });
  } catch (auditErr) {
    console.warn("Announcement audit log warning:", auditErr.message);
  }

  return createdAnnouncement;
};

// ------------------------------------------
// DEPLOY FINANCE NOTICE (TARGET EMPLOYEE + EXECUTIVE ADMIN COPY)
// ------------------------------------------
const deployFinanceNotification = async ({
  title,
  message,
  targetEmail,
  targetName,
  amount,
  month,
  sender,
  type = "PAYROLL",
  reportId,
  metadata = {},
}) => {
  if (!targetEmail) {
    throw new Error("Target employee email is required for financial statements.");
  }

  const senderName = sender?.name || "Om Raikar (Finance)";
  const senderEmail = sender?.email || "omraikar14@gmail.com";
  const normalizedTargetEmail = targetEmail.trim().toLowerCase();

  // 1. Create Target Employee Notice
  const employeeNotice = await createNotification({
    title: title || `${month || "August 2026"} Salary Statement Disbursed`,
    message:
      message ||
      `Your compensation statement for ${month || "August 2026"} (${amount ? "₹" + Number(amount).toLocaleString("en-IN") : "Verified"}) has been credited.`,
    type: type,
    sender_role: "FINANCE",
    sender_name: senderName,
    sender_email: senderEmail,
    target_role: "EMPLOYEE",
    target_email: normalizedTargetEmail,
    target_name: targetName || "Employee",
    category: "Personal Compensation",
    priority: "HIGH",
    link: reportId ? `/reports?reportId=${reportId}` : "/reports?tab=my-reports",
    metadata: {
      amount,
      month,
      reportId,
      ...metadata,
    },
  });

  // 2. Automatically dispatch an Executive Financial Statement Copy to ADMIN
  let adminNotice = null;
  try {
    adminNotice = await createNotification({
      title: `Executive Financial Statement: ${targetName || normalizedTargetEmail}`,
      message: `Finance Team has released compensation statement for ${targetName || normalizedTargetEmail} (${month || "August 2026"}). Net Liability: ${amount ? "₹" + Number(amount).toLocaleString("en-IN") : "Recorded"}.`,
      type: "REPORT",
      sender_role: "FINANCE",
      sender_name: senderName,
      sender_email: senderEmail,
      target_role: "ADMIN",
      target_email: "omraikar2128@gmail.com",
      target_name: "Executive Management",
      category: "Financial Governance",
      priority: "HIGH",
      link: reportId ? `/reports?reportId=${reportId}` : "/reports?reportId=REP-PAY-02",
      metadata: {
        employeeEmail: normalizedTargetEmail,
        employeeName: targetName,
        amount,
        month,
        reportId,
      },
    });
  } catch (adminNoticeErr) {
    console.warn("Failed to create admin copy of finance notification:", adminNoticeErr.message);
  }

  // Record Audit Trail
  try {
    await createAuditLog({
      action: "DEPLOY_FINANCE_COMPENSATION_STATEMENT",
      user_id: sender?.id || null,
      user_email: senderEmail,
      user_role: "FINANCE",
      ip_address: "127.0.0.1",
      details: {
        employeeNoticeId: employeeNotice.id,
        adminNoticeId: adminNotice?.id,
        targetEmail: normalizedTargetEmail,
        amount,
        month,
      },
    });
  } catch (auditErr) {
    console.warn("Finance notification audit log warning:", auditErr.message);
  }

  return {
    employeeNotice,
    adminNotice,
  };
};

// ------------------------------------------
// MARK AS READ (SCOPED TO AUTHENTICATED USER)
// ------------------------------------------
const markNotificationAsRead = async (id, user) => {
  return await markAsRead(id, user);
};

// ------------------------------------------
// MARK ALL AS READ
// ------------------------------------------
const markAllNotificationsAsRead = async (user) => {
  if (!user) return false;
  return await markAllAsRead(user.email, user.role);
};

// ------------------------------------------
// REMOVE ANNOUNCEMENT (HR / ADMIN)
// ------------------------------------------
const removeAnnouncement = async (id, user) => {
  const deleted = await deleteNotificationById(id);
  if (!deleted) {
    throw new Error("Announcement not found or already removed.");
  }

  try {
    await createAuditLog({
      action: "DELETE_ANNOUNCEMENT",
      user_id: user?.id || null,
      user_email: user?.email || "system",
      user_role: user?.role || "ADMIN",
      ip_address: "127.0.0.1",
      details: {
        announcementId: id,
        title: deleted.title,
      },
    });
  } catch (auditErr) {
    console.warn("Delete announcement audit log warning:", auditErr.message);
  }

  return deleted;
};

module.exports = {
  fetchUserNotifications,
  fetchCompanyAnnouncements,
  deployAnnouncement,
  deployFinanceNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeAnnouncement,
};
