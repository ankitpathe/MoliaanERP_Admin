import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Sun, Moon, Plus, RefreshCw, Settings, Maximize2, Users, Receipt, Database, Calendar, Monitor, Activity, TrendingUp, ChevronDown } from 'lucide-react';
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
  const location = useLocation();
  const toast = useToast();
  
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);

  // Search states
  const [searchResults, setSearchResults] = useState([]);

  // Snapshot states
  const [snapshot, setSnapshot] = useState({ volume: 24186, activeCounters: 0, pendingRequests: 2 });

  const isDashboard = location.pathname === '/admin/dashboard';

  // Left breadcrumb path
  const getBreadcrumb = () => {
    if (location.pathname === '/admin/dashboard') return 'Admin / Dashboard';
    const cleanTitle = title.replace('Admin / ', '').replace('Admin Panel / ', '');
    return `Admin / ${cleanTitle}`;
  };

  // Format Date (e.g. "Mon, 25 Aug 2026")
  const getFormattedDate = () => {
    const date = new Date();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Load snapshot stats
  useEffect(() => {
    const loadStats = () => {
      const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
      const volume = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0) || 24186;
      
      const counters = JSON.parse(localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters') || '[]');
      const activeCounters = counters.filter(c => c.status === 'Online' || c.status === 'Active').length;

      setSnapshot({ volume, activeCounters, pendingRequests: 2 });
    };
    loadStats();
  }, [location.pathname, notificationsOpen]);

  // Load live notifications from activity logs
  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');
    const mapped = logs.slice(0, 5).map((log, idx) => ({
      id: log.id || idx,
      title: log.module || 'System Activity',
      text: log.actionDescription,
      time: log.time || 'Just now',
      unread: true
    }));

    if (mapped.length > 0) {
      setNotifications(mapped);
    } else {
      setNotifications([
        { id: 1, title: 'POS-01 Online', text: 'Counter POS-01 has successfully synchronized.', time: '2 mins ago', unread: true },
        { id: 2, title: 'Upgrade Approved', text: 'Merchant request for Delhi Central was processed.', time: '1 hour ago', unread: true },
        { id: 3, title: 'Database Backup', text: 'Daily cloud database backup completed successfully.', time: '12 hours ago', unread: false }
      ]);
    }
  }, [notificationsOpen]);

  // Basic Search dropdown filter
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchValue.toLowerCase();
    
    // Load Users
    const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
    const matchedUsers = users
      .filter(u => (u.name || '').toLowerCase().includes(query))
      .map(u => ({ id: u.id, name: u.name, type: 'User', path: `/admin/users` }));

    // Load Counters
    const counters = JSON.parse(localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters') || '[]');
    const matchedCounters = counters
      .filter(c => (c.name || '').toLowerCase().includes(query) || (c.code || '').toLowerCase().includes(query))
      .map(c => ({ id: c.id || c.code, name: `${c.code} - ${c.name}`, type: 'Counter', path: `/admin/counters/reports` }));

    // Load Advertisements
    const ads = JSON.parse(localStorage.getItem('erp_advertisements') || '[]');
    const matchedAds = ads
      .filter(a => (a.title || '').toLowerCase().includes(query))
      .map(a => ({ id: a.id, name: a.title, type: 'Campaign', path: `/admin/advertisements` }));

    setSearchResults([...matchedUsers, ...matchedCounters, ...matchedAds].slice(0, 6));
  }, [searchValue]);

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

  const unreadCount = hasUnread ? notifications.filter(n => n.unread).length : 0;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    setHasUnread(false);
  };

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

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.showInfo('Syncing', 'Synchronizing terminal data grids...');
    setTimeout(() => {
      setIsRefreshing(false);
      toast.showSuccess('Synced', 'Dashboard stats updated successfully.');
    }, 1000);
  };

  const handleSearchResultClick = (result) => {
    setSearchValue('');
    setSearchResults([]);
    navigate(result.path);
  };

  return (
    <header 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: '#ffffff',
        borderBottom: '1px solid #f3f4f6',
        borderRadius: '0px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        height: '64px',
        boxSizing: 'border-box'
      }}
    >
      {/* Left side: clean breadcrumb only */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="mobile-burger-btn"
            style={{
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#ffffff'
            }}
          >
            <Menu size={16} />
          </button>
        )}
        
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', letterSpacing: '-0.1px' }}>
          {getBreadcrumb()}
        </span>
      </div>

      {/* Center Search Input */}
      <div style={{ 
        flex: 1, 
        maxWidth: '320px', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input 
          type="text" 
          placeholder="Search counters, users..." 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            fontSize: '0.8rem',
            borderRadius: '99px',
            border: searchFocused ? '1px solid #7c3aed' : '1px solid #e5e7eb',
            background: '#fafafa',
            outline: 'none',
            color: '#1f2937',
            transition: 'all 0.2s ease',
            boxShadow: searchFocused ? '0 0 0 3px rgba(124, 58, 237, 0.15)' : 'none'
          }}
        />
        <Search 
          size={14} 
          style={{ 
            position: 'absolute', 
            left: '14px', 
            color: '#9ca3af' 
          }} 
        />

        {/* Search Dropdown Panel */}
        {searchFocused && searchValue.trim() && (
          <div style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            padding: '6px',
            zIndex: 1000,
            maxHeight: '260px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            {searchResults.length === 0 ? (
              <span style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }}>
                No results found.
              </span>
            ) : (
              searchResults.map((res, i) => (
                <button
                  key={i}
                  onMouseDown={() => handleSearchResultClick(res)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    color: '#374151',
                    width: '100%',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{res.name}</span>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                    {res.type}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Actions: Live Status, Quick Add, Refresh, Bell, Gear, Theme, Date, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Live status pill */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '99px',
          fontSize: '0.7rem',
          fontWeight: 700,
          background: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0'
        }}>
          <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
          Live
        </span>

        {/* Dynamic Date Label */}
        <span style={{ fontSize: '0.725rem', color: '#6b7280', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} style={{ color: '#9ca3af' }} />
          {getFormattedDate()}
        </span>

        {/* Sync/Refresh */}
        <button
          onClick={handleRefresh}
          style={{
            width: '32px',
            height: '32px',
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
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullscreen}
          style={{
            width: '32px',
            height: '32px',
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
          <Maximize2 size={14} />
        </button>

        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setQuickAddOpen(false);
              setProfileDropdownOpen(false);
              setHasUnread(false); // remove red dot once opened
            }}
            style={{
              width: '32px',
              height: '32px',
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
            <Bell size={15} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '2px', 
                right: '2px', 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: '#f43f5e' 
              }} />
            )}
          </button>

          {/* Notifications Dropdown Panel (Today's Summary + Recent Activity) */}
          {notificationsOpen && (
            <>
              <div 
                onClick={() => setNotificationsOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 98 }}
              />
              <div style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '310px',
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
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#1f2937' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Today's Summary Stat Rows */}
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Today's Summary
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                    <Receipt size={13} style={{ color: '#dc2626' }} />
                    <span>₹{snapshot.volume.toLocaleString('en-IN')} volume processed</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                    <Monitor size={13} style={{ color: '#10b981' }} />
                    <span>{snapshot.activeCounters} Active Counters online</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                    <Users size={13} style={{ color: '#0891b2' }} />
                    <span>{snapshot.pendingRequests} Pending SaaS Requests</span>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                {/* Recent Activity */}
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '-4px' }}>
                  Recent Activity
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {notifications.map((n, i) => (
                    <div 
                      key={n.id || i} 
                      style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        padding: '6px 8px', 
                        borderRadius: '8px', 
                        background: n.unread ? '#f5f3ff' : 'transparent',
                        alignItems: 'flex-start'
                      }}
                    >
                      <Activity size={12} style={{ color: '#7c3aed', marginTop: '2px', flexShrink: 0 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#374151', fontWeight: 600, lineHeight: 1.2 }}>
                          {n.text}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                          {n.title} • {n.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dropdown footer link */}
                <button
                  onClick={() => { setNotificationsOpen(false); navigate('/admin/activity-logs'); }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#f8fafc',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#7c3aed',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '4px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  View All Activity Logs
                </button>
              </div>
            </>
          )}
        </div>

        {/* Settings gear */}
        <button
          onClick={() => navigate('/admin/master-data')}
          style={{
            width: '32px',
            height: '32px',
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
          <Settings size={15} />
        </button>

        {/* Custom Toggle Switch for Theme Selection */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '42px',
              height: '22px',
              borderRadius: '99px',
              background: isLight ? '#e2e8f0' : '#7c7a6e',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingLeft: '3px',
              paddingRight: '3px',
              transition: 'background-color 0.2s ease'
            }}
          >
            <Sun size={10} style={{ color: isLight ? '#7c7a6e' : '#cbd5e1', zIndex: 1 }} />
            <Moon size={10} style={{ color: isLight ? '#cbd5e1' : '#ffffff', zIndex: 1 }} />
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '3px',
              left: isLight ? '3px' : '23px',
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
