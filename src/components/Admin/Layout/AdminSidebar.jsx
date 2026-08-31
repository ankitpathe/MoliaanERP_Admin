import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MoliaanLogo from '../../../assets/Moliaan-Full-Logo2.svg';
import { 
  LayoutDashboard, 
  PlusCircle,
  Monitor,
  PlusSquare,
  CreditCard,
  UserCheck,
  BarChart2,
  Users, 
  RefreshCw,
  Receipt,
  Boxes,
  Activity,
  HeartPulse,
  HardDriveDownload,
  Database,
  User,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function AdminSidebar({ onCloseMobile }) {
  const location = useLocation();
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    const checkRequests = () => {
      const raw = localStorage.getItem('helpRequests') || '[]';
      try {
        const parsed = JSON.parse(raw);
        const count = parsed.filter(r => r.status === 'open').length;
        setOpenCount(count);
      } catch (e) {
        setOpenCount(0);
      }
    };
    checkRequests();
    window.addEventListener('storage', checkRequests);
    window.addEventListener('help_requests_updated', checkRequests);
    return () => {
      window.removeEventListener('storage', checkRequests);
      window.removeEventListener('help_requests_updated', checkRequests);
    };
  }, []);

  const menuSections = [
    {
      title: 'PLATFORM',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { id: 'help-requests', label: 'Help Requests', path: '/admin/help', icon: HelpCircle }
      ]
    },
    {
      title: 'COUNTER DETAILS',
      items: [
        { id: 'add-counter', label: 'Add Counter', path: '/admin/counters/new', icon: PlusCircle },
        { id: 'counter-reports', label: 'Counter Reports', path: '/admin/counters/reports', icon: Monitor }
      ]
    },
    {
      title: 'PLANS & BILLING',
      items: [
        { id: 'add-plan', label: 'Add Plan', path: '/admin/plans/new', icon: PlusSquare },
        { id: 'all-plans', label: 'All Plans', path: '/admin/plans', icon: CreditCard },
        { id: 'sub-requests', label: 'Subscription Requests', path: '/admin/subscriptions/requests', icon: UserCheck },
        { id: 'sub-reports', label: 'Subscription Reports', path: '/admin/subscriptions/reports', icon: BarChart2 }
      ]
    },
    {
      title: 'MERCHANTS',
      items: [
        { id: 'users', label: 'All Users', path: '/admin/users', icon: Users }
      ]
    },
    {
      title: 'DATA SYNC',
      items: [
        { id: 'data-sync', label: 'Sync Report', path: '/admin/data-sync/report', icon: RefreshCw }
      ]
    },
    {
      title: 'SYSTEM REPORTS',
      items: [
        { id: 'invoices-reports', label: 'Invoices Reports', path: '/admin/reports/invoices', icon: Receipt },
        { id: 'stocks-reports', label: 'Stocks Reports', path: '/admin/reports/stocks', icon: Boxes },
        { id: 'advertisements', label: 'Advertisements', path: '/admin/advertisements', icon: Sparkles }
      ]
    },
    {
      title: 'DEVELOPER AUDIT',
      items: [
        { id: 'activity-logs', label: 'Activity Logs', path: '/admin/activity-logs', icon: Activity },
        { id: 'system-health', label: 'System Health', path: '/admin/system-health', icon: HeartPulse },
        { id: 'backup', label: 'Backup & Restore', path: '/admin/backup', icon: HardDriveDownload },
        { id: 'master-data', label: 'Master Data', path: '/admin/master-data', icon: Database }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'Owner Profile', path: '/admin/profile', icon: User }
      ]
    }
  ];

  const isMobile = !!onCloseMobile;

  return (
    <aside 
      style={{
        width: '260px',
        height: isMobile ? 'calc(100vh - 32px)' : '100vh',
        position: isMobile ? 'static' : 'sticky',
        top: '0px',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(20px)',
        borderRadius: isMobile ? '24px' : '0px',
        border: isMobile ? '1px solid var(--border-muted)' : 'none',
        borderRight: isMobile ? 'none' : '1px solid var(--border-muted)',
        boxShadow: isMobile ? '0 10px 30px -15px rgba(0, 0, 0, 0.05)' : 'none',
        zIndex: 50,
      }}
    >
      {/* Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={MoliaanLogo} 
            alt="Moliaan ERP" 
            style={{ 
              height: '38px', 
              objectFit: 'contain',
              maxWidth: '180px'
            }} 
          />
        </div>

        {onCloseMobile && (
          <button 
            onClick={onCloseMobile}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '4px' }}>
        {menuSections.map((section, idx) => (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: idx === 0 ? '0px' : '24px' }}>
            {section.title && (
              <span className="sidebar-section-title" style={{ 
                fontSize: '0.725rem', 
                fontWeight: 700, 
                letterSpacing: '1px', 
                paddingLeft: '12px',
                marginBottom: '4px',
                textTransform: 'uppercase'
              }}>
                {section.title}
              </span>
            )}
            
            {section.items.map((item) => {
              const Icon = item.icon;
              const isSelected = location.pathname === item.path;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={`sidebar-menu-item ${isSelected ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '10px 12px',
                    paddingLeft: isSelected ? '8px' : '12px',
                    borderRadius: '8px',
                    border: 'none',
                    borderLeft: isSelected ? '4px solid #035096' : '4px solid transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    background: isSelected ? 'var(--accent-primary-glow)' : 'transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-control-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={18} className="sidebar-icon" />
                  <span>{item.label}</span>
                  {item.id === 'help-requests' && openCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.675rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '99px',
                      lineHeight: 1
                    }}>
                      {openCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
