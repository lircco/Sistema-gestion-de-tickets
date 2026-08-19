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
