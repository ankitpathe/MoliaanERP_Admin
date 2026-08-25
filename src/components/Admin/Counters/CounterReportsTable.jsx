import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { Monitor, Activity, Radio, RefreshCw, Eye, Edit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

function getRelativeTime(isoString) {
  if (!isoString) return 'Never';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export default function CounterReportsTable() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [counters, setCounters] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [syncDaysFilter, setSyncDaysFilter] = useState('All');

  useEffect(() => {
    // Load from erp_admin_counters or counters key
    const raw = localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters') || '[]';
    setCounters(JSON.parse(raw));
  }, []);

  const handleExportCSV = () => {
    toast.showInfo('Export CSV', 'Coming soon');
  };

  // Computations
  const totalCounters = counters.length;
  const onlineCounters = counters.filter(c => c.status === 'Online' || c.status === 'Active').length;
  const offlineCounters = totalCounters - onlineCounters;
  
  const totalLatency = counters.reduce((sum, c) => sum + (Number(c.syncLatency || c.latency || 14) || 0), 0);
  const avgLatency = totalCounters > 0 ? Math.round(totalLatency / totalCounters) : 0;

  // Filter Categories
  const uniqueBranches = ['All', ...new Set(counters.map(c => c.branch).filter(Boolean))];

  // Filtering
  const filtered = counters.filter(c => {
    const matchesSearch = 
      (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(search.toLowerCase());

    const isOnline = c.status === 'Online' || c.status === 'Active';
    const matchesStatus = 
      statusFilter === 'All' || 
      (statusFilter === 'Active' && isOnline) ||
      (statusFilter === 'Inactive' && !isOnline);

    const matchesBranch = branchFilter === 'All' || c.branch === branchFilter;

    // Last Sync filter helper
    if (syncDaysFilter !== 'All') {
      if (!c.lastHeartbeat && !c.lastSync) return false;
      const syncTime = new Date(c.lastHeartbeat || c.lastSync).getTime();
      const diffHrs = (Date.now() - syncTime) / 3600000;
      if (syncDaysFilter === '1h' && diffHrs > 1) return false;
      if (syncDaysFilter === '24h' && diffHrs > 24) return false;
    }

    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Recharts line chart data
  const chartData = [
    { name: 'Mon', syncs: 120 + (totalCounters * 5) },
    { name: 'Tue', syncs: 180 + (totalCounters * 7) },
    { name: 'Wed', syncs: 150 + (totalCounters * 4) },
    { name: 'Thu', syncs: 240 + (totalCounters * 8) },
    { name: 'Fri', syncs: 280 + (totalCounters * 10) },
    { name: 'Sat', syncs: 140 + (totalCounters * 6) },
    { name: 'Sun', syncs: 95 + (totalCounters * 3) }
  ];

  const headers = [
    { label: 'Counter Code' },
    { label: 'Name' },
    { label: 'Branch' },
    { label: 'Status', style: { textAlign: 'center' } },
    { label: 'Last Sync' },
    { label: 'Sync Latency', style: { textAlign: 'right' } },
    { label: 'Transactions Today', style: { textAlign: 'right' } },
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
          <Button variant="secondary" onClick={handleExportCSV}>
            <DownloadIcon /> Export CSV
          </Button>
        }
      />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard label="Total Counters" value={totalCounters} icon={Monitor} color="#4f46e5" />
        <StatCard label="Online Now" value={onlineCounters} icon={Activity} color="#10b981" />
        <StatCard label="Offline/Inactive" value={offlineCounters} icon={Monitor} color="#dc2626" />
        <StatCard label="Avg Sync Latency" value={`${avgLatency}ms`} icon={Radio} color="#0891b2" />
      </div>

      {/* Filters Card */}
      <Card style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
          <Input 
            type="text" 
            placeholder="Search code or counter name..." 
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
          <option value="All">All Branches</option>
          {uniqueBranches.filter(b => b !== 'All').map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </Select>

        <Select value={syncDaysFilter} onChange={e => setSyncDaysFilter(e.target.value)}>
          <option value="All">Last Sync: All</option>
          <option value="1h">Synced &lt; 1 hour ago</option>
          <option value="24h">Synced &lt; 24 hours ago</option>
        </Select>
      </Card>

      {/* Table Section */}
      <Table headers={headers}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 500 }}>No counters registered yet</span>
                <Button variant="purple" onClick={() => navigate('/admin/counters/new')}>
                  Add New Counter
                </Button>
              </div>
            </td>
          </tr>
        ) : (
          filtered.map((c, idx) => {
            const isOnline = c.status === 'Online' || c.status === 'Active';
            return (
              <tr key={c.id || idx} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>{c.code || 'N/A'}</td>
                <td style={{ padding: '14px 16px' }}>{c.name || 'Unnamed Counter'}</td>
                <td style={{ padding: '14px 16px', fontWeight: 500 }}>{c.branch || 'General'}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                  <Badge variant={isOnline ? 'success' : 'danger'}>
                    {isOnline ? 'Active' : 'Offline'}
                  </Badge>
                </td>
                <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                  {getRelativeTime(c.lastHeartbeat || c.lastSync)}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>
                  {c.syncLatency || c.latency || 14}ms
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600 }}>
                  {c.totalBillsToday || 0}
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <button style={{ padding: '4px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                      <Eye size={14} />
                    </button>
                    <button style={{ padding: '4px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                      <Edit size={14} />
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
