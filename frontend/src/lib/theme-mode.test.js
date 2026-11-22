import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { THEME_STORAGE_KEY, getInitialMode, storeMode, onSystemModeChange } from "./theme-mode";

function mockMatchMedia(matches) {
  const listeners = new Set();
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
  });
  return listeners;
}

describe("theme-mode", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => window.localStorage.clear());
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("usa la preferencia del sistema si no hay nada guardado", () => {
    mockMatchMedia(true);
    expect(getInitialMode()).toBe("dark");
    mockMatchMedia(false);
    expect(getInitialMode()).toBe("light");
  });

  it("la elección guardada tiene prioridad sobre el sistema", () => {
    mockMatchMedia(true);
    storeMode("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(getInitialMode()).toBe("light");
  });

  it("ignora valores guardados inválidos", () => {
    mockMatchMedia(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, "azul");
    expect(getInitialMode()).toBe("light");
  });

  it("no rompe si localStorage no está disponible", () => {
    mockMatchMedia(true);
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("bloqueado");
    });
    expect(getInitialMode()).toBe("dark");
    spy.mockRestore();
  });

  it("notifica cambios del tema del sistema y permite desuscribirse", () => {
    const listeners = mockMatchMedia(false);
    const cb = vi.fn();
    const off = onSystemModeChange(cb);
    listeners.forEach((fn) => fn({ matches: true }));
    expect(cb).toHaveBeenCalledWith("dark");
    off();
    expect(listeners.size).toBe(0);
  });
});
