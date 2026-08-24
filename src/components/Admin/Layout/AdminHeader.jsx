import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import AdminProfile from './AdminProfile';

export default function AdminHeader({ 
  title = "Dashboard", 
  onMenuToggle,
  profileDropdownOpen,
  setProfileDropdownOpen,
  theme,
  setTheme
}) {
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isLight = theme === 'light';

  return (
    <header 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #f3f4f6',
        borderRadius: '16px 16px 0 0',
        zIndex: 40,
        gap: '24px'
      }}
    >
      {/* Title & Mobile menu button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="mobile-burger-btn"
            style={{
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#ffffff'
            }}
          >
            <Menu size={18} />
          </button>
        )}
        <h1 style={{ 
          fontSize: '1.6rem', 
          fontWeight: 700, 
          color: '#111827', 
          margin: 0,
          letterSpacing: '-0.5px'
        }}>
          {title}
        </h1>
      </div>

      {/* Center Search Input */}
      <div style={{ 
        flex: 1, 
        maxWidth: '360px', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          placeholder="Search..." 
          style={{
            width: '100%',
            padding: '8px 16px 8px 40px',
            fontSize: '0.9rem',
            borderRadius: '99px',
            border: '1px solid #e5e7eb',
            background: '#fafafa',
            outline: 'none',
            color: '#1f2937',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#9ca3af'}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
        />
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '16px', 
            color: '#9ca3af' 
          }} 
        />
      </div>

      {/* Right Actions: Notifications, Theme Switch, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Notification Bell */}
        <button
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            color: '#4b5563',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          <Bell size={18} />
        </button>

        {/* Custom Toggle Switch for Theme Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '46px',
              height: '24px',
              borderRadius: '99px',
              background: isLight ? '#7c7a6e' : '#e5e7eb',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
              transition: 'background-color 0.2s ease'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '3px',
              left: isLight ? '25px' : '3px',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
            }} />
          </button>
          <span style={{ fontSize: '0.85rem', color: '#4b5563', fontWeight: 500, minWidth: '35px' }}>
            {isLight ? 'Light' : 'Dark'}
          </span>
        </div>

        {/* Profile Dropdown */}
        <AdminProfile 
          isOpen={profileDropdownOpen} 
          setIsOpen={setProfileDropdownOpen} 
        />
      </div>

      <style>{`
        .mobile-burger-btn {
          display: flex;
        }
        @media (min-width: 1024px) {
          .mobile-burger-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
