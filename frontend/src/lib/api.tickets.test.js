import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./api";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const pagina = (results, next) => ({
  ok: true,
  json: async () => ({ count: 0, next, previous: null, results }),
});

describe("api.getTickets", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorage.setItem("access_token", "tok");
  });

  it("recorre todas las páginas y devuelve la lista completa", async () => {
    mockFetch
      .mockResolvedValueOnce(pagina([{ id: 1 }, { id: 2 }], "http://api/tickets/?page=2"))
      .mockResolvedValueOnce(pagina([{ id: 3 }], null));

    const tickets = await api.getTickets();

    expect(tickets.map((t) => t.id)).toEqual([1, 2, 3]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toContain("tickets/?page=1&page_size=100");
    expect(mockFetch.mock.calls[1][0]).toContain("tickets/?page=2&page_size=100");
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe("Bearer tok");
  });

  it("con una sola página hace un solo pedido", async () => {
    mockFetch.mockResolvedValueOnce(pagina([{ id: 1 }], null));
    expect(await api.getTickets()).toEqual([{ id: 1 }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("acepta una respuesta sin paginar", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 7 }] });
    expect(await api.getTickets()).toEqual([{ id: 7 }]);
  });

  it("lanza un error si falla una página", async () => {
    mockFetch
      .mockResolvedValueOnce(pagina([{ id: 1 }], "http://api/tickets/?page=2"))
      .mockResolvedValueOnce({ ok: false });
    await expect(api.getTickets()).rejects.toThrow("Error al cargar los tickets");
  });
});
