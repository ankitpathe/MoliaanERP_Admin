import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Users, CheckCircle, ShieldAlert, Layers, Search, Download, Edit3, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import ConfirmDialog from '../../ui/ConfirmDialog';

const SEED_USERS = [
  {
    id: "USR-101",
    storeName: "WWE Arena Supermart",
    ownerName: "Ankit Pathe",
    email: "ankit@wwearena.com",
    phone: "9876543210",
    city: "Chhindwara",
    activePlan: "WWE Pro Plan (₹899)",
    terminalsUsed: 1,
    terminalsAllowed: 3,
    createdAt: "2026-01-10T00:00:00.000Z",
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
    status: "ACTIVE"
  },
  {
    id: "USR-102",
    storeName: "Gupta Supermart",
    ownerName: "Aman Gupta",
    email: "aman@guptamart.com",
    phone: "9811223344",
    city: "Bhopal",
    activePlan: "Gold Pro",
    terminalsUsed: 2,
    terminalsAllowed: 3,
    createdAt: "2026-03-01T00:00:00.000Z",
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    status: "ACTIVE"
  },
  {
    id: "USR-103",
    storeName: "Apex Footwear Hub",
    ownerName: "Vikram Sethi",
    email: "vikram@apexfootwear.com",
    phone: "9123456789",
    city: "Nagpur",
    activePlan: "Silver Starter",
    terminalsUsed: 0,
    terminalsAllowed: 1,
    createdAt: "2026-05-15T00:00:00.000Z",
    lastLogin: new Date(Date.now() - 604800000).toISOString(),
    status: "SUSPENDED"
  }
];

export default function AllUsersTable() {
  const navigate = useNavigate();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'SUSPENDED'
  const [editingMerchant, setEditingMerchant] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, storeName: '' });

  // Edit fields state
  const [editStoreName, setEditStoreName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPlan, setEditPlan] = useState('');

  useEffect(() => {
    const loadUsers = () => {
      const raw = localStorage.getItem('erp_users');
      let data = [];
      if (raw) {
        data = JSON.parse(raw);
      }

      if (!data || data.length === 0) {
        data = SEED_USERS;
      }

      // Normalization and enrichment function
      const normalizeUser = (u) => {
        const storeName = u.storeName || u.name || u.businessName || "WWE Arena Supermart";
        const ownerName = u.ownerName || u.merchantName || u.fullName || "Ankit Pathe";
        const phone = u.phone || "9876543210";
        const email = u.email || u.username || "ankit@wwearena.com";
        const city = u.city || u.location || u.address || "Chhindwara";
        const activePlan = u.activePlan || u.plan || u.planName || "WWE Pro Plan (₹899)";
        const terminalsUsed = u.terminalsUsed !== undefined ? Number(u.terminalsUsed) : 1;
        const terminalsAllowed = u.terminalsAllowed !== undefined ? Number(u.terminalsAllowed) : 3;
        const createdAt = u.createdAt || "2026-01-10T00:00:00.000Z";
        const status = u.status ? String(u.status).toUpperCase() : "ACTIVE";

        return {
          ...u,
          id: u.id || "USR-" + Date.now().toString().slice(-4),
          storeName,
          ownerName,
          phone,
          email,
          city,
          activePlan,
          terminalsUsed,
          terminalsAllowed,
          createdAt,
          status
        };
      };

      let normalized = data.map(normalizeUser);

      const hasWWE = normalized.some(u => 
        String(u.storeName).toLowerCase().includes('wwe arena') || 
        String(u.ownerName).toLowerCase().includes('ankit pathe') ||
        u.id === 'USR-101'
      );

      if (!hasWWE) {
        const wweUser = {
          id: "USR-101",
          storeName: "WWE Arena Supermart",
          ownerName: "Ankit Pathe",
          email: "ankit@wwearena.com",
          phone: "9876543210",
          city: "Chhindwara",
          activePlan: "WWE Pro Plan (₹899)",
          terminalsUsed: 1,
          terminalsAllowed: 3,
          createdAt: "2026-01-10T00:00:00.000Z",
          status: "ACTIVE"
        };
        normalized = [wweUser, ...normalized];
      }

      localStorage.setItem('erp_users', JSON.stringify(normalized));
      setUsers(normalized);
    };
    loadUsers();
  }, []);

  const saveUsers = (updated) => {
    localStorage.setItem('erp_users', JSON.stringify(updated));
    setUsers(updated);
  };

  // KPI Calculations
  const totalMerchants = users.length;
  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;
  const occupiedTerminals = users.reduce((sum, u) => sum + (Number(u.terminalsUsed) || 0), 0);
  const totalTerminals = users.reduce((sum, u) => sum + (Number(u.terminalsAllowed) || 0), 0);

  // Toggle Status
  const handleToggleStatus = (id, storeName, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = users.map(u => u.id === id ? { ...u, status: nextStatus } : u);
    saveUsers(updated);

    logActivity({
      activityType: 'MERCHANT_STATUS_TOGGLED',
      module: 'Merchants',
      actionDescription: `Toggled merchant "${storeName}" account status to ${nextStatus}`
    });

    toast.showSuccess('Status Toggled', `Merchant status updated to ${nextStatus}.`);
  };

  // Delete Merchant
  const handleDelete = (id, storeName) => {
    setConfirmDelete({ isOpen: true, id, storeName });
  };

  const handleConfirmDelete = () => {
    const { id, storeName } = confirmDelete;
    const updated = users.filter(u => u.id !== id);
    saveUsers(updated);

    logActivity({
      activityType: 'MERCHANT_DELETED',
      module: 'Merchants',
      actionDescription: `Deleted merchant store account "${storeName}" (${id})`
    });

    toast.showSuccess('Merchant Deleted', `Successfully removed "${storeName}" registry.`);
    setConfirmDelete({ isOpen: false, id: null, storeName: '' });
  };

  // Trigger Edit Modal
  const triggerEdit = (merchant) => {
    setEditingMerchant(merchant);
    setEditStoreName(merchant.storeName || '');
    setEditOwnerName(merchant.ownerName || '');
    setEditPhone(merchant.phone || '');
    setEditPlan(merchant.activePlan || 'Silver Starter');
  };

  // Submit Edit Details
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editStoreName.trim() || !editOwnerName.trim() || !editPhone.trim()) {
      toast.showError('Validation Error', 'Please complete all required fields.');
      return;
    }

    const updated = users.map(u => u.id === editingMerchant.id ? {
      ...u,
      storeName: editStoreName.trim(),
      ownerName: editOwnerName.trim(),
      phone: editPhone.trim(),
      activePlan: editPlan
    } : u);
    saveUsers(updated);

    logActivity({
      activityType: 'MERCHANT_UPDATED',
      module: 'Merchants',
      actionDescription: `Updated merchant configuration for ${editStoreName}`
    });

    toast.showSuccess('Merchant Updated', 'Successfully saved account details.');
    setEditingMerchant(null);
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (filtered.length === 0) {
      toast.showError('Export Failure', 'No records matching filters to export.');
      return;
    }

    const headers = ['Merchant ID', 'Store Name', 'Owner Name', 'Email', 'Phone', 'City', 'Active Plan', 'Terminals Used', 'Terminals Allowed', 'Registered Date', 'Status'];
    const rows = filtered.map(u => [
      u.id,
      u.storeName,
      u.ownerName,
      u.email,
      u.phone,
      u.city || 'N/A',
      u.activePlan,
      u.terminalsUsed || 0,
      u.terminalsAllowed || 0,
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
      u.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Merchants_Registry.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.showSuccess('Report Exported', 'Downloaded active merchants registry CSV.');
  };

  // Filter application
  const filtered = users.filter(u => {
    const matchesSearch = 
      (u.storeName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.ownerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.city || '').toLowerCase().includes(search.toLowerCase());

    const matchesTab = statusTab === 'ALL' || u.status === statusTab;

    return matchesSearch && matchesTab;
  });

  const tableHeaders = [
    { label: 'Merchant & Store' },
    { label: 'Contact Details' },
    { label: 'Location / City' },
    { label: 'Active Plan' },
    { label: 'POS Allocation' },
    { label: 'Registered Date' },
    { label: 'Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        <StatCard label="Registered Merchants" value={totalMerchants} icon={Users} color="#4f46e5" />
        
        {/* Active Stores card with green pulse */}
        <div style={{ 
          background: '#ffffff', 
          padding: '16px 20px', 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Active Store Accounts
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'greenPulse 2s infinite' }} />
            </span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>{activeCount} Active</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} />
          </div>
        </div>

        <StatCard label="Suspended Accounts" value={suspendedCount} icon={ShieldAlert} color="#dc2626" />
        <StatCard label="Total POS Quota Used" value={occupiedTerminals} icon={Layers} color="#0891b2" />

      </div>

      {/* Filter Action Controls */}
      <Card style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', flexWrap: 'wrap' }}>
          {['ALL', 'ACTIVE', 'SUSPENDED'].map((tab) => {
            const count = tab === 'ALL'
              ? users.length
              : users.filter(u => u.status === tab).length;
            return (
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
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab}</span>
                <span style={{
                  padding: '2px 6px',
                  fontSize: '0.65rem',
                  borderRadius: '99px',
                  background: statusTab === tab ? 'rgba(255,255,255,0.2)' : '#e5e7eb',
                  color: statusTab === tab ? '#ffffff' : '#4b5563'
                }}>{count}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '220px' }}>
            <Input 
              type="text" 
              placeholder="Search store, merchant, phone, or location..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
          </div>

          <Button variant="purple" onClick={handleExportCSV}>
            <Download size={14} /> Export Merchants CSV
          </Button>
        </div>
      </Card>

      {/* Table grid view */}
      <Table headers={tableHeaders}>
        {filtered.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
              No merchant store records matching active filters.
            </td>
          </tr>
        ) : (
          filtered.map(merchant => (
            <tr key={merchant.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontWeight: 700, color: '#111827' }}>{merchant.storeName || "WWE Arena Supermart"}</strong>
                  <span 
                    onClick={() => navigate(`/admin/users/${merchant.id}`)}
                    style={{ fontSize: '0.725rem', color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    {merchant.ownerName || "Ankit Pathe"}
                  </span>
                  <span style={{ fontSize: '0.675rem', color: '#9ca3af' }}>ID: {merchant.id || 'USR-101'}</span>
                </div>
              </td>
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, color: '#374151' }}>{merchant.email || "ankit@wwearena.com"}</span>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{merchant.phone || "9876543210"}</span>
                </div>
              </td>
              <td style={{ padding: '14px 16px', fontWeight: 600 }}>{merchant.city || 'Chhindwara'}</td>
              <td style={{ padding: '14px 16px' }}>
                <span style={{
                  display: 'inline-flex',
                  padding: '4px 8px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  backgroundColor: '#f3e8ff',
                  color: '#6b21a8'
                }}>
                  {merchant.activePlan || merchant.planName || 'WWE Pro Plan (₹899)'}
                </span>
              </td>
              
              {/* POS Allocation usage bar */}
              <td style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#4b5563' }}>
                    {merchant.terminalsUsed ?? 1} / {merchant.terminalsAllowed ?? 3} Slots
                  </span>
                  <div style={{ width: '100%', height: '5px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min(100, Math.round(((merchant.terminalsUsed ?? 1) / (merchant.terminalsAllowed ?? 3)) * 100))}%`, 
                      height: '100%', 
                      background: (merchant.terminalsUsed ?? 1) >= (merchant.terminalsAllowed ?? 3) ? '#d97706' : '#10b981',
                      transition: 'width 0.4s ease-out'
                    }} />
                  </div>
                </div>
              </td>

              <td style={{ padding: '14px 16px', color: '#6b7280' }}>
                {merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "10 Jan 2026"}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <Badge variant={String(merchant.status).toUpperCase() === 'ACTIVE' ? 'success' : 'danger'}>
                  {String(merchant.status).toUpperCase()}
                </Badge>
              </td>
              <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  
                  <button
                    onClick={() => handleToggleStatus(merchant.id, merchant.storeName, merchant.status)}
                    style={{
                      padding: '6px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: merchant.status === 'ACTIVE' ? '#10b981' : '#9ca3af',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={merchant.status === 'ACTIVE' ? 'Suspend Merchant' : 'Activate Merchant'}
                  >
                    {merchant.status === 'ACTIVE' ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>

                  <button
                    onClick={() => triggerEdit(merchant)}
                    style={{
                      padding: '6px 10px',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      color: '#4b5563',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Edit3 size={11} /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(merchant.id, merchant.storeName)}
                    style={{
                      padding: '6px',
                      background: '#ffffff',
                      border: '1px solid #fee2e2',
                      borderRadius: '6px',
                      color: '#dc2626',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} />
                  </button>

                </div>
              </td>
            </tr>
          ))
        )}
      </Table>

      {/* Edit Merchant Details Modal */}
      {editingMerchant && (
        <>
          <div 
            onClick={() => setEditingMerchant(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <form onSubmit={handleEditSubmit} style={{
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
              <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Edit Merchant Profile</span>
              <button type="button" onClick={() => setEditingMerchant(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Store Name *</span>
              <input
                type="text"
                value={editStoreName}
                onChange={e => setEditStoreName(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Owner Name *</span>
              <input
                type="text"
                value={editOwnerName}
                onChange={e => setEditOwnerName(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Phone Number *</span>
              <input
                type="text"
                value={editPhone}
                onChange={e => setEditPhone(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Allocated SaaS Plan</span>
              <Select value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                <option value="Silver Starter">Silver Starter</option>
                <option value="Gold Pro">Gold Pro</option>
                <option value="Enterprise Hub">Enterprise Hub</option>
              </Select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setEditingMerchant(null)}
                style={{ flex: 1, padding: '10px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(to right, #7c3aed, #4f46e5)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>

          </form>
        </>
      )}

      <style>{`
        @keyframes greenPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.6;
          }
        }
      `}</style>

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete Merchant Account"
        message={`Are you sure you want to permanently delete merchant account "${confirmDelete.storeName}"? This action cannot be undone.`}
        confirmText="Delete Merchant"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null, storeName: '' })}
      />

    </div>
  );
}
