import React from 'react';
import { Database, ShieldCheck, PieChart, Users } from 'lucide-react';

export default function LogStats({ logs }) {
  const total = logs.length;

  // Calculate today's actions
  const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const todayActions = logs.filter(l => l.date === todayStr).length;

  // Calculate unique users
  const uniqueUsers = new Set(logs.map(l => l.userName)).size;

  // Calculate top active module
  const moduleCounts = {};
  logs.forEach(l => {
    if (l.module) {
      moduleCounts[l.module] = (moduleCounts[l.module] || 0) + 1;
    }
  });
  let topModule = 'N/A';
  let maxCount = 0;
  Object.entries(moduleCounts).forEach(([mod, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topModule = mod;
    }
  });

  const cards = [
    { label: 'Total Events Logged', value: total, icon: Database, color: '#3b82f6' },
    { label: "Today's Actions", value: todayActions, icon: ShieldCheck, color: '#10b981' },
    { label: 'Top Active Module', value: topModule, icon: PieChart, color: '#8b5cf6' },
    { label: 'Unique Users', value: uniqueUsers, icon: Users, color: '#f59e0b' }
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
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{card.value}</h4>
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
