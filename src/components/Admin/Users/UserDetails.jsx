import React from 'react';
import { User, Shield, CheckCircle, Mail, Calendar, Clock } from 'lucide-react';

export default function UserDetails({ user, onClose }) {
  if (!user) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '480px',
      background: '#ffffff',
      padding: '24px',
      borderRadius: '16px',
      border: '1px solid #e5e7eb'
    }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#f5ebe1',
          color: '#7c7a6e',
          fontWeight: 700,
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>{user.name}</h3>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>@{user.username}</span>
        </div>
      </div>

      {/* Details list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Mail size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '90px' }}>Email:</span>
          <strong style={{ color: '#374151' }}>{user.email}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Shield size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '90px' }}>Access Role:</span>
          <strong style={{ color: '#374151' }}>{user.role}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <CheckCircle size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '90px' }}>Status:</span>
          <span style={{
            fontSize: '0.725rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '99px',
            background: user.status === 'Active' ? '#ecfdf5' : '#fef2f2',
            color: user.status === 'Active' ? '#059669' : '#dc2626'
          }}>
            {user.status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Calendar size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '90px' }}>Created on:</span>
          <strong style={{ color: '#374151' }}>{user.createdDate}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Clock size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '90px' }}>Last Active:</span>
          <strong style={{ color: '#374151' }}>{user.lastActive}</strong>
        </div>
      </div>

      {/* Permissions overview */}
      <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>ROLE PERMISSIONS</span>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0, lineHeight: '1.4' }}>
          {user.role === 'Administrator' 
            ? 'Full access to POS billing, stock configuration, backups, settings, activity tracking, employee payrolls, and security audits.' 
            : user.role === 'Manager'
              ? 'Access to transactional operations, ledgers, POS billing, inventory adjustments, and basic report outputs.'
              : 'POS billing terminals operations, daybook entry configurations, and product barcode search access.'
          }
        </p>
      </div>

      <button
        onClick={onClose}
        style={{
          padding: '10px',
          background: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#4b5563',
          cursor: 'pointer',
          marginTop: '8px'
        }}
      >
        Close View
      </button>

    </div>
  );
}
