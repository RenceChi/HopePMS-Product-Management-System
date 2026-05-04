import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import ProtectedRoute from '../router/ProtectedRoute';
import AuthCallBack from '../pages/AuthCallBack';
import * as supabaseModule from '../db/supabase';
import { useNavigate } from 'react-router-dom';

// ═══════════════════════════════════════════════════════════════
// MOCKS
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const AuthConsumer = () => {
  const { currentUser, session, loading } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="current-user">
        {currentUser ? JSON.stringify(currentUser) : 'null'}
      </div>
      <div data-testid="session">
        {session ? JSON.stringify(session) : 'null'}
      </div>
    </div>
  );
};

const ProtectedContent = () => (
  <div data-testid="protected-content">Protected Page</div>
);

// ═══════════════════════════════════════════════════════════════
// SUITE 1: GOOGLE OAUTH FLOW
// ═══════════════════════════════════════════════════════════════

describe('Google OAuth Flow', () => {
  let mockNavigate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('blocks INACTIVE OAuth user and redirects to login', async () => {
    const session = {
      user: { id: 'google-123', email: 'new@gmail.com' },
    };

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn((cb) => {
      cb('SIGNED_IN', session);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

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

    await waitFor(() => {
      expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(
        '/login?error=inactive',
        { replace: true }
      );
    });
  });

  it('allows ACTIVE OAuth user to /products', async () => {
    const session = { user: { id: 'active-123' } };

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn((cb) => {
      cb('SIGNED_IN', session);
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

// ═══════════════════════════════════════════════════════════════
// SUITE 2: PROTECTED ROUTE - INACTIVE
// ═══════════════════════════════════════════════════════════════

describe('ProtectedRoute - INACTIVE user', () => {
  let mockNavigate;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('blocks inactive user and signs out', async () => {
    const session = {
      user: { id: 'inactive-user', email: 'inactive@test.com' },
    };

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn((cb) => {
      cb('INITIAL_SESSION', session); // 🔥 critical
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

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

    supabaseModule.supabase.auth.signOut = vi.fn();

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
      expect(supabaseModule.supabase.auth.signOut).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════
// SUITE 3: PROTECTED ROUTE - ACTIVE
// ═══════════════════════════════════════════════════════════════

describe('ProtectedRoute - ACTIVE user', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders protected content', async () => {
    const session = {
      user: { id: 'active-user', email: 'active@test.com' },
    };

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn((cb) => {
      cb('INITIAL_SESSION', session);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const userData = {
      userid: session.user.id,
      username: 'activeuser',
      firstname: 'Active',
      lastname: 'User',
      user_type: 'USER',
      record_status: 'ACTIVE',
    };

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: userData,
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

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('merges DB user data correctly', async () => {
    const session = {
      user: { id: 'merge-user', email: 'merge@test.com' },
    };

    supabaseModule.supabase.auth.onAuthStateChange = vi.fn((cb) => {
      cb('INITIAL_SESSION', session);
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const userData = {
      userid: session.user.id,
      username: 'mergeuser',
      firstname: 'Merge',
      lastname: 'Test',
      user_type: 'USER',
      record_status: 'ACTIVE',
    };

    const mockQuery = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: userData,
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
        </AuthProvider>
      </Router>
    );

    await waitFor(() => {
      const user = JSON.parse(
        screen.getByTestId('current-user').textContent
      );

      expect(user.username).toBe('mergeuser');
      expect(user.record_status).toBe('ACTIVE');
    });
  });
});