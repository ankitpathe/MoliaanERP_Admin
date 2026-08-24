import React, { useState } from 'react';
import { getRoles } from '../../../services/roleService';

export default function RoleFormModal({ role, isDuplicate, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: isDuplicate ? `${role?.name} Copy` : (role?.name || ''),
    description: role?.description || '',
    copyFromId: isDuplicate ? (role?.id || '') : ''
  });
  const [errors, setErrors] = useState({});
  const allRoles = getRoles();

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Role Name is required.';
    } else {
      const nameExists = allRoles.some(r => r.name.toLowerCase() === formData.name.trim().toLowerCase());
      if (nameExists) {
        newErrors.name = 'A role with this name already exists.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        copyFromId: formData.copyFromId
      });
    }
  };

  return (
    <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', maxWidth: '400px', width: '90vw' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
        {isDuplicate ? 'Duplicate Role' : (role ? 'Edit Role Details' : 'Create Access Role')}
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Role Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. Accountant"
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

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe role responsibilities..."
            rows={3}
            style={{
              padding: '10px 14px',
              fontSize: '0.875rem',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              outline: 'none',
              background: '#fafafa',
              color: '#1f2937',
              resize: 'none'
            }}
          />
        </div>

        {/* Copy permissions dropdown (only when creating new and not duplicating directly) */}
        {!role && !isDuplicate && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Copy Permissions From</label>
            <select
              value={formData.copyFromId}
              onChange={(e) => setFormData(prev => ({ ...prev, copyFromId: e.target.value }))}
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
              <option value="">Start from scratch (No permissions)</option>
              {allRoles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="submit"
            style={{
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
            Create
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

      </form>
    </div>
  );
}
