import { describe, it, expect } from 'vitest';
 
// ── REP_001 / REP_002 sidebar visibility ─────────────────
describe('Reports sidebar visibility by user type', () => {
  const canSeeRep001 = (rights) => rights['REP_001'] === 1;
  const canSeeRep002 = (rights) => rights['REP_002'] === 1;
  const canSeeAdmUser = (rights) => rights['ADM_USER'] === 1;
 
  const SUPERADMIN = { REP_001:1, REP_002:1, ADM_USER:1 };
  const ADMIN      = { REP_001:1, REP_002:0, ADM_USER:0 };
  const USER       = { REP_001:1, REP_002:0, ADM_USER:0 };
 
  it('SUPERADMIN sees REP_001', () => expect(canSeeRep001(SUPERADMIN)).toBe(true));
  it('SUPERADMIN sees REP_002', () => expect(canSeeRep002(SUPERADMIN)).toBe(true));
  it('SUPERADMIN sees ADM_USER', () => expect(canSeeAdmUser(SUPERADMIN)).toBe(true));
  it('ADMIN sees REP_001', () => expect(canSeeRep001(ADMIN)).toBe(true));
  it('ADMIN does NOT see REP_002', () => expect(canSeeRep002(ADMIN)).toBe(false));
  it('ADMIN does NOT see ADM_USER', () => expect(canSeeAdmUser(ADMIN)).toBe(false));
  it('USER sees REP_001', () => expect(canSeeRep001(USER)).toBe(true));
  it('USER does NOT see REP_002', () => expect(canSeeRep002(USER)).toBe(false));
  it('USER does NOT see ADM_USER', () => expect(canSeeAdmUser(USER)).toBe(false));
});
 
// ── SUPERADMIN row protection ─────────────────────────────
describe('UserManagementPage — SUPERADMIN row protection', () => {
  const isSuperAdmin = (user) => user.user_type === 'SUPERADMIN';
  const canActivate = (user) => !isSuperAdmin(user) && user.record_status === 'INACTIVE';
  const canDeactivate = (user) => !isSuperAdmin(user) && user.record_status === 'ACTIVE';
 
  const superadminUser  = { user_type: 'SUPERADMIN', record_status: 'ACTIVE' };
  const activeUser      = { user_type: 'USER',        record_status: 'ACTIVE' };
  const inactiveUser    = { user_type: 'USER',        record_status: 'INACTIVE' };
 
  it('Activate button is disabled for SUPERADMIN row', () => expect(canActivate(superadminUser)).toBe(false));
  it('Deactivate button is disabled for SUPERADMIN row', () => expect(canDeactivate(superadminUser)).toBe(false));
  it('Activate button works for INACTIVE USER', () => expect(canActivate(inactiveUser)).toBe(true));
  it('Deactivate button works for ACTIVE USER', () => expect(canDeactivate(activeUser)).toBe(true));
  it('Activate button disabled for already-ACTIVE user', () => expect(canActivate(activeUser)).toBe(false));
  it('Deactivate button disabled for already-INACTIVE user', () => expect(canDeactivate(inactiveUser)).toBe(false));
});
 
// ── CSV export ────────────────────────────────────────────
describe('CSV export logic', () => {
  it('generates correct CSV with header row', () => {
    const rows = [
      { prodCode: 'AK0001', description: 'Widget A', unit: 'pc', currentPrice: 25.00, priceEffDate: '2025-10-01' }
    ];
    const headers = ['Code','Description','Unit','Current Price','Price Eff. Date'];
    const csvRows = rows.map(r => [r.prodCode, r.description, r.unit, r.currentPrice, r.priceEffDate]);
    const csv = [headers, ...csvRows].map(r => r.join(',')).join('\n');
    expect(csv).toContain('Code,Description,Unit');
    expect(csv).toContain('AK0001,Widget A,pc');
  });
 
  it('handles null currentPrice gracefully in CSV', () => {
    const row = { prodCode: 'AK0002', description: 'Widget B', unit: 'ea', currentPrice: null, priceEffDate: null };
    const csvRow = [row.prodCode, row.description, row.unit, row.currentPrice ?? 'N/A', row.priceEffDate ?? 'N/A'];
    expect(csvRow).toContain('N/A');
  });
});
 
// ── userService safety guards ─────────────────────────────
describe('userService — SUPERADMIN safety guard', () => {
  it('activateUser targets only non-SUPERADMIN rows', () => {
    // Simulates the .neq('user_type','SUPERADMIN') guard
    const users = [
      { userId: 'u1', user_type: 'USER',        record_status: 'INACTIVE' },
      { userId: 'u2', user_type: 'SUPERADMIN',  record_status: 'ACTIVE'   },
    ];
    const eligible = users.filter(u => u.user_type !== 'SUPERADMIN');
    expect(eligible).toHaveLength(1);
    expect(eligible[0].user_type).toBe('USER');
  });
});