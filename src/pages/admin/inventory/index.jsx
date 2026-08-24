import React from 'react';
import InventoryConfig from '../../../components/Admin/Inventory/InventoryConfig';

export default function Inventory() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Inventory Configuration</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Configure stock thresholds, SKU prefixes, default measurement units, and valuation costing rules.</span>
      </div>
      <InventoryConfig />
    </div>
  );
}
