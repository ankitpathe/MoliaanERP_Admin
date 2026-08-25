import React from 'react';
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
  X
} from 'lucide-react';

export default function AdminSidebar({ onCloseMobile }) {
  const location = useLocation();

  const menuSections = [
    {
      title: 'PLATFORM',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }
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
        { id: 'stocks-reports', label: 'Stocks Reports', path: '/admin/reports/stocks', icon: Boxes }
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
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderRadius: isMobile ? '24px' : '0px',
        border: isMobile ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
        borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
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
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {section.title && (
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                color: '#9ca3af', 
                letterSpacing: '1px', 
                paddingLeft: '12px',
                marginBottom: '4px' 
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: isSelected ? '#ffffff' : '#4b5563',
                    background: isSelected ? '#7c7a6e' : 'transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#1f2937';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  <Icon size={18} style={{ color: isSelected ? '#ffffff' : '#6b7280' }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
