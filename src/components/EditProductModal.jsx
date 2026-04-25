import { useState } from 'react';
import { updateProduct } from '../services/productService';
import { ModalShell } from './AddProductModal';

const UNITS = ['pc', 'ea', 'mtr', 'pkg', 'ltr'];

const Field = ({ label, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] tracking-[0.18em] font-semibold uppercase"
      style={{ color: 'rgba(49,81,30,0.65)' }}>
      {label}
    </label>
    {children}
    {error && <p className="text-[10px]" style={{ color: '#dc2626' }}>{error}</p>}
  </div>
);

export default function EditProductModal({ product, currentUser, onClose, onSuccess }) {
  const [form, setForm] = useState({
    description: product.description ?? '',
    unit: product.unit ?? 'pc',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
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
      await updateProduct(
        product.prodcode,
        { description: form.description, unit: form.unit },
        currentUser?.userid ?? currentUser?.id
      );
      onSuccess();
    } catch (error) {
      setServerError(error.message);
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
    <ModalShell title="Edit Product" onClose={onClose}>
      <div className="flex flex-col gap-4">
        {/* read-only code */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] tracking-[0.18em] font-semibold uppercase"
            style={{ color: 'rgba(49,81,30,0.65)' }}>Product Code</label>
          <div className="w-full rounded-xl px-3.5 py-2.5 text-sm font-bold"
            style={{ background: 'rgba(133,159,61,0.08)', color: '#31511E' }}>
            {product.prodcode}
          </div>
          <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.35)' }}>Product code cannot be changed</p>
        </div>

        <Field label="Description" error={errors.description}>
          <input
            type="text"
            maxLength={30}
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
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}