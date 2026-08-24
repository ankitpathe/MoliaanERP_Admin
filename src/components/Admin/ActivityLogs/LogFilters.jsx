import React from 'react';
import { Search } from 'lucide-react';

export default function LogFilters({
  search,
  setSearch,
  moduleFilter,
  setModuleFilter,
  typeFilter,
  setTypeFilter,
  dateRange,
  setDateRange
}) {
  const modules = ['All', 'Authentication', 'Users', 'Employees', 'Roles', 'Branch Settings', 'Sales Settings', 'Inventory Settings', 'Billing Settings', 'Tax Settings', 'Master Data'];
  const types = ['All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'PRINT', 'DOWNLOAD', 'PAYMENT', 'EXPORT'];
  const dateOptions = [
    { value: 'ALL', label: 'All Time' },
    { value: 'TODAY', label: 'Today' },
    { value: 'YESTERDAY', label: 'Yesterday' },
    { value: 'LAST_7', label: 'Last 7 Days' }
  ];

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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user, description, or action..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            fontSize: '0.85rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            background: '#fafafa',
            outline: 'none'
          }}
        />
        <Search size={14} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
      </div>

      {/* Module filter */}
      <select
        value={moduleFilter}
        onChange={(e) => setModuleFilter(e.target.value)}
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
        {modules.map(mod => (
          <option key={mod} value={mod}>{mod === 'All' ? 'All Modules' : mod}</option>
        ))}
      </select>

      {/* Action Type filter */}
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
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
        {types.map(t => (
          <option key={t} value={t}>{t === 'All' ? 'All Action Types' : t}</option>
        ))}
      </select>

      {/* Quick Date Range */}
      <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
        {dateOptions.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDateRange(opt.value)}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              background: dateRange === opt.value ? '#ffffff' : 'transparent',
              color: dateRange === opt.value ? '#111827' : '#6b7280',
              cursor: 'pointer',
              boxShadow: dateRange === opt.value ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

    </div>
  );
}
