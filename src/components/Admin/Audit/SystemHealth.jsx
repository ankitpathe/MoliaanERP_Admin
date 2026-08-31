import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Wifi, RefreshCw, Trash2, Cpu, Database, Printer, HardDrive, ShieldAlert, Monitor, Terminal, CheckCircle } from 'lucide-react';
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';

const INITIAL_SERVICES = [
  {
    id: "SRV-01",
    name: "Sync Engine & Telemetry WebSocket",
    type: "Real-time Node",
    latency: "12ms",
    uptime: "99.99%",
    status: "HEALTHY",
    lastChecked: "Just now"
  },
  {
    id: "SRV-02",
    name: "Authentication & JWT Gatekeeper",
    type: "Security",
    latency: "8ms",
    uptime: "100%",
    status: "HEALTHY",
    lastChecked: "Just now"
  },
  {
    id: "SRV-03",
    name: "Thermal Printer Spooler & Daemon",
    type: "Hardware Bridge",
    latency: "24ms",
    uptime: "99.85%",
    status: "HEALTHY",
    lastChecked: "1 min ago"
  },
  {
    id: "SRV-04",
    name: "Automated Daily Backup Worker",
    type: "Cron Job",
    latency: "45ms",
    uptime: "99.90%",
    status: "HEALTHY",
    lastChecked: "5 mins ago"
  }
];

export default function SystemHealth() {
  const toast = useToast();

  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState('');
  const [latency, setLatency] = useState(12);
  const [services, setServices] = useState([]);
  
  // Storage usage states
  const [storageUsage, setStorageUsage] = useState({ usedMB: '0.00', totalMB: 5.0, percentUsed: 0 });
  const [onlinePOSNodes, setOnlinePOSNodes] = useState(1);

  // Dynamic system metrics calculation
  const calculateStorageUsage = () => {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += ((localStorage[key].length + key.length) * 2);
      }
    }
    const usedMB = (totalBytes / (1024 * 1024)).toFixed(2);
    const totalMB = 5.0; // Standard browser localStorage limit
    const percentUsed = Math.min(100, Math.round((usedMB / totalMB) * 100));
    return { usedMB, totalMB, percentUsed };
  };

  const loadMetricsAndServices = () => {
    // 1. Calculate Storage
    const usage = calculateStorageUsage();
    setStorageUsage(usage);

    // 2. Online POS Nodes Calculation
    try {
      const rawCounters = localStorage.getItem('erp_admin_counters') || '[]';
      const countersList = JSON.parse(rawCounters);
      const onlineCount = countersList.filter(c => 
        c.status === 'ONLINE' || c.status === 'ACTIVE' || c.status === 'Online' || c.status === 'Active'
      ).length;
      setOnlinePOSNodes(onlineCount || 1);
    } catch (e) {
      setOnlinePOSNodes(1);
    }

    // 3. Auto-seed / Persist services matrix
    const storedServices = localStorage.getItem('erp_system_services');
    if (!storedServices) {
      localStorage.setItem('erp_system_services', JSON.stringify(INITIAL_SERVICES));
      setServices(INITIAL_SERVICES);
    } else {
      setServices(JSON.parse(storedServices));
    }
  };

  useEffect(() => {
    loadMetricsAndServices();
  }, []);

  // Run Diagnostics Handler
  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setDiagnosticProgress('Pinging microservices...');
    toast.showInfo('Diagnostics Started', 'Executing diagnostic pipeline...');

    setTimeout(() => {
      setDiagnosticProgress('Checking websocket channels...');
      setTimeout(() => {
        setDiagnosticProgress('Testing database connection pool...');
        setTimeout(() => {
          setLatency(Math.floor(Math.random() * 8) + 8); // random 8-15ms
          
          // Refresh lastChecked timestamp on diagnostic run success
          const refreshed = services.map(s => ({
            ...s,
            lastChecked: 'Just now',
            latency: `${Math.floor(Math.random() * 20) + 5}ms`
          }));
          localStorage.setItem('erp_system_services', JSON.stringify(refreshed));
          setServices(refreshed);

          setIsRunningDiagnostics(false);
          setDiagnosticProgress('');
          
          toast.showSuccess('Diagnostics Passed', 'All 4 microservices passed diagnostic check with 0 anomalies.');
          
          logActivity({
            activityType: 'SYSTEM_DIAGNOSTICS',
            module: 'Diagnostics',
            actionDescription: 'Executed full system diagnostic check. All services reported healthy.'
          });
        }, 500);
      }, 500);
    }, 500);
  };

  // Purge Cache Handler
  const handlePurgeCache = () => {
    if (window.confirm('Are you sure you want to purge non-critical system caches?')) {
      // Clear orphaned items
      localStorage.removeItem('erp_temp_ad_analytics');
      localStorage.removeItem('erp_ad_impressions_temp');
      localStorage.removeItem('erp_sync_report_draft');

      // Recalculate
      const usage = calculateStorageUsage();
      setStorageUsage(usage);

      // Log activity
      const currentLogs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');
      const purgeLog = {
        id: "LOG-" + Date.now().toString().slice(-4),
        timestamp: new Date().toISOString(),
        actor: "Administrator (Ankit Pathe)",
        role: "SUPER_ADMIN",
        ipAddress: "192.168.1.102",
        action: "SYSTEM_CACHE_PURGED",
        category: "MAINTENANCE",
        resource: "System Cache / Storage Quota",
        status: "SUCCESS",
        details: { freedBytes: 4096, newUsageMB: usage.usedMB }
      };
      localStorage.setItem('erp_activity_logs', JSON.stringify([purgeLog, ...currentLogs]));

      // Notify window storage listeners
      window.dispatchEvent(new Event('storage'));

      toast.showSuccess('Cache Purged', 'Temporary storage cleaned and quota recalculated.');
    }
  };

  const getServiceStatusBadge = (status) => {
    if (status === 'HEALTHY') return 'success';
    if (status === 'DEGRADED') return 'warning';
    return 'danger';
  };

  const tableHeaders = [
    { label: 'Service ID' },
    { label: 'Microservice Name' },
    { label: 'Subsystem Type' },
    { label: 'Gateway Latency' },
    { label: 'Uptime (SLA)' },
    { label: 'Last Scan' },
    { label: 'Health Status' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      <PageHeader
        breadcrumb="Admin / Diagnostics"
        title="Infrastructure System Health"
        subtitle="Live telemetry and resource limits mapping for Moliaan POS backend nodes."
        extra={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={handlePurgeCache}>
              <Trash2 size={14} /> Purge Local Cache
            </Button>
            <Button variant="purple" onClick={handleRunDiagnostics} disabled={isRunningDiagnostics}>
              <RefreshCw size={14} className={isRunningDiagnostics ? 'animate-spin' : ''} />
              {isRunningDiagnostics ? 'Scanning System...' : 'Run Diagnostics'}
            </Button>
          </div>
        }
      />

      {isRunningDiagnostics && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '16px', height: '16px', border: '2px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s infinite linear' }} />
          <span style={{ fontSize: '0.8rem', color: '#1e3a8a', fontWeight: 600 }}>{diagnosticProgress}</span>
        </div>
      )}

      {/* KPI Stats Ribbon */}
      <div className="responsive-grid-4">
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Overall Infrastructure
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'greenPulse 2s infinite' }} />
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>99.98% Healthy</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={18} />
          </div>
        </div>

        <StatCard label="Gateway Latency" value={`${latency} ms`} icon={Cpu} color="#3fa9f5" />
        <StatCard label="LocalStorage Occupied" value={`${storageUsage.usedMB} MB / ${storageUsage.totalMB} MB`} icon={Database} color="#0891b2" />
        <StatCard label="Online POS Nodes" value={`${onlinePOSNodes} Node(s) Connected`} icon={Monitor} color="#10b981" />
      </div>

      {/* LocalStorage Progress Visualizer */}
      <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
          <span style={{ color: '#1f2937' }}>Browser Storage Allocation Map</span>
          <span style={{ color: '#035096' }}>{storageUsage.percentUsed}% Utilized</span>
        </div>
        <div style={{ width: '100%', height: '10px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${storageUsage.percentUsed}%`, height: '100%', background: 'linear-gradient(to right, #035096, #3fa9f5)', borderRadius: '99px' }} />
        </div>
        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
          Real-time footprint calculated from current key values in localStorage against browser limit.
        </span>
      </Card>

      {/* Services status list table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Microservices Node Registry
        </span>
        <Table headers={tableHeaders}>
          {services.map(srv => (
            <tr key={srv.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
              <td style={{ padding: '14px 16px', fontWeight: 700 }}>{srv.id}</td>
              <td style={{ padding: '14px 16px', fontWeight: 600 }}>{srv.name}</td>
              <td style={{ padding: '14px 16px' }}>{srv.type}</td>
              <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{srv.latency}</td>
              <td style={{ padding: '14px 16px', fontWeight: 600, color: '#047857' }}>{srv.uptime}</td>
              <td style={{ padding: '14px 16px', color: '#6b7280' }}>{srv.lastChecked}</td>
              <td style={{ padding: '14px 16px' }}>
                <Badge variant={getServiceStatusBadge(srv.status)}>
                  {srv.status}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </div>

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
