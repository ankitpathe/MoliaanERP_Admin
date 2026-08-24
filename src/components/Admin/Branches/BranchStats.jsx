import React from 'react';
import { Building2, Home, Landmark, ShieldCheck } from 'lucide-react';

export default function BranchStats({ branches }) {
  const total = branches.length;
  const active = branches.filter(b => b.status === 'Active').length;
  const warehouses = branches.filter(b => b.type === 'Warehouse').length;
  const hq = branches.filter(b => b.type === 'Head Office').length;

  const cards = [
    { label: 'Total Branches', value: total, icon: Building2, color: '#4f46e5' },
    { label: 'Active Locations', value: active, icon: ShieldCheck, color: '#10b981' },
    { label: 'Warehouses', value: warehouses, icon: Landmark, color: '#b45309' },
    { label: 'Head Office', value: hq, icon: Home, color: '#0891b2' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx}
            style={{
              background: '#ffffff',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{card.label}</span>
              <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{card.value}</h4>
            </div>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: `${card.color}12`,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
