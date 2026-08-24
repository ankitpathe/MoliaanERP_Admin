import React, { useState } from 'react';
import { getBranches } from '../../../services/branchService';

export default function BranchFormModal({ branch, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    code: branch?.code || '',
    type: branch?.type || 'Retail Store',
    manager: branch?.manager || '',
    phone: branch?.phone || '',
    email: branch?.email || '',
    street: branch?.street || '',
    city: branch?.city || '',
    state: branch?.state || '',
    pincode: branch?.pincode || '',
    gstin: branch?.gstin || '',
    status: branch?.status || 'Active',
    isDefault: branch?.isDefault || false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Branch Name is required.';
    
    if (!formData.code.trim()) {
      newErrors.code = 'Branch Code is required.';
    } else {
      const existing = getBranches();
      const isDuplicate = existing.some(b => b.code.toUpperCase() === formData.code.trim().toUpperCase() && b.id !== branch?.id);
      if (isDuplicate) {
        newErrors.code = 'A branch with this code already exists.';
      }
    }

    if (!formData.manager.trim()) newErrors.manager = 'Manager Name is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Contact Phone is required.';
    
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address format.';
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
    if (validate()) {
      setIsSubmitting(true);
      setTimeout(() => {
        onSave(formData);
        setIsSubmitting(false);
      }, 400);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Group 1: General Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '4px', margin: 0 }}>
          Location Profile
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Branch Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Chhindwara Outlet"
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: `1px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.name && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{errors.name}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Branch Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. STR-CHH"
              disabled={!!branch}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: `1px solid ${errors.code ? '#ef4444' : '#e5e7eb'}`, outline: 'none', background: branch ? '#e5e7eb' : '#fff' }}
            />
            {errors.code && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{errors.code}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Branch Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
            >
              <option value="Head Office">Head Office</option>
              <option value="Retail Store">Retail Store</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Outlet">Outlet</option>
              <option value="Regional Office">Regional Office</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Contact Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              placeholder="e.g. store@moliaan.com"
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: `1px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.email && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{errors.email}</span>}
          </div>
        </div>
      </div>

      {/* Group 2: Contact Person */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '4px', margin: 0 }}>
          Contact Person
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Manager Name *</label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData(p => ({ ...p, manager: e.target.value }))}
              placeholder="e.g. Priya Verma"
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: `1px solid ${errors.manager ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.manager && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{errors.manager}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Mobile Number *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
              placeholder="e.g. 9876543210"
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: `1px solid ${errors.phone ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.phone && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{errors.phone}</span>}
          </div>
        </div>
      </div>

      {/* Group 3: Address & GSTIN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '4px', margin: 0 }}>
          Address & Taxation
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Street Address</label>
          <input
            type="text"
            value={formData.street}
            onChange={(e) => setFormData(p => ({ ...p, street: e.target.value }))}
            placeholder="Main Road, near complex"
            style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData(p => ({ ...p, pincode: e.target.value }))}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>State GSTIN (Optional)</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
              placeholder="e.g. 23ABCDE1234F1Z5"
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: `1px solid ${errors.gstin ? '#ef4444' : '#e5e7eb'}`, outline: 'none' }}
            />
            {errors.gstin && <span style={{ fontSize: '0.7rem', color: '#ef4444' }}>{errors.gstin}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>Location Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
              style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', background: '#fff' }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Default Checkbox */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#374151', cursor: 'pointer', marginTop: '4px' }}>
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
          style={{ width: '16px', height: '16px', accentColor: '#7c7a6e' }}
        />
        <span>Mark as Primary / Default Branch (Only one active primary location permitted)</span>
      </label>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '8px' }}>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
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
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            fontSize: '0.85rem',
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
      </div>

      <style>{`
        @media (max-width: 768px) {
          .responsive-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </form>
  );
}
