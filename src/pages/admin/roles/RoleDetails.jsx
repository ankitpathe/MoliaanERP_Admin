import React from 'react';
import { useParams } from 'react-router-dom';

export default function RoleDetails() {
  const { id } = useParams();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        Role Details / Edit
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        Viewing and editing role ID: <strong style={{ color: '#111827' }}>{id}</strong>
      </p>
    </div>
  );
}
