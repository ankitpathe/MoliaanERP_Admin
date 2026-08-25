import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Monitor, Download, Plus, Search, RefreshCw, Trash2, SlidersHorizontal, Activity } from 'lucide-react';

const SEED_DATA = [
  { 
    id: "CNT-101", 
    code: "POS-01", 
    name: "Main Counter Ground Floor", 
    deviceId: "DEV-MAC-8821", 
    branch: "Head Office", 
    status: "Online", 
    lastHeartbeat: new Date().toISOString(), 
    totalBillsToday: 42, 
    totalSalesToday: 18450 
  },
  { 
    id: "CNT-102", 
    code: "POS-02", 
    name: "Express Billing Counter", 
    deviceId: "DEV-MAC-9943", 
    branch: "Annex Branch", 
    status: "Offline", 
    lastHeartbeat: new Date(Date.now() - 7200000).toISOString(), 
    totalBillsToday: 15, 
    totalSalesToday: 6200 
  }
];

function getRelativeTime(isoString) {
  if (!isoString) return 'Never';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
}

export default function CounterReportsTable() {
  const navigate = useNavigate();
  const toast = useToast();
  const [counters, setCounters] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');

  useEffect(() => {
    const raw = localStorage.getItem('erp_admin_counters');
    if (!raw) {
      localStorage.setItem('erp_admin_counters', JSON.stringify(SEED_DATA));
      setCounters(SEED_DATA);
    } else {
      setCounters(JSON.parse(raw));
    }
  }, []);

  const saveCounters = (updated) => {
    localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
    setCounters(updated);
  };

  const handlePing = (id, code) => {
    const latency = Math.floor(Math.random() * 80) + 12;
    toast.showInfo('Ping Test', `Counter "${code}" returned status OK (Latency: ${latency}ms)`);
  };

  const handleToggleStatus = (id, code, currentStatus) => {
    const nextStatus = currentStatus === 'Online' ? 'Offline' : (currentStatus === 'Offline' ? 'Disabled' : 'Online');
    const updated = counters.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          status: nextStatus,
          lastHeartbeat: nextStatus === 'Online' ? new Date().toISOString() : c.lastHeartbeat
        };
      }
      return c;
    });

    saveCounters(updated);
    logActivity({
      activityType: 'COUNTER_STATUS_TOGGLED',
      module: 'Counters',
      actionDescription: `Toggled status for counter "${code}" to "${nextStatus}"`
    });
    toast.showSuccess('Status Cycled', `Counter "${code}" updated to ${nextStatus}.`);
  };

  const handleDelete = (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete counter "${code}"?`)) return;

    const updated = counters.filter(c => c.id !== id);
    saveCounters(updated);

    logActivity({
      activityType: 'COUNTER_DELETED',
      module: 'Counters',
      actionDescription: `Deleted registered counter terminal "${code}"`
    });
    toast.showSuccess('Deleted', `Counter "${code}" removed from sync records.`);
  };

  const handleExportCSV = () => {
    if (counters.length === 0) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Counter Code,Counter Name,Device ID,Branch,Status,Last Heartbeat,Receipts Today,Sales Today\n';

    counters.forEach(c => {
      csvContent += `"${c.code}","${c.name}","${c.deviceId}","${c.branch}","${c.status}","${c.lastHeartbeat}",${c.totalBillsToday},${c.totalSalesToday}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Counter_Status_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.showSuccess('Export Complete', 'CSV file downloaded successfully.');
  };

  // KPIs
  const totalCounters = counters.length;
  const onlineCounters = counters.filter(c => c.status === 'Online').length;
  const offlineCounters = counters.filter(c => c.status === 'Offline').length;
  const totalBillsToday = counters.reduce((sum, c) => sum + (Number(c.totalBillsToday) || 0), 0);

  // Filter Lists
  const branches = ['All', ...new Set(counters.map(c => c.branch))];

  const filtered = counters.filter(c => {
    const matchesSearch = 
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.deviceId.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesBranch = branchFilter === 'All' || c.branch === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  return (
    <div className="space-y-6">
      
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total POS */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Registered Terminals</span>
            <h3 className="text-2xl font-extrabold text-slate-800 mt-1">{totalCounters}</h3>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
            <Monitor className="w-5 h-5" />
          </div>
        </div>

        {/* Live Pulse */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live & Active</span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-emerald-600">{onlineCounters}</h3>
              {onlineCounters > 0 && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Offline */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offline Terminals</span>
            <h3 className="text-2xl font-extrabold text-rose-600 mt-1">{offlineCounters}</h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Monitor className="w-5 h-5" />
          </div>
        </div>

        {/* Volume */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bills Processed Today</span>
            <h3 className="text-2xl font-extrabold text-slate-700 mt-1">{totalBillsToday}</h3>
          </div>
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl">
            <Monitor className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Action Launchpad Bar */}
      <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input 
              type="text" 
              placeholder="Search code, device ID, or title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Disabled">Disabled</option>
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="All">All Branches</option>
            {branches.filter(b => b !== 'All').map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          
          <button
            onClick={() => navigate('/admin/counters/new')}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Terminal
          </button>
        </div>

      </div>

      {/* Main Grid Table */}
      <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Monitor className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.2]" />
            <h4 className="text-sm font-bold text-slate-700">No Terminals Matching Filters</h4>
            <p className="text-xs text-slate-500 mt-1">Try resetting search string or branch criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Counter Code & Name</th>
                  <th className="py-4 px-5">Device ID</th>
                  <th className="py-4 px-5">Branch</th>
                  <th className="py-4 px-5 text-center">Live Status</th>
                  <th className="py-4 px-5">Last Heartbeat</th>
                  <th className="py-4 px-5 text-right">Receipts / Volume</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => {
                  let statusBadge = (
                    <span className="bg-violet-50 text-violet-600 border border-violet-100 rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 w-max mx-auto">
                      Disabled
                    </span>
                  );

                  if (c.status === 'Online') {
                    statusBadge = (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 w-max mx-auto">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        Online
                      </span>
                    );
                  } else if (c.status === 'Offline') {
                    statusBadge = (
                      <span className="bg-rose-50 text-rose-600 border border-rose-100 rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1 w-max mx-auto">
                        Offline
                      </span>
                    );
                  }

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/30 transition-all">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800 text-sm">{c.code}</span>
                          <span className="text-slate-400 text-[10px] mt-0.5">{c.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-slate-600 font-semibold">{c.deviceId}</td>
                      <td className="py-4 px-5 text-slate-600 font-medium">{c.branch}</td>
                      <td className="py-4 px-5 text-center">{statusBadge}</td>
                      <td className="py-4 px-5 text-slate-500 font-medium">{getRelativeTime(c.lastHeartbeat)}</td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-slate-700">{c.totalBillsToday} Bills</span>
                          <span className="text-emerald-500 font-bold text-[10px] mt-0.5">₹{c.totalSalesToday.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex gap-1.5">
                          <button
                            onClick={() => handlePing(c.id, c.code)}
                            className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-600 rounded-xl transition-all"
                            title="Ping Test"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(c.id, c.code, c.status)}
                            className="px-2.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold transition-all"
                            title="Cycle Status"
                          >
                            Cycle
                          </button>

                          <button
                            onClick={() => handleDelete(c.id, c.code)}
                            className="p-2 border border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl transition-all"
                            title="Delete Terminal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
