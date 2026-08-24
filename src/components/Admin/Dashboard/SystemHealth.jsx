import React from 'react';
import { HardDrive } from 'lucide-react';

export default function SystemHealth({ storageUsed, storagePercent, logsCount }) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <HardDrive size={18} style={{ color: '#4b5563' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>System Telemetry & Health</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px' }}>
            <span>LocalStorage Utilization</span>
            <strong>{storageUsed}</strong>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${storagePercent}%`, 
              height: '100%', 
              background: storagePercent > 80 ? '#dc2626' : '#7c7a6e',
              transition: 'width 0.4s ease'
            }} />
          </div>
          <span style={{ display: 'block', fontSize: '0.7rem', color: '#9ca3af', marginTop: '6px', textAlign: 'right' }}>
            Approx. 5.0 MB browser sandbox quota
          </span>
        </div>

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280' }}>
            <span>Application Version</span>
            <strong>v1.0.0-Vite (Stable)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280' }}>
            <span>Telemetry Logger Logs</span>
            <strong>{logsCount} total records</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
