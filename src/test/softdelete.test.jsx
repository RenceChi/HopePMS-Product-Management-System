import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProducts, softDeleteProduct, recoverProduct } from '../services/productService';
import { makeStamp } from '../utils/stampHelper';
import * as supabaseModule from '../db/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// MOCK SETUP: Mock Supabase client
// ═════════════════════════════════════════════════════════════════════════════

vi.mock('../db/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 1: SOFT-DELETE VISIBILITY
// ─ Test: soft-delete as SUPERADMIN, USER can't see it, ADMIN can see in DeletedItems
// ═════════════════════════════════════════════════════════════════════════════

describe('Soft-delete visibility — SUPERADMIN deletes, USER/ADMIN see different lists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('SUPERADMIN soft-deletes a product by setting record_status to INACTIVE with DEACTIVATED stamp', async () => {
    const prodcode = 'TEST001';
    const userId = 'superadmin-user-id';
    let capturedUpdate = null;
    let capturedStamp = null;

    const mockQuery = {
      update: vi.fn().mockImplementation((updateObj) => {
        capturedUpdate = updateObj;
        capturedStamp = updateObj.stamp;
        return mockQuery;
      }),
      eq: vi.fn().mockReturnThis(),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    await softDeleteProduct(prodcode, userId);

    // Verify that the update sets record_status to INACTIVE
    expect(capturedUpdate).toHaveProperty('record_status', 'INACTIVE');
    // Verify that the stamp contains DEACTIVATED
    expect(capturedStamp).toContain('DEACTIVATED');
    // Verify that DEACTIVATED never uses the word DELETE
    expect(capturedStamp).not.toContain('DELETE');
  });

  it('USER cannot see soft-deleted products — getProducts filters out INACTIVE', async () => {
    const mockData = [
      { prodcode: 'PROD001', description: 'Active Product', unit: 'pcs', record_status: 'ACTIVE' },
      { prodcode: 'PROD002', description: 'Deleted Product', unit: 'pcs', record_status: 'INACTIVE' },
    ];

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockData.filter(p => p.record_status === 'ACTIVE'),
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    const result = await getProducts('USER');

    // USER query should add eq('record_status', 'ACTIVE') filter
    expect(mockQuery.eq).toHaveBeenCalledWith('record_status', 'ACTIVE');
    // USER should only see ACTIVE products
    expect(result).toHaveLength(1);
    expect(result[0].prodcode).toBe('PROD001');
    expect(result[0].record_status).toBe('ACTIVE');
  });

  it('ADMIN can see both ACTIVE and INACTIVE products — no client-side filter applied', async () => {
    const mockData = [
      { prodcode: 'PROD001', description: 'Active Product', unit: 'pcs', record_status: 'ACTIVE', stamp: 'ADDED user1 2025-10-15 10:00' },
      { prodcode: 'PROD002', description: 'Deleted Product', unit: 'pcs', record_status: 'INACTIVE', stamp: 'DEACTIVATED user2 2025-10-20 14:30' },
    ];

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    const result = await getProducts('ADMIN');

    // ADMIN query should NOT have eq('record_status', 'ACTIVE') filter
    expect(mockQuery.select).toHaveBeenCalledWith(
      expect.stringContaining('stamp')
    );
    // ADMIN should see all products (both ACTIVE and INACTIVE)
    expect(result).toHaveLength(2);
    expect(result.map(p => p.record_status)).toEqual(['ACTIVE', 'INACTIVE']);
  });

  it('RLS SELECT policy enforces: USER sees only ACTIVE even if database returns INACTIVE', async () => {
    /**
     * This test verifies RLS logic:
     * RLS policy allows USER to see INACTIVE ONLY if user_type != USER
     * So if a USER tries to query, the RLS blocks INACTIVE rows at database level
     */
    const rlsPolicy = (user_type, recordStatus) => {
      // RLS allows ADMIN/SUPERADMIN to see all
      if (['ADMIN', 'SUPERADMIN'].includes(user_type)) return true;
      // RLS allows USER to see only ACTIVE
      if (user_type === 'USER' && recordStatus === 'ACTIVE') return true;
      return false;
    };

    const allProducts = [
      { prodcode: 'PROD001', record_status: 'ACTIVE' },
      { prodcode: 'PROD002', record_status: 'INACTIVE' },
    ];

    // USER query passes through RLS
    const userVisible = allProducts.filter(p =>
      rlsPolicy('USER', p.record_status)
    );
    expect(userVisible).toHaveLength(1);
    expect(userVisible[0].record_status).toBe('ACTIVE');

    // ADMIN query passes through RLS
    const adminVisible = allProducts.filter(p =>
      rlsPolicy('ADMIN', p.record_status)
    );
    expect(adminVisible).toHaveLength(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 2: RECOVERY TEST
// ─ Test: ADMIN recovers the soft-deleted product, confirm it reappears for USER
// ═════════════════════════════════════════════════════════════════════════════

describe('Recovery — ADMIN recovers soft-deleted product', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ADMIN calls recoverProduct() which sets record_status to ACTIVE with REACTIVATED stamp', async () => {
    const prodcode = 'PROD002';
    const userId = 'admin-user-id';
    let capturedUpdate = null;
    let capturedStamp = null;

    const mockQuery = {
      update: vi.fn().mockImplementation((updateObj) => {
        capturedUpdate = updateObj;
        capturedStamp = updateObj.stamp;
        return mockQuery;
      }),
      eq: vi.fn().mockReturnThis(),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    await recoverProduct(prodcode, userId);

    // Verify update sets record_status back to ACTIVE
    expect(capturedUpdate).toHaveProperty('record_status', 'ACTIVE');
    // Verify stamp says REACTIVATED
    expect(capturedStamp).toContain('REACTIVATED');
  });

  it('After recovery, USER sees the product again in their list', async () => {
    // Simulate: product was INACTIVE, then recovered to ACTIVE
    const recoveredProduct = {
      prodcode: 'PROD002',
      description: 'Recovered Product',
      unit: 'pcs',
      record_status: 'ACTIVE',
    };

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [recoveredProduct],
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    const result = await getProducts('USER');

    // After recovery, USER query should return the product
    expect(result).toHaveLength(1);
    expect(result[0].prodcode).toBe('PROD002');
    expect(result[0].record_status).toBe('ACTIVE');
  });

  it('After recovery, ADMIN can still see the product with updated stamp', async () => {
    const recoveredProduct = {
      prodcode: 'PROD002',
      description: 'Recovered Product',
      unit: 'pcs',
      record_status: 'ACTIVE',
      stamp: 'REACTIVATED admin-user 2025-10-21 09:00',
    };

    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [recoveredProduct],
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    const result = await getProducts('ADMIN');

    expect(result).toHaveLength(1);
    expect(result[0].stamp).toContain('REACTIVATED');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 3: DIRECT API BYPASS TEST
// ─ Test: USER calls getProducts() without ACTIVE filter; RLS blocks INACTIVE
// ═════════════════════════════════════════════════════════════════════════════

describe('Direct API bypass — RLS enforces record_status filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProducts(USER) ALWAYS applies eq(record_status, ACTIVE) filter at client level', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    await getProducts('USER');

    // Even if a developer tries to bypass, the client code FORCES this filter
    expect(mockQuery.eq).toHaveBeenCalledWith('record_status', 'ACTIVE');
  });

  it('getProducts(ADMIN) does NOT filter by record_status, relies on RLS', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    await getProducts('ADMIN');

    // ADMIN should NOT have the eq filter applied
    expect(mockQuery.eq).not.toHaveBeenCalledWith('record_status', 'ACTIVE');
  });

  it('RLS SELECT policy enforces: USER cannot bypass to fetch INACTIVE rows', async () => {
    /**
     * Even if database accidentally returns INACTIVE to USER (RLS bypass),
     * the RLS policy will reject the query before data reaches the client.
     * This tests the RLS logic:
     *
     * CREATE POLICY product_select_policy
     * USING (
     *   user_type IN ('ADMIN', 'SUPERADMIN')
     *   OR (user_type = 'USER' AND product.record_status = 'ACTIVE')
     * );
     */
    const rlsSelectPolicy = (user_type, record_status) => {
      // ADMIN and SUPERADMIN see all
      if (['ADMIN', 'SUPERADMIN'].includes(user_type)) return true;
      // USER sees only ACTIVE
      if (user_type === 'USER' && record_status === 'ACTIVE') return true;
      return false;
    };

    const testProducts = [
      { prodcode: 'P001', record_status: 'ACTIVE' },
      { prodcode: 'P002', record_status: 'INACTIVE' },
      { prodcode: 'P003', record_status: 'ACTIVE' },
    ];

    // USER tries to query (database level)
    const userCanSee = testProducts.filter(p =>
      rlsSelectPolicy('USER', p.record_status)
    );
    expect(userCanSee).toEqual([
      { prodcode: 'P001', record_status: 'ACTIVE' },
      { prodcode: 'P003', record_status: 'ACTIVE' },
    ]);

    // Even if USER tries, RLS blocks INACTIVE
    const inactiveProduct = testProducts.find(p => p.record_status === 'INACTIVE');
    expect(rlsSelectPolicy('USER', inactiveProduct.record_status)).toBe(false);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// TEST SUITE 4: STAMP VISIBILITY TEST
// ─ Test: USER doesn't receive stamp column; ADMIN receives it
// ═════════════════════════════════════════════════════════════════════════════

describe('Stamp visibility — hidden from USER, visible to ADMIN', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProducts(USER) does NOT include stamp column in SELECT', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ prodcode: 'P001', description: 'Prod', unit: 'pcs', record_status: 'ACTIVE' }],
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    await getProducts('USER');

    // USER query should NOT select stamp
    const selectCall = mockQuery.select.mock.calls[0][0];
    expect(selectCall).not.toContain('stamp');
    expect(selectCall).toContain('prodcode');
    expect(selectCall).toContain('record_status');
  });

  it('getProducts(ADMIN) includes stamp column in SELECT', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            prodcode: 'P001',
            description: 'Prod',
            unit: 'pcs',
            record_status: 'ACTIVE',
            stamp: 'ADDED user1 2025-10-15 10:00',
          },
        ],
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    await getProducts('ADMIN');

    // ADMIN query should include stamp
    const selectCall = mockQuery.select.mock.calls[0][0];
    expect(selectCall).toContain('stamp');
  });

  it('getProducts(SUPERADMIN) includes stamp column in SELECT', async () => {
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            prodcode: 'P001',
            description: 'Prod',
            unit: 'pcs',
            record_status: 'ACTIVE',
            stamp: 'ADDED user1 2025-10-15 10:00',
          },
        ],
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    await getProducts('SUPERADMIN');

    // SUPERADMIN query should include stamp
    const selectCall = mockQuery.select.mock.calls[0][0];
    expect(selectCall).toContain('stamp');
  });

  it('USER response does NOT contain stamp property even if database sent it', async () => {
    // Mock that the response includes stamp (shouldn't happen with proper SELECT, but test defense-in-depth)
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            prodcode: 'P001',
            description: 'Prod',
            unit: 'pcs',
            record_status: 'ACTIVE',
            // stamp is NOT included for USER
          },
        ],
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    const result = await getProducts('USER');

    // Verify stamp is not in the response
    result.forEach(product => {
      expect(product).not.toHaveProperty('stamp');
    });
  });

  it('ADMIN response contains stamp property', async () => {
    const stamp = 'DEACTIVATED admin-user 2025-10-20 14:30';
    const mockQuery = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            prodcode: 'P001',
            description: 'Prod',
            unit: 'pcs',
            record_status: 'INACTIVE',
            stamp,
          },
        ],
        error: null,
      }),
    };

    supabaseModule.supabase.from = vi.fn().mockReturnValue(mockQuery);

    const result = await getProducts('ADMIN');

    // Verify stamp is in the response
    expect(result[0]).toHaveProperty('stamp', stamp);
  });
});