import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { Monitor, Activity, Radio, RefreshCw, Eye, Edit, Trash2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toggleCounterStatus, simulateOfflineTransactions } from '../../../utils/syncSimulator';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import SectionDivider from '../../../components/ui/SectionDivider';
import ConfirmDialog from '../../ui/ConfirmDialog';

const SEED_COUNTERS = [
  {
    id: 'CTR-9904',
    name: 'wwe2',
    code: 'POS-WWE2',
    location: 'Main Retail Outlet',
    assignedStaff: 'Default Cashier',
    printerType: 'Thermal 80mm ESC/POS',
    status: 'ONLINE',
    totalBillsToday: 0,
    grossSalesToday: 0,
    lastHeartbeat: new Date().toISOString()
  },
  {
    id: 'CTR-9901',
    name: 'Main Counter Delhi',
    code: 'POS-01',
    location: 'Delhi Central',
    assignedStaff: 'john_cashier',
    printerType: 'Thermal 80mm',
    status: 'ONLINE',
    totalBillsToday: 42,
    grossSalesToday: 15480,
    lastHeartbeat: new Date().toISOString()
  },
  {
    id: 'CTR-9902',
    name: 'Express Kiosk 1',
    code: 'POS-02',
    location: 'Mumbai Sub',
    assignedStaff: 'sarah_billing',
    printerType: 'Thermal 58mm',
    status: 'OFFLINE',
    totalBillsToday: 18,
    grossSalesToday: 8706,
    lastHeartbeat: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'CTR-9903',
    name: 'Mobile Checkout A',
    code: 'POS-03',
    location: 'Bangalore East',
    assignedStaff: 'mike_kiosk',
    printerType: 'Thermal 80mm',
    status: 'ONLINE',
    totalBillsToday: 12,
    grossSalesToday: 4500,
    lastHeartbeat: new Date().toISOString()
  }
];

export default function CounterReportsTable() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [counters, setCounters] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');

  const [selectedCounter, setSelectedCounter] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const loadCounters = () => {
    let raw = localStorage.getItem('erp_admin_counters');
    if (!raw) {
      const rawLegacy = localStorage.getItem('counters');
      if (rawLegacy) {
        raw = rawLegacy;
        localStorage.setItem('erp_admin_counters', raw);
      }
    }

    let data = [];
    if (raw) {
      data = JSON.parse(raw);
    }

    if (!data || data.length === 0) {
      data = SEED_COUNTERS;
      localStorage.setItem('erp_admin_counters', JSON.stringify(data));
    }

    const hasWWE2 = data.some(c => String(c.name).toLowerCase() === 'wwe2' || String(c.code).toLowerCase() === 'pos-wwe2');
    if (!hasWWE2) {
      const wwe2Counter = {
        id: 'CTR-' + Date.now().toString().slice(-4),
        name: 'wwe2',
        code: 'POS-WWE2',
        location: 'Main Retail Outlet',
        assignedStaff: 'Default Cashier',
        printerType: 'Thermal 80mm ESC/POS',
        status: 'ONLINE',
        totalBillsToday: 0,
        grossSalesToday: 0,
        lastHeartbeat: new Date().toISOString()
      };
      data = [wwe2Counter, ...data];
      localStorage.setItem('erp_admin_counters', JSON.stringify(data));
    }

    setCounters(data);
  };

  useEffect(() => {
    loadCounters();

    const onFocus = () => loadCounters();
    const onStorage = (e) => {
      if (e.key === 'erp_admin_counters') {
        loadCounters();
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const raw = localStorage.getItem('erp_admin_counters');
      if (raw) {
        const list = JSON.parse(raw);
        const { updated, changed } = simulateOfflineTransactions(list);
        if (changed) {
          localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
          localStorage.setItem('counters', JSON.stringify(updated));
          setCounters(updated);
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [counters]);

  const handleToggleStatus = (id) => {
    const current = counters.find(c => c.id === id);
    if (!current) return;

    const { updatedCounters, nextStatus, processedCount, counterName } = toggleCounterStatus(counters, id, current.status);

    setCounters(updatedCounters);
    localStorage.setItem('erp_admin_counters', JSON.stringify(updatedCounters));
    localStorage.setItem('counters', JSON.stringify(updatedCounters));

    toast.showSuccess('Status Updated', `Terminal "${counterName}" is now ${nextStatus}`);
    if (processedCount > 0) {
      toast.showSuccess('Sync Processing', `Synced ${processedCount} queued transactions from ${counterName}`);
    }
  };

  const handleDeleteCounter = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Terminal',
      message: `Are you sure you want to permanently delete POS terminal "${name}"? This action cannot be undone.`,
      onConfirm: () => {
        const updated = counters.filter(c => c.id !== id);
        setCounters(updated);
        localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
        toast.showSuccess('Deleted', `POS terminal "${name}" has been deleted.`);
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleExportCSV = () => {
    toast.showInfo('Export CSV', 'CSV Export process started.');
  };

  // Computations
  const totalShiftSales = counters.reduce((sum, c) => sum + (Number(c.grossSalesToday) || 0), 0);

  // Filter Categories
  const uniqueBranches = ['All', ...new Set(counters.map(c => c.location || c.branch).filter(Boolean))];

  // Filtering
  const filtered = counters.filter(c => {
    const matchesSearch = 
      (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(search.toLowerCase());

    const isOnline = String(c.status).toUpperCase() === 'ONLINE';
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && isOnline) ||
      (statusFilter === 'Inactive' && !isOnline);

    const matchesBranch = branchFilter === 'All' || (c.location || c.branch) === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Recharts line chart data
  const chartData = [
    { name: 'Mon', syncs: 120 + (counters.length * 5) },
    { name: 'Tue', syncs: 180 + (counters.length * 7) },
    { name: 'Wed', syncs: 150 + (counters.length * 4) },
    { name: 'Thu', syncs: 240 + (counters.length * 8) },
    { name: 'Fri', syncs: 280 + (counters.length * 10) },
    { name: 'Sat', syncs: 140 + (counters.length * 6) },
    { name: 'Sun', syncs: 95 + (counters.length * 3) }
  ];

  const headers = [
    { label: 'Counter Name' },
    { label: 'Code' },
    { label: 'Location' },
    { label: 'Assigned Staff' },
    { label: 'Hardware/Printer' },
    { label: 'Status', style: { textAlign: 'center' } },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Counters / Reports"
        title="Counter Reports"
        subtitle="Monitor terminal sync status and activity across all outlets."
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={handleExportCSV}>
              <DownloadIcon /> Export CSV
            </Button>
            <Button variant="purple" onClick={() => navigate('/admin/counters/new')}>
              Add New Counter
            </Button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard label="Total Terminals" value={counters.length} icon={Monitor} color="#4f46e5" />
        <StatCard label="Online Terminals" value={counters.filter(c => c.status === 'ONLINE').length} icon={Activity} color="#10b981" />
        <StatCard label="Active Sessions" value={counters.filter(c => c.assignedStaff && c.assignedStaff !== 'Staff' && c.assignedStaff.trim() !== '').length} icon={Radio} color="#0891b2" />
        <StatCard label="Total Shift Sales" value={`₹${totalShiftSales.toLocaleString('en-IN')}`} icon={Monitor} color="#dc2626" />
      </div>

      {/* Filters Card */}
      <Card style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
          <Input 
            type="text" 
            placeholder="Search code, name, or location..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px' }}
          />
          <SearchIcon />
        </div>

        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </Select>

        <Select value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="All">All Locations</option>
          {uniqueBranches.filter(b => b !== 'All').map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </Select>
      </Card>

      {/* Table Section */}
      <Table headers={headers}>
        {counters.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>No counters registered yet</span>
                <Button variant="purple" onClick={() => navigate('/admin/counters/new')}>
                  Add New Counter
                </Button>
              </div>
            </td>
          </tr>
        ) : (
          counters.map((c, idx) => {
            const isOnline = String(c.status).toUpperCase() === 'ONLINE';

            const matchesSearch = !search ||
              (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
              (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
              (c.location || '').toLowerCase().includes(search.toLowerCase());

            const matchesStatus = 
              statusFilter === 'All' || 
              (statusFilter === 'Active' && isOnline) ||
              (statusFilter === 'Inactive' && !isOnline);

            const matchesBranch = branchFilter === 'All' || (c.location || c.branch) === branchFilter;
            
            const isVisible = matchesSearch && matchesStatus && matchesBranch;

            return (
              <tr 
                key={c.id || idx} 
                style={{ 
                  borderBottom: '1px solid #f3f4f6', 
                  fontSize: '0.8rem', 
                  color: '#374151',
                  display: isVisible ? 'table-row' : 'none'
                }}
              >
                <td style={{ padding: '14px 16px' }}>
                  <span 
                    onClick={() => navigate(`/admin/counters/${c.id}`)}
                    style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', transition: 'color 0.15s' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.textDecoration = 'underline';
                      e.currentTarget.style.color = '#6d28d9';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.textDecoration = 'none';
                      e.currentTarget.style.color = '#7c3aed';
                    }}
                  >
                    {c.name || 'Unnamed Counter'}
                    <span style={{ color: '#9ca3af', marginLeft: '6px', fontSize: '0.85rem', fontWeight: 'normal' }}>›</span>
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{c.code || 'N/A'}</td>
                <td style={{ padding: '14px 16px' }}>{c.location || 'Main Store'}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{c.assignedStaff || 'Staff'}</td>
                <td style={{ padding: '14px 16px' }}>{c.printerType || 'Thermal 80mm'}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Badge variant={isOnline ? 'success' : 'danger'}>
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </Badge>
                    {!isOnline && c.offlineQueue && c.offlineQueue.length > 0 && (
                      <span style={{ fontSize: '0.675rem', color: '#ef4444', fontWeight: 700, background: '#fee2e2', padding: '1px 6px', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                        {c.offlineQueue.length} queued
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                    <Button
                      variant={isOnline ? 'secondary' : 'success'}
                      onClick={() => handleToggleStatus(c.id)}
                      style={!isOnline ? { color: '#10b981', borderColor: '#10b981', background: '#f0fdf4', padding: '4px 8px', fontSize: '0.75rem' } : { padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      {isOnline ? 'Set Offline' : 'Set Online'}
                    </Button>
                    <button 
                      onClick={() => {
                        setSelectedCounter(c);
                        setIsDetailOpen(true);
                      }}
                      style={{ padding: '4px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCounter(c.id, c.name)}
                      style={{ padding: '4px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Delete Terminal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </Table>

      {/* Sync Activity Line Chart */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionDivider label="Sync Activity (Last 7 Days)" />
        <div style={{ width: '100%', height: '220px', marginTop: '8px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '6px', color: '#ffffff', fontSize: '0.75rem' }} />
              <Line type="monotone" dataKey="syncs" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, strokeWidth: 0, fill: '#7c3aed' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* View Details Modal */}
      {isDetailOpen && selectedCounter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fade-in 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '450px',
            maxWidth: '90%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsDetailOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Monitor size={18} style={{ color: '#7c3aed' }} /> Terminal Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Name</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>{selectedCounter.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Code</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>{selectedCounter.code}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Location</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>{selectedCounter.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Assigned Staff</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>{selectedCounter.assignedStaff}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Printer Setup</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>{selectedCounter.printerType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Status</span>
                <Badge variant={String(selectedCounter.status).toUpperCase() === 'ONLINE' ? 'success' : 'danger'}>
                  {selectedCounter.status}
                </Badge>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Bills Processed Today</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>{selectedCounter.totalBillsToday}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Gross Sales Today</span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>₹{Number(selectedCounter.grossSalesToday || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsDetailOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

    </div>
  );
}

// Inline helper icons
function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
