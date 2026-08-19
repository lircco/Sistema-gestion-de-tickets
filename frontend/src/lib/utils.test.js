import { describe, it, expect } from 'vitest';
import { cn, filterTickets } from './utils';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('handles conditional classes', () => {
    expect(cn('btn', true && 'active', false && 'hidden')).toBe('btn active');
  });

  it('merges tailwind classes correctly', () => {
    // twMerge logic: px-2 and px-4 should result in px-4
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('filterTickets', () => {
  const tickets = [
    { id: 1, titulo: 'No enciende la PC', descripcion: 'El equipo no prende' },
    { id: 2, titulo: 'Falla de red', descripcion: 'Sin acceso a wifi' },
    { id: 12, titulo: 'Otro ticket', descripcion: 'Sin relacion' },
  ];

  it('returns all tickets when the query is empty', () => {
    expect(filterTickets(tickets, '')).toEqual(tickets);
    expect(filterTickets(tickets, '   ')).toEqual(tickets);
  });

  it('matches by id substring', () => {
    expect(filterTickets(tickets, '12')).toEqual([tickets[2]]);
  });

  it('matches by titulo case-insensitively', () => {
    expect(filterTickets(tickets, 'RED')).toEqual([tickets[1]]);
  });

  it('matches by descripcion', () => {
    expect(filterTickets(tickets, 'wifi')).toEqual([tickets[1]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterTickets(tickets, 'inexistente')).toEqual([]);
  });
});
