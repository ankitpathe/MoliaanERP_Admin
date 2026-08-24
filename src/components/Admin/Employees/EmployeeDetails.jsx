import React from 'react';
import { Mail, Phone, Calendar, Briefcase, Landmark, Clock } from 'lucide-react';

export default function EmployeeDetails({ employee, onClose }) {
  if (!employee) return null;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Active': 
        return { background: '#ecfdf5', color: '#059669' };
      case 'On Leave': 
        return { background: '#fffbeb', color: '#d97706' };
      case 'Inactive': 
        return { background: '#f9fafb', color: '#9ca3af' };
      default: 
        return { background: '#f3f4f6', color: '#4b5563' };
    }
  };

  const badgeStyle = getStatusBadgeStyle(employee.status);

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
          background: '#e0f2fe',
          color: '#0284c7',
          fontWeight: 700,
          fontSize: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', margin: 0 }}>{employee.name}</h3>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>ID: {employee.id}</span>
        </div>
      </div>

      {/* Details list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Mail size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '100px' }}>Email:</span>
          <strong style={{ color: '#374151' }}>{employee.email}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Phone size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '100px' }}>Phone:</span>
          <strong style={{ color: '#374151' }}>{employee.phone}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Landmark size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '100px' }}>Department:</span>
          <strong style={{ color: '#374151' }}>{employee.department}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Briefcase size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '100px' }}>Designation:</span>
          <strong style={{ color: '#374151' }}>{employee.designation}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Calendar size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '100px' }}>Joining Date:</span>
          <strong style={{ color: '#374151' }}>{employee.joiningDate}</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
          <Clock size={16} style={{ color: '#9ca3af' }} />
          <span style={{ color: '#6b7280', width: '100px' }}>Status:</span>
          <span style={{
            fontSize: '0.725rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '99px',
            ...badgeStyle
          }}>
            {employee.status}
          </span>
        </div>
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
