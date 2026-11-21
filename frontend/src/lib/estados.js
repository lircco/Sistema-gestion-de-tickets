// Etiquetas legibles de los estados del ticket. El backend usa códigos con guión
// bajo (EN_PROGRESO) que no deben mostrarse tal cual en la interfaz.
export const ESTADO_LABELS = { ABIERTO: "Abierto", EN_PROGRESO: "En Progreso", CERRADO: "Cerrado" };

/** Devuelve la etiqueta legible de un estado; si es desconocido, lo humaniza. */
export function estadoLabel(estado) {
  if (!estado) return "";
  return ESTADO_LABELS[estado] || String(estado).replace(/_/g, " ");
}
