import React, { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';

export default function AddCounterPage() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [branch, setBranch] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !mac || !branch) return;

    try {
      const existing = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
      const newCounter = {
        id: `CTR-${Date.now()}`,
        name,
        mac: mac.toUpperCase(),
        branch,
        createdDate: new Date().toISOString()
      };
      
      localStorage.setItem('erp_admin_counters', JSON.stringify([...existing, newCounter]));
      
      logActivity({
        activityType: 'CREATE',
        module: 'Branch Settings',
        actionDescription: `Registered POS terminal counter "${name}" with MAC "${mac}"`
      });

      toast.showSuccess('Registered', `Counter "${name}" registered successfully.`);
      setName('');
      setMac('');
      setBranch('');
    } catch (err) {
      toast.showError('Error', 'Unable to register counter terminal.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Register New POS Terminal</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Terminal / Counter Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Counter-04 Billing" style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>MAC Address / Device ID</label>
          <input type="text" value={mac} onChange={(e) => setMac(e.target.value)} placeholder="e.g. 00:1A:2B:3C:4D:5G" style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Branch Location</label>
          <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. Delhi Central" style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} required />
        </div>
        <button type="submit" style={{ padding: '10px', background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
          Register Device Terminal
        </button>
      </form>
    </div>
  );
}
