import { describe, it, expect, vi, beforeEach } from "vitest";
import { get, post, put, remove } from "../services/apiClient";

describe("apiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("adds Authorization header when token is stored", async () => {
    localStorage.setItem("token", "test-token-123");

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await get("/test");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/test"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer test-token-123",
          "Content-Type": "application/json",
        }),
        method: "GET",
      })
    );
    expect(result).toEqual({ success: true });
  });

  it("throws an error with message from API when response is not ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Unauthorized access" }),
    });

    await expect(get("/protected")).rejects.toThrow("Unauthorized access");
  });

  it("sends correct POST request with serialized JSON body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 5 }),
    });

    const result = await post("/items", { name: "Audit Entry" });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/items"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Audit Entry" }),
      })
    );
    expect(result).toEqual({ id: 5 });
  });

  it("sends correct DELETE request", async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    const result = await remove("/items/12");

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/items/12"),
      expect.objectContaining({
        method: "DELETE",
      })
    );
    expect(result).toEqual({ success: true });
  });
});
