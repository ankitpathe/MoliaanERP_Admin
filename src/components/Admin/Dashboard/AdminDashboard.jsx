import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Monitor, 
  PlusSquare, 
  UserCheck, 
  RefreshCw, 
  FileText, 
  Boxes, 
  Activity,
  Users,
  TrendingUp,
  ArrowRight,
  HardDrive,
  Check,
  X,
  Store,
  Sparkles,
  MousePointerClick
} from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [metrics, setMetrics] = useState({
    totalCounters: 0,
    onlineCounters: 0,
    activePlans: 0,
    totalMerchants: 0,
    pendingSyncs: 0,
    grossVolume: 0,
    lowStockCount: 0,
    recentLogs: []
  });

  const [subRequests, setSubRequests] = useState([
    { id: 'SUB-9021', merchant: 'Organic Foods Co.', plan: 'Enterprise Pro', date: '2026-08-25', status: 'Pending' },
    { id: 'SUB-9022', merchant: 'Metro Pharmacy LLC', plan: 'Growth Basic', date: '2026-08-24', status: 'Pending' }
  ]);

  const [recentMerchants, setRecentMerchants] = useState([
    { id: 'M-701', name: 'Apex Retail Store', plan: 'Enterprise Pro', joined: '2026-08-22', status: 'Active' },
    { id: 'M-702', name: 'Daily Grocery Hub', plan: 'Standard POS', joined: '2026-08-23', status: 'Active' },
    { id: 'M-703', name: 'Wellness Medicos', plan: 'Growth Basic', joined: '2026-08-24', status: 'Inactive' }
  ]);

  // Idle Ads Config state
  const [isIdle, setIsIdle] = useState(false);
  const [adConfig, setAdConfig] = useState({ enableIdleAds: false, idleTimeoutSeconds: 10, adDisplayMode: 'FULLSCREEN_SAVER', activeBanners: [] });
  const [currentIdleAdIdx, setCurrentIdleAdIdx] = useState(0);

  useEffect(() => {
    // 1. Counters
    const counters = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
    const totalCounters = counters.length;
    const onlineCounters = counters.filter(c => c.status === 'Online').length;

    // 2. Plans
    const plans = JSON.parse(localStorage.getItem('erp_admin_plans') || '[]');
    const activePlans = plans.length || 3;

    // 3. Merchants/Users
    const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
    const totalMerchants = users.length || 8;

    // 4. Sync status
    const syncLogs = JSON.parse(localStorage.getItem('erp_sync_logs') || '[]');
    const pendingSyncs = syncLogs.filter(s => s.status === 'Warning' || s.status === 'Failed' || s.status === 'Pending').length || 2;

    // 5. Gross Platform Volume (Sales)
    const sales = JSON.parse(localStorage.getItem('erp_sales') || '[]');
    const grossVolume = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0) || 24186;

    // 6. Low stock alert count
    const products = JSON.parse(localStorage.getItem('erp_products') || '[]');
    const lowStockCount = products.filter(p => Number(p.stock) <= 10).length || 1;

    // 7. Recent logs (Developer Audit)
    const logs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');
    const recentLogs = logs.slice(0, 3);

    setMetrics({
      totalCounters,
      onlineCounters,
      activePlans,
      totalMerchants,
      pendingSyncs,
      grossVolume,
      lowStockCount,
      recentLogs
    });

    // Load Idle Ads config
    const rawConfig = localStorage.getItem('erp_ad_config');
    let config = { enableIdleAds: false, idleTimeoutSeconds: 10, adDisplayMode: 'FULLSCREEN_SAVER', activeBanners: [] };
    if (rawConfig) {
      config = JSON.parse(rawConfig);
    }
    setAdConfig(config);

    if (!config.enableIdleAds || !config.activeBanners || config.activeBanners.filter(b => b.status === 'ACTIVE').length === 0) {
      return;
    }

    let timeoutId;
    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsIdle(true);
      }, config.idleTimeoutSeconds * 1000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, []);

  const activeBannersToRender = adConfig.activeBanners?.filter(b => b.status === 'ACTIVE') || [];

  // Carousel timer inside idle state
  useEffect(() => {
    if (isIdle && activeBannersToRender.length > 1) {
      const interval = setInterval(() => {
        setCurrentIdleAdIdx(prev => (prev + 1) % activeBannersToRender.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isIdle, activeBannersToRender.length]);

  const handleIdleAdClick = (ad) => {
    setIsIdle(false);
    toast.showInfo('Ad Clicked', `Navigating to target: ${ad.title}`);
    if (ad.targetUrl.startsWith('http')) {
      window.open(ad.targetUrl, '_blank');
    } else {
      navigate(ad.targetUrl);
    }
  };

  const handleApproveRequest = (id, merchant) => {
    setSubRequests(prev => prev.filter(r => r.id !== id));
    toast.showSuccess('Approved', `Subscription request for "${merchant}" approved successfully.`);
  };

  const handleRejectRequest = (id, merchant) => {
    setSubRequests(prev => prev.filter(r => r.id !== id));
    toast.showInfo('Rejected', `Subscription request for "${merchant}" was rejected.`);
  };

  const statCards = [
    { label: 'POS Terminals', value: metrics.totalCounters, subtext: `${metrics.onlineCounters} Online`, icon: Monitor, color: '#7c3aed', path: '/admin/counters/reports' },
    { label: 'Active SaaS Tiers', value: metrics.activePlans, subtext: 'Configured SaaS tiers', icon: PlusSquare, color: '#10b981', path: '/admin/plans' },
    { label: 'Registered Merchants', value: metrics.totalMerchants, subtext: 'Active accounts', icon: Users, color: '#0891b2', path: '/admin/users' },
    { label: 'Gross Platform Volume', value: `₹${metrics.grossVolume.toLocaleString('en-IN')}`, subtext: 'Total processed volume', icon: TrendingUp, color: '#dc2626', path: '/admin/reports/invoices' }
  ];

  const quickActions = [
    { label: 'Add Counter', icon: Monitor, path: '/admin/counters/new' },
    { label: 'Create Plan', icon: PlusSquare, path: '/admin/plans/new' },
    { label: 'Sub Requests', icon: UserCheck, path: '/admin/subscriptions/requests' },
    { label: 'Sync Monitor', icon: RefreshCw, path: '/admin/data-sync/report' },
    { label: 'Invoices Report', icon: FileText, path: '/admin/reports/invoices' },
    { label: 'Stocks Report', icon: Boxes, path: '/admin/reports/stocks' },
    { label: 'Audit Logs', icon: Activity, path: '/admin/activity-logs' }
  ];

  const currentIdleAd = activeBannersToRender[currentIdleAdIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Admin Dashboard
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Manage ERP configurations, system status, and developer console.
          </span>
        </div>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '99px',
          fontSize: '0.75rem',
          fontWeight: 600,
          background: '#d1fae5',
          color: '#065f46',
          border: '1px solid #a7f3d0'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
          System Operational
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx}
              onClick={() => navigate(card.path)}
              style={{
                background: '#ffffff',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>{card.label}</span>
                <h4 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', margin: 0, letterSpacing: '-0.025em', lineHeight: 1.1 }}>{card.value}</h4>
                {card.subtext && (
                  <span style={{
                    fontSize: '0.725rem',
                    color: card.label === 'POS Terminals' ? '#10b981' : '#9ca3af',
                    fontWeight: card.label === 'POS Terminals' ? 600 : 500,
                    marginTop: '2px'
                  }}>
                    {card.subtext}
                  </span>
                )}
              </div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: `${card.color}12`,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Launchpad */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
          Quick Action Launchpad
        </span>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                style={{
                  flex: 1,
                  minWidth: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 12px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.backgroundColor = '#fcfaff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.08)',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151', textAlign: 'center' }}>
                  {action.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Mid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Sync Health & Telemetry */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sync Health & Telemetry
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: '99px',
                fontSize: '0.7rem',
                fontWeight: 600,
                background: '#fef3c7',
                color: '#92400e'
              }}>
                {metrics.pendingSyncs} Queue Batches
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Gateway Ping Latency</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>14ms (Optimal)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Last Sync Heartbeat</span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>Just now</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>Database Buffer Status</span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>100% Synced</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/data-sync/report')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ffffff',
              border: 'none',
              borderTop: '1px solid #e5e7eb',
              color: '#374151',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            View Sync Queue <ArrowRight size={14} />
          </button>
        </div>

        {/* Developer Audit Logs */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Developer Audit Logs
              </span>
              <HardDrive size={16} style={{ color: '#9ca3af' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {metrics.recentLogs.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: '#9ca3af', padding: '24px', textAlign: 'center' }}>No recent activities.</span>
              ) : (
                metrics.recentLogs.map((log, idx) => (
                  <div 
                    key={log.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '14px 20px', 
                      borderBottom: idx === metrics.recentLogs.length - 1 ? 'none' : '1px solid #f3f4f6' 
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', marginRight: '16px' }}>
                      <span 
                        style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}
                        title={log.actionDescription}
                      >
                        {log.actionDescription}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{log.module} • {log.userName}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'monospace' }}>{log.time || 'Today'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/activity-logs')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ffffff',
              border: 'none',
              borderTop: '1px solid #e5e7eb',
              color: '#374151',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            View All Logs <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* Two Lower Lists: Sub requests & Recent Merchants */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Subscription Requests Widget */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subscription Requests
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '3px 8px',
                borderRadius: '99px',
                fontSize: '0.7rem',
                fontWeight: 600,
                background: '#fee2e2',
                color: '#991b1b'
              }}>
                {subRequests.length} Pending
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {subRequests.map((req, idx) => (
                <div 
                  key={req.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '14px 20px', 
                    borderBottom: idx === subRequests.length - 1 ? 'none' : '1px solid #f3f4f6' 
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>{req.merchant}</span>
                    <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Plan: {req.plan} • {req.date}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleApproveRequest(req.id, req.merchant)}
                      style={{
                        padding: '4px 8px',
                        background: '#1f2937',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Check size={12} /> Approve
                    </button>
                    <button 
                      onClick={() => handleRejectRequest(req.id, req.merchant)}
                      style={{
                        padding: '4px 8px',
                        background: 'transparent',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <X size={12} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => navigate('/admin/subscriptions/requests')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ffffff',
              border: 'none',
              borderTop: '1px solid #e5e7eb',
              color: '#374151',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            Manage Requests <ArrowRight size={14} />
          </button>
        </div>

        {/* Recently Added Merchants */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recently Added Merchants
              </span>
              <Store size={16} style={{ color: '#9ca3af' }} />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fcfcfc' }}>
                    <th style={{ padding: '10px 16px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Merchant</th>
                    <th style={{ padding: '10px 16px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>SaaS Plan</th>
                    <th style={{ padding: '10px 16px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMerchants.map((merchant, idx) => (
                    <tr 
                      key={merchant.id} 
                      style={{ 
                        borderBottom: idx === recentMerchants.length - 1 ? 'none' : '1px solid #f3f4f6',
                        fontSize: '0.75rem',
                        color: '#374151'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{merchant.name}</td>
                      <td style={{ padding: '12px 16px' }}>{merchant.plan}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 8px',
                          borderRadius: '99px',
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          background: merchant.status === 'Active' ? '#d1fae5' : '#fee2e2',
                          color: merchant.status === 'Active' ? '#065f46' : '#991b1b'
                        }}>
                          {merchant.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/users')}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ffffff',
              border: 'none',
              borderTop: '1px solid #e5e7eb',
              color: '#374151',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fafafa'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
          >
            View All Merchants <ArrowRight size={14} />
          </button>
        </div>

      </div>

      {/* IDLE AUTO-AD OVERLAY SCREEN-SAVER VIEW */}
      {isIdle && currentIdleAd && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          animation: 'fade-in-saver 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        }}>
          
          {/* Ad Card Carousel */}
          <div 
            onClick={() => handleIdleAdClick(currentIdleAd)}
            style={{
              width: adConfig.adDisplayMode === 'FULLSCREEN_SAVER' ? '700px' : '350px',
              maxWidth: '90%',
              borderRadius: '16px',
              background: '#1e293b',
              border: '1px solid #334155',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            <img 
              src={currentIdleAd.imageUrl} 
              alt={currentIdleAd.title}
              style={{
                width: '100%',
                height: adConfig.adDisplayMode === 'FULLSCREEN_SAVER' ? '380px' : '220px',
                objectFit: 'cover'
              }}
            />

            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Sponsored Promo
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  {currentIdleAd.title}
                </h3>
              </div>

              <button style={{
                padding: '10px 20px',
                background: '#7c3aed',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {currentIdleAd.ctaText} <ArrowRight size={16} />
              </button>
            </div>
            
            <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '3px 8px', fontSize: '0.65rem', borderRadius: '4px', fontWeight: 700 }}>
              Ad
            </span>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem', animation: 'pulse-saver 1.5s infinite' }}>
            <MousePointerClick size={16} />
            <span>Move mouse, scroll, or press any key to return to Dashboard</span>
          </div>

          <style>{`
            @keyframes fade-in-saver {
              from { opacity: 0; transform: scale(1.02); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes pulse-saver {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

    </div>
  );
}
