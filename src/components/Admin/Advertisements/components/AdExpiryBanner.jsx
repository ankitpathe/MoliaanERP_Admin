import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function AdExpiryBanner({ expiringAds, isAlertDismissed, setIsAlertDismissed, handleExtendCampaign }) {
  if (expiringAds.length === 0 || isAlertDismissed) return null;

  return (
    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
            {expiringAds.length} campaign(s) expiring soon
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
            {expiringAds.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#b45309' }}>
                <span>• {a.title} ({a.advertiser}) — Ends: {new Date(a.endDate).toLocaleDateString()}</span>
                <button 
                  onClick={() => handleExtendCampaign(a.id)}
                  style={{ background: '#f59e0b', border: 'none', borderRadius: '4px', color: '#ffffff', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Quick Renew (30d)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => setIsAlertDismissed(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
        <X size={16} />
      </button>
    </div>
  );
}
