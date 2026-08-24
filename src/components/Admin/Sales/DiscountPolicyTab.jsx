import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DiscountPolicyTab({ config, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
        Discount & Price Policies
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Maximum Allowed Discount (%)</label>
          <input
            type="number"
            max="100"
            min="0"
            value={config.maxDiscountPercent || 0}
            onChange={(e) => onChange('maxDiscountPercent', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
          <input
            type="checkbox"
            checked={!!config.allowItemDiscount}
            onChange={(e) => onChange('allowItemDiscount', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
          />
          <span>Allow item-level discount during billing</span>
        </label>
      </div>

      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '16px', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', display: 'block' }}>Warning: Price Override Permissions</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#b45309', cursor: 'pointer', marginTop: '8px' }}>
            <input
              type="checkbox"
              checked={!!config.allowPriceOverride}
              onChange={(e) => onChange('allowPriceOverride', e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
            />
            <span>Allow operators to override product MRP/selling prices manually</span>
          </label>
        </div>
      </div>
    </div>
  );
}
