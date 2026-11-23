import { useEffect, useRef } from "react";

/**
 * Ejecuta `callback` cada `intervalMs` mientras la pestaña esté visible.
 * Al volver a la pestaña (o al recuperar el foco) se ejecuta enseguida.
 * Evita solapar llamadas si una consulta tarda más que el intervalo.
 * Con `enabled = false` no hace nada.
 */
export default function usePolling(callback, intervalMs, enabled = true) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled || !intervalMs) return undefined;

    let running = false;
    const tick = async () => {
      if (running || document.visibilityState !== "visible") return;
      running = true;
      try {
        await callbackRef.current?.();
      } catch {
        // Errores en segundo plano: se reintenta en el próximo ciclo.
      } finally {
        running = false;
      }
    };

    const interval = setInterval(tick, intervalMs);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [intervalMs, enabled]);
}
