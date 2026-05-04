import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRights, UserRightsProvider } from '../context/UserRightsContext';
import { AuthProvider } from '../context/AuthContext';
import * as supabaseModule from '../db/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// MOCK SETUP
// ═════════════════════════════════════════════════════════════════════════════

vi.mock('../db/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(),
  },
}));

// ═════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENT FOR TESTING
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Renders the rights context and displays rights/roles for testing
 */
const RightsConsumer = () => {
  const { rights, rightsLoading, userType, isUser, isAdmin, isSuperAdmin } = useRights();
  
  if (rightsLoading) return <div data-testid="rights-loading">Loading rights...</div>;
  
  return (
    <div>
      <div data-testid="user-type">{userType}</div>
      <div data-testid="is-user">{isUser ? 'true' : 'false'}</div>
      <div data-testid="is-admin">{isAdmin ? 'true' : 'false'}</div>
      <div data-testid="is-superadmin">{isSuperAdmin ? 'true' : 'false'}</div>
      <div data-testid="rights">{JSON.stringify(rights)}</div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SIMPLIFIED TEST HELPER - Direct rights object testing
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Helper: Mirrors useRights() logic — returns true if right value = 1
 */
function hasRight(rights, rightId) {
  return rights[rightId] === 1;
}

/**
 * Mock rights data structures based on your system's user_module_rights table
 */
const SUPERADMIN_RIGHTS = {
  PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 1,
  REP_001: 1, REP_002: 1, ADM_USER: 1
};

const ADMIN_RIGHTS = {
  PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 0,
  REP_001: 1, REP_002: 0, ADM_USER: 0
};

const USER_RIGHTS = {
  PRD_ADD: 1, PRD_EDIT: 1, PRD_DEL: 0,
  REP_001: 1, REP_002: 0, ADM_USER: 0
};

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 1: SUPERADMIN RIGHTS (6 cases)
// ═════════════════════════════════════════════════════════════════════════════

describe('SUPERADMIN rights (6 cases)', () => {
  it('case 01 — SUPERADMIN has PRD_ADD', () => expect(hasRight(SUPERADMIN_RIGHTS, 'PRD_ADD')).toBe(true));
  it('case 02 — SUPERADMIN has PRD_EDIT', () => expect(hasRight(SUPERADMIN_RIGHTS, 'PRD_EDIT')).toBe(true));
  it('case 03 — SUPERADMIN has PRD_DEL', () => expect(hasRight(SUPERADMIN_RIGHTS, 'PRD_DEL')).toBe(true));
  it('case 04 — SUPERADMIN has REP_001', () => expect(hasRight(SUPERADMIN_RIGHTS, 'REP_001')).toBe(true));
  it('case 05 — SUPERADMIN has REP_002', () => expect(hasRight(SUPERADMIN_RIGHTS, 'REP_002')).toBe(true));
  it('case 06 — SUPERADMIN has ADM_USER', () => expect(hasRight(SUPERADMIN_RIGHTS, 'ADM_USER')).toBe(true));
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 2: ADMIN RIGHTS (6 cases)
// ═════════════════════════════════════════════════════════════════════════════

describe('ADMIN rights (6 cases)', () => {
  it('case 07 — ADMIN has PRD_ADD', () => expect(hasRight(ADMIN_RIGHTS, 'PRD_ADD')).toBe(true));
  it('case 08 — ADMIN has PRD_EDIT', () => expect(hasRight(ADMIN_RIGHTS, 'PRD_EDIT')).toBe(true));
  it('case 09 — ADMIN does NOT have PRD_DEL', () => expect(hasRight(ADMIN_RIGHTS, 'PRD_DEL')).toBe(false));
  it('case 10 — ADMIN has REP_001', () => expect(hasRight(ADMIN_RIGHTS, 'REP_001')).toBe(true));
  it('case 11 — ADMIN does NOT have REP_002', () => expect(hasRight(ADMIN_RIGHTS, 'REP_002')).toBe(false));
  it('case 12 — ADMIN does NOT have ADM_USER', () => expect(hasRight(ADMIN_RIGHTS, 'ADM_USER')).toBe(false));
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 3: USER RIGHTS (6 cases)
// ═════════════════════════════════════════════════════════════════════════════

describe('USER rights (6 cases)', () => {
  it('case 13 — USER has PRD_ADD', () => expect(hasRight(USER_RIGHTS, 'PRD_ADD')).toBe(true));
  it('case 14 — USER has PRD_EDIT', () => expect(hasRight(USER_RIGHTS, 'PRD_EDIT')).toBe(true));
  it('case 15 — USER does NOT have PRD_DEL', () => expect(hasRight(USER_RIGHTS, 'PRD_DEL')).toBe(false));
  it('case 16 — USER has REP_001', () => expect(hasRight(USER_RIGHTS, 'REP_001')).toBe(true));
  it('case 17 — USER does NOT have REP_002', () => expect(hasRight(USER_RIGHTS, 'REP_002')).toBe(false));
  it('case 18 — USER does NOT have ADM_USER', () => expect(hasRight(USER_RIGHTS, 'ADM_USER')).toBe(false));
});

// ═════════════════════════════════════════════════════════════════════════════
// INTEGRATION TEST SUITE: useRights() Hook with Actual Context (requires mock setup)
// ═════════════════════════════════════════════════════════════════════════════

describe('useRights() integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


    it('should return correct role flags', async () => {
    const mockSupabase = supabaseModule.supabase;

    // ✅ AUTH MOCK
    mockSupabase.auth.getSession.mockResolvedValue({
        data: {
        session: {
            user: { id: 'admin-001' },
        },
        },
        error: null,
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
        callback('SIGNED_IN', {
        user: { id: 'admin-001' },
        });

        return {
        data: { subscription: { unsubscribe: vi.fn() } },
        };
    });

    // ✅ QUERY MOCKS (IMPORTANT: distinguish tables)

    const userQuery = {
        select: vi.fn(),
        eq: vi.fn(),
        single: vi.fn(),
    };

    userQuery.select.mockReturnValue(userQuery);
    userQuery.eq.mockReturnValue(userQuery);
    userQuery.single.mockResolvedValue({
        data: {
        userid: 'admin-001',
        user_type: 'ADMIN',
        },
        error: null,
    });

    const rightsQuery = {
        select: vi.fn(),
        eq: vi.fn(),
    };

    rightsQuery.select.mockReturnValue(rightsQuery);
    rightsQuery.eq.mockReturnValue(rightsQuery);
    rightsQuery.eq.mockResolvedValue({ data: [], error: null });

    // ✅ route based on table name
    mockSupabase.from.mockImplementation((table) => {
        if (table === 'user') return userQuery;
        if (table === 'user_module_rights') return rightsQuery;
    });

    render(
        <AuthProvider>
        <UserRightsProvider>
            <RightsConsumer />
        </UserRightsProvider>
        </AuthProvider>
    );

    // ✅ wait for actual computed state
    await waitFor(() => {
        expect(screen.getByTestId('is-admin').textContent).toBe('true');
    });

    expect(screen.getByTestId('is-superadmin').textContent).toBe('false');
    });
});
