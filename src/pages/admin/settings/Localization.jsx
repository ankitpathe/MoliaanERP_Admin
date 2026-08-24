import React from 'react';

export default function Localization() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Localization Settings</h3>
      <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>Manage timezone defaults, primary currency, numbers grouping formatting, and regional date/time calendars.</p>
    </div>
  );
}
