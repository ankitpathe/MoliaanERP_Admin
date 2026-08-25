import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Receipt, Calendar, CreditCard, ChevronDown, ChevronUp, Eye, Download, Printer, RefreshCw, Layers } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';

const SEED_INVOICES = [
  { id: "INV-2026-001", counterCode: "POS-01", customerName: "Ramesh Sharma", customerPhone: "9876543210", date: new Date().toISOString(), items: [{ name: "Fortune Refined Oil 1L", qty: 2, price: 140 }, { name: "Parle-G Biscuit 100g", qty: 5, price: 10 }], taxableAmount: 300, cgst: 15, sgst: 15, grandTotal: 330, paymentMode: "UPI", status: "COMPLETED" },
  { id: "INV-2026-002", counterCode: "POS-02", customerName: "Sunita Gupta", customerPhone: "8765432109", date: new Date(Date.now() - 3600000).toISOString(), items: [{ name: "Aashirvaad Atta 5kg", qty: 1, price: 260 }, { name: "Tata Salt 1kg", qty: 2, price: 28 }], taxableAmount: 280, cgst: 18, sgst: 18, grandTotal: 316, paymentMode: "Cash", status: "COMPLETED" },
  { id: "INV-2026-003", counterCode: "POS-01", customerName: "Vijay Kumar", customerPhone: "7654321098", date: new Date(Date.now() - 7200000).toISOString(), items: [{ name: "Surf Excel Bar", qty: 4, price: 30 }, { name: "Colgate Paste 200g", qty: 1, price: 95 }], taxableAmount: 195, cgst: 10, sgst: 10, grandTotal: 215, paymentMode: "Card", status: "COMPLETED" },
  { id: "INV-2026-004", counterCode: "POS-02", customerName: "Amit Singh", customerPhone: "6543210987", date: new Date(Date.now() - 86400000).toISOString(), items: [{ name: "Amul Butter 500g", qty: 1, price: 220 }], taxableAmount: 220, cgst: 15, sgst: 15, grandTotal: 250, paymentMode: "Khata", status: "COMPLETED" },
  { id: "INV-2026-005", counterCode: "POS-01", customerName: "Anjali Verma", customerPhone: "5432109876", date: new Date(Date.now() - 172800000).toISOString(), items: [{ name: "Catch Turmeric 100g", qty: 3, price: 33.33 }], taxableAmount: 100, cgst: 10, sgst: 10, grandTotal: 120, paymentMode: "UPI", status: "COMPLETED" }
];

export default function InvoicesReport() {
  const toast = useToast();

  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('ALL_TIME'); // 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'THIS_MONTH' | 'ALL_TIME'
  const [counterFilter, setCounterFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  // Expandable row & Modal states
  const [expandedRows, setExpandedRows] = useState({});
  const [activeReceipt, setActiveReceipt] = useState(null);

  useEffect(() => {
    const loadInvoices = () => {
      const raw = localStorage.getItem('erp_sales') || localStorage.getItem('invoices');
      if (!raw || JSON.parse(raw).length === 0) {
        localStorage.setItem('erp_sales', JSON.stringify(SEED_INVOICES));
        setInvoices(SEED_INVOICES);
      } else {
        // Parse and ensure data is consistent
        const parsed = JSON.parse(raw);
        setInvoices(parsed);
      }
    };
    loadInvoices();
  }, []);

  const handleRefresh = () => {
    const raw = localStorage.getItem('erp_sales') || localStorage.getItem('invoices') || '[]';
    setInvoices(JSON.parse(raw));
    toast.showSuccess('Data Refreshed', 'Invoice logs refreshed successfully.');
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // KPI Calculations (based on filtered list)
  const getFilteredInvoices = () => {
    return invoices.filter(inv => {
      // Search
      const matchesSearch = 
        (inv.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.customerName || '').toLowerCase().includes(search.toLowerCase());

      // Counter
      const matchesCounter = counterFilter === 'All' || inv.counterCode === counterFilter;

      // Payment mode
      const matchesPayment = paymentFilter === 'All' || inv.paymentMode === paymentFilter;

      // Date Range
      if (dateRange !== 'ALL_TIME') {
        const invTime = new Date(inv.date).getTime();
        const diffHrs = (Date.now() - invTime) / 3600000;
        if (dateRange === 'TODAY' && diffHrs > 24) return false;
        if (dateRange === 'YESTERDAY' && (diffHrs < 24 || diffHrs > 48)) return false;
        if (dateRange === 'LAST_7_DAYS' && diffHrs > 168) return false;
        if (dateRange === 'THIS_MONTH' && new Date(inv.date).getMonth() !== new Date().getMonth()) return false;
      }

      return matchesSearch && matchesCounter && matchesPayment;
    });
  };

  const filtered = getFilteredInvoices();

  const grossSales = filtered.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalInvoices = filtered.length;
  const totalGST = filtered.reduce((sum, inv) => sum + (Number(inv.cgst || 0) + Number(inv.sgst || 0)), 0);
  const avgBillValue = totalInvoices > 0 ? Math.round(grossSales / totalInvoices) : 0;

  // Counter options list
  const uniqueCounters = ['All', ...new Set(invoices.map(inv => inv.counterCode).filter(Boolean))];

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No invoice logs matching filters to export.');
      return;
    }
    
    // CSV Header row
    const headers = ['Invoice ID', 'Date', 'Terminal', 'Customer', 'Phone', 'Taxable Amount', 'CGST', 'SGST', 'Grand Total', 'Payment Mode', 'Status'];
    const rows = filtered.map(inv => [
      inv.id,
      inv.date ? new Date(inv.date).toLocaleString() : 'N/A',
      inv.counterCode || 'N/A',
      inv.customerName || 'Walk-in',
      inv.customerPhone || 'N/A',
      inv.taxableAmount || 0,
      inv.cgst || 0,
      inv.sgst || 0,
      inv.grandTotal || 0,
      inv.paymentMode || 'Cash',
      inv.status || 'COMPLETED'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Moliaan_Invoices_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity({
      activityType: 'INVOICES_EXPORTED',
      module: 'Billing Settings',
      actionDescription: `Exported ${filtered.length} invoice records to CSV.`
    });
    toast.showSuccess('Export Success', 'Successfully compiled and downloaded invoices CSV.');
  };

  const handlePrintReceipt = (receipt) => {
    toast.showSuccess('Print Action Triggered', `Re-printing invoice receipt: ${receipt.id}`);
  };

  const tableHeaders = [
    { label: '' }, // expandable indicator arrow
    { label: 'Invoice #' },
    { label: 'Date/Time' },
    { label: 'POS Terminal' },
    { label: 'Customer' },
    { label: 'Taxable / GST' },
    { label: 'Grand Total' },
    { label: 'Payment Mode', style: { textAlign: 'center' } },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Reports / Invoices"
        title="Invoices & Revenue Audit Report"
        subtitle="Consolidated system-wide billing transactions, tax splits, and counter reports."
        extra={
          <>
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw size={14} /> Refresh Data
            </Button>
            <Button variant="purple" onClick={handleExportCSV}>
              <Download size={14} /> Export to CSV
            </Button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard label="Gross Sales Turnover" value={`₹${grossSales.toLocaleString('en-IN')}`} icon={Receipt} color="#4f46e5" />
        <StatCard label="Total Invoices Generated" value={totalInvoices} icon={Layers} color="#10b981" />
        <StatCard label="Total GST Collected" value={`₹${totalGST.toLocaleString('en-IN')}`} icon={CreditCard} color="#0891b2" />
        <StatCard label="Average Bill Value" value={`₹${avgBillValue.toLocaleString('en-IN')}`} icon={Receipt} color="#dc2626" />
      </div>

      {/* Filter Controls Card */}
      <Card style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
          <Input 
            type="text" 
            placeholder="Search invoice # or customer..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px' }}
          />
          <svg style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <Select value={dateRange} onChange={e => setDateRange(e.target.value)}>
          <option value="ALL_TIME">Date Range: All Time</option>
          <option value="TODAY">Today</option>
          <option value="YESTERDAY">Yesterday</option>
          <option value="LAST_7_DAYS">Last 7 Days</option>
          <option value="THIS_MONTH">This Month</option>
        </Select>

        <Select value={counterFilter} onChange={e => setCounterFilter(e.target.value)}>
          <option value="All">All Terminals</option>
          {uniqueCounters.filter(c => c !== 'All').map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>

        <Select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
          <option value="All">All Modes</option>
          <option value="UPI">UPI / QR</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Khata">Khata</option>
        </Select>
      </Card>

      {/* Audit Data Table */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={9} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No invoice records matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(inv => {
            const isExpanded = !!expandedRows[inv.id];
            const taxTotal = (Number(inv.cgst) || 0) + (Number(inv.sgst) || 0);
            return (
              <React.Fragment key={inv.id}>
                {/* Master Row */}
                <tr 
                  style={{ 
                    borderBottom: isExpanded ? 'none' : '1px solid #f3f4f6', 
                    fontSize: '0.8rem', 
                    color: '#374151',
                    background: isExpanded ? '#f8fafc' : 'transparent' 
                  }}
                >
                  <td style={{ padding: '14px 16px', width: '20px', cursor: 'pointer' }} onClick={() => toggleRow(inv.id)}>
                    {isExpanded ? <ChevronUp size={14} style={{ color: '#7c3aed' }} /> : <ChevronDown size={14} />}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>{inv.id}</td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                    {inv.date ? new Date(inv.date).toLocaleString() : 'N/A'}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{inv.counterCode || 'N/A'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{inv.customerName || 'Walk-in'}</span>
                      {inv.customerPhone && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{inv.customerPhone}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>₹{(inv.taxableAmount || 0).toFixed(2)}</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>GST: ₹{taxTotal.toFixed(2)}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>
                    ₹{(inv.grandTotal || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <Badge variant={inv.paymentMode === 'UPI' ? 'success' : inv.paymentMode === 'Khata' ? 'warning' : 'info'}>
                      {inv.paymentMode}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Button variant="secondary" onClick={() => setActiveReceipt(inv)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                      <Eye size={12} /> View Receipt
                    </Button>
                  </td>
                </tr>

                {/* Nested Detail Row */}
                {isExpanded && (
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f3f4f6' }}>
                    <td colSpan={9} style={{ padding: '12px 24px 16px 42px' }}>
                      <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', background: '#ffffff', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                              <th style={{ padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Item Name</th>
                              <th style={{ padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Qty</th>
                              <th style={{ padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Unit Price</th>
                              <th style={{ padding: '8px 12px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'right' }}>Line Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(inv.items || []).map((item, i) => (
                              <tr key={i} style={{ borderBottom: i === (inv.items.length - 1) ? 'none' : '1px solid #f3f4f6', fontSize: '0.75rem' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{item.name}</td>
                                <td style={{ padding: '8px 12px', textAlign: 'right' }}>{item.qty}</td>
                                <td style={{ padding: '8px 12px', textAlign: 'right' }}>₹{item.price}</td>
                                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>₹{(item.qty * item.price).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })
        )}
      </Table>

      {/* View Receipt Modal overlay */}
      {activeReceipt && (
        <>
          <div 
            onClick={() => setActiveReceipt(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            fontFamily: 'monospace'
          }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px dashed #d1d5db', paddingBottom: '12px' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800 }}>MOLIAAN RETAIL ERP</span>
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Receipt Outlet POS Terminal: {activeReceipt.counterCode}</span>
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Date: {new Date(activeReceipt.date).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem' }}>
                <span>Invoice No:</span>
                <strong>{activeReceipt.id}</strong>
              </div>
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem' }}>
                <span>Customer:</span>
                <span>{activeReceipt.customerName || 'Walk-in'}</span>
              </div>
              {activeReceipt.customerPhone && (
                <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Contact:</span>
                  <span>{activeReceipt.customerPhone}</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed #d1d5db', borderBottom: '1px dashed #d1d5db', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(activeReceipt.items || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem' }}>
                  <span>{item.name} (x{item.qty})</span>
                  <span>₹{(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px dashed #d1d5db', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem' }}>
                <span>Taxable Amount:</span>
                <span>₹{(activeReceipt.taxableAmount || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem' }}>
                <span>CGST:</span>
                <span>₹{(activeReceipt.cgst || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem' }}>
                <span>SGST:</span>
                <span>₹{(activeReceipt.sgst || 0).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginTop: '4px' }}>
                <span>Grand Total:</span>
                <span>₹{(activeReceipt.grandTotal || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9ca3af' }}>
              <span>Paid via {activeReceipt.paymentMode} • Thank You!</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <Button variant="secondary" onClick={() => setActiveReceipt(null)} style={{ flex: 1 }}>
                Close
              </Button>
              <Button variant="purple" onClick={() => handlePrintReceipt(activeReceipt)} style={{ flex: 1, gap: '4px' }}>
                <Printer size={12} /> Reprint
              </Button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
