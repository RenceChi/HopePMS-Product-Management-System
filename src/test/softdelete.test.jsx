import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getProducts, softDeleteProduct, recoverProduct } from '../services/productService';
import * as supabaseModule from '../db/supabase';

// ═════════════════════════════════════════════════════════════════════════════
// MOCK SETUP
// ═════════════════════════════════════════════════════════════════════════════

vi.mock('../db/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Product Service - Full Test Suite', () => {
  let mockQuery;

  beforeEach(() => {
    vi.clearAllMocks();

    
    mockQuery = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      // Simulates the resolution of the "thenable" Supabase query
      then: vi.fn().mockImplementation((onFulfilled) => {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled);
      }),
    };

    supabaseModule.supabase.from.mockReturnValue(mockQuery);
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 1: VISIBILITY & SOFT-DELETE
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Soft-delete visibility', () => {
    it('SUPERADMIN soft-deletes a product by setting record_status to INACTIVE', async () => {
      await softDeleteProduct('TEST001', 'super-id');

      expect(mockQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        record_status: 'INACTIVE',
        stamp: expect.stringContaining('DEACTIVATED')
      }));
      expect(mockQuery.eq).toHaveBeenCalledWith('prodcode', 'TEST001');
    });

    it('USER cannot see soft-deleted products — applies ACTIVE filter in query', async () => {
      await getProducts('USER');
      // This validates that your 'if (userType === "USER")' logic is hit
      expect(mockQuery.eq).toHaveBeenCalledWith('record_status', 'ACTIVE');
    });

    it('ADMIN can see both ACTIVE and INACTIVE — no status filter applied', async () => {
      await getProducts('ADMIN');
      // ADMIN should see all, so .eq('record_status', 'ACTIVE') should NOT be called
      expect(mockQuery.eq).not.toHaveBeenCalledWith('record_status', 'ACTIVE');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 2: STAMP VISIBILITY (COLUMN FILTERING)
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Stamp column visibility', () => {
    it('getProducts(USER) does NOT request stamp column from database', async () => {
      await getProducts('USER');
      const selectCall = mockQuery.select.mock.calls[0][0];
      expect(selectCall).not.toContain('stamp');
    });

    it('getProducts(ADMIN) requests the stamp column', async () => {
      await getProducts('ADMIN');
      const selectCall = mockQuery.select.mock.calls[0][0];
      expect(selectCall).toContain('stamp');
    });

    it('USER response matches what the database returns (no manual stripping)', async () => {

  const dbData = [{ prodcode: 'P1', record_status: 'ACTIVE' }];
  
  mockQuery.then.mockImplementation((onFulfilled) => {
    return Promise.resolve({ 
      data: dbData, 
      error: null 
    }).then(onFulfilled);
  });

  const result = await getProducts('USER');
  
  // Verify data is passed through
  expect(result).toEqual(dbData);
  
  // The logic that PROTECTS the stamp is actually here:
  const selectCall = mockQuery.select.mock.calls[0][0];
  expect(selectCall).not.toContain('stamp');
});
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 3: RECOVERY
  // ═════════════════════════════════════════════════════════════════════════════

  describe('Recovery logic', () => {
    it('ADMIN recovers the product by setting status to ACTIVE with REACTIVATED stamp', async () => {
      await recoverProduct('PROD002', 'admin-id');

      expect(mockQuery.update).toHaveBeenCalledWith(expect.objectContaining({
        record_status: 'ACTIVE',
        stamp: expect.stringContaining('REACTIVATED')
      }));
    });

    it('After recovery, USER sees the product again', async () => {
      mockQuery.then.mockImplementation((onFulfilled) => {
        return Promise.resolve({ 
          data: [{ prodcode: 'PROD002', record_status: 'ACTIVE' }], 
          error: null 
        }).then(onFulfilled);
      });

      const result = await getProducts('USER');
      expect(result[0].prodcode).toBe('PROD002');
      expect(mockQuery.eq).toHaveBeenCalledWith('record_status', 'ACTIVE');
    });
  });

  // ═════════════════════════════════════════════════════════════════════════════
  // TEST SUITE 4: RLS LOGIC SIMULATION
  // ═════════════════════════════════════════════════════════════════════════════

  describe('RLS Simulation', () => {
    const rlsPolicy = (user_type, recordStatus) => {
      if (['ADMIN', 'SUPERADMIN'].includes(user_type)) return true;
      if (user_type === 'USER' && recordStatus === 'ACTIVE') return true;
      return false;
    };

    it('RLS: USER sees only ACTIVE even if DB returns both', () => {
      const dbRows = [
        { id: 1, record_status: 'ACTIVE' },
        { id: 2, record_status: 'INACTIVE' }
      ];
      const visible = dbRows.filter(r => rlsPolicy('USER', r.record_status));
      expect(visible).toHaveLength(1);
      expect(visible[0].record_status).toBe('ACTIVE');
    });

    it('RLS: ADMIN sees everything', () => {
      const dbRows = [
        { id: 1, record_status: 'ACTIVE' },
        { id: 2, record_status: 'INACTIVE' }
      ];
      const visible = dbRows.filter(r => rlsPolicy('ADMIN', r.record_status));
      expect(visible).toHaveLength(2);
    });
  });
});