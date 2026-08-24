import React from 'react';

export default function AdminInventoryConfig() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Inventory Configuration
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Manage stock rules, low stock thresholds, automated alerts, barcode formatting, default categories, and unit specifications.
      </p>
    </div>
  );
}
