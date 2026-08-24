import React from 'react';

export default function AdminBackup() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Backup & Restore Control
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Manage system backups, database export histories, restore requests, backup schedule routines, and storage targets.
      </p>
    </div>
  );
}
