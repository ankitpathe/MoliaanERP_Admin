import React, { useState, useEffect } from 'react';
import { Download, Search, Calendar, CreditCard, ChevronDown, ChevronUp, Printer, CheckCircle } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export default function InvoicesReport() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('All');
  const [counterFilter, setCounterFilter] = useState('All');
  const [dateRange, setDateRange] = useState('ALL'); // ALL, TODAY, WEEK, CUSTOM
  
  // Expandable invoice details state
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);

  useEffect(() => {
    try {
      const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
      if (sales.length === 0) {
        const sampleSales = [
          {
            id: 'INV-402910',
            date: new Date(Date.now() - 3600000).toISOString().split('T')[0],
            time: '12:45',
            customerName: 'Walk-in Customer',
            paymentMethod: 'CASH',
            total: 1450,
            subtotal: 1228.81,
            totalGST: 221.19,
            totalCess: 0,
            counterId: 'Counter-01',
            status: 'Paid',
            items: [
              { name: 'Surf Excel Easy Wash 1kg', price: 170, qty: 2, gstAmount: 51.86, cgst: 25.93, sgst: 25.93, taxableValue: 288.14 },
              { name: 'Fortune Soyabean Oil 1L', price: 160, qty: 1, gstAmount: 8.00, cgst: 4.00, sgst: 4.00, taxableValue: 152.00 }
            ]
          },
          {
            id: 'INV-402911',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            time: '15:20',
            customerName: 'Amit Sharma',
            paymentMethod: 'DIGITAL',
            total: 890,
            subtotal: 754.24,
            totalGST: 135.76,
            totalCess: 0,
            counterId: 'Counter-02',
            status: 'Paid',
            items: [
              { name: 'Britannia Marie Gold 250g', price: 30, qty: 10, gstAmount: 45.76, cgst: 22.88, sgst: 22.88, taxableValue: 254.24 }
            ]
          }
        ];
        localStorage.setItem('erp_sales', JSON.stringify(sampleSales));
        setInvoices(sampleSales);
      } else {
        setInvoices(sales);
      }
    } catch (e) {
      console.error('Error loading invoices:', e);
    }
  }, []);

  const filtered = invoices.filter(inv => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customerName || '').toLowerCase().includes(search.toLowerCase());

    const matchesPayment = paymentMode === 'All' || inv.paymentMethod?.toUpperCase() === paymentMode.toUpperCase();
    const matchesCounter = counterFilter === 'All' || inv.counterId === counterFilter;

    let matchesDate = true;
    const invTime = new Date(inv.date).getTime();
    const now = Date.now();

    if (dateRange === 'TODAY') {
      const todayStr = new Date().toISOString().split('T')[0];
      matchesDate = inv.date === todayStr;
    } else if (dateRange === 'WEEK') {
      matchesDate = invTime >= now - 7 * 86400000;
    }

    return matchesSearch && matchesPayment && matchesCounter && matchesDate;
  });

  // KPI Calculations
  const totalRevenue = filtered.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalTax = filtered.reduce((sum, inv) => sum + (Number(inv.totalGST) || 0), 0);
  const averageBillSize = filtered.length > 0 ? (totalRevenue / filtered.length) : 0;
  const invoicesCount = filtered.length;

  const handleExportCSV = () => {
    try {
      const headers = ['Invoice ID', 'Date', 'Time', 'Customer', 'Payment Mode', 'Subtotal', 'Tax (GST)', 'Total (₹)'];
      const rows = filtered.map(inv => [
        inv.id,
        inv.date,
        inv.time || '',
        inv.customerName || 'Walk-in',
        inv.paymentMethod || 'Cash',
        inv.subtotal || inv.total,
        inv.totalGST || 0,
        inv.total
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `invoices_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.showSuccess('Export Completed', 'Consolidated invoices report downloaded successfully.');
    } catch (e) {
      toast.showError('Export Failed', 'Unable to build CSV.');
    }
  };

  const handlePrint = (inv) => {
    toast.showInfo('Print Job', `Opening print preview for invoice ${inv.id}`);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${inv.id}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #111; }
            .header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { padding: 6px; text-align: left; border-bottom: 1px dashed #ccc; }
            .right { text-align: right; }
          </style>
        </head>
        <body onload="window.print();window.close();">
          <div class="header">
            <h3>MOLIAAN ERP INVOICE</h3>
            <p>ID: ${inv.id} | Date: ${inv.date} ${inv.time || ''}</p>
            <p>Customer: ${inv.customerName || 'Walk-in'}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(inv.items || []).map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td class="right">₹${Number(item.price * item.qty).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="right" style="font-weight:bold;margin-top:20px;">Grand Total: ₹${Number(inv.total).toFixed(2)}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Title Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Invoices Audit Report</h2>
          <p className="text-xs text-slate-500 mt-1">Audit billing transactions, gross revenues, and CGST/SGST collections pools.</p>
        </div>
        
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 hover:shadow-lg transition-all flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" /> Export to CSV
        </button>
      </div>

      {/* 4 KPI Summary Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</span>
          <h4 className="text-2xl font-extrabold text-emerald-600 mt-1">₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
        </div>

        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tax Pool (GST)</span>
          <h4 className="text-2xl font-extrabold text-slate-800 mt-1">₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
        </div>

        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Bill Size</span>
          <h4 className="text-2xl font-extrabold text-indigo-600 mt-1">₹{averageBillSize.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
        </div>

        <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoices Generated</span>
          <h4 className="text-2xl font-extrabold text-slate-700 mt-1">{invoicesCount} Bills</h4>
        </div>

      </div>

      {/* Dynamic Filters Bar */}
      <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice ID or customer name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="All">All Payments</option>
            <option value="CASH">Cash</option>
            <option value="DIGITAL">Digital (UPI/QR)</option>
            <option value="CARD">Card POS</option>
            <option value="CREDIT">Khata Credit</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">This Week</option>
          </select>
        </div>

      </div>

      {/* Invoice Audit Table */}
      <div className="bg-white border border-slate-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-[1.2]" />
            <h4 className="text-sm font-bold text-slate-700">No Sales Receipts Found</h4>
            <p className="text-xs text-slate-500 mt-1">Transactions will appear once sales are completed at terminal counters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-4 px-5">Invoice ID</th>
                  <th className="py-4 px-5">Date / Time</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Payment Mode</th>
                  <th className="py-4 px-5 text-right">Subtotal</th>
                  <th className="py-4 px-5 text-right">GST Tax</th>
                  <th className="py-4 px-5 text-right">Total (₹)</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(inv => {
                  const isExpanded = expandedInvoiceId === inv.id;

                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="hover:bg-slate-50/30 transition-all font-medium">
                        <td className="py-4 px-5">
                          <button
                            onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                            className="flex items-center gap-1 font-extrabold text-slate-800 text-sm hover:text-violet-600 transition-colors"
                          >
                            {inv.id}
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className="py-4 px-5 text-slate-500">
                          {inv.date} <span className="text-[10px] text-slate-400 ml-1">{inv.time}</span>
                        </td>
                        <td className="py-4 px-5 text-slate-700 font-semibold">{inv.customerName || 'Walk-in'}</td>
                        <td className="py-4 px-5">
                          <span className="bg-violet-50 text-violet-600 border border-violet-100 rounded-full px-2.5 py-1 text-[10px] font-bold">
                            {inv.paymentMethod || 'CASH'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right text-slate-600">₹{Number(inv.subtotal || inv.total).toFixed(2)}</td>
                        <td className="py-4 px-5 text-right text-indigo-500 font-bold">₹{Number(inv.totalGST || 0).toFixed(2)}</td>
                        <td className="py-4 px-5 text-right text-emerald-600 font-extrabold text-sm">₹{Number(inv.total).toFixed(2)}</td>
                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handlePrint(inv)}
                              className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-xl transition-all"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={8} className="py-4 px-6 border-t border-b border-slate-100">
                            <div className="space-y-2">
                              <h5 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">Line Items Detail</h5>
                              <div className="bg-white border border-slate-200/60 rounded-xl overflow-hidden max-w-2xl">
                                <table className="w-full text-[11px] text-left">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                                      <th className="py-2.5 px-4">Item Name</th>
                                      <th className="py-2.5 px-4 text-center">Qty</th>
                                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                                      <th className="py-2.5 px-4 text-right">Taxable Value</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {(inv.items || []).map((item, idx) => (
                                      <tr key={idx} className="text-slate-600 font-medium">
                                        <td className="py-2.5 px-4 text-slate-800">{item.name}</td>
                                        <td className="py-2.5 px-4 text-center font-bold">{item.qty}</td>
                                        <td className="py-2.5 px-4 text-right">₹{Number(item.price).toFixed(2)}</td>
                                        <td className="py-2.5 px-4 text-right font-bold">₹{Number(item.taxableValue || (item.price * item.qty)).toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
