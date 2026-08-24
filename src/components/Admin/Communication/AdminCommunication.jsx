import React from 'react';

export default function AdminCommunication() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Communication Integration Settings
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Configure SMTP email accounts, WhatsApp API channels, SMS gateway credentials, and standard message templates.
      </p>
    </div>
  );
}
