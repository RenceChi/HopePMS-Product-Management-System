// src/components/EditUserTypeModal.jsx
import { useState } from 'react';
import { supabase } from '../db/supabase';
import { makeStamp } from '../utils/stampHelper';
import { useAuth } from '../context/AuthContext';

const USER_TYPES = ['USER', 'ADMIN', 'SUPERADMIN'];

const typeDescriptions = {
  USER:       'Can view products, manage their own data.',
  ADMIN:      'Can manage products, view reports, and manage users.',
  SUPERADMIN: 'Full system access including all reports and admin functions.',
};

export default function EditUserTypeModal({ user, onClose, onSaved }) {
  const { currentUser } = useAuth();
  const [selectedType, setSelectedType] = useState(user?.user_type ?? 'USER');
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState(null);

  const hasChanged = selectedType !== user?.user_type;

  const handleSave = async () => {
    if (!hasChanged) { onClose(); return; }
    setSaving(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('user')
        .update({
          user_type: selectedType,
          stamp: makeStamp('EDITED', currentUser?.userid),
        })
        .eq('userid', user.userid)
        .neq('user_type', 'SUPERADMIN'); // DB-level guard — never touch SUPERADMIN rows

      if (updateError) throw updateError;

      onSaved?.();
      onClose();
    } catch (err) {
      console.error('EditUserTypeModal save error:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,25,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-sm rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 8px 40px rgba(26,26,25,0.18)',
          border: '1px solid rgba(133,159,61,0.15)',
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(133,159,61,0.1)' }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: '#1A1A19' }}>Edit User Type</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>
              {user?.username}
              <span
                className="ml-2 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(133,159,61,0.1)', color: '#31511E' }}
              >
                {user?.user_type}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150"
            style={{ color: 'rgba(26,26,25,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,26,25,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-4 flex flex-col gap-3">

          {error && (
            <div
              className="px-3 py-2.5 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          <p className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(133,159,61,0.55)' }}>
            Select Role
          </p>

          <div className="flex flex-col gap-2">
            {USER_TYPES.map(type => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => !saving && setSelectedType(type)}
                  className="flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                  style={{
                    border: isSelected
                      ? '1.5px solid #31511E'
                      : '1.5px solid rgba(133,159,61,0.15)',
                    background: isSelected
                      ? 'rgba(133,159,61,0.07)'
                      : 'transparent',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {/* Radio dot */}
                  <div
                    className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5"
                    style={{
                      border: isSelected ? '2px solid #31511E' : '2px solid rgba(26,26,25,0.2)',
                      background: isSelected ? '#31511E' : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: isSelected ? '#31511E' : '#1A1A19' }}>
                      {type}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>
                      {typeDescriptions[type]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-end gap-2 px-5 py-4"
          style={{ borderTop: '1px solid rgba(133,159,61,0.1)' }}
        >
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150"
            style={{ background: 'rgba(26,26,25,0.05)', color: 'rgba(26,26,25,0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,26,25,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,26,25,0.05)'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanged}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150"
            style={{
              background: saving || !hasChanged ? 'rgba(133,159,61,0.3)' : '#31511E',
              color: '#F6FCDF',
              cursor: saving || !hasChanged ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!saving && hasChanged) e.currentTarget.style.background = '#1A1A19'; }}
            onMouseLeave={e => { if (!saving && hasChanged) e.currentTarget.style.background = '#31511E'; }}
          >
            {saving ? (
              <>
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Saving…
              </>
            ) : (
              <>
                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}