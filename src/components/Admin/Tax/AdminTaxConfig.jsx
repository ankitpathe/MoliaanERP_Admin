import React from 'react';

export default function AdminTaxConfig() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        GST & Tax Configuration
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Manage GST rates, tax grouping definitions, HSN/SAC lookups, and state-wise or country-wise fiscal default codes.
      </p>
    </div>
  );
}
