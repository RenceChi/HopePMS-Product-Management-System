import { NavLink } from 'react-router-dom';

const navGroups = [
  {
    section: 'Main',
    items: [
      { label: 'Dashboard', to: '/dashboard',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
    ],
  },
  {
    section: 'Products',
    items: [
      { label: 'Products', to: '/products',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
      { label: 'Price History', to: '/price-history',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
    ],
  },
  {
    section: 'Sales',
    items: [
      { label: 'Sales', to: '/sales',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg> },
      { label: 'Customers', to: '/customers',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
      { label: 'Payments', to: '/payments',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> },
    ],
  },
  {
    section: 'Reports',
    items: [
      { label: 'Reports', to: '/reports',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'User Management', to: '/admin/users',
        icon: <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg> },
    ],
  },
];

export default function Sidebar({ open, isMobile, onClose }) {
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {open && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-200"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          />
        )}
        {/* Drawer */}
        <div
          className="fixed top-15 left-0 w-60 flex flex-col overflow-hidden z-201 transition-transform duration-300"
          style={{
            height: 'calc(100vh - 60px)',
            background: 'white',
            borderRight: '1px solid rgba(133,159,61,0.13)',
            boxShadow: '4px 0 32px rgba(26,26,25,0.15)',
            transform: open ? 'translateX(0)' : 'translateX(-100%)',
            transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <SidebarContent onClose={onClose} isMobile />
        </div>
      </>
    );
  }

  // Desktop: inline collapsible sidebar
  return (
    <div
      className="flex flex-col shrink-0 overflow-hidden transition-all duration-300"
      style={{
        width: open ? 232 : 0,
        minWidth: open ? 232 : 0,
        background: 'white',
        borderRight: '1px solid rgba(133,159,61,0.13)',
        boxShadow: '2px 0 12px rgba(26,26,25,0.04)',
        transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <SidebarContent />
    </div>
  );
}

function SidebarContent({ onClose, isMobile }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3.5 flex flex-col gap-4.5
        [&::-webkit-scrollbar]:w-0.75 [&::-webkit-scrollbar-thumb]:bg-[rgba(133,159,61,0.2)] [&::-webkit-scrollbar-thumb]:rounded">
        {navGroups.map(group => (
          <div key={group.section}>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 mb-1 whitespace-nowrap"
              style={{ color: 'rgba(133,159,61,0.5)' }}>
              {group.section}
            </p>
            <div className="flex flex-col gap-px">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => { if (isMobile && onClose) onClose(); }}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13px] whitespace-nowrap overflow-hidden no-underline transition-all duration-150
                    ${isActive
                      ? 'font-semibold shadow-[0_2px_10px_rgba(49,81,30,0.18)]'
                      : 'font-medium hover:bg-[rgba(133,159,61,0.09)]'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? '#31511E' : 'transparent',
                    color: isActive ? '#F6FCDF' : 'rgba(26,26,25,0.55)',
                  })}
                >
                  <span className="shrink-0 flex">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 flex items-center gap-2 whitespace-nowrap overflow-hidden shrink-0"
        style={{ borderTop: '1px solid rgba(133,159,61,0.1)' }}
      >
        <div className="w-1.25 h-1.25 rounded-full shrink-0" style={{ background: '#859F3D' }} />
        <span className="text-[9px] tracking-[0.12em] uppercase" style={{ color: 'rgba(133,159,61,0.4)' }}>
          Hope PMS v1.0
        </span>
      </div>
    </div>
  );
}