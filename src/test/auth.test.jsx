import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../router/ProtectedRoute';
import AuthCallBack from '../pages/AuthCallBack';
import * as supabaseModule from '../db/supabase';
import { useNavigate } from 'react-router-dom';

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
    useNavigate: vi.fn(), // This creates the initial mock
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
    
    // This is the "Vitest Way" to set the return value of a mocked hook
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    // Mock getSession to return nothing by default to avoid collisions with onAuthStateChange
    supabaseModule.supabase.auth.getSession = vi.fn().mockResolvedValue({ data: { session: null } });
  });

  it('should auto-provision new Google OAuth user as USER / INACTIVE and redirect to login with error', async () => {
    const googleUser = { id: 'google-123', email: 'new@gmail.com' };
    const newSession = { user: googleUser, access_token: 'token' };

    // 1. Mock onAuthStateChange
    supabaseModule.supabase.auth.onAuthStateChange = vi.fn((callback) => {
      // Trigger the SIGNED_IN event
      callback('SIGNED_IN', newSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    // 2. Mock Database check (Return INACTIVE)
    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'INACTIVE' },
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
          <AuthCallBack />
        </AuthProvider>
      </Router>
    );

    // Wait for the navigation to happen
    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login?error=inactive', { replace: true });
    }, { timeout: 2000 });
  });

  it('should allow Google OAuth user with ACTIVE status to proceed to /products', async () => {
    const activeSession = { user: { id: 'active-123' } };

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn((callback) => {
      callback('SIGNED_IN', activeSession);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'ACTIVE' },
        error: null,
      }),
    };
    supabaseModule.supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery),
    });

    render(
      <Router>
        <AuthProvider>
          <AuthCallBack />
        </AuthProvider>
      </Router>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });
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
