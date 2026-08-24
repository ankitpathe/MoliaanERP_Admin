import React from 'react';
import { Briefcase, UserCheck, UserX, CalendarClock } from 'lucide-react';

export default function EmployeeStats({ employees }) {
  const total = employees.length;
  const active = employees.filter(e => e.status === 'Active').length;
  const inactive = employees.filter(e => e.status === 'Inactive').length;
  const onLeave = employees.filter(e => e.status === 'On Leave').length;

  const cards = [
    { label: 'Total Employees', value: total, icon: Briefcase, color: '#4f46e5' },
    { label: 'Active Staff', value: active, icon: UserCheck, color: '#10b981' },
    { label: 'On Leave', value: onLeave, icon: CalendarClock, color: '#d97706' },
    { label: 'Inactive', value: inactive, icon: UserX, color: '#dc2626' }
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
