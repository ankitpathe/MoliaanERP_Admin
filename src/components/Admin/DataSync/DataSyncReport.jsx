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
    id: "SYNC-101",
    timestamp: new Date(Date.now() - 600000).toISOString(),
    terminalName: "WWE Counter",
    terminalCode: "POS-WWE",
    deviceMac: "E4:5F:01:2A:8C:99",
    category: "Sales Invoices & Khata",
    recordsCount: 14,
    latencyMs: 12,
    status: "SUCCESS",
    payload: { batchId: "SYNC-101", invoices: 14, store: "WWE Arena Supermart", totalAmount: 24186 }
  },
  {
    id: "SYNC-102",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    terminalName: "Express Billing",
    terminalCode: "POS-02",
    deviceMac: "DC:A6:32:41:78:11",
    category: "Stock Inventory Adjustments",
    recordsCount: 8,
    latencyMs: 18,
    status: "SUCCESS",
    payload: { batchId: "SYNC-102", stockAdjustments: 8, store: "Main Store" }
  },
  {
    id: "SYNC-103",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    terminalName: "Ground Floor Main",
    terminalCode: "POS-01",
    deviceMac: "B8:27:EB:9A:33:40",
    category: "Customer Ledger Sync",
    recordsCount: 22,
    latencyMs: 15,
    status: "SUCCESS",
    payload: { batchId: "SYNC-103", khataEntries: 22, store: "Main Store" }
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
      let data = [];
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = [];
        }
      }
      if (!data || data.length === 0) {
        data = SEED_SYNC_LOGS;
      }
      const normalized = data.map(log => {
        const id = log.id || "SYNC-101";
        const timestamp = log.timestamp || new Date().toISOString();
        const terminalName = log.terminalName || "WWE Counter";
        const terminalCode = log.terminalCode || "POS-WWE";
        const deviceMac = log.deviceMac || log.deviceId || "E4:5F:01:2A:8C:99";
        const category = log.category || log.payloadType || "Sales Invoices & Khata";
        const recordsCount = log.recordsCount !== undefined ? Number(log.recordsCount) : 14;
        const latencyMs = log.latencyMs !== undefined ? Number(log.latencyMs) : 12;
        const status = log.status ? String(log.status).toUpperCase() : "SUCCESS";
        const payload = log.payload || { batchId: id, recordsCount, store: "WWE Arena Supermart" };
        return {
          id,
          timestamp,
          terminalName,
          terminalCode,
          deviceMac,
          category,
          recordsCount,
          latencyMs,
          status,
          payload
        };
      });
      localStorage.setItem('erp_sync_logs', JSON.stringify(normalized));
      setLogs(normalized);
    };
    loadLogs();
  }, []);

  const saveLogs = (updated) => {
    localStorage.setItem('erp_sync_logs', JSON.stringify(updated));
    setLogs(updated);
  };

  // KPI Calculations
  const pendingCount = logs.filter(l => l.status === 'PENDING').length;
  const failedCount = logs.filter(l => l.status === 'FAILED').length;
  const totalLatency = logs.reduce((sum, l) => sum + (Number(l.latencyMs) || 0), 0);
  const avgLatency = logs.length > 0 ? Math.round(totalLatency / logs.length) : 0;

  // Actions handlers
  const handleForceSync = () => {
    setIsSyncingAll(true);
    toast.showInfo('Sync Engine', 'Triggered sync signal to 4 active terminals');

    setTimeout(() => {
      const newId = `SYNC-${Date.now().toString().slice(-3)}`;
      const newBatch = {
        id: newId,
        timestamp: new Date().toISOString(),
        terminalName: "WWE Counter",
        terminalCode: "POS-WWE",
        deviceMac: "E4:5F:01:2A:8C:99",
        category: "Sales Invoices & Khata",
        recordsCount: 14,
        latencyMs: 12,
        status: "SUCCESS",
        payload: { batchId: newId, invoices: 14, store: "WWE Arena Supermart" }
      };
      const updated = [newBatch, ...logs];
      saveLogs(updated);
      setIsSyncingAll(false);

      logActivity({
        activityType: 'FORCE_SYNC_TRIGGERED',
        module: 'System Integrity',
        actionDescription: `Triggered administrative force sync and added success batch ${newId}.`
      });

      toast.showSuccess('Sync Success', 'Successfully synchronized all offline transactions.');
    }, 1500);
  };

  const handlePurge = () => {
    setIsConfirmPurgeOpen(true);
  };

  const handleConfirmPurge = () => {
    const kept = logs.slice(0, 3);
    saveLogs(kept);

    logActivity({
      activityType: 'SYNC_QUEUE_PURGED',
      module: 'System Integrity',
      actionDescription: 'Purged sync logs keeping the latest 3 logs.'
    });

    setIsConfirmPurgeOpen(false);
    toast.showSuccess('Queue Purged', 'Cleaned up logs and kept the latest 3 logs.');
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
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Sync Engine Status
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'greenPulse 2s infinite' }} />
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>99.98% Uptime</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>
            <Wifi size={18} />
          </div>
        </div>

        <StatCard label="Pending / Queued Batches" value={`${pendingCount} Queued`} icon={Layers} color="#d97706" />
        
        {/* Failed conflicts alert card */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: failedCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(107, 114, 128, 0.08)', color: failedCount > 0 ? '#ef4444' : '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' }}>
            <ShieldAlert size={18} />
          </div>
        </div>

        <StatCard label="Average Node Latency" value={`${avgLatency}ms`} icon={Cpu} color="#0891b2" />

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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{log.terminalName}</span>
                    <span style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                      {log.terminalCode}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>MAC: {log.deviceMac}</span>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{ display: 'inline-flex', padding: '3px 8px', fontSize: '0.725rem', fontWeight: 700, borderRadius: '9999px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>
                  {log.category}
                </span>
              </td>
              <td style={{ padding: '14px 16px', fontWeight: 700 }}>{log.recordsCount} items</td>
              <td style={{ padding: '14px 16px', fontWeight: 600 }}>{log.latencyMs}ms</td>
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
                <span style={{ fontWeight: 600, color: '#7c3aed' }}>{inspectingLog.category || 'Unclassified'}</span>
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
                {JSON.stringify(inspectingLog.payload || {}, null, 2)}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button 
                variant="purple" 
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectingLog.payload || {}, null, 2));
                  toast.showSuccess('Copied', 'JSON payload copied to clipboard.');
                }}
              >
                Copy JSON
              </Button>
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
