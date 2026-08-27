import React from 'react';

export default function Table({ headers = [], children, style = {}, ...props }) {
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      background: 'var(--bg-card)',
      borderRadius: '12px',
      border: '1px solid var(--border-muted)',
      color: 'var(--text-primary)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      boxSizing: 'border-box',
      ...style
    }} {...props}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-control)' }}>
            {headers.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: '12px 16px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  ...h.style
                }}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}
