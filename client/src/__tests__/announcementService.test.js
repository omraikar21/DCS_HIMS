import { describe, it, expect, vi, beforeEach } from "vitest";
import * as notificationService from "../services/notificationService";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "../services/announcementService";

vi.mock("../services/notificationService", () => ({
  getAnnouncements: vi.fn(),
  createAnnouncement: vi.fn(),
  deleteAnnouncement: vi.fn(),
}));

describe("announcementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches announcements and returns an array", async () => {
    const mockList = [{ id: 1, title: "Company Picnic", priority: "HIGH" }];
    vi.mocked(notificationService.getAnnouncements).mockResolvedValueOnce(mockList);

    const result = await getAnnouncements();
    expect(notificationService.getAnnouncements).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockList);
  });

  it("calls backend deleteAnnouncement API when deleting", async () => {
    vi.mocked(notificationService.deleteAnnouncement).mockResolvedValueOnce({ success: true, id: 42 });

    const result = await deleteAnnouncement(42);
    expect(notificationService.deleteAnnouncement).toHaveBeenCalledWith(42);
    expect(result).toEqual({ success: true, id: 42 });
  });

  it("propagates errors instead of silently swallowing them", async () => {
    vi.mocked(notificationService.deleteAnnouncement).mockRejectedValueOnce(new Error("Network Error"));

    await expect(deleteAnnouncement(99)).rejects.toThrow("Network Error");
  });

  it("transforms and sends payload when creating announcement", async () => {
    vi.mocked(notificationService.createAnnouncement).mockResolvedValueOnce({ id: 10, title: "New Policy" });

    const result = await createAnnouncement({
      title: "New Policy",
      content: "Details about remote work",
      category: "HR Policy",
      pinned: true,
    });

    expect(notificationService.createAnnouncement).toHaveBeenCalledWith(expect.objectContaining({
      title: "New Policy",
      message: "Details about remote work",
      category: "HR Policy",
      priority: "HIGH",
    }));
    expect(result).toEqual({ id: 10, title: "New Policy" });
  });
});
