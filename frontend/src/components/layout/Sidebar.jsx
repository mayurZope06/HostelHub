import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BedDouble,
  UserCheck,
  Receipt,
  AlertCircle,
  Bell,
  LogOut,
  Building2,
  UserCheck2,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'admin';

  const adminNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Rooms', path: '/rooms', icon: BedDouble },
    { name: 'Allocations', path: '/allocations', icon: UserCheck },
    { name: 'Fee Management', path: '/fees', icon: Receipt },
    { name: 'Complaints', path: '/complaints', icon: AlertCircle },
    { name: 'Notice Board', path: '/notices', icon: Bell },
  ];

  const studentNavItems = [
    { name: 'My Profile & Room', path: '/portal', icon: UserCheck2 },
    { name: 'My Fee Invoices', path: '/fees', icon: Receipt },
    { name: 'Complaints', path: '/complaints', icon: AlertCircle },
    { name: 'Notice Board', path: '/notices', icon: Bell },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-box">
              <Building2 size={22} />
            </div>
            <span>HostelHub</span>
          </div>
          {isMobileOpen && (
            <button onClick={onCloseMobile} className="btn-icon" style={{ width: '32px', height: '32px' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {isAdmin ? 'Administration' : 'Student Portal'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onCloseMobile}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}
              >
                {user?.role || 'Guest'}
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="btn-icon btn-sm"
              style={{ width: '30px', height: '30px', color: 'var(--danger)' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
