import React, { useState, useEffect } from 'react';
import { Download, Search, Calendar, Landmark, CreditCard } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export default function InvoicesReport() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [paymentMode, setPaymentMode] = useState('All');
  const [counterFilter, setCounterFilter] = useState('All');
  const [dateRange, setDateRange] = useState('ALL'); // ALL, TODAY, LAST_7, LAST_30

  useEffect(() => {
    try {
      const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
      if (sales.length === 0) {
        // Seed some sample sales if empty for visual reports
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
              { name: 'Product A', price: 500, qty: 2, gstAmount: 152.54, cgst: 76.27, sgst: 76.27, igst: 0, taxableValue: 847.46 }
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
              { name: 'Product B', price: 890, qty: 1, gstAmount: 135.76, cgst: 67.88, sgst: 67.88, igst: 0, taxableValue: 754.24 }
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
    } else if (dateRange === 'LAST_7') {
      matchesDate = invTime >= now - 7 * 86400000;
    } else if (dateRange === 'LAST_30') {
      matchesDate = invTime >= now - 30 * 86400000;
    }

    return matchesSearch && matchesPayment && matchesCounter && matchesDate;
  });

  const totalRevenue = filtered.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
  const totalTax = filtered.reduce((sum, inv) => sum + (Number(inv.totalGST) || 0), 0);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Invoices Audit Report</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Consolidated platform sales receipts and taxation data check.</span>
        </div>
        <button
          onClick={handleExportCSV}
          style={{
            padding: '10px 16px',
            background: '#7c7a6e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Download size={16} /> Export to CSV
        </button>
      </div>

      {/* Mini Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total Filtered Invoices</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{filtered.length} Receipts</h4>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total Collected Revenue</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
        </div>
        <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total GST Tax Pool</span>
          <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6', margin: '4px 0' }}>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h4>
        </div>
      </div>

      {/* Filter toolbar */}
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
            placeholder="Search by invoice ID or customer..."
            style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fafafa', outline: 'none' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
        </div>

        <select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', outline: 'none', color: '#4b5563', cursor: 'pointer' }}
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
          style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', outline: 'none', color: '#4b5563', cursor: 'pointer' }}
        >
          <option value="ALL">All Time</option>
          <option value="TODAY">Today</option>
          <option value="LAST_7">Last 7 Days</option>
          <option value="LAST_30">Last 30 Days</option>
        </select>
      </div>

      {/* Grid Table */}
      <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Invoice ID</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Date / Time</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Payment</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Subtotal</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>GST Tax</th>
              <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{inv.id}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>{inv.date} <span style={{ color: '#9ca3af', fontSize: '0.725rem' }}>{inv.time}</span></td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563' }}>{inv.customerName || 'Walk-in'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: '#f3f4f6', color: '#4b5563' }}>
                    {inv.paymentMethod || 'Cash'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#4b5563', textAlign: 'right' }}>₹{(inv.subtotal || inv.total).toFixed(2)}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: '#3b82f6', textAlign: 'right', fontWeight: 600 }}>₹{(inv.totalGST || 0).toFixed(2)}</td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 700, color: '#10b981', textAlign: 'right' }}>₹{Number(inv.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
