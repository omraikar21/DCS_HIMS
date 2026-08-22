// ==========================================
// NOTIFICATION & ANNOUNCEMENT CLIENT SERVICE
// Frontend API Integration
// ==========================================

import {
  get,
  post,
  put,
} from "./apiClient";

import {
  API_ENDPOINTS,
} from "./apiEndpoints";

// ------------------------------------------
// GET LOGGED IN USER NOTIFICATIONS
// ------------------------------------------
export const getNotifications = async () => {
  try {
    const response = await get(API_ENDPOINTS.notifications);
    return response.data || [];
  } catch (error) {
    console.warn("Failed to fetch notifications:", error.message);
    return [];
  }
};

// ------------------------------------------
// GET COMPANY ANNOUNCEMENTS
// ------------------------------------------
export const getAnnouncements = async () => {
  try {
    const response = await get(`${API_ENDPOINTS.notifications}/announcements`);
    return response.data || [];
  } catch (error) {
    console.warn("Failed to fetch announcements:", error.message);
    return [];
  }
};

// ------------------------------------------
// DEPLOY COMPANY ANNOUNCEMENT (HR / ADMIN)
// ------------------------------------------
export const createAnnouncement = async (announcementData) => {
  const response = await post(
    `${API_ENDPOINTS.notifications}/announcements`,
    announcementData
  );
  return response.data;
};

// ------------------------------------------
// DEPLOY FINANCE STATEMENT NOTICE (TARGET EMPLOYEE + ADMIN)
// ------------------------------------------
export const sendFinanceNotification = async (financeData) => {
  const response = await post(
    `${API_ENDPOINTS.notifications}/finance-statement`,
    financeData
  );
  return response.data;
};

// ------------------------------------------
// MARK NOTIFICATION AS READ
// ------------------------------------------
export const markNotificationRead = async (id) => {
  try {
    const response = await put(`${API_ENDPOINTS.notifications}/${id}/read`);
    return response.data;
  } catch (error) {
    console.warn("Failed to mark notification read:", error.message);
    return null;
  }
};

// ------------------------------------------
// MARK ALL AS READ
// ------------------------------------------
export const markAllNotificationsRead = async () => {
  try {
    const response = await put(`${API_ENDPOINTS.notifications}/read-all`);
    return response.success;
  } catch (error) {
    console.warn("Failed to mark all notifications read:", error.message);
    return false;
  }
};

// Compatibility Aliases
export const markAllNotificationsAsRead = markAllNotificationsRead;

export const clearAllNotifications = async () => {
  return await markAllNotificationsRead();
};

export const addNotification = async (notice) => {
  return await createAnnouncement(notice);
};
