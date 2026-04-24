import { useState } from 'react';
import { ModalShell } from './AddProductModal';

export default function SoftDeleteConfirmDialog({ product, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    const err = await onConfirm();
    if (err) {
      setError(err.message ?? 'Something went wrong.');
      setLoading(false);
    }
    // onConfirm handles closing on success
  };

  return (
    <ModalShell title="Soft Delete Product" onClose={onClose}>
      <div className="flex flex-col gap-5">
        {/* warning icon */}
        <div className="flex flex-col items-center gap-3 py-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <svg width="26" height="26" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>
              Deactivate this product?
            </p>
            <p className="text-[12px] mt-1 max-w-xs" style={{ color: 'rgba(26,26,25,0.5)' }}>
              This will set the product to <strong style={{ color: '#dc2626' }}>INACTIVE</strong> and hide it from all USER accounts. Only admins can recover it.
            </p>
          </div>

          {/* product info card */}
          <div className="w-full rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: 'rgba(133,159,61,0.07)', border: '1px solid rgba(133,159,61,0.12)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: '#31511E' }}>
              <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold" style={{ color: '#31511E' }}>{product.prodcode}</p>
              <p className="text-[11px]" style={{ color: 'rgba(26,26,25,0.55)' }}>{product.description}</p>
            </div>
            <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(133,159,61,0.12)', color: '#31511E' }}>
              {product.unit}
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px]"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.18)' }}>
            {error}
          </div>
        )}

        <div className="flex gap-2.5">
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
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              background: loading ? 'rgba(220,38,38,0.5)' : '#dc2626',
              color: 'white',
              boxShadow: '0 2px 10px rgba(220,38,38,0.25)',
            }}
          >
            {loading && (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            {loading ? 'Deactivating…' : 'Yes, Deactivate'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}