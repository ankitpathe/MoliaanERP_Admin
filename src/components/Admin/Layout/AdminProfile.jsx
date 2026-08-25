import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export default function AdminProfile({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const toast = useToast();

  const storedSession = JSON.parse(localStorage.getItem('erp_user_session') || '{}');
  const adminInfo = {
    name: storedSession.name || 'Administrator',
    role: storedSession.role || 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&h=128&auto=format&fit=crop',
  };

  const handleLogout = () => {
    setIsOpen(false);
    localStorage.removeItem('erp_user_session');
    toast.showInfo('Logged Out', 'Successfully logged out of the Administrator session.');
    navigate('/');
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px 8px',
          cursor: 'pointer',
          borderRadius: '12px',
          border: 'none',
          background: 'transparent',
          textAlign: 'left'
        }}
      >
        <img 
          src={adminInfo.avatar} 
          alt={adminInfo.name} 
          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '70px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {adminInfo.name}
            <ChevronDown size={14} style={{ color: '#9ca3af', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </span>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '-2px' }}>
            {adminInfo.role}
          </span>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)} 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
          />
          <div 
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '200px',
              padding: '8px',
              zIndex: 999,
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 500 }}>Active Session</span>
            </div>

            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/profile');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#374151',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.85rem',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User size={16} style={{ color: '#4b5563' }} />
              Profile
            </button>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/master-data');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#374151',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.85rem',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Settings size={16} style={{ color: '#4b5563' }} />
              Settings
            </button>

            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#ef4444',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.85rem',
                borderTop: '1px solid #f3f4f6',
                marginTop: '4px',
                width: '100%'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
