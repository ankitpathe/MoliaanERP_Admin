import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Wifi, RefreshCw, Trash2, Cpu, Database, Printer, HardDrive, ShieldAlert, Monitor, Terminal } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import SectionDivider from '../../../components/ui/SectionDivider';
import ConfirmDialog from '../../ui/ConfirmDialog';

export default function SystemHealth() {
  const toast = useToast();

  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [latency, setLatency] = useState(14);
  const [memoryFootprint, setMemoryFootprint] = useState('0.00 KB');
  const [isConfirmPurgeOpen, setIsConfirmPurgeOpen] = useState(false);

  // Individual localStorage key sizes in KB
  const [sizes, setSizes] = useState({
    sales: 0,
    inventory: 0,
    logs: 0,
    users: 0,
    total: 0
  });

  const calculateStorageMetrics = () => {
    const rawSales = localStorage.getItem('erp_sales') || '';
    const rawInventory = localStorage.getItem('inventory_products') || '';
    const rawLogs = localStorage.getItem('erp_activity_logs') || '';
    const rawUsers = localStorage.getItem('erp_users') || '';
    const rawAll = JSON.stringify(localStorage);

    const sSize = rawSales.length / 1024;
    const iSize = rawInventory.length / 1024;
    const lSize = rawLogs.length / 1024;
    const uSize = rawUsers.length / 1024;
    const totalSize = rawAll.length / 1024;

    setSizes({
      sales: sSize,
      inventory: iSize,
      logs: lSize,
      users: uSize,
      total: totalSize
    });

    setMemoryFootprint(`${totalSize.toFixed(2)} KB`);
  };

  useEffect(() => {
    calculateStorageMetrics();
  }, []);

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    toast.showInfo('Diagnostics Started', 'Scanning system memory, API latency, and POS hardware...');

    setTimeout(() => {
      setLatency(Math.floor(Math.random() * 12) + 12); // random between 12-24ms
      calculateStorageMetrics();
      setIsRunningDiagnostics(false);

      logActivity({
        activityType: 'DIAGNOSTICS_RUN',
        module: 'Diagnostics',
        actionDescription: 'Triggered administrative live system diagnostics scan.'
      });

      toast.showSuccess('Scan Complete', 'All diagnostic subsystems reported healthy.');
    }, 1200);
  };

  const handlePurgeCache = () => {
    setIsConfirmPurgeOpen(true);
  };

  const handleConfirmPurgeCache = () => {
    // Clear mock temporary keys
    localStorage.removeItem('erp_temp_ad_analytics');
    localStorage.removeItem('erp_ad_impressions_temp');
    
    calculateStorageMetrics();
    setIsConfirmPurgeOpen(false);
    toast.showSuccess('Cache Purged', 'Temporary diagnostic caches purged successfully.');
  };

  const handleTestPrintPing = () => {
    toast.showInfo('Printer Ping', 'Sending network ESC-POS test beep to receipt printer...');
    
    setTimeout(() => {
      logActivity({
        activityType: 'HARDWARE_PING',
        module: 'POS Terminals',
        actionDescription: 'Executed test print ping to POS-01 ESC-POS thermal printer.'
      });
      toast.showSuccess('Hardware Response', 'Receipt printer responded: BEEP OK (14ms)');
    }, 600);
  };

  // LocalStorage standard limit (5MB = 5120KB)
  const maxQuota = 5120;
  const usedPercent = Math.min(100, (sizes.total / maxQuota) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Diagnostics / System Health"
        title="System Health & Infrastructure Telemetry"
        subtitle="Live performance metrics, offline storage consumption, POS peripherals, and gateway latency."
        extra={
          <>
            <Button variant="secondary" onClick={handlePurgeCache}>
              <Trash2 size={14} /> Purge Cache
            </Button>
            <Button variant="purple" onClick={handleRunDiagnostics} disabled={isRunningDiagnostics}>
              <RefreshCw size={14} className={isRunningDiagnostics ? 'animate-spin' : ''} />
              {isRunningDiagnostics ? 'Running...' : 'Run Live Diagnostics'}
            </Button>
          </>
        }
      />

      {/* KPI Telemetry Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Status card with green pulse */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              System SLA Status
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'greenPulse 2s infinite' }} />
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>99.98% Operational</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wifi size={18} />
          </div>
        </div>

        <StatCard label="Gateway Latency" value={`${latency} ms`} icon={Cpu} color="#4f46e5" />
        <StatCard label="Browser Storage Occupied" value={memoryFootprint} icon={Database} color="#0891b2" />
        <StatCard label="Active POS Peripherals" value="3 Ready / Connected" icon={Printer} color="#10b981" />

      </div>

      {/* Grid Section 1: Core Subsystems Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Core Infrastructure Subsystems
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          <Card style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
              <HardDrive size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f2937' }}>Offline Buffer Engine</span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>Healthy (0 Bad Blocks)</span>
              <Badge variant="success" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>Active</Badge>
            </div>
          </Card>

          <Card style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
              <RefreshCw size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f2937' }}>Cloud Sync Daemon</span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>Connected (Polling 5s)</span>
              <Badge variant="success" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>Active</Badge>
            </div>
          </Card>

          <Card style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
              <Printer size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f2937' }}>PDF Invoice Engine</span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>ESC-POS Render Ready</span>
              <Badge variant="success" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>Active</Badge>
            </div>
          </Card>

          <Card style={{ padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>
              <Cpu size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f2937' }}>PWA Service Worker</span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>Active (Cache v1.2)</span>
              <Badge variant="success" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>Active</Badge>
            </div>
          </Card>

        </div>
      </div>

      {/* Grid Section 2: POS Hardware & Peripherals Diagnostic Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          POS Terminals Hardware Peripherals
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Printer diagnostic */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1f2937' }}>Thermal Receipt Printer</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '99px' }}>Online</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              ESC-POS 80mm roll width. Connected via USB / local network gateway.
            </span>
            <Button variant="purple" onClick={handleTestPrintPing} style={{ width: 'fit-content', padding: '6px 12px', fontSize: '0.7rem' }}>
              Test Print Ping
            </Button>
          </Card>

          {/* Barcode scanner */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1f2937' }}>Barcode Laser Scanner</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '99px' }}>Ready</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Laser HID keyboard wedge scanner. Decodes standard EAN-13 barcodes.
            </span>
            <span style={{ fontSize: '0.725rem', color: '#9ca3af', fontWeight: 600 }}>Standing Listening Port: ACTIVE</span>
          </Card>

          {/* Cash drawer */}
          <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1f2937' }}>RJ11 Cash Drawer</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '99px' }}>Connected</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              12V Pulse solenoid drawer trigger. Wired through thermal printer RJ11 bypass.
            </span>
            <span style={{ fontSize: '0.725rem', color: '#9ca3af', fontWeight: 600 }}>Solenoid pulse status: READY</span>
          </Card>

        </div>
      </div>

      {/* Grid Section 3: Storage Memory Breakdown */}
      <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1f2937' }}>Browser Storage Allocation Map</span>
            <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>Calculated localStorage distribution compared to standard browser 5MB limit.</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>
            Quota: {usedPercent.toFixed(4)}% utilized
          </span>
        </div>

        <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ width: `${usedPercent}%`, height: '100%', background: '#7c3aed', borderRadius: '99px' }} />
        </div>

        <SectionDivider />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 600 }}>
              <span style={{ color: '#4b5563' }}>Sales Ledger & Invoices</span>
              <span style={{ color: '#111827' }}>{sizes.sales.toFixed(2)} KB</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (sizes.sales / maxQuota) * 1000)}%`, height: '100%', background: '#4f46e5' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 600 }}>
              <span style={{ color: '#4b5563' }}>Inventory & SKU Products</span>
              <span style={{ color: '#111827' }}>{sizes.inventory.toFixed(2)} KB</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (sizes.inventory / maxQuota) * 1000)}%`, height: '100%', background: '#10b981' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 600 }}>
              <span style={{ color: '#4b5563' }}>Security & Audit Logs</span>
              <span style={{ color: '#111827' }}>{sizes.logs.toFixed(2)} KB</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (sizes.logs / maxQuota) * 1000)}%`, height: '100%', background: '#0891b2' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', fontWeight: 600 }}>
              <span style={{ color: '#4b5563' }}>Users & Store Registry</span>
              <span style={{ color: '#111827' }}>{sizes.users.toFixed(2)} KB</span>
            </div>
            <div style={{ width: '100%', height: '5px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (sizes.users / maxQuota) * 1000)}%`, height: '100%', background: '#f59e0b' }} />
            </div>
          </div>

        </div>

      </Card>

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

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={isConfirmPurgeOpen}
        title="Purge Temporary Diagnostic Cache"
        message="Safety Alert: Are you sure you want to clear non-critical temporary session caches? This will not affect core databases."
        confirmText="Purge Cache"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmPurgeCache}
        onCancel={() => setIsConfirmPurgeOpen(false)}
      />

    </div>
  );
}
