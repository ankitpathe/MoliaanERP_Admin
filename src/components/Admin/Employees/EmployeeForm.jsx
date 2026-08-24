import React, { useState } from 'react';
import { getEmployees } from '../../../services/employeeService';

export default function EmployeeForm({ employee, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: employee?.id || '',
    name: employee?.name || '',
    designation: employee?.designation || '',
    department: employee?.department || 'Sales',
    email: employee?.email || '',
    phone: employee?.phone || '',
    joiningDate: employee?.joiningDate 
      ? (employee.joiningDate.includes('-') ? employee.joiningDate : new Date(employee.joiningDate).toISOString().split('T')[0]) 
      : new Date().toISOString().split('T')[0],
    status: employee?.status || 'Active'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.id.trim()) {
      newErrors.id = 'Employee ID is required.';
    } else {
      const existing = getEmployees();
      const isDuplicate = existing.some(e => e.id.toLowerCase() === formData.id.trim().toLowerCase() && e.id !== employee?.id);
      if (isDuplicate) {
        newErrors.id = 'This Employee ID is already registered.';
      }
    }

    if (!formData.name.trim()) newErrors.name = 'Full Name is required.';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address format.';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* SECTION 1: Personal Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '4px' }}>
          Personal Details
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Employee ID *</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              placeholder="e.g. EMP005"
              disabled={!!employee}
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: `1px solid ${errors.id ? '#ef4444' : '#e5e7eb'}`,
                outline: 'none',
                background: employee ? '#e5e7eb' : '#fafafa',
                color: '#1f2937',
                cursor: employee ? 'not-allowed' : 'text'
              }}
            />
            {errors.id && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.id}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Arjun Sharma"
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: `1px solid ${errors.name ? '#ef4444' : '#e5e7eb'}`,
                outline: 'none',
                background: '#fafafa',
                color: '#1f2937'
              }}
            />
            {errors.name && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.name}</span>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="e.g. arjun@moliaan.com"
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: `1px solid ${errors.email ? '#ef4444' : '#e5e7eb'}`,
                outline: 'none',
                background: '#fafafa',
                color: '#1f2937'
              }}
            />
            {errors.email && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.email}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Phone Number *</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="e.g. +91 98765 43210"
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: `1px solid ${errors.phone ? '#ef4444' : '#e5e7eb'}`,
                outline: 'none',
                background: '#fafafa',
                color: '#1f2937'
              }}
            />
            {errors.phone && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.phone}</span>}
          </div>
        </div>
      </div>

      {/* SECTION 2: Employment Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '4px' }}>
          Employment Details
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Designation *</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
              placeholder="e.g. Sales Executive"
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: `1px solid ${errors.designation ? '#ef4444' : '#e5e7eb'}`,
                outline: 'none',
                background: '#fafafa',
                color: '#1f2937'
              }}
            />
            {errors.designation && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.designation}</span>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                background: '#ffffff',
                color: '#1f2937',
                cursor: 'pointer'
              }}
            >
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Engineering">Engineering</option>
              <option value="Accounts">Accounts</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Joining Date</label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                background: '#fafafa',
                color: '#1f2937'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              style={{
                padding: '10px 14px',
                fontSize: '0.875rem',
                borderRadius: '10px',
                border: '1px solid #e5e7eb',
                outline: 'none',
                background: '#ffffff',
                color: '#1f2937',
                cursor: 'pointer'
              }}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
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
          {isSubmitting ? 'Saving Staff...' : 'Save Staff'}
        </button>
        <button
          type="button"
          onClick={onCancel}
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
