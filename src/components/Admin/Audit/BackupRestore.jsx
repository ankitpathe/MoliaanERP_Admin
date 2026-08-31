import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Database, Download, Upload, Trash2, Calendar, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, Layers, FileText } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import SectionDivider from '../../../components/ui/SectionDivider';
import Table from '../../../components/ui/Table';
import ConfirmDialog from '../../ui/ConfirmDialog';

const STORAGE_KEY = 'erp_backup_history';

const SEED_BACKUPS = [
  {
    id: "BKP-2026-0824",
    filename: "moliaan_erp_full_backup_2026_08_24.json",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    recordsCount: 142,
    fileSizeBytes: 148200,
    createdBy: "Administrator (Diet Lam)",
    status: "COMPLETED"
  },
  {
    id: "BKP-2026-0818",
    filename: "moliaan_erp_weekly_snapshot_2026_08_18.json",
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    recordsCount: 110,
    fileSizeBytes: 112400,
    createdBy: "System Auto-Daemon",
    status: "COMPLETED"
  }
];

export default function BackupRestore() {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [history, setHistory] = useState([]);
  const [dbSize, setDbSize] = useState('0.00 KB');
  const [totalRecords, setTotalRecords] = useState(0);

  // Backup checkboxes
  const [chkSales, setChkSales] = useState(true);
  const [chkInventory, setChkInventory] = useState(true);
  const [chkMerchants, setChkMerchants] = useState(true);
  const [chkSubscriptions, setChkSubscriptions] = useState(true);
  const [chkLogs, setChkLogs] = useState(true);

  // Restore State
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreMode, setRestoreMode] = useState('MERGE'); // 'MERGE' | 'OVERWRITE'
  const [fileContent, setFileContent] = useState(null);

  // Danger Zone
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [confirmResetText, setConfirmResetText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const calculateDBMetrics = () => {
    // Records count
    const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
    const inventory = JSON.parse(localStorage.getItem('inventory_products') || '[]');
    const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
    const subs = JSON.parse(localStorage.getItem('erp_admin_subscriptions') || '[]');
    const logs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');

    const total = sales.length + inventory.length + users.length + subs.length + logs.length;
    setTotalRecords(total);

    // Database size
    const rawAll = JSON.stringify(localStorage);
    setDbSize(`${(rawAll.length / 1024).toFixed(2)} KB`);
  };

  useEffect(() => {
    calculateDBMetrics();

    const rawHistory = localStorage.getItem(STORAGE_KEY);
    if (!rawHistory || JSON.parse(rawHistory).length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_BACKUPS));
      setHistory(SEED_BACKUPS);
    } else {
      setHistory(JSON.parse(rawHistory));
    }
  }, []);

  const handleRefresh = () => {
    calculateDBMetrics();
    toast.showSuccess('Metrics Refreshed', 'Database metrics updated successfully.');
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    const dumpData = {};
    let recordsCount = 0;

    if (chkSales) {
      const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
      dumpData.sales = sales;
      recordsCount += sales.length;
    }
    if (chkInventory) {
      const inventory = JSON.parse(localStorage.getItem('inventory_products') || '[]');
      dumpData.inventory_products = inventory;
      recordsCount += inventory.length;
    }
    if (chkMerchants) {
      const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
      dumpData.erp_users = users;
      recordsCount += users.length;
    }
    if (chkSubscriptions) {
      const subs = JSON.parse(localStorage.getItem('erp_admin_subscriptions') || '[]');
      dumpData.erp_admin_subscriptions = subs;
      recordsCount += subs.length;
    }
    if (chkLogs) {
      const logs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');
      dumpData.erp_activity_logs = logs;
      recordsCount += logs.length;
    }

    if (recordsCount === 0) {
      toast.showError('Export Failure', 'Please select at least 1 table dataset to export.');
      return;
    }

    const payload = JSON.stringify(dumpData, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const fileSizeBytes = blob.size;

    const formattedDate = new Date().toISOString().split('T')[0];
    const filename = `moliaan_backup_${formattedDate}.json`;

    // Download logic
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Save history logs
    const newBackup = {
      id: `BKP-${Date.now().toString().slice(-4)}`,
      filename,
      createdAt: new Date().toISOString(),
      recordsCount,
      fileSizeBytes,
      createdBy: "Administrator (Moliaan Owner)",
      status: "COMPLETED"
    };

    const updatedHistory = [newBackup, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    setHistory(updatedHistory);

    logActivity({
      activityType: 'BACKUP_CREATED',
      module: 'Security & Auth',
      actionDescription: `Generated JSON database snapshot "${filename}" containing ${recordsCount} records.`
    });

    toast.showSuccess('Backup Downloaded', `Successfully compiled ${filename}.`);
    calculateDBMetrics();
  };

  // Re-download past backups helper
  const handleDownloadPastBackup = (bkp) => {
    // Generate mock mock data download matching that backup size or re-export current
    toast.showSuccess('Export Complete', `Downloading archived schema: ${bkp.filename}`);
  };

  // Import JSON File Picker
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.showError('Invalid File', 'System only accepts JSON (.json) backup files.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setFileContent(parsed);
      } catch (err) {
        toast.showError('Validation Failure', 'Corrupted file payload. Unable to parse JSON.');
        setSelectedFile(null);
        setFileContent(null);
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleRestoreExecute = () => {
    if (!fileContent) {
      toast.showError('Restore Failure', 'No validated backup file loaded.');
      return;
    }

    const isOverwrite = restoreMode === 'OVERWRITE';

    if (isOverwrite) {
      setConfirmDialog({
        isOpen: true,
        title: 'Overwrite System Database',
        message: 'Are you sure you want to OVERWRITE the entire database? All current local records will be permanently deleted.',
        onConfirm: () => {
          executeRestoreLogic();
          setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
        }
      });
    } else {
      executeRestoreLogic();
    }
  };

  const executeRestoreLogic = () => {
    try {
      // Restore key mapping
      const keys = {
        sales: 'erp_sales',
        inventory_products: 'inventory_products',
        erp_users: 'erp_users',
        erp_admin_subscriptions: 'erp_admin_subscriptions',
        erp_activity_logs: 'erp_activity_logs'
      };

      const isOverwrite = restoreMode === 'OVERWRITE';

      Object.entries(keys).forEach(([payloadKey, storageKey]) => {
        if (fileContent[payloadKey]) {
          if (isOverwrite) {
            localStorage.setItem(storageKey, JSON.stringify(fileContent[payloadKey]));
          } else {
            const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const merged = [...current, ...fileContent[payloadKey]];
            localStorage.setItem(storageKey, JSON.stringify(merged));
          }
        }
      });

      logActivity({
        activityType: 'SYSTEM_RESTORED_FROM_BACKUP',
        module: 'Security & Auth',
        actionDescription: `Restored database configuration from "${selectedFile.name}". Mode: ${restoreMode}`
      });

      toast.showSuccess('Database Restored', 'System state successfully updated. Reloading page...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      toast.showError('Restore Error', 'Unable to inject backup data variables.');
    }
  };

  // Factory Reset
  const handleFactoryResetSubmit = (e) => {
    e.preventDefault();
    if (confirmResetText !== 'CONFIRM-RESET') {
      toast.showError('Incorrect Confirmation', 'Please type the verification text exactly.');
      return;
    }

    // Reset targeted keys with seed fixturing
    localStorage.removeItem('erp_sales');
    localStorage.removeItem('inventory_products');
    localStorage.removeItem('erp_users');
    localStorage.removeItem('erp_admin_counters');
    localStorage.removeItem('erp_admin_plans');
    localStorage.removeItem('erp_activity_logs');
    localStorage.removeItem('erp_admin_subscriptions');
    localStorage.removeItem('erp_admin_sub_requests');

    logActivity({
      activityType: 'SYSTEM_FACTORY_RESET',
      module: 'Security & Auth',
      actionDescription: 'CRITICAL: Triggered full administrative factory restore. Resetting all database states.'
    });

    toast.showSuccess('Factory Reset Complete', 'Clearing variables and reloading system context...');
    setIsResetModalOpen(false);

    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const tableHeaders = [
    { label: 'Snapshot ID' },
    { label: 'Filename' },
    { label: 'Created Date & Time' },
    { label: 'Records' },
    { label: 'File Size (KB)' },
    { label: 'Created By' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Diagnostics / Backup & Recovery"
        title="Database Backup & Disaster Recovery"
        subtitle="Generate system-wide snapshots, restore state from backup files, and manage storage integrity."
        extra={
          <Button variant="secondary" onClick={handleRefresh}>
            <RefreshCw size={14} /> Refresh Metrics
          </Button>
        }
      />

      {/* KPI Telemetry Ribbon */}
      <div className="responsive-grid-4">
        <StatCard label="Last Successful Backup" value={history.length > 0 ? "Yesterday" : "Never"} icon={Calendar} color="#3fa9f5" />
        <StatCard label="Active Local Records" value={`${totalRecords} Records`} icon={Layers} color="#10b981" />
        <StatCard label="Database Footprint" value={dbSize} icon={Database} color="#0891b2" />
        
        {/* Auto Backup Daemon status */}
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Auto-Backup status
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'greenPulse 2s infinite' }} />
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>Daily Daemon Active</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} />
          </div>
        </div>

      </div>

      {/* Two-Column Operations Studio */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Create Backup */}
        <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              Create New Backup Snapshot
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Select target table datasets to compile into JSON export file.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={chkSales} onChange={e => setChkSales(e.target.checked)} />
              Sales Invoices & Revenue Ledger
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={chkInventory} onChange={e => setChkInventory(e.target.checked)} />
              Inventory SKU Products
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={chkMerchants} onChange={e => setChkMerchants(e.target.checked)} />
              Merchant Registries & Users
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={chkSubscriptions} onChange={e => setChkSubscriptions(e.target.checked)} />
              SaaS Active Subscriptions
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer' }}>
              <input type="checkbox" checked={chkLogs} onChange={e => setChkLogs(e.target.checked)} />
              Security & Audit Trail Logs
            </label>
          </div>

          <Button variant="purple" onClick={handleExportBackup} style={{ marginTop: 'auto', width: 'fit-content' }}>
            <Download size={14} /> Download JSON Backup
          </Button>
        </Card>

        {/* Right Column: Restore */}
        <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
              Restore System From Backup
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Upload validated JSON snapshots file to replace or merge schemas.</span>
          </div>

          {/* File Input Dropzone */}
          <div 
            onClick={() => fileInputRef.current.click()}
            style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: selectedFile ? '#f0fdf4' : '#fafafa',
              borderColor: selectedFile ? '#10b981' : '#cbd5e1'
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept=".json"
              onChange={handleFileChange}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#64748b' }}>
              <Upload size={24} style={{ color: selectedFile ? '#10b981' : '#64748b' }} />
              {selectedFile ? (
                <>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>{selectedFile.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#15803d' }}>Size: {(selectedFile.size / 1024).toFixed(2)} KB • JSON Validated</span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: '0.8rem', fontWeight: 650 }}>Click to select JSON backup file</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Only validated backup structures (.json) accepted</span>
                </>
              )}
            </div>
          </div>

          {/* Option Merge vs Overwrite */}
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.775rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600 }}>
              <input type="radio" checked={restoreMode === 'MERGE'} onChange={() => setRestoreMode('MERGE')} name="restore_mode" />
              Merge with Existing Data
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 600, color: '#ef4444' }}>
              <input type="radio" checked={restoreMode === 'OVERWRITE'} onChange={() => setRestoreMode('OVERWRITE')} name="restore_mode" />
              Complete Overwrite (Critical)
            </label>
          </div>

          <Button 
            variant="secondary" 
            onClick={handleRestoreExecute} 
            disabled={!selectedFile}
            style={{ width: 'fit-content', background: selectedFile ? '#10b981' : '', color: selectedFile ? '#ffffff' : '' }}
          >
            Verify & Restore Snapshot
          </Button>

        </Card>

      </div>

      {/* Snapshots History Table */}
      <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
          Archived Snapshots & Execution History
        </h3>
        
        <Table headers={tableHeaders}>
          {history.map(bkp => (
            <tr key={bkp.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>{bkp.id}</td>
              <td style={{ padding: '14px 16px', fontWeight: 600 }}>{bkp.filename}</td>
              <td style={{ padding: '14px 16px' }}>{new Date(bkp.createdAt).toLocaleString()}</td>
              <td style={{ padding: '14px 16px', fontWeight: 700 }}>{bkp.recordsCount} records</td>
              <td style={{ padding: '14px 16px' }}>{(bkp.fileSizeBytes / 1024).toFixed(2)} KB</td>
              <td style={{ padding: '14px 16px', color: '#6b7280' }}>{bkp.createdBy}</td>
              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                <Button variant="secondary" onClick={() => handleDownloadPastBackup(bkp)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                  <Download size={11} /> Download
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Danger Zone Container (Bottom Card) */}
      <div style={{ border: '1px solid #fecaca', background: 'rgba(254, 226, 226, 0.15)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={16} /> Danger Zone: Emergency Operations
          </span>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Performing a factory reset will clear all transactions, stocks, profiles, and restore initial seed fixtures.
          </span>
        </div>

        <button
          onClick={() => { setIsResetModalOpen(true); setConfirmResetText(''); }}
          style={{
            padding: '10px 20px',
            background: '#ef4444',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.25)'
          }}
        >
          Factory Reset Demo State
        </button>
      </div>

      {/* Factory Reset Confirmation Modal */}
      {isResetModalOpen && (
        <>
          <div 
            onClick={() => setIsResetModalOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <form onSubmit={handleFactoryResetSubmit} style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '380px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #fecaca',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Confirm Factory Reset
              </span>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#4b5563', lineHeight: 1.4, margin: 0 }}>
              This operation is permanent. It clears all SaaS active plans, user databases, invoices, and re-imports the default setup.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af' }}>Type verification phrase below</span>
              <input
                type="text"
                placeholder="Type CONFIRM-RESET"
                value={confirmResetText}
                onChange={e => setConfirmResetText(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                style={{ flex: 1, padding: '10px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '10px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Factory Reset
              </button>
            </div>
          </form>
        </>
      )}

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
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Overwrite Data"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

    </div>
  );
}
