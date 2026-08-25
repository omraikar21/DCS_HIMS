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
// GET COMPANY & DEPARTMENT ANNOUNCEMENTS
// ------------------------------------------
const getCompanyAnnouncements = async (user) => {
  let userDept = "";
  if (user?.id || user?.email) {
    try {
      const empRes = await pool.query(
        `SELECT d.name AS department_name FROM employees e 
         LEFT JOIN departments d ON e.department_id = d.id 
         WHERE e.user_id = $1 OR LOWER(e.email) = LOWER($2) LIMIT 1`,
        [user?.id || 0, (user?.email || "").toLowerCase().trim()]
      );
      if (empRes.rows[0]?.department_name) {
        userDept = empRes.rows[0].department_name.trim();
      }
    } catch (err) {
      console.warn("Could not query user department for announcements:", err.message);
    }
  }

  const result = await pool.query(`
    SELECT * FROM notifications 
    WHERE type = 'ANNOUNCEMENT' 
    ORDER BY created_at DESC LIMIT 50;
  `);

  if (!user || ["ADMIN", "HR"].includes((user.role || "").toUpperCase())) {
    return result.rows;
  }

  const cleanUserDept = userDept.toLowerCase().trim();
  const cleanUserEmail = (user?.email || "").toLowerCase().trim();

  return result.rows.filter((n) => {
    const targetRole = (n.target_role || "ALL").toUpperCase();
    const targetDept = (n.metadata?.target_department || "").toLowerCase().trim();
    const senderEmail = (n.sender_email || "").toLowerCase().trim();
    const audienceType = n.metadata?.audience_type || "TEAM";
    const targetUserEmail = (n.metadata?.target_user_email || n.target_email || "").toLowerCase().trim();

    // The author/sender can always see their own notice
    if (senderEmail && senderEmail === cleanUserEmail) return true;

    // Individual-targeted announcement
    if (audienceType === "INDIVIDUAL" && targetUserEmail && targetUserEmail !== "all") {
      return targetUserEmail === cleanUserEmail;
    }

    // Universal company announcements
    if (targetRole === "ALL" && !targetDept) return true;

    // Team Lead department-scoped announcements
    if (cleanUserDept && targetDept && targetDept === cleanUserDept) return true;
    if (cleanUserDept && targetRole && targetRole === cleanUserDept.toUpperCase()) return true;
    
    // Fallback: If no department is set on announcement, it is universal
    if (targetRole === "ALL") return true;

    return false;
  });
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
