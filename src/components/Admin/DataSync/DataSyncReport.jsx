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
import Modal from '../../ui/Modal';
import { simulateOfflineTransactions, toggleCounterStatus } from '../../../utils/syncSimulator';

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

  // Offline stats states
  const [offlineCountersCount, setOfflineCountersCount] = useState(0);
  const [totalQueuedCount, setTotalQueuedCount] = useState(0);
  const [counters, setCounters] = useState([]);

  const loadOfflineCountersStats = () => {
    const rawCounters = localStorage.getItem('erp_admin_counters') || '[]';
    try {
      const countersList = JSON.parse(rawCounters);
      setCounters(countersList);
      const offlineList = countersList.filter(c => c.status === 'OFFLINE');
      setOfflineCountersCount(offlineList.length);
      const totalQueued = offlineList.reduce((sum, c) => sum + (c.offlineQueue?.length || 0), 0);
      setTotalQueuedCount(totalQueued);
    } catch (e) {
      setOfflineCountersCount(0);
      setTotalQueuedCount(0);
      setCounters([]);
    }
  };

  useEffect(() => {
    loadOfflineCountersStats();
    
    // Add simulator interval
    const interval = setInterval(() => {
      const raw = localStorage.getItem('erp_admin_counters');
      if (raw) {
        const list = JSON.parse(raw);
        const { updated, changed } = simulateOfflineTransactions(list);
        if (changed) {
          localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
          localStorage.setItem('counters', JSON.stringify(updated));
          loadOfflineCountersStats();
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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
      loadOfflineCountersStats();
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

  const handleToggleTerminal = (id, currentStatus) => {
    const { updatedCounters, nextStatus, processedCount, counterName } = toggleCounterStatus(counters, id, currentStatus);
    localStorage.setItem('erp_admin_counters', JSON.stringify(updatedCounters));
    localStorage.setItem('counters', JSON.stringify(updatedCounters));
    setCounters(updatedCounters);
    loadOfflineCountersStats();
    
    if (processedCount > 0) {
      const raw = localStorage.getItem('erp_sync_logs') || '[]';
      setLogs(JSON.parse(raw));
      toast.showSuccess('Sync Success', `Automatically synced ${processedCount} queued transactions from ${counterName}`);
    } else {
      toast.showSuccess('Status Updated', `Terminal "${counterName}" is now ${nextStatus}`);
    }
  };

  const handleSimulateTransaction = (id) => {
    const updated = counters.map(c => {
      if (c.id === id) {
        const queue = c.offlineQueue || [];
        const recordsCount = Math.floor(1 + Math.random() * 5);
        const categories = ["Sales Invoices & Khata", "Stock Inventory Adjustments", "Customer Ledger Sync"];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const newTx = {
          category,
          recordsCount,
          payload: { note: "Simulated offline transaction", amount: recordsCount * 380 }
        };
        return {
          ...c,
          offlineQueue: [...queue, newTx]
        };
      }
      return c;
    });
    localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
    localStorage.setItem('counters', JSON.stringify(updated));
    setCounters(updated);
    loadOfflineCountersStats();
    toast.showInfo('Simulation', 'Generated 1 offline transaction packet in queue.');
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
      (l.category || '').toLowerCase().includes(payloadFilter.toLowerCase());

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
      <div className="responsive-grid-4">
        
        <StatCard
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Sync Engine Status
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'greenPulse 2s infinite' }} />
            </span>
          }
          value="99.98% Uptime"
          icon={Wifi}
          color="#10b981"
        />

        <StatCard label="Pending / Queued Batches" value={`${pendingCount} Queued`} icon={Layers} color="#d97706" />
        
        <StatCard
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Failed / Conflict Syncs
              {failedCount > 0 && (
                <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>
                  ALERT
                </span>
              )}
            </span>
          }
          value={`${failedCount} Batches`}
          icon={ShieldAlert}
          color={failedCount > 0 ? '#ef4444' : '#6b7280'}
        />

        <StatCard label="Average Node Latency" value={`${avgLatency}ms`} icon={Cpu} color="#0891b2" />

        <StatCard 
          label="Offline Terminals" 
          value={`${offlineCountersCount} (${totalQueuedCount} queued)`} 
          icon={Cpu} 
          color={totalQueuedCount > 0 ? '#ef4444' : '#6b7280'} 
        />

      </div>

      {/* Connectivity & Offline Simulation Panel */}
      <Card style={{ padding: '20px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '12px' }}>
          POS Terminals Connectivity & Simulation Panel (Demo Controls)
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {counters.map(c => {
            const isOnline = String(c.status).toUpperCase() === 'ONLINE';
            const queueLen = c.offlineQueue?.length || 0;
            return (
              <div 
                key={c.id} 
                style={{ 
                  padding: '14px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-muted)', 
                  background: 'var(--bg-control)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{c.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {c.code}</span>
                  </div>
                  <Badge variant={isOnline ? 'success' : 'danger'}>
                    {c.status}
                  </Badge>
                </div>
                
                {!isOnline && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(239, 68, 68, 0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Buffered Queue:</span>
                    <strong style={{ fontSize: '0.75rem', color: '#ef4444' }}>{queueLen} items</strong>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <Button 
                    variant={isOnline ? 'secondary' : 'success'}
                    onClick={() => handleToggleTerminal(c.id, c.status)}
                    style={!isOnline ? { color: '#10b981', borderColor: '#10b981', background: '#f0fdf4', padding: '6px 8px', fontSize: '0.7rem', flex: 1 } : { padding: '6px 8px', fontSize: '0.7rem', flex: 1 }}
                  >
                    {isOnline ? 'Go Offline' : 'Go Online (Sync)'}
                  </Button>
                  
                  {!isOnline && (
                    <Button 
                      variant="purple"
                      onClick={() => handleSimulateTransaction(c.id)}
                      style={{ padding: '6px 8px', fontSize: '0.7rem', flex: 1 }}
                    >
                      + Sim Tx
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

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

        <div className="responsive-filter-bar">
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
      <div className="desktop-view">
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
      </div>

      <div className="mobile-view">
        {filtered.length === 0 ? (
          <Card style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
            No telemetry sync logs matching active filters.
          </Card>
        ) : (
          filtered.map(log => (
            <Card key={log.id} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-control)', border: '1px solid var(--border-muted)', borderRadius: '12px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{log.id}</span>
                <Badge variant={log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'danger' : 'warning'}>
                  {log.status}
                </Badge>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Terminal:</span> <span style={{ fontWeight: 600 }}>{log.terminalName}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Category:</span> <span>{log.category}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Records:</span> <span>{log.recordsCount} items</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Latency:</span> <span>{log.latencyMs}ms</span></div>
              </div>
              {log.status === 'FAILED' && log.errorMessage && (
                <div style={{ fontSize: '0.75rem', color: '#ef4444', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px' }}>
                  {log.errorMessage}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--border-muted)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-dim)' }}>
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {log.status === 'FAILED' && (
                    <Button variant="secondary" onClick={() => handleRetry(log)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                      Retry
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setInspectingLog(log)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                    Inspect
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* JSON Payload Inspector Modal */}
      <Modal
        isOpen={!!inspectingLog}
        onClose={() => setInspectingLog(null)}
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={16} style={{ color: '#035096' }} /> Inspect Sync Batch Payload
          </span>
        }
        width="420px"
      >
        {inspectingLog && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.775rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Batch ID:</span>
                <strong>{inspectingLog.id || 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Origin Terminal:</span>
                <span>
                  {inspectingLog.terminalName || 'Unknown Terminal'} 
                  {inspectingLog.terminalCode ? ` (${inspectingLog.terminalCode})` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payload Class:</span>
                <span style={{ fontWeight: 600, color: '#035096' }}>{inspectingLog.category || 'Unclassified'}</span>
              </div>
              {inspectingLog.recordsCount !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Records Count:</span>
                  <span>{inspectingLog.recordsCount || 0} items</span>
                </div>
              )}
              {inspectingLog.latencyMs !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Latency:</span>
                  <span>{inspectingLog.status === 'SUCCESS' ? `${inspectingLog.latencyMs}ms` : 'Pending'}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Raw Payload Summary</span>
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
          </>
        )}
      </Modal>

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
