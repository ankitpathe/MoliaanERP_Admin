import React from 'react';
import MasterDataManagement from '../../../components/Admin/MasterData/MasterDataManagement';

export default function MasterData() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Master Data Management</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Configure product categories, brands, measurement units, payment modes, and expense heads.</span>
      </div>
      <MasterDataManagement />
    </div>
  );
}
