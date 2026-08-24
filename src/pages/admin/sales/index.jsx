import React from 'react';
import SalesConfig from '../../../components/Admin/Sales/SalesConfig';

export default function Sales() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Sales Configuration</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Configure invoice prefix sequences, max discounts limits, return windows, and POS printing rules.</span>
      </div>
      <SalesConfig />
    </div>
  );
}
