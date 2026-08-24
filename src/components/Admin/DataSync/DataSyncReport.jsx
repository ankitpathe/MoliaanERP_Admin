import React, { useState, useEffect } from 'react';
import { Database, AlertCircle, CheckCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export default function DataSyncReport() {
  const toast = useToast();
  const [syncLogs, setSyncLogs] = useState([]);
  const [counters, setCounters] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    try {
      const logs = JSON.parse(localStorage.getItem('erp_sync_logs') || '[]');
      if (logs.length === 0) {
        const sampleLogs = [
          { id: 'SYNC-101', counterId: 'Counter-01', counterName: 'Delhi POS-01', timestamp: new Date(Date.now() - 600000).toISOString(), status: 'Success', details: 'Pushed 12 billing receipts' },
          { id: 'SYNC-102', counterId: 'Counter-02', counterName: 'Mumbai POS-02', timestamp: new Date(Date.now() - 1200000).toISOString(), status: 'Success', details: 'Synced local master catalogs' },
          { id: 'SYNC-103', counterId: 'Counter-03', counterName: 'Kolkata POS-01', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'Warning', details: 'Network timeout retried. Synced 4 receipts with warning.' }
        ];
        localStorage.setItem('erp_sync_logs', JSON.stringify(sampleLogs));
        setSyncLogs(sampleLogs);
      } else {
        setSyncLogs(logs);
      }

      const activeCounters = [
        { id: 'Counter-01', name: 'Delhi POS-01', branch: 'Delhi Central', mac: '00:1A:2B:3C:4D:5E', lastPing: new Date(Date.now() - 120000).toISOString(), status: 'Online', pendingBatches: 0, latency: '45ms' },
        { id: 'Counter-02', name: 'Mumbai POS-02', branch: 'Mumbai Bandra', mac: '00:1A:2B:3C:4D:5F', lastPing: new Date(Date.now() - 300000).toISOString(), status: 'Online', pendingBatches: 0, latency: '72ms' },
        { id: 'Counter-03', name: 'Kolkata POS-01', branch: 'Kolkata Saltlake', mac: '00:1A:2B:3C:4D:60', lastPing: new Date(Date.now() - 1800000).toISOString(), status: 'Offline', pendingBatches: 3, latency: '—' }
      ];
      setCounters(activeCounters);
    } catch (e) {
      console.error('Error loading sync logs:', e);
    }
  }, []);

  const triggerForceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.showSuccess('Sync Triggered', 'Force catalog synchronization pushed to all active POS terminals.');
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Sync Health Monitor</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Real-time terminal network status, sync lag indicators, and pending databases queue log.</span>
        </div>
        <button
          onClick={triggerForceSync}
          disabled={isSyncing}
          style={{
            padding: '10px 16px',
            background: '#7c7a6e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'Syncing...' : 'Force Catalog Push'}
        </button>
      </div>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Sync Status</span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>Online / Healthy</h4>
          </div>
          <CheckCircle size={24} style={{ color: '#10b981' }} />
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Pending Queue Batches</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', margin: '4px 0' }}>3 Sync Bundles</h4>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Avg Network Latency</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>58.5 ms</h4>
        </div>
      </div>

      {/* Counters Grid list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>Registered POS Terminals & Counters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {counters.map(counter => (
            <div key={counter.id} style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>{counter.name}</span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '99px',
                  background: counter.status === 'Online' ? '#ecfdf5' : '#fef2f2',
                  color: counter.status === 'Online' ? '#059669' : '#dc2626'
                }}>
                  {counter.status}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: '#6b7280' }}>
                <span><strong>Branch:</strong> {counter.branch}</span>
                <span><strong>MAC Address:</strong> {counter.mac}</span>
                <span><strong>Last Active:</strong> {new Date(counter.lastPing).toLocaleTimeString()}</span>
                <span><strong>Sync Latency:</strong> {counter.latency}</span>
                {counter.pendingBatches > 0 && (
                  <span style={{ color: '#ef4444', fontWeight: 700 }}><strong>Pending Batches:</strong> {counter.pendingBatches} unsynced</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync logs Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', margin: 0 }}>Recent Synchronization Logs</h3>
        <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Log ID</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>POS Terminal</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Sync Timestamp</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {syncLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>{log.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>{log.counterName}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      background: log.status === 'Success' ? '#ecfdf5' : '#fffbeb',
                      color: log.status === 'Success' ? '#059669' : '#d97706'
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
