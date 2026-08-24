import React from 'react';

export default function InvoiceSequenceTab({ config, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
        Invoice Numbering Sequence Settings
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Invoice Prefix</label>
          <input
            type="text"
            value={config.invoicePrefix || ''}
            onChange={(e) => onChange('invoicePrefix', e.target.value)}
            placeholder="e.g. INV"
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Invoice Separator</label>
          <input
            type="text"
            value={config.invoiceSeparator || ''}
            onChange={(e) => onChange('invoiceSeparator', e.target.value)}
            placeholder="e.g. /"
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Next Invoice Number</label>
          <input
            type="number"
            value={config.nextInvoiceNumber || 0}
            onChange={(e) => onChange('nextInvoiceNumber', parseInt(e.target.value) || 0)}
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#4b5563', cursor: 'pointer', marginTop: '24px' }}>
          <input
            type="checkbox"
            checked={!!config.includeFinancialYear}
            onChange={(e) => onChange('includeFinancialYear', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
          />
          <span>Include current Financial Year (e.g., 2026-27)</span>
        </label>
      </div>
    </div>
  );
}
