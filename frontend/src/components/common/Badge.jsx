import React from 'react';

const Badge = ({ status, text }) => {
  const displayStatus = text || status;

  const getBadgeClass = (s) => {
    switch (String(s).toLowerCase()) {
      case 'active':
      case 'paid':
      case 'available':
      case 'resolved':
      case 'male':
        return 'badge-success';

      case 'pending':
      case 'partially occupied':
      case 'partial':
      case 'in progress':
      case 'medium':
        return 'badge-warning';

      case 'overdue':
      case 'occupied':
      case 'rejected':
      case 'urgent':
      case 'high':
      case 'suspended':
        return 'badge-danger';

      case 'single':
      case 'double':
      case 'triple':
      case 'dormitory':
      case 'low':
      case 'female':
      case 'maintenance':
        return 'badge-info';

      default:
        return 'badge-neutral';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      <span className="badge-dot" />
      {displayStatus}
    </span>
  );
};

export default Badge;
