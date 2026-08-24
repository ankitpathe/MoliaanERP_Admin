import React from 'react';

export default function AdminBusiness() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Business Profile & Company Information
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Configure company details, logo, addresses, tax registration info (GSTIN, PAN), and active financial year settings.
      </p>
    </div>
  );
}
