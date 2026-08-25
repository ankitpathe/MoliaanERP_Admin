import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, CheckCircle } from 'lucide-react';

export default function SubReportsPage() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('erp_admin_subscriptions') || '[]');
    if (list.length === 0) {
      const initial = [
        { id: 'SUB-901', merchant: 'Moliaan Grocery Store', plan: 'Starter Basic', status: 'Active', startDate: '2026-08-01', expiryDate: '2026-08-31', amountPaid: 499 },
        { id: 'SUB-902', merchant: 'Delhi Central Food', plan: 'Professional Retailer', status: 'Active', startDate: '2026-07-20', expiryDate: '2026-08-20', amountPaid: 999 },
        { id: 'SUB-903', merchant: 'Grand Mall Supermarket', plan: 'Enterprise Mega', status: 'Active', startDate: '2026-08-15', expiryDate: '2027-08-15', amountPaid: 2499 }
      ];
      localStorage.setItem('erp_admin_subscriptions', JSON.stringify(initial));
      setSubs(initial);
    } else {
      setSubs(list);
    }
  }, []);

  const totalCollected = subs.reduce((sum, s) => sum + (Number(s.amountPaid) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Active Subscriptions & Revenue Reports</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Consolidated platform licenses, upcoming expiries, and payment pools collections.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Active Merchant Licenses</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{subs.filter(s => s.status === 'Active').length} Store(s)</h4>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Revenue Collections (INR)</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>₹{totalCollected.toLocaleString('en-IN')}</h4>
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Merchant Store</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Pricing Tier</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Expiry Date</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Amount Paid</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>License Status</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{s.merchant}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#6b7280' }}>{s.plan}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>{s.expiryDate}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#111827', textAlign: 'right', fontWeight: 700 }}>₹{s.amountPaid}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: '#ecfdf5', color: '#059669' }}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
