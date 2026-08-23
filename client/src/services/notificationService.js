// ==========================================
// NOTIFICATION & ANNOUNCEMENT CLIENT SERVICE
// Frontend API Integration
// ==========================================

import {
  get,
  post,
  put,
  del,
} from "./apiClient";

import {
  API_ENDPOINTS,
} from "./apiEndpoints";

// ------------------------------------------
// GET LOGGED IN USER NOTIFICATIONS
// ------------------------------------------
export const getNotifications = async () => {
  const response = await get(API_ENDPOINTS.notifications);
  return response.data || [];
};

// ------------------------------------------
// GET COMPANY ANNOUNCEMENTS
// ------------------------------------------
export const getAnnouncements = async () => {
  const response = await get(`${API_ENDPOINTS.notifications}/announcements`);
  return response.data || [];
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
// DELETE COMPANY ANNOUNCEMENT (HR / ADMIN)
// ------------------------------------------
export const deleteAnnouncement = async (id) => {
  const response = await del(`${API_ENDPOINTS.notifications}/announcements/${id}`);
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
  const response = await put(`${API_ENDPOINTS.notifications}/${id}/read`);
  return response.data;
};

// ------------------------------------------
// MARK ALL AS READ
// ------------------------------------------
export const markAllNotificationsRead = async () => {
  const response = await put(`${API_ENDPOINTS.notifications}/read-all`);
  return response.success;
};

// Compatibility Aliases
export const markAllNotificationsAsRead = markAllNotificationsRead;

export const clearAllNotifications = async () => {
  return await markAllNotificationsRead();
};

export const addNotification = async (notice) => {
  return await createAnnouncement(notice);
};
