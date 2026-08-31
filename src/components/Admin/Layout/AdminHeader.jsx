import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, Search, Bell, Sun, Moon, RefreshCw, Settings, 
  Maximize2, Users, Receipt, Database, Calendar, Monitor, 
  Activity, ChevronDown, LogOut, ArrowLeft, MoreVertical
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
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [pendingSubsCount, setPendingSubsCount] = useState(0);
  const [pendingHelpCount, setPendingHelpCount] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [adminInfo, setAdminInfo] = useState({
    name: 'Ankit Pathe',
    role: 'Super Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  });

  const loadAdminInfo = () => {
    try {
      const storedProfile = JSON.parse(localStorage.getItem('erp_admin_profile') || '{}');
      const storedSession = JSON.parse(localStorage.getItem('erp_user_session') || '{}');
      setAdminInfo({
        name: storedProfile.name || storedSession.name || 'Ankit Pathe',
        role: storedProfile.role || storedSession.role || 'Super Administrator',
        avatar: storedProfile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      });
    } catch (e) {
      // fallback
    }
  };

  useEffect(() => {
    loadAdminInfo();
    window.addEventListener('admin_profile_updated', loadAdminInfo);
    return () => window.removeEventListener('admin_profile_updated', loadAdminInfo);
  }, []);
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
      let pendingSubs = 2;
      try {
        const subReqs = JSON.parse(localStorage.getItem('erp_admin_sub_requests') || '[]');
        pendingSubs = subReqs.filter(r => String(r.status).toLowerCase() === 'pending').length;
        setPendingSubsCount(pendingSubs);
      } catch (e) {}

      setSnapshot({ volume, activeCounters, pendingRequests: pendingSubs });

      try {
        const helpReqs = JSON.parse(localStorage.getItem('helpRequests') || '[]');
        const pendingHelp = helpReqs.filter(r => String(r.status).toLowerCase() === 'open').length;
        setPendingHelpCount(pendingHelp);
      } catch (e) {}
    };
    loadStats();
  }, [location.pathname, notificationsOpen]);

  // Load live notifications
  useEffect(() => {
    const reqs = JSON.parse(localStorage.getItem('helpRequests') || '[]');
    const openReqsMapped = reqs.filter(r => r.status === 'open').map(r => ({
      id: r.id,
      title: `Help Request`,
      text: `${r.senderName} (${r.senderType}): "${r.subject}"`,
      time: r.createdAt ? new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
      unread: true,
      isHelpRequest: true,
      timestamp: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
      priority: r.priority
    }));

    const logs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');
    const logsMapped = logs.slice(0, 10).map((log, idx) => ({
      id: log.id || idx,
      title: log.module || 'System Activity',
      text: log.actionDescription,
      time: log.time || 'Just now',
      unread: log.unread !== undefined ? log.unread : false,
      timestamp: log.timestamp ? new Date(log.timestamp).getTime() : (Date.now() - idx * 60000 - 10000)
    }));

    const merged = [...openReqsMapped, ...logsMapped].sort((a, b) => b.timestamp - a.timestamp);
    if (merged.length > 0) {
      setNotifications(merged.slice(0, 8));
    } else {
      setNotifications([
        { id: 1, title: 'POS-01 Online', text: 'Counter POS-01 has successfully synchronized.', time: '2 mins ago', unread: true, timestamp: Date.now() - 120000 },
        { id: 2, title: 'Upgrade Approved', text: 'Merchant request Delhi Central processed.', time: '1 hour ago', unread: true, timestamp: Date.now() - 3600000 },
        { id: 3, title: 'Database Backup', text: 'Daily cloud database backup completed.', time: '12 hours ago', unread: false, timestamp: Date.now() - 43200000 }
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



  return (
    <>
      <style>{`
        .mobile-kebab-icon {
          display: none !important;
        }
        @media (max-width: 768px) {
          .header-status-label,
          .header-admin-name {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .header-search-desktop,
          .attention-badges-group,
          .header-status-dot {
            display: none !important;
          }
          .header-search-mobile-trigger {
            display: flex !important;
          }
          .desktop-settings-icon {
            display: none !important;
          }
          .mobile-kebab-icon {
            display: block !important;
          }
        }
        @media (min-width: 641px) {
          .header-search-mobile-trigger {
            display: none !important;
          }
        }
      `}</style>
      {mobileSearchOpen ? (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--bg-sidebar)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px'
        }}>
          <button 
            type="button"
            onClick={() => setMobileSearchOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px'
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                fontSize: '0.85rem',
                borderRadius: '99px',
                height: '40px',
                boxSizing: 'border-box',
                border: '1px solid var(--border-active)',
                background: 'var(--bg-control)',
                outline: 'none',
                color: 'var(--text-primary)'
              }}
            />
            <Search 
              size={14} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                color: 'var(--text-muted)' 
              }} 
            />
          </div>
        </div>
      ) : null}
      <header 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'var(--bg-sidebar)',
        borderBottom: '1px solid var(--border-muted)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '24px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        height: '64px',
        boxSizing: 'border-box'
      }}
    >
      {/* LEFT SECTION (Brand / Logo) */}
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
              border: '1px solid var(--border-muted)',
              background: 'var(--bg-control)',
              color: 'var(--text-primary)',
              height: '36px',
              width: '36px',
              boxSizing: 'border-box'
            }}
          >
            <Menu size={16} />
          </button>
        )}
        <span 
          onClick={() => navigate('/admin/dashboard')}
          style={{ 
            fontSize: '0.95rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '0.025em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Activity size={18} style={{ color: 'var(--accent-primary)' }} />
          <span className="brand-logo-text" style={{ fontWeight: 800 }}>Moliaan Admin</span>
        </span>
      </div>

      {/* CENTER SECTION (Search & Needs Attention Badges) */}
      <div className="header-search-desktop" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, justifySelf: 'start', maxWidth: '580px' }}>
        <div style={{ 
          flex: 1, 
          maxWidth: '240px', 
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search..." 
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              fontSize: '0.8rem',
              borderRadius: '99px',
              height: '36px',
              boxSizing: 'border-box',
              border: searchFocused ? '1px solid var(--border-active)' : '1px solid var(--border-muted)',
              background: 'var(--bg-control)',
              outline: 'none',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              boxShadow: searchFocused ? '0 0 0 3px var(--border-glow)' : 'none'
            }}
          />
          <Search 
            size={14} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              color: 'var(--text-muted)' 
            }} 
          />

          {/* Floating Search Results Modal */}
          {searchFocused && searchValue.trim() && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: 0,
              right: 0,
              background: 'var(--bg-card)',
              borderRadius: '12px',
              border: '1px solid var(--border-muted)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              padding: '6px',
              zIndex: 1000,
              maxHeight: '280px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              {searchResults.length === 0 ? (
                <span style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
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
                      color: 'var(--text-primary)',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-control-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 600 }}>{res.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-control)', padding: '2px 6px', borderRadius: '4px' }}>
                      {res.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Needs Attention Badge Cluster */}
        <div className="attention-badges-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Sub requests badge */}
          <div 
            onClick={() => navigate('/admin/subscriptions/requests')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--bg-control)',
              border: '1px solid var(--border-muted)',
              fontSize: '0.725rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              height: '28px',
              boxSizing: 'border-box'
            }}
            title={`${pendingSubsCount} Pending Subscription Requests`}
          >
            <span>Subs</span>
            <span style={{ 
              background: pendingSubsCount > 0 ? 'var(--accent-primary)' : 'var(--border-muted)',
              color: pendingSubsCount > 0 ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '99px',
              minWidth: '14px',
              textAlign: 'center'
            }}>
              {pendingSubsCount}
            </span>
          </div>

          {/* Help requests badge */}
          <div 
            onClick={() => navigate('/admin/help')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--bg-control)',
              border: '1px solid var(--border-muted)',
              fontSize: '0.725rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              height: '28px',
              boxSizing: 'border-box'
            }}
            title={`${pendingHelpCount} Open Help Tickets`}
          >
            <span>Help</span>
            <span style={{ 
              background: pendingHelpCount > 0 ? 'var(--accent-primary)' : 'var(--border-muted)',
              color: pendingHelpCount > 0 ? '#ffffff' : 'var(--text-muted)',
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '99px',
              minWidth: '14px',
              textAlign: 'center'
            }}>
              {pendingHelpCount}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (Real-Time Ops & Actions) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        
        {/* Unified Status Indicator */}
        <div 
          className="header-status-dot"
          onClick={() => navigate('/admin/data-sync/report')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            height: '36px',
            fontSize: '0.725rem',
            fontWeight: 600,
            color: 'var(--text-muted)'
          }}
          title="Terminal Network Status & Sync Health"
        >
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'pulse 1.5s infinite'
          }} />
          <span className="header-status-label">System Healthy</span>
        </div>

        {/* Mobile search trigger */}
        <button
          className="header-search-mobile-trigger"
          onClick={() => setMobileSearchOpen(true)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-muted)',
            background: 'var(--bg-control)',
            color: 'var(--text-muted)',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}
        >
          <Search size={15} />
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
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-muted)',
              background: 'var(--bg-control)',
              color: 'var(--text-muted)',
              position: 'relative',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control)'}
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
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border-muted)',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.1)',
                padding: '16px',
                zIndex: 99,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllRead}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Today's Summary */}
                <div style={{ background: 'var(--bg-control)', border: '1px solid var(--border-muted)', padding: '10px 12px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Today's Summary
                  </span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <Receipt size={13} style={{ color: '#ef4444' }} />
                    <span>₹{snapshot.volume.toLocaleString('en-IN')} volume processed</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <Monitor size={13} style={{ color: '#10b981' }} />
                    <span>{onlineTelemetry.online} Active Counters online</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <Users size={13} style={{ color: '#3b82f6' }} />
                    <span>{snapshot.pendingRequests} Pending SaaS Requests</span>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border-muted)', margin: '4px 0' }} />

                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recent Activity
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {notifications.map((n, i) => {
                    // Semantic activity icon color
                    let iconColor = '#3b82f6'; // default info blue
                    if (n.isHelpRequest) {
                      const prio = String(n.priority).toLowerCase();
                      if (prio === 'urgent' || prio === 'high') {
                        iconColor = '#ef4444'; // Red
                      } else if (prio === 'medium') {
                        iconColor = '#f59e0b'; // Orange/Yellow
                      } else {
                        iconColor = '#3b82f6'; // Blue
                      }
                    } else {
                      iconColor = '#10b981'; // System Logs green
                    }

                    return (
                      <div 
                        key={n.id || i} 
                        onClick={() => {
                          setNotificationsOpen(false);
                          if (n.isHelpRequest) {
                            navigate(`/admin/help?id=${n.id}`);
                          } else {
                            navigate('/admin/activity-logs');
                          }
                        }}
                        style={{ 
                          display: 'flex', 
                          gap: '8px', 
                          padding: '6px 8px', 
                          borderRadius: '8px', 
                          background: n.unread ? 'var(--bg-control-hover)' : 'transparent',
                          alignItems: 'flex-start',
                          cursor: 'pointer'
                        }}
                      >
                        <Activity size={12} style={{ color: iconColor, marginTop: '2.5px', flexShrink: 0 }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.2, textDecoration: 'none', opacity: 1 }}>
                            {n.text}
                          </span>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                            {n.isHelpRequest && (
                              <span style={{
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                background: n.priority === 'urgent' || n.priority === 'high' ? 'rgba(239,68,68,0.15)' : n.priority === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)',
                                color: n.priority === 'urgent' || n.priority === 'high' ? '#f87171' : n.priority === 'medium' ? '#fbbf24' : '#60a5fa',
                                textTransform: 'uppercase'
                              }}>
                                {n.priority}
                              </span>
                            )}
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {n.isHelpRequest ? 'Help Ticket' : n.title} • {n.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => { setNotificationsOpen(false); navigate('/admin/activity-logs'); }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'var(--bg-control)',
                    border: '1px solid var(--border-muted)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    marginTop: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-control-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-control)'}
                >
                  View All Activity Logs
                </button>
              </div>
            </>
          )}
        </div>

        {/* Settings gear dropdown */}
        <div className="header-settings-btn" style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setSettingsMenuOpen(!settingsMenuOpen);
              setNotificationsOpen(false);
              setProfileDropdownOpen(false);
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-muted)',
              background: 'var(--bg-control)',
              color: 'var(--text-muted)',
              transition: 'all 0.2s ease',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control)'}
            title="Settings & Options"
          >
            <Settings size={15} className="desktop-settings-icon" />
            <MoreVertical size={16} className="mobile-kebab-icon" />
          </button>
          
          {settingsMenuOpen && (
            <>
              <div 
                onClick={() => setSettingsMenuOpen(false)}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
              />
              <div style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '180px',
                padding: '4px',
                zIndex: 999,
                borderRadius: '8px',
                border: '1px solid var(--border-muted)',
                background: 'var(--bg-card)',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                <button
                  onClick={() => {
                    setSettingsMenuOpen(false);
                    navigate('/admin/master-data');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={14} /> System Settings
                </button>
                <button
                  onClick={() => {
                    setSettingsMenuOpen(false);
                    handleRefresh();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh Data
                </button>
                <button
                  onClick={() => {
                    setSettingsMenuOpen(false);
                    handleToggleFullscreen();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Maximize2 size={14} /> Toggle Fullscreen
                </button>
                <button
                  onClick={() => {
                    setSettingsMenuOpen(false);
                    toggleTheme();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {isDarkMode ? <Sun size={14} style={{ color: '#d97706' }} /> : <Moon size={14} />} 
                  {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            </>
          )}
        </div>



        {/* Admin Avatar Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '2px',
              cursor: 'pointer',
              borderRadius: '99px',
              border: 'none',
              background: 'transparent',
              textAlign: 'left',
              height: '36px',
              flexShrink: 0
            }}
          >
            <img 
              src={adminInfo.avatar} 
              alt={adminInfo.name} 
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
            />
            <span className="header-admin-name" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {adminInfo.name}
            </span>
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
                  border: '1px solid var(--border-muted)',
                  background: 'var(--bg-card)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ padding: '4px 8px 10px 8px', borderBottom: '1px solid var(--border-muted)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                    Welcome Admin,
                  </span>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
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
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    width: '100%',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Users size={14} style={{ color: 'var(--text-muted)' }} />
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(8, 145, 178, 0.08)'}
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
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    width: '100%',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={14} style={{ color: 'var(--text-muted)' }} />
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
                    borderTop: '1px solid var(--border-muted)',
                    marginTop: '4px',
                    paddingTop: '8px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
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
    </>
  );
}
