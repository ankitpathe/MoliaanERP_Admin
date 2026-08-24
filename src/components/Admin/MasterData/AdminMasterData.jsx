import React from 'react';

export default function AdminMasterData() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        ERP Master Data Control
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Administrative view and management of master datasets: Customers, Suppliers, Categories, Brands, Units, Payment Methods, and Tax Groups.
      </p>
    </div>
  );
}
