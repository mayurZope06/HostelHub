import React from 'react';

const StatCard = ({ title, value, subtext, icon: Icon, color = 'var(--primary-600)', trend }) => {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{title}</span>
        <div
          className="stat-icon"
          style={{
            background: `rgba(${color.startsWith('#') ? hexToRgb(color) : '99, 102, 241'}, 0.12)`,
            color: color,
          }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>
      <div>
        <div className="stat-value">{value}</div>
        {subtext && (
          <div className="stat-subtext">
            {trend && (
              <span
                style={{
                  color: trend.startsWith('+') ? 'var(--success)' : 'var(--danger)',
                  fontWeight: 700,
                }}
              >
                {trend}
              </span>
            )}
            <span>{subtext}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple hex to rgb helper
function hexToRgb(hex) {
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

export default StatCard;
