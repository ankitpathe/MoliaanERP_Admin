import React, { useState, useEffect } from 'react';

export default function AllPlansPage() {
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('erp_admin_plans') || '[]');
    if (list.length === 0) {
      const initial = [
        { id: 'PLAN-01', title: 'Starter Basic', price: 499, duration: 30, deviceLimit: 1, status: 'Active' },
        { id: 'PLAN-02', title: 'Professional Retailer', price: 999, duration: 30, deviceLimit: 3, status: 'Active' },
        { id: 'PLAN-03', title: 'Enterprise Mega', price: 2499, duration: 30, deviceLimit: 10, status: 'Active' }
      ];
      localStorage.setItem('erp_admin_plans', JSON.stringify(initial));
      setPlans(initial);
    } else {
      setPlans(list);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Active Subscription Plans</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Inspect SaaS billing plans tiers and maximum terminal counters quotas.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {plans.map(p => (
          <div key={p.id} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.5px' }}>{p.id}</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>{p.title}</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c7a6e' }}>
              ₹{p.price} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#6b7280' }}>/ month</span>
            </div>
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#4b5563' }}>
              <span>Duration validity: <strong>{p.duration} days</strong></span>
              <span>Device terminals limit: <strong>{p.deviceLimit} Counter(s)</strong></span>
              <span>Status: <strong style={{ color: '#059669' }}>{p.status}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
