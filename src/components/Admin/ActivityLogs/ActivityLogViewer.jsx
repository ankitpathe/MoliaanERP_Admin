import React, { useState, useEffect } from 'react';
import LogStats from './LogStats';
import LogFilters from './LogFilters';
import LogTable from './LogTable';
import LogDetailModal from './LogDetailModal';
import { useToast } from '../../../hooks/useToast';
import { Download, Trash2 } from 'lucide-react';

const STORAGE_KEY = 'erp_activity_logs';

export default function ActivityLogViewer() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dateRange, setDateRange] = useState('ALL');

  // Popup inspector state
  const [inspectingLog, setInspectingLog] = useState(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const loadLogs = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        // Initial seed sample logs
        const sampleLogs = [
          {
            id: 'LOG-101',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            date: new Date(Date.now() - 3600000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date(Date.now() - 3600000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            userName: 'Administrator',
            userRole: 'Administrator',
            activityType: 'LOGIN',
            module: 'Authentication',
            actionDescription: 'Admin logged in successfully',
            deviceBrowser: 'Chrome / Windows',
            ipAddress: '192.168.1.1',
            status: 'Success'
          },
          {
            id: 'LOG-102',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            date: new Date(Date.now() - 7200000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date(Date.now() - 7200000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            userName: 'Administrator',
            userRole: 'Administrator',
            activityType: 'UPDATE',
            module: 'Inventory Settings',
            actionDescription: 'Updated global low-stock threshold to 10',
            deviceBrowser: 'Chrome / Windows',
            ipAddress: '192.168.1.1',
            status: 'Success',
            oldValue: { defaultLowStockThreshold: 5 },
            newValue: { defaultLowStockThreshold: 10 }
          },
          {
            id: 'LOG-103',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            date: new Date(Date.now() - 14400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: new Date(Date.now() - 14400000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            userName: 'Cashier-1',
            userRole: 'Staff',
            activityType: 'CREATE',
            module: 'Sales',
            actionDescription: 'Generated invoice #INV-2026-0042 for ₹1,450',
            deviceBrowser: 'Web Browser',
            ipAddress: '192.168.1.42',
            status: 'Success'
          }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleLogs));
        setLogs(sampleLogs);
      } else {
        setLogs(JSON.parse(data));
      }
    } catch (e) {
      console.error('Error loading activity logs:', e);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Filter logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.actionDescription.toLowerCase().includes(search.toLowerCase()) ||
      log.activityType.toLowerCase().includes(search.toLowerCase());

    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    const matchesType = typeFilter === 'All' || log.activityType === typeFilter;

    // Date range filter
    let matchesDate = true;
    const logTime = new Date(log.timestamp).getTime();
    const now = Date.now();

    if (dateRange === 'TODAY') {
      const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      matchesDate = log.date === todayStr;
    } else if (dateRange === 'YESTERDAY') {
      const yesterdayStr = new Date(now - 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      matchesDate = log.date === yesterdayStr;
    } else if (dateRange === 'LAST_7') {
      matchesDate = logTime >= now - 7 * 86400000;
    }

    return matchesSearch && matchesModule && matchesType && matchesDate;
  });

  // Export to CSV helper
  const handleExportCSV = () => {
    try {
      const headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action Type', 'Module', 'Description', 'IP Address', 'Browser'];
      const rows = filteredLogs.map(l => [
        l.id,
        `${l.date} ${l.time}`,
        l.userName,
        l.userRole,
        l.activityType,
        l.module,
        l.actionDescription,
        l.ipAddress || '',
        l.deviceBrowser
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `moliaan_audit_logs_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.showSuccess('Export Success', 'Audit logs exported to CSV successfully!');
    } catch (e) {
      toast.showError('Export Failed', 'Unable to compile CSV logs.');
    }
  };

  // Clear logs older than 30 days
  const handleClearOldLogs = () => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const remainingLogs = logs.filter(log => new Date(log.timestamp).getTime() >= thirtyDaysAgo);
    const clearedCount = logs.length - remainingLogs.length;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingLogs));
      setLogs(remainingLogs);
      toast.showSuccess('Cleanup Completed', `Cleared ${clearedCount} old log records.`);
    } catch (e) {
      toast.showError('Error', 'Unable to complete logs cleanup.');
    }
    setIsClearConfirmOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>System Activity Logs</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Audit trail logging and security operator records check.</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            style={{
              padding: '10px 16px',
              background: '#ffffff',
              color: '#ef4444',
              border: '1px solid #fee2e2',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Trash2 size={16} /> Clear Logs &gt; 30 Days
          </button>
          
          <button
            onClick={handleExportCSV}
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
            <Download size={16} /> Export to CSV
          </button>
        </div>
      </div>

      {/* Stats Cards widgets */}
      <LogStats logs={logs} />

      {/* Filter Options */}
      <LogFilters 
        search={search}
        setSearch={setSearch}
        moduleFilter={moduleFilter}
        setModuleFilter={setModuleFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
      />

      {/* Log list grid */}
      <LogTable logs={filteredLogs} onInspect={setInspectingLog} />

      {/* MODAL 1: Log Inspect Overlay */}
      {inspectingLog && (
        <ModalOverlay onClose={() => setInspectingLog(null)}>
          <LogDetailModal log={inspectingLog} onClose={() => setInspectingLog(null)} />
        </ModalOverlay>
      )}

      {/* MODAL 2: Clear old logs confirmation */}
      {isClearConfirmOpen && (
        <ModalOverlay onClose={() => setIsClearConfirmOpen(false)}>
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px' }}>
              Confirm Logs Cleanup
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Are you sure you want to clear all activity and audit logs older than 30 days? This action will permanently free up browser local storage and cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleClearOldLogs}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >
                Yes, Clear Old Logs
              </button>
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

    </div>
  );
}

// Reusable Modal overlay layout
function ModalOverlay({ children, onClose }) {
  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(8px)',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ animation: 'zoom-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {children}
        </div>
      </div>
      <style>{`
        @keyframes zoom-in {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </>
  );
}
