import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../db/supabase';
import { useAuth } from '../context/AuthContext';
import { makeStamp } from '../utils/stampHelper';

/* ── skeleton ── */
const SkeletonRow = () => (
  <tr>
    {[40, 65, 30, 55, 70].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(133,159,61,0.1)', width: `${w}%` }} />
      </td>
    ))}
  </tr>
);

/* ── recover confirm inline ── */
function RecoverButton({ product, onRecover }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    setLoading(true);
    await onRecover(product.prodcode);
    setLoading(false);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[10px]" style={{ color: 'rgba(26,26,25,0.5)' }}>Confirm?</span>
        <button
          onClick={handleRecover}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all"
          style={{ background: '#31511E', color: '#F6FCDF' }}
        >
          {loading && (
            <svg className="w-2.5 h-2.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          )}
          {loading ? '…' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
          style={{ background: 'rgba(26,26,25,0.07)', color: 'rgba(26,26,25,0.55)' }}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
      style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#31511E'; e.currentTarget.style.color = '#F6FCDF'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(133,159,61,0.1)'; e.currentTarget.style.color = '#31511E'; }}
    >
      <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
      Recover
    </button>
  );
}

export default function DeletedItemsPage() {
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type ?? 'USER';
  const showStamp = ['ADMIN', 'SUPERADMIN'].includes(userType);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('product')
      .select(showStamp
        ? 'prodcode, description, unit, stamp'
        : 'prodcode, description, unit')
      .eq('record_status', 'INACTIVE')
      .order('prodcode');

    if (err) setError(err.message);
    else setProducts(data ?? []);
    setLoading(false);
  }, [showStamp]);

  useEffect(() => { fetchDeleted(); }, [fetchDeleted]);

  const handleRecover = async (prodcode) => {
    const stamp = makeStamp('REACTIVATED', currentUser?.userid ?? currentUser?.id);
    const { error: err } = await supabase
      .from('product')
      .update({ record_status: 'ACTIVE', stamp })
      .eq('prodcode', prodcode);

    if (!err) {
      setSuccessMsg(`${prodcode} has been recovered successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDeleted();
    }
    return err;
  };

  const visible = products.filter(p =>
    p.prodcode?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const colCount = 3 + (showStamp ? 1 : 0) + 1;

  return (
    <div className="flex flex-col gap-5">

      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: '#1A1A19' }}>Deleted Items</h1>
            {!loading && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'rgba(220,38,38,0.09)', color: '#dc2626' }}>
                {products.length}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>
            Archived products — only ADMIN and SUPERADMIN can see and recover these
          </p>
        </div>

        {/* role badge */}
        <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-xl self-start sm:self-auto"
          style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E' }}>
          {userType}
        </span>
      </div>

      {/* info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(133,159,61,0.07)', border: '1px solid rgba(133,159,61,0.15)' }}>
        <svg className="shrink-0 mt-0.5" width="14" height="14" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p className="text-xs" style={{ color: '#31511E' }}>
          These products have been <strong>soft-deleted</strong> (set to INACTIVE). They are invisible to USER accounts.
          Clicking <strong>Recover</strong> will set the product back to ACTIVE and make it visible to all users.
        </p>
      </div>

      {/* success toast */}
      {successMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E', border: '1px solid rgba(133,159,61,0.2)' }}>
          <svg width="14" height="14" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          {successMsg}
        </div>
      )}

      {/* error */}
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
          fill="none" stroke="rgba(133,159,61,0.5)" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"/>
        </svg>
        <input
          type="text"
          placeholder="Search deleted products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
          style={{ background: 'white', color: '#1A1A19', boxShadow: '0 2px 8px rgba(49,81,30,0.07)' }}
          onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(133,159,61,0.35), 0 2px 8px rgba(49,81,30,0.07)'}
          onBlur={e => e.target.style.boxShadow = '0 2px 8px rgba(49,81,30,0.07)'}
        />
      </div>

      {/* table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 4px 24px rgba(26,26,25,0.07)', border: '1px solid rgba(133,159,61,0.1)' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(133,159,61,0.12)' }}>
                {['Prod. Code', 'Description', 'Unit'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(133,159,61,0.6)', background: 'rgba(246,252,223,0.45)' }}>
                    {h}
                  </th>
                ))}
                {showStamp && (
                  <th className="px-4 py-3 text-left text-[10px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(133,159,61,0.6)', background: 'rgba(246,252,223,0.45)' }}>
                    Last Action
                  </th>
                )}
                <th className="px-4 py-3 text-right text-[10px] font-bold tracking-[0.15em] uppercase"
                  style={{ color: 'rgba(133,159,61,0.6)', background: 'rgba(246,252,223,0.45)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : visible.length === 0
                  ? (
                    <tr>
                      <td colSpan={colCount} className="text-center py-14">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                            style={{ background: 'rgba(133,159,61,0.08)' }}>
                            <svg width="22" height="22" fill="none" stroke="rgba(133,159,61,0.4)" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: 'rgba(26,26,25,0.45)' }}>
                              {search ? 'No results found' : 'No deleted products'}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.3)' }}>
                              {!search && 'All products are currently active'}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                  : visible.map((product, idx) => (
                    <tr
                      key={product.prodcode}
                      className="transition-colors"
                      style={{ borderBottom: idx < visible.length - 1 ? '1px solid rgba(133,159,61,0.07)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold" style={{ color: '#31511E' }}>{product.prodcode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm" style={{ color: '#1A1A19' }}>{product.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-lg font-medium"
                          style={{ background: 'rgba(133,159,61,0.09)', color: '#31511E' }}>
                          {product.unit}
                        </span>
                      </td>
                      {showStamp && (
                        <td className="px-4 py-3 text-[11px] font-mono max-w-[200px] truncate"
                          style={{ color: 'rgba(26,26,25,0.4)' }} title={product.stamp}>
                          {product.stamp ?? '—'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <RecoverButton product={product} onRecover={handleRecover} />
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {!loading && (
          <div className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(133,159,61,0.08)' }}>
            <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.35)' }}>
              {visible.length} deleted product{visible.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}