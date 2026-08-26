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
    id: "STK-1001",
    sku: "SKU-RICE-5K",
    barcode: "8901030383811",
    name: "Fortune Basmati Rice 5kg",
    category: "Grocery / Staples",
    storeName: "WWE Arena Supermart",
    costPrice: 520,
    sellingPrice: 650,
    stockQty: 42,
    minThreshold: 15,
    unit: "Pcs",
    lastUpdated: "2026-08-25T11:00:00.000Z"
  },
  {
    id: "STK-1002",
    sku: "SKU-OIL-1L",
    barcode: "8901030491022",
    name: "Fortune Mustard Oil 1L",
    category: "Edible Oils",
    storeName: "WWE Arena Supermart",
    costPrice: 145,
    sellingPrice: 180,
    stockQty: 4,
    minThreshold: 10,
    unit: "Bottles",
    lastUpdated: "2026-08-25T10:30:00.000Z"
  },
  {
    id: "STK-1003",
    sku: "SKU-BUTTER-500",
    barcode: "8901262010052",
    name: "Amul Butter 500g",
    category: "Dairy & Frozen",
    storeName: "WWE Arena Supermart",
    costPrice: 240,
    sellingPrice: 275,
    stockQty: 0,
    minThreshold: 8,
    unit: "Packs",
    lastUpdated: "2026-08-24T18:00:00.000Z"
  },
  {
    id: "STK-1004",
    sku: "SKU-SUGAR-KG",
    barcode: "8901112233445",
    name: "Madhur Pure Sugar",
    category: "Grocery / Staples",
    storeName: "WWE Arena Supermart",
    costPrice: 40,
    sellingPrice: 48,
    stockQty: 8.5,
    minThreshold: 20,
    unit: "Kg",
    lastUpdated: "2026-08-25T09:15:00.000Z"
  },
  {
    id: "STK-1005",
    sku: "SKU-SHOE-NK09",
    barcode: "8904552091102",
    name: "Apex Air Sport Shoes",
    category: "Footwear",
    storeName: "Apex Footwear Hub",
    costPrice: 1200,
    sellingPrice: 2499,
    stockQty: 18,
    minThreshold: 5,
    unit: "Pairs",
    lastUpdated: "2026-08-23T14:00:00.000Z"
  }
];

export default function StocksReport() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [storeFilter, setStoreFilter] = useState('All');

  // Restock modal state
  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Stock check count');

  useEffect(() => {
    const loadInventory = () => {
      const raw = localStorage.getItem('erp_stocks') || localStorage.getItem('products') || localStorage.getItem('inventory');
      let data = [];
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = [];
        }
      }
      // Check if missing proper numeric fields on first item
      if (!data || data.length === 0 || data[0].costPrice === undefined) {
        data = SEED_INVENTORY;
      }
      const normalized = data.map(item => {
        const id = item.id || "STK-" + Date.now().toString().slice(-4);
        const sku = item.sku || "SKU-GENERIC";
        const barcode = item.barcode || "8900000000000";
        const name = item.name || "Generic Item";
        const category = item.category || "Grocery / Staples";
        const storeName = item.storeName || "WWE Arena Supermart";
        const costPrice = parseFloat(item.costPrice || item.purchasePrice || 0);
        const sellingPrice = parseFloat(item.sellingPrice || 0);
        const stockQty = parseFloat(item.stockQty || 0);
        const minThreshold = parseFloat(item.minThreshold || item.minAlertQty || 5);
        const unit = item.unit || "Pcs";
        const lastUpdated = item.lastUpdated || new Date().toISOString();
        return {
          id,
          sku,
          barcode,
          name,
          category,
          storeName,
          costPrice,
          sellingPrice,
          stockQty,
          minThreshold,
          unit,
          lastUpdated
        };
      });
      localStorage.setItem('erp_stocks', JSON.stringify(normalized));
      setProducts(normalized);
    };
    loadInventory();
  }, []);

  const handleRefresh = () => {
    const raw = localStorage.getItem('erp_stocks') || '[]';
    setProducts(JSON.parse(raw));
    toast.showSuccess('Data Refreshed', 'Inventory stock logs updated.');
  };

  const saveProducts = (updated) => {
    localStorage.setItem('erp_stocks', JSON.stringify(updated));
    setProducts(updated);
  };

  // Status computation helper
  const getStockStatus = (stockQty, minThreshold) => {
    const qty = parseFloat(stockQty);
    const threshold = parseFloat(minThreshold);
    if (qty <= 0) return 'OUT_OF_STOCK';
    if (qty <= threshold) return 'LOW_STOCK';
    return 'IN_STOCK';
  };

  // KPI Calculations (based on filtered list)
  const getFilteredProducts = () => {
    return products.filter(p => {
      const matchesSearch = 
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode || '').toLowerCase().includes(search.toLowerCase());

      const status = getStockStatus(p.stockQty, p.minThreshold);
      const matchesTab = statusTab === 'ALL' || status === statusTab;
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesStore = storeFilter === 'All' || p.storeName === storeFilter;

      return matchesSearch && matchesTab && matchesCategory && matchesStore;
    });
  };

  const filtered = getFilteredProducts();

  // Valuation must be Cost Price (purchasePrice/costPrice)
  const totalCostValuation = filtered.reduce((sum, p) => sum + (parseFloat(p.stockQty || 0) * parseFloat(p.costPrice || 0)), 0);
  const uniqueSKUs = filtered.length;
  const lowStockCount = filtered.filter(p => {
    const status = getStockStatus(p.stockQty, p.minThreshold);
    return status === 'LOW_STOCK';
  }).length;
  const outOfStockCount = filtered.filter(p => {
    const status = getStockStatus(p.stockQty, p.minThreshold);
    return status === 'OUT_OF_STOCK';
  }).length;

  const uniqueCategories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const uniqueStores = ['All', ...new Set(products.map(p => p.storeName).filter(Boolean))];

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No stock records matching filters to export.');
      return;
    }

    const headers = ['SKU', 'Product Name', 'Category', 'Store Name', 'Barcode', 'Stock Quantity', 'Min Threshold', 'Unit', 'Cost Price', 'Selling Price', 'Total Cost Valuation', 'Total Retail Valuation', 'Status'];
    const rows = filtered.map(p => {
      const status = getStockStatus(p.stockQty, p.minThreshold);
      return [
        p.sku,
        p.name,
        p.category,
        p.storeName,
        p.barcode,
        p.stockQty || 0,
        p.minThreshold || 0,
        p.unit || 'Pcs',
        p.costPrice || 0,
        p.sellingPrice || 0,
        (parseFloat(p.stockQty || 0) * parseFloat(p.costPrice || 0)).toFixed(2),
        (parseFloat(p.stockQty || 0) * parseFloat(p.sellingPrice || 0)).toFixed(2),
        status
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Stock_Inventory_Report_2026.csv');
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
    { label: 'Category & Store' },
    { label: 'Stock Qty', style: { textAlign: 'right' } },
    { label: 'Cost vs Sell (₹)' },
    { label: 'Total Valuation (Cost)', style: { textAlign: 'right' } },
    { label: 'Stock Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
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
        
        <StatCard label="Total Stock Valuation" value={`₹${totalCostValuation.toLocaleString('en-IN')}`} icon={Layers} color="#4f46e5" />
        <StatCard label="Total Unique SKUs" value={uniqueSKUs} icon={BarChart2} color="#0891b2" />
        <StatCard label="Low Stock Items" value={lowStockCount} icon={AlertTriangle} color="#d97706" />
        <StatCard label="Out of Stock" value={outOfStockCount} icon={ShieldAlert} color="#ef4444" />

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

          <Select value={storeFilter} onChange={e => setStoreFilter(e.target.value)}>
            <option value="All">All Stores</option>
            {uniqueStores.filter(s => s !== 'All').map(s => (
              <option key={s} value={s}>{s}</option>
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
            const qty = parseFloat(p.stockQty || 0);
            const threshold = parseFloat(p.minThreshold || 5);
            const unit = p.unit || "Pcs";
            
            let badgeVariant = 'success';
            let badgeText = `IN STOCK (${qty} ${unit})`;
            if (qty <= 0) {
              badgeVariant = 'danger';
              badgeText = `OUT OF STOCK (0)`;
            } else if (qty <= threshold) {
              badgeVariant = 'warning';
              badgeText = `LOW STOCK (${qty} ${unit})`;
            }

            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <strong style={{ fontWeight: 700, color: '#111827' }}>{p.name}</strong>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ background: '#f3e8ff', color: '#6b21a8', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                        SKU: {p.sku}
                      </span>
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', borderRadius: '9999px' }}>
                        BC: {p.barcode}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Badge variant="info">{p.category}</Badge>
                    <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>{p.storeName}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: qty <= 0 ? '#ef4444' : qty <= threshold ? '#d97706' : '#111827' }}>
                  {qty} {unit}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>Cost: ₹{p.costPrice}</span>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Sell: ₹{p.sellingPrice}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                  ₹{(qty * parseFloat(p.costPrice || 0)).toFixed(2)}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={badgeVariant}>
                    {badgeText}
                  </Badge>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <Button variant="secondary" onClick={() => { setAdjustingProduct(p); setAdjustQty(''); }} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                    Adjust / Restock
                  </Button>
                </td>
              </tr>
            );
          })
        )}
      </Table>

      {/* Adjust / Restock Modal overlay */}
      {adjustingProduct && (() => {
        const handleSaveAdjustment = (e) => {
          e.preventDefault();
          const adjustment = parseFloat(adjustQty);
          if (isNaN(adjustment)) {
            toast.showError('Validation Error', 'Please enter a valid numeric quantity.');
            return;
          }

          const currentQty = parseFloat(adjustingProduct.stockQty || 0);
          const newQty = Math.max(0, currentQty + adjustment);

          const updated = products.map(p => {
            if (p.id === adjustingProduct.id) {
              return {
                ...p,
                stockQty: newQty,
                lastUpdated: new Date().toISOString()
              };
            }
            return p;
          });

          saveProducts(updated);

          logActivity({
            activityType: 'STOCK_ADJUSTED',
            module: 'Diagnostics',
            actionDescription: `Adjusted stock for "${adjustingProduct.name}" by ${adjustment >= 0 ? '+' : ''}${adjustment} ${adjustingProduct.unit} (New Qty: ${newQty} ${adjustingProduct.unit}). Reason: ${adjustReason}`
          });

          toast.showSuccess('Stock Adjusted', `Stock quantity updated to ${newQty} ${adjustingProduct.unit}.`);
          setAdjustingProduct(null);
          setAdjustQty('');
          setAdjustReason('Stock check count');
        };

        return (
          <>
            <div 
              onClick={() => setAdjustingProduct(null)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
            />
            <form onSubmit={handleSaveAdjustment} style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '380px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '24px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Adjust / Restock Inventory</span>
                <button type="button" onClick={() => setAdjustingProduct(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Item Name</span>
                <strong style={{ fontSize: '0.85rem', color: '#1f2937' }}>{adjustingProduct.name}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Current Central Stock</span>
                <strong style={{ fontSize: '0.85rem', color: '#111827' }}>{adjustingProduct.stockQty} {adjustingProduct.unit}</strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Adjustment Quantity (+ or -) *</span>
                <input 
                  type="number" 
                  step="any"
                  placeholder="e.g. 10 or -5"
                  value={adjustQty}
                  onChange={e => setAdjustQty(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Reason / Notes</span>
                <input 
                  type="text" 
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setAdjustingProduct(null)}
                  style={{ flex: 1, padding: '10px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', background: 'linear-gradient(to right, #7c3aed, #4f46e5)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </>
        );
      })()}

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
