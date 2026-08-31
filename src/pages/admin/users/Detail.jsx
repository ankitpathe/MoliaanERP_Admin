import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Users, CheckCircle, ShieldAlert, Layers, Search, Download, Trash2, Printer, Edit, ArrowLeft, RefreshCw, Eye, Calendar, CreditCard, Clock, Radio, Activity } from 'lucide-react';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import SectionDivider from '../../../components/ui/SectionDivider';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const DUMMY_ACTIVITIES = [
  { text: "Account dashboard handshake verified", time: "25 mins ago" },
  { text: "License allocation updated by Admin", time: "3 hours ago" },
  { text: "Weekly sales report compiled", time: "Yesterday" },
  { text: "POS counter linked successfully", time: "2 days ago" },
  { text: "Merchant credentials validated", time: "3 days ago" }
];

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Change Plan States
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [billingFrequency, setBillingFrequency] = useState('MONTHLY');
  const [selectedDuration, setSelectedDuration] = useState('30d');

  // Edit Profile States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editStoreName, setEditStoreName] = useState('');
  const [editErrors, setEditErrors] = useState({});

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  });

  const loadUserDetail = () => {
    setLoading(true);
    const rawUsers = localStorage.getItem('erp_users');
    if (!rawUsers) {
      setLoading(false);
      return;
    }

    const usersList = JSON.parse(rawUsers);
    const found = usersList.find(u => u.id === id);

    if (found) {
      setUser(found);

      // Filter invoices for this merchant (match storeName or id)
      const rawInvoices = localStorage.getItem('erp_invoices') || localStorage.getItem('invoices') || '[]';
      try {
        const parsedInvoices = JSON.parse(rawInvoices);
        const filteredInvoices = parsedInvoices
          .filter(inv => inv.storeName === found.storeName)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setInvoices(filteredInvoices);
      } catch (e) {
        setInvoices([]);
      }

      // Filter counters linked to this merchant (match location or code)
      const rawCounters = localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters') || '[]';
      try {
        const parsedCounters = JSON.parse(rawCounters);
        // Match counters whose location contains store/merchant details or Delhi/Main stores
        const filteredCounters = parsedCounters.filter(ctr => 
          ctr.location.toLowerCase().includes(found.storeName.toLowerCase()) ||
          ctr.location.toLowerCase().includes(found.city.toLowerCase()) ||
          (found.id === 'USR-101' && ctr.code === 'POS-WWE2')
        );
        setCounters(filteredCounters);
      } catch (e) {
        setCounters([]);
      }

      // Activities log
      const rawLogs = localStorage.getItem('erp_activity_logs');
      if (rawLogs) {
        try {
          const parsed = JSON.parse(rawLogs);
          const filtered = parsed
            .filter(l => 
              l.resource.includes(found.storeName) || 
              l.resource.includes(found.ownerName) ||
              (l.details && l.details.userId === found.id)
            )
            .map(l => ({
              text: `${l.actionDescription || l.action} (${l.module})`,
              time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Just now'
            }));
          setActivities(filtered.length > 0 ? filtered : DUMMY_ACTIVITIES);
        } catch (e) {
          setActivities(DUMMY_ACTIVITIES);
        }
      } else {
        setActivities(DUMMY_ACTIVITIES);
      }

      // Load available SaaS plans
      const rawPlans = localStorage.getItem('erp_admin_plans') || localStorage.getItem('plans') || '[]';
      try {
        const parsedPlans = JSON.parse(rawPlans);
        const seedPlans = parsedPlans.length > 0 ? parsedPlans : [
          { id: 'PLAN-WWE-899', title: 'WWE Pro Plan', monthlyPrice: 899, yearlyPrice: 8999, terminalsLimit: 3 },
          { id: 'PLAN-GOLD-1499', title: 'Gold Premium Plan', monthlyPrice: 1499, yearlyPrice: 14990, terminalsLimit: 5 },
          { id: 'PLAN-SILVER-499', title: 'Silver Starter Plan', monthlyPrice: 499, yearlyPrice: 4990, terminalsLimit: 1 }
        ];
        setPlans(seedPlans);
      } catch (e) {
        setPlans([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUserDetail();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto' }} />
        <span style={{ display: 'block', marginTop: '10px', fontSize: '0.85rem' }}>Loading user details...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <ShieldAlert size={48} style={{ color: '#ef4444' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}>Merchant Not Found</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>The requested merchant identifier could not be resolved from local registry storage.</p>
          <Button variant="purple" onClick={() => navigate('/admin/users')}>
            <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Return to Users List
          </Button>
        </div>
      </div>
    );
  }

  // Toggle account active/suspended status
  const handleToggleStatus = () => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const rawUsers = localStorage.getItem('erp_users');
    if (rawUsers) {
      const list = JSON.parse(rawUsers);
      const updated = list.map(u => u.id === id ? { ...u, status: nextStatus } : u);
      localStorage.setItem('erp_users', JSON.stringify(updated));
      setUser(prev => ({ ...prev, status: nextStatus }));

      logActivity({
        activityType: 'USER_STATUS_TOGGLED',
        module: 'Users Registry',
        actionDescription: `Toggled user status of "${user.ownerName}" to ${nextStatus}`
      });

      toast.showSuccess('Status Updated', `Merchant is now ${nextStatus}`);
    }
  };

  // Change Plan
  const handleChangePlan = () => {
    // Attempt to match current plan to a plan ID if possible
    const matched = plans.find(p => user.activePlan && user.activePlan.includes(p.title || p.name));
    setSelectedPlanId(matched ? matched.id : (plans[0]?.id || ''));
    setBillingFrequency(user.billingFrequency || 'MONTHLY');
    setIsChangePlanOpen(true);
  };

  const handleConfirmPlanChange = () => {
    const selectedPlanObj = plans.find(p => p.id === selectedPlanId);
    if (!selectedPlanObj) return;

    let newPlanPrice = 0;
    let durationInDays = 30;

    if (selectedPlanObj.pricingTiers && typeof selectedPlanObj.pricingTiers === 'object') {
      newPlanPrice = selectedPlanObj.pricingTiers[selectedDuration] !== undefined 
        ? selectedPlanObj.pricingTiers[selectedDuration] 
        : (Object.values(selectedPlanObj.pricingTiers)[0] || 0);
      
      const durationDays = {
        '7d': 7,
        '14d': 14,
        '30d': 30,
        '90d': 90,
        '6m': 180,
        '1y': 365
      };
      durationInDays = durationDays[selectedDuration] || 30;
    } else {
      newPlanPrice = billingFrequency === 'YEARLY' ? selectedPlanObj.yearlyPrice || (selectedPlanObj.monthlyPrice * 10) : selectedPlanObj.monthlyPrice;
      durationInDays = billingFrequency === 'YEARLY' ? 365 : 30;
    }

    const newPlanLimit = selectedPlanObj.terminalsLimit || selectedPlanObj.terminalLimit || 3;

    const today = new Date();
    let expiryDate = new Date();
    expiryDate.setDate(today.getDate() + durationInDays);
    const expiryStr = expiryDate.toISOString().split('T')[0];
    const purchasedStr = today.toISOString().split('T')[0];

    const planLabel = `${selectedPlanObj.title || selectedPlanObj.name} (₹${newPlanPrice})`;

    const updatedUser = {
      ...user,
      activePlan: planLabel,
      terminalsAllowed: newPlanLimit,
      purchasedDate: purchasedStr,
      expiryDate: expiryStr,
      billingFrequency: billingFrequency
    };

    const rawUsers = localStorage.getItem('erp_users');
    if (rawUsers) {
      const list = JSON.parse(rawUsers);
      const updatedList = list.map(u => u.id === id ? updatedUser : u);
      localStorage.setItem('erp_users', JSON.stringify(updatedList));
      setUser(updatedUser);

      // Add activity log
      logActivity({
        activityType: 'USER_PLAN_CHANGED',
        module: 'Users Registry',
        actionDescription: `Plan changed to ${selectedPlanObj.title || selectedPlanObj.name} by Admin`,
        details: { userId: id }
      });

      toast.showSuccess('Subscription Updated', 'Subscription plan updated successfully.');
      setIsChangePlanOpen(false);
    }
  };

  // Edit Profile Handlers
  const handleEditProfile = () => {
    setEditOwnerName(user.ownerName || '');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
    setEditCity(user.city || '');
    setEditStoreName(user.storeName || '');
    setEditErrors({});
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!editOwnerName.trim()) {
      newErrors.ownerName = 'Owner Name is required';
    }
    if (!editStoreName.trim()) {
      newErrors.storeName = 'Store Name is required';
    }
    if (!editPhone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^\d{10}$/.test(editPhone.trim())) {
      newErrors.phone = 'Phone Number must be exactly 10 digits';
    }
    if (editEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editEmail.trim())) {
      newErrors.email = 'Invalid Email address format';
    }

    if (Object.keys(newErrors).length > 0) {
      setEditErrors(newErrors);
      toast.showError('Validation Error', 'Please complete the required fields.');
      return;
    }

    const updatedUser = {
      ...user,
      ownerName: editOwnerName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      city: editCity.trim(),
      storeName: editStoreName.trim()
    };

    const rawUsers = localStorage.getItem('erp_users');
    if (rawUsers) {
      const list = JSON.parse(rawUsers);
      const updatedList = list.map(u => u.id === id ? updatedUser : u);
      localStorage.setItem('erp_users', JSON.stringify(updatedList));
      setUser(updatedUser);

      // Add activity log
      logActivity({
        activityType: 'USER_PROFILE_UPDATED',
        module: 'Users Registry',
        actionDescription: `Updated profile details for ${editOwnerName.trim()}`,
        details: { userId: id }
      });

      toast.showSuccess('Profile Updated', 'Merchant profile updated successfully.');
      setIsEditProfileOpen(false);
    }
  };

  // Suspend Account
  const handleSuspend = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Suspend Merchant Account',
      message: `Are you sure you want to suspend account "${user.ownerName}"? This suspends SaaS subscription access.`,
      variant: 'warning',
      onConfirm: () => {
        const rawUsers = localStorage.getItem('erp_users');
        if (rawUsers) {
          const list = JSON.parse(rawUsers);
          const updated = list.map(u => u.id === id ? { ...u, status: 'SUSPENDED' } : u);
          localStorage.setItem('erp_users', JSON.stringify(updated));
          setUser(prev => ({ ...prev, status: 'SUSPENDED' }));

          logActivity({
            activityType: 'USER_SUSPENDED',
            module: 'Users Registry',
            actionDescription: `Suspended merchant account: ${user.ownerName}`
          });
          toast.showSuccess('Account Suspended', 'Merchant subscription suspended.');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Delete Merchant
  const handleDeleteMerchant = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Merchant Profile',
      message: `Are you sure you want to permanently delete merchant "${user.ownerName}"? All subscription history will be lost.`,
      variant: 'danger',
      onConfirm: () => {
        const rawUsers = localStorage.getItem('erp_users');
        if (rawUsers) {
          const list = JSON.parse(rawUsers);
          const updated = list.filter(u => u.id !== id);
          localStorage.setItem('erp_users', JSON.stringify(updated));

          logActivity({
            activityType: 'USER_DELETED',
            module: 'Users Registry',
            actionDescription: `Permanently deleted merchant record: ${user.ownerName}`
          });
          toast.showSuccess('Merchant Deleted', 'Profile removed from directory.');
          navigate('/admin/users');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Calculate Sub Expiry Data
  // WWE Pro Plan (₹899) expiration calculations
  const expiryDateStr = user.expiryDate || "2027-01-10";
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const subStatusColor = daysRemaining < 7 ? '#ef4444' : daysRemaining < 30 ? '#f59e0b' : '#10b981';

  // Receipt Modal printing
  const handlePrintReceipt = (receipt) => {
    toast.showInfo('Print Job Queued', `Printing invoice: ${receipt.invoiceNo}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb={`Admin / Users / ${user.ownerName}`}
        title={user.ownerName}
        subtitle={`${user.storeName} • Location: ${user.city}`}
        extra={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'}>
              {user.status}
            </Badge>
            <Button 
              variant={user.status === 'ACTIVE' ? 'secondary' : 'primary'} 
              onClick={handleToggleStatus}
              style={{ color: user.status === 'ACTIVE' ? '#ef4444' : '#10b981' }}
            >
              {user.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
            </Button>
            <Button variant="secondary" onClick={handleEditProfile}>
              <Edit size={14} /> Edit profile
            </Button>
          </div>
        }
      />

      {/* Grid columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left column stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Basic Information */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Basic Information
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>General merchant registry details, store parameters, and contacts.</span>
            </div>

            <div className="responsive-two-cols">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Full Name</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>{user.ownerName}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Email Address</span>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>{user.email}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Contact Number</span>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>{user.phone}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Location / City</span>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>{user.city}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Store Name</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1f2937' }}>{user.storeName}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Managed By</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Super Admin</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Registered Date</span>
                <span style={{ fontSize: '0.85rem' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>User ID</span>
                <span style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>{user.id}</span>
              </div>
            </div>
          </Card>

          {/* Plan & Subscription Card */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                  SaaS Plan & Subscription
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Allocated SaaS tier capabilities and license validation.</span>
              </div>
              <Badge variant={daysRemaining > 0 ? 'success' : 'danger'}>
                {user.activePlan || 'WWE Pro Plan (₹899)'}
              </Badge>
            </div>

            <div className="responsive-two-cols">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Billing Frequency</span>
                <Badge variant="purple" style={{ alignSelf: 'flex-start' }}>Monthly</Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Purchased On</span>
                <span style={{ fontSize: '0.85rem' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '10 Jan 2026'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Expiration Date</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{expiryDateStr}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Days Remaining</span>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: subStatusColor }}>
                  {daysRemaining > 0 ? `${daysRemaining} Days` : 'Expired'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>POS Terminal Allocation</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>
                    {user.terminalsUsed ?? 1} / {user.terminalsAllowed ?? 3} Slots
                  </span>
                  <div style={{ flex: 1, height: '6px', background: '#e5e7eb', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${Math.min(100, Math.round(((user.terminalsUsed ?? 1) / (user.terminalsAllowed ?? 3)) * 100))}%`, 
                      height: '100%', 
                      background: (user.terminalsUsed ?? 1) >= (user.terminalsAllowed ?? 3) ? '#d97706' : '#10b981',
                      transition: 'width 0.4s ease-out'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="purple" onClick={handleChangePlan} style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
              Change subscription Plan
            </Button>
          </Card>

          {/* Recent Invoices Card */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                  Recent Invoices
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Last 10 retail sales transactions generated for this outlet.</span>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic' }}>
                No invoices generated yet for this merchant.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left', color: '#4b5563' }}>
                      <th style={{ padding: '8px 12px' }}>Invoice No</th>
                      <th style={{ padding: '8px 12px' }}>Date</th>
                      <th style={{ padding: '8px 12px' }}>Customer</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Items</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '8px 12px' }}>Mode</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700 }}>{inv.invoiceNo}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 12px' }}>{inv.customerName}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>{inv.itemsCount}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>₹{inv.grandTotal.toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', fontWeight: 650 }}>{inv.paymentMode}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <button 
                            onClick={() => setActiveReceipt(inv)}
                            style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                            title="View Receipt"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => navigate('/admin/reports/invoices')}>
                View All Invoices
              </Button>
            </div>
          </Card>

        </div>

        {/* Right column stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Assigned Counters Card */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Assigned Counters
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Physical terminal counters linked to this merchant.</span>
            </div>

            {counters.length === 0 ? (
              <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>No terminals assigned yet.</span>
                <Button variant="secondary" onClick={() => navigate('/admin/counters/new')}>
                  Link New Counter
                </Button>
              </div>
            ) : (
              <Table headers={[{ label: 'Terminal' }, { label: 'Code' }, { label: 'Status' }]}>
                {counters.map(ctr => (
                  <tr key={ctr.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.75rem' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <span 
                        onClick={() => navigate(`/admin/counters/${ctr.id}`)}
                        style={{ color: '#035096', cursor: 'pointer', fontWeight: 700 }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {ctr.name}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>{ctr.code}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={ctr.status === 'ONLINE' ? 'success' : 'danger'}>{ctr.status}</Badge>
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          {/* Activity Log Card */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Account Activity Log
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Timeline of merchant administrative mutations.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.75rem' }}>
                  <div style={{ marginTop: '2px', width: '6px', height: '6px', borderRadius: '50%', background: '#035096', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{act.text}</span>
                    <span style={{ fontSize: '0.675rem', color: '#9ca3af' }}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Danger Zone */}
          <div style={{ border: '1px solid #fee2e2', background: 'rgba(254, 226, 226, 0.15)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Danger Zone: Account Controls
              </span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>
                Suspending an account stops SaaS terminal access. Delete operation is irreversible.
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="danger" onClick={handleSuspend} style={{ padding: '8px 14px', fontSize: '0.75rem', flex: 1, minWidth: '120px' }}>
                Suspend Account
              </Button>
              <Button variant="danger" onClick={handleDeleteMerchant} style={{ padding: '8px 14px', fontSize: '0.75rem', flex: 1, minWidth: '120px' }}>
                Delete Merchant
              </Button>
            </div>
          </div>

        </div>

      </div>

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

      {/* Change subscription Plan Modal */}
      {isChangePlanOpen && (() => {
        const selectedPlanObj = plans.find(p => p.id === selectedPlanId);
        const isCurrentPlan = user.activePlan && (user.activePlan.includes(selectedPlanObj?.title) || user.activePlan.includes(selectedPlanObj?.name) || user.activePlan.includes(selectedPlanId));
        
        const hasPricingTiers = selectedPlanObj && selectedPlanObj.pricingTiers && typeof selectedPlanObj.pricingTiers === 'object';
        
        let newPlanPrice = 0;
        let pricingCycleText = '';
        if (selectedPlanObj) {
          if (hasPricingTiers) {
            newPlanPrice = selectedPlanObj.pricingTiers[selectedDuration] !== undefined 
              ? selectedPlanObj.pricingTiers[selectedDuration] 
              : (Object.values(selectedPlanObj.pricingTiers)[0] || 0);
            
            const durationLabels = {
              '7d': '7 Days',
              '14d': '14 Days',
              '30d': '30 Days',
              '90d': '90 Days',
              '6m': '6 Months',
              '1y': '1 Year'
            };
            pricingCycleText = durationLabels[selectedDuration] || selectedDuration;
          } else {
            const mPrice = selectedPlanObj.monthlyPrice || selectedPlanObj.price || selectedPlanObj.priceMonthly || selectedPlanObj.monthly || 0;
            const yPrice = selectedPlanObj.yearlyPrice || selectedPlanObj.priceYearly || selectedPlanObj.yearly || (mPrice * 10);
            newPlanPrice = billingFrequency === 'YEARLY' ? yPrice : mPrice;
            pricingCycleText = billingFrequency === 'YEARLY' ? 'Year' : 'Month';
          }
        }
        const newPlanLimit = selectedPlanObj ? (selectedPlanObj.terminalLimit || selectedPlanObj.terminalsLimit || selectedPlanObj.limit || 3) : 3;

        return (
          <>
            <div
              onClick={() => setIsChangePlanOpen(false)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
            />
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '450px',
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
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                  Change Subscription Plan
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Update the SaaS plan and terminal allocation limit for <strong>{user.ownerName}</strong>.
                </span>
              </div>

              {plans.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>No plans available. Create a plan first.</span>
                  <Button variant="purple" onClick={() => navigate('/admin/plans/new')}>
                    Create Plan
                  </Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Current Plan</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>{user.activePlan || 'WWE Pro Plan (₹899)'}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Select New Plan</span>
                    <select
                      value={selectedPlanId}
                      onChange={e => {
                        const nextId = e.target.value;
                        setSelectedPlanId(nextId);
                        const pObj = plans.find(p => p.id === nextId);
                        if (pObj && pObj.pricingTiers) {
                          setSelectedDuration(pObj.recommendedDuration || Object.keys(pObj.pricingTiers)[0] || '30d');
                        }
                      }}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.85rem',
                        outline: 'none',
                        background: '#ffffff',
                        width: '100%'
                      }}
                    >
                      <option value="">-- Choose a plan --</option>
                      {plans.map(p => {
                        let displayPrice = '';
                        if (p.pricingTiers && typeof p.pricingTiers === 'object') {
                          displayPrice = `₹${p.pricingTiers['30d'] || Object.values(p.pricingTiers)[0] || 0}`;
                        } else {
                          displayPrice = `₹${p.monthlyPrice || p.price || 0}`;
                        }
                        return (
                          <option key={p.id} value={p.id}>
                            {p.title || p.name} ({displayPrice})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {selectedPlanObj && (
                    hasPricingTiers ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Billing Duration</span>
                        <select
                          value={selectedDuration}
                          onChange={e => setSelectedDuration(e.target.value)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            fontSize: '0.85rem',
                            outline: 'none',
                            background: '#ffffff',
                            width: '100%'
                          }}
                        >
                          {Object.entries(selectedPlanObj.pricingTiers).map(([k, v]) => {
                            const durationLabels = {
                              '7d': '7 Days',
                              '14d': '14 Days',
                              '30d': '30 Days',
                              '90d': '90 Days',
                              '6m': '6 Months',
                              '1y': '1 Year'
                            };
                            return (
                              <option key={k} value={k}>
                                {durationLabels[k] || k} (₹{v})
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Billing Frequency</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            type="button"
                            onClick={() => setBillingFrequency('MONTHLY')}
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '8px',
                              border: billingFrequency === 'MONTHLY' ? '2px solid #035096' : '1px solid #d1d5db',
                              background: billingFrequency === 'MONTHLY' ? '#f5f3ff' : '#ffffff',
                              color: billingFrequency === 'MONTHLY' ? '#035096' : '#4b5563',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Monthly
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillingFrequency('YEARLY')}
                            style={{
                              flex: 1,
                              padding: '8px',
                              borderRadius: '8px',
                              border: billingFrequency === 'YEARLY' ? '2px solid #035096' : '1px solid #d1d5db',
                              background: billingFrequency === 'YEARLY' ? '#f5f3ff' : '#ffffff',
                              color: billingFrequency === 'YEARLY' ? '#035096' : '#4b5563',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            Yearly
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  {selectedPlanObj && (
                    <div style={{ background: '#f5f3ff', padding: '12px', borderRadius: '8px', border: '1px solid #ddd6fe', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#035096', fontWeight: 700, textTransform: 'uppercase' }}>New Plan Live Preview</span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>New Plan Price:</span>
                        <strong>₹{newPlanPrice} / {pricingCycleText}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span>POS Terminals Limit:</span>
                        <strong>{newPlanLimit} Slots (Currently: {user.terminalsAllowed ?? 3})</strong>
                      </div>
                      <span style={{ fontSize: '0.675rem', color: '#6b7280', fontStyle: 'italic', marginTop: '2px' }}>
                        * This subscription upgrade will take effect immediately.
                      </span>
                    </div>
                  )}

                  {selectedPlanObj && isCurrentPlan && (
                    <span style={{ fontSize: '0.725rem', color: '#dc2626', fontWeight: 600 }}>Already on this plan</span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setIsChangePlanOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="purple" 
                  disabled={!selectedPlanId || isCurrentPlan}
                  onClick={handleConfirmPlanChange}
                >
                  Confirm Change
                </Button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <>
          <div
            onClick={() => setIsEditProfileOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <form 
            onSubmit={handleSaveProfile}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '450px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '24px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Edit Merchant Profile
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                Update contact credentials and store location details for <strong>{user.ownerName}</strong>.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Owner Full Name *</span>
                <input 
                  type="text" 
                  value={editOwnerName}
                  onChange={e => {
                    setEditOwnerName(e.target.value);
                    if (editErrors.ownerName) setEditErrors(prev => ({ ...prev, ownerName: null }));
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editErrors.ownerName ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                {editErrors.ownerName && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{editErrors.ownerName}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Store Name *</span>
                <input 
                  type="text" 
                  value={editStoreName}
                  onChange={e => {
                    setEditStoreName(e.target.value);
                    if (editErrors.storeName) setEditErrors(prev => ({ ...prev, storeName: null }));
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editErrors.storeName ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                {editErrors.storeName && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{editErrors.storeName}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Phone Number *</span>
                <input 
                  type="text" 
                  value={editPhone}
                  onChange={e => {
                    setEditPhone(e.target.value);
                    if (editErrors.phone) setEditErrors(prev => ({ ...prev, phone: null }));
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editErrors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                {editErrors.phone && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{editErrors.phone}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Email Address</span>
                <input 
                  type="text" 
                  value={editEmail}
                  onChange={e => {
                    setEditEmail(e.target.value);
                    if (editErrors.email) setEditErrors(prev => ({ ...prev, email: null }));
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: editErrors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
                {editErrors.email && <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>{editErrors.email}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>City / Location</span>
                <input 
                  type="text" 
                  value={editCity}
                  onChange={e => setEditCity(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <Button type="button" variant="secondary" onClick={() => setIsEditProfileOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="purple">
                Save Changes
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Shared ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
