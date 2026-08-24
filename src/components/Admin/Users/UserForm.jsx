import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getUsers } from '../../../services/userService';

export default function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
    role: user?.role || 'Staff',
    status: user?.status || 'Active',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    // Personal Info Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address format.';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (/\s/.test(formData.username)) {
      newErrors.username = 'Username cannot contain spaces.';
    }

    // Role / Status Validation
    if (!formData.role) newErrors.role = 'Role is required.';
    if (!formData.status) newErrors.status = 'Status is required.';

    // Duplicate Check (only when creating new user or if username/email changed)
    const existingUsers = getUsers();
    const isEmailDuplicate = existingUsers.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== user?.id);
    const isUsernameDuplicate = existingUsers.some(u => u.username.toLowerCase() === formData.username.toLowerCase() && u.id !== user?.id);

    if (isEmailDuplicate) {
      newErrors.email = 'This email is already registered.';
    }
    if (isUsernameDuplicate) {
      newErrors.username = 'This username is already taken.';
    }

    // Authentication Validation (Only for New Users)
    if (!user) {
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (formData.password.length < 4) {
        newErrors.password = 'Password must be at least 4 characters (matching PIN logic).';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      // Simulate save latency
      setTimeout(() => {
        onSave(formData);
        setIsSubmitting(false);
      }, 400);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTION 1: Personal Information */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
          Personal Information
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Diet Lam"
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="e.g. diet@moliaan.com"
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '50%' }} className="full-width-mobile">
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Username *</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="e.g. diet_lam"
            disabled={!!user}
            style={{
              padding: '10px 14px',
              fontSize: '0.875rem',
              borderRadius: '10px',
              border: `1px solid ${errors.username ? '#ef4444' : '#e5e7eb'}`,
              outline: 'none',
              background: user ? '#e5e7eb' : '#fafafa',
              color: '#1f2937',
              cursor: user ? 'not-allowed' : 'text'
            }}
          />
          {errors.username && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.username}</span>}
        </div>
      </div>

      {/* SECTION 2: Account Information */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
          Account Information
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-form-row">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
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
              <option value="Administrator">Administrator</option>
              <option value="Manager">Manager</option>
              <option value="Staff">Staff</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Status *</label>
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
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: Authentication (Only for new users) */}
      {!user && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
            Authentication
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="responsive-form-row">
            
            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>PIN / Password *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="e.g. 1234"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    fontSize: '0.875rem',
                    borderRadius: '10px',
                    border: `1px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                    outline: 'none',
                    background: '#fafafa',
                    color: '#1f2937'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Confirm PIN / Password *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="e.g. 1234"
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    fontSize: '0.875rem',
                    borderRadius: '10px',
                    border: `1px solid ${errors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                    outline: 'none',
                    background: '#fafafa',
                    color: '#1f2937'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{errors.confirmPassword}</span>}
            </div>

          </div>
        </div>
      )}

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
          {isSubmitting ? 'Saving User...' : 'Save User'}
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
          .full-width-mobile {
            max-width: 100% !important;
          }
        }
      `}</style>

    </form>
  );
}
