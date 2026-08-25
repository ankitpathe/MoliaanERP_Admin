import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Layers, ShieldAlert, Cpu, Search, Download, Trash2, Play, Eye, FileText, CheckCircle, RefreshCw, AlertTriangle, Key } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';

const STORAGE_KEY = 'erp_activity_logs';

const SEED_LOGS = [
  {
    id: "LOG-2026-001",
    timestamp: new Date(Date.now() - 60000).toISOString(),
    userName: "aman@guptamart.com",
    userRole: "Merchant Owner",
    activityType: "SAAS_PLAN_UPGRADED",
    module: "Subscriptions",
    actionDescription: "Upgraded subscription tier to Gold Pro",
    severity: "SUCCESS",
    ipAddress: "157.44.18.92",
    deviceBrowser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0",
    userAgentHash: "UA-SHA256-88F4",
    payloadDiff: {
      before: { planId: "PLAN-BASIC", planName: "Silver Starter", price: 299 },
      after: { planId: "PLAN-PRO", planName: "Gold Pro", price: 699 }
    }
  },
  {
    id: "LOG-2026-002",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userName: "Owner/Admin",
    userRole: "Administrator",
    activityType: "MERCHANT_SUSPENDED",
    module: "Merchants",
    actionDescription: "Suspended Apex Footwear Hub account due to unpaid dues",
    severity: "CRITICAL",
    ipAddress: "192.168.1.1",
    deviceBrowser: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/16.6",
    userAgentHash: "UA-SHA256-44B1",
    payloadDiff: {
      before: { status: "ACTIVE", restrictionLevel: "NONE" },
      after: { status: "SUSPENDED", restrictionLevel: "FULL_LOCK" }
    }
  },
  {
    id: "LOG-2026-003",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    userName: "POS-01 Terminal",
    userRole: "POS Node",
    activityType: "SYNC_FAILED",
    module: "Data Sync",
    actionDescription: "Conflict: Counter invoice number duplicate detected",
    severity: "WARNING",
    ipAddress: "103.22.19.4",
    deviceBrowser: "MoliaanPOS-Native-Client v3.1",
    userAgentHash: "UA-SHA256-991A",
    payloadDiff: {
      conflictField: "invoiceSequence",
      conflictingValue: "INV-2026-101",
      resolutionStrategy: "AUTO_RENAME_SEQUENCE"
    }
  },
  {
    id: "LOG-2026-004",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    userName: "System Scheduler",
    userRole: "Daemon Engine",
    activityType: "DATABASE_BACKUP",
    module: "Security & Auth",
    actionDescription: "Completed daily cloud database snapshot",
    severity: "INFO",
    ipAddress: "127.0.0.1",
    deviceBrowser: "NodeJS Server Daemon v20",
    userAgentHash: "UA-SHA256-BACKUP",
    payloadDiff: {
      backupId: "SNAP-992",
      compressedSizeBytes: 18402920,
      destination: "AWS-S3-Mumbai"
    }
  }
];

export default function ActivityLogViewer() {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [severityTab, setSeverityTab] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'SUCCESS' | 'INFO'
  const [moduleFilter, setModuleFilter] = useState('All');
  const [dateRange, setDateRange] = useState('ALL_TIME'); // 'ALL_TIME' | 'TODAY' | 'LAST_24_HOURS' | 'LAST_7_DAYS'

  // Stream & Purge states
  const [autoStream, setAutoStream] = useState(false);
  const [showPurgeDropdown, setShowPurgeDropdown] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState({});

  useEffect(() => {
    const loadLogs = () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || JSON.parse(raw).length === 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_LOGS));
        setLogs(SEED_LOGS);
      } else {
        setLogs(JSON.parse(raw));
      }
    };
    loadLogs();
  }, []);

  const saveLogs = (updated) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setLogs(updated);
  };

  // Real-time stream effect
  useEffect(() => {
    if (!autoStream) return;
    const interval = setInterval(() => {
      const raw = localStorage.getItem(STORAGE_KEY) || '[]';
      let current = JSON.parse(raw);

      const mockModules = ['Data Sync', 'POS Terminals', 'Security & Auth'];
      const randomModule = mockModules[Math.floor(Math.random() * mockModules.length)];
      const newLog = {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        userName: "Live Stream Node",
        userRole: "POS Node",
        activityType: "NODE_HEARTBEAT",
        module: randomModule,
        actionDescription: `Active node telemetry ping received from ${randomModule} counter`,
        severity: "INFO",
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        deviceBrowser: "MoliaanPOS-Native-Client v3.1",
        userAgentHash: "UA-SHA256-LIVE-PING",
        payloadDiff: { pingLatencyMs: Math.floor(Math.random() * 30) + 5, queueStatus: "CLEAN" }
      };

      const updated = [newLog, ...current].slice(0, 100);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setLogs(updated);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoStream]);

  // Tab & severity counters
  const getCounts = () => {
    return {
      ALL: logs.length,
      CRITICAL: logs.filter(l => l.severity === 'CRITICAL').length,
      WARNING: logs.filter(l => l.severity === 'WARNING').length,
      SUCCESS: logs.filter(l => l.severity === 'SUCCESS').length,
      INFO: logs.filter(l => l.severity === 'INFO').length,
    };
  };

  const counts = getCounts();

  // Re-usable clear utilities
  const handlePurgeLogs = (type) => {
    let updated = [...logs];
    setShowPurgeDropdown(false);

    if (type === 'ALL') {
      updated = [];
      toast.showInfo('Audits Purged', 'Cleared all activity logs.');
    } else if (type === '7_DAYS') {
      const limit = Date.now() - 7 * 24 * 3600000;
      updated = logs.filter(l => new Date(l.timestamp).getTime() >= limit);
      toast.showInfo('Audits Purged', 'Cleared logs older than 7 days.');
    } else if (type === 'INFO') {
      updated = logs.filter(l => l.severity !== 'INFO');
      toast.showInfo('Audits Purged', 'Cleared all INFO logs.');
    }

    saveLogs(updated);
    logActivity({
      activityType: 'SYNC_QUEUE_PURGED',
      module: 'Security & Auth',
      actionDescription: `Executed retention purge operation: ${type}`
    });
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No logs matching filters to export.');
      return;
    }

    const headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action Type', 'Module', 'Description', 'Severity', 'IP Address', 'Browser'];
    const rows = filtered.map(l => [
      l.id,
      l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A',
      l.userName,
      l.userRole,
      l.activityType,
      l.module,
      l.actionDescription,
      l.severity,
      l.ipAddress || '',
      l.deviceBrowser
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Moliaan_Security_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.showSuccess('Export Success', 'Audit logs exported to CSV.');
  };

  // JSON Export utility
  const handleExportJSON = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No logs matching filters to export.');
      return;
    }

    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Moliaan_JSON_Audit_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.showSuccess('Export Success', 'Audit logs exported to JSON successfully.');
  };

  const copyPayload = (payload) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    toast.showSuccess('Copied', 'JSON payload copied to clipboard.');
  };

  const toggleRow = (id) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter application
  const filtered = logs.filter(l => {
    const matchesSearch = 
      (l.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.activityType || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.ipAddress || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.actionDescription || '').toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityTab === 'ALL' || l.severity === severityTab;
    const matchesModule = moduleFilter === 'All' || l.module === moduleFilter;

    // Date Filters
    let matchesDate = true;
    if (dateRange !== 'ALL_TIME') {
      const logTime = new Date(l.timestamp).getTime();
      const diffHrs = (Date.now() - logTime) / 3600000;
      if (dateRange === 'TODAY' && diffHrs > 24) matchesDate = false;
      if (dateRange === 'LAST_24_HOURS' && diffHrs > 24) matchesDate = false;
      if (dateRange === 'LAST_7_DAYS' && diffHrs > 168) matchesDate = false;
    }

    return matchesSearch && matchesSeverity && matchesModule && matchesDate;
  });

  const tableHeaders = [
    { label: '' },
    { label: 'Time & Log ID' },
    { label: 'Operator User' },
    { label: 'Module / Action Slug' },
    { label: 'Activity Description' },
    { label: 'IP Address' },
    { label: 'Severity' },
    { label: 'Details', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Diagnostics / Audit Logs"
        title="Developer & Security Audit Logs"
        subtitle="System-wide activity logger tracking SaaS upgrades, node telemetry syncs, and administrative events."
        extra={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
            {/* Auto Stream Toggle */}
            <button
              onClick={() => setAutoStream(!autoStream)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: autoStream ? '#f0fdf4' : '#ffffff',
                color: autoStream ? '#166534' : '#374151',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: autoStream ? 'greenPulse 2.5s infinite' : 'none' }} />
              {autoStream ? 'Live Streaming' : 'Auto Stream'}
            </button>

            {/* Purge button */}
            <button
              onClick={() => setShowPurgeDropdown(!showPurgeDropdown)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                background: '#ffffff',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={13} /> Purge Logs
            </button>

            {showPurgeDropdown && (
              <>
                <div onClick={() => setShowPurgeDropdown(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }} />
                <div style={{
                  position: 'absolute',
                  top: '38px',
                  right: '180px',
                  width: '210px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  padding: '6px',
                  zIndex: 99,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <button
                    onClick={() => handlePurgeLogs('7_DAYS')}
                    style={{ padding: '8px', fontSize: '0.75rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#374151', borderRadius: '6px' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Clear logs older than 7 days
                  </button>
                  <button
                    onClick={() => handlePurgeLogs('INFO')}
                    style={{ padding: '8px', fontSize: '0.75rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#374151', borderRadius: '6px' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Clear all INFO logs
                  </button>
                  <button
                    onClick={() => handlePurgeLogs('ALL')}
                    style={{ padding: '8px', fontSize: '0.75rem', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#ef4444', fontWeight: 600, borderRadius: '6px' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    Clear All Logs
                  </button>
                </div>
              </>
            )}

            <Button variant="secondary" onClick={handleExportCSV}>Export CSV</Button>
            <Button variant="purple" onClick={handleExportJSON}>Export JSON</Button>
          </div>
        }
      />

      {/* Filter Toolbar & Severity count Tabs */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Severity count tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'All', val: 'ALL', count: counts.ALL },
            { label: 'CRITICAL', val: 'CRITICAL', count: counts.CRITICAL },
            { label: 'WARNING', val: 'WARNING', count: counts.WARNING },
            { label: 'SUCCESS', val: 'SUCCESS', count: counts.SUCCESS },
            { label: 'INFO', val: 'INFO', count: counts.INFO }
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setSeverityTab(tab.val)}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: severityTab === tab.val ? '#1f2937' : 'transparent',
                color: severityTab === tab.val ? '#ffffff' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '0.65rem', background: severityTab === tab.val ? 'rgba(255,255,255,0.15)' : '#f3f4f6', padding: '1px 6px', borderRadius: '4px' }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
            <Input 
              type="text" 
              placeholder="Search user, action slug, IP address..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
          </div>

          <Select value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="ALL_TIME">Date: All Time</option>
            <option value="TODAY">Today</option>
            <option value="LAST_24_HOURS">Last 24 Hours</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
          </Select>

          <Select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            <option value="All">All Modules</option>
            <option value="Subscriptions">Subscriptions</option>
            <option value="POS Terminals">POS Terminals</option>
            <option value="Merchants">Merchants</option>
            <option value="Data Sync">Data Sync</option>
            <option value="Security & Auth">Security & Auth</option>
            <option value="Plans">Plans</option>
          </Select>
        </div>

      </Card>

      {/* Main Table view */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No audit logs matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(log => {
            const isExpanded = !!expandedLogs[log.id];
            return (
              <React.Fragment key={log.id}>
                
                {/* Master Row */}
                <tr style={{ borderBottom: isExpanded ? 'none' : '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                  <td style={{ padding: '14px 16px', width: '20px', cursor: 'pointer' }} onClick={() => toggleRow(log.id)}>
                    {isExpanded ? <ChevronUp size={14} style={{ color: '#7c3aed' }} /> : <ChevronDown size={14} />}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: '#111827' }}>{log.id}</span>
                      <span style={{ fontSize: '0.675rem', color: '#9ca3af' }}>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{log.userName}</span>
                      <span style={{ fontSize: '0.675rem', color: '#6b7280' }}>{log.userRole}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{log.module}</span>
                      <span style={{ fontSize: '0.675rem', color: '#7c3aed', fontFamily: 'monospace' }}>
                        {log.activityType}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.actionDescription}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{log.ipAddress || 'N/A'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={log.severity === 'CRITICAL' ? 'danger' : log.severity === 'WARNING' ? 'warning' : log.severity === 'SUCCESS' ? 'success' : 'info'}>
                      {log.severity}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Button variant="secondary" onClick={() => toggleRow(log.id)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                      {isExpanded ? 'Collapse' : 'Expand Diff'}
                    </Button>
                  </td>
                </tr>

                {/* Audit Diff Expanded Row */}
                {isExpanded && (
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}>
                    <td colSpan={8} style={{ padding: '12px 24px 16px 42px' }}>
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', background: '#ffffff', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
                            <span style={{ color: '#6b7280', fontWeight: 600 }}>Client User-Agent</span>
                            <span style={{ fontWeight: 650, color: '#374151' }}>{log.deviceBrowser || 'N/A'}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem' }}>
                            <span style={{ color: '#6b7280', fontWeight: 600 }}>Operator Device Fingerprint Hash</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4b5563' }}>{log.userAgentHash || 'UA-SHA256-SYSTEM'}</span>
                          </div>
                        </div>

                        {log.payloadDiff && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payload Audit Diff Viewer</span>
                            <pre style={{
                              background: '#1e293b',
                              color: '#f8fafc',
                              padding: '12px',
                              borderRadius: '8px',
                              fontSize: '0.725rem',
                              overflowX: 'auto',
                              margin: 0,
                              fontFamily: 'monospace',
                              lineHeight: 1.4
                            }}>
                              {JSON.stringify(log.payloadDiff, null, 2)}
                            </pre>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifycontent: 'flex-end', gap: '10px' }}>
                          <button
                            onClick={() => copyPayload(log)}
                            style={{
                              padding: '6px 12px',
                              background: '#f3f4f6',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: '#374151',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FileText size={11} /> Copy Raw JSON
                          </button>
                        </div>

                      </div>
                    </td>
                  </tr>
                )}

              </React.Fragment>
            );
          })
        )}
      </Table>

      <style>{`
        @keyframes greenPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            transform: scale(1.4);
            opacity: 0.6;
            box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
          }
        }
      `}</style>

    </div>
  );
}

// Chevron helper arrows since they are not imported or have different sizes
function ChevronDown({ size = 14, style }) {
  return (
    <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ChevronUp({ size = 14, style }) {
  return (
    <svg style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}
