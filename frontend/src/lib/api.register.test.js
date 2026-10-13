import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api.register', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('muestra el error de validación que devuelve el backend', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ rol: ['Las cuentas de supervisor las crea un administrador.'] }),
    });

    await expect(
      api.register('jefe', 'Clave123!', 'jefe@test.com', 'Jefe', 'Test', 'Clave123!', 'SUPERVISOR')
    ).rejects.toThrow('Las cuentas de supervisor las crea un administrador.');
  });

  it('usa el mensaje genérico si la respuesta no trae detalle', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    await expect(
      api.register('alumno', 'Clave123!', 'alumno@test.com', 'Alumno', 'Test', 'Clave123!')
    ).rejects.toThrow('Error al crear la cuenta. Intente con otro correo.');
  });
});
