import { supabase } from '../db/supabase';

/**
 REP_001 — Product Price Report
 Access: SUPERADMIN, ADMIN, USER (all authenticated roles)
 
 Returns every ACTIVE product with its current unit price and
 the effective date that price took effect. 
 **/
export async function getProductPriceReport() {
  const { data, error } = await supabase
    .from('product')
    .select(`
      prodcode,
      description,
      unit,
      pricehist (
        unitprice,
        effdate
      )
    `)
    .eq('record_status', 'ACTIVE')
    .order('prodcode', { ascending: true });

  if (error) throw error;

  // Flatten: pick the latest pricehist row per product (max effdate)
  // The nested select returns ALL pricehist rows per product,
  // so we sort client-side and take the first (most recent).
  return (data ?? []).map(product => {
    const sortedPrices = (product.pricehist ?? [])
      .slice()
      .sort((a, b) => new Date(b.effdate) - new Date(a.effdate));

    const latest = sortedPrices[0] ?? null;

    return {
      prodcode:       product.prodcode,
      description:    product.description,
      unit:           product.unit,
      current_price:  latest ? Number(latest.unitprice) : null,
      effective_date: latest ? latest.effdate : null,
    };
  });
}

/**
 REP_002 — Top-Selling Products Report
 Access: SUPERADMIN only (confidential executive/BI data)
 
 Returns the top 10 ACTIVE products ranked by total quantity sold across
 all sales transactions, joining salesdetail → product.
 
 Only ACTIVE products are included — deactivated products are excluded
 from the ranking even if they have historical sales data.
 **/
export async function getTopSellingReport() {
  const { data, error } = await supabase
    .from('salesdetail')
    .select(`
      prodcode,
      quantity,
      product!inner (
        description,
        unit,
        record_status
      )
    `)
    .eq('product.record_status', 'ACTIVE'); // ← only include ACTIVE products

  if (error) throw error;

  // Aggregate total quantity sold per product
  const totalsMap = {};

  (data ?? []).forEach(row => {
    if (!row.prodcode) return;

    if (!totalsMap[row.prodcode]) {
      totalsMap[row.prodcode] = {
        prodcode:            row.prodcode,
        description:         row.product?.description ?? '—',
        unit:                row.product?.unit ?? '—',
        total_quantity_sold: 0,
      };
    }

    totalsMap[row.prodcode].total_quantity_sold += Number(row.quantity ?? 0);
  });

  // Sort descending by total_quantity_sold, take top 10, add rank
  return Object.values(totalsMap)
    .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
    .slice(0, 10)
    .map((item, idx) => ({ rank: idx + 1, ...item }));
}