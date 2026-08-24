import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Percent, Landmark, Globe, Save } from 'lucide-react';
import { logActivity } from '../../../services/activityLogger';
import { useToast } from '../../../hooks/useToast';

const STORAGE_KEY = 'erp_business_profile';

const DEFAULT_PROFILE = {
  companyName: 'Moliaan Retail Supermart',
  legalName: 'Moliaan FMCG Private Limited',
  businessType: 'Private Limited',
  logoUrl: '',
  tagline: 'Your Gateway to Wholesale and Retail Quality Products',
  primaryEmail: 'admin@moliaan.com',
  primaryPhone: '9827364510',
  secondaryPhone: '07162-234567',
  website: 'www.moliaan.com',
  street: 'Main Road, Civil Lines',
  city: 'Chhindwara',
  state: 'Madhya Pradesh',
  pincode: '480001',
  country: 'India',
  gstin: '23ABCDE1234F1Z5',
  pan: 'ABCDE1234F',
  cin: 'U51909MP2024PTC067890',
  financialYearStart: 'April 1',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata',
  bankName: 'State Bank of India',
  bankHolder: 'Moliaan FMCG Private Limited',
  bankAccNo: '330099887711',
  bankIfsc: 'SBIN0000355',
  bankBranch: 'Chhindwara Main Branch',
  upiId: 'moliaan@sbi'
};

export default function BusinessProfileForm() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('identity');
  const [formData, setFormData] = useState(DEFAULT_PROFILE);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFormData(JSON.parse(stored));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
      }
    } catch (e) {
      console.error('Error loading business profile:', e);
    }
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company Name is required.';
    }
    if (!formData.primaryEmail.trim()) {
      newErrors.primaryEmail = 'Primary Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.primaryEmail)) {
      newErrors.primaryEmail = 'Invalid email syntax.';
    }
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = 'Primary Phone is required.';
    }

    // GSTIN (15 character alpha-numeric uppercase)
    if (formData.gstin.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gstin.toUpperCase())) {
        newErrors.gstin = 'Invalid GSTIN format (e.g. 23ABCDE1234F1Z5).';
      }
    }

    // PAN (10 character uppercase)
    if (formData.pan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan.toUpperCase())) {
        newErrors.pan = 'Invalid PAN format (e.g. ABCDE1234F).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.showError('Validation Failed', 'Please fix the errors before saving.');
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      
      // Sync to erp_store_profile for backwards compatibility with operational settings
      const mappedStoreProfile = {
        storeName: formData.companyName,
        tagline: formData.tagline,
        logoUrl: formData.logoUrl,
        phone: formData.primaryPhone,
        email: formData.primaryEmail,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        gstin: formData.gstin,
        fssai: formData.cin || '',
        pan: formData.pan,
        upiId: formData.upiId,
        upiQrUrl: null,
        bankName: formData.bankName,
        bankHolder: formData.bankHolder,
        bankAccNo: formData.bankAccNo,
        bankIfsc: formData.bankIfsc,
        printerFormat: '80mm Thermal Roll',
        terms: 'Items can be returned within 3 days. Valid tax invoice required.',
        footerGreeting: 'Thank you for your business!'
      };
      localStorage.setItem('erp_store_profile', JSON.stringify(mappedStoreProfile));

      // Telemetry log
      logActivity({
        activityType: 'UPDATE',
        module: 'Business Settings',
        actionDescription: `Updated business profile: ${formData.companyName}`,
        newValue: formData
      });

      toast.showSuccess('Success', 'Business profile saved successfully!');
    } catch (err) {
      toast.showError('Error', 'Unable to save business settings.');
    }
  };

  const tabs = [
    { id: 'identity', label: 'Company Identity', icon: Building2 },
    { id: 'contact', label: 'Contact & Address', icon: MapPin },
    { id: 'tax', label: 'Tax & Legal Info', icon: Percent },
    { id: 'financial', label: 'Financial & Localization', icon: Globe },
    { id: 'bank', label: 'Bank Details', icon: Landmark }
  ];

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }} className="business-panel-split">
      
      {/* Sidebar Tabs */}
      <div style={{
        width: '260px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: '#ffffff',
        padding: '16px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        alignSelf: 'flex-start'
      }} className="business-left-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? '#f5ebe1' : 'transparent',
                color: activeTab === tab.id ? '#7c7a6e' : '#4b5563',
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content Cards */}
      <div style={{
        flex: 1,
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Render Active Section */}
        {activeTab === 'identity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Company Identity Settings
            </h3>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                overflow: 'hidden'
              }}>
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <Building2 size={28} style={{ color: '#94a3b8' }} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  Upload Company Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                </label>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Recommended: PNG format with transparent background</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Company / Brand Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData(p => ({ ...p, companyName: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.companyName ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
                />
                {errors.companyName && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.companyName}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Legal Name / Entity</label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => setFormData(p => ({ ...p, legalName: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Business Structure</label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData(p => ({ ...p, businessType: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
                >
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="LLP">LLP</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Tagline / Slogan</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData(p => ({ ...p, tagline: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Contact Details & Registered Address
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Primary Email *</label>
                <input
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => setFormData(p => ({ ...p, primaryEmail: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.primaryEmail ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
                />
                {errors.primaryEmail && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.primaryEmail}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Primary Phone *</label>
                <input
                  type="text"
                  value={formData.primaryPhone}
                  onChange={(e) => setFormData(p => ({ ...p, primaryPhone: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.primaryPhone ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
                />
                {errors.primaryPhone && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.primaryPhone}</span>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Secondary Contact / Landline</label>
                <input
                  type="text"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData(p => ({ ...p, secondaryPhone: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Website URL</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563' }}>Address Details</span>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Street Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData(p => ({ ...p, street: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="responsive-grid">
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
                    style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
                    style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData(p => ({ ...p, pincode: e.target.value }))}
                    style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Tax & Legal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>GSTIN</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.gstin ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
                />
                {errors.gstin && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.gstin}</span>}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>PAN Number</label>
                <input
                  type="text"
                  value={formData.pan}
                  onChange={(e) => setFormData(p => ({ ...p, pan: e.target.value.toUpperCase() }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.pan ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
                />
                {errors.pan && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.pan}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '50%' }} className="full-width-mobile">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Corporate Identity Number (CIN)</label>
              <input
                type="text"
                value={formData.cin}
                onChange={(e) => setFormData(p => ({ ...p, cin: e.target.value }))}
                style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Financial & Localization Defaults
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Financial Year Start</label>
                <select
                  value={formData.financialYearStart}
                  onChange={(e) => setFormData(p => ({ ...p, financialYearStart: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
                >
                  <option value="April 1">April 1 - March 31</option>
                  <option value="January 1">January 1 - December 31</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Base Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  disabled
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#e5e7eb', color: '#6b7280', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '50%' }} className="full-width-mobile">
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Timezone</label>
              <input
                type="text"
                value={formData.timezone}
                disabled
                style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#e5e7eb', color: '#6b7280', outline: 'none' }}
              />
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0, borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              Bank Account Details (Printed on Invoices)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData(p => ({ ...p, bankName: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Account Holder Name</label>
                <input
                  type="text"
                  value={formData.bankHolder}
                  onChange={(e) => setFormData(p => ({ ...p, bankHolder: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Account Number</label>
                <input
                  type="text"
                  value={formData.bankAccNo}
                  onChange={(e) => setFormData(p => ({ ...p, bankAccNo: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>IFSC Code</label>
                <input
                  type="text"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData(p => ({ ...p, bankIfsc: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Branch Name</label>
                <input
                  type="text"
                  value={formData.bankBranch}
                  onChange={(e) => setFormData(p => ({ ...p, bankBranch: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>UPI ID (e.g. name@upi)</label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => setFormData(p => ({ ...p, upiId: e.target.value }))}
                  style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Action Footer */}
        <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 600,
              background: '#7c7a6e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >
            <Save size={16} /> Save Business Profile
          </button>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .business-panel-split {
            flex-direction: column !important;
          }
          .business-left-tabs {
            width: 100% !important;
          }
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
          .full-width-mobile {
            max-width: 100% !important;
          }
        }
      `}</style>

    </div>
  );
}
