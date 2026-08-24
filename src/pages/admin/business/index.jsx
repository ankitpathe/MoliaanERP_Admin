import React from 'react';
import BusinessProfileForm from '../../../components/Admin/Business/BusinessProfileForm';

export default function Business() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Business Profile</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Configure company identity, GSTIN settings, financial defaults, and banking information.</span>
      </div>
      <BusinessProfileForm />
    </div>
  );
}
