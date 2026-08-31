import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Layers, Plus, Search, Check, AlertCircle, Trash2, ToggleLeft, ToggleRight, Sparkles, TrendingUp, Monitor, Users, ShieldCheck } from 'lucide-react';
import ConfirmDialog from '../../ui/ConfirmDialog';

const SEED_PLANS = [
  {
    id: "PLAN-WWE-899",
    title: "WWE Pro Plan",
    badge: "Best Value",
    monthlyPrice: 899,
    yearlyPrice: 8999,
    terminalLimit: 3,
    staffLimit: 5,
    invoiceLimit: 1000,
    features: { sync: true, gst: true, khata: true, barcode: false, branding: true, support: true },
    status: "ACTIVE",
    activeSubscribers: 0,
    description: "WWE Pro SaaS Subscription Tier"
  },
  {
    id: "PLAN-BASIC",
    title: "Silver Starter",
    badge: "Basic",
    monthlyPrice: 299,
    yearlyPrice: 2999,
    terminalLimit: 1,
    staffLimit: 2,
    invoiceLimit: 1000,
    features: { sync: true, gst: true, khata: false, barcode: false, branding: false, support: false },
    status: "ACTIVE",
    activeSubscribers: 5,
    description: "Ideal for small standalone retail counters & local vendors."
  },
  {
    id: "PLAN-PRO",
    title: "Gold Pro",
    badge: "Most Popular",
    monthlyPrice: 699,
    yearlyPrice: 6999,
    terminalLimit: 3,
    staffLimit: 5,
    invoiceLimit: 5000,
    features: { sync: true, gst: true, khata: true, barcode: true, branding: false, support: false },
    status: "ACTIVE",
    activeSubscribers: 14,
    description: "Best for growing retail networks, pharmacies & apparel stores."
  },
  {
    id: "PLAN-ENT",
    title: "Enterprise Hub",
    badge: "Best Value",
    monthlyPrice: 1499,
    yearlyPrice: 14999,
    terminalLimit: 10,
    staffLimit: 20,
    invoiceLimit: 99999,
    features: { sync: true, gst: true, khata: true, barcode: true, branding: true, support: true },
    status: "ACTIVE",
    activeSubscribers: 3,
    description: "Tailored for large ERP merchants with intense billing volumes."
  }
];

export default function AllPlansGrid() {
  const navigate = useNavigate();
  const toast = useToast();

  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [billingCycle, setBillingCycle] = useState('MONTHLY'); // 'MONTHLY' | 'YEARLY'
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, title: '' });

  useEffect(() => {
    let raw = localStorage.getItem('erp_admin_plans');
    let data = [];
    if (raw) {
      data = JSON.parse(raw);
    }

    if (!data || data.length === 0) {
      data = SEED_PLANS;
      localStorage.setItem('erp_admin_plans', JSON.stringify(data));
    } else {
      const wwePlanCode = 'PLAN-WWE-899';
      const hasWWEPlan = data.some(p => 
        Number(p.monthlyPrice) === 899 || 
        String(p.id).toUpperCase() === wwePlanCode || 
        String(p.code).toUpperCase() === wwePlanCode
      );

      if (!hasWWEPlan) {
        const wwePlan = {
          id: "PLAN-WWE-899",
          title: "WWE Pro Plan",
          badge: "Best Value",
          monthlyPrice: 899,
          yearlyPrice: 8999,
          terminalLimit: 3,
          staffLimit: 5,
          invoiceLimit: 1000,
          features: { sync: true, gst: true, khata: true, barcode: false, branding: true, support: true },
          status: "ACTIVE",
          activeSubscribers: 0,
          description: "WWE Pro SaaS Subscription Tier"
        };
        data = [wwePlan, ...data];
        localStorage.setItem('erp_admin_plans', JSON.stringify(data));
      }
    }

    const standardized = data.map(p => ({
      ...p,
      status: String(p.status).toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'
    }));

    setPlans(standardized);
  }, []);

  const savePlans = (updated) => {
    localStorage.setItem('erp_admin_plans', JSON.stringify(updated));
    setPlans(updated);
  };

  // KPI Calculations
  const totalPlans = plans.length;
  const activeCount = plans.filter(p => p.status === 'ACTIVE').length;
  const totalSubscribers = plans.reduce((sum, p) => sum + (Number(p.activeSubscribers) || 0), 0);
  
  const topPlanObj = plans.reduce((top, p) => ((Number(p.activeSubscribers) || 0) > (Number(top?.activeSubscribers) || 0) ? p : top), plans[0]);
  const topPlanName = topPlanObj ? topPlanObj.title : 'None';

  // Total Potential MRR: Sum of monthlyPrice of active plans
  const estimatedMRR = plans
    .filter(p => p.status === 'ACTIVE')
    .reduce((sum, p) => sum + (Number(p.monthlyPrice) || 0), 0);

  // Toggle Plan Status
  const handleToggleStatus = (id, title, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = plans.map(p => (p.id === id ? { ...p, status: nextStatus } : p));
    savePlans(updated);
    logActivity({
      activityType: 'PLAN_STATUS_TOGGLED',
      module: 'Plans',
      actionDescription: `Changed SaaS plan "${title}" status to ${nextStatus}`
    });
    toast.showSuccess('Status Updated', `SaaS plan "${title}" status toggled to ${nextStatus}.`);
  };

  // Delete Plan
  const handleDeletePlan = (id, title) => {
    setConfirmDelete({ isOpen: true, id, title });
  };

  const handleConfirmDelete = () => {
    const { id, title } = confirmDelete;
    const updated = plans.filter(p => p.id !== id);
    savePlans(updated);
    logActivity({
      activityType: 'PLAN_DELETED',
      module: 'Plans',
      actionDescription: `Deleted SaaS plan "${title}"`
    });
    toast.showSuccess('Plan Deleted', `SaaS plan "${title}" removed successfully.`);
    setConfirmDelete({ isOpen: false, id: null, title: '' });
  };

  // Edit Routing
  const handleEditPlan = (id) => {
    // Navigate to plan creation or edit page with id parameter
    toast.showInfo('Edit Plan', `Navigating to edit settings for Plan ID: ${id}`);
    navigate(`/admin/plans/new`);
  };

  // Filter plans
  const filtered = plans.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* KPI Ribbon */}
      <div className="responsive-grid-4">
        
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Active Packages</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{activeCount} / {totalPlans}</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(3, 80, 150, 0.08)', color: '#035096', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Layers size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Subscribed Stores</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>{totalSubscribers} Stores</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Top Tier Package</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0891b2', margin: '4px 0' }}>{topPlanName}</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(8, 145, 178, 0.08)', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total Potential MRR</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#dc2626', margin: '4px 0' }}>₹{estimatedMRR.toLocaleString('en-IN')}</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={18} />
          </div>
        </div>

      </div>

      {/* Action Bar */}
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
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search active SaaS plans..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              fontSize: '0.85rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              outline: 'none',
              background: '#fafafa',
              color: '#1f2937'
            }}
          />
          <Search size={14} style={{ position: 'absolute', left: '12px', color: '#9ca3af' }} />
        </div>

        {/* Toggle billing cycle indicator */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setBillingCycle('MONTHLY')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: billingCycle === 'MONTHLY' ? '#1f2937' : '#ffffff',
              color: billingCycle === 'MONTHLY' ? '#ffffff' : '#374151',
              cursor: 'pointer'
            }}
          >
            Monthly view
          </button>
          <button
            onClick={() => setBillingCycle('YEARLY')}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: billingCycle === 'YEARLY' ? '#1f2937' : '#ffffff',
              color: billingCycle === 'YEARLY' ? '#ffffff' : '#374151',
              cursor: 'pointer'
            }}
          >
            Yearly view
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={() => navigate('/admin/plans/new')}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(to right, #035096, #3fa9f5)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={14} /> Create SaaS Plan
        </button>
      </div>

      {/* Interactive Plans Grid (3 columns) */}
      {filtered.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', padding: '40px 16px', borderRadius: '16px', textAlign: 'center', color: '#6b7280' }}>
          <AlertCircle size={28} style={{ color: '#cbd5e1', margin: '0 auto 12px auto' }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, display: 'block', color: '#64748b' }}>No SaaS Plans Configured</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '4px', marginBottom: '16px' }}>Get started by creating a new subscription package tier.</span>
          <button
            onClick={() => navigate('/admin/plans/new')}
            style={{ padding: '8px 16px', background: '#035096', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Create First Plan
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {filtered.map(plan => {
            const isYearly = billingCycle === 'YEARLY';
            let price = 0;
            let cycleText = '';
            if (plan.pricingTiers && typeof plan.pricingTiers === 'object') {
              const tierKey = isYearly ? '1y' : '30d';
              price = plan.pricingTiers[tierKey] !== undefined 
                ? plan.pricingTiers[tierKey] 
                : (Object.values(plan.pricingTiers)[0] || 0);
              cycleText = `/ ${isYearly ? '1 Year' : '30 Days'}`;
            } else {
              price = isYearly 
                ? (Number(plan.yearlyPrice) || (Number(plan.monthlyPrice || plan.price || 0) * 10)) 
                : (Number(plan.monthlyPrice || plan.price || 0));
              cycleText = isYearly ? '/ year' : '/ month';
            }

            // Feature list mapping (support standard array or mapped features object)
            const featuresList = plan.features && typeof plan.features === 'object'
              ? Object.entries(plan.features).filter(([k, v]) => v).map(([k]) => {
                  if (k === 'sync') return 'Multi-Counter Sync';
                  if (k === 'gst') return 'Advanced GST Reports';
                  if (k === 'khata') return 'Khata / Udhar Ledger';
                  if (k === 'barcode') return 'Barcode Printing';
                  if (k === 'branding') return 'Invoice Custom Branding';
                  if (k === 'support') return 'Priority 24/7 Support';
                  return k;
                })
              : plan.features || [];

            return (
              <div
                key={plan.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  padding: '24px',
                  opacity: String(plan.status).toUpperCase() === 'ACTIVE' ? 1 : 0.7,
                  transition: 'opacity 0.2s'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                      {plan.title}
                    </h3>
                    {plan.badge && (
                      <span style={{
                        alignSelf: 'flex-start',
                        background: 'rgba(3, 80, 150, 0.08)',
                        color: '#035096',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '99px',
                        textTransform: 'uppercase',
                        marginTop: '4px'
                      }}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: '99px',
                    background: String(plan.status).toUpperCase() === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                    color: String(plan.status).toUpperCase() === 'ACTIVE' ? '#065f46' : '#991b1b',
                    textTransform: 'uppercase'
                  }}>
                    {plan.status}
                  </span>
                </div>

                {/* Price tag */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#111827' }}>
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{cycleText}</span>
                </div>

                {/* Description */}
                {plan.description && (
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, minHeight: '36px' }}>
                    {plan.description}
                  </p>
                )}

                {/* Limits Chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>Quotas & Limits</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      Counters: {plan.terminalLimit ?? plan.deviceLimit ?? 'Unlimited'}
                    </span>
                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      Cashiers: {plan.staffLimit ?? 'Unlimited'}
                    </span>
                    <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      Invoices: {plan.invoiceLimit ?? 'Unlimited'}
                    </span>
                  </div>
                </div>

                {/* Bullet features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase' }}>Includes</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {featuresList.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', color: '#4b5563', fontWeight: 550 }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={8} />
                        </div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleToggleStatus(plan.id, plan.title, plan.status)}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      background: String(plan.status).toUpperCase() === 'ACTIVE' ? '#ffffff' : '#fafafa',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#374151',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {String(plan.status).toUpperCase() === 'ACTIVE' ? 'Pause Plan' : 'Activate'}
                  </button>

                  <button
                    onClick={() => handleEditPlan(plan.id)}
                    style={{
                      padding: '8px 10px',
                      background: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      color: '#4b5563',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.title)}
                    style={{
                      padding: '8px',
                      background: '#ffffff',
                      border: '1px solid #fee2e2',
                      borderRadius: '8px',
                      color: '#dc2626',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title="Delete SaaS Plan"
        message={`Are you sure you want to permanently delete SaaS plan "${confirmDelete.title}"? This action cannot be undone.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null, title: '' })}
      />

    </div>
  );
}
