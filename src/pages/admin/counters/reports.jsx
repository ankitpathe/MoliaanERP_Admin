import React, { useState, useEffect } from 'react';
import { Monitor, Eye } from 'lucide-react';

export default function CounterReportsPage() {
  const [counters, setCounters] = useState([]);

  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
    if (list.length === 0) {
      const initial = [
        { id: 'CTR-01', name: 'Delhi POS-01', branch: 'Delhi Central', mac: '00:1A:2B:3C:4D:5E', status: 'Active', receiptsCount: 1540 },
        { id: 'CTR-02', name: 'Mumbai POS-02', branch: 'Mumbai Bandra', mac: '00:1A:2B:3C:4D:5F', status: 'Active', receiptsCount: 928 }
      ];
      localStorage.setItem('erp_admin_counters', JSON.stringify(initial));
      setCounters(initial);
    } else {
      setCounters(list);
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>POS Terminals & Counter Reports</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Inspect physical billing terminals status, receipt counts, and device identifiers.</span>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Terminal Name</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Branch</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>MAC Address</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>Receipts</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {counters.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{c.name}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#6b7280' }}>{c.branch}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>{c.mac}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563', textAlign: 'center' }}>{c.receiptsCount || 0}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: '#ecfdf5', color: '#059669' }}>
                    {c.status || 'Active'}
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
