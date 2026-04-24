import { supabase } from '../db/supabase';
import { makeStamp } from '../utils/stampHelper';

/**
 * getProducts(userType)
 * USER → ACTIVE only | ADMIN/SUPERADMIN → all rows
 */
export async function getProducts(userType) {
  const showStamp = ['ADMIN', 'SUPERADMIN'].includes(userType);

  let query = supabase
    .from('product')
    .select(showStamp
      ? 'prodcode, description, unit, record_status, stamp'
      : 'prodcode, description, unit, record_status')
    .order('prodcode');

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * addProduct(payload, userId)
 */
export async function addProduct({ prodcode, description, unit }, userId) {
  const stamp = makeStamp('ADDED', userId);
  const { error } = await supabase.from('product').insert({
    prodcode: prodcode.trim().toUpperCase(),
    description: description.trim(),
    unit,
    record_status: 'ACTIVE',
    stamp,
  });
  if (error) throw error;
}

/**
 * updateProduct(prodcode, payload, userId)
 */
export async function updateProduct(prodcode, { description, unit }, userId) {
  const stamp = makeStamp('EDITED', userId);
  const { error } = await supabase
    .from('product')
    .update({ description: description.trim(), unit, stamp })
    .eq('prodcode', prodcode);
  if (error) throw error;
}

/**
 * softDeleteProduct(prodcode, userId)
 * Sets record_status = 'INACTIVE' — NO DELETE statement.
 */
export async function softDeleteProduct(prodcode, userId) {
  const stamp = makeStamp('DEACTIVATED', userId);
  const { error } = await supabase
    .from('product')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('prodcode', prodcode);
  if (error) throw error;
}

/**
 * recoverProduct(prodcode, userId)
 * Restores record_status = 'ACTIVE'.
 */
export async function recoverProduct(prodcode, userId) {
  const stamp = makeStamp('REACTIVATED', userId);
  const { error } = await supabase
    .from('product')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('prodcode', prodcode);
  if (error) throw error;
}

/**
 * getUserRights(userId, userType)
 *
 * Strategy:
 * 1. Try fetching from user_module_rights table (DB source of truth).
 * 2. If the query fails OR returns empty (e.g. RLS not yet set up by M3),
 *    fall back to the rights matrix from the project guide.
 *
 * Rights matrix (project guide §2.2):
 *   PRD_ADD  → SUPERADMIN ✔  ADMIN ✔  USER ✔
 *   PRD_EDIT → SUPERADMIN ✔  ADMIN ✔  USER ✔
 *   PRD_DEL  → SUPERADMIN ✔  ADMIN ✘  USER ✘
 *   REP_001  → SUPERADMIN ✔  ADMIN ✔  USER ✔
 *   REP_002  → SUPERADMIN ✔  ADMIN ✘  USER ✘
 *   ADM_USER → SUPERADMIN ✔  ADMIN ✘  USER ✘
 */
export async function getUserRights(userId, userType) {
  // -- DEV: if userType doesn't match real DB user_type, skip DB entirely --
  // This handles the dev role switcher case where userId stays the same
  // but userType has been overridden (e.g. USER account switched to SUPERADMIN)
  try {
    const { data: userRow } = await supabase
      .from('user')
      .select('user_type')
      .eq('userid', userId)
      .single();

    const realUserType = userRow?.user_type ?? userType;

    // If dev switcher overrode the role, skip DB rights and use matrix
    if (realUserType !== userType) {
      console.log('[getUserRights] Dev override detected — using matrix for:', userType);
      return getRightsByUserType(userType);
    }
  } catch (_) {
    // ignore — continue to DB rights fetch below
  }

  // -- 1. Try DB --
  try {
    const { data, error } = await supabase
      .from('user_module_rights')
      .select('right_id, rights_value')
      .eq('userid', userId)
      .eq('record_status', 'ACTIVE');

    if (!error && data && data.length > 0) {
      const map = {};
      data.forEach(row => {
        map[row.right_id] = row.rights_value === 1;
      });
      console.log('[getUserRights] Loaded from DB:', map);
      return map;
    }

    if (error) {
      console.warn('[getUserRights] DB error, falling back to matrix:', error.message);
    } else {
      console.warn('[getUserRights] Empty result, falling back to matrix (RLS may not be ready)');
    }
  } catch (err) {
    console.warn('[getUserRights] Exception, falling back to matrix:', err.message);
  }

  // -- 2. Fallback: derive from user_type per project guide rights matrix --
  return getRightsByUserType(userType);
}

/**
 * getRightsByUserType(userType)
 * Hard-coded fallback matching the project guide §2.2 rights matrix.
 * Used when user_module_rights RLS isn't set up yet (Sprint 2 dev mode).
 */
export function getRightsByUserType(userType) {
  const type = userType ?? 'USER';
  return {
    PRD_ADD:  ['SUPERADMIN', 'ADMIN', 'USER'].includes(type),
    PRD_EDIT: ['SUPERADMIN', 'ADMIN', 'USER'].includes(type),
    PRD_DEL:  ['SUPERADMIN'].includes(type),
    REP_001:  ['SUPERADMIN', 'ADMIN', 'USER'].includes(type),
    REP_002:  ['SUPERADMIN'].includes(type),
    ADM_USER: ['SUPERADMIN'].includes(type),
  };
}