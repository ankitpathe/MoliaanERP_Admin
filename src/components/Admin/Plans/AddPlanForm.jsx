import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { ShieldCheck, Layers, Landmark, CreditCard, ChevronRight, HelpCircle } from 'lucide-react';
import Select from '../../ui/Select';

export default function AddPlanForm() {
  const navigate = useNavigate();
  const toast = useToast();

  // Form State
  const [planName, setPlanName] = useState('');
  const [planCode, setPlanCode] = useState('');
  const [isPlanCodeTouched, setIsPlanCodeTouched] = useState(false);
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');

  // 6 Billing Durations Pricing Tiers State
  const [pricingTiers, setPricingTiers] = useState({
    '7d': '',
    '14d': '',
    '30d': '',
    '90d': '',
    '6m': '',
    '1y': ''
  });
  const [activeTab, setActiveTab] = useState('30d');
  const [recommendedDuration, setRecommendedDuration] = useState('30d');
  const [trialDays, setTrialDays] = useState('14');

  // Quota Limits State
  const [unlimitedTerminals, setUnlimitedTerminals] = useState(false);
  const [terminalLimit, setTerminalLimit] = useState('');
  const [staffLimit, setStaffLimit] = useState('');
  const [unlimitedInvoices, setUnlimitedInvoices] = useState(false);
  const [invoiceLimit, setInvoiceLimit] = useState('');

  // Feature Checklist
  const [features, setFeatures] = useState({
    sync: false,
    gst: false,
    khata: false,
    barcode: false,
    branding: false,
    support: false
  });

  const durationLabels = {
    '7d': '7 Days',
    '14d': '14 Days',
    '30d': '30 Days',
    '90d': '90 Days',
    '6m': '6 Months',
    '1y': '1 Year'
  };

  const nameSuggestions = {
    '7d': ["7-Day Trial Pack", "Weekly Starter", "Quick Start Plan"],
    '14d': ["14-Day Starter", "Fortnight Plan", "Two-Week Trial"],
    '30d': ["Monthly Starter", "Monthly Pro", "Monthly Business"],
    '90d': ["Quarterly Pro", "90-Day Growth Plan", "Quarterly Business"],
    '6m': ["Half-Yearly Plan", "6-Month Business", "Half-Yearly Pro"],
    '1y': ["Annual Elite", "Yearly Business", "Annual Pro Plan"]
  };

  const durationDays = {
    '7d': 7,
    '14d': 14,
    '30d': 30,
    '90d': 90,
    '6m': 180,
    '1y': 365
  };

  // Dynamic slug / plan code generation
  const handleNameChange = (name) => {
    setPlanName(name);
    if (!isPlanCodeTouched) {
      suggestPlanCode(name, activeTab);
    }
  };

  const suggestPlanCode = (nameVal, tabVal) => {
    const firstWord = nameVal.trim().split(' ')[0] || '';
    const cleanWord = firstWord.toUpperCase().replace(/[^A-Z0-9]+/g, '');
    const suffix = tabVal.toUpperCase();
    if (cleanWord) {
      setPlanCode(`PLAN-${cleanWord}-${suffix}`);
    } else {
      setPlanCode('');
    }
  };

  // Keep code synced with active tab if untouched
  useEffect(() => {
    if (!isPlanCodeTouched && planName.trim()) {
      suggestPlanCode(planName, activeTab);
    }
  }, [activeTab]);

  // Savings % Calculation compared to 7d base rate scaled linearly
  const getSavingsPercentage = (durKey) => {
    const basePrice = parseFloat(pricingTiers['7d']);
    const targetPrice = parseFloat(pricingTiers[durKey]);
    if (!basePrice || !targetPrice || durKey === '7d') return 0;
    
    const days = durationDays[durKey];
    const scaledBase = (basePrice / 7) * days;
    if (targetPrice >= scaledBase) return 0;
    return Math.round(((scaledBase - targetPrice) / scaledBase) * 100);
  };

  const handleToggleFeature = (key) => {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!planName.trim()) {
      toast.showError('Validation Error', 'Plan Name is required.');
      return;
    }

    // Step 5: At least one duration's price must be filled
    const filledTiers = Object.entries(pricingTiers).filter(([_, val]) => val.trim() !== '');
    if (filledTiers.length === 0) {
      toast.showError('Validation Error', 'Add at least one pricing option.');
      return;
    }

    // Format all prices to float
    const cleanPricing = {};
    Object.entries(pricingTiers).forEach(([k, v]) => {
      if (v.trim() !== '') {
        cleanPricing[k] = parseFloat(v);
      }
    });

    const selectedFeaturesCount = Object.values(features).filter(Boolean).length;
    if (selectedFeaturesCount === 0) {
      toast.showError('Validation Error', 'Please select at least 1 feature.');
      return;
    }

    // Fallbacks for display compat
    const samplePrice = cleanPricing['30d'] || Object.values(cleanPricing)[0] || 0;

    const newPlan = {
      id: planCode || `PLAN-${Date.now().toString().slice(-4)}`,
      title: planName.trim(),
      code: planCode,
      badge: badge.trim(),
      description: description.trim(),
      // Legacy compatibility keys
      monthlyPrice: cleanPricing['30d'] || samplePrice,
      yearlyPrice: cleanPricing['1y'] || (samplePrice * 10),
      billingFrequency: cleanPricing['30d'] ? 'MONTHLY' : 'YEARLY',
      // New schema keys
      pricingTiers: cleanPricing,
      recommendedDuration,
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

    logActivity({
      activityType: 'PLAN_CREATED',
      module: 'Plans',
      actionDescription: `Created new SaaS pricing tier "${planName}" with multi-duration options. [Code: ${planCode}]`
    });

    toast.showSuccess('Plan Published', `SaaS plan "${planName}" is now live.`);
    navigate('/admin/plans');
  };

  return (
    <div className="responsive-asym-cols">
      
      {/* Left Column: Input Form with sections */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section A: Basic Plan Details */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Layers size={18} style={{ color: '#035096' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section A: Basic Plan Details
            </span>
          </div>

          <div className="responsive-two-cols">
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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                {(nameSuggestions[activeTab] || []).map(suggestion => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleNameChange(suggestion)}
                    style={{
                      padding: '2px 8px',
                      fontSize: '0.675rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      border: '1px solid #ddd6fe',
                      background: '#f5f3ff',
                      color: '#035096',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ede9fe';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f5f3ff';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Plan Code / Identifier</span>
              <input
                type="text"
                value={planCode}
                onChange={e => {
                  setPlanCode(e.target.value);
                  setIsPlanCodeTouched(true);
                }}
                placeholder="Suggested dynamically"
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#ffffff' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Badge / Tag (Optional)</span>
            <input
              type="text"
              placeholder="e.g. Best Value, Recommended"
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
            <CreditCard size={18} style={{ color: '#035096' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section B: Pricing & Billing Tiers
            </span>
          </div>

          {/* 6 Billing Durations Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Billing Duration Options</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.entries(durationLabels).map(([key, label]) => {
                const isSelected = activeTab === key;
                const hasPrice = pricingTiers[key] !== '';
                const isRecommended = recommendedDuration === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '30px',
                      border: isSelected ? '2px solid #035096' : '1px solid #d1d5db',
                      background: isSelected ? '#f5f3ff' : '#ffffff',
                      color: isSelected ? '#035096' : '#374151',
                      fontSize: '0.775rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s'
                    }}
                  >
                    {isRecommended && <span style={{ color: '#f59e0b' }}>★</span>}
                    {label}
                    {hasPrice && <span style={{ color: '#10b981', fontSize: '0.7rem' }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Tab Price Input with Auto-discount calculation badge */}
          <div className="responsive-asym-cols">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                Price for {durationLabels[activeTab]} (₹) *
                {getSavingsPercentage(activeTab) > 0 && (
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    Save {getSavingsPercentage(activeTab)}%
                  </span>
                )}
              </span>
              <input
                type="number"
                placeholder="Enter price amount"
                value={pricingTiers[activeTab]}
                onChange={e => {
                  const val = e.target.value;
                  setPricingTiers(prev => ({ ...prev, [activeTab]: val }));
                }}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Free Trial Period</span>
              <Select
                value={trialDays}
                onChange={e => setTrialDays(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="0">No Trial</option>
                <option value="3">3 Days Trial</option>
                <option value="7">7 Days Trial</option>
                <option value="14">14 Days Trial</option>
              </Select>
            </div>
          </div>

          {/* Recommended Option dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Highlight Recommended Duration</span>
            <Select 
              value={recommendedDuration}
              onChange={e => setRecommendedDuration(e.target.value)}
            >
              {Object.entries(durationLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Section C: Quota & Terminal Limits */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Landmark size={18} style={{ color: '#035096' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section C: Quota & Terminal Limits
            </span>
          </div>

          <div className="responsive-two-cols">
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
                placeholder="e.g. 3"
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
              placeholder="e.g. 1000"
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
            <ShieldCheck size={18} style={{ color: '#035096' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Section D: Feature Checklist
            </span>
          </div>

          <div className="responsive-two-cols">
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
              background: 'linear-gradient(to right, #035096, #3fa9f5)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(3, 80, 150, 0.25)'
            }}
          >
            Save & Publish Plan
          </button>
        </div>

      </form>

      {/* Right Column: Premium Live Pricing Card Preview */}
      <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
        <div style={{
          background: 'linear-gradient(to bottom right, #ffffff, #fafafa)',
          borderRadius: '20px',
          border: '1px solid #e5e7eb',
          padding: '30px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative'
        }}>
          {/* Best Value Star Ribbon */}
          {badge.trim() ? (
            <span style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: '#035096',
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
          ) : (
            recommendedDuration === activeTab && (
              <span style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f59e0b',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '99px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                ★ Best Value
              </span>
            )
          )}

          {/* Pricing Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Preview Live Card
            </span>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: planName.trim() ? '#111827' : '#9ca3af', margin: 0 }}>
              {planName.trim() || 'Your Plan Name'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: description.trim() ? '#6b7280' : '#9ca3af', minHeight: '32px' }}>
              {description.trim() || 'Provide a description to display dynamic tier benefits on the customer checkout page.'}
            </span>
          </div>

          {/* Preview Tabs to switch between duration prices */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>
            {Object.entries(durationLabels).map(([key, label]) => {
              const isActive = activeTab === key;
              const hasPrice = pricingTiers[key] !== '';
              return (
                <span
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.675rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    background: isActive ? '#f5f3ff' : 'transparent',
                    color: isActive ? '#035096' : '#9ca3af',
                    opacity: hasPrice ? 1 : 0.4
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>

          {/* Premium price display */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)', 
            border: '1px solid #ddd6fe', 
            borderRadius: '12px', 
            padding: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#035096' }}>
                ₹{pricingTiers[activeTab] ? parseFloat(pricingTiers[activeTab]).toLocaleString('en-IN') : '0'}
              </span>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 700 }}>
                / {durationLabels[activeTab]}
              </span>
              {getSavingsPercentage(activeTab) > 0 && (
                <span style={{ background: '#10b981', color: '#ffffff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '99px', fontWeight: 800, marginLeft: '6px' }}>
                  Save {getSavingsPercentage(activeTab)}%
                </span>
              )}
            </div>
            {pricingTiers[activeTab] && (
              <span style={{ fontSize: '0.725rem', color: '#6b7280', fontWeight: 600 }}>
                ≈ ₹{(parseFloat(pricingTiers[activeTab]) / durationDays[activeTab]).toFixed(0)} / day equivalent
              </span>
            )}
            {trialDays !== '0' && (
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>
                Includes {trialDays} Days Free Trial
              </span>
            )}
          </div>

          {/* Quotas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tier Quota Quotas
            </span>
            
            <div className="responsive-two-cols">
              <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Terminals Limit</span>
                <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>
                  {unlimitedTerminals ? 'Unlimited' : `${terminalLimit || 0} POS`}
                </span>
              </div>

              <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Staff Cashiers</span>
                <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>
                  {staffLimit || 0} Max
                </span>
              </div>
            </div>

            <div style={{ background: '#f3f4f6', padding: '8px 12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.65rem', color: '#6b7280', fontWeight: 600 }}>Monthly Invoice Quota</span>
              <span style={{ fontSize: '0.85rem', color: '#111827', fontWeight: 700 }}>
                {unlimitedInvoices ? 'Unlimited Invoices' : `${parseInt(invoiceLimit || 0).toLocaleString()} / month`}
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
