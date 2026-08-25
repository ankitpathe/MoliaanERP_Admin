import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = '#7c3aed' }) {
  return (
    <div style={{
      background: '#ffffff',
      padding: '16px 20px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
      boxSizing: 'border-box'
    }}>
      <div>
        <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{label}</span>
        <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '4px 0 0 0' }}>{value}</h4>
      </div>
      {Icon && (
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: `${color}12`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={18} />
        </div>
      )}
    </div>
  );
}
