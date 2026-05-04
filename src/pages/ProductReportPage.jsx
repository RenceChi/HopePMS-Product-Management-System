// src/pages/ProductReportPage.jsx
// REP_001 — Product Price Report
// Access: SUPERADMIN, ADMIN, USER (all authenticated roles with REP_001 right)

import { useState, useEffect } from 'react';
import { useRights } from '../context/UserRightsContext';
import { getProductPriceReport } from '../services/reportService';

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatPrice = (price) =>
  price == null ? null : `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ── CSV Export ─────────────────────────────────────────────────────────────────

function exportToCSV(rows) {
  const headers = ['Product Code', 'Description', 'Unit', 'Current Price', 'Effective Date'];
  const csvRows = rows.map(r => [
    r.prodcode       ?? '',
    r.description    ?? '',
    r.unit           ?? '',
    r.current_price != null ? Number(r.current_price).toFixed(2) : '',
    r.effective_date ?? '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv    = [headers.join(','), ...csvRows].join('\n');
  const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const link   = document.createElement('a');
  link.href    = url;
  link.download = `product_report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr style={{ borderBottom: '1px solid rgba(133,159,61,0.07)' }}>
    {[14, 38, 10, 14, 16].map((w, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(133,159,61,0.1)', width: `${w}%`, minWidth: 40 }} />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ search }) => (
  <tr>
    <td colSpan={5} className="py-20 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(133,159,61,0.07)', border: '1px solid rgba(133,159,61,0.12)' }}>
          <svg width="24" height="24" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>
          {search ? 'No results found' : 'No products found'}
        </p>
        <p className="text-xs" style={{ color: 'rgba(26,26,25,0.4)' }}>
          {search ? `Nothing matches "${search}"` : 'No active products with price data.'}
        </p>
      </div>
    </td>
  </tr>
);

// ── Sort Icon ──────────────────────────────────────────────────────────────────

const SortIcon = ({ active, dir }) => (
  <span className="inline-flex flex-col ml-1.5 relative top-px" style={{ opacity: active ? 1 : 0.25 }}>
    <svg width="7" height="7" viewBox="0 0 8 8" fill={active && dir === 'asc' ? '#31511E' : '#859F3D'}>
      <path d="M4 1L7 5H1z"/>
    </svg>
    <svg width="7" height="7" viewBox="0 0 8 8" fill={active && dir === 'desc' ? '#31511E' : '#859F3D'} style={{ marginTop: 1 }}>
      <path d="M4 7L7 3H1z"/>
    </svg>
  </span>
);

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProductReportPage() {
  const { canViewRep001 } = useRights();

  const [rows, setRows]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'prodcode', dir: 'asc' });

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductPriceReport();
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewRep001) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewRep001]);

  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const filtered = rows
    .filter(r =>
      !search ||
      r.prodcode.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      (r.unit ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const { key, dir } = sortConfig;
      let aVal = a[key] ?? '';
      let bVal = b[key] ?? '';
      if (key === 'current_price') { aVal = Number(aVal) || 0; bVal = Number(bVal) || 0; }
      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });

  // ── Access guard ──
  if (!canViewRep001) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)' }}>
          <svg width="24" height="24" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-9V5a2 2 0 00-2-2H7a2 2 0 00-2 2v3m14 0H5m14 0a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2"/>
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>Access Denied</p>
        <p className="text-xs" style={{ color: 'rgba(26,26,25,0.45)' }}>You do not have permission to view this report.</p>
      </div>
    );
  }

  const COLS = [
    { label: 'Product Code',  key: 'prodcode',       width: '15%' },
    { label: 'Description',   key: 'description',    width: '35%' },
    { label: 'Unit',          key: 'unit',            width: '10%' },
    { label: 'Current Price', key: 'current_price',  width: '20%' },
    { label: 'Effective Date',key: 'effective_date', width: '20%' },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold" style={{ color: '#1A1A19', letterSpacing: '-0.02em' }}>
            Product Price Report
          </h1>
          <p className="text-xs" style={{ color: 'rgba(26,26,25,0.45)' }}>
            Current prices for all active products
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {!loading && filtered.length > 0 && (
            <button
              onClick={() => exportToCSV(filtered)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all duration-150"
              style={{ background: '#31511E', color: '#F6FCDF' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1A1A19'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#31511E'; }}
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export CSV
            </button>
          )}
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-semibold transition-all duration-150"
            style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E', opacity: loading ? 0.5 : 1 }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'rgba(133,159,61,0.2)'; }}}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'rgba(133,159,61,0.1)'; }}}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.15)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Stat + Search row ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

        {/* Active Products pill */}
        {!loading && rows.length > 0 && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl shrink-0"
            style={{ background: 'white', border: '1px solid rgba(133,159,61,0.15)', boxShadow: '0 1px 3px rgba(26,26,25,0.05)' }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(133,159,61,0.1)' }}>
              <svg width="13" height="13" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ color: '#1A1A19' }}>{rows.length}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(26,26,25,0.4)' }}>Active Products</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14" height="14" fill="none" stroke="rgba(26,26,25,0.3)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            placeholder="Search by code, description, or unit…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
            style={{
              background: 'white',
              border: '1px solid rgba(133,159,61,0.18)',
              color: '#1A1A19',
              fontSize: '13px',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#859F3D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(133,159,61,0.08)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(133,159,61,0.18)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'rgba(26,26,25,0.3)' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          border: '1px solid rgba(133,159,61,0.12)',
          boxShadow: '0 1px 8px rgba(26,26,25,0.06)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              {COLS.map(c => <col key={c.key} style={{ width: c.width }} />)}
            </colgroup>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(133,159,61,0.1)', background: 'rgba(246,252,223,0.5)' }}>
                {COLS.map(col => (
                  <th
                    key={col.key}
                    className="px-5 py-3.5 text-left cursor-pointer select-none"
                    style={{ color: 'rgba(26,26,25,0.4)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <SortIcon active={sortConfig.key === col.key} dir={sortConfig.dir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? <EmptyState search={search} />
                  : filtered.map((row, idx) => {
                    const price    = formatPrice(row.current_price);
                    const dateStr  = formatDate(row.effective_date);
                    const isLast   = idx === filtered.length - 1;
                    return (
                      <tr
                        key={row.prodcode}
                        style={{
                          borderBottom: isLast ? 'none' : '1px solid rgba(133,159,61,0.06)',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(246,252,223,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Product Code */}
                        <td className="px-5 py-4">
                          <span
                            className="font-mono text-[11px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E', letterSpacing: '0.04em' }}
                          >
                            {row.prodcode}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4">
                          <span className="text-sm font-medium" style={{ color: '#1A1A19' }}>
                            {row.description}
                          </span>
                        </td>

                        {/* Unit */}
                        <td className="px-5 py-4">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md"
                            style={{ background: 'rgba(26,26,25,0.05)', color: 'rgba(26,26,25,0.45)', letterSpacing: '0.08em' }}
                          >
                            {row.unit ?? '—'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          {price ? (
                            <span className="text-sm font-bold" style={{ color: '#31511E' }}>
                              {price}
                            </span>
                          ) : (
                            <span
                              className="text-[10px] italic px-2 py-0.5 rounded-md"
                              style={{ background: 'rgba(239,68,68,0.06)', color: 'rgba(220,38,38,0.5)' }}
                            >
                              No price
                            </span>
                          )}
                        </td>

                        {/* Effective Date */}
                        <td className="px-5 py-4">
                          {dateStr ? (
                            <span className="text-xs" style={{ color: 'rgba(26,26,25,0.5)' }}>
                              {dateStr}
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: 'rgba(26,26,25,0.25)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>

        {/* ── Table Footer ── */}
        {!loading && filtered.length > 0 && (
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(133,159,61,0.08)', background: 'rgba(246,252,223,0.2)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.35)' }}>
              {search
                ? `${filtered.length} of ${rows.length} products matching "${search}"`
                : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`
              }
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.25)' }}>
              Prices in PHP (₱)
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