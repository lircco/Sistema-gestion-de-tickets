import { describe, it, expect } from 'vitest';
import {
  cn,
  filterTickets,
  computeAvgLeadTimeHours,
  computeLeadTimeByArea,
  computeCategoriaDistribution,
  computeSlaEnRiesgo,
  computeResolvedRate,
} from './utils';

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

describe('computeAvgLeadTimeHours', () => {
  it('returns null when there are no closed tickets', () => {
    const tickets = [{ estado: 'ABIERTO', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-02T00:00:00Z' }];
    expect(computeAvgLeadTimeHours(tickets)).toBeNull();
  });

  it('averages the hours between creado_el and actualizado_el for closed tickets only', () => {
    const tickets = [
      { estado: 'CERRADO', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-01T10:00:00Z' }, // 10h
      { estado: 'CERRADO', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-01T20:00:00Z' }, // 20h
      { estado: 'ABIERTO', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-05T00:00:00Z' }, // ignorado
    ];
    expect(computeAvgLeadTimeHours(tickets)).toBe(15);
  });
});

describe('computeLeadTimeByArea', () => {
  it('groups average lead time hours by area_nombre, closed tickets only', () => {
    const tickets = [
      { estado: 'CERRADO', area_nombre: 'Soporte Técnico', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-01T06:00:00Z' },
      { estado: 'CERRADO', area_nombre: 'Soporte Técnico', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-01T18:00:00Z' },
      { estado: 'CERRADO', area_nombre: 'Mesa de Entradas', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-01T04:00:00Z' },
      { estado: 'ABIERTO', area_nombre: 'Mesa de Entradas', creado_el: '2026-01-01T00:00:00Z', actualizado_el: '2026-01-02T00:00:00Z' },
    ];
    expect(computeLeadTimeByArea(tickets)).toEqual([
      { area: 'Soporte Técnico', hours: 12 },
      { area: 'Mesa de Entradas', hours: 4 },
    ]);
  });
});

describe('computeCategoriaDistribution', () => {
  it('returns the percentage of tickets per categoria_nombre, sorted descending', () => {
    const tickets = [
      { categoria_nombre: 'Hardware' },
      { categoria_nombre: 'Hardware' },
      { categoria_nombre: 'Hardware' },
      { categoria_nombre: 'Redes' },
    ];
    expect(computeCategoriaDistribution(tickets)).toEqual([
      { categoria: 'Hardware', percent: 75 },
      { categoria: 'Redes', percent: 25 },
    ]);
  });

  it('returns an empty array when there are no tickets', () => {
    expect(computeCategoriaDistribution([])).toEqual([]);
  });
});

describe('computeSlaEnRiesgo', () => {
  it('counts ALTA priority tickets that are not CERRADO', () => {
    const tickets = [
      { prioridad: 'ALTA', estado: 'ABIERTO' },
      { prioridad: 'ALTA', estado: 'EN_PROGRESO' },
      { prioridad: 'ALTA', estado: 'CERRADO' },
      { prioridad: 'MEDIA', estado: 'ABIERTO' },
    ];
    expect(computeSlaEnRiesgo(tickets)).toBe(2);
  });
});

describe('computeResolvedRate', () => {
  it('computes the closed/total percentage', () => {
    const tickets = [{ estado: 'CERRADO' }, { estado: 'CERRADO' }, { estado: 'ABIERTO' }, { estado: 'EN_PROGRESO' }];
    expect(computeResolvedRate(tickets)).toEqual({ cerrados: 2, total: 4, percent: 50 });
  });

  it('handles an empty ticket list without dividing by zero', () => {
    expect(computeResolvedRate([])).toEqual({ cerrados: 0, total: 0, percent: 0 });
  });
});
