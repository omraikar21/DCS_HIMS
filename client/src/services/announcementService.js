// ==========================================
// ANNOUNCEMENT SERVICE
// Persistent PostgreSQL announcements & broadcast to all roles
// ==========================================

import {
  getAnnouncements as fetchAnnouncementsApi,
  createAnnouncement as createAnnouncementApi,
  deleteAnnouncement as deleteAnnouncementApi,
} from "./notificationService";

export const getAnnouncements = async () => {
  const data = await fetchAnnouncementsApi();
  return Array.isArray(data) ? data : [];
};

export const createAnnouncement = async (data) => {
  const payload = {
    title: data.title,
    message: data.content || data.message || "",
    category: data.category || "Notice",
    priority: data.pinned ? "HIGH" : "NORMAL",
  };

  const created = await createAnnouncementApi(payload);
  window.dispatchEvent(new Event("dcsAnnouncementsUpdated"));
  return created;
};

export const deleteAnnouncement = async (id) => {
  const deleted = await deleteAnnouncementApi(id);
  window.dispatchEvent(new Event("dcsAnnouncementsUpdated"));
  return deleted;
};

