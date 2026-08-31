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
  {
    id: "INV-2026-0891",
    invoiceNo: "INV-2026-0891",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    customerName: "Ramesh Sharma",
    customerPhone: "9876543210",
    storeName: "WWE Arena Supermart",
    counterCode: "POS-WWE",
    itemsCount: 6,
    subTotal: 3450,
    taxAmount: 621,
    grandTotal: 4071,
    paymentMode: "UPI",
    status: "PAID",
    items: [
      { name: "Basmati Rice 5kg", qty: 2, price: 650, total: 1300 },
      { name: "Mustard Oil 1L", qty: 3, price: 180, total: 540 },
      { name: "Dry Fruits Pack 500g", qty: 2, price: 805.5, total: 1610 }
    ]
  },
  {
    id: "INV-2026-0890",
    invoiceNo: "INV-2026-0890",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    customerName: "Deepak Verma",
    customerPhone: "9822334455",
    storeName: "WWE Arena Supermart",
    counterCode: "POS-01",
    itemsCount: 3,
    subTotal: 1250,
    taxAmount: 225,
    grandTotal: 1475,
    paymentMode: "CASH",
    status: "PAID",
    items: [
      { name: "Dairy Butter 500g", qty: 2, price: 275, total: 550 },
      { name: "Wheat Flour 10kg", qty: 2, price: 350, total: 700 }
    ]
  },
  {
    id: "INV-2026-0889",
    invoiceNo: "INV-2026-0889",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    customerName: "Sanjay Singhania",
    customerPhone: "9112233445",
    storeName: "Gupta Supermart",
    counterCode: "POS-02",
    itemsCount: 8,
    subTotal: 15800,
    taxAmount: 2844,
    grandTotal: 18644,
    paymentMode: "KHATA",
    status: "PARTIAL",
    items: [
      { name: "Bulk Grocery Consignment", qty: 1, price: 15800, total: 15800 }
    ]
  }
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
      const raw = localStorage.getItem('erp_invoices') || localStorage.getItem('invoices');
      let data = [];
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = [];
        }
      }
      if (!data || data.length === 0) {
        data = SEED_INVOICES;
      }
      const normalized = data.map(inv => {
        const id = inv.id || inv.invoiceNo || "INV-" + Date.now().toString().slice(-4);
        const invoiceNo = inv.invoiceNo || id;
        const createdAt = inv.createdAt || inv.date || new Date().toISOString();
        const customerName = inv.customerName || "Walk-in";
        const customerPhone = inv.customerPhone || "N/A";
        const storeName = inv.storeName || "WWE Arena Supermart";
        const counterCode = inv.counterCode || "POS-WWE";
        const items = inv.items || [];
        const itemsCount = inv.itemsCount !== undefined ? Number(inv.itemsCount) : items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
        
        const computedSubTotal = items.reduce((s, it) => s + (Number(it.qty) || 1) * (Number(it.price) || 0), 0);
        const subTotal = Number(inv.subTotal) > 0 ? Number(inv.subTotal) : computedSubTotal;
        const taxAmount = Number(inv.taxAmount) >= 0 ? Number(inv.taxAmount) : Math.round(subTotal * 0.18);
        const grandTotal = Number(inv.grandTotal) > 0 ? Number(inv.grandTotal) : (subTotal + taxAmount);
        
        const paymentMode = inv.paymentMode ? String(inv.paymentMode).toUpperCase() : "CASH";
        const status = inv.status ? String(inv.status).toUpperCase() : "PAID";

        return {
          id,
          invoiceNo,
          createdAt,
          customerName,
          customerPhone,
          storeName,
          counterCode,
          itemsCount,
          subTotal,
          taxAmount,
          grandTotal,
          paymentMode,
          status,
          items
        };
      });
      localStorage.setItem('erp_invoices', JSON.stringify(normalized));
      setInvoices(normalized);
    };
    loadInvoices();
  }, []);

  const handleRefresh = () => {
    const raw = localStorage.getItem('erp_invoices') || localStorage.getItem('invoices') || '[]';
    setInvoices(JSON.parse(raw));
    toast.showSuccess('Data Refreshed', 'Invoice logs refreshed successfully.');
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // KPI Calculations (based on filtered list)
  const getFilteredInvoices = () => {
    return invoices.filter(inv => {
      const matchesSearch = 
        (inv.invoiceNo || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        (inv.customerPhone || '').toLowerCase().includes(search.toLowerCase());

      const matchesCounter = counterFilter === 'All' || inv.counterCode === counterFilter;
      const matchesPayment = paymentFilter === 'All' || inv.paymentMode === paymentFilter.toUpperCase();

      if (dateRange !== 'ALL_TIME') {
        const invTime = new Date(inv.createdAt).getTime();
        const diffHrs = (Date.now() - invTime) / 3600000;
        if (dateRange === 'TODAY' && diffHrs > 24) return false;
        if (dateRange === 'YESTERDAY' && (diffHrs < 24 || diffHrs > 48)) return false;
        if (dateRange === 'LAST_7_DAYS' && diffHrs > 168) return false;
        if (dateRange === 'THIS_MONTH' && new Date(inv.createdAt).getMonth() !== new Date().getMonth()) return false;
      }

      return matchesSearch && matchesCounter && matchesPayment;
    });
  };

  const filtered = getFilteredInvoices();

  const totalVolume = filtered.reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const paidInvoicesCount = filtered.filter(i => i.status === 'PAID').length;
  const outstandingKhata = filtered
    .filter(i => i.paymentMode === 'KHATA' || i.status === 'PARTIAL')
    .reduce((sum, inv) => sum + (Number(inv.grandTotal) || 0), 0);
  const totalGST = filtered.reduce((sum, inv) => sum + (Number(inv.taxAmount) || 0), 0);

  // Counter options list
  const uniqueCounters = ['All', ...new Set(invoices.map(inv => inv.counterCode).filter(Boolean))];

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No invoice logs matching filters to export.');
      return;
    }
    
    const headers = ['Invoice ID', 'Date', 'Terminal', 'Store', 'Customer', 'Phone', 'Sub Total', 'Tax Amount', 'Grand Total', 'Payment Mode', 'Status'];
    const rows = filtered.map(inv => [
      inv.invoiceNo,
      inv.createdAt ? new Date(inv.createdAt).toLocaleString() : 'N/A',
      inv.counterCode || 'N/A',
      inv.storeName || 'N/A',
      inv.customerName || 'Walk-in',
      inv.customerPhone || 'N/A',
      inv.subTotal || 0,
      inv.taxAmount || 0,
      inv.grandTotal || 0,
      inv.paymentMode || 'CASH',
      inv.status || 'PAID'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Invoices_Report_2026.csv');
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
    const itemsArr = receipt.items || [];
    const computedTaxable = itemsArr.reduce((sum, it) => sum + (Number(it.qty) || 1) * (Number(it.price) || 0), 0);
    const taxableAmt  = Number(receipt.subTotal) > 0 ? Number(receipt.subTotal) : computedTaxable;
    const taxAmt      = Number(receipt.taxAmount) >= 0 ? Number(receipt.taxAmount) : Math.round(taxableAmt * 0.18);
    const grandAmt    = Number(receipt.grandTotal) > 0 ? Number(receipt.grandTotal) : (taxableAmt + taxAmt);

    const itemRows = itemsArr.map(it => `
      <tr>
        <td style="padding:4px 0;">${it.name} (x${it.qty})</td>
        <td style="padding:4px 0;text-align:right;">&#8377;${((Number(it.qty) || 1) * (Number(it.price) || 0)).toFixed(2)}</td>
      </tr>`).join('');

    const receiptHTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Receipt ${receipt.invoiceNo}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; padding: 16px; }
  .center { text-align: center; }
  .title { font-size: 15px; font-weight: 900; }
  .divider { border: none; border-top: 1px dashed #555; margin: 8px 0; }
  table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 3px 0; }
  .grand { font-weight: 900; font-size: 14px; border-top: 1px dashed #555; padding-top: 6px; margin-top: 4px; }
  .footer { text-align: center; margin-top: 10px; color: #555; font-size: 11px; }
</style>
</head>
<body>
  <div class="center">
    <div class="title">MOLIAAN RETAIL ERP</div>
    <div>Terminal: ${receipt.counterCode || 'N/A'}</div>
    <div>${new Date(receipt.createdAt).toLocaleString()}</div>
  </div>
  <hr class="divider"/>
  <table>
    <tr><td>Invoice No:</td><td style="text-align:right;font-weight:bold;">${receipt.invoiceNo}</td></tr>
    <tr><td>Customer:</td><td style="text-align:right;">${receipt.customerName || 'Walk-in'}</td></tr>
    ${receipt.customerPhone ? `<tr><td>Contact:</td><td style="text-align:right;">${receipt.customerPhone}</td></tr>` : ''}
  </table>
  <hr class="divider"/>
  <table>${itemRows}</table>
  <hr class="divider"/>
  <table class="totals">
    <tr><td>Taxable Amount:</td><td style="text-align:right;">&#8377;${taxableAmt.toFixed(2)}</td></tr>
    <tr><td>GST Amount:</td><td style="text-align:right;">&#8377;${taxAmt.toFixed(2)}</td></tr>
  </table>
  <table class="grand">
    <tr><td><b>Grand Total:</b></td><td style="text-align:right;"><b>&#8377;${grandAmt.toFixed(2)}</b></td></tr>
  </table>
  <div class="footer">Paid via ${receipt.paymentMode || 'CASH'} &bull; Thank You!</div>
</body>
</html>`;

    // Render into hidden iframe and print only that
    let iframe = document.getElementById('__receipt_print_frame__');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = '__receipt_print_frame__';
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:320px;height:600px;border:none;';
      document.body.appendChild(iframe);
    }
    iframe.contentDocument.open();
    iframe.contentDocument.write(receiptHTML);
    iframe.contentDocument.close();
    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    };
    // fallback for browsers that don't fire onload for srcdoc writes
    setTimeout(() => {
      try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch(e) {}
    }, 300);
  };

  const tableHeaders = [
    { label: '' }, // expandable indicator arrow
    { label: 'Invoice No & Time' },
    { label: 'Customer Details' },
    { label: 'Store & Counter' },
    { label: 'Amount & Items' },
    { label: 'Payment Mode' },
    { label: 'Status' },
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
              <Download size={14} /> Export Invoices CSV
            </Button>
          </>
        }
      />

      {/* KPI Cards Grid */}
      <div className="responsive-grid-4">
        <StatCard label="Total Processed Volume" value={`₹${totalVolume.toLocaleString('en-IN')}`} icon={Receipt} color="#3fa9f5" />
        <StatCard label="Paid Invoices" value={paidInvoicesCount} icon={Layers} color="#10b981" />
        <StatCard label="Outstanding Khata" value={`₹${outstandingKhata.toLocaleString('en-IN')}`} icon={CreditCard} color="#0891b2" />
        <StatCard label="Total GST Collected" value={`₹${totalGST.toLocaleString('en-IN')}`} icon={Receipt} color="#dc2626" />
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
            <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No invoice records matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(inv => {
            const isExpanded = !!expandedRows[inv.id];
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
                    {isExpanded ? <ChevronUp size={14} style={{ color: '#035096' }} /> : <ChevronDown size={14} />}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontWeight: 700, color: '#111827' }}>{inv.invoiceNo}</strong>
                      <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>{new Date(inv.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#374151' }}>{inv.customerName}</span>
                      <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '1px 6px', fontSize: '0.65rem', background: '#f1f5f9', borderRadius: '9999px', color: '#475569' }}>
                        {inv.customerPhone}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#4b5563' }}>{inv.storeName}</span>
                      <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '1px 6px', fontSize: '0.65rem', background: '#f3e8ff', borderRadius: '4px', color: '#6b21a8', fontWeight: 700 }}>
                        {inv.counterCode}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontWeight: 700, color: '#111827' }}>₹{inv.grandTotal.toLocaleString('en-IN')}</strong>
                      <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>{inv.itemsCount} items</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge 
                      variant={inv.paymentMode === 'CASH' ? 'success' : inv.paymentMode === 'KHATA' ? 'warning' : 'info'}
                      style={inv.paymentMode === 'UPI' ? { background: '#f3e8ff', color: '#6b21a8' } : {}}
                    >
                      {inv.paymentMode}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>
                      {inv.status}
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
                    <td colSpan={8} style={{ padding: '12px 24px 16px 42px' }}>
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
      {activeReceipt && (() => {
        const itemsArr = activeReceipt.items || [];
        const computedTaxable = itemsArr.reduce((sum, it) => sum + (Number(it.qty) || 1) * (Number(it.price) || 0), 0);
        const taxableAmt = Number(activeReceipt.subTotal) > 0 ? Number(activeReceipt.subTotal) : computedTaxable;
        const taxAmt      = Number(activeReceipt.taxAmount) >= 0 ? Number(activeReceipt.taxAmount) : Math.round(taxableAmt * 0.18);
        const grandAmt   = Number(activeReceipt.grandTotal) > 0 ? Number(activeReceipt.grandTotal) : (taxableAmt + taxAmt);
        return (
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
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Date: {new Date(activeReceipt.createdAt).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Invoice No:</span>
                  <strong>{activeReceipt.invoiceNo}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Customer:</span>
                  <span>{activeReceipt.customerName || 'Walk-in'}</span>
                </div>
                {activeReceipt.customerPhone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>Contact:</span>
                    <span>{activeReceipt.customerPhone}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px dashed #d1d5db', borderBottom: '1px dashed #d1d5db', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {itemsArr.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span>{item.name} (x{item.qty})</span>
                    <span>₹{((Number(item.qty) || 1) * (Number(item.price) || 0)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px dashed #d1d5db', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>Taxable Amount:</span>
                  <span>₹{taxableAmt.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <span>GST Amount:</span>
                  <span>₹{taxAmt.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginTop: '4px' }}>
                  <span>Grand Total:</span>
                  <span>₹{grandAmt.toFixed(2)}</span>
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
                  <Printer size={12} /> Print Receipt
                </Button>
              </div>
            </div>
          </>
        );
      })()}

    </div>
  );
}
