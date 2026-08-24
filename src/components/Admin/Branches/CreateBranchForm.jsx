import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBranch } from '../../../services/branchService';
import { useToast } from '../../../hooks/useToast';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
];

export default function CreateBranchForm() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Retail Store',
    manager: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: 'Madhya Pradesh',
    pincode: '',
    gstin: '',
    status: 'Active',
    isDefault: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Branch Name is required.';
    
    if (!formData.code.trim()) {
      newErrors.code = 'Branch Code is required.';
    } else if (/\s/.test(formData.code)) {
      newErrors.code = 'Branch Code cannot contain spaces.';
    }

    if (!formData.manager.trim()) newErrors.manager = 'Manager Name is required.';
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Manager Contact Number is required.';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Invalid phone format (must be a 10-digit number).';
    }

    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address format.';
    }

    if (!formData.city.trim()) newErrors.city = 'City is required.';
    if (!formData.state) newErrors.state = 'State selection is required.';
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Invalid pincode format (must be a 6-digit number).';
    }

    if (formData.gstin.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gstin.toUpperCase())) {
        newErrors.gstin = 'Invalid GSTIN format (15 characters uppercase alpha-numeric).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.showError('Validation Error', 'Please check and resolve the errors.');
      return;
    }

    setIsSubmitting(true);
    try {
      createBranch(formData);
      toast.showSuccess('Success', `Branch "${formData.name}" added successfully!`);
      navigate('/admin/branches');
    } catch (err) {
      toast.showError('Error', err.message || 'Unable to create branch location.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
      
      {/* CARD 1: Basic Information */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', margin: 0 }}>
          BASIC LOCATION DETAILS
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Branch Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Delhi Central Outlet"
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.name && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Branch Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. BR-DEL-01"
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.code ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.code && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.code}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Branch Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
            >
              <option value="Head Office">Head Office</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Outlet">Outlet</option>
              <option value="Regional Office">Regional Office</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer', marginTop: '6px' }}>
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
            style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
          />
          <span>Set as Primary / Head Office Location</span>
        </label>
      </div>

      {/* CARD 2: Contact Details */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', margin: 0 }}>
          MANAGEMENT & CONTACT DETAILS
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }} className="responsive-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Branch Manager *</label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData(p => ({ ...p, manager: e.target.value }))}
              placeholder="e.g. Priya Verma"
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.manager ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.manager && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.manager}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Manager Contact Number *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 9827364510"
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.phone ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.phone && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.phone}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '50%' }} className="full-width-mobile">
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Branch Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
            placeholder="e.g. delhi@moliaan.com"
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
          />
          {errors.email && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.email}</span>}
        </div>
      </div>

      {/* CARD 3: Location & Tax */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', margin: 0 }}>
          LOCATION ADDRESS & TAX INFO
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Street Address / Building</label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => setFormData(p => ({ ...p, street: e.target.value }))}
            placeholder="12, Parliament Street"
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }} className="responsive-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
              placeholder="e.g. New Delhi"
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.city ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.city && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.city}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>State *</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
            >
              {INDIAN_STATES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Pincode *</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData(p => ({ ...p, pincode: e.target.value }))}
              placeholder="e.g. 110001"
              style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.pincode ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.pincode && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.pincode}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '50%' }} className="full-width-mobile">
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>State GSTIN (Optional)</label>
          <input
            type="text"
            value={formData.gstin}
            onChange={(e) => setFormData(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
            placeholder="e.g. 07ABCDE1234F1Z5"
            style={{ padding: '10px', fontSize: '0.875rem', borderRadius: '8px', border: `1px solid ${errors.gstin ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
          />
          {errors.gstin && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.gstin}</span>}
        </div>
      </div>

      {/* STICKY BOTTOM ACTIONS BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '284px',
        right: 0,
        background: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        zIndex: 100
      }} className="sticky-action-bar">
        <button
          type="button"
          onClick={() => navigate('/admin/branches')}
          style={{
            padding: '10px 20px',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: '#f3f4f6',
            color: '#4b5563',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            fontSize: '0.875rem',
            fontWeight: 600,
            background: '#7c7a6e',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? 'Saving Branch...' : 'Save Branch'}
        </button>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .sticky-action-bar {
            left: 0 !important;
          }
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
          .full-width-mobile {
            max-width: 100% !important;
          }
        }
      `}</style>

    </form>
  );
}
