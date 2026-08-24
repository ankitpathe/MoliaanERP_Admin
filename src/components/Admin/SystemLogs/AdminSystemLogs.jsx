import React from 'react';

export default function AdminSystemLogs() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: '#111827', margin: 0 }}>
        System Diagnostics & Error Logs
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.925rem', margin: 0 }}>
        View internal application logs, server-side stack traces, failed requests, database transactions, and background queue statuses.
      </p>
    </div>
  );
}
