import React from 'react';

export default function AdminSalesConfig() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Sales Configuration
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Configure invoice numbering rules, discounts, return settings, payment methods, defaults, and POS settings.
      </p>
    </div>
  );
}
