import React from 'react';

export default function AdminBillingConfig() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Billing & Invoice Configuration
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Configure billing settings, default layout templates (A4 vs Thermal), printing standards, PDF styles, and active payment gateway channels.
      </p>
    </div>
  );
}
