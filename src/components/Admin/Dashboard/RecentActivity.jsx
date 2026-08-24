import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FileText } from 'lucide-react';

export default function RecentActivity({ logs }) {
  const navigate = useNavigate();

  const recentLogs = logs.slice(0, 5);

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
          <Activity size={18} style={{ color: '#4b5563' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Recent System Activity</h3>
        </div>
        <button 
          onClick={() => navigate('/admin/activity-logs')}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#7c7a6e',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View All Activity
        </button>
      </div>

      {recentLogs.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
          <FileText size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.85rem', margin: 0 }}>No recent activity logged.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recentLogs.map((log, idx) => (
            <div 
              key={log.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: idx < recentLogs.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{log.actionDescription}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#9ca3af' }}>
                  <span>{log.userName} ({log.userRole})</span>
                  <span>•</span>
                  <span>{log.time}</span>
                </div>
              </div>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '99px',
                background: log.status === 'Success' ? '#ecfdf5' : '#fef2f2',
                color: log.status === 'Success' ? '#059669' : '#dc2626'
              }}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
