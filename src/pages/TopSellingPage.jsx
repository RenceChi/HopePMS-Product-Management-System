// src/pages/TopSellingPage.jsx
// REP_002 — Top Selling Products Report
// Access: SUPERADMIN only (confidential executive/BI data)

import { useState, useEffect } from 'react';
import { useRights } from '../context/UserRightsContext';
import { getTopSellingReport } from '../services/reportService';

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatQty = (qty) =>
  Number(qty).toLocaleString('en-PH');

const getRankStyle = (rank) => {
  if (rank === 1) return { bg: 'rgba(255,199,0,0.12)', color: '#92740a', border: '1px solid rgba(255,199,0,0.3)' };
  if (rank === 2) return { bg: 'rgba(160,163,168,0.12)', color: '#5a5c61', border: '1px solid rgba(160,163,168,0.25)' };
  if (rank === 3) return { bg: 'rgba(180,100,40,0.1)', color: '#7a4010', border: '1px solid rgba(180,100,40,0.2)' };
  return { bg: 'rgba(133,159,61,0.07)', color: '#31511E', border: '1px solid rgba(133,159,61,0.12)' };
};

const RankMedal = ({ rank }) => {
  if (rank === 1) return <span title="1st Place">🥇</span>;
  if (rank === 2) return <span title="2nd Place">🥈</span>;
  if (rank === 3) return <span title="3rd Place">🥉</span>;
  return null;
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr>
    <td className="px-4 py-3.5">
      <div className="w-7 h-5 rounded animate-pulse" style={{ background: 'rgba(133,159,61,0.1)' }} />
    </td>
    {[45, 18, 22].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(133,159,61,0.1)', width: `${w}%` }} />
      </td>
    ))}
    <td className="px-4 py-3.5">
      <div className="h-2.5 rounded-full animate-pulse" style={{ background: 'rgba(133,159,61,0.07)', width: '80%' }} />
    </td>
  </tr>
);

const EmptyState = () => (
  <tr>
    <td colSpan={5} className="px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(133,159,61,0.08)' }}>
          <svg width="22" height="22" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>No Sales Data</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.4)' }}>
            No sales transactions found in the database.
          </p>
        </div>
      </div>
    </td>
  </tr>
);

// ── Top Product Hero Card ──────────────────────────────────────────────────────

const TopProductCard = ({ row, totalProducts }) => (
  <div
    className="relative overflow-hidden rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5"
    style={{
      background: 'linear-gradient(135deg, #31511E 0%, #4a7a2e 60%, #859F3D 100%)',
      boxShadow: '0 8px 32px rgba(49,81,30,0.25)',
    }}
  >
    {/* Decorative background circles */}
    <div
      className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
      style={{
        background: 'rgba(255,255,255,0.04)',
        transform: 'translate(30%, -30%)',
      }}
    />
    <div
      className="absolute bottom-0 right-24 w-32 h-32 rounded-full pointer-events-none"
      style={{
        background: 'rgba(255,255,255,0.03)',
        transform: 'translateY(40%)',
      }}
    />

    {/* Trophy icon */}
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
      style={{
        background: 'rgba(255,199,0,0.15)',
        border: '1px solid rgba(255,199,0,0.3)',
        boxShadow: '0 4px 16px rgba(255,199,0,0.2)',
      }}
    >
      🏆
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0 z-10">
      <p
        className="text-[9px] font-bold tracking-[0.25em] uppercase mb-1"
        style={{ color: 'rgba(246,252,223,0.55)' }}
      >
        🥇 Top Selling Product
      </p>
      <p
        className="text-xl font-bold truncate leading-tight"
        style={{ color: '#F6FCDF' }}
      >
        {row.description}
      </p>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span
          className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg"
          style={{ background: 'rgba(246,252,223,0.12)', color: 'rgba(246,252,223,0.7)' }}
        >
          {row.prodcode}
        </span>
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
          style={{ background: 'rgba(246,252,223,0.1)', color: 'rgba(246,252,223,0.6)' }}
        >
          {row.unit}
        </span>
      </div>
    </div>

    {/* Stats */}
    <div
      className="flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-1 z-10 shrink-0"
    >
      <div className="text-right">
        <p
          className="text-3xl font-black leading-none"
          style={{ color: '#F6FCDF' }}
        >
          {formatQty(row.total_quantity_sold)}
        </p>
        <p
          className="text-[10px] mt-0.5"
          style={{ color: 'rgba(246,252,223,0.5)' }}
        >
          units sold
        </p>
      </div>
      <div
        className="text-[10px] font-semibold px-3 py-1 rounded-full"
        style={{ background: 'rgba(246,252,223,0.12)', color: 'rgba(246,252,223,0.65)' }}
      >
        #1 of {totalProducts}
      </div>
    </div>
  </div>
);

// ── Runner-up Cards (2nd and 3rd) ─────────────────────────────────────────────

const RunnerUpCard = ({ row, medal, bgColor, borderColor, textColor }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1"
    style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
    }}
  >
    <span className="text-xl shrink-0">{medal}</span>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold truncate" style={{ color: '#1A1A19' }}>{row.description}</p>
      <p className="font-mono text-[9px] mt-0.5" style={{ color: 'rgba(26,26,25,0.4)' }}>{row.prodcode}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-black" style={{ color: textColor }}>{formatQty(row.total_quantity_sold)}</p>
      <p className="text-[9px]" style={{ color: 'rgba(26,26,25,0.35)' }}>units</p>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function TopSellingPage() {
  const { canViewRep002 } = useRights();

  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const maxQty = rows.length > 0 ? rows[0].total_quantity_sold : 1;

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopSellingReport();
      setRows(data);
    } catch (err) {
      console.error('TopSellingPage error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewRep002) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewRep002]);

  // ── Access guard ──
  if (!canViewRep002) {
    return (
      <div className="flex flex-col items-center justify-center h-72 gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)' }}
        >
          <svg width="24" height="24" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>Restricted Report</p>
        <p className="text-xs text-center max-w-xs" style={{ color: 'rgba(26,26,25,0.45)' }}>
          The Top Selling Products report is restricted to <strong>SUPERADMIN</strong> accounts only.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>        
          <h1 className="text-xl font-bold" style={{ color: '#1A1A19' }}>Top Selling Products</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>
            Top 10 products ranked by total quantity sold
          </p>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 self-start sm:self-auto"
          style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E', opacity: loading ? 0.5 : 1 }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#31511E'; e.currentTarget.style.color = '#F6FCDF'; }}}
          onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'rgba(133,159,61,0.1)'; e.currentTarget.style.color = '#31511E'; }}}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>


      {/* ── Error ── */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Hero card skeleton ── */}
      {loading && (
        <div
          className="rounded-2xl px-6 py-5 flex items-center gap-5 animate-pulse"
          style={{ background: 'rgba(133,159,61,0.08)', minHeight: 100 }}
        >
          <div className="w-16 h-16 rounded-2xl" style={{ background: 'rgba(133,159,61,0.12)' }} />
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-3 w-20 rounded-full" style={{ background: 'rgba(133,159,61,0.12)' }} />
            <div className="h-5 w-48 rounded-full" style={{ background: 'rgba(133,159,61,0.12)' }} />
            <div className="h-3 w-28 rounded-full" style={{ background: 'rgba(133,159,61,0.08)' }} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-8 w-20 rounded-full" style={{ background: 'rgba(133,159,61,0.12)' }} />
            <div className="h-3 w-16 rounded-full" style={{ background: 'rgba(133,159,61,0.08)' }} />
          </div>
        </div>
      )}

      {/* ── Top product hero + runner-ups ── */}
      {!loading && rows.length > 0 && (
        <div className="flex flex-col gap-3">
          {/* #1 Hero Card */}
          <TopProductCard row={rows[0]} totalProducts={rows.length} />

          {/* #2 and #3 runner-up cards */}
          {rows.length > 1 && (
            <div className="flex flex-col sm:flex-row gap-3">
              {rows[1] && (
                <RunnerUpCard
                  row={rows[1]}
                  medal="🥈"
                  bgColor="rgba(160,163,168,0.07)"
                  borderColor="rgba(160,163,168,0.2)"
                  textColor="#5a5c61"
                />
              )}
              {rows[2] && (
                <RunnerUpCard
                  row={rows[2]}
                  medal="🥉"
                  bgColor="rgba(180,100,40,0.06)"
                  borderColor="rgba(180,100,40,0.15)"
                  textColor="#7a4010"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          border: '1px solid rgba(133,159,61,0.1)',
          boxShadow: '0 2px 12px rgba(26,26,25,0.05)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(133,159,61,0.1)' }}>
                {['Rank', 'Product', 'Unit', 'Total Qty Sold', 'Volume Bar'].map(label => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left"
                    style={{ color: 'rgba(26,26,25,0.4)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : rows.length === 0
                  ? <EmptyState />
                  : rows.map((row, idx) => {
                    const rankStyle = getRankStyle(row.rank);
                    const pct = maxQty > 0 ? (row.total_quantity_sold / maxQty) * 100 : 0;
                    return (
                      <tr
                        key={row.prodcode}
                        style={{
                          borderBottom: idx < rows.length - 1 ? '1px solid rgba(133,159,61,0.07)' : 'none',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(133,159,61,0.03)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Rank */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="inline-flex items-center justify-center w-7 h-5 rounded-md text-[11px] font-bold"
                              style={{ background: rankStyle.bg, color: rankStyle.color, border: rankStyle.border }}
                            >
                              #{row.rank}
                            </span>
                            <RankMedal rank={row.rank} />
                          </div>
                        </td>

                        {/* Product */}
                        <td className="px-4 py-3.5">
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>{row.description}</p>
                            <p className="font-mono text-[10px] mt-0.5" style={{ color: 'rgba(26,26,25,0.4)' }}>
                              {row.prodcode}
                            </p>
                          </div>
                        </td>

                        {/* Unit */}
                        <td className="px-4 py-3.5">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                            style={{ background: 'rgba(26,26,25,0.05)', color: 'rgba(26,26,25,0.5)' }}
                          >
                            {row.unit ?? '—'}
                          </span>
                        </td>

                        {/* Qty */}
                        <td className="px-4 py-3.5">
                          <span className="text-sm font-bold" style={{ color: '#31511E' }}>
                            {formatQty(row.total_quantity_sold)}
                          </span>
                        </td>

                        {/* Bar */}
                        <td className="px-4 py-3.5" style={{ minWidth: 120 }}>
                          <div className="relative h-2 rounded-full overflow-hidden"
                            style={{ background: 'rgba(133,159,61,0.1)' }}>
                            <div
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: row.rank === 1
                                  ? 'linear-gradient(90deg, #31511E, #859F3D)'
                                  : '#859F3D',
                                opacity: row.rank <= 3 ? 1 : 0.6,
                              }}
                            />
                          </div>
                          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(26,26,25,0.3)' }}>
                            {pct.toFixed(0)}% of top
                          </p>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && rows.length > 0 && (
          <div
            className="px-4 py-2.5"
            style={{ borderTop: '1px solid rgba(133,159,61,0.08)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.35)' }}>
              Showing top {rows.length} products by total quantity sold across all transactions
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}