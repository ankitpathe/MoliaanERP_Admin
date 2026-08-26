import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Receipt, Check, X, ShieldAlert, Sparkles, Calendar, Layers, Eye, Ban, AlertCircle } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';

const SEED_REQUESTS = [
  {
    id: "REQ-2026-101",
    merchantName: "Aman Gupta",
    storeName: "Gupta Supermart",
    phone: "9876543210",
    email: "aman@guptamart.com",
    planId: "PLAN-PRO",
    planName: "Gold Pro",
    billingCycle: "YEARLY",
    amount: 6999,
    paymentMode: "UPI / PhonePe",
    utrNumber: "UPI202688491290",
    paymentProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
    status: "PENDING"
  },
  {
    id: "REQ-2026-102",
    merchantName: "Pooja Verma",
    storeName: "Verma Organic Store",
    phone: "9811223344",
    email: "pooja@vermaorganics.in",
    planId: "PLAN-BASIC",
    planName: "Silver Starter",
    billingCycle: "MONTHLY",
    amount: 299,
    paymentMode: "Bank IMPS",
    utrNumber: "IMPS7736184920",
    paymentProofUrl: "",
    requestedAt: new Date(Date.now() - 14400000).toISOString(),
    status: "PENDING"
  },
  {
    id: "REQ-2026-100",
    merchantName: "Sunil Agro Agency",
    storeName: "Sunil Agro Hub",
    phone: "9922334455",
    email: "sunil@agrohub.com",
    planId: "PLAN-ENT",
    planName: "Enterprise Hub",
    billingCycle: "YEARLY",
    amount: 14999,
    paymentMode: "UPI QR",
    utrNumber: "UPI993810294812",
    paymentProofUrl: "",
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    status: "APPROVED"
  }
];

export default function SubscriptionRequestsTable() {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [planFilter, setPlanFilter] = useState('All');

  // Modals state
  const [activeProof, setActiveProof] = useState(null);
  const [rejectingReq, setRejectingReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const loadRequests = () => {
      const raw = localStorage.getItem('erp_admin_sub_requests');
      let data = [];
      if (raw) {
        data = JSON.parse(raw);
      }
      
      if (!data || data.length === 0) {
        data = SEED_REQUESTS;
        localStorage.setItem('erp_admin_sub_requests', JSON.stringify(data));
      }

      // Check for 'WWE Arena Supermart' or ID REQ-WWE-899
      const hasWWE = data.some(r => r.storeName === 'WWE Arena Supermart' || r.id === 'REQ-WWE-899');
      if (!hasWWE) {
        const wweReq = {
          id: "REQ-WWE-899",
          merchantName: "Ankit Pathe",
          storeName: "WWE Arena Supermart",
          phone: "9876543210",
          email: "ankit@wwearena.com",
          planId: "PLAN-WWE-899",
          planName: "WWE Pro Plan (₹899)",
          billingCycle: "MONTHLY",
          amount: 899,
          paymentMode: "UPI / PhonePe",
          utrNumber: "UPI202688491290",
          paymentProofUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600",
          requestedAt: new Date().toISOString(),
          status: "PENDING"
        };
        data = [wweReq, ...data];
        localStorage.setItem('erp_admin_sub_requests', JSON.stringify(data));
      }

      setRequests(data);
    };
    loadRequests();
  }, []);

  const saveRequests = (updated) => {
    localStorage.setItem('erp_admin_sub_requests', JSON.stringify(updated));
    setRequests(updated);
  };

  // KPI calculations
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;
  const pendingRevenue = requests.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // Form handlers
  const handleApprove = (reqOrId) => {
    const req = typeof reqOrId === 'string'
      ? requests.find(r => r.id === reqOrId)
      : reqOrId;
    if (!req) return;

    const updated = requests.map(r => r.id === req.id ? { ...r, status: 'APPROVED' } : r);
    saveRequests(updated);

    const daysToAdd = req.billingCycle === 'YEARLY' ? 365 : 30;

    // Write subscription record
    const activeSub = {
      id: "LIC-" + Date.now().toString().slice(-4),
      storeName: req.storeName,
      merchantName: req.merchantName,
      phone: req.phone,
      planName: req.planName,
      billingCycle: req.billingCycle,
      amount: req.amount,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + daysToAdd * 86400000).toISOString(),
      countersUsed: 1,
      countersAllowed: 3,
      status: "ACTIVE",
      paymentRef: req.utrNumber
    };

    const subs = JSON.parse(localStorage.getItem('erp_admin_subscriptions') || '[]');
    localStorage.setItem('erp_admin_subscriptions', JSON.stringify([activeSub, ...subs]));

    // Update merchant plan in users list
    const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.email === req.email || u.name === req.merchantName) {
        return { ...u, planName: req.planName, planId: req.planId, status: 'Active' };
      }
      return u;
    });
    localStorage.setItem('erp_users', JSON.stringify(updatedUsers));

    // Audit logs
    logActivity({
      activityType: 'SUBSCRIPTION_REQUEST_APPROVED',
      module: 'Subscriptions',
      actionDescription: `Approved plan "${req.planName}" upgrade request for ${req.storeName} (${req.merchantName})`
    });

    toast.showSuccess('Request Approved', `Subscription for ${req.storeName} approved!`);
    setActiveProof(null);
  };

  const handleReject = (reqOrId, reason = 'Rejected by administrator') => {
    const req = typeof reqOrId === 'string'
      ? requests.find(r => r.id === reqOrId)
      : reqOrId;
    if (!req) return;

    const updated = requests.map(r => r.id === req.id ? { ...r, status: 'REJECTED', rejectReason: reason } : r);
    saveRequests(updated);

    logActivity({
      activityType: 'SUBSCRIPTION_REQUEST_REJECTED',
      module: 'Subscriptions',
      actionDescription: `Rejected upgrade request for ${req.storeName}. Reason: ${reason}`
    });

    toast.showInfo('Request Rejected', `Upgrade request for ${req.storeName} has been rejected.`);
    setRejectingReq(null);
    setActiveProof(null);
  };

  const triggerReject = (req) => {
    setRejectingReq(req);
    setRejectReason('');
  };

  const handleRejectSubmit = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.showError('Validation Error', 'Please input a reason for rejection.');
      return;
    }
    handleReject(rejectingReq.id, rejectReason.trim());
  };

  // Filter lists
  const filtered = requests.filter(req => {
    const matchesSearch = 
      (req.merchantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.storeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (req.utrNumber || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusTab === 'ALL' || req.status === statusTab;
    const matchesPlan = planFilter === 'All' || req.planName === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const uniquePlans = ['All', ...new Set(requests.map(r => r.planName).filter(Boolean))];

  const tableHeaders = [
    { label: 'Request ID & Date' },
    { label: 'Store & Merchant' },
    { label: 'Plan & Cycle' },
    { label: 'Amount & Mode' },
    { label: 'UTR Number / Proof' },
    { label: 'Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Top KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Pending Approvals
              {pendingCount > 0 && (
                <span style={{ background: '#fef3c7', color: '#d97706', fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                  ALERT
                </span>
              )}
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{pendingCount} Requests</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.08)', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Approved Count</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>{approvedCount} Approved</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Rejected Count</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ef4444', margin: '4px 0' }}>{rejectedCount} Rejected</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Pending Revenue Pipeline</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0891b2', margin: '4px 0' }}>₹{pendingRevenue.toLocaleString('en-IN')}</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(8, 145, 178, 0.08)', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={18} />
          </div>
        </div>

      </div>

      {/* Filter Controls Panel */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', flexWrap: 'wrap' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: statusTab === tab ? '#1f2937' : 'transparent',
                color: statusTab === tab ? '#ffffff' : '#6b7280',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
            <Input 
              type="text" 
              placeholder="Search merchant, store, or UTR number..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
            <svg style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <Select value={planFilter} onChange={e => setPlanFilter(e.target.value)}>
            <option value="All">All Plans</option>
            {uniquePlans.filter(p => p !== 'All').map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Requests Table */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No subscription upgrade requests matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(req => (
            <tr key={req.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{req.id}</span>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{req.storeName}</span>
                  <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>{req.merchantName} ({req.phone})</span>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: '#4f46e5' }}>{req.planName}</span>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>
                    {req.billingCycle}
                  </span>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>₹{(req.amount || 0).toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>{req.paymentMode}</span>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{req.utrNumber || 'N/A'}</span>
                    {req.paymentProofUrl && (
                      <button
                        onClick={() => setActiveProof(req)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'transparent', border: 'none', color: '#7c3aed', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700, padding: 0, textAlign: 'left', marginTop: '2px' }}
                      >
                        <Eye size={12} /> View Slip
                      </button>
                    )}
                  </div>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'PENDING' ? 'warning' : 'danger'}>
                  {req.status}
                </Badge>
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                {req.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleApprove(req)}
                      style={{
                        padding: '6px 10px',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button
                      onClick={() => triggerReject(req)}
                      style={{
                        padding: '6px 10px',
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.725rem', color: '#9ca3af', fontStyle: 'italic' }}>
                    {req.status === 'APPROVED' ? 'Processed' : `Rejected: ${req.rejectReason || 'N/A'}`}
                  </span>
                )}
              </td>
            </tr>
          ))
        )}
      </Table>

      {/* Payment Proof Modal Overlay */}
      {activeProof && (
        <>
          <div 
            onClick={() => setActiveProof(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
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
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>UTR Reference & Slip Proof</span>
              <button onClick={() => setActiveProof(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.775rem' }}>
              <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Store / Merchant:</span>
                <strong>{activeProof.storeName} ({activeProof.merchantName})</strong>
              </div>
              <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>UTR Number:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activeProof.utrNumber}</span>
              </div>
              <div style={{ display: 'flex', justifycontent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Plan details:</span>
                <span>{activeProof.planName} ({activeProof.billingCycle}) — ₹{activeProof.amount}</span>
              </div>
            </div>

            <div style={{ width: '100%', height: '200px', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeProof.paymentProofUrl ? (
                <img src={activeProof.paymentProofUrl} alt="Payment Receipt Screenshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                  <AlertCircle size={28} />
                  <span style={{ fontSize: '0.75rem' }}>No Screenshot Uploaded</span>
                </div>
              )}
            </div>

            {activeProof.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => triggerReject(activeProof)}
                  style={{ flex: 1, padding: '10px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleApprove(activeProof)}
                  style={{ flex: 1, padding: '10px', background: '#10b981', border: 'none', borderRadius: '8px', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Approve Plan
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reject Reason input Modal */}
      {rejectingReq && (
        <>
          <div 
            onClick={() => setRejectingReq(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 10000 }}
          />
          <form onSubmit={handleRejectSubmit} style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '340px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '24px',
            zIndex: 10001,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Input Rejection Reason</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Reason *</span>
              <input
                type="text"
                placeholder="e.g. UTR Mismatch, Payment not received"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                style={{ flex: 1, padding: '8px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '8px', background: '#ef4444', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Confirm Reject
              </button>
            </div>
          </form>
        </>
      )}

    </div>
  );
}
