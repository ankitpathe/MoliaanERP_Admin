import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function PosSettingsTab({ config, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
        Terminal Billing & POS Settings
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={!!config.roundOffTotal}
            onChange={(e) => onChange('roundOffTotal', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
          />
          <span>Automatically round off total sales receipt amounts to nearest rupee (₹1)</span>
        </label>
      </div>

      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', display: 'block' }}>Warning: Negative Inventory Operations</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#b45309', cursor: 'pointer', marginTop: '8px' }}>
            <input
              type="checkbox"
              checked={!!config.allowNegativeStockSale}
              onChange={(e) => onChange('allowNegativeStockSale', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
            />
            <span>Allow negative stock sales (POS terminal operator can sell items even if stock count is 0)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
