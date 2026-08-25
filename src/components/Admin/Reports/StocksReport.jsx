import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Layers, AlertTriangle, ArrowUpDown, TrendingUp, Search, Download, RefreshCw, BarChart2, ShieldAlert, BadgePercent } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';

const SEED_INVENTORY = [
  {
    id: "SKU-1001",
    name: "Fortune Sunflower Oil 1L",
    category: "Groceries",
    sku: "OIL-FORT-1L",
    barcode: "8901234567890",
    stockQty: 45,
    minAlertQty: 10,
    purchasePrice: 120,
    sellingPrice: 145,
    counterDistribution: { "POS-01": 25, "POS-02": 20 }
  },
  {
    id: "SKU-1002",
    name: "Amul Butter 500g",
    category: "Dairy",
    sku: "DAIRY-BUT-500",
    barcode: "8909876543210",
    stockQty: 4,
    minAlertQty: 8,
    purchasePrice: 240,
    sellingPrice: 275,
    counterDistribution: { "POS-01": 4, "POS-02": 0 }
  },
  {
    id: "SKU-1003",
    name: "Tata Salt 1kg",
    category: "Groceries",
    sku: "SALT-TATA-1K",
    barcode: "8901122334455",
    stockQty: 0,
    minAlertQty: 15,
    purchasePrice: 22,
    sellingPrice: 28,
    counterDistribution: { "POS-01": 0, "POS-02": 0 }
  },
  {
    id: "SKU-1004",
    name: "Red Bull Energy Drink 250ml",
    category: "Beverages",
    sku: "BEV-REDB-250",
    barcode: "9002490205934",
    stockQty: 28,
    minAlertQty: 6,
    purchasePrice: 95,
    sellingPrice: 125,
    counterDistribution: { "POS-01": 18, "POS-02": 10 }
  }
];

export default function StocksReport() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const loadInventory = () => {
      const raw = localStorage.getItem('inventory_products');
      if (!raw || JSON.parse(raw).length === 0) {
        localStorage.setItem('inventory_products', JSON.stringify(SEED_INVENTORY));
        setProducts(SEED_INVENTORY);
      } else {
        setProducts(JSON.parse(raw));
      }
    };
    loadInventory();
  }, []);

  const handleRefresh = () => {
    const raw = localStorage.getItem('inventory_products') || '[]';
    setProducts(JSON.parse(raw));
    toast.showSuccess('Data Refreshed', 'Inventory stock logs updated.');
  };

  // Status computation helper
  const getStockStatus = (stockQty, minAlertQty) => {
    if (stockQty <= 0) return 'OUT_OF_STOCK';
    if (stockQty <= minAlertQty) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  // KPI Calculations (based on filtered list)
  const getFilteredProducts = () => {
    return products.filter(p => {
      const matchesSearch = 
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode || '').toLowerCase().includes(search.toLowerCase());

      const status = getStockStatus(p.stockQty || 0, p.minAlertQty || 0);
      const matchesTab = statusTab === 'ALL' || status === statusTab;
      
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

      return matchesSearch && matchesTab && matchesCategory;
    });
  };

  const filtered = getFilteredProducts();

  const totalCostValuation = filtered.reduce((sum, p) => sum + ((p.stockQty || 0) * (p.purchasePrice || 0)), 0);
  const totalRetailValuation = filtered.reduce((sum, p) => sum + ((p.stockQty || 0) * (p.sellingPrice || 0)), 0);
  const uniqueSKUs = filtered.length;
  
  const criticalAlarmsCount = filtered.filter(p => {
    const status = getStockStatus(p.stockQty || 0, p.minAlertQty || 0);
    return status === 'LOW_STOCK' || status === 'OUT_OF_STOCK';
  }).length;

  const uniqueCategories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No stock records matching filters to export.');
      return;
    }

    const headers = ['SKU', 'Product Name', 'Category', 'Barcode', 'Stock Quantity', 'Min Alert Quantity', 'Purchase Price (Cost)', 'Selling Price (Retail)', 'Total Cost Valuation', 'Total Retail Valuation', 'Status'];
    const rows = filtered.map(p => {
      const status = getStockStatus(p.stockQty || 0, p.minAlertQty || 0);
      return [
        p.sku,
        p.name,
        p.category,
        p.barcode,
        p.stockQty || 0,
        p.minAlertQty || 0,
        p.purchasePrice || 0,
        p.sellingPrice || 0,
        (p.stockQty || 0) * (p.purchasePrice || 0),
        (p.stockQty || 0) * (p.sellingPrice || 0),
        status
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Inventory_Stocks_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity({
      activityType: 'INVENTORY_EXPORTED',
      module: 'Diagnostics',
      actionDescription: `Exported inventory stock report for ${filtered.length} items.`
    });
    toast.showSuccess('Report Exported', 'Stock valuation report CSV downloaded.');
  };

  const tableHeaders = [
    { label: 'SKU & Product Name' },
    { label: 'Category' },
    { label: 'Stock Qty', style: { textAlign: 'right' } },
    { label: 'Cost vs Retail (₹)' },
    { label: 'Total Valuation (Cost)', style: { textAlign: 'right' } },
    { label: 'Terminal Allocation' },
    { label: 'Stock Status' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Reports / Stocks"
        title="Stocks Valuation & Inventory Telemetry"
        subtitle="Live stock valuation, category distribution, and low stock reorder telemetry."
        extra={
          <>
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw size={14} /> Refresh
            </Button>
            <Button variant="purple" onClick={handleExportCSV}>
              <Download size={14} /> Export Stock CSV
            </Button>
          </>
        }
      />

      {/* KPI Metrics Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <StatCard label="Total Cost Valuation" value={`₹${totalCostValuation.toLocaleString('en-IN')}`} icon={Layers} color="#4f46e5" />
        <StatCard label="Projected Retail Value" value={`₹${totalRetailValuation.toLocaleString('en-IN')}`} icon={TrendingUp} color="#10b981" />
        <StatCard label="Total Unique SKUs" value={uniqueSKUs} icon={BarChart2} color="#0891b2" />
        
        {/* Critical alarms count */}
        <div style={{ 
          background: '#ffffff', 
          padding: '16px 20px', 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          animation: criticalAlarmsCount > 0 ? 'amberPulse 2s infinite' : 'none'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Critical Stock Alarms</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: criticalAlarmsCount > 0 ? '#ef4444' : '#111827', margin: '4px 0' }}>
              {criticalAlarmsCount} Items
            </h4>
          </div>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '8px', 
            background: criticalAlarmsCount > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(107, 114, 128, 0.08)', 
            color: criticalAlarmsCount > 0 ? '#ef4444' : '#6b7280', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <ShieldAlert size={18} />
          </div>
        </div>

      </div>

      {/* Filter Controls Panel */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { label: 'All Products', val: 'ALL' },
            { label: 'In Stock', val: 'IN_STOCK' },
            { label: 'Low Stock', val: 'LOW_STOCK' },
            { label: 'Out of Stock', val: 'OUT_OF_STOCK' }
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setStatusTab(tab.val)}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: statusTab === tab.val ? '#1f2937' : 'transparent',
                color: statusTab === tab.val ? '#ffffff' : '#6b7280',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
            <Input 
              type="text" 
              placeholder="Search product name, SKU, or barcode..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
          </div>

          <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {uniqueCategories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Interactive Stock Table */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No inventory records matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(p => {
            const status = getStockStatus(p.stockQty || 0, p.minAlertQty || 0);
            
            // Allocation chips mapping
            const dist = p.counterDistribution || {};
            const allocList = Object.entries(dist).filter(([k, v]) => v > 0);

            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>{p.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                      SKU: {p.sku} • BC: {p.barcode}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', fontWeight: 600 }}>{p.category}</td>
                
                {/* Stock Qty highlight if critical */}
                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: status === 'OUT_OF_STOCK' ? '#ef4444' : status === 'LOW_STOCK' ? '#d97706' : '#111827' }}>
                  {p.stockQty} items
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>Cost: ₹{p.purchasePrice}</span>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Retail: ₹{p.sellingPrice}</span>
                  </div>
                </td>

                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                  ₹{((p.stockQty || 0) * (p.purchasePrice || 0)).toLocaleString('en-IN')}
                </td>

                {/* Counter distribution allocations list */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {allocList.length === 0 ? (
                      <span style={{ fontSize: '0.725rem', color: '#9ca3af', fontStyle: 'italic' }}>Central Stock Only</span>
                    ) : (
                      allocList.map(([counter, qty]) => (
                        <span 
                          key={counter} 
                          style={{ 
                            fontSize: '0.675rem', 
                            background: '#f3f4f6', 
                            color: '#374151', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontWeight: 600,
                            border: '1px solid #e5e7eb'
                          }}
                        >
                          {counter}: {qty}
                        </span>
                      ))
                    )}
                  </div>
                </td>

                {/* Dynamic badge mapping */}
                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={status === 'IN_STOCK' ? 'success' : status === 'LOW_STOCK' ? 'warning' : 'danger'}>
                    {status === 'IN_STOCK' ? 'In Stock' : status === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                  </Badge>
                </td>
              </tr>
            );
          })
        )}
      </Table>

      <style>{`
        @keyframes amberPulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2);
          }
          50% {
            opacity: 0.95;
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.05);
          }
        }
      `}</style>

    </div>
  );
}
