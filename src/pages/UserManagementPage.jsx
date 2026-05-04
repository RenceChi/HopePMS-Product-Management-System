// src/pages/UserManagementPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRights } from '../context/UserRightsContext';
import { supabase } from '../db/supabase';
import { setUserStatus } from '../services/userService';
import EditRightsModal from '../components/EditRightsModal'; // ← NEW

// ── Sub-components ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
    style={
      status === 'ACTIVE'
        ? { background: 'rgba(133,159,61,0.12)', color: '#31511E' }
        : { background: 'rgba(239,68,68,0.08)', color: '#dc2626' }
    }
  >
    <span
      className="w-1.5 h-1.5 rounded-full"
      style={{ background: status === 'ACTIVE' ? '#859F3D' : '#dc2626' }}
    />
    {status}
  </span>
);

const TypeBadge = ({ userType }) => {
  const styles = {
    SUPERADMIN: { background: 'rgba(133,159,61,0.15)', color: '#31511E', border: '1px solid rgba(133,159,61,0.3)' },
    ADMIN:      { background: 'rgba(26,26,25,0.07)',   color: '#1A1A19', border: '1px solid rgba(26,26,25,0.12)' },
    USER:       { background: 'rgba(133,159,61,0.07)', color: '#859F3D', border: '1px solid rgba(133,159,61,0.15)' },
  };
  return (
    <span
      className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-lg"
      style={styles[userType] ?? styles.USER}
    >
      {userType}
    </span>
  );
};

const SkeletonRow = () => (
  <tr>
    {[35, 25, 20, 30].map((w, i) => (
      <td key={i} className="px-4 py-3.5">
        <div
          className="h-3 rounded-full animate-pulse"
          style={{ background: 'rgba(133,159,61,0.1)', width: `${w}%` }}
        />
      </td>
    ))}
  </tr>
);

// ── main page ──────────────────────────────────────────────────────────────────

export default function UserManagementPage() {
  const { currentUser } = useAuth();
  const { canManageUsers } = useRights();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user')
        .select('userid, username, firstname, lastname, email, user_type, record_status, stamp')
        .order('username', { ascending: true });

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManageUsers) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageUsers]);

  const handleToggleStatus = async (user) => {
    const newStatus = user.record_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setLoading(true);
      await setUserStatus(user.userid, newStatus, currentUser?.userid);
      await fetchUsers();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-3">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.08)' }}
        >
          <svg width="24" height="24" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-9V5a2 2 0 00-2-2H7a2 2 0 00-2 2v3m14 0H5m14 0a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2"/>
          </svg>
        </div>
        <p className="text-sm font-semibold" style={{ color: '#1A1A19' }}>Access Denied</p>
        <p className="text-xs" style={{ color: 'rgba(26,26,25,0.45)' }}>
          You do not have permission to manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1A1A19' }}>User Management</h1>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(26,26,25,0.45)' }}>
            Manage system access and permissions
          </p>
        </div>

        {/* ── ADDED: Refresh button + role badge ── */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150"
            style={{
              background: 'rgba(133,159,61,0.1)',
              color: '#31511E',
              opacity: loading ? 0.5 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#31511E'; e.currentTarget.style.color = '#F6FCDF'; }}}
            onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = 'rgba(133,159,61,0.1)'; e.currentTarget.style.color = '#31511E'; }}}
          >
            <svg
              width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {loading ? 'Loading…' : 'Refresh'}
          </button>

        </div>
      </div>

      {/* ── SUPERADMIN protection notice ── */}
      <div
        className="flex items-start gap-3 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(133,159,61,0.07)', border: '1px solid rgba(133,159,61,0.15)' }}
      >
        <svg className="shrink-0 mt-0.5" width="14" height="14" fill="none" stroke="#859F3D" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p className="text-xs" style={{ color: '#31511E' }}>
          <strong>SUPERADMIN accounts are immutable.</strong> All action buttons are disabled on SUPERADMIN rows
          and are also enforced at the database (RLS) level.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          className="px-4 py-3 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <strong>Database Error:</strong> {error}
          <p className="mt-1 opacity-75">Please check your Supabase RLS policies for the 'user' table.</p>
        </div>
      )}

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 4px 24px rgba(26,26,25,0.07)',
          border: '1px solid rgba(133,159,61,0.1)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(133,159,61,0.12)' }}>
                {['Username', 'Type', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-bold tracking-[0.15em] uppercase"
                    style={{
                      color: 'rgba(133,159,61,0.6)',
                      background: 'rgba(246,252,223,0.45)',
                      textAlign: i === 3 ? 'right' : 'left',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-14">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(133,159,61,0.08)' }}
                      >
                        <svg width="22" height="22" fill="none" stroke="rgba(133,159,61,0.4)" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                      </div>
                      <p className="text-sm font-semibold" style={{ color: 'rgba(26,26,25,0.45)' }}>
                        No users found or access restricted
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                  const isSuperAdminRow = user.user_type === 'SUPERADMIN';

                  return (
                    <tr
                      key={user.userid}
                      className="transition-colors"
                      style={{
                        borderBottom: idx < users.length - 1 ? '1px solid rgba(133,159,61,0.07)' : 'none',
                        background: isSuperAdminRow ? 'rgba(133,159,61,0.03)' : 'transparent',
                      }}
                      onMouseEnter={e => {
                        if (!isSuperAdminRow) e.currentTarget.style.background = 'rgba(133,159,61,0.04)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isSuperAdminRow
                          ? 'rgba(133,159,61,0.03)'
                          : 'transparent';
                      }}
                    >
                      {/* Username + avatar initial */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                              background: isSuperAdminRow
                                ? 'rgba(133,159,61,0.2)'
                                : 'rgba(133,159,61,0.1)',
                              color: '#31511E',
                            }}
                          >
                            {(user.username ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#1A1A19' }}>
                            {user.username}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <TypeBadge userType={user.user_type} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={user.record_status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">

                          <button
                            disabled={isSuperAdminRow}
                            onClick={() => !isSuperAdminRow && setEditTarget(user)}
                            title={isSuperAdminRow ? 'SuperAdmin accounts are immutable' : 'Edit module rights'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
                            style={
                              isSuperAdminRow
                                ? { background: 'rgba(26,26,25,0.04)', color: 'rgba(26,26,25,0.2)', cursor: 'not-allowed' }
                                : { background: 'rgba(133,159,61,0.1)', color: '#31511E' }
                            }
                            onMouseEnter={e => {
                              if (!isSuperAdminRow) {
                                e.currentTarget.style.background = '#31511E';
                                e.currentTarget.style.color = '#F6FCDF';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isSuperAdminRow) {
                                e.currentTarget.style.background = 'rgba(133,159,61,0.1)';
                                e.currentTarget.style.color = '#31511E';
                              }
                            }}
                          >
                            {isSuperAdminRow ? (
                              <>
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-9V5a2 2 0 00-2-2H7a2 2 0 00-2 2v3m14 0H5m14 0a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2"/>
                                </svg>
                                Immutable
                              </>
                            ) : (
                              <>
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Edit Rights
                              </>
                            )}
                          </button>

                          <button
                            disabled={isSuperAdminRow}
                            onClick={() => !isSuperAdminRow && handleToggleStatus(user)}
                            title={isSuperAdminRow ? 'SuperAdmin accounts are immutable' : ''}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
                            style={
                              isSuperAdminRow
                                ? { background: 'transparent', color: 'rgba(26,26,25,0.2)', cursor: 'not-allowed' }
                                : user.record_status === 'ACTIVE'
                                  ? { background: 'rgba(239,68,68,0.08)', color: '#dc2626' }
                                  : { background: 'rgba(133,159,61,0.1)', color: '#31511E' }
                            }
                            onMouseEnter={e => {
                              if (isSuperAdminRow) return;
                              if (user.record_status === 'ACTIVE') {
                                e.currentTarget.style.background = '#dc2626';
                                e.currentTarget.style.color = '#fff';
                              } else {
                                e.currentTarget.style.background = '#31511E';
                                e.currentTarget.style.color = '#F6FCDF';
                              }
                            }}
                            onMouseLeave={e => {
                              if (isSuperAdminRow) return;
                              if (user.record_status === 'ACTIVE') {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                                e.currentTarget.style.color = '#dc2626';
                              } else {
                                e.currentTarget.style.background = 'rgba(133,159,61,0.1)';
                                e.currentTarget.style.color = '#31511E';
                              }
                            }}
                          >
                            {user.record_status === 'ACTIVE' ? (
                              <>
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                                </svg>
                                Deactivate
                              </>
                            ) : (
                              <>
                                <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Activate
                              </>
                            )}
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {!loading && users.length > 0 && (
          <div
            className="px-4 py-2.5"
            style={{ borderTop: '1px solid rgba(133,159,61,0.08)' }}
          >
            <p className="text-[10px]" style={{ color: 'rgba(26,26,25,0.35)' }}>
              {users.length} user{users.length !== 1 ? 's' : ''} in database
            </p>
          </div>
        )}
      </div>

      {/* ── Footer note ── */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(133,159,61,0.5)' }} />
        <p className="text-[10px] italic" style={{ color: 'rgba(26,26,25,0.4)' }}>
          Note: System-level protections prevent modification of SuperAdmin accounts.
        </p>
      </div>

      {/* ── EditRightsModal ── */}
      {editTarget && (
        <EditRightsModal
          user={editTarget}
          actorUserId={currentUser?.userid}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null);
            fetchUsers();
          }}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

    </div>
  );
}