// ==========================================
// ANNOUNCEMENT SERVICE
// Persistent announcements & broadcast to all roles
// ==========================================

import { addNotification } from "./notificationService";

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Annual DCS Technology Summit 2026",
    category: "Company Event",
    date: "August 25, 2026",
    pinned: true,
    content: "We are pleased to announce our Annual Technology Summit scheduled for August 25. All engineering and product teams will showcase their latest innovations in AI, IoT, and Cloud architecture.",
    author: "Management",
  },
  {
    id: 2,
    title: "Updated Leave and Punctuality Guidelines",
    category: "HR Policy",
    date: "August 15, 2026",
    pinned: true,
    content: "Please review the updated HR policy regarding casual and earned leave applications. All leave requests must be submitted at least 2 days in advance via the DCS-HIMS Portal.",
    author: "HR Department",
  },
  {
    id: 3,
    title: "Independence Day Celebration & Office Schedule",
    category: "Notice",
    date: "August 14, 2026",
    pinned: false,
    content: "The office will remain closed on August 15 in observance of Independence Day. Regular operations will resume on August 16.",
    author: "HR Operations",
  },
];

export const getAnnouncements = () => {
  try {
    const raw = localStorage.getItem("dcs_announcements");
    if (!raw) {
      localStorage.setItem("dcs_announcements", JSON.stringify(DEFAULT_ANNOUNCEMENTS));
      return DEFAULT_ANNOUNCEMENTS;
    }
    return JSON.parse(raw) || DEFAULT_ANNOUNCEMENTS;
  } catch {
    return DEFAULT_ANNOUNCEMENTS;
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
