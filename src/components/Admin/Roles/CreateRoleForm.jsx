import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRole } from '../../../services/roleService';
import { useToast } from '../../../hooks/useToast';

const MODULES = [
  'Dashboard', 'Sales', 'Inventory', 'Customers', 'Suppliers', 
  'Expenses', 'Employees', 'GST', 'Reports', 'Barcode', 'Daybook', 'Settings'
];

const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Print', 'Export', 'Approve'];

export default function CreateRoleForm() {
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState({});
  const [nameError, setNameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle individual checkbox
  const handleToggle = (module, action) => {
    setPermissions(prev => {
      const current = prev[module] || [];
      const updated = current.includes(action)
        ? current.filter(a => a !== action)
        : [...current, action];
      return { ...prev, [module]: updated };
    });
  };

  // Toggle all actions in a single module row
  const handleRowToggle = (module) => {
    const current = permissions[module] || [];
    const isAllSelected = ACTIONS.every(a => current.includes(a));
    setPermissions(prev => ({
      ...prev,
      [module]: isAllSelected ? [] : [...ACTIONS]
    }));
  };

  // Select all permissions globally
  const handleSelectAllGlobal = () => {
    const allPerms = {};
    MODULES.forEach(mod => {
      allPerms[mod] = [...ACTIONS];
    });
    setPermissions(allPerms);
  };

  // Clear all permissions globally
  const handleClearAllGlobal = () => {
    setPermissions({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Role Name is required.');
      return;
    }
    setNameError('');
    setIsSubmitting(true);

    try {
      createRole({
        name: name.trim(),
        description: description.trim(),
        permissions,
        createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        userCount: 0
      });
      toast.showSuccess('Success', 'Access role created successfully!');
      navigate('/admin/roles');
    } catch (err) {
      toast.showError('Error', err.message || 'Unable to create role.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
      
      {/* Role Details Cards */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px', margin: 0 }}>
          ROLE INFORMATION
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Role Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sales Executive"
            style={{
              padding: '10px 14px',
              fontSize: '0.875rem',
              borderRadius: '10px',
              border: `1px solid ${nameError ? '#ef4444' : '#e5e7eb'}`,
              outline: 'none',
              background: '#fafafa',
              color: '#1f2937',
              maxWidth: '400px'
            }}
          />
          {nameError && <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{nameError}</span>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe role responsibilities and authority details..."
            rows={3}
            style={{
              padding: '10px 14px',
              fontSize: '0.875rem',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              outline: 'none',
              background: '#fafafa',
              color: '#1f2937',
              resize: 'none',
              maxWidth: '600px'
            }}
          />
        </div>
      </div>

      {/* Permissions Matrix Card */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', margin: 0 }}>
            MODULE ACCESS PERMISSIONS
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleSelectAllGlobal}
              style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAllGlobal}
              style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 600, background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', color: '#ef4444' }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Module</th>
                {ACTIONS.map(act => (
                  <th key={act} style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'center' }}>
                    {act}
                  </th>
                ))}
                <th style={{ padding: '10px 12px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', textAlign: 'right' }}>Row Toggle</th>
              </tr>
            </thead>
            <tbody>
              {MODULES.map(module => {
                const checkedActions = permissions[module] || [];
                const isAllSelected = ACTIONS.every(a => checkedActions.includes(a));

                return (
                  <tr key={module} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{module}</td>
                    {ACTIONS.map(action => {
                      const isChecked = checkedActions.includes(action);
                      return (
                        <td key={action} style={{ padding: '12px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggle(module, action)}
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '4px',
                              accentColor: '#7c7a6e',
                              cursor: 'pointer'
                            }}
                          />
                        </td>
                      );
                    })}
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleRowToggle(module)}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#7c7a6e',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {isAllSelected ? 'Deselect Row' : 'Select Row'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STICKY ACTION BUTTONS BAR */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '284px', // aligned with layout sidebar bounds offset
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
          onClick={() => navigate('/admin/roles')}
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
          {isSubmitting ? 'Saving Role...' : 'Save Role'}
        </button>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .sticky-action-bar {
            left: 0 !important;
          }
        }
      `}</style>

    </form>
  );
}
