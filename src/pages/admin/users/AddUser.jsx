import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createUser } from '../../../services/userService';
import { useToast } from '../../../hooks/useToast';
import UserForm from '../../../components/Admin/Users/UserForm';

export default function AddUser() {
  const navigate = useNavigate();
  const toast = useToast();

  const handleSave = (formData) => {
    try {
      createUser(formData);
      toast.showSuccess('Success', 'User account created successfully!');
      navigate('/admin/users');
    } catch (e) {
      toast.showError('Error', 'Unable to create user. Please try again.');
    }
  };

  const handleCancel = () => {
    // If fields were dirty, we can confirm discarding
    if (window.confirm('Discard unsaved changes?')) {
      navigate('/admin/users');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Back Button & Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#6b7280',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            alignSelf: 'flex-start'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
        >
          <ArrowLeft size={16} /> Back to Users
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111827', margin: 0 }}>Add New User</h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Create a new user account and assign access to the ERP.</span>
        </div>
      </div>

      {/* Form Container Card */}
      <div style={{
        background: '#ffffff',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #e5e7eb'
      }}>
        <UserForm onSave={handleSave} onCancel={handleCancel} />
      </div>

    </div>
  );
}
