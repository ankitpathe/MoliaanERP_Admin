import React from 'react';
import { Terminal, Shield, ArrowRight } from 'lucide-react';

export default function LogDetailModal({ log, onClose }) {
  const formatJSON = (val) => {
    if (!val) return null;
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  };

  const oldFormatted = formatJSON(log.oldValue);
  const newFormatted = formatJSON(log.newValue);

  return (
    <div style={{
      background: '#ffffff',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      maxWidth: '680px',
      width: '90vw',
      maxHeight: '90vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5ebe1', color: '#7c7a6e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={24} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', margin: 0 }}>Log Inspection</h3>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>ID: {log.id} ({log.activityType})</span>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="responsive-two-cols" className="responsive-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
          <span style={{ color: '#9ca3af', fontWeight: 600 }}>USER NAME / ROLE</span>
          <span style={{ color: '#111827', fontWeight: 700 }}>{log.userName} ({log.userRole})</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
          <span style={{ color: '#9ca3af', fontWeight: 600 }}>MODULE</span>
          <span style={{ color: '#111827', fontWeight: 700 }}>{log.module}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
          <span style={{ color: '#9ca3af', fontWeight: 600 }}>DATE / TIME</span>
          <span style={{ color: '#111827', fontWeight: 700 }}>{log.date} at {log.time}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
          <span style={{ color: '#9ca3af', fontWeight: 600 }}>IP ADDRESS / OS</span>
          <span style={{ color: '#111827', fontWeight: 700 }}>{log.ipAddress || '—'} ({log.deviceBrowser})</span>
        </div>
      </div>

      {/* Description */}
      <div style={{ background: '#fafafa', padding: '12px 16px', borderRadius: '10px', fontSize: '0.85rem', color: '#4b5563', borderLeft: '3px solid #7c7a6e' }}>
        <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, display: 'block', marginBottom: '4px' }}>ACTION DESCRIPTION</span>
        {log.actionDescription}
      </div>

      {/* Data Changes Payloads */}
      {(oldFormatted || newFormatted) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Terminal size={12} /> METADATA PAYLOAD COMPARISON
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: oldFormatted && newFormatted ? '1fr 1fr' : '1fr', gap: '16px' }} className="responsive-grid">
            {oldFormatted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#ef4444' }}>Before changes (Old Value)</span>
                <pre style={{ margin: 0, padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.7rem', overflowX: 'auto', maxHeight: '200px' }}>
                  {oldFormatted}
                </pre>
              </div>
            )}
            {newFormatted && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#059669' }}>After changes (New Value)</span>
                <pre style={{ margin: 0, padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.7rem', overflowX: 'auto', maxHeight: '200px' }}>
                  {newFormatted}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        style={{ padding: '10px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', cursor: 'pointer', marginTop: '8px' }}
      >
        Close Inspector
      </button>

      <style>{`
        @media (max-width: 768px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
