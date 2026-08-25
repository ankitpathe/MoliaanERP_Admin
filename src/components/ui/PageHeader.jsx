import React from 'react';

export default function PageHeader({ breadcrumb, title, subtitle, extra }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {breadcrumb && (
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {breadcrumb}
          </span>
        )}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          {title}
        </h2>
        {subtitle && (
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {subtitle}
          </span>
        )}
      </div>
      {extra && <div style={{ display: 'flex', gap: '12px' }}>{extra}</div>}
    </div>
  );
}
