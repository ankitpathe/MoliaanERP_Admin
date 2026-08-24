import React from 'react';

export default function Notifications() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Alert Triggers</h3>
      <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>Configure webhook and email notification channels.</p>
    </div>
  );
}
