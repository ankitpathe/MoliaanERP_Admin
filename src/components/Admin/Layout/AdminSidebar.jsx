import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  FileClock, 
  Bell, 
  BarChart3, 
  Activity, 
  Settings, 
  User, 
  ChevronDown, 
  ChevronRight,
  X,
  Building2,
  Network,
  ShoppingBag,
  ShoppingCart,
  Boxes,
  Receipt,
  Percent,
  Database,
  Save,
  Terminal,
  Lock,
  MessageSquare,
  Cpu,
  Briefcase
} from 'lucide-react';

export default function AdminSidebar({ onCloseMobile }) {
  const location = useLocation();

  const [expandedParents, setExpandedParents] = useState({
    users: location.pathname.startsWith('/admin/users'),
    employees: location.pathname.startsWith('/admin/employees'),
    roles: location.pathname.startsWith('/admin/roles'),
    branches: location.pathname.startsWith('/admin/branches'),
    settings: location.pathname.startsWith('/admin/settings')
  });

  const toggleParent = (key) => {
    setExpandedParents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuSections = [
    {
      title: 'ADMIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { 
          id: 'users', 
          label: 'Users', 
          icon: Users, 
          isParent: true,
          path: '/admin/users',
          children: [
            { id: 'all-users', label: 'All Users', path: '/admin/users' },
            { id: 'add-user', label: 'Add User', path: '/admin/users/new' }
          ]
        },
        { 
          id: 'employees', 
          label: 'Employees', 
          icon: Briefcase, 
          isParent: true,
          path: '/admin/employees',
          children: [
            { id: 'all-employees', label: 'All Employees', path: '/admin/employees' },
            { id: 'add-employee', label: 'Add Employee', path: '/admin/employees/new' }
          ]
        },
        { 
          id: 'roles', 
          label: 'Roles & Permissions', 
          icon: ShieldAlert, 
          isParent: true,
          path: '/admin/roles',
          children: [
            { id: 'all-roles', label: 'All Roles', path: '/admin/roles' },
            { id: 'create-role', label: 'Create Role', path: '/admin/roles/new' }
          ]
        }
      ]
    },
    {
      title: 'ERP CONFIGURATION',
      items: [
        { id: 'business', label: 'Business', path: '/admin/business', icon: Building2 },
        { 
          id: 'branches', 
          label: 'Branches', 
          icon: Network, 
          isParent: true,
          path: '/admin/branches',
          children: [
            { id: 'all-branches', label: 'All Branches', path: '/admin/branches' },
            { id: 'add-branch', label: 'Add Branch', path: '/admin/branches/new' }
          ]
        },
        { id: 'sales', label: 'Sales', path: '/admin/sales', icon: ShoppingBag },
        { id: 'purchase', label: 'Purchase', path: '/admin/purchase', icon: ShoppingCart },
        { id: 'inventory', label: 'Inventory', path: '/admin/inventory', icon: Boxes },
        { id: 'billing', label: 'Billing & Invoice', path: '/admin/billing', icon: Receipt },
        { id: 'tax', label: 'GST / Tax', path: '/admin/tax', icon: Percent },
        { id: 'master-data', label: 'Master Data', path: '/admin/master-data', icon: Database }
      ]
    },
    {
      title: 'MONITORING',
      items: [
        { id: 'activity-logs', label: 'Activity Logs', path: '/admin/activity-logs', icon: FileClock },
        { id: 'notifications', label: 'Notifications', path: '/admin/notifications', icon: Bell },
        { id: 'reports', label: 'Reports', path: '/admin/reports', icon: BarChart3 },
        { id: 'system-health', label: 'System Health', path: '/admin/system-health', icon: Activity }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'backup', label: 'Backup & Restore', path: '/admin/backup', icon: Save },
        { id: 'system-logs', label: 'System Logs', path: '/admin/system-logs', icon: Terminal },
        { id: 'security', label: 'Security', path: '/admin/security', icon: Lock },
        { id: 'communication', label: 'Communication', path: '/admin/communication', icon: MessageSquare },
        { id: 'integrations', label: 'Integrations', path: '/admin/integrations', icon: Cpu },
        { 
          id: 'settings', 
          label: 'Settings', 
          icon: Settings, 
          isParent: true,
          path: '/admin/settings',
          children: [
            { id: 'general', label: 'General', path: '/admin/settings/general' },
            { id: 'appearance', label: 'Appearance', path: '/admin/settings/appearance' },
            { id: 'notifications-settings', label: 'Notifications', path: '/admin/settings/notifications' },
            { id: 'localization', label: 'Localization', path: '/admin/settings/localization' },
            { id: 'system-config', label: 'System', path: '/admin/settings/system' }
          ]
        }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'Profile', path: '/admin/profile', icon: User }
      ]
    }
  ];

  return (
    <aside 
      style={{
        width: '260px',
        height: 'calc(100vh - 48px)',
        position: 'sticky',
        top: '24px',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        background: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 10px 30px -15px rgba(0, 0, 0, 0.05)',
        zIndex: 50,
      }}
    >
      {/* Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c7a6e, #9a988d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1rem'
          }}>
            O
          </div>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: '#1f2937',
            letterSpacing: '-0.5px'
          }}>
            ONE ERP
          </span>
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
              const isExpanded = expandedParents[item.id];
              const isParentSelected = location.pathname === item.path || (item.isParent && location.pathname.startsWith(item.path));

              if (item.isParent) {
                return (
                  <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <button
                      onClick={() => toggleParent(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: isParentSelected ? '#ffffff' : '#4b5563',
                        background: isParentSelected ? '#7c7a6e' : 'transparent',
                        transition: 'all 0.2s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => {
                        if (!isParentSelected) {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.color = '#1f2937';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isParentSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#4b5563';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon size={18} style={{ color: isParentSelected ? '#ffffff' : '#6b7280' }} />
                        <span>{item.label}</span>
                      </div>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isExpanded && (
                      <div style={{
                        paddingLeft: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginLeft: '20px',
                        marginTop: '2px',
                        marginBottom: '4px'
                      }}>
                        {item.children.map((child) => {
                          const isChildSelected = location.pathname === child.path;
                          return (
                            <Link
                              key={child.id}
                              to={child.path}
                              onClick={onCloseMobile}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                color: isChildSelected ? '#7c7a6e' : '#6b7280',
                                background: isChildSelected ? '#f5ebe1' : 'transparent',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                textDecoration: 'none'
                              }}
                              onMouseEnter={(e) => {
                                if (!isChildSelected) {
                                  e.currentTarget.style.color = '#1f2937';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isChildSelected) {
                                  e.currentTarget.style.color = '#6b7280';
                                }
                              }}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

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
                    color: isParentSelected ? '#ffffff' : '#4b5563',
                    background: isParentSelected ? '#7c7a6e' : 'transparent',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isParentSelected) {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.color = '#1f2937';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isParentSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4b5563';
                    }
                  }}
                >
                  <Icon size={18} style={{ color: isParentSelected ? '#ffffff' : '#6b7280' }} />
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
