import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Truck } from 'lucide-react';

export default function CustomerSupplierOverview({ customersCount, suppliersCount }) {
  const navigate = useNavigate();

  const sections = [
    { label: 'Customers', count: customersCount, icon: Users, path: '/customers/ledger', color: '#3fa9f5' },
    { label: 'Suppliers', count: suppliersCount, icon: Truck, path: '/suppliers/ledger', color: '#0891b2' }
  ];

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
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Business Contacts Summary</h3>
      
      <div className="responsive-two-cols">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(sec.path)}
              style={{
                background: '#fafafa',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: `${sec.color}12`,
                color: sec.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={18} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>{sec.label}</span>
                <strong style={{ fontSize: '1.2rem', color: '#111827' }}>{sec.count}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
