import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';

export default function SubRequestsPage() {
  const toast = useToast();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('erp_admin_sub_requests') || '[]');
    if (list.length === 0) {
      const initial = [
        { id: 'REQ-201', merchant: 'Moliaan Grocery Store', owner: 'Rahul Kumar', email: 'rahul@moliaan.com', currentPlan: 'Starter Basic', requestedPlan: 'Professional Retailer', amount: 999, date: '2026-08-23' },
        { id: 'REQ-202', merchant: 'Fresh Foods Retail', owner: 'Sanjay Dutt', email: 'sanjay@fresh.com', currentPlan: 'Starter Basic', requestedPlan: 'Enterprise Mega', amount: 2499, date: '2026-08-24' }
      ];
      localStorage.setItem('erp_admin_sub_requests', JSON.stringify(initial));
      setRequests(initial);
    } else {
      setRequests(list);
    }
  }, []);

  const handleAction = (id, action) => {
    try {
      const req = requests.find(r => r.id === id);
      const remaining = requests.filter(r => r.id !== id);
      localStorage.setItem('erp_admin_sub_requests', JSON.stringify(remaining));
      setRequests(remaining);

      logActivity({
        activityType: 'UPDATE',
        module: 'Billing Settings',
        actionDescription: `${action === 'APPROVED' ? 'Approved' : 'Rejected'} subscription upgrade request ID ${id} for merchant "${req?.merchant}"`
      });

      toast.showSuccess(action === 'APPROVED' ? 'Approved' : 'Rejected', `Merchant subscription upgrade has been ${action === 'APPROVED' ? 'approved' : 'rejected'}.`);
    } catch (err) {
      toast.showError('Error', 'Unable to process subscription request.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Pending Subscription Upgrades</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Approve or reject merchant requests to switch billing tiers.</span>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
        {requests.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '0.85rem' }}>
            No pending merchant upgrade requests found.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Merchant / Owner</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Current Plan</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Requested Tier</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#1f2937' }}>{req.merchant}</span>
                      <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>Owner: {req.owner} ({req.email})</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#ef4444' }}>{req.currentPlan}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>{req.requestedPlan}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#111827', textAlign: 'right', fontWeight: 700 }}>₹{req.amount}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleAction(req.id, 'APPROVED')} style={{ padding: '4px 10px', background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
                      <button onClick={() => handleAction(req.id, 'REJECTED')} style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
