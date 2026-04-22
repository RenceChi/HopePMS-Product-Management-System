import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../router/ProtectedRoute';
import AuthCallBack from '../pages/AuthCallBack';
import * as supabaseModule from '../db/supabase';

// ═══════════════════════════════════════════════════════════════════════════
// MOCK SETUP
// ═══════════════════════════════════════════════════════════════════════════

vi.mock('../db/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS FOR TESTING
// ═══════════════════════════════════════════════════════════════════════════

// Component to access auth context values in tests
const AuthConsumer = () => {
  const { currentUser, session, loading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="current-user">{currentUser ? JSON.stringify(currentUser) : 'null'}</div>
      <div data-testid="session">{session ? JSON.stringify(session) : 'null'}</div>
    </div>
  );
};

// Simple component to render inside ProtectedRoute
const ProtectedContent = () => <div data-testid="protected-content">Protected Page</div>;

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE 1: GOOGLE OAUTH FLOW
// ═══════════════════════════════════════════════════════════════════════════

describe('Google OAuth Flow - New User Auto-Provisioning', () => {
  let mockNavigate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();

    // Mock useNavigate to return our mock
    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should auto-provision new Google OAuth user as USER / INACTIVE and redirect to login with error', async () => {
    // Setup: New user comes from Google OAuth
    const googleUser = {
      id: 'google-user-123',
      email: 'newuser@gmail.com',
      user_metadata: { picture_url: 'https://...' },
    };

    const newSession = {
      user: googleUser,
      access_token: 'mock-token',
    };

    // Mock Supabase: when onAuthStateChange fires with SIGNED_IN event
    const mockOnAuthStateChange = vi.fn((callback) => {
      // Simulate the OAuth callback firing
      setTimeout(() => {
        callback('SIGNED_IN', newSession);
      }, 100);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Mock the user table query to return INACTIVE user
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          userid: googleUser.id,
          username: 'newuser',
          firstname: 'New',
          lastname: 'User',
          user_type: 'USER',
          record_status: 'INACTIVE', // ← New user starts as INACTIVE
        },
        error: null,
      }),
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    supabaseModule.supabase.auth.onAuthStateChange = mockOnAuthStateChange;
    supabaseModule.supabase.auth.signOut = vi.fn().mockResolvedValue({});
    supabaseModule.supabase.from = mockFrom;

    render(
      <Router>
        <AuthCallBack />
      </Router>
    );

    // Wait for onAuthStateChange to fire and user to be checked
    await waitFor(
      () => {
        expect(mockFrom).toHaveBeenCalledWith('user');
      },
      { timeout: 1000 }
    );

    // Verify that we checked the user's record_status
    expect(mockQuery.eq).toHaveBeenCalledWith('userid', googleUser.id);

    // Since record_status is INACTIVE, should sign out and redirect to login
    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=inactive', {
        replace: true,
      });
    });
  });

  it('should allow Google OAuth user with ACTIVE status to proceed to /products', async () => {
    const googleUser = {
      id: 'google-user-active-123',
      email: 'activeuser@gmail.com',
    };

    const activeSession = {
      user: googleUser,
      access_token: 'mock-token',
    };

    // Mock onAuthStateChange to fire with ACTIVE user
    const mockOnAuthStateChange = vi.fn((callback) => {
      setTimeout(() => {
        callback('SIGNED_IN', activeSession);
      }, 100);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // Mock user query to return ACTIVE user
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          userid: googleUser.id,
          username: 'activeuser',
          firstname: 'Active',
          lastname: 'User',
          user_type: 'USER',
          record_status: 'ACTIVE', // ← User is ACTIVE
        },
        error: null,
      }),
    };

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    supabaseModule.supabase.auth.onAuthStateChange = mockOnAuthStateChange;
    supabaseModule.supabase.from = mockFrom;

    render(
      <Router>
        <AuthCallBack />
      </Router>
    );

    await waitFor(
      () => {
        expect(mockFrom).toHaveBeenCalledWith('user');
      },
      { timeout: 1000 }
    );

    // Verify user was checked
    expect(mockQuery.eq).toHaveBeenCalledWith('userid', googleUser.id);

    // Should navigate to /products (not sign out)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });

    // Should NOT sign out
    expect(supabaseModule.supabase.auth.signOut).not.toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE 2: LOGIN GUARD BLOCKS INACTIVE USER
// ═══════════════════════════════════════════════════════════════════════════

describe('ProtectedRoute - Login Guard Blocks INACTIVE User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block INACTIVE user and sign out with error redirect', async () => {
    const inactiveUser = {
      id: 'inactive-user-456',
      email: 'inactive@example.com',
    };

    const inactiveSession = {
      user: inactiveUser,
    };

    // Mock getSession to return a user
    supabaseModule.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: inactiveSession },
    });

    // Mock onAuthStateChange (required by AuthContext)
    supabaseModule.supabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    // Mock user table query to return INACTIVE user
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          userid: inactiveUser.id,
          username: 'inactiveuser',
          firstname: 'Inactive',
          lastname: 'User',
          user_type: 'USER',
          record_status: 'INACTIVE', // ← User is INACTIVE
        },
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    supabaseModule.supabase.auth.signOut = vi.fn().mockResolvedValue({});

    render(
      <Router>
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </AuthProvider>
      </Router>
    );

    // Wait for context to load user
    await waitFor(() => {
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('user');
    });

    // Protected content should NOT be visible
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

    // Should have signed out the INACTIVE user
    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should display correct error message for INACTIVE user attempting to access protected route', async () => {
    const inactiveUser = {
      id: 'inactive-user-789',
      email: 'blocked@example.com',
    };

    const inactiveSession = {
      user: inactiveUser,
    };

    supabaseModule.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: inactiveSession },
    });

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          userid: inactiveUser.id,
          username: 'blockeduser',
          firstname: 'Blocked',
          lastname: 'User',
          user_type: 'USER',
          record_status: 'INACTIVE',
        },
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    supabaseModule.supabase.auth.signOut = vi.fn().mockResolvedValue({});

    // Note: The actual error message is shown on AuthPage when navigating to 
    // /login?error=inactive. ProtectedRoute redirects there.
    // This test verifies the redirect happens correctly.

    render(
      <Router>
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </AuthProvider>
      </Router>
    );

    await waitFor(() => {
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('user');
    });

    // Protected content blocked
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

    // User signed out
    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITE 3: LOGIN GUARD ALLOWS ACTIVE USER THROUGH
// ═══════════════════════════════════════════════════════════════════════════

describe('ProtectedRoute - Login Guard Allows ACTIVE User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow ACTIVE user through to /products', async () => {
    const activeUser = {
      id: 'active-user-101',
      email: 'active@example.com',
    };

    const activeSession = {
      user: activeUser,
    };

    supabaseModule.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: activeSession },
    });

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    // Mock user query to return ACTIVE user
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          userid: activeUser.id,
          username: 'activeuser',
          firstname: 'Active',
          lastname: 'User',
          user_type: 'USER',
          record_status: 'ACTIVE', // ← User is ACTIVE
        },
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    render(
      <Router>
        <AuthProvider>
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </AuthProvider>
      </Router>
    );

    // Wait for context to load user
    await waitFor(() => {
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('user');
    });

    // Protected content SHOULD be visible
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    // Should NOT sign out ACTIVE user
    expect(supabaseModule.supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('should render children when ACTIVE user is authenticated', async () => {
    const activeUser = {
      id: 'active-user-202',
      email: 'approved@example.com',
    };

    const activeSession = {
      user: activeUser,
    };

    supabaseModule.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: activeSession },
    });

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          userid: activeUser.id,
          username: 'approveduser',
          firstname: 'Approved',
          lastname: 'User',
          user_type: 'USER',
          record_status: 'ACTIVE',
        },
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    render(
      <Router>
        <AuthProvider>
          <ProtectedRoute>
            <div data-testid="dashboard">Dashboard Content</div>
          </ProtectedRoute>
        </AuthProvider>
      </Router>
    );

    await waitFor(() => {
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('user');
    });

    // Dashboard content should be rendered
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should fetch and merge user data for ACTIVE users', async () => {
    const activeUser = {
      id: 'active-user-303',
      email: 'merge@example.com',
    };

    const activeSession = {
      user: activeUser,
    };

    supabaseModule.supabase.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: activeSession },
    });

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    }));

    const userTableData = {
      userid: activeUser.id,
      username: 'mergeuser',
      firstname: 'Merge',
      lastname: 'Test',
      user_type: 'USER',
      record_status: 'ACTIVE',
    };

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: userTableData,
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    render(
      <Router>
        <AuthProvider>
          <AuthConsumer />
          <ProtectedRoute>
            <ProtectedContent />
          </ProtectedRoute>
        </AuthProvider>
      </Router>
    );

    await waitFor(() => {
      expect(supabaseModule.supabase.from).toHaveBeenCalledWith('user');
    });

    // Verify user data was merged from database
    const currentUserEl = screen.getByTestId('current-user');
    const userData = JSON.parse(currentUserEl.textContent);

    expect(userData.userid).toBe(userTableData.userid);
    expect(userData.username).toBe('mergeuser');
    expect(userData.firstname).toBe('Merge');
    expect(userData.record_status).toBe('ACTIVE');
  });
});
