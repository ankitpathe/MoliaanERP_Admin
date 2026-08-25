import React from 'react';
import SubscriptionRequestsTable from '../../../components/Admin/Plans/SubscriptionRequestsTable';

export default function SubRequestsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header section wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Merchant Subscription Requests
        </h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Verify payment proofs, cross-check UTR numbers, and approve or reject plan upgrade applications.
        </span>
      </div>

      <SubscriptionRequestsTable />
    </div>
  );
}
