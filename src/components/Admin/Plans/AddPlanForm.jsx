import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { ShieldCheck, Layers, Landmark, CreditCard, ChevronRight, HelpCircle } from 'lucide-react';
import Select from '../../ui/Select';

export default function AddPlanForm() {
  const navigate = useNavigate();
  const toast = useToast();

  // Check if WWE plan is already present to decide default form values
  const checkWWEPlanExists = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('erp_admin_plans') || '[]');
      return existing.some(p => p.id === 'PLAN-WWE-899' || p.code === 'PLAN-WWE-899');
    } catch (e) {
      return false;
    }
  };
  const hasWWEPlan = checkWWEPlanExists();

  // Form State
  const [planName, setPlanName] = useState(hasWWEPlan ? '' : 'WWE Pro Plan');
  const [planCode, setPlanCode] = useState(hasWWEPlan ? '' : 'PLAN-WWE-899');
  const [badge, setBadge] = useState(hasWWEPlan ? '' : 'Best Value');
  const [description, setDescription] = useState(hasWWEPlan ? '' : 'WWE Pro SaaS Subscription Tier');

  // Pricing State
  const [billingFrequency, setBillingFrequency] = useState('MONTHLY'); // 'MONTHLY' | 'YEARLY'
  const [monthlyPrice, setMonthlyPrice] = useState(hasWWEPlan ? '' : '899');
  const [yearlyPrice, setYearlyPrice] = useState(hasWWEPlan ? '' : '8999');
  const [trialDays, setTrialDays] = useState('14');

  // Quota Limits State
  const [unlimitedTerminals, setUnlimitedTerminals] = useState(false);
  const [terminalLimit, setTerminalLimit] = useState('3');
  
  const [staffLimit, setStaffLimit] = useState('5');
  
  const [unlimitedInvoices, setUnlimitedInvoices] = useState(false);
  const [invoiceLimit, setInvoiceLimit] = useState('1000');

  // Feature Checklist
  const [features, setFeatures] = useState({
    sync: !hasWWEPlan,
    gst: !hasWWEPlan,
    khata: !hasWWEPlan,
    barcode: false,
    branding: !hasWWEPlan,
    support: !hasWWEPlan
  });

  // Dynamic slug generation
  const handleNameChange = (name) => {
    setPlanName(name);
    const slug = name
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setPlanCode(slug ? `PLAN_${slug}` : '');
  };

  // Savings % Calculation
  const getSavingsPercentage = () => {
    const m = parseFloat(monthlyPrice) || 0;
    const y = parseFloat(yearlyPrice) || 0;
    if (m <= 0 || y <= 0) return 0;
    const fullMonthlyCost = m * 12;
    const saved = fullMonthlyCost - y;
    if (saved <= 0) return 0;
    return Math.round((saved / fullMonthlyCost) * 100);
  };

  const handleToggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!planName.trim()) {
      toast.showError('Validation Error', 'Plan Name is required.');
      return;
    }
    const mPrice = parseFloat(monthlyPrice) || 0;
    const yPrice = parseFloat(yearlyPrice) || 0;
    if (mPrice <= 0 || yPrice <= 0) {
      toast.showError('Validation Error', 'Pricing values must be greater than 0.');
      return;
    }
    const selectedFeaturesCount = Object.values(features).filter(Boolean).length;
    if (selectedFeaturesCount === 0) {
      toast.showError('Validation Error', 'Please select at least 1 feature.');
      return;
    }

    const newPlan = {
      id: planCode || `PLAN-${Date.now().toString().slice(-4)}`,
      title: planName.trim(),
      code: planCode,
      badge: badge.trim(),
      description: description.trim(),
      billingFrequency,
      monthlyPrice: mPrice,
      yearlyPrice: yPrice,
      duration: billingFrequency === 'MONTHLY' ? 30 : 365,
      deviceLimit: unlimitedTerminals ? 9999 : (parseInt(terminalLimit) || 3),
      trialDays: parseInt(trialDays),
      unlimitedTerminals,
      terminalLimit: unlimitedTerminals ? 'Unlimited' : (parseInt(terminalLimit) || 3),
      staffLimit: parseInt(staffLimit) || 5,
      unlimitedInvoices,
      invoiceLimit: unlimitedInvoices ? 'Unlimited' : (parseInt(invoiceLimit) || 1000),
      features,
      status: 'Active',
      activeSubscribers: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    const existingPlans = JSON.parse(localStorage.getItem('erp_admin_plans') || '[]');
    const updated = [newPlan, ...existingPlans];
    localStorage.setItem('erp_admin_plans', JSON.stringify(updated));

    // Audit Log
    logActivity({
      activityType: 'PLAN_CREATED',
      module: 'Plans',
      actionDescription: `Created new SaaS pricing tier "${planName}" [Code: ${planCode}]`
    });

    toast.showSuccess('Plan Published', `SaaS plan "${planName}" is now live.`);
    navigate('/admin/plans');
  };

  const savings = getSavingsPercentage();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', boxSizing: 'border-box' }}>
      
      {/* Left Column: Input Form with sections */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section A: Basic Plan Details */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Layers size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section A: Basic Plan Details
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Plan Name *</span>
              <input
                type="text"
                placeholder="e.g. Retail Pro Booster"
                value={planName}
                onChange={e => handleNameChange(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Plan Code / Identifier</span>
              <input
                type="text"
                value={planCode}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', color: '#6b7280' }}
                readOnly
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Badge / Tag (Optional)</span>
            <input
              type="text"
              placeholder="e.g. Recommended, Most Popular"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Short Description</span>
            <textarea
              placeholder="Provide a quick summary of the tier benefits..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Section B: Pricing & Billing Tiers */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <CreditCard size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section B: Pricing & Billing Tiers
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Billing Frequency</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBillingFrequency('MONTHLY')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: billingFrequency === 'MONTHLY' ? '#1f2937' : '#ffffff',
                    color: billingFrequency === 'MONTHLY' ? '#ffffff' : '#374151',
                    fontSize: '0.8rem',
                    fontWeight: 600,
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
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: billingFrequency === 'YEARLY' ? '#1f2937' : '#ffffff',
                    color: billingFrequency === 'YEARLY' ? '#ffffff' : '#374151',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Free Trial Period</span>
              <Select
                value={trialDays}
                onChange={e => setTrialDays(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="0">No Trial</option>
                <option value="7">7 Days Trial</option>
                <option value="14">14 Days Trial</option>
                <option value="30">30 Days Trial</option>
              </Select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Monthly Price (₹) *</span>
              <input
                type="number"
                placeholder="e.g. 999"
                value={monthlyPrice}
                onChange={e => setMonthlyPrice(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                Yearly Price (₹) *
                {savings > 0 && (
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Save {savings}%
                  </span>
                )}
              </span>
              <input
                type="number"
                placeholder="e.g. 9999"
                value={yearlyPrice}
                onChange={e => setYearlyPrice(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
                required
              />
            </div>
          </div>
        </div>

        {/* Section C: Quota & Terminal Limits */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Landmark size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section C: Quota & Terminal Limits
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* POS Terminals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                POS Terminals / Counters Limit
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#4b5563', fontWeight: 550, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={unlimitedTerminals}
                    onChange={e => setUnlimitedTerminals(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Unlimited
                </label>
              </span>
              <input
                type="number"
                value={unlimitedTerminals ? '' : terminalLimit}
                onChange={e => setTerminalLimit(e.target.value)}
                disabled={unlimitedTerminals}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: unlimitedTerminals ? '#f3f4f6' : '#ffffff'
                }}
              />
            </div>

            {/* Staff Cashiers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Allowed Staff Accounts / Cashiers</span>
              <input
                type="number"
                placeholder="e.g. 5"
                value={staffLimit}
                onChange={e => setStaffLimit(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
          </div>

          {/* Invoices Limit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
              Monthly Invoices Quota
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#4b5563', fontWeight: 550, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={unlimitedInvoices}
                  onChange={e => setUnlimitedInvoices(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                Unlimited
              </label>
            </span>
            <input
              type="number"
              value={unlimitedInvoices ? '' : invoiceLimit}
              onChange={e => setInvoiceLimit(e.target.value)}
              disabled={unlimitedInvoices}
              style={{
                padding: '8px 12px',
                fontSize: '0.85rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                background: unlimitedInvoices ? '#f3f4f6' : '#ffffff'
              }}
            />
          </div>
        </div>

        {/* Section D: Feature Checklist */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <ShieldCheck size={18} style={{ color: '#7c3aed' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section D: Feature Checklist
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input type="checkbox" checked={features.sync} onChange={() => handleToggleFeature('sync')} />
              Multi-Counter Realtime Data Sync
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input type="checkbox" checked={features.gst} onChange={() => handleToggleFeature('gst')} />
              Advanced GST Tax Filing Reports
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input type="checkbox" checked={features.khata} onChange={() => handleToggleFeature('khata')} />
              Customer Khata / Udhar Management
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input type="checkbox" checked={features.barcode} onChange={() => handleToggleFeature('barcode')} />
              Barcode Label Printing
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input type="checkbox" checked={features.branding} onChange={() => handleToggleFeature('branding')} />
              Custom Branding on Invoices
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#374151', cursor: 'pointer', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
              <input type="checkbox" checked={features.support} onChange={() => handleToggleFeature('support')} />
              Priority 24/7 Phone Support
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifycontent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/admin/plans')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              background: '#ffffff',
              color: '#4b5563',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel / Discard
          </button>
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.25)'
            }}
          >
            Save & Publish Plan
          </button>
        </div>

      </form>

      {/* Right Column: Sticky Live Pricing Card Preview */}
      <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #ffffff, #fafafa)',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          padding: '30px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative'
        }}>
          {/* Badge */}
          {badge.trim() && (
            <span style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#7c3aed',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '99px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {badge}
            </span>
          )}

          {/* Pricing Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Preview Live Card
            </span>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              {planName.trim() || 'Untitled SaaS Plan'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', minHeight: '32px' }}>
              {description.trim() || 'Provide a description to display dynamic tier benefits on the customer checkout page.'}
            </span>
          </div>

          <div style={{ height: '1px', background: '#e5e7eb' }} />

          {/* Dynamic Billing Switch Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#111827' }}>
                ₹{(billingFrequency === 'MONTHLY' ? (parseFloat(monthlyPrice) || 0) : (parseFloat(yearlyPrice) || 0)).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>
                / {billingFrequency === 'MONTHLY' ? 'month' : 'year'}
              </span>
            </div>
            {trialDays !== '0' && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
                Includes {trialDays} Days Free Trial period
              </span>
            )}
          </div>

          {/* Quotas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tier Quota Quotas
            </span>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Terminals Limit</span>
                <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>
                  {unlimitedTerminals ? 'Unlimited' : `${terminalLimit} POS`}
                </span>
              </div>

              <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Staff Cashiers</span>
                <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>
                  {staffLimit} Max
                </span>
              </div>
            </div>

            <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Monthly Invoice Quota</span>
              <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>
                {unlimitedInvoices ? 'Unlimited Invoices' : `${parseInt(invoiceLimit).toLocaleString()} / month`}
              </span>
            </div>
          </div>

          {/* Features checkmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Features Included
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {features.sync && <CheckmarkRow label="Multi-Counter Sync" />}
              {features.gst && <CheckmarkRow label="Advanced GST Reports" />}
              {features.khata && <CheckmarkRow label="Khata / Udhar Ledger" />}
              {features.barcode && <CheckmarkRow label="Barcode Printing" />}
              {features.branding && <CheckmarkRow label="Invoice Custom Branding" />}
              {features.support && <CheckmarkRow label="Priority 24/7 Support" />}
              {Object.values(features).filter(Boolean).length === 0 && (
                <span style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>No features selected</span>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function CheckmarkRow({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#374151', fontWeight: 550 }}>
      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <span>{label}</span>
    </div>
  );
}
