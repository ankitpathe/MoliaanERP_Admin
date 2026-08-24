import React from 'react';
import { Search } from 'lucide-react';

export default function UserFilters({ 
  searchQuery, 
  setSearchQuery, 
  statusFilter, 
  setStatusFilter, 
  roleFilter, 
  setRoleFilter,
  availableRoles 
}) {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      background: '#ffffff',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb'
    }}>
      
      {/* Search Input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '240px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#fafafa',
            outline: 'none',
            color: '#1f2937'
          }}
        />
        <Search size={14} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
      </div>

      {/* Select Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            outline: 'none',
            color: '#4b5563',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            outline: 'none',
            color: '#4b5563',
            cursor: 'pointer'
          }}
        >
          <option value="All">All Roles</option>
          {availableRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </div>

    </div>
  );
}
