import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Search, Bell, Sun, Moon, RefreshCw, Settings, 
  Maximize2, Users, Receipt, Database, Calendar, Monitor, 
  Activity, ChevronDown, LogOut
} from 'lucide-react';
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
  
  const searchInputRef = useRef(null);

  const [branch, setBranch] = useState('🏬 Main Outlet (Chhindwara)');
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [routeMenuOpen, setRouteMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('erp_theme') === 'dark' || 
           document.documentElement.classList.contains('dark');
  });

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);

  // Search states
  const [searchResults, setSearchResults] = useState([]);

  // Telemetry online counters count
  const [onlineTelemetry, setOnlineTelemetry] = useState({ online: 2, total: 4 });

  // Snapshot states
  const [snapshot, setSnapshot] = useState({ volume: 24186, activeCounters: 2, pendingRequests: 2 });

  // Format Date (e.g. "Mon, 25 Aug 2026")
  const getFormattedDate = () => {
    const date = new Date();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getShiftIndicator = () => {
    const hrs = new Date().getHours();
    if (hrs >= 6 && hrs < 14) return 'Shift A (Morning)';
    if (hrs >= 14 && hrs < 22) return 'Shift B (Evening)';
    return 'Shift C (Night)';
  };

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load telemetry stats
  useEffect(() => {
    const loadStats = () => {
      const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
      const volume = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0) || 24186;
      
      const counters = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
      const activeCounters = counters.filter(c => String(c.status).toUpperCase() === 'ONLINE' || String(c.status).toUpperCase() === 'ACTIVE').length;
      const totalCounters = counters.length || 4;

      setOnlineTelemetry({ online: activeCounters, total: totalCounters });
      setSnapshot({ volume, activeCounters, pendingRequests: 2 });
    };
    loadStats();
  }, [location.pathname, notificationsOpen]);

  // Load live notifications
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

  // Search live filtering
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }
    const query = searchValue.toLowerCase();
    
    // Load Users
    const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
    const matchedUsers = users
      .filter(u => (u.ownerName || u.name || '').toLowerCase().includes(query) || (u.storeName || '').toLowerCase().includes(query))
      .map(u => ({ id: u.id, name: `${u.storeName || u.name} (${u.ownerName || 'Merchant'})`, type: 'Merchant / User', path: `/admin/users` }));

    // Load Counters
    const counters = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
    const matchedCounters = counters
      .filter(c => (c.name || '').toLowerCase().includes(query) || (c.code || '').toLowerCase().includes(query))
      .map(c => ({ id: c.id || c.code, name: `${c.code} - ${c.name}`, type: 'POS Counter', path: `/admin/counters/reports` }));

    // Load Subscriptions / Licenses
    const subs = JSON.parse(localStorage.getItem('erp_admin_subscriptions') || '[]');
    const matchedSubs = subs
      .filter(s => (s.storeName || '').toLowerCase().includes(query) || (s.planName || '').toLowerCase().includes(query))
      .map(s => ({ id: s.id, name: `${s.storeName} - ${s.planName}`, type: 'Subscription', path: `/admin/plans/reports` }));

    setSearchResults([...matchedUsers, ...matchedCounters, ...matchedSubs].slice(0, 8));
  }, [searchValue]);

  const toggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('erp_theme', 'dark');
      if (typeof setTheme === 'function') setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('erp_theme', 'light');
      if (typeof setTheme === 'function') setTheme('light');
    }
  };

  const isLight = !isDarkMode;

  useEffect(() => {
    const savedTheme = localStorage.getItem('erp_theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
      if (typeof setTheme === 'function') setTheme('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
      if (typeof setTheme === 'function') setTheme('light');
    }
  }, [setTheme]);

  const unreadCount = hasUnread ? notifications.filter(n => n.unread).length : 0;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
    setHasUnread(false);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => toast.showSuccess('Fullscreen', 'Entered fullscreen mode.'))
        .catch(() => toast.showError('Fullscreen Error', 'Unable to toggle fullscreen.'));
    } else {
      document.exitFullscreen()
        .then(() => toast.showInfo('Fullscreen', 'Exited fullscreen mode.'));
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.showInfo('Syncing', 'Telemetry refreshed');
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

  // Export JSON Database Backup
  const handleExportBackup = () => {
    const backupData = {
      erp_users: JSON.parse(localStorage.getItem('erp_users') || '[]'),
      erp_admin_counters: JSON.parse(localStorage.getItem('erp_admin_counters') || '[]'),
      erp_admin_plans: JSON.parse(localStorage.getItem('erp_admin_plans') || '[]'),
      erp_admin_subscriptions: JSON.parse(localStorage.getItem('erp_admin_subscriptions') || '[]'),
      erp_activity_logs: JSON.parse(localStorage.getItem('erp_activity_logs') || '[]')
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Moliaan_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.showSuccess('Backup Successful', 'Moliaan ERP JSON database backup exported.');
    setProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    localStorage.removeItem('erp_user_session');
    toast.showInfo('Logged Out', 'Successfully logged out of the Administrator session.');
    navigate('/');
  };

  const storedSession = JSON.parse(localStorage.getItem('erp_user_session') || '{}');
  const adminInfo = {
    name: storedSession.name || 'Administrator',
    role: storedSession.role || 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=128&h=128&auto=format&fit=crop',
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
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        height: '64px',
        boxSizing: 'border-box'
      }}
    >
      {/* LEFT SECTION (Branch Switcher & Route Path) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

        {/* Active Branch Selector Custom Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setBranchMenuOpen(!branchMenuOpen);
              setRouteMenuOpen(false);
            }}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#374151',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              outline: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{branch}</span>
            <ChevronDown size={12} style={{ color: '#6b7280' }} />
          </button>

          {branchMenuOpen && (
            <>
              <div 
                onClick={() => setBranchMenuOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '8px',
                  width: '256px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  border: '1px solid #e2e8f0',
                  zIndex: 9999,
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                {[
                  '🏬 Main Outlet (Chhindwara)',
                  '🏬 Branch 02',
                  '🌐 All Stores (Combined)'
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setBranch(option);
                      localStorage.setItem('erp_active_outlet', option);
                      toast.showSuccess('Branch Switched', `Active branch switched to ${option}.`);
                      setBranchMenuOpen(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 16px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#374151',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Compact Route Breadcrumb with quick switch chevron */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>
            Counters &gt; Reports
          </span>
          <button
            onClick={() => {
              setRouteMenuOpen(!routeMenuOpen);
              setBranchMenuOpen(false);
            }}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            <ChevronDown size={14} style={{ color: '#9ca3af', transform: routeMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {routeMenuOpen && (
            <>
              <div onClick={() => setRouteMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} />
              <div style={{
                position: 'absolute',
                top: '24px',
                left: 0,
                width: '180px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                padding: '4px',
                zIndex: 999,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {[
                  { name: 'Dashboard', path: '/admin/dashboard' },
                  { name: 'Terminal Reports', path: '/admin/counters/reports' },
                  { name: 'SaaS Plans Pricing', path: '/admin/plans' },
                  { name: 'Subscription Requests', path: '/admin/plans/requests' },
                  { name: 'Merchants Registry', path: '/admin/users' },
                  { name: 'Data Sync Diagnostic', path: '/admin/data-sync/report' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setRouteMenuOpen(false);
                      navigate(item.path);
                    }}
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      color: '#374151',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* CENTER SECTION (Universal Omnisearch) */}
      <div style={{ 
        flex: 1, 
        maxWidth: '360px', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <input 
          ref={searchInputRef}
          type="text" 
          placeholder="Search counters, merchants, licenses..." 
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          style={{
            width: '100%',
            padding: '8px 60px 8px 36px',
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
        <span style={{
          position: 'absolute',
          right: '12px',
          background: '#e5e7eb',
          color: '#4b5563',
          fontSize: '0.625rem',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          pointerEvents: 'none'
        }}>
          Ctrl + K
        </span>

        {/* Floating Search Results Modal */}
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
            maxHeight: '280px',
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

      {/* RIGHT SECTION (Real-Time Ops & Actions) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Live Telemetry Pill */}
        <button
          onClick={() => navigate('/admin/counters/reports')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '99px',
            fontSize: '0.7rem',
            fontWeight: 700,
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            cursor: 'pointer'
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'pulse 1.5s infinite'
          }} />
          {onlineTelemetry.online}/{onlineTelemetry.total} Counters Online
        </button>

        {/* Sync Status Pill */}
        <button
          onClick={() => navigate('/admin/data-sync/report')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: '99px',
            fontSize: '0.7rem',
            fontWeight: 700,
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            cursor: 'pointer'
          }}
        >
          ⚡ Realtime Sync OK
        </button>

        {/* Date & Shift Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#f3f4f6',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '0.725rem',
          fontWeight: 600,
          color: '#4b5563'
        }}>
          <span>{getFormattedDate()}</span>
          <span style={{ color: '#9ca3af' }}>|</span>
          <span style={{ color: '#4f46e5', fontWeight: 700 }}>{getShiftIndicator()}</span>
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
              setProfileDropdownOpen(false);
              setHasUnread(false);
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

          {/* Notifications Dropdown Panel */}
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

                {/* Today's Summary */}
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
                    <span>{onlineTelemetry.online} Active Counters online</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                    <Users size={13} style={{ color: '#0891b2' }} />
                    <span>{snapshot.pendingRequests} Pending SaaS Requests</span>
                  </div>
                </div>

                <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />

                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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



        {/* Admin Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
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
                <ChevronDown size={12} style={{ color: '#9ca3af', transform: profileDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </span>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '-2px', fontWeight: 600 }}>
                {adminInfo.role}
              </span>
            </div>
          </button>

          {profileDropdownOpen && (
            <>
              <div 
                onClick={() => setProfileDropdownOpen(false)} 
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
                <div style={{ padding: '4px 8px 10px 8px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>
                    Welcome Admin,
                  </span>
                  <span style={{ fontSize: '0.725rem', color: '#6b7280', fontWeight: 500 }}>
                    {adminInfo.name}
                  </span>
                </div>

                <button 
                  onClick={() => {
                    setProfileDropdownOpen(false);
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
                  <Users size={14} style={{ color: '#4b5563' }} />
                  Merchant Profiles
                </button>

                <button 
                  onClick={handleExportBackup}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0891b2',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    width: '100%',
                    fontWeight: 700
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ecfeff'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Database size={14} style={{ color: '#0891b2' }} />
                  Database JSON Backup
                </button>
                
                <button 
                  onClick={() => {
                    setProfileDropdownOpen(false);
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
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.35);
          }
        }
      `}</style>
    </header>
  );
}
