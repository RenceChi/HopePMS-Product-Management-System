import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../db/supabase';
import { makeStamp } from '../utils/stampHelper';

const showStampFor = (userType) => ['ADMIN', 'SUPERADMIN'].includes(userType);

/* ── skeleton row ── */
const SkeletonRow = () => (
  <tr>
    {[55, 70, 45].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(133,159,61,0.1)', width: `${w}%` }} />
      </td>
    ))}
  </tr>
);

/* ── AddPriceEntryForm ── */
function AddPriceEntryForm({ product, currentUser, onSuccess }) {
  const [form, setForm] = useState({ effdate: '', unitprice: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.effdate) e.effdate = 'Effective date is required';
    if (!form.unitprice) e.unitprice = 'Unit price is required';
    else if (isNaN(Number(form.unitprice)) || Number(form.unitprice) <= 0)
      e.unitprice = 'Price must be a positive number';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setServerError('');

    const stamp = makeStamp('ADDED', currentUser?.userid ?? currentUser?.id);
    const { error } = await supabase.from('pricehist').insert({
      prodcode: product.prodcode,
      effdate: form.effdate,
      unitprice: parseFloat(Number(form.unitprice).toFixed(2)),
      stamp,
    });

    if (error) {
      setServerError(error.code === '23505' ? 'A price entry for this date already exists.' : error.message);
      setSubmitting(false);
    } else {
      setForm({ effdate: '', unitprice: '' });
      setShowForm(false);
      onSuccess();
    }
  };

  const inputBase = (err) => ({
    background: 'white',
    color: '#1A1A19',
    boxShadow: err
      ? '0 0 0 2px rgba(239,68,68,0.4)'
      : '0 2px 6px rgba(49,81,30,0.07)',
  });

  return (
    <div className="shrink-0">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          style={{ background: 'rgba(49,81,30,0.07)', color: '#31511E' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(49,81,30,0.13)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(49,81,30,0.07)'}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Add Price Entry
        </button>
      ) : (
        <div className="rounded-xl p-3.5 flex flex-col gap-3"
          style={{ background: 'rgba(133,159,61,0.06)', border: '1px solid rgba(133,159,61,0.15)' }}>
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(49,81,30,0.6)' }}>
            New Price Entry
          </p>

          <div className="flex gap-2.5">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[9px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(49,81,30,0.55)' }}>
                Effective Date
              </label>
              <input
                type="date"
                value={form.effdate}
                onChange={e => set('effdate', e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none transition-all"
                style={inputBase(errors.effdate)}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(133,159,61,0.4)'}
                onBlur={e => e.target.style.boxShadow = inputBase(errors.effdate).boxShadow}
              />
              {errors.effdate && <p className="text-[9px]" style={{ color: '#dc2626' }}>{errors.effdate}</p>}
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <label className="text-[9px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(49,81,30,0.55)' }}>
                Unit Price (₱)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.unitprice}
                onChange={e => set('unitprice', e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs outline-none transition-all"
                style={inputBase(errors.unitprice)}
                onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(133,159,61,0.4)'}
                onBlur={e => e.target.style.boxShadow = inputBase(errors.unitprice).boxShadow}
              />
              {errors.unitprice && <p className="text-[9px]" style={{ color: '#dc2626' }}>{errors.unitprice}</p>}
            </div>
          </div>

          {serverError && (
            <p className="text-[11px] px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
              {serverError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setErrors({}); setServerError(''); }}
              className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'rgba(26,26,25,0.07)', color: 'rgba(26,26,25,0.6)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              style={{ background: submitting ? 'rgba(49,81,30,0.5)' : '#31511E', color: '#F6FCDF' }}
            >
              {submitting && (
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {submitting ? 'Saving…' : 'Save Entry'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PriceHistoryPanel (slide-over) ── */
export default function PriceHistoryPanel({ product, currentUser, onClose }) {
  const userType = currentUser?.user_type ?? 'USER';
  const showStamp = showStampFor(userType);
  const canAdd = ['ADMIN', 'SUPERADMIN', 'USER'].includes(userType); // same as PRD_ADD

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase
      .from('pricehist')
      .select(showStamp ? 'effdate, unitprice, stamp' : 'effdate, unitprice')
      .eq('prodcode', product.prodcode)
      .order('effdate', { ascending: false });

    if (err) setError(err.message);
    else setHistory(data ?? []);
    setLoading(false);
  }, [product.prodcode, showStamp]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const currentPrice = history[0];

  const fmt = (val) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      {/* backdrop */}
      <div
        className="fixed inset-0 z-290"
        style={{ background: 'rgba(26,26,25,0.35)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className="fixed right-0 top-0 h-full flex flex-col z-300"
        style={{
          width: 'min(420px, 100vw)',
          background: '#f2f5ee',
          boxShadow: '-8px 0 40px rgba(26,26,25,0.15)',
          borderLeft: '1px solid rgba(133,159,61,0.15)',
          animation: 'slideIn 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to   { transform: translateX(0); }
          }
        `}</style>

        {/* header */}
        <div className="flex items-start justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(133,159,61,0.12)', background: '#31511E' }}>
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase font-bold mb-0.5"
              style={{ color: 'rgba(246,252,223,0.5)' }}>Price History</p>
            <h2 className="text-base font-bold" style={{ color: '#F6FCDF' }}>{product.prodcode}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(246,252,223,0.6)' }}>{product.description}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 transition-all"
            style={{ color: 'rgba(246,252,223,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(246,252,223,0.12)'; e.currentTarget.style.color = '#F6FCDF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(246,252,223,0.5)'; }}
          >
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* current price card */}
        {!loading && currentPrice && (
          <div className="mx-4 mt-4 px-4 py-3.5 rounded-xl shrink-0"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(49,81,30,0.08)', border: '1px solid rgba(133,159,61,0.12)' }}>
            <p className="text-[9px] tracking-[0.18em] uppercase font-semibold mb-0.5"
              style={{ color: 'rgba(133,159,61,0.6)' }}>Current Price</p>
            <p className="text-2xl font-bold" style={{ color: '#31511E' }}>
              {fmt(currentPrice.unitprice)}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'rgba(26,26,25,0.4)' }}>
              Effective {fmtDate(currentPrice.effdate)}
            </p>
          </div>
        )}

        {/* add entry */}
        {canAdd && product.record_status === 'ACTIVE' && (
          <div className="px-4 mt-4 shrink-0">
            <AddPriceEntryForm
              product={product}
              currentUser={currentUser}
              onSuccess={fetchHistory}
            />
          </div>
        )}

        {/* table */}
        <div className="flex-1 overflow-y-auto px-4 mt-4 pb-4">
          <p className="text-[9px] tracking-[0.18em] uppercase font-semibold mb-2 px-0.5"
            style={{ color: 'rgba(26,26,25,0.35)' }}>
            All Entries ({history.length})
          </p>

          {error && (
            <div className="text-xs px-3 py-2 rounded-xl mb-3"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div className="rounded-xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 2px 10px rgba(49,81,30,0.06)', border: '1px solid rgba(133,159,61,0.1)' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(133,159,61,0.1)' }}>
                  <th className="px-3.5 py-2.5 text-left text-[9px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(133,159,61,0.55)', background: 'rgba(246,252,223,0.5)' }}>
                    Eff. Date
                  </th>
                  <th className="px-3.5 py-2.5 text-right text-[9px] font-bold tracking-[0.15em] uppercase"
                    style={{ color: 'rgba(133,159,61,0.55)', background: 'rgba(246,252,223,0.5)' }}>
                    Unit Price
                  </th>
                  {showStamp && (
                    <th className="px-3.5 py-2.5 text-left text-[9px] font-bold tracking-[0.15em] uppercase"
                      style={{ color: 'rgba(133,159,61,0.55)', background: 'rgba(246,252,223,0.5)' }}>
                      Stamp
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                  : history.length === 0
                    ? (
                      <tr>
                        <td colSpan={showStamp ? 3 : 2} className="text-center py-8">
                          <p className="text-xs" style={{ color: 'rgba(26,26,25,0.3)' }}>No price entries yet</p>
                        </td>
                      </tr>
                    )
                    : history.map((row, idx) => (
                      <tr
                        key={row.effdate}
                        style={{ borderTop: idx > 0 ? '1px solid rgba(133,159,61,0.07)' : 'none' }}
                      >
                        <td className="px-3.5 py-2.5 text-xs" style={{ color: '#1A1A19' }}>
                          {fmtDate(row.effdate)}
                          {idx === 0 && (
                            <span className="ml-1.5 text-[8px] px-1.5 py-0.5 rounded-full font-semibold"
                              style={{ background: 'rgba(133,159,61,0.12)', color: '#31511E' }}>
                              Latest
                            </span>
                          )}
                        </td>
                        <td className="px-3.5 py-2.5 text-xs text-right font-semibold" style={{ color: '#31511E' }}>
                          {fmt(row.unitprice)}
                        </td>
                        {showStamp && (
                          <td className="px-3.5 py-2.5 text-[9px] font-mono max-w-[120px] truncate"
                            style={{ color: 'rgba(26,26,25,0.35)' }} title={row.stamp}>
                            {row.stamp ?? '—'}
                          </td>
                        )}
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}