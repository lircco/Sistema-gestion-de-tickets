// Preferencia de tema (claro/oscuro). Si el usuario eligió un modo, se guarda en
// localStorage y se respeta al recargar; si no, se usa la preferencia del sistema
// operativo (prefers-color-scheme).
export const THEME_STORAGE_KEY = "themeMode";

const DARK_QUERY = "(prefers-color-scheme: dark)";

export function getStoredMode() {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export function getSystemMode() {
  try {
    return window.matchMedia?.(DARK_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function getInitialMode() {
  return getStoredMode() || getSystemMode();
}

export function storeMode(mode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Almacenamiento no disponible (modo privado, bloqueado): se ignora.
  }
}

/** Suscribe a cambios del tema del sistema. Devuelve la función para desuscribirse. */
export function onSystemModeChange(callback) {
  const mql = window.matchMedia?.(DARK_QUERY);
  if (!mql?.addEventListener) return () => {};
  const handler = (e) => callback(e.matches ? "dark" : "light");
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}
