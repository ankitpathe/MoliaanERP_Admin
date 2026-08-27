import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminLayout from '../../components/Admin/Layout/AdminLayout';
import AdminSidebar from '../../components/Admin/Layout/AdminSidebar';
import AdminHeader from '../../components/Admin/Layout/AdminHeader';

export default function AdminShell() {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('erp_theme');
    if (saved) {
      if (saved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return saved;
    }
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
      return 'dark';
    }
    return 'light';
  });
  const location = useLocation();

  const getHeaderTitle = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length > 1) {
      if (parts[1] === 'dashboard') return "Admin Dashboard";
      if (parts[1] === 'activity-logs') return "System Activity Logs";
      if (parts[1] === 'system-health') return "System Health Monitor";
      if (parts[1] === 'roles') return "Roles & Permissions";
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' / ');
    }
    return "Admin Control Center";
  };

  return (
    <div className={theme === 'dark' ? 'theme-dark' : 'theme-light'} style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <AdminLayout
        sidebar={
          <AdminSidebar />
        }
        header={
          <AdminHeader 
            title={getHeaderTitle()}
            profileDropdownOpen={profileDropdownOpen}
            setProfileDropdownOpen={setProfileDropdownOpen}
            theme={theme}
            setTheme={setTheme}
          />
        }
      >
        <Outlet context={{ theme, setTheme }} />
      </AdminLayout>
    </div>
  );
}
