import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Plus, RefreshCw, Settings, Maximize2, Users, Receipt, Database } from 'lucide-react';
import AdminProfile from './AdminProfile';
import { useToast } from '../../../hooks/useToast';

export default function AdminHeader({ 
  title = "Dashboard", 
  onMenuToggle,
  profileDropdownOpen,
  setProfileDropdownOpen,
  theme,
  setTheme
}) {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'POS-01 Online', text: 'Counter POS-01 has successfully synchronized.', time: '2 mins ago', unread: true },
    { id: 2, title: 'Upgrade Approved', text: 'Merchant request for Delhi Central was processed.', time: '1 hour ago', unread: true },
    { id: 3, title: 'Database Backup', text: 'Daily cloud database backup completed successfully.', time: '12 hours ago', unread: false }
  ]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isLight = theme === 'light';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Fullscreen Toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => toast.showSuccess('Fullscreen', 'Entered fullscreen mode.'))
        .catch(err => toast.showError('Fullscreen Error', 'Unable to toggle fullscreen.'));
    } else {
      document.exitFullscreen()
        .then(() => toast.showInfo('Fullscreen', 'Exited fullscreen mode.'));
    }
  };

  // Refresh Trigger
  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.showInfo('Syncing', 'Synchronizing terminal data grids...');
    setTimeout(() => {
      setIsRefreshing(false);
      toast.showSuccess('Synced', 'Dashboard stats updated successfully.');
    }, 1000);
  };

  return (
    <header 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #f3f4f6',
        borderRadius: '0px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
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
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{
            width: '100%',
            padding: '8px 16px 8px 40px',
            fontSize: '0.9rem',
            borderRadius: '99px',
            border: searchFocused ? '1px solid #7c7a6e' : '1px solid #e5e7eb',
            background: '#fafafa',
            outline: 'none',
            color: '#1f2937',
            transition: 'all 0.2s ease',
            boxShadow: searchFocused ? '0 0 0 3px rgba(124, 122, 110, 0.15)' : 'none'
          }}
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

      {/* Right Actions: Quick Add, Refresh, Fullscreen, Settings, Notifications, Theme, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Quick Add Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setQuickAddOpen(!quickAddOpen);
              setNotificationsOpen(false);
              setProfileDropdownOpen(false);
            }}
            style={{
              padding: '8px 14px',
              borderRadius: '99px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Plus size={14} /> New
          </button>

          {quickAddOpen && (
            <>
              <div 
                onClick={() => setQuickAddOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }}
              />
              <div style={{
                position: 'absolute',
                top: '38px',
                right: 0,
                width: '180px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '6px',
                zIndex: 99,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button
                  onClick={() => { setQuickAddOpen(false); navigate('/admin/master-data'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: 'none', background: 'transparent', borderRadius: '8px', fontSize: '0.8rem', color: '#374151', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Database size={14} className="text-slate-500" /> Add Product
                </button>
                <button
                  onClick={() => { setQuickAddOpen(false); navigate('/admin/users'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: 'none', background: 'transparent', borderRadius: '8px', fontSize: '0.8rem', color: '#374151', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Users size={14} className="text-slate-500" /> Add User
                </button>
                <button
                  onClick={() => { setQuickAddOpen(false); navigate('/admin/reports/invoices'); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: 'none', background: 'transparent', borderRadius: '8px', fontSize: '0.8rem', color: '#374151', width: '100%', textAlign: 'left', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Receipt size={14} className="text-slate-500" /> Add Invoice
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sync/Refresh Button */}
        <button
          onClick={handleRefresh}
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
            transition: 'background-color 0.2s ease, transform 0.8s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          title="Refresh Data"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
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
          title="Toggle Fullscreen"
        >
          <Maximize2 size={16} />
        </button>

        {/* Settings/Quick Settings Button */}
        <button
          onClick={() => navigate('/admin/master-data')}
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
          title="System Settings"
        >
          <Settings size={16} />
        </button>

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setQuickAddOpen(false);
              setProfileDropdownOpen(false);
            }}
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
              position: 'relative',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '2px', 
                right: '2px', 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: '#f43f5e' 
              }} />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <>
              <div 
                onClick={() => setNotificationsOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }}
              />
              <div style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '290px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                padding: '16px',
                zIndex: 99,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1f2937' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      style={{ background: 'none', border: 'none', color: '#7c7a6e', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '2px', 
                        padding: '8px 10px', 
                        borderRadius: '10px', 
                        background: n.unread ? '#f7f6f2' : 'transparent',
                        border: '1px solid',
                        borderColor: n.unread ? '#f1efe9' : 'transparent'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1f2937' }}>{n.title}</span>
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{n.time}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: '1.4' }}>{n.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom Toggle Switch for Theme Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '48px',
              height: '26px',
              borderRadius: '99px',
              background: isLight ? '#e2e8f0' : '#7c7a6e',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '4px',
              paddingRight: '4px',
              transition: 'background-color 0.2s ease'
            }}
          >
            <Sun size={12} style={{ color: isLight ? '#7c7a6e' : '#cbd5e1', zIndex: 1 }} />
            <Moon size={12} style={{ color: isLight ? '#cbd5e1' : '#ffffff', zIndex: 1 }} />
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '3px',
              left: isLight ? '3px' : '25px',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
            }} />
          </button>
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
