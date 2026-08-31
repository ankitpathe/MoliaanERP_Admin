import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Info, AlertTriangle } from 'lucide-react';

export default function NotificationsPanel({ lowStockCount }) {
  const navigate = useNavigate();

  // Create real-time notification alerts
  const alerts = [];
  if (lowStockCount > 0) {
    alerts.push({
      type: 'warning',
      message: `Stock Alert: ${lowStockCount} items are running below reorder levels.`,
      desc: 'Check products list to adjust stocks.',
      path: '/inventory/low-stock'
    });
  }
  alerts.push({
    type: 'info',
    message: 'System Security Audit completed successfully.',
    desc: 'All user authorization matrices are up to date.',
    path: '/admin/security'
  });

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
          <Bell size={18} style={{ color: '#d97706' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>System Notifications & Alerts</h3>
        </div>
        <button 
          onClick={() => navigate('/admin/notifications')}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#7c7a6e',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View All Alerts
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {alerts.map((alert, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(alert.path)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px',
              background: alert.type === 'warning' ? '#fffbeb' : '#f9fafb',
              border: `1px solid ${alert.type === 'warning' ? '#fef3c7' : '#f3f4f6'}`,
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            {alert.type === 'warning' ? (
              <AlertTriangle size={16} style={{ color: '#d97706', marginTop: '2px' }} />
            ) : (
              <Info size={16} style={{ color: '#3fa9f5', marginTop: '2px' }} />
            )}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: alert.type === 'warning' ? '#92400e' : '#374151', display: 'block' }}>
                {alert.message}
              </span>
              <span style={{ fontSize: '0.75rem', color: alert.type === 'warning' ? '#b45309' : '#6b7280', display: 'block', marginTop: '2px' }}>
                {alert.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
