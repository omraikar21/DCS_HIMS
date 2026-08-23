// ==========================================
// NOTIFICATION & ANNOUNCEMENT MODEL
// PostgreSQL Data Access Layer
// ==========================================

const { pool } = require("../config/database");

// ------------------------------------------
// GET NOTIFICATIONS FOR LOGGED IN USER
// ------------------------------------------
const getNotificationsForUser = async ({ userId, email, role }) => {
  const normalizedRole = (role || "EMPLOYEE").toUpperCase();
  const normalizedEmail = (email || "").trim().toLowerCase();

  let query = `
    SELECT 
      id,
      title,
      message,
      type,
      sender_role,
      sender_name,
      sender_email,
      target_role,
      target_email,
      target_name,
      category,
      priority,
      link,
      is_read,
      metadata,
      created_at,
      updated_at
    FROM notifications
    WHERE 
      target_role = 'ALL'
      OR (LOWER(target_email) = $1 OR target_email = 'ALL')
      OR (target_user_id = $2)
  `;
  const params = [normalizedEmail, userId || 0];

  if (["ADMIN", "HR", "FINANCE"].includes(normalizedRole)) {
    query += ` OR target_role = '${normalizedRole}'`;
  }

  query += ` ORDER BY created_at DESC LIMIT 50;`;

  const result = await pool.query(query, params);
  return result.rows;
};

// ------------------------------------------
// GET COMPANY ANNOUNCEMENTS (ALL)
// ------------------------------------------
const getCompanyAnnouncements = async () => {
  const result = await pool.query(`
    SELECT * FROM notifications 
    WHERE type = 'ANNOUNCEMENT' AND target_role = 'ALL'
    ORDER BY created_at DESC LIMIT 20;
  `);
  return result.rows;
};

// ------------------------------------------
// CREATE NOTIFICATION RECORD
// ------------------------------------------
const createNotification = async (data) => {
  const {
    title,
    message,
    type = "GENERAL",
    sender_role = "SYSTEM",
    sender_name = "",
    sender_email = "",
    target_role = "ALL",
    target_user_id = null,
    target_email = "ALL",
    target_name = "",
    category = "General",
    priority = "NORMAL",
    link = "",
    metadata = {},
  } = data;

  const result = await pool.query(
    `
    INSERT INTO notifications (
      title, message, type, sender_role, sender_name, sender_email,
      target_role, target_user_id, target_email, target_name,
      category, priority, link, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
    `,
    [
      title,
      message,
      type,
      sender_role,
      sender_name,
      sender_email,
      target_role,
      target_user_id,
      target_email,
      target_name,
      category,
      priority,
      link,
      JSON.stringify(metadata),
    ]
  );
  return result.rows[0];
};

// ------------------------------------------
// MARK AS READ (SCOPED TO AUTHENTICATED USER)
// ------------------------------------------
const markAsRead = async (id, user = {}) => {
  const userId = user.id || user.userId || 0;
  const email = (user.email || "").trim().toLowerCase();
  const role = (user.role || "").toUpperCase();

  // If ADMIN or SUPER_ADMIN, allow marking any notification as read
  if (role === "ADMIN" || role === "SUPER_ADMIN" || user.is_super_admin) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *;`,
      [id]
    );
    return result.rows[0];
  }

  // Otherwise, ensure notification is targeted to ALL, or user's email/id/role
  const result = await pool.query(
    `UPDATE notifications 
     SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1 
       AND (
         target_role = 'ALL' 
         OR LOWER(target_email) = $2 
         OR target_email = 'ALL'
         OR target_user_id = $3
         OR target_role = $4
       )
     RETURNING *;`,
    [id, email, userId, role]
  );
  return result.rows[0];
};

// ------------------------------------------
// MARK ALL AS READ
// ------------------------------------------
const markAllAsRead = async (email, role) => {
  const normalizedEmail = (email || "").trim().toLowerCase();
  await pool.query(
    `UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP 
     WHERE target_role = 'ALL' OR LOWER(target_email) = $1 OR target_role = $2;`,
    [normalizedEmail, role]
  );
  return true;
};

// ------------------------------------------
// DELETE NOTIFICATION / ANNOUNCEMENT
// ------------------------------------------
const deleteNotificationById = async (id) => {
  const result = await pool.query(
    `DELETE FROM notifications WHERE id = $1 RETURNING *;`,
    [id]
  );
  return result.rows[0];
};

module.exports = {
  getNotificationsForUser,
  getCompanyAnnouncements,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotificationById,
};
