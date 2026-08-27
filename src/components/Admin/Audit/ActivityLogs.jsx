import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Layers, ShieldAlert, Cpu, Search, Download, Trash2, Eye, RefreshCw, Key, Copy, Check } from 'lucide-react';
import Card from '../../ui/Card';
import PageHeader from '../../ui/PageHeader';
import StatCard from '../../ui/StatCard';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Badge from '../../ui/Badge';
import Table from '../../ui/Table';

const SEED_LOGS = [
  {
    id: "LOG-2026-8901",
    timestamp: new Date().toISOString(),
    actor: "Administrator (Ankit Pathe)",
    role: "SUPER_ADMIN",
    ipAddress: "192.168.1.102",
    action: "PLAN_MODIFIED",
    category: "MUTATION",
    resource: "WWE Arena Supermart (₹899 Pro)",
    status: "SUCCESS",
    details: { previousPlan: "Silver (₹499)", newPlan: "WWE Pro (₹899)", authorizedBy: "admin@moliaan.com" }
  },
  {
    id: "LOG-2026-8902",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actor: "System Engine",
    role: "SYSTEM_CRON",
    ipAddress: "127.0.0.1",
    action: "DATA_SYNC_COMPLETED",
    category: "MUTATION",
    resource: "POS-WWE Terminal (14 Invoices)",
    status: "SUCCESS",
    details: { batchId: "SYNC-101", latency: "12ms", records: 14 }
  },
  {
    id: "LOG-2026-8903",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    actor: "Ramesh Kumar",
    role: "COUNTER_STAFF",
    ipAddress: "192.168.1.108",
    action: "STOCK_ADJUSTED",
    category: "MUTATION",
    resource: "Fortune Basmati Rice 5kg (+10 Pcs)",
    status: "SUCCESS",
    details: { sku: "SKU-RICE-5K", adjustment: "+10", reason: "Direct Consignment Inward" }
  },
  {
    id: "LOG-2026-8904",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    actor: "Unknown Session",
    role: "GUEST",
    ipAddress: "49.36.120.88",
    action: "FAILED_LOGIN_ATTEMPT",
    category: "SECURITY",
    resource: "Admin Portal (/admin/login)",
    status: "CRITICAL",
    details: { reason: "Invalid OTP Token", attemptCount: 3 }
  }
];

export default function ActivityLogs() {
  const toast = useToast();

  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Inspection modal state
  const [inspectingLog, setInspectingLog] = useState(null);

  useEffect(() => {
    const loadLogs = () => {
      const raw = localStorage.getItem('erp_activity_logs');
      let data = [];
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = [];
        }
      }
      if (!data || data.length === 0 || !data[0].actor) {
        data = SEED_LOGS;
      }
      const normalized = data.map(log => {
        return {
          id: log.id || "LOG-" + Date.now().toString().slice(-4),
          timestamp: log.timestamp || new Date().toISOString(),
          actor: log.actor || "System",
          role: log.role || "SYSTEM_CRON",
          ipAddress: log.ipAddress || "127.0.0.1",
          action: log.action || "SYSTEM_EVENT",
          category: log.category || "SYSTEM",
          resource: log.resource || "N/A",
          status: log.status || "SUCCESS",
          details: log.details || {}
        };
      });
      localStorage.setItem('erp_activity_logs', JSON.stringify(normalized));
      setLogs(normalized);
    };
    loadLogs();
  }, []);

  const handleRefresh = () => {
    const raw = localStorage.getItem('erp_activity_logs') || '[]';
    setLogs(JSON.parse(raw));
    toast.showSuccess('Data Refreshed', 'Audit logs updated.');
  };

  const saveLogs = (updated) => {
    localStorage.setItem('erp_activity_logs', JSON.stringify(updated));
    setLogs(updated);
  };

  // KPIs
  const totalEvents = logs.length;
  const securityAudits = logs.filter(l => l.category === 'SECURITY').length;
  const dataMutations = logs.filter(l => l.category === 'MUTATION').length;
  const criticalAlerts = logs.filter(l => l.status === 'CRITICAL').length;

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No audit logs matching filters to export.');
      return;
    }

    const headers = ['Log ID', 'Timestamp', 'Actor', 'Role', 'IP Address', 'Action', 'Category', 'Resource', 'Status'];
    const rows = filtered.map(l => [
      l.id,
      l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A',
      l.actor,
      l.role,
      l.ipAddress,
      l.action,
      l.category,
      l.resource,
      l.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Activity_Audit_Report_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.showSuccess('Export Success', 'Audit CSV download completed.');
  };

  const handlePurgeLogs = () => {
    if (window.confirm('Are you sure you want to purge all activity logs? Standard base seed logs will be retained.')) {
      saveLogs(SEED_LOGS);
      logActivity({
        activityType: 'LOGS_PURGED',
        module: 'Security & Auth',
        actionDescription: 'Purged user activity audit trail. Restored default retention logs.'
      });
      toast.showSuccess('Audit Trails Purged', 'Cleaned storage and archived logs.');
    }
  };

  const copyJSON = (details) => {
    navigator.clipboard.writeText(JSON.stringify(details, null, 2));
    toast.showSuccess('Copied', 'JSON payload copied to clipboard.');
  };

  // Filters
  const filtered = logs.filter(l => {
    const matchesSearch = 
      (l.actor || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.resource || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.id || '').toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'All' || l.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || l.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const uniqueCategories = ['All', ...new Set(logs.map(l => l.category).filter(Boolean))];
  const uniqueStatuses = ['All', ...new Set(logs.map(l => l.status).filter(Boolean))];

  const getActorRoleStyles = (role) => {
    if (role.includes('ADMIN')) {
      return { background: '#f3e8ff', color: '#6b21a8' };
    }
    if (role.includes('STAFF')) {
      return { background: '#dbeafe', color: '#1e40af' };
    }
    return { background: '#f1f5f9', color: '#475569' };
  };

  const tableHeaders = [
    { label: 'Time & Log ID' },
    { label: 'Actor User / Role' },
    { label: 'Action & Category' },
    { label: 'Target Resource' },
    { label: 'IP Address' },
    { label: 'Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      <PageHeader
        breadcrumb="Admin / Diagnostics"
        title="Activity Audit Trails"
        subtitle="Consolidated real-time operational logs, administrative mutations, and security diagnostics."
        extra={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button variant="purple" onClick={handleExportCSV}>
              <Download size={14} /> Export Audit CSV
            </Button>
            <Button variant="secondary" onClick={handlePurgeLogs} style={{ color: '#ef4444', borderColor: '#fee2e2' }}>
              <Trash2 size={14} /> Purge / Archive Logs
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <StatCard label="Total Events" value={totalEvents} icon={Layers} color="#4f46e5" />
        <StatCard label="Security Audits" value={securityAudits} icon={ShieldAlert} color="#7c3aed" />
        <StatCard label="Data Mutations" value={dataMutations} icon={Cpu} color="#0891b2" />
        <StatCard label="Critical Alerts" value={criticalAlerts} icon={ShieldAlert} color="#ef4444" />
      </div>

      {/* Filter Controls Card */}
      <Card style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
          <Input 
            type="text" 
            placeholder="Search actor, action, or target resource..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
        </div>

        <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="All">All Categories</option>
          {uniqueCategories.filter(c => c !== 'All').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {uniqueStatuses.filter(s => s !== 'All').map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </Card>

      {/* Main Audit Data Table */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No audit logs matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(log => {
            const roleStyle = getActorRoleStyles(log.role);
            return (
              <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontWeight: 700, color: '#111827' }}>{log.id}</strong>
                    <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 700, color: '#374151' }}>{log.actor}</span>
                    <Badge variant="info" style={roleStyle}>{log.role}</Badge>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                    <Badge variant="info" style={{ background: '#f3f4f6', color: '#1f2937', fontWeight: 700 }}>{log.action}</Badge>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Cat: {log.category}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{log.resource}</td>
                <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{log.ipAddress}</td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={log.status === 'SUCCESS' ? 'success' : log.status === 'WARNING' ? 'warning' : 'danger'}>
                    {log.status}
                  </Badge>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <Button variant="secondary" onClick={() => setInspectingLog(log)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                    <Eye size={12} /> Inspect
                  </Button>
                </td>
              </tr>
            );
          })
        )}
      </Table>

      {/* Inspect JSON Details Modal */}
      {inspectingLog && (() => {
        return (
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
              width: '440px',
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
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>Inspect JSON Log Payload</span>
                <button type="button" onClick={() => setInspectingLog(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                <div><strong>Log ID:</strong> {inspectingLog.id}</div>
                <div><strong>Timestamp:</strong> {new Date(inspectingLog.timestamp).toLocaleString()}</div>
                <div><strong>Actor:</strong> {inspectingLog.actor} ({inspectingLog.role})</div>
                <div><strong>Action:</strong> {inspectingLog.action}</div>
                <div><strong>Target:</strong> {inspectingLog.resource}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 650, color: '#4b5563' }}>Event Details Payload (JSON)</span>
                <pre style={{
                  background: '#1e293b',
                  color: '#f8fafc',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '0.725rem',
                  overflowX: 'auto',
                  margin: 0,
                  fontFamily: 'monospace',
                  maxHeight: '180px'
                }}>
                  {JSON.stringify(inspectingLog.details, null, 2)}
                </pre>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <Button variant="secondary" onClick={() => setInspectingLog(null)} style={{ flex: 1 }}>
                  Close
                </Button>
                <Button variant="purple" onClick={() => copyJSON(inspectingLog.details)} style={{ flex: 1, gap: '4px' }}>
                  <Copy size={12} /> Copy JSON Payload
                </Button>
              </div>
            </div>
          </>
        );
      })()}

    </div>
  );
}
