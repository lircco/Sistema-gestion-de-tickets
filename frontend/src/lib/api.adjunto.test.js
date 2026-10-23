import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "./api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("api.abrirAdjunto", () => {
  let ventana;

  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.setItem("access_token", "tok");
    ventana = { location: { href: "" }, close: vi.fn() };
    vi.spyOn(window, "open").mockReturnValue(ventana);
    URL.createObjectURL = vi.fn(() => "blob:adjunto");
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("descarga el adjunto con el token y lo abre en la pestaña nueva", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, blob: async () => new Blob(["x"]) });

    await api.abrirAdjunto(5);

    expect(mockFetch.mock.calls[0][0]).toContain("tickets/5/adjunto/");
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
    expect(ventana.location.href).toBe("blob:adjunto");
  });

  it("cierra la pestaña y lanza un error si el backend rechaza el pedido", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });

    await expect(api.abrirAdjunto(5)).rejects.toThrow("No se pudo abrir el adjunto");
    expect(ventana.close).toHaveBeenCalled();
  });
});
