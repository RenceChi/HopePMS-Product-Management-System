import { useState } from 'react';
import { addProduct } from '../services/productService';

const UNITS = ['pc', 'ea', 'mtr', 'pkg', 'ltr'];

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] tracking-[0.18em] font-semibold uppercase"
      style={{ color: 'rgba(49,81,30,0.65)' }}>
      {label}
    </label>
    {children}
    {error && (
      <p className="text-[10px]" style={{ color: '#dc2626' }}>{error}</p>
    )}
  </div>
);

export default function AddProductModal({ currentUser, onClose, onSuccess }) {
  const [form, setForm] = useState({ prodcode: '', description: '', unit: 'pc' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.prodcode.trim()) e.prodcode = 'Product code is required';
    else if (!/^[A-Za-z0-9]{1,6}$/.test(form.prodcode.trim())) e.prodcode = 'Max 6 alphanumeric characters';
    if (!form.description.trim()) e.description = 'Description is required';
    else if (form.description.trim().length > 30) e.description = 'Max 30 characters';
    if (!form.unit) e.unit = 'Unit is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setServerError('');

    try {
      await addProduct(
        { prodcode: form.prodcode, description: form.description, unit: form.unit },
        currentUser?.userid ?? currentUser?.id
      );
      onSuccess();
    } catch (error) {
      setServerError(error.code === '23505' ? 'Product code already exists.' : error.message);
      setSubmitting(false);
    }
  };

  const inputStyle = (err) => ({
    background: 'white',
    color: '#1A1A19',
    boxShadow: err
      ? '0 0 0 2px rgba(239,68,68,0.4), 0 2px 8px rgba(49,81,30,0.06)'
      : '0 2px 8px rgba(49,81,30,0.06)',
  });

  return (
    <ModalShell title="Add Product" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Field label="Product Code" error={errors.prodcode}>
          <input
            type="text"
            maxLength={6}
            placeholder="e.g. AK0001"
            value={form.prodcode}
            onChange={e => set('prodcode', e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all uppercase"
            style={inputStyle(errors.prodcode)}
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(133,159,61,0.45), 0 2px 8px rgba(49,81,30,0.06)'}
            onBlur={e => e.target.style.boxShadow = inputStyle(errors.prodcode).boxShadow}
          />
        </Field>

        <Field label="Description" error={errors.description}>
          <input
            type="text"
            maxLength={30}
            placeholder="Product description (max 30 chars)"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
            style={inputStyle(errors.description)}
            onFocus={e => e.target.style.boxShadow = '0 0 0 2px rgba(133,159,61,0.45), 0 2px 8px rgba(49,81,30,0.06)'}
            onBlur={e => e.target.style.boxShadow = inputStyle(errors.description).boxShadow}
          />
          <p className="text-[10px] text-right" style={{ color: 'rgba(26,26,25,0.3)' }}>
            {form.description.length}/30
          </p>
        </Field>

        <Field label="Unit" error={errors.unit}>
          <div className="flex gap-2 flex-wrap">
            {UNITS.map(u => (
              <button
                key={u}
                type="button"
                onClick={() => set('unit', u)}
                className="px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: form.unit === u ? '#31511E' : 'white',
                  color: form.unit === u ? '#F6FCDF' : 'rgba(26,26,25,0.55)',
                  boxShadow: form.unit === u
                    ? '0 2px 8px rgba(49,81,30,0.2)'
                    : '0 2px 8px rgba(49,81,30,0.06)',
                }}
              >
                {u}
              </button>
            ))}
          </div>
        </Field>

        {serverError && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px]"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.18)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            {serverError}
          </div>
        )}

        <div className="flex gap-2.5 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(133,159,61,0.09)', color: '#31511E' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(133,159,61,0.16)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(133,159,61,0.09)'}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: submitting ? 'rgba(49,81,30,0.5)' : '#31511E',
              color: '#F6FCDF',
              boxShadow: '0 2px 10px rgba(49,81,30,0.22)',
            }}
          >
            {submitting && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {submitting ? 'Saving…' : 'Add Product'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* ── shared modal shell ─────────────────────────────── */
export function ModalShell({ title, onClose, children, width = 'max-w-md' }) {
  return (
    <div
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,25,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`w-full ${width} rounded-2xl overflow-hidden`}
        style={{
          background: '#f2f5ee',
          boxShadow: '0 24px 64px rgba(26,26,25,0.22)',
          border: '1px solid rgba(133,159,61,0.15)',
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(133,159,61,0.1)' }}>
          <h2 className="text-base font-bold" style={{ color: '#1A1A19' }}>{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{ color: 'rgba(26,26,25,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(133,159,61,0.12)'; e.currentTarget.style.color = '#1A1A19'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(26,26,25,0.4)'; }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        {/* body */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}