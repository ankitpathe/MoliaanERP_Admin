import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, Boxes, Tag, ShieldAlert } from 'lucide-react';

export default function StocksReport() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    try {
      const prods = JSON.parse(localStorage.getItem('erp_products') || '[]');
      if (prods.length === 0) {
        const sampleProds = [
          { id: '1', sku: 'SKU-MARIE-01', name: 'Britannia Marie Gold 250g', category: 'Packaged Food', stock: 120, price: 25, mrp: 30, brandUnit: 'Pcs' },
          { id: '2', sku: 'SKU-AMUL-02', name: 'Amul Butter 500g', category: 'Dairy', stock: 4, price: 240, mrp: 275, brandUnit: 'Pcs' },
          { id: '3', sku: 'SKU-COKE-03', name: 'Coca Cola 2L', category: 'Beverages', stock: 0, price: 80, mrp: 100, brandUnit: 'Pcs' },
          { id: '4', sku: 'SKU-SALT-04', name: 'Tata Salt 1kg', category: 'General Goods', stock: 85, price: 22, mrp: 28, brandUnit: 'Pcs' }
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

  // Compute stock KPIs
  const totalSku = products.length;
  const totalStockVolume = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  
  // Cost vs Retail valuation
  const totalValuationCost = products.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0);
  const totalValuationRetail = products.reduce((sum, p) => sum + ((Number(p.stock) || 0) * (Number(p.mrp) || 0)), 0);

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
    categorySummary[cat].valuation += (Number(p.stock) || 0) * (Number(p.mrp) || 0);
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
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">System Stock Position</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time store stock counts, catalog valuations, and inventory alerts telemetry.</p>
      </div>

      {/* Top KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Cost Val */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Value (Cost Price)</span>
          <h4 className="text-2xl font-extrabold text-slate-800 mt-1">₹{totalValuationCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
        </div>

        {/* Retail Val */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Value (Retail Price)</span>
          <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">₹{totalValuationRetail.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
        </div>

        {/* Low Stock SKUs */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock SKUs</span>
            <h4 className="text-2xl font-extrabold text-amber-500 mt-1">{lowStockCount} Items</h4>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>

        {/* Out of Stock */}
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5 flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock Items</span>
            <h4 className="text-2xl font-extrabold text-rose-500 mt-1">{outOfStockCount} Items</h4>
          </div>
          <ShieldAlert className="w-5 h-5 text-rose-500" />
        </div>

      </div>

      {/* Category Rollup grid */}
      <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Category Aggregation Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(categorySummary).map(([catName, metrics]) => (
            <div key={catName} className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
              <span className="text-xs font-extrabold text-slate-700 block truncate">{catName}</span>
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mt-2">
                <span>Stock: {metrics.stock}</span>
                <span>Val: ₹{metrics.valuation.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="All">All Categories</option>
            {Object.keys(categorySummary).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="All">All Stock Levels</option>
            <option value="OK">Adequate Stock (&gt;= 10)</option>
            <option value="LOW">Low Stock Alert (&lt; 10)</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>

      </div>

      {/* Central Rollup Table */}
      <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Boxes className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.2]" />
            <h4 className="text-sm font-bold text-slate-700">No Inventory Items Found</h4>
            <p className="text-xs text-slate-500 mt-1">Items will appear once products are registered in the master catalogue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Product Name & SKU</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5 text-right">Cost Price</th>
                  <th className="py-4 px-5 text-right">Retail MRP</th>
                  <th className="py-4 px-5 text-center">Stock Volume</th>
                  <th className="py-4 px-5 text-center">Reorder Status</th>
                  <th className="py-4 px-5 text-right">Valuation (Retail)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => {
                  const stock = Number(p.stock) || 0;
                  const isOut = stock <= 0;
                  const isLow = stock > 0 && stock < 10;
                  
                  let reorderBadge = (
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-2.5 py-1 text-[10px] font-bold w-max mx-auto block text-center">
                      Healthy
                    </span>
                  );
                  if (isOut) {
                    reorderBadge = (
                      <span className="bg-rose-50 text-rose-600 border border-rose-100 rounded-full px-2.5 py-1 text-[10px] font-bold w-max mx-auto block text-center">
                        Out of Stock
                      </span>
                    );
                  } else if (isLow) {
                    reorderBadge = (
                      <span className="bg-amber-50 text-amber-600 border border-amber-100 rounded-full px-2.5 py-1 text-[10px] font-bold w-max mx-auto block text-center">
                        Low Stock Alert
                      </span>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-all font-medium text-slate-700">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-800 text-sm">{p.name}</span>
                          <span className="font-mono text-slate-400 text-[10px] mt-0.5">{p.sku || `SKU-PROD-${p.id}`}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-500">{p.category || 'General'}</td>
                      <td className="py-4 px-5 text-right text-slate-600">₹{Number(p.price || 0).toFixed(2)}</td>
                      <td className="py-4 px-5 text-right text-slate-600">₹{Number(p.mrp || p.price || 0).toFixed(2)}</td>
                      <td className="py-4 px-5 text-center font-extrabold text-slate-800">{stock} {p.brandUnit || 'Pcs'}</td>
                      <td className="py-4 px-5 text-center">{reorderBadge}</td>
                      <td className="py-4 px-5 text-right text-emerald-600 font-extrabold text-sm">₹{(stock * Number(p.mrp || p.price || 0)).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
