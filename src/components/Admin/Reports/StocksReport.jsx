import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, BarChart3, Boxes } from 'lucide-react';

export default function StocksReport() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    try {
      const prods = JSON.parse(localStorage.getItem('erp_products') || '[]');
      if (prods.length === 0) {
        // Seed some sample products for report views
        const sampleProds = [
          { id: '1', name: 'Britannia Marie Gold', category: 'Packaged Food', stock: 120, price: 30, mrp: 30, brandUnit: 'Pcs' },
          { id: '2', name: 'Amul Butter 500g', category: 'Dairy', stock: 4, price: 275, mrp: 275, brandUnit: 'Pcs' },
          { id: '3', name: 'Coca Cola 2L', category: 'Beverages', stock: 0, price: 95, mrp: 100, brandUnit: 'Pcs' },
          { id: '4', name: 'Tata Salt 1kg', category: 'General Goods', stock: 85, price: 28, mrp: 28, brandUnit: 'Pcs' }
        ];
        localStorage.setItem('erp_products', JSON.stringify(sampleProds));
        setProducts(sampleProds);
      } else {
        setProducts(prods);
      }
    } catch (e) {
      console.error('Error loading products for stock report:', e);
    }
  }, []);

  // Compute stats
  const totalSku = products.length;
  const totalStockVolume = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalValuation = products.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);
  
  const lowStockCount = products.filter(p => (Number(p.stock) > 0 && Number(p.stock) < 10)).length;
  const outOfStockCount = products.filter(p => Number(p.stock) <= 0).length;

  // Compute category breakdown
  const categorySummary = {};
  products.forEach(p => {
    const cat = p.category || 'General';
    if (!categorySummary[cat]) {
      categorySummary[cat] = { count: 0, stock: 0, valuation: 0 };
    }
    categorySummary[cat].count += 1;
    categorySummary[cat].stock += Number(p.stock) || 0;
    categorySummary[cat].valuation += (Number(p.stock) || 0) * (Number(p.price) || 0);
  });

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.sku || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

    let matchesStatus = true;
    if (stockStatus === 'OUT') {
      matchesStatus = Number(p.stock) <= 0;
    } else if (stockStatus === 'LOW') {
      matchesStatus = Number(p.stock) > 0 && Number(p.stock) < 10;
    } else if (stockStatus === 'OK') {
      matchesStatus = Number(p.stock) >= 10;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>System Stock Position</h2>
        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Global real-time inventory levels, valuation pool, and critical alerts monitor.</span>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Active SKUs</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{totalSku} Products</h4>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total Stock Volume</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{totalStockVolume} Units</h4>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Inventory Valuation</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>₹{totalValuation.toLocaleString('en-IN')}</h4>
        </div>
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Critical Stock Alerts</span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', margin: '4px 0' }}>{lowStockCount + outOfStockCount} Items</h4>
          </div>
          <AlertTriangle size={24} style={{ color: '#ef4444' }} />
        </div>
      </div>

      {/* Category aggregations breakdown */}
      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', margin: '0 0 12px 0' }}>Category Aggregation Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          {Object.entries(categorySummary).map(([catName, metrics]) => (
            <div key={catName} style={{ padding: '12px', borderRadius: '8px', background: '#fafafa', border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>{catName}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#6b7280', marginTop: '6px' }}>
                <span>Stock: {metrics.stock}</span>
                <span>Valuation: ₹{metrics.valuation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and search */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        background: '#ffffff',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fafafa', outline: 'none' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', outline: 'none', color: '#4b5563', cursor: 'pointer' }}
        >
          <option value="All">All Categories</option>
          {Object.keys(categorySummary).map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', outline: 'none', color: '#4b5563', cursor: 'pointer' }}
        >
          <option value="All">All Stock Levels</option>
          <option value="OK">Adequate (&gt;= 10)</option>
          <option value="LOW">Low Stock (&lt; 10)</option>
          <option value="OUT">Out of Stock (= 0)</option>
        </select>
      </div>

      {/* Products table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Product Name</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>Stock Qty</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>Health Status</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Valuation</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const stock = Number(p.stock) || 0;
              const isOut = stock <= 0;
              const isLow = stock > 0 && stock < 10;
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#6b7280' }}>{p.category || 'General'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563', textAlign: 'right' }}>₹{Number(p.price || 0).toFixed(2)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563', textAlign: 'center', fontWeight: 600 }}>{stock} {p.brandUnit || 'Pcs'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '99px',
                      background: isOut ? '#fef2f2' : (isLow ? '#fffbeb' : '#ecfdf5'),
                      color: isOut ? '#dc2626' : (isLow ? '#d97706' : '#059669')
                    }}>
                      {isOut ? 'Out of Stock' : (isLow ? 'Low Stock' : 'Healthy')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#374151', textAlign: 'right' }}>₹{(stock * Number(p.price || 0)).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
