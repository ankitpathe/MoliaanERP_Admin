import React from 'react';
import BackupRestore from '../../../components/Admin/Audit/BackupRestore';

export default function BackupPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <BackupRestore />
    </div>
  );
}
