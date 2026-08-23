// ==========================================
// ANNOUNCEMENT SERVICE
// Persistent announcements & broadcast to all roles
// ==========================================

import { addNotification } from "./notificationService";

export const getAnnouncements = () => {
  try {
    const raw = localStorage.getItem("dcs_announcements");
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    // Filter out legacy dummy announcements if stored previously
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (a) =>
          a.title !== "Annual DCS Technology Summit 2026" &&
          a.title !== "Updated Leave and Punctuality Guidelines" &&
          a.title !== "Independence Day Celebration & Office Schedule"
      );
    }
    return [];
  } catch {
    return [];
  }
};

export const createAnnouncement = (data) => {
  const current = getAnnouncements();
  const newNotice = {
    id: Date.now(),
    title: data.title,
    category: data.category || "Notice",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    pinned: !!data.pinned,
    content: data.content,
    author: data.author || "Management",
  };

  const updated = [newNotice, ...current];
  localStorage.setItem("dcs_announcements", JSON.stringify(updated));

  // Automatically dispatch notification across all employee and finance accounts
  addNotification({
    id: Date.now() + 1,
    type: "ANNOUNCEMENT",
    title: `📢 New Notice: ${data.title}`,
    message: `${data.content.slice(0, 95)}${data.content.length > 95 ? "..." : ""} (Published by ${newNotice.author})`,
    time: "Just now",
    read: false,
  });

  window.dispatchEvent(new Event("dcsAnnouncementsUpdated"));
  return newNotice;
};

export const deleteAnnouncement = (id) => {
  const current = getAnnouncements();
  const updated = current.filter((a) => a.id !== id);
  localStorage.setItem("dcs_announcements", JSON.stringify(updated));
  window.dispatchEvent(new Event("dcsAnnouncementsUpdated"));
  return updated;
};
