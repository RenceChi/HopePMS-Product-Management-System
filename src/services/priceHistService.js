import { supabase } from '../db/supabase';
import { makeStamp } from '../utils/stampHelper';

// ── GET PRICE HISTORY ─────────────────────────────────────
// Returns all price history rows for a given product.
// Ordered by effdate descending — latest price first.
export async function getPriceHistory(prodcode) {
  const { data, error } = await supabase
    .from('pricehist')
    .select('effdate, prodcode, unitprice, stamp')
    .eq('prodcode', prodcode)
    .order('effdate', { ascending: false });

  if (error) throw error;
  return data;
}

// ── ADD PRICE ENTRY ───────────────────────────────────────
// Inserts a new price history row for a product.
// effdate + prodcode form the composite PK —
// Supabase will throw if the same date is inserted twice for the same product.
export async function addPriceEntry(prodcode, effdate, unitprice, userId) {
  const { error } = await supabase
    .from('pricehist')
    .insert({
      prodcode,
      effdate,
      unitprice,
      stamp: makeStamp('ADDED', userId),
    });

  if (error) throw error;
}