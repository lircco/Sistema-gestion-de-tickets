import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from './api';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the api module
vi.mock('./api', () => ({
  api: {
    getMe: vi.fn(),
    logout: vi.fn(),
  }
}));

// A test component to consume the context
function TestComponent() {
  const { user, isLoadingUser, logout } = useAuth();

  if (isLoadingUser) return <div>Loading...</div>;
  if (!user) return <div>No User</div>;

  return (
    <div>
      <div>User: {user.username}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('provides null user initially if no token', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // No token in localStorage, so it shouldn't load
    expect(screen.getByText('No User')).toBeDefined();
    expect(api.getMe).not.toHaveBeenCalled();
  });

  it('fetches user profile if token is present', async () => {
    localStorage.setItem('access_token', 'fake-token');
    api.getMe.mockResolvedValueOnce({ username: 'testuser' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByText('Loading...')).toBeDefined();

    // Then user is loaded
    await waitFor(() => {
      expect(screen.getByText('User: testuser')).toBeDefined();
    });
    
    expect(api.getMe).toHaveBeenCalledTimes(1);
  });

  it('clears token and sets user to null if getMe fails', async () => {
    localStorage.setItem('access_token', 'fake-token');
    api.getMe.mockRejectedValueOnce(new Error('Invalid token'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No User')).toBeDefined();
    });

    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
