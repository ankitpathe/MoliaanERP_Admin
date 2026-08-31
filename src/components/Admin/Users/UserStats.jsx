import React from 'react';
import { Users, UserCheck, UserX, ShieldAlert } from 'lucide-react';

export default function UserStats({ users }) {
  const total = users.length;
  const active = users.filter(u => u.status === 'Active').length;
  const inactive = total - active;
  const admins = users.filter(u => u.role === 'Administrator').length;

  const cards = [
    { label: 'Total Users', value: total, icon: Users, color: '#3fa9f5' },
    { label: 'Active Users', value: active, icon: UserCheck, color: '#10b981' },
    { label: 'Inactive Users', value: inactive, icon: UserX, color: '#dc2626' },
    { label: 'Administrators', value: admins, icon: ShieldAlert, color: '#0891b2' }
  ];

  return (
    <div className="responsive-grid-4">
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
