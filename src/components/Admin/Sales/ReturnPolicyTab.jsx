import React from 'react';

export default function ReturnPolicyTab({ config, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
        Sales Return Policies
      </h3>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={!!config.allowSalesReturn}
          onChange={(e) => onChange('allowSalesReturn', e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
        />
        <span>Enable sales returns and exchange policies</span>
      </label>

      {config.allowSalesReturn && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', animation: 'fade-in 0.2s ease' }} className="responsive-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Sales Return Window (Days)</label>
            <input
              type="number"
              value={config.returnWindowDays || 0}
              onChange={(e) => onChange('returnWindowDays', parseInt(e.target.value) || 0)}
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
            <input
              type="checkbox"
              checked={!!config.requireInvoiceForReturn}
              onChange={(e) => onChange('requireInvoiceForReturn', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
            />
            <span>Require original invoice verification for returns</span>
          </label>
        </div>
      )}
    </div>
  );
}
