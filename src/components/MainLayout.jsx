import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────────────────────
   DEV ROLE SWITCHER — REMOVE BEFORE SUBMITTING
───────────────────────────────────────────────────────────── */
const DEV_ROLES = ['USER', 'ADMIN', 'SUPERADMIN'];

const ROLE_COLORS = {
  USER:       { bg: '#31511E', ring: '#859F3D' },
  ADMIN:      { bg: '#1d4ed8', ring: '#60a5fa' },
  SUPERADMIN: { bg: '#7c3aed', ring: '#a78bfa' },
};

function DevRoleSwitcher({ currentRole, onSwitch }) {
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      background: '#1A1A19', borderRadius: 14, padding: '10px 14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180,
    }}>
      <p style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: 0,
      }}>
        🧪 Dev — Switch Role
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {DEV_ROLES.map(role => {
          const isActive = currentRole === role;
          const c = ROLE_COLORS[role];
          return (
            <button key={role} onClick={() => onSwitch(role)}
              style={{
                padding: '7px 12px', borderRadius: 9, cursor: 'pointer',
                border: isActive ? `2px solid ${c.ring}` : '2px solid transparent',
                background: isActive ? c.bg : 'rgba(255,255,255,0.06)',
                color: isActive ? 'white' : 'rgba(255,255,255,0.45)',
                fontSize: 12, fontWeight: 700, textAlign: 'left',
                transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: isActive ? c.ring : 'rgba(255,255,255,0.2)',
                display: 'inline-block', flexShrink: 0,
              }} />
              {role}
              {isActive && (
                <span style={{ marginLeft: 'auto', fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                  active
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', margin: 0, lineHeight: 1.4 }}>
        ⚠ Remove before submitting
      </p>
    </div>
  );
}
/* ─── end dev block ─────────────────────────────────────────── */

export default function MainLayout({ children, user }) {
  const { currentUser, setDevRoleOverride } = useAuth();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);

  const effectiveUser = user ?? currentUser;

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#f2f5ee' }}>
      <Navbar
        user={effectiveUser}
        sidebarOpen={sidebarOpen}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          open={sidebarOpen}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto min-w-0 w-full p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* DEV ONLY — remove before submitting */}
      {import.meta.env.DEV && (
        <DevRoleSwitcher
          currentRole={effectiveUser?.user_type ?? 'USER'}
          onSwitch={setDevRoleOverride}
        />
      )}
    </div>
  );
}