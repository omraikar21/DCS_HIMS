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
// GET COMPANY ANNOUNCEMENTS
// ------------------------------------------
const fetchCompanyAnnouncements = async () => {
  return await getCompanyAnnouncements();
};

// ------------------------------------------
// DEPLOY COMPANY-WIDE ANNOUNCEMENT (HR & ADMIN)
// ------------------------------------------
const deployAnnouncement = async ({ title, message, priority = "NORMAL", category = "Company Announcement", sender }) => {
  if (!title || !message) {
    throw new Error("Announcement title and message are required.");
  }

  const senderRole = (sender?.role || "ADMIN").toUpperCase();
  const senderName = sender?.name || (senderRole === "ADMIN" ? "Om Raikar (Admin)" : "Om Raikar (HR)");
  const senderEmail = sender?.email || (senderRole === "ADMIN" ? "omraikar2128@gmail.com" : "raikarom9@gmail.com");

  const createdAnnouncement = await createNotification({
    title,
    message,
    type: "ANNOUNCEMENT",
    sender_role: senderRole,
    sender_name: senderName,
    sender_email: senderEmail,
    target_role: "ALL",
    target_email: "ALL",
    category,
    priority,
    link: "/dashboard",
  });

  // Record Audit Trail
  try {
    await createAuditLog({
      action: "DEPLOY_COMPANY_ANNOUNCEMENT",
      user_id: sender?.id || null,
      user_email: senderEmail,
      user_role: senderRole,
      ip_address: "127.0.0.1",
      details: {
        announcementId: createdAnnouncement.id,
        title,
        priority,
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
// MARK AS READ
// ------------------------------------------
const markNotificationAsRead = async (id) => {
  return await markAsRead(id);
};

// ------------------------------------------
// MARK ALL AS READ
// ------------------------------------------
const markAllNotificationsAsRead = async (user) => {
  if (!user) return false;
  return await markAllAsRead(user.email, user.role);
};

module.exports = {
  fetchUserNotifications,
  fetchCompanyAnnouncements,
  deployAnnouncement,
  deployFinanceNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
