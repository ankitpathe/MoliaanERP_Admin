import React, { useState } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';

export default function AddPlanPage() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [deviceLimit, setDeviceLimit] = useState('2');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !price) return;

    try {
      const existing = JSON.parse(localStorage.getItem('erp_admin_plans') || '[]');
      const newPlan = {
        id: `PLAN-${Date.now()}`,
        title,
        price: parseFloat(price),
        duration: parseInt(duration),
        deviceLimit: parseInt(deviceLimit),
        status: 'Active'
      };
      
      localStorage.setItem('erp_admin_plans', JSON.stringify([...existing, newPlan]));
      
      logActivity({
        activityType: 'CREATE',
        module: 'Billing Settings',
        actionDescription: `Created subscription plan tier "${title}" priced at ₹${price}`
      });

      toast.showSuccess('Plan Created', `Subscription plan "${title}" created successfully.`);
      setTitle('');
      setPrice('');
    } catch (err) {
      toast.showError('Error', 'Unable to create subscription plan.');
    }
  };

  return (
    <div style={{ maxWidth: '600px', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 16px 0' }}>Create SaaS Subscription Plan</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Plan Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Premium Business Tier" style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Price (₹ per Month)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 1999" style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} required />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Duration Validity (Days)</label>
          <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}>
            <option value="30">Monthly (30 Days)</option>
            <option value="90">Quarterly (90 Days)</option>
            <option value="365">Annual (365 Days)</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Device / Counter Terminals Limit</label>
          <input type="number" value={deviceLimit} onChange={(e) => setDeviceLimit(e.target.value)} placeholder="e.g. 5" style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} required />
        </div>
        <button type="submit" style={{ padding: '10px', background: '#7c7a6e', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', marginTop: '8px' }}>
          Publish Subscription Plan
        </button>
      </form>
    </div>
  );
}
