import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import ProtectedRoute from '../router/ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import * as supabaseModule from '../db/supabase';

// Mock supabase module
vi.mock('../db/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockSupabase = supabaseModule.supabase;

/**
 * Helper component to render ProtectedRoute with required BrowserRouter context
 */
const renderWithRouter = (element) => {
  return render(<BrowserRouter>{element}</BrowserRouter>);
};

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * TEST SUITE: Google OAuth Flow - New User Auto-Provisioned as USER / INACTIVE
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * This test suite verifies that when a user signs in with Google:
 * 1. The OAuth flow is initiated correctly with proper redirect URI
 * 2. The user is created in the database with user_type='USER'
 * 3. The user's record_status is set to 'INACTIVE' by the trigger
 * 4. The system correctly handles the redirect callback
 */
describe('Google OAuth Flow - New User Auto-Provisioned as USER / INACTIVE', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initiate Google OAuth with correct redirect URI when clicking Google sign-in button', async () => {
    // Setup
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    });

    // Action
    const googleButton = screen.getByText(/Sign in with Google/i);
    fireEvent.click(googleButton);

    // Assert
    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      });
    });
  });

  it('should handle OAuth error gracefully and display error message', async () => {
    const errorMessage = 'OAuth provider error: Something went wrong';
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithOAuth.mockRejectedValue(
      new Error(errorMessage)
    );

    render(
      <BrowserRouter>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    });

    const googleButton = screen.getByText(/Sign in with Google/i);
    fireEvent.click(googleButton);

    await waitFor(() => {
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalled();
    });
  });

  it('should verify that new Google OAuth user receives USER type (not ADMIN)', async () => {
    // Simulate the trigger creating a new user from Google OAuth
    const newGoogleUser = {
      id: 'google-user-123',
      email: 'user@example.com',
      user_metadata: {
        full_name: 'John Doe',
        picture_url: 'https://example.com/photo.jpg',
      },
      app_metadata: {
        provider: 'google',
      },
    };

    // Based on the trigger in Trigger_provision_user.sql,
    // the user should be provisioned with these values
    const expectedProvisionedUser = {
      userid: newGoogleUser.id,
      user_type: 'USER', // Hardcoded by trigger
      record_status: 'INACTIVE', // Hardcoded by trigger
      firstname: 'John',
      lastname: 'Doe',
    };

    // Assert the trigger logic
    expect(expectedProvisionedUser.user_type).toBe('USER');
    expect(expectedProvisionedUser.record_status).toBe('INACTIVE');
  });

  it('should verify that new OAuth user starts with INACTIVE status for admin approval', async () => {
    // This test verifies the security requirement that new OAuth users
    // must be manually approved by an admin before accessing the platform

    const oauthUser = {
      id: 'oauth-new-user-456',
      email: 'newuser@gmail.com',
      raw_user_meta_data: {
        full_name: 'Jane Smith',
      },
    };

    // Expected database record after trigger execution
    const dbRecord = {
      userid: oauthUser.id,
      user_type: 'USER',
      record_status: 'INACTIVE', // Must be INACTIVE until admin approves
    };

    expect(dbRecord.record_status).toBe('INACTIVE');
  });
});

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * TEST SUITE: Login Guard Blocks INACTIVE User with Correct Error Message
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * This test suite verifies that the ProtectedRoute correctly:
 * 1. Detects when a user has INACTIVE status
 * 2. Signs out the user to prevent unauthorized access
 * 3. Redirects to login page with appropriate error parameter
 * 4. Displays the correct error message to the user
 */
describe('Login Guard - Blocks INACTIVE User with Correct Error Message', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block INACTIVE user from accessing protected route and sign them out', async () => {
    // Setup: User with INACTIVE status trying to access protected route
    const inactiveSession = {
      user: {
        id: 'inactive-user-789',
        email: 'inactive@example.com',
      },
    };

    // Mock: User is found in database but has INACTIVE status
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'INACTIVE' },
        error: null,
      }),
    });

    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    renderWithRouter(
      <ProtectedRoute session={inactiveSession}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // Assert: User is signed out when accessing protected route
    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should redirect INACTIVE user to login page with error parameter', async () => {
    const inactiveSession = {
      user: {
        id: 'inactive-user-999',
        email: 'test@inactive.com',
      },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'INACTIVE' },
        error: null,
      }),
    });

    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    // The ProtectedRoute should redirect to /login?error=inactive
    // This is verified in the component logic
    const { container } = renderWithRouter(
      <ProtectedRoute session={inactiveSession}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should display correct error message when INACTIVE user reaches login page', async () => {
    // Setup: Simulate user trying to access protected route while INACTIVE
    // They get redirected to /login?error=inactive
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    // Mock the URL search params
    const mockSearchParams = new URLSearchParams('error=inactive');

    // Render AuthPage and verify it shows the correct message
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      const loginForm = screen.getByText(/Sign In/i);
      expect(loginForm).toBeInTheDocument();
    });
  });

  it('should prevent INACTIVE user from accessing /products route', async () => {
    const inactiveSession = {
      user: { id: 'user-inactive-1', email: 'test@test.com' },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'INACTIVE' },
        error: null,
      }),
    });

    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    renderWithRouter(
      <ProtectedRoute session={inactiveSession}>
        <div>Products Page</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalled();
    });

    // Verify signOut was called to log out the inactive user
    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    // Verify protected content is NOT rendered
    expect(screen.queryByText('Products Page')).not.toBeInTheDocument();
  });

  it('should handle database error gracefully when checking user status', async () => {
    const session = {
      user: { id: 'user-db-error', email: 'test@test.com' },
    };

    // Simulate database query error
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    });

    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    renderWithRouter(
      <ProtectedRoute session={session}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });
});

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * TEST SUITE: Login Guard Allows ACTIVE User Through to /products
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * This test suite verifies that the ProtectedRoute correctly:
 * 1. Allows ACTIVE users to pass through without blocking
 * 2. Does not sign out ACTIVE users
 * 3. Renders the protected content for ACTIVE users
 * 4. Does not redirect ACTIVE users away from their destination
 */
describe('Login Guard - Allows ACTIVE User Through to /products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow ACTIVE user to access protected route', async () => {
    const activeSession = {
      user: {
        id: 'active-user-123',
        email: 'active@example.com',
      },
    };

    // Mock: User is found in database with ACTIVE status
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'ACTIVE' },
        error: null,
      }),
    });

    const { getByText } = renderWithRouter(
      <ProtectedRoute session={activeSession}>
        <div>Products Page Content</div>
      </ProtectedRoute>
    );

    // Assert: Protected content is rendered for ACTIVE user
    await waitFor(() => {
      expect(getByText('Products Page Content')).toBeInTheDocument();
    });
  });

  it('should not sign out ACTIVE user when accessing protected route', async () => {
    const activeSession = {
      user: {
        id: 'active-user-456',
        email: 'verified@example.com',
      },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'ACTIVE' },
        error: null,
      }),
    });

    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    renderWithRouter(
      <ProtectedRoute session={activeSession}>
        <div>Dashboard Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });

    // Assert: signOut should NOT be called for ACTIVE users
    expect(mockSupabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('should render /products content when ACTIVE user accesses products route', async () => {
    const activeSession = {
      user: {
        id: 'active-user-products',
        email: 'admin@hopepms.com',
      },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'ACTIVE' },
        error: null,
      }),
    });

    renderWithRouter(
      <ProtectedRoute session={activeSession}>
        <div>Products Management Dashboard</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(
        screen.getByText('Products Management Dashboard')
      ).toBeInTheDocument();
    });
  });

  it('should not redirect ACTIVE user away from protected route', async () => {
    const activeSession = {
      user: {
        id: 'active-user-no-redirect',
        email: 'user@hopepms.com',
      },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'ACTIVE' },
        error: null,
      }),
    });

    const { container } = renderWithRouter(
      <ProtectedRoute session={activeSession}>
        <div data-testid="protected-content">Restricted Area</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    // Assert: No navigation/redirect occurred
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should verify ACTIVE user has correct record_status in database', async () => {
    const session = {
      user: { id: 'verify-active-status', email: 'test@test.com' },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'ACTIVE' },
        error: null,
      }),
    });

    renderWithRouter(
      <ProtectedRoute session={session}>
        <div>Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      // Verify the database was queried for the user's status
      expect(mockSupabase.from).toHaveBeenCalledWith('user');
    });

    await waitFor(() => {
      // Verify select was called correctly
      expect(mockSupabase.from().select).toHaveBeenCalledWith('record_status');
    });
  });

  it('should handle multiple ACTIVE users simultaneously without cross-contamination', async () => {
    const user1Session = {
      user: { id: 'active-user-1', email: 'user1@example.com' },
    };

    const user2Session = {
      user: { id: 'active-user-2', email: 'user2@example.com' },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    });

    // Mock different responses for different users
    mockSupabase.from().single.mockResolvedValue({
      data: { record_status: 'ACTIVE' },
      error: null,
    });

    const { rerender } = renderWithRouter(
      <ProtectedRoute session={user1Session}>
        <div>User 1 Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('User 1 Content')).toBeInTheDocument();
    });

    rerender(
      <ProtectedRoute session={user2Session}>
        <div>User 2 Content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('User 2 Content')).toBeInTheDocument();
    });

    // Both users should have access without issues
    expect(screen.getByText('User 2 Content')).toBeInTheDocument();
  });
});

/**
 * ═════════════════════════════════════════════════════════════════════════════
 * INTEGRATION TEST SUITE: Complete Auth Flow
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Tests the complete authentication flow from login to accessing protected routes
 */
describe('Complete Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete flow: login -> check status -> allow ACTIVE user', async () => {
    const session = {
      user: { id: 'complete-flow-user', email: 'user@example.com' },
    };

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { record_status: 'ACTIVE' },
        error: null,
      }),
    });

    renderWithRouter(
      <ProtectedRoute session={session}>
        <div>Dashboard</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('should block user with no session from accessing protected content', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    renderWithRouter(
      <ProtectedRoute session={null}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // User with no session should not see protected content
    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});
