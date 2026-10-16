import React from 'react';
import { Menu, Sun, Moon, Bell, ShieldCheck, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onToggleMobile, pageTitle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          onClick={onToggleMobile}
          className="btn-icon"
          style={{ display: 'none' }}
          id="mobile-menu-toggle"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
            {pageTitle || 'Hostel Management'}
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Academic Session 2025-2026
          </span>
        </div>
      </div>

      <div className="header-right">
        {/* System Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--success-bg)',
            color: 'var(--success)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse 2s infinite',
            }}
          />
          System Operational
        </div>

        {/* Notices quick link */}
        <button
          onClick={() => navigate('/notices')}
          className="btn-icon"
          title="Notices & Announcements"
        >
          <Bell size={18} />
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          onClick={toggleTheme}
          className="btn-icon"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* User Role Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem',
            fontWeight: 600,
          }}
        >
          {isAdmin ? (
            <ShieldCheck size={16} color="var(--primary-500)" />
          ) : (
            <User size={16} color="var(--info)" />
          )}
          <span>{isAdmin ? 'Admin' : 'Student'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
