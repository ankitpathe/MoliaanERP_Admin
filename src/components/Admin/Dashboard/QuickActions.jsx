import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Briefcase, 
  PlusCircle, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart3 
} from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: 'Add User', icon: UserPlus, path: '/admin/users/new', color: '#3fa9f5' },
    { label: 'Add Employee', icon: Briefcase, path: '/admin/employees/new', color: '#0891b2' },
    { label: 'Add Product', icon: PlusCircle, path: '/inventory/products', color: '#b45309' },
    { label: 'Create Sale / Invoice', icon: ShoppingCart, path: '/sales/pos', color: '#059669' },
    { label: 'Add Customer', icon: Users, path: '/customers/ledger', color: '#3fa9f5' },
    { label: 'Add Supplier', icon: Truck, path: '/suppliers/ledger', color: '#0891b2' },
    { label: 'View Reports', icon: BarChart3, path: '/admin/reports', color: '#7c7a6e' }
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
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(act.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#374151',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <Icon size={16} style={{ color: act.color }} />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
