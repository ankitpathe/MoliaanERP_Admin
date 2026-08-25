import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Monitor, Cpu, MapPin, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

const BRANCH_OPTIONS = [
  'Head Office',
  'Annex Branch',
  'Main Store',
  'Warehouse',
  'Delhi Central',
  'Mumbai Bandra'
];

export default function AddCounterForm() {
  const navigate = useNavigate();
  const toast = useToast();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]);
  const [status, setStatus] = useState('Online'); // 'Online' / 'Disabled'

  // Live Counter Code Auto Generator helper
  const handleAutoGenerateCode = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    setCode(`POS-${randomNum}`);
    toast.showInfo('Generated', `Assigned code: POS-${randomNum}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!code || !name || !deviceId || !branch) {
      toast.showError('Required', 'Please fill in all required fields.');
      return;
    }

    const uppercaseCode = code.trim().toUpperCase();
    const uppercaseDevice = deviceId.trim().toUpperCase();

    // Device Hash Validation: Should look like MAC/DEV hash format
    if (uppercaseDevice.length < 5) {
      toast.showError('Validation Error', 'Device ID must be at least 5 characters.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
      
      // Validation: Unique code check
      const codeExists = existing.some(c => c.code.toUpperCase() === uppercaseCode);
      if (codeExists) {
        toast.showError('Validation Error', `Counter code "${uppercaseCode}" is already registered.`);
        return;
      }

      const newCounter = {
        id: `CNT-${Date.now()}`,
        code: uppercaseCode,
        name: name.trim(),
        deviceId: uppercaseDevice,
        branch,
        status,
        lastHeartbeat: new Date().toISOString(),
        totalBillsToday: 0,
        totalSalesToday: 0
      };

      localStorage.setItem('erp_admin_counters', JSON.stringify([...existing, newCounter]));

      logActivity({
        activityType: 'COUNTER_REGISTERED',
        module: 'Counters',
        actionDescription: `Registered new counter "${name}" [Code: ${uppercaseCode}, Device ID: ${uppercaseDevice}]`
      });

      toast.showSuccess('Registered', `Counter "${uppercaseCode}" registered successfully.`);
      navigate('/admin/counters/reports');
    } catch (err) {
      console.error(err);
      toast.showError('Error', 'Unable to register counter terminal.');
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-[80vh] py-4">
      <div className="max-w-4xl mx-auto bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-6 md:p-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="p-3 bg-violet-50 rounded-xl text-violet-600">
            <Monitor className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">Register New POS Terminal</h2>
            <p className="text-xs text-slate-500 mt-1">Configure and authorize a hardware billing counter for Moliaan ERP sync.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Counter Code */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                <span>Counter Code *</span>
                <button 
                  type="button" 
                  onClick={handleAutoGenerateCode}
                  className="text-violet-600 hover:text-violet-700 lowercase flex items-center gap-1 font-semibold normal-case"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Auto Generate
                </button>
              </label>
              <input 
                type="text" 
                value={code} 
                onChange={(e) => setCode(e.target.value)} 
                placeholder="e.g. POS-03" 
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" 
                required 
              />
            </div>

            {/* Counter Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Counter Name / Title *</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Quick Checkout Front" 
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" 
                required 
              />
            </div>

            {/* Device ID / MAC Hash */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-slate-400" /> Device ID / MAC Hash *
              </label>
              <input 
                type="text" 
                value={deviceId} 
                onChange={(e) => setDeviceId(e.target.value)} 
                placeholder="e.g. MAC-77A1-B2C3" 
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all" 
                required 
              />
            </div>

            {/* Assigned Branch / Outlet */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Assigned Branch / Outlet *
              </label>
              <select 
                value={branch} 
                onChange={(e) => setBranch(e.target.value)} 
                className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                required
              >
                {BRANCH_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Initial Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-100">
            <div>
              <span className="block text-sm font-bold text-slate-800">Initial Active Status</span>
              <span className="block text-xs text-slate-500 mt-0.5">Determine if the counter starts as active and online.</span>
            </div>
            <button
              type="button"
              onClick={() => setStatus(prev => prev === 'Online' ? 'Disabled' : 'Online')}
              className="text-violet-600 focus:outline-none"
            >
              {status === 'Online' ? (
                <ToggleRight className="w-12 h-12 stroke-[1.2]" />
              ) : (
                <ToggleLeft className="w-12 h-12 stroke-[1.2] text-slate-400" />
              )}
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/admin/counters/reports')}
              className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-500/20 hover:shadow-lg transition-all"
            >
              Register Counter
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
