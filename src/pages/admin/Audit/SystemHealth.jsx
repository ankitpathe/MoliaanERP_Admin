import React from 'react';
import SystemHealthDiagnostics from '../../../components/Admin/Audit/SystemHealth';

export default function SystemHealth() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <SystemHealthDiagnostics />
    </div>
  );
}
