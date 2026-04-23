import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../db/supabase';

export default function Navbar({ user, sidebarOpen, onMenuToggle }) {
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const firstname = user?.user_metadata?.firstname ?? '';
  const lastname  = user?.user_metadata?.lastname  ?? '';
  const username  = user?.user_metadata?.username  ?? user?.email?.split('@')[0] ?? 'User';
  const initials  = firstname && lastname
    ? `${firstname[0]}${lastname[0]}`.toUpperCase()
    : username[0]?.toUpperCase() ?? 'U';

  return (
    <header
      className="flex items-center gap-3 px-4 shrink-0 relative z-100"
      style={{
        height: 60,
        background: '#31511E',
        boxShadow: '0 2px 16px rgba(26,26,25,0.2)',
      }}
    >
      {/* ── Hamburger ── */}
      <button
        onClick={onMenuToggle}
        aria-label="Toggle sidebar"
        className="w-9.5 h-9.5 rounded-[10px] border-none bg-transparent cursor-pointer flex flex-col items-center justify-center gap-1.25 shrink-0 p-0 transition-colors hover:bg-[rgba(133,159,61,0.25)]"
      >
        <span
          className="block w-5 h-0.5 rounded-sm"
          style={{ background: '#F6FCDF' }}
        />
        <span
          className="block w-5 h-0.5 rounded-sm"
          style={{ background: '#F6FCDF' }}
        />
        <span
          className="block w-5 h-0.5 rounded-sm"
          style={{ background: '#F6FCDF' }}
        />
      </button>

      {/* ── Brand ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center"
          style={{ background: '#859F3D' }}
        >
          <svg width="17" height="17" fill="white" viewBox="0 0 24 24">
            <path d="M3 3h7v7H3zm11 0h7v7h-7zm0 11h7v7h-7zM3 14l3.5-3.5L10 14l-3.5 3.5z"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span
            className="text-[10px] tracking-[0.25em] font-bold uppercase leading-none"
            style={{ color: '#859F3D' }}
          >
            Hope, Inc.
          </span>
          <span
            className="text-[7.5px] tracking-[0.18em] uppercase leading-none mt-0.5"
            style={{ color: 'rgba(246,252,223,0.35)' }}
          >
            Product Management
          </span>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Notification Bell ── */}
      <button
        className="w-9 h-9 rounded-[9px] border-none bg-transparent cursor-pointer flex items-center justify-center relative shrink-0 transition-all"
        style={{ color: 'rgba(246,252,223,0.6)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(133,159,61,0.2)'; e.currentTarget.style.color = '#F6FCDF'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(246,252,223,0.6)'; }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        <span
          className="absolute top-1.75 right-1.75 w-1.75 h-1.75 rounded-full border-[1.5px]"
          style={{ background: '#859F3D', borderColor: '#31511E' }}
        />
      </button>

      {/* ── Avatar + Dropdown ── */}
      <div className="relative shrink-0" ref={dropRef}>
        <button
          onClick={() => setDropOpen(o => !o)}
          className="flex items-center gap-2 py-1 pr-2 pl-1 rounded-full border-none bg-transparent cursor-pointer transition-colors hover:bg-[rgba(133,159,61,0.2)]"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #859F3D, #4a7a22)' }}
          >
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold leading-tight" style={{ color: '#F6FCDF' }}>{username}</div>
            <div className="text-[9px] capitalize leading-tight" style={{ color: 'rgba(246,252,223,0.4)' }}>
              {(user?.user_type ?? user?.user_metadata?.user_type ?? 'user').toLowerCase()}
            </div>
          </div>
          <svg
            width="12" height="12" fill="none" stroke="rgba(246,252,223,0.4)" viewBox="0 0 24 24"
            className="hidden sm:block transition-transform duration-200"
            style={{ transform: dropOpen ? 'rotate(180deg)' : 'none' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        {dropOpen && (
          <div
            className="absolute right-0 w-52.5 bg-white rounded-2xl overflow-hidden z-200"
            style={{
              top: 'calc(100% + 8px)',
              boxShadow: '0 8px 32px rgba(26,26,25,0.14)',
              border: '1px solid rgba(133,159,61,0.12)',
            }}
          >
            <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(133,159,61,0.1)' }}>
              <div className="text-[13px] font-bold text-[#1A1A19]">{username}</div>
              <div className="text-[10px] mt-0.5 truncate" style={{ color: 'rgba(26,26,25,0.4)' }}>{user?.email}</div>
            </div>

            {[
              { label: 'My Profile', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/> },
              { label: 'Settings',   icon: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></> },
            ].map(item => (
              <button
                key={item.label}
                className="w-full px-4 py-2.75 flex items-center gap-2.5 text-[13px] text-[#1A1A19] bg-none border-none cursor-pointer text-left transition-colors hover:bg-[rgba(133,159,61,0.08)]"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                {item.label}
              </button>
            ))}

            <div className="h-px" style={{ background: 'rgba(133,159,61,0.1)' }} />

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.75 flex items-center gap-2.5 text-[13px] text-red-600 bg-none border-none cursor-pointer text-left transition-colors hover:bg-red-50"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}