import React from 'react';

export default function PaymentCreditTab({ config, onChange }) {
  const paymentMethods = ['cash', 'upi', 'card', 'khata'];

  const handleMethodToggle = (method) => {
    const activeMethods = config.allowedPaymentMethods || ['cash', 'upi'];
    const updated = activeMethods.includes(method)
      ? activeMethods.filter(m => m !== method)
      : [...activeMethods, method];
    onChange('allowedPaymentMethods', updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
        Payment & Credit Policies
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Allowed Payment Methods</label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
          {paymentMethods.map(method => {
            const isAllowed = (config.allowedPaymentMethods || ['cash', 'upi']).includes(method);
            return (
              <label 
                key={method} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer', background: '#fafafa', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${isAllowed ? '#7c7a6e' : '#e5e7eb'}` }}
              >
                <input
                  type="checkbox"
                  checked={isAllowed}
                  onChange={() => handleMethodToggle(method)}
                  style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
                />
                <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{method}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }} className="responsive-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Default Credit Payment Due Days</label>
          <input
            type="number"
            value={config.defaultPaymentDueDays || 0}
            onChange={(e) => onChange('defaultPaymentDueDays', parseInt(e.target.value) || 0)}
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
          />
        </div>
      </div>
    </div>
  );
}
