import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Wifi, RefreshCw, Trash2, ShieldAlert, Cpu, Layers, Play, Eye, FileText, CheckCircle, Search } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import ConfirmDialog from '../../ui/ConfirmDialog';

const SEED_SYNC_LOGS = [
  {
    id: "SYNC-2026-901",
    terminalCode: "POS-01",
    terminalName: "Main Checkout Counter",
    deviceId: "MAC-88A1-POS1",
    payloadType: "Sales Invoices",
    recordsCount: 8,
    latencyMs: 14,
    timestamp: new Date(Date.now() - 120000).toISOString(),
    status: "SUCCESS",
    payloadSummary: "{ invoices: ['INV-2026-101', 'INV-2026-102'], totalAmount: 3450 }"
  },
  {
    id: "SYNC-2026-902",
    terminalCode: "POS-02",
    terminalName: "Express Billing Counter",
    deviceId: "MAC-99B2-POS2",
    payloadType: "Stock Deductions",
    recordsCount: 14,
    latencyMs: 22,
    timestamp: new Date(Date.now() - 600000).toISOString(),
    status: "SUCCESS",
    payloadSummary: "{ stockUpdates: [{ sku: 'OIL-1L', qtyDeducted: 2 }] }"
  },
  {
    id: "SYNC-2026-903",
    terminalCode: "POS-01",
    terminalName: "Main Checkout Counter",
    deviceId: "MAC-88A1-POS1",
    payloadType: "Customer Khata Ledger",
    recordsCount: 2,
    latencyMs: 0,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: "FAILED",
    errorMessage: "Timeout: Cloud node gateway unreachable",
    payloadSummary: "{ khataUpdates: [{ customerId: 'CUST-88', addedUdhar: 500 }] }"
  },
  {
    id: "SYNC-2026-904",
    terminalCode: "POS-03",
    terminalName: "Basement Grocery Hub",
    deviceId: "MAC-77C3-POS3",
    payloadType: "Barcode Catalog Sync",
    recordsCount: 45,
    latencyMs: 38,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: "SUCCESS",
    payloadSummary: "{ catalogVersions: 'v2.4.1' }"
  }
];

export default function DataSyncReport() {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'SUCCESS' | 'FAILED' | 'PENDING'
  const [payloadFilter, setPayloadFilter] = useState('All');
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false);
  
  // Asynchronous Loading state for Syncing
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [inspectingLog, setInspectingLog] = useState(null);

  useEffect(() => {
    const loadLogs = () => {
      const raw = localStorage.getItem('erp_sync_logs');
      if (!raw || JSON.parse(raw).length === 0) {
        localStorage.setItem('erp_sync_logs', JSON.stringify(SEED_SYNC_LOGS));
        setLogs(SEED_SYNC_LOGS);
      } else {
        setLogs(JSON.parse(raw));
      }
    };
    loadLogs();
  }, []);

  const saveLogs = (updated) => {
    localStorage.setItem('erp_sync_logs', JSON.stringify(updated));
    setLogs(updated);
  };

  // KPI Calculations
  const totalBatches = logs.length;
  const pendingCount = logs.filter(l => l.status === 'PENDING' || l.status === 'QUEUED').length;
  const failedCount = logs.filter(l => l.status === 'FAILED' || l.status === 'CONFLICT').length;
  
  const avgLatency = logs.filter(l => l.status === 'SUCCESS').length > 0
    ? Math.round(logs.filter(l => l.status === 'SUCCESS').reduce((sum, l) => sum + (l.latencyMs || 0), 0) / logs.filter(l => l.status === 'SUCCESS').length)
    : 18;

  // Actions handlers
  const handleForceSync = () => {
    setIsSyncingAll(true);
    toast.showInfo('Sync Engine Triggered', 'Force synchronizing all terminal node queues...');

    setTimeout(() => {
      const updated = logs.map(l => ({ ...l, status: 'SUCCESS', latencyMs: l.latencyMs || 15 }));
      saveLogs(updated);
      setIsSyncingAll(false);

      logActivity({
        activityType: 'FORCE_SYNC_TRIGGERED',
        module: 'System Integrity',
        actionDescription: 'Triggered administrative force sync on all POS terminal queues.'
      });

      toast.showSuccess('Sync Success', 'Successfully synchronized all offline transactions.');
    }, 1500);
  };

  const handlePurge = () => {
    setIsConfirmPurgeOpen(true);
  };

  const handleConfirmPurge = () => {
    const startOfToday = new Date().setHours(0,0,0,0);
    const updated = logs.filter(l => {
      // Keep pending/failed logs OR logs from today
      if (l.status !== 'SUCCESS') return true;
      return new Date(l.timestamp).getTime() >= startOfToday;
    });

    saveLogs(updated);

    logActivity({
      activityType: 'SYNC_QUEUE_PURGED',
      module: 'System Integrity',
      actionDescription: 'Purged historical data sync telemetry logs older than today.'
    });

    setIsConfirmPurgeOpen(false);
    toast.showInfo('Queue Purged', 'Cleaned up completed historical logs.');
  };

  const handleRetry = (log) => {
    const updated = logs.map(l => l.id === log.id ? { ...l, status: 'SUCCESS', latencyMs: 25 } : l);
    saveLogs(updated);

    logActivity({
      activityType: 'SYNC_BATCH_RETRY',
      module: 'System Integrity',
      actionDescription: `Retried sync batch ID ${log.id} successfully.`
    });

    toast.showSuccess('Sync Retried', `Batch ${log.id} synchronized successfully.`);
  };

  // Filters application
  const filtered = logs.filter(l => {
    const matchesSearch = 
      (l.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.terminalCode || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.deviceId || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = 
      statusTab === 'ALL' || 
      (statusTab === 'SUCCESS' && l.status === 'SUCCESS') ||
      (statusTab === 'FAILED' && (l.status === 'FAILED' || l.status === 'CONFLICT')) ||
      (statusTab === 'PENDING' && (l.status === 'PENDING' || l.status === 'QUEUED'));

    const matchesPayload = 
      payloadFilter === 'All' || 
      (l.payloadType || '').toLowerCase().includes(payloadFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesPayload;
  });

  const tableHeaders = [
    { label: 'Batch ID & Time' },
    { label: 'Origin Terminal & Device' },
    { label: 'Payload Category' },
    { label: 'Records' },
    { label: 'Latency (ms)' },
    { label: 'Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Diagnostics / Data Sync"
        title="Data Sync & Offline Telemetry Report"
        subtitle="Live sync queue monitoring, POS device heartbeats, and conflict resolution."
        extra={
          <>
            <Button variant="secondary" onClick={handlePurge}>
              <Trash2 size={14} /> Purge Old Logs
            </Button>
            <Button variant="purple" onClick={handleForceSync} disabled={isSyncingAll}>
              <RefreshCw size={14} className={isSyncingAll ? 'animate-spin' : ''} />
              {isSyncingAll ? 'Syncing...' : 'Force Sync All Terminals'}
            </Button>
          </>
        }
      />

      {/* KPI Telemetry Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Sync Engine Health */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Sync Engine Status
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'greenPulse 2s infinite' }} />
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>99.98% Uptime</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifycontent: 'center', marginLeft: 'auto' }}>
            <Wifi size={18} />
          </div>
        </div>

        <StatCard label="Pending / Queued Batches" value={`${pendingCount} Queued`} icon={Layers} color="#d97706" />
        
        {/* Failed conflicts alert card */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Failed / Conflict Syncs
              {failedCount > 0 && (
                <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  ALERT
                </span>
              )}
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: failedCount > 0 ? '#ef4444' : '#111827', margin: '4px 0' }}>{failedCount} Batches</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: failedCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(107, 114, 128, 0.08)', color: failedCount > 0 ? '#ef4444' : '#6b7280', display: 'flex', alignItems: 'center', justifycontent: 'center', marginLeft: 'auto' }}>
            <ShieldAlert size={18} />
          </div>
        </div>

        <StatCard label="Average Node Latency" value={`${avgLatency} ms`} icon={Cpu} color="#0891b2" />

      </div>

      {/* Filter Controls Bar */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', flexWrap: 'wrap' }}>
          {['ALL', 'SUCCESS', 'FAILED', 'PENDING'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: statusTab === tab ? '#1f2937' : 'transparent',
                color: statusTab === tab ? '#ffffff' : '#6b7280',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'FAILED' ? 'Failed / Conflicts' : tab === 'PENDING' ? 'Pending' : tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
            <Input 
              type="text" 
              placeholder="Search batch ID, counter, or MAC address..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
          </div>

          <Select value={payloadFilter} onChange={e => setPayloadFilter(e.target.value)}>
            <option value="All">All Payloads</option>
            <option value="Invoices">Sales Invoices</option>
            <option value="Stock">Stock Deductions</option>
            <option value="Khata">Customer Khata</option>
            <option value="Catalog">Barcode Catalog</option>
          </Select>
        </div>
      </Card>

      {/* Sync Telemetry Table */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No telemetry sync logs matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(log => (
            <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{log.id}</span>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{log.terminalName}</span>
                  <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>Code: {log.terminalCode} ({log.deviceId})</span>
                </div>
              </td>
              <td style={{ padding: '14px 16px', fontWeight: 600, color: '#4f46e5' }}>{log.payloadType}</td>
              <td style={{ padding: '14px 16px', fontWeight: 700 }}>{log.recordsCount} items</td>
              <td style={{ padding: '14px 16px', fontWeight: 600 }}>{log.status === 'SUCCESS' ? `${log.latencyMs}ms` : '--'}</td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <Badge variant={log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'danger' : 'warning'}>
                    {log.status}
                  </Badge>
                  {log.status === 'FAILED' && log.errorMessage && (
                    <span style={{ fontSize: '0.65rem', color: '#ef4444', maxWidth: '150px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={log.errorMessage}>
                      {log.errorMessage}
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  
                  {log.status === 'FAILED' && (
                    <button
                      onClick={() => handleRetry(log)}
                      style={{
                        padding: '6px 10px',
                        background: '#d1fae5',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#065f46',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Play size={10} /> Retry
                    </button>
                  )}

                  <button
                    onClick={() => setInspectingLog(log)}
                    style={{
                      padding: '6px 10px',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      color: '#4b5563',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Eye size={11} /> Inspect
                  </button>

                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      {/* JSON Payload Inspector Modal */}
      {inspectingLog && (
        <>
          <div 
            onClick={() => setInspectingLog(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '420px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText size={16} style={{ color: '#7c3aed' }} /> Inspect Sync Batch Payload
              </span>
              <button onClick={() => setInspectingLog(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.775rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Batch ID:</span>
                <strong>{inspectingLog.id || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Origin Terminal:</span>
                <span>
                  {inspectingLog.terminalName || 'Unknown Terminal'} 
                  {inspectingLog.terminalCode ? ` (${inspectingLog.terminalCode})` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Payload Class:</span>
                <span style={{ fontWeight: 600, color: '#7c3aed' }}>{inspectingLog.payloadType || 'Unclassified'}</span>
              </div>
              {inspectingLog.recordsCount !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Records Count:</span>
                  <span>{inspectingLog.recordsCount || 0} items</span>
                </div>
              )}
              {inspectingLog.latencyMs !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280' }}>Latency:</span>
                  <span>{inspectingLog.status === 'SUCCESS' ? `${inspectingLog.latencyMs}ms` : 'Pending'}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>Raw Payload Summary</span>
              <pre style={{
                background: '#1e293b',
                color: '#f8fafc',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                overflowX: 'auto',
                margin: 0,
                fontFamily: 'monospace',
                lineHeight: 1.4
              }}>
                {inspectingLog.payloadSummary || JSON.stringify({
                  status: inspectingLog.status || "QUEUED",
                  recordsCount: inspectingLog.recordsCount || 0,
                  message: "Batch payload transmission pending queue authorization."
                }, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setInspectingLog(null)} style={{ width: '100px' }}>
                Close
              </Button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes greenPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.6;
          }
        }
      `}</style>

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={isConfirmPurgeOpen}
        title="Purge Completed Logs"
        message="Are you sure you want to clear completed sync queue logs older than today? This does not clear failed or pending entries."
        confirmText="Purge Logs"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmPurge}
        onCancel={() => setIsConfirmPurgeOpen(false)}
      />

    </div>
  );
}
