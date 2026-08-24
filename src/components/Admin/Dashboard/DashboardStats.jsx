import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  CreditCard,
  ShoppingBag,
  UserCheck
} from 'lucide-react';

export default function DashboardStats({ data }) {
  const navigate = useNavigate();

  const statCards = [
    { label: 'Total Users', value: data.totalUsers, desc: 'Registered system users', icon: Users, color: '#4f46e5', path: '/admin/users' },
    { label: 'Active Users', value: data.activeUsers, desc: 'Users active in session', icon: UserCheck, color: '#10b981', path: '/admin/users' },
    { label: 'Employees', value: data.totalEmployees, desc: 'Staff count in registry', icon: Briefcase, color: '#0891b2', path: '/employees/list' },
    { label: 'Total Customers', value: data.totalCustomers, desc: 'Active client accounts', icon: CreditCard, color: '#d97706', path: '/customers/ledger' },
    { label: 'Total Products', value: data.totalProducts, desc: 'Catalog product count', icon: Package, color: '#b45309', path: '/inventory/products' },
    { label: 'Total Sales', value: `₹${data.totalSales.toLocaleString('en-IN')}`, desc: `${data.salesCount} invoices processed`, icon: TrendingUp, color: '#059669', path: '/sales/list' },
    { label: 'Total Expenses', value: `₹${data.totalExpenses.toLocaleString('en-IN')}`, desc: 'Business expenses logged', icon: ShoppingBag, color: '#dc2626', path: '/expenses/tracker' },
    { label: 'Low Stock Items', value: data.lowStockCount, desc: 'Below safety threshold', icon: AlertTriangle, color: data.lowStockCount > 0 ? '#d97706' : '#6b7280', path: '/inventory/low-stock' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{card.value}</h3>
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{card.desc}</span>
            </div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `${card.color}12`,
              color: card.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={22} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
