import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function InventoryOverview({ products }) {
  const navigate = useNavigate();

  const total = products.length;
  const lowStock = products.filter(p => Number(p.stock) <= Number(p.minStock) && Number(p.stock) > 0).length;
  const outOfStock = products.filter(p => Number(p.stock) === 0).length;
  const inStock = total - (lowStock + outOfStock);

  const items = [
    { label: 'In Stock', count: inStock, color: '#10b981', icon: CheckCircle, path: '/inventory/products' },
    { label: 'Low Stock', count: lowStock, color: '#d97706', icon: AlertTriangle, path: '/inventory/low-stock' },
    { label: 'Out of Stock', count: outOfStock, color: '#dc2626', icon: AlertOctagon, path: '/inventory/low-stock' }
  ];

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Package size={18} style={{ color: '#7c7a6e' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Inventory Overview</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                background: '#fafafa',
                borderRadius: '12px',
                border: '1px solid #f3f4f6',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} style={{ color: item.color }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563' }}>{item.label}</span>
              </div>
              <strong style={{ fontSize: '1rem', color: '#111827' }}>{item.count} items</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}
