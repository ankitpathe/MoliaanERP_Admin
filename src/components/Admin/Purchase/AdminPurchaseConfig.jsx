import React from 'react';

export default function AdminPurchaseConfig() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Purchase Configuration
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Manage purchase settings, invoice sequence rules, supplier default conditions, payment limits, and approval policies.
      </p>
    </div>
  );
}
