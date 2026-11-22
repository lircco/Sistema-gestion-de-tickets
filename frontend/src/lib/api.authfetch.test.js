import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const ok = (data = {}) => ({ ok: true, json: async () => data });

describe("pedidos autenticados de api.js", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.clear();
  });

  it("sin token no manda el header Authorization", async () => {
    mockFetch.mockResolvedValueOnce(ok([]));
    await api.getAreas();
    expect(mockFetch.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("con token lo manda como Bearer", async () => {
    localStorage.setItem("access_token", "tok");
    mockFetch.mockResolvedValueOnce(ok([]));
    await api.getCategorias();
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("los objetos se envían como JSON", async () => {
    localStorage.setItem("access_token", "tok");
    mockFetch.mockResolvedValueOnce(ok());
    await api.updateTicket(3, { estado: "CERRADO" });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("tickets/3/");
    expect(init.method).toBe("PATCH");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ estado: "CERRADO" }));
  });

  it("logout limpia los tokens aunque falle el servidor", async () => {
    localStorage.setItem("access_token", "tok");
    localStorage.setItem("refresh_token", "ref");
    mockFetch.mockRejectedValueOnce(new Error("sin red"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    await api.logout();
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });
});
