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
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, role, logout } = useAuth();
  const isAdmin = role === 'admin';

  const adminNavItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Residents Directory', path: '/students', icon: Users },
    { name: 'Hostel Rooms', path: '/rooms', icon: BedDouble },
    { name: 'Room Allotments', path: '/allocations', icon: UserCheck },
    { name: 'Fee & Invoicing', path: '/fees', icon: Receipt },
    { name: 'Maintenance Grievances', path: '/complaints', icon: AlertCircle },
    { name: 'Notice Board', path: '/notices', icon: Bell },
  ];

  const studentNavItems = [
    { name: 'My Profile & Room', path: '/portal', icon: UserCheck2 },
    { name: 'My Fee Invoices', path: '/fees', icon: Receipt },
    { name: 'Maintenance Tickets', path: '/complaints', icon: AlertCircle },
    { name: 'Notice Board', path: '/notices', icon: Bell },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(6px)',
            zIndex: 35,
          }}
        />
      )}

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon-box">
              <Building2 size={24} />
            </div>
            <div>
              <div className="brand-text-title">HostelHub</div>
              <div className="brand-text-subtitle">Campus Residence</div>
            </div>
          </div>
          {isMobileOpen && (
            <button onClick={onCloseMobile} className="btn-icon btn-sm">
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">
            {isAdmin ? 'Administration Hub' : 'Resident Portal'}
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

          {/* Quick Hostel Helpline Widget */}
          <div
            style={{
              marginTop: 'auto',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary-600)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '0.3rem' }}>
              <PhoneCall size={14} />
              Hostel Emergency Desk
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              24/7 Warden Duty Hotline:
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              +91 (0) 11 2345 6789
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-mini-card">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="user-avatar" />
            ) : (
              <div className="user-avatar-placeholder">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                }}
              >
                {user?.name || 'User'}
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--primary-600)',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                }}
              >
                {user?.role || 'Guest'} Account
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="btn-icon btn-sm"
              style={{ width: '32px', height: '32px', color: 'var(--danger)' }}
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
