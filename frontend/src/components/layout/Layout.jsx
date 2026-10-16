import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Hostel Operations Dashboard';
      case '/students':
        return 'Student Directory & Records';
      case '/rooms':
        return 'Hostel Rooms & Inventory';
      case '/allocations':
        return 'Room Allotments & Bed Assignments';
      case '/fees':
        return 'Fee Invoices & Transactions';
      case '/complaints':
        return 'Complaints & Maintenance Tickets';
      case '/notices':
        return 'Notice Board & Alerts';
      case '/portal':
        return 'Resident Student Dashboard';
      default:
        return 'Hostel Management';
    }
  };

  return (
    <div className="app-container">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="main-wrapper">
        <Header
          pageTitle={getPageTitle(location.pathname)}
          onToggleMobile={() => setIsMobileOpen((prev) => !prev)}
        />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
