import React from 'react';
import SubscriptionReportsTable from '../../../components/Admin/Plans/SubscriptionReportsTable';

export default function SubReportsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <SubscriptionReportsTable />
    </div>
  );
}
