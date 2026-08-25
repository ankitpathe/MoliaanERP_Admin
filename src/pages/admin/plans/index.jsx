import React from 'react';
import AllPlansGrid from '../../../components/Admin/Plans/AllPlansGrid';

export default function AllPlansPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header section wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          SaaS Billing Tiers
        </h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Inspect SaaS billing plans tiers, maximum terminal counters quotas, and active stores.
        </span>
      </div>

      <AllPlansGrid />
    </div>
  );
}
