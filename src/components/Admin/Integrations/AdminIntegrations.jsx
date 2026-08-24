import React from 'react';

export default function AdminIntegrations() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        External APIs & Integrations
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Enable and configure payment gateway links, e-way bill portals, accounting systems, cloud storage services, and third-party APIs.
      </p>
    </div>
  );
}
