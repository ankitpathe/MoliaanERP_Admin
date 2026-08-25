import React from 'react';
import AddPlanForm from '../../../components/Admin/Plans/AddPlanForm';

export default function AddPlanPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Header section wrapper */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Create SaaS Plan
        </h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
          Configure pricing tiers, limit quotas, and package feature entitlements.
        </span>
      </div>

      <AddPlanForm />
    </div>
  );
}
