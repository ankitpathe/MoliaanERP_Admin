import React from 'react';
import AllUsersTable from '../../../components/Admin/Users/AllUsersTable';

export default function Users() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header section wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Users & Merchants
        </h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Manage merchant profiles, adjust SaaS validity plans, and allocate terminals.
        </span>
      </div>

      <AllUsersTable />
    </div>
  );
}
