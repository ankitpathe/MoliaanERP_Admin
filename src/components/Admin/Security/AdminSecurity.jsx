import React from 'react';

export default function AdminSecurity() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Security Policies & Overview
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Configure password strength rules, session management timeouts, active session lock controls, and two-factor authentication rules.
      </p>
    </div>
  );
}
