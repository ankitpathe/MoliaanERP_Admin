import React from 'react';

export default function Notifications() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Notifications Center
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        View and push broadcasts, email updates, and push alerts.
      </p>
    </div>
  );
}
