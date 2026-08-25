import React from 'react';

export default function SectionDivider({ label, style = {}, ...props }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0', width: '100%', ...style }} {...props}>
      {label && (
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
    </div>
  );
}
