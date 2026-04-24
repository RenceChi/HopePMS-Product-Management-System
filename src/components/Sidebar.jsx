import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    adminOnly: true,
  },
];

/* Deleted Items item — admin/superadmin only */
const deletedItemsEntry = {
  label: 'Deleted Items',
  to: '/deleted-items',
  icon: (
    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
  ),
};

export default function Sidebar({ open, isMobile, onClose }) {
  if (isMobile) {
    return (
      <>
        {open && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-200"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          />
        )}
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
  const { currentUser } = useAuth();
  const userType = currentUser?.user_type ?? 'USER';
  const isAdminOrSuperAdmin = ['ADMIN', 'SUPERADMIN'].includes(userType);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3.5 flex flex-col gap-4.5
        [&::-webkit-scrollbar]:w-0.75 [&::-webkit-scrollbar-thumb]:bg-[rgba(133,159,61,0.2)] [&::-webkit-scrollbar-thumb]:rounded">

        {navGroups
          .filter(group => !group.adminOnly || isAdminOrSuperAdmin)
          .map(group => (
          <div key={group.section}>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 mb-1 whitespace-nowrap"
              style={{ color: 'rgba(133,159,61,0.5)' }}>
              {group.section}
            </p>
            <div className="flex flex-col gap-px">
              {group.items.map(item => (
                <NavItem key={item.to} item={item} isMobile={isMobile} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}

        {/* Deleted Items — ADMIN / SUPERADMIN only */}
        {isAdminOrSuperAdmin && (
          <div>
            <p className="text-[9px] font-bold tracking-[0.2em] uppercase px-2 mb-1 whitespace-nowrap"
              style={{ color: 'rgba(133,159,61,0.5)' }}>
              Archive
            </p>
            <div className="flex flex-col gap-px">
              <NavItem item={deletedItemsEntry} isMobile={isMobile} onClose={onClose} isDestructive />
            </div>
          </div>
        )}
      </nav>

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

function NavItem({ item, isMobile, onClose, isDestructive }) {
  return (
    <NavLink
      to={item.to}
      onClick={() => { if (isMobile && onClose) onClose(); }}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] text-[13px] whitespace-nowrap overflow-hidden no-underline transition-all duration-150
        ${isActive
          ? 'font-semibold shadow-[0_2px_10px_rgba(49,81,30,0.18)]'
          : 'font-medium'
        }`
      }
      style={({ isActive }) => isDestructive
        ? {
            background: isActive ? '#dc2626' : 'transparent',
            color: isActive ? 'white' : 'rgba(220,38,38,0.65)',
          }
        : {
            background: isActive ? '#31511E' : 'transparent',
            color: isActive ? '#92af1b' : 'rgba(26,26,25,0.55)',
          }
      }
      onMouseEnter={e => {
        if (!e.currentTarget.dataset.active) {
          e.currentTarget.style.background = isDestructive
            ? 'rgba(239,68,68,0.08)'
            : 'rgba(133,159,61,0.09)';
        }
      }}
      onMouseLeave={e => {
        if (!e.currentTarget.dataset.active) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <span className="shrink-0 flex">{item.icon}</span>
      {item.label}
    </NavLink>
  );
}