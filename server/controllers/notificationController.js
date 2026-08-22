// ==========================================
// NOTIFICATION & ANNOUNCEMENT CONTROLLER
// Express Handlers
// ==========================================

const {
  fetchUserNotifications,
  fetchCompanyAnnouncements,
  deployAnnouncement,
  deployFinanceNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../services/notificationService");

// ------------------------------------------
// GET LOGGED-IN USER NOTIFICATIONS
// ------------------------------------------
const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const notifications = await fetchUserNotifications(user);
    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications",
    });
  }
};

// ------------------------------------------
// GET COMPANY ANNOUNCEMENTS
// ------------------------------------------
const getAnnouncements = async (req, res) => {
  try {
    const announcements = await fetchCompanyAnnouncements();
    return res.status(200).json({
      success: true,
      message: "Announcements fetched successfully",
      data: announcements,
    });
  } catch (error) {
    console.error("Fetch announcements error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch announcements",
    });
  }
};

// ------------------------------------------
// POST ANNOUNCEMENT (HR / ADMIN)
// ------------------------------------------
const createAnnouncement = async (req, res) => {
  try {
    const { title, message, priority, category } = req.body;
    const sender = req.user;

    const result = await deployAnnouncement({
      title,
      message,
      priority,
      category,
      sender,
    });

    return res.status(201).json({
      success: true,
      message: "Company-wide announcement deployed successfully",
      data: result,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to deploy announcement",
    });
  }
};

// ------------------------------------------
// POST FINANCE NOTICE (TARGET EMPLOYEE + ADMIN COPY)
// ------------------------------------------
const sendFinanceNotice = async (req, res) => {
  try {
    const {
      title,
      message,
      targetEmail,
      targetName,
      amount,
      month,
      type,
      reportId,
      metadata,
    } = req.body;
    const sender = req.user;

    const result = await deployFinanceNotification({
      title,
      message,
      targetEmail,
      targetName,
      amount,
      month,
      sender,
      type,
      reportId,
      metadata,
    });

    return res.status(201).json({
      success: true,
      message: "Financial statement and employee notification dispatched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Send finance notice error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send finance notification",
    });
  }
};

// ------------------------------------------
// PUT MARK AS READ
// ------------------------------------------
const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await markNotificationAsRead(id);
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: updated,
    });
  } catch (error) {
    console.error("Mark read error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark notification as read",
    });
  }
};

// ------------------------------------------
// PUT MARK ALL AS READ
// ------------------------------------------
const markAllRead = async (req, res) => {
  try {
    const user = req.user;
    await markAllNotificationsAsRead(user);
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark all as read",
    });
  }
};

module.exports = {
  getNotifications,
  getAnnouncements,
  createAnnouncement,
  sendFinanceNotice,
  markRead,
  markAllRead,
};
