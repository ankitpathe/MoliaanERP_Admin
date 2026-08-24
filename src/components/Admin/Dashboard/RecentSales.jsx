import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye } from 'lucide-react';

export default function RecentSales({ sales }) {
  const navigate = useNavigate();

  const recentSales = sales.slice(0, 5);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} style={{ color: '#4b5563' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Recent Sales</h3>
        </div>
        <button 
          onClick={() => navigate('/sales/list')}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#7c7a6e',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View All Sales
        </button>
      </div>

      {recentSales.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
          No sales recorded yet
        </div>
      ) : (
        <div style={{ overflowX: 'auto', margin: '0 -24px', padding: '0 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                {['Sale ID', 'Customer', 'Date', 'Amount', 'Payment', 'Status', 'Action'].map((head, idx) => (
                  <th key={idx} style={{ padding: '10px 8px', fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale, idx) => (
                <tr key={sale.id || idx} style={{ borderBottom: idx < recentSales.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>
                    {sale.id}
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: '#4b5563' }}>
                    {sale.customerName || 'Walk-in Customer'}
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '0.8rem', color: '#6b7280' }}>
                    {sale.date}
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '0.8rem', fontWeight: 600, color: '#111827' }}>
                    ₹{Number(sale.total || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      textTransform: 'uppercase',
                      background: sale.paymentMethod === 'due' ? '#fef3c7' : '#ecfdf5',
                      color: sale.paymentMethod === 'due' ? '#d97706' : '#059669'
                    }}>
                      {sale.paymentMethod || 'UPI'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      background: sale.status === 'Paid' ? '#ecfdf5' : '#fef2f2',
                      color: sale.status === 'Paid' ? '#059669' : '#dc2626'
                    }}>
                      {sale.status || 'Paid'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <button 
                      onClick={() => navigate('/sales/list')}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        borderRadius: '4px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
