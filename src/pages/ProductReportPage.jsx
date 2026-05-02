// src/pages/ProductReportPage.jsx
// REP_001 — Product Price Report
// Access: SUPERADMIN, ADMIN, USER (all authenticated roles with REP_001 right)

import { useState, useEffect } from 'react';
import { useRights } from '../context/UserRightsContext';
import { getProductPriceReport } from '../services/reportService';

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatPrice = (price) =>
  price == null ? '—' : `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ── CSV Export Helper ──────────────────────────────────────────────────────────
// Per project guide Sprint 3: ProductReportPage includes CSV export

function exportToCSV(rows, search) {
  const headers = ['Product Code', 'Description', 'Unit', 'Current Price', 'Effective Date'];

  const csvRows = rows.map(r => [
    r.prodcode      ?? '',
    r.description   ?? '',
    r.unit          ?? '',
    r.current_price != null ? Number(r.current_price).toFixed(2) : '',
    r.effective_date ?? '',
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  const csv      = [headers.join(','), ...csvRows].join('\n');
  const blob     = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url      = URL.createObjectURL(blob);
  const link     = document.createElement('a');
  link.href      = url;
  link.download  = `product_report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <tr>
    {[20, 40, 15, 20, 25].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3 rounded-full animate-pulse"
          style={{ background: 'rgba(133,159,61,0.1)', width: `${w}%` }}
        />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ search }) => (
  <tr>
    <td colSpan={5} className="px-4 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(133,159,61,0.08)' }}
        >
          <svg width="22" height="22" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>
            {search ? 'No results found' : 'No products found'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.4)' }}>
            {search ? `No products match "${search}"` : 'No active products with price data available.'}
          </p>
        </div>
      </div>
    </td>
  </tr>
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
      console.error('ProductReportPage error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewRep001) fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canViewRep001]);

  // ── Sorting ──
  const handleSort = (key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  };

  const SortIcon = ({ colKey }) => {
    const isActive = sortConfig.key === colKey;
    return (
      <span className="inline-flex flex-col ml-1" style={{ opacity: isActive ? 1 : 0.3 }}>
        <svg width="8" height="8" viewBox="0 0 8 8" fill={isActive && sortConfig.dir === 'asc' ? '#31511E' : '#859F3D'}>
          <path d="M4 1L7 5H1z"/>
        </svg>
        <svg width="8" height="8" viewBox="0 0 8 8" fill={isActive && sortConfig.dir === 'desc' ? '#31511E' : '#859F3D'}>
          <path d="M4 7L7 3H1z"/>
        </svg>
      </span>
    );
  };

  // ── Filter + Sort ──
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
        <p className="text-xs" style={{ color: 'rgba(26,26,25,0.45)' }}>
          You do not have permission to view this report.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1A1A19' }}>Product Price Report</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>
            Current prices for all active products
          </p>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-2 self-start sm:self-auto">

          {/* CSV Export — only when data is available */}
          {!loading && filtered.length > 0 && (
            <button
              onClick={() => exportToCSV(filtered, search)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150"
              style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#31511E'; e.currentTarget.style.color = '#F6FCDF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(133,159,61,0.1)'; e.currentTarget.style.color = '#31511E'; }}
              title="Export current view to CSV"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Export CSV
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={fetchReport}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150"
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

      {/* ── Stats bar ── */}
      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: 'Active Products',
              value: rows.length,
              icon: (
                <svg width="14" height="14" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                </svg>
              ),
            },
            {
              label: 'With Price',
              value: rows.filter(r => r.current_price != null).length,
              icon: (
                <svg width="14" height="14" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ),
            },
            {
              label: 'No Price Set',
              value: rows.filter(r => r.current_price == null).length,
              icon: (
                <svg width="14" height="14" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ),
            },
          ].map(stat => (
            <div
              key={stat.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: 'white', border: '1px solid rgba(133,159,61,0.1)', boxShadow: '0 1px 4px rgba(26,26,25,0.04)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(133,159,61,0.08)' }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-bold leading-none" style={{ color: '#1A1A19' }}>{stat.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search ── */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          width="14" height="14" fill="none" stroke="rgba(26,26,25,0.3)" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          placeholder="Search by code, description, or unit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-150"
          style={{
            background: 'white',
            border: '1px solid rgba(133,159,61,0.18)',
            color: '#1A1A19',
            fontSize: '13px',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#859F3D'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(133,159,61,0.1)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(133,159,61,0.18)'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(26,26,25,0.35)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>

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
                {[
                  { label: 'Product Code',  key: 'prodcode' },
                  { label: 'Description',   key: 'description' },
                  { label: 'Unit',          key: 'unit' },
                  { label: 'Current Price', key: 'current_price' },
                  { label: 'Effective Date',key: 'effective_date' },
                ].map(col => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-left cursor-pointer select-none"
                    style={{ color: 'rgba(26,26,25,0.4)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <SortIcon colKey={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.length === 0
                  ? <EmptyState search={search} />
                  : filtered.map((row, idx) => (
                    <tr
                      key={row.prodcode}
                      style={{
                        borderBottom: idx < filtered.length - 1 ? '1px solid rgba(133,159,61,0.07)' : 'none',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(133,159,61,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <td className="px-4 py-3.5">
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(133,159,61,0.08)', color: '#31511E' }}
                        >
                          {row.prodcode}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-sm" style={{ color: '#1A1A19' }}>{row.description}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                          style={{ background: 'rgba(26,26,25,0.05)', color: 'rgba(26,26,25,0.5)' }}
                        >
                          {row.unit ?? '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {row.current_price != null ? (
                          <span className="text-sm font-bold" style={{ color: '#31511E' }}>
                            {formatPrice(row.current_price)}
                          </span>
                        ) : (
                          <span className="text-xs italic" style={{ color: 'rgba(26,26,25,0.3)' }}>No price</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs" style={{ color: 'rgba(26,26,25,0.55)' }}>
                          {formatDate(row.effective_date)}
                        </span>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(133,159,61,0.08)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.35)' }}>
              {filtered.length} of {rows.length} product{rows.length !== 1 ? 's' : ''}
              {search ? ` matching "${search}"` : ''}
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