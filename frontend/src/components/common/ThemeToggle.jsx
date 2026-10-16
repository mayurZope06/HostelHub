import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Universal ThemeToggle Component
 * Supports:
 * - 'segmented' (Sidebars & settings: 2-button segment control with icons & labels)
 * - 'header' (Navbar: sleek pill with dynamic icon, active text & keyboard badge)
 * - 'floating' (Login/Register: stylish floating glass pill)
 * - 'icon' (Minimalist icon button)
 */
const ThemeToggle = ({ variant = 'header', className = '', showLabel = true }) => {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  if (variant === 'segmented') {
    return (
      <div className={`theme-segmented-control ${className}`} role="group" aria-label="Theme Selection">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`theme-segmented-btn ${theme === 'light' ? 'active' : ''}`}
          id="theme-select-light"
          title="Switch to Light Theme"
        >
          <Sun size={15} className="theme-btn-icon" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`theme-segmented-btn ${theme === 'dark' ? 'active' : ''}`}
          id="theme-select-dark"
          title="Switch to Dark Theme"
        >
          <Moon size={15} className="theme-btn-icon" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-floating-toggle ${className}`}
        id="floating-theme-toggle"
        title={`Current: ${isDark ? 'Dark Mode' : 'Light Mode'} (Click to toggle or press Alt+T)`}
      >
        <div className="theme-toggle-icon-wrap">
          {isDark ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-indigo-600" />
          )}
        </div>
        <span className="theme-toggle-text">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
    );
  }

  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`theme-header-pill ${className}`}
        id="header-theme-toggle"
        title={`Interface Mode: ${isDark ? 'Dark' : 'Light'} (Alt+T)`}
        aria-label="Toggle light and dark theme"
      >
        <span className={`theme-pill-track ${isDark ? 'is-dark' : 'is-light'}`}>
          <span className="theme-pill-thumb">
            {isDark ? (
              <Moon size={13} className="thumb-icon dark-thumb" />
            ) : (
              <Sun size={13} className="thumb-icon light-thumb" />
            )}
          </span>
        </span>
        {showLabel && (
          <span className="theme-header-label">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    );
  }

  // Fallback icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`btn-icon ${className}`}
      id="theme-icon-toggle"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode (Alt+T)`}
    >
      {isDark ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#4f46e5" />}
    </button>
  );
};

export default ThemeToggle;
