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

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good morning';
    if (hrs < 17) return 'Good afternoon';
    return 'Good evening';
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
          gap: '8px',
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
          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '70px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '3px' }}>
            {adminInfo.name}
            <ChevronDown size={12} style={{ color: '#9ca3af', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
          </span>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '-2px', fontWeight: 600 }}>
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
              width: '210px',
              padding: '12px 8px 8px 8px',
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
            {/* dynamic greeting */}
            <div style={{ padding: '4px 8px 10px 8px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>
                {getGreeting()},
              </span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280', fontWeight: 500 }}>
                {adminInfo.name}
              </span>
            </div>

            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/admin/users');
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
                fontSize: '0.8rem',
                width: '100%',
                fontWeight: 600
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <User size={14} style={{ color: '#4b5563' }} />
              My Profile
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
                fontSize: '0.8rem',
                width: '100%',
                fontWeight: 600
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Settings size={14} style={{ color: '#4b5563' }} />
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
                fontSize: '0.8rem',
                width: '100%',
                fontWeight: 600,
                borderTop: '1px solid #f3f4f6',
                marginTop: '4px',
                paddingTop: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={14} style={{ color: '#ef4444' }} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
