import React, { useState, useEffect } from 'react';
import { Menu, Bell, ShieldCheck, User, Sparkles, Building2, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onToggleMobile, pageTitle }) => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="top-header">
      <div className="header-left">
        <button
          onClick={onToggleMobile}
          className="btn-icon"
          id="mobile-menu-toggle"
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {pageTitle || 'Hostel Management'}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.15rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Campus Term 2025-26
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-light)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-600)', fontWeight: 700 }}>
              Live Time: {timeStr}
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Campus Operational Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--success-bg)',
            border: '1px solid var(--success-border)',
            color: 'var(--success)',
            fontSize: '0.78rem',
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
            }}
          />
          Hostel Hub Active
        </div>

        {/* Notice Board Link */}
        <button
          onClick={() => navigate('/notices')}
          className="btn-icon"
          title="Announcements & Alerts"
        >
          <Bell size={18} />
        </button>

        {/* User Pill / Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.35rem 0.85rem 0.35rem 0.45rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 800,
              }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}

          <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {user?.name?.split(' ')[0] || 'User'}
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'capitalize' }}>
              {isAdmin ? 'Chief Warden' : 'Resident'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
