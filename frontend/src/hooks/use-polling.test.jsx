import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import usePolling from "./use-polling";

describe("usePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ejecuta el callback en cada intervalo", async () => {
    const cb = vi.fn().mockResolvedValue();
    renderHook(() => usePolling(cb, 1000));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it("no hace nada si está deshabilitado", async () => {
    const cb = vi.fn();
    renderHook(() => usePolling(cb, 1000, false));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it("no consulta con la pestaña oculta", async () => {
    Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" });
    const cb = vi.fn();
    renderHook(() => usePolling(cb, 1000));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(cb).not.toHaveBeenCalled();
  });

  it("deja de consultar al desmontarse", async () => {
    const cb = vi.fn().mockResolvedValue();
    const { unmount } = renderHook(() => usePolling(cb, 1000));
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(cb).not.toHaveBeenCalled();
  });
});
