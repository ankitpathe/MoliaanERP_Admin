import React from 'react';
import BillingConfig from '../../../components/Admin/Billing/BillingConfig';

export default function Billing() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Billing Configuration</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Configure invoice layout templates, custom branding logos, business terms, and print properties.</span>
      </div>
      <BillingConfig />
    </div>
  );
}
