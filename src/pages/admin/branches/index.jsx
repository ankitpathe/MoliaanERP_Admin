import React from 'react';
import BranchManagement from '../../../components/Admin/Branches/BranchManagement';

export default function Branches() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <BranchManagement />
    </div>
  );
}
