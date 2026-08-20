import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function filterTickets(tickets, query) {
  const q = query.trim().toLowerCase();
  if (!q) return tickets;
  return tickets.filter(
    (t) =>
      String(t.id).includes(q) ||
      t.titulo?.toLowerCase().includes(q) ||
      t.descripcion?.toLowerCase().includes(q)
  );
}

// Horas transcurridas entre creado_el y actualizado_el de tickets CERRADO,
// como aproximación de lead time real (el backend no tiene un timestamp
// dedicado de resolución).
export function computeAvgLeadTimeHours(tickets) {
  const cerrados = tickets.filter((t) => t.estado === "CERRADO" && t.creado_el && t.actualizado_el);
  if (cerrados.length === 0) return null;
  const totalHours = cerrados.reduce((sum, t) => {
    const hours = (new Date(t.actualizado_el) - new Date(t.creado_el)) / 3600000;
    return sum + Math.max(hours, 0);
  }, 0);
  return totalHours / cerrados.length;
}

// Lead time promedio (horas) agrupado por area_nombre, solo tickets CERRADO.
export function computeLeadTimeByArea(tickets) {
  const cerrados = tickets.filter((t) => t.estado === "CERRADO" && t.area_nombre && t.creado_el && t.actualizado_el);
  const byArea = new Map();
  for (const t of cerrados) {
    const hours = Math.max((new Date(t.actualizado_el) - new Date(t.creado_el)) / 3600000, 0);
    const entry = byArea.get(t.area_nombre) || { sum: 0, count: 0 };
    entry.sum += hours;
    entry.count += 1;
    byArea.set(t.area_nombre, entry);
  }
  return [...byArea.entries()].map(([area, { sum, count }]) => ({ area, hours: sum / count }));
}

// Distribución porcentual real de tickets por categoria_nombre.
export function computeCategoriaDistribution(tickets) {
  const total = tickets.length;
  if (total === 0) return [];
  const byCategoria = new Map();
  for (const t of tickets) {
    const cat = t.categoria_nombre || "Sin categoría";
    byCategoria.set(cat, (byCategoria.get(cat) || 0) + 1);
  }
  return [...byCategoria.entries()]
    .map(([categoria, count]) => ({ categoria, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

// Heurística real de "SLA en riesgo": tickets de prioridad ALTA que
// todavía no se cerraron (no hay un campo de deadline/SLA en el backend).
export function computeSlaEnRiesgo(tickets) {
  return tickets.filter((t) => t.prioridad === "ALTA" && t.estado !== "CERRADO").length;
}

// Porcentaje real de tickets resueltos (CERRADO) sobre el total.
export function computeResolvedRate(tickets) {
  const total = tickets.length;
  const cerrados = tickets.filter((t) => t.estado === "CERRADO").length;
  return { cerrados, total, percent: total === 0 ? 0 : Math.round((cerrados / total) * 100) };
}
