import { supabase } from '../db/supabase';
import { makeStamp } from '../utils/stampHelper';

// ── GET PRODUCTS ──────────────────────────────────────────
// Returns ACTIVE only for USER accounts.
// Returns ALL records (ACTIVE + INACTIVE) for ADMIN/SUPERADMIN.
export async function getProducts(userType) {
  let query = supabase
    .from('product')
    .select('prodcode, description, unit, record_status, stamp')
    .order('prodcode');

  if (userType === 'USER') {
    query = query.eq('record_status', 'ACTIVE');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ── ADD PRODUCT ───────────────────────────────────────────
// Inserts a new product row with ACTIVE status and stamp.
export async function addProduct(payload, userId) {
  const { prodcode, description, unit } = payload;

  const { error } = await supabase
    .from('product')
    .insert({
      prodcode,
      description,
      unit,
      record_status: 'ACTIVE',
      stamp: makeStamp('ADDED', userId),
    });

  if (error) throw error;
}

// ── UPDATE PRODUCT ────────────────────────────────────────
// Updates description and/or unit. Never touches record_status here.
export async function updateProduct(prodcode, payload, userId) {
  const { description, unit } = payload;

  const { error } = await supabase
    .from('product')
    .update({
      description,
      unit,
      stamp: makeStamp('EDITED', userId),
    })
    .eq('prodcode', prodcode);

  if (error) throw error;
}

// ── SOFT DELETE PRODUCT ───────────────────────────────────
// Sets record_status to INACTIVE. Never uses DELETE.
export async function softDeleteProduct(prodcode, userId) {
  const { error } = await supabase
    .from('product')
    .update({
      record_status: 'INACTIVE',
      stamp: makeStamp('DEACTIVATED', userId),
    })
    .eq('prodcode', prodcode);

  if (error) throw error;
}

// ── RECOVER PRODUCT ───────────────────────────────────────
// Restores a soft-deleted product back to ACTIVE.
// Only callable by ADMIN/SUPERADMIN — enforced by RLS + route guard.
export async function recoverProduct(prodcode, userId) {
  const { error } = await supabase
    .from('product')
    .update({
      record_status: 'ACTIVE',
      stamp: makeStamp('REACTIVATED', userId),
    })
    .eq('prodcode', prodcode);

  if (error) throw error;
}