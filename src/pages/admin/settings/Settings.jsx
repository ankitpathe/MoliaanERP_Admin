import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function Settings() {
  const tabs = [
    { name: 'General', path: '/admin/settings/general' },
    { name: 'Appearance', path: '/admin/settings/appearance' },
    { name: 'Notifications', path: '/admin/settings/notifications' },
    { name: 'Localization', path: '/admin/settings/localization' },
    { name: 'System', path: '/admin/settings/system' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.path}
            style={({ isActive }) => ({
              padding: '8px 16px',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '6px',
              color: isActive ? '#7c7a6e' : '#6b7280',
              background: isActive ? '#f5ebe1' : 'transparent',
              transition: 'all 0.2s ease'
            })}
          >
            {tab.name}
          </NavLink>
        ))}
      </div>
      
      <div style={{ paddingTop: '10px' }}>
        <Outlet />
      </div>
    </div>
  );
}
