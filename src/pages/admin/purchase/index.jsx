import React from 'react';
import PurchaseConfig from '../../../components/Admin/Purchase/PurchaseConfig';

export default function Purchase() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Purchase Configuration</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Configure PO sequences, approval workflows, supplier terms, and receiving rules.</span>
      </div>
      <PurchaseConfig />
    </div>
  );
}
