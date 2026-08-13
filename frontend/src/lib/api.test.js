import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api } from './api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('api.js', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('login should fetch token, save it to localStorage, and fetch profile', async () => {
    // Mock the first fetch (token)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access: 'fake-access', refresh: 'fake-refresh' })
    });
    // Mock the second fetch (profile)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: 'testuser' })
    });

    const result = await api.login('testuser', 'password123');
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('access_token')).toBe('fake-access');
    expect(result).toEqual({ id: 1, username: 'testuser' });
  });

  it('login should throw error on invalid credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false
    });

    await expect(api.login('wrong', 'wrong')).rejects.toThrow('Credenciales incorrectas o usuario inexistente');
  });

  it('getAreas should fetch areas with authorization header', async () => {
    localStorage.setItem('access_token', 'my-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ([{ id: 1, name: 'Sistemas' }])
    });

    const result = await api.getAreas();
    
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('areas/'), expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: 'Bearer my-token'
      })
    }));
    expect(result).toEqual([{ id: 1, name: 'Sistemas' }]);
  });

  it('createTicket should send FormData without Content-Type header', async () => {
    const formData = new FormData();
    formData.append('titulo', 'Mi ticket');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, titulo: 'Mi ticket' })
    });

    await api.createTicket(formData);

    // Verify it was called with formData
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('tickets/'), expect.objectContaining({
      body: formData
    }));
    
    // Ensure Content-Type is NOT manually set in headers for FormData
    const headersArg = mockFetch.mock.calls[0][1].headers;
    expect(headersArg).not.toHaveProperty('Content-Type');
  });

  it('logout should clear localStorage even if server call fails', async () => {
    localStorage.setItem('access_token', 'token123');
    localStorage.setItem('refresh_token', 'refresh123');
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await api.logout();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});
