import React from 'react';
import { Search } from 'lucide-react';
import Select from '../../ui/Select';

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
          placeholder="Search by name, email, phone, or store ID..."
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
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>

        {/* Role Filter */}
        <Select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="All">All Roles</option>
          {availableRoles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </Select>
      </div>

    </div>
  );
}
