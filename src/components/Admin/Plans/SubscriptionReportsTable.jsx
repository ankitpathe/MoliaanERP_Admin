import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { CreditCard, Calendar, RefreshCw, Send, AlertTriangle, CheckCircle, Ban, Download, Search, Settings } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import ConfirmDialog from '../../ui/ConfirmDialog';

const SEED_SUBS = [
  {
    id: "LIC-2026-001",
    storeName: "Gupta Supermart",
    merchantName: "Aman Gupta",
    phone: "9876543210",
    planName: "Gold Pro",
    billingCycle: "YEARLY",
    amount: 6999,
    startDate: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    endDate: new Date(Date.now() + 335 * 24 * 3600000).toISOString(),
    countersUsed: 2,
    countersAllowed: 3,
    status: "ACTIVE",
    paymentRef: "UPI202688491290"
  },
  {
    id: "LIC-2026-002",
    storeName: "Shree Radhey Sweets",
    merchantName: "Rakesh Sharma",
    phone: "9822334455",
    planName: "Silver Starter",
    billingCycle: "MONTHLY",
    amount: 299,
    startDate: new Date(Date.now() - 25 * 24 * 3600000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 3600000).toISOString(),
    countersUsed: 1,
    countersAllowed: 1,
    status: "EXPIRING_SOON",
    paymentRef: "IMPS99881122"
  },
  {
    id: "LIC-2026-003",
    storeName: "City Footwear Mart",
    merchantName: "Vikram Sethi",
    phone: "9123456789",
    planName: "Silver Starter",
    billingCycle: "MONTHLY",
    amount: 299,
    startDate: new Date(Date.now() - 40 * 24 * 3600000).toISOString(),
    endDate: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    countersUsed: 1,
    countersAllowed: 1,
    status: "EXPIRED",
    paymentRef: "UPI77112233"
  }
];

export default function SubscriptionReportsTable() {
  const toast = useToast();

  const [subscriptions, setSubscriptions] = useState([]);
  const [search, setSearch] = useState('');
  const [confirmRevoke, setConfirmRevoke] = useState({ isOpen: false, sub: null });
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const loadSubs = () => {
      const raw = localStorage.getItem('erp_admin_subscriptions');
      if (!raw || JSON.parse(raw).length === 0) {
        localStorage.setItem('erp_admin_subscriptions', JSON.stringify(SEED_SUBS));
        setSubscriptions(SEED_SUBS);
      } else {
        // Hydrate status dynamically based on current date
        const parsed = JSON.parse(raw).map(sub => {
          const diff = new Date(sub.endDate).getTime() - Date.now();
          const daysLeft = Math.ceil(diff / (24 * 3600000));
          let status = sub.status || 'ACTIVE';

          if (daysLeft <= 0) {
            status = 'EXPIRED';
          } else if (daysLeft <= 7) {
            status = 'EXPIRING_SOON';
          } else if (sub.status !== 'EXPIRED') {
            status = 'ACTIVE';
          }
          return { ...sub, status };
        });
        setSubscriptions(parsed);
      }
    };
    loadSubs();
  }, []);

  const saveSubs = (updated) => {
    localStorage.setItem('erp_admin_subscriptions', JSON.stringify(updated));
    setSubscriptions(updated);
  };

  const handleRefresh = () => {
    const raw = localStorage.getItem('erp_admin_subscriptions') || '[]';
    setSubscriptions(JSON.parse(raw));
    toast.showSuccess('Data Refreshed', 'Subscription records reloaded.');
  };

  // Helper Days Left
  const getDaysLeft = (endDate) => {
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.ceil(diff / (24 * 3600000));
  };

  // KPI calculations
  const activeLicenses = subscriptions.filter(s => s.status === 'ACTIVE' || s.status === 'EXPIRING_SOON').length;
  
  const mrr = subscriptions
    .filter(s => s.status === 'ACTIVE' || s.status === 'EXPIRING_SOON')
    .reduce((sum, s) => {
      const base = Number(s.amount) || 0;
      return sum + (s.billingCycle === 'YEARLY' ? Math.round(base / 12) : base);
    }, 0);

  const arr = mrr * 12;

  const expiringSoonCount = subscriptions.filter(s => {
    const days = getDaysLeft(s.endDate);
    return days > 0 && days <= 7 && s.status !== 'EXPIRED';
  }).length;

  // Actions handlers
  const handleExtend30Days = (sub) => {
    const currentEnd = new Date(sub.endDate).getTime();
    const baseDate = currentEnd > Date.now() ? currentEnd : Date.now();
    const newEnd = new Date(baseDate + 30 * 24 * 3600000).toISOString();

    const updated = subscriptions.map(s => s.id === sub.id ? { ...s, endDate: newEnd, status: 'ACTIVE' } : s);
    saveSubs(updated);

    logActivity({
      activityType: 'LICENSE_EXTENDED',
      module: 'Subscriptions',
      actionDescription: `Extended subscription license for ${sub.storeName} (${sub.id}) by 30 days.`
    });

    toast.showSuccess('License Extended', `Added 30 days validation to ${sub.storeName}.`);
  };

  const handleRevoke = (sub) => {
    setConfirmRevoke({ isOpen: true, sub });
  };

  const handleConfirmRevoke = () => {
    const { sub } = confirmRevoke;
    const updated = subscriptions.map(s => s.id === sub.id ? { ...s, status: 'EXPIRED' } : s);
    saveSubs(updated);

    logActivity({
      activityType: 'SUBSCRIPTION_REVOKED',
      module: 'Subscriptions',
      actionDescription: `Revoked subscription license ID ${sub.id} for store "${sub.storeName}"`
    });

    setConfirmRevoke({ isOpen: false, sub: null });
    toast.showInfo('License Revoked', `SaaS access suspended for ${sub.storeName}.`);
  };

  const handleSendReminder = (sub) => {
    const days = getDaysLeft(sub.endDate);
    const message = `Hello ${sub.merchantName}, your Moliaan ERP subscription plan (${sub.planName}) for "${sub.storeName}" is expiring in ${days} days on ${new Date(sub.endDate).toLocaleDateString()}. Please renew soon to avoid checkout counter disruption. Thank you!`;
    const encoded = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=91${sub.phone}&text=${encoded}`;
    window.open(url, '_blank');
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No records matching filters to export.');
      return;
    }

    const headers = ['License ID', 'Store Name', 'Merchant Name', 'Phone', 'Plan Name', 'Billing Cycle', 'Amount', 'Counters Used', 'Counters Allowed', 'Start Date', 'Expiry Date', 'Status'];
    const rows = filtered.map(s => [
      s.id,
      s.storeName,
      s.merchantName,
      s.phone,
      s.planName,
      s.billingCycle,
      s.amount || 0,
      s.countersUsed || 0,
      s.countersAllowed || 0,
      s.startDate ? new Date(s.startDate).toLocaleDateString() : 'N/A',
      s.endDate ? new Date(s.endDate).toLocaleDateString() : 'N/A',
      s.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Moliaan_SaaS_Subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.showSuccess('Report Exported', 'Downloaded active subscriptions audit report CSV.');
  };

  // Filters application
  const filtered = subscriptions.filter(sub => {
    const matchesSearch = 
      (sub.storeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (sub.merchantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (sub.id || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const tableHeaders = [
    { label: 'License ID' },
    { label: 'Store & Merchant' },
    { label: 'Plan & Cycle' },
    { label: 'Counter Quota' },
    { label: 'Validity Period' },
    { label: 'Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb="Admin / Plans / Reports"
        title="SaaS Subscriptions & Licenses Report"
        subtitle="Analyze platform recurring revenues, license validity status, and counter device load limits."
        extra={
          <>
            <Button variant="secondary" onClick={handleRefresh}>
              <RefreshCw size={14} /> Refresh Data
            </Button>
            <Button variant="purple" onClick={handleExportCSV}>
              <Download size={14} /> Export CSV Report
            </Button>
          </>
        }
      />

      {/* KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <StatCard label="Monthly Recurring Revenue" value={`₹${mrr.toLocaleString('en-IN')}`} icon={CreditCard} color="#4f46e5" />
        <StatCard label="Annual Projected Value" value={`₹${arr.toLocaleString('en-IN')}`} icon={CheckCircle} color="#10b981" />
        <StatCard label="Total Active Licenses" value={`${activeLicenses} Active`} icon={Settings} color="#0891b2" />
        
        {/* Expiring soon pulse card */}
        <div style={{ 
          background: '#ffffff', 
          padding: '16px 20px', 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          animation: expiringSoonCount > 0 ? 'pulse 2s infinite' : 'none'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Expiring Soon (&lt; 7 Days)</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: expiringSoonCount > 0 ? '#d97706' : '#111827', margin: '4px 0' }}>
              {expiringSoonCount} Licenses
            </h4>
          </div>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '8px', 
            background: expiringSoonCount > 0 ? 'rgba(217, 119, 6, 0.08)' : 'rgba(107, 114, 128, 0.08)', 
            color: expiringSoonCount > 0 ? '#d97706' : '#6b7280', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <AlertTriangle size={18} />
          </div>
        </div>

      </div>

      {/* Filters bar */}
      <Card style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
          <Input 
            type="text" 
            placeholder="Search license ID, store, or merchant..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
        </div>

        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRING_SOON">Expiring Soon</option>
          <option value="EXPIRED">Expired</option>
        </Select>
      </Card>

      {/* Subscriptions Audit Table */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No subscription records matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(sub => {
            const daysLeft = getDaysLeft(sub.endDate);
            const usagePercent = Math.min(100, Math.round(((sub.countersUsed || 0) / (sub.countersAllowed || 1)) * 100));

            return (
              <tr key={sub.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>{sub.id}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{sub.storeName}</span>
                    <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>{sub.merchantName} ({sub.phone})</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, color: '#4f46e5' }}>{sub.planName}</span>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>
                      {sub.billingCycle} • ₹{sub.amount}
                    </span>
                  </div>
                </td>
                
                {/* Counter usage progress bar */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '110px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 600, color: '#4b5563' }}>
                      <span>{sub.countersUsed} / {sub.countersAllowed} Limit</span>
                      <span>{usagePercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${usagePercent}%`, height: '100%', background: usagePercent >= 100 ? '#ef4444' : usagePercent >= 70 ? '#d97706' : '#10b981', borderRadius: '99px' }} />
                    </div>
                  </div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>Till: {new Date(sub.endDate).toLocaleDateString()}</span>
                    <span style={{ fontSize: '0.7rem', color: daysLeft <= 0 ? '#dc2626' : daysLeft <= 7 ? '#d97706' : '#10b981', fontWeight: 600 }}>
                      {daysLeft <= 0 ? 'Expired' : `${daysLeft} days left`}
                    </span>
                  </div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={sub.status === 'ACTIVE' ? 'success' : sub.status === 'EXPIRING_SOON' ? 'warning' : 'danger'}>
                    {sub.status === 'EXPIRING_SOON' ? 'EXPIRING' : sub.status}
                  </Badge>
                </td>

                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    
                    {sub.status === 'EXPIRING_SOON' && (
                      <button
                        onClick={() => handleSendReminder(sub)}
                        style={{
                          padding: '6px 10px',
                          background: '#e0f2fe',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#0284c7',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                        title="Send WhatsApp Renewal Message"
                      >
                        <Send size={11} /> Reminder
                      </button>
                    )}

                    <button
                      onClick={() => handleExtend30Days(sub)}
                      style={{
                        padding: '6px 10px',
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        color: '#374151',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Extend 30d
                    </button>

                    {sub.status !== 'EXPIRED' && (
                      <button
                        onClick={() => handleRevoke(sub)}
                        style={{
                          padding: '6px 10px',
                          background: '#ffffff',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          color: '#dc2626',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Revoke
                      </button>
                    )}

                  </div>
                </td>
              </tr>
            );
          })
        )}
      </Table>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.2);
          }
          50% {
            opacity: 0.95;
            box-shadow: 0 0 0 6px rgba(217, 119, 6, 0.05);
          }
        }
      `}</style>

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmRevoke.isOpen}
        title="Revoke SaaS License"
        message={`Are you sure you want to cancel and revoke the SaaS subscription license for "${confirmRevoke.sub ? confirmRevoke.sub.storeName : ''}"? This will suspend their POS terminals access.`}
        confirmText="Revoke License"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmRevoke}
        onCancel={() => setConfirmRevoke({ isOpen: false, sub: null })}
      />

    </div>
  );
}
