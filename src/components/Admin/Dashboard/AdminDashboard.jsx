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
import { logActivity } from '../../../services/activityLogger';
import { simulateOfflineTransactions } from '../../../utils/syncSimulator';

// Shared UI components
import Card from '../../ui/Card';
import StatCard from '../../ui/StatCard';
import Button from '../../ui/Button';
import Badge from '../../ui/Badge';
import Table from '../../ui/Table';

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

  const [subRequests, setSubRequests] = useState([]);
  const [recentMerchants, setRecentMerchants] = useState([]);

  // Telemetry simulation states
  const [pingLatency, setPingLatency] = useState(14);
  const [lastSyncText, setLastSyncText] = useState('Just now');
  const [offlineQueuedTerminalsAlert, setOfflineQueuedTerminalsAlert] = useState('');

  // Idle Ads Config state
  const [isIdle, setIsIdle] = useState(false);
  const [adConfig, setAdConfig] = useState({ enableIdleAds: false, idleTimeoutSeconds: 10, adDisplayMode: 'FULLSCREEN_SAVER', activeBanners: [] });
  const [currentIdleAdIdx, setCurrentIdleAdIdx] = useState(0);

  const formatLogTime = (timeStr) => {
    if (!timeStr) return 'Just now';
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch (e) {
      return 'Just now';
    }
  };

  useEffect(() => {
    const loadDashboardData = () => {
      // 1. Counters
      const counters = JSON.parse(localStorage.getItem('erp_admin_counters') || '[]');
      const totalCounters = counters.length;
      const onlineCounters = counters.filter(c => String(c.status).toUpperCase() === 'ONLINE').length;

      // Calculate offline queue warning
      const offlineWithQueue = counters.filter(c => c.status === 'OFFLINE' && c.offlineQueue?.length > 0);
      if (offlineWithQueue.length > 0) {
        const totalPending = offlineWithQueue.reduce((sum, c) => sum + (c.offlineQueue?.length || 0), 0);
        setOfflineQueuedTerminalsAlert(`⚠ ${offlineWithQueue.length} terminal${offlineWithQueue.length > 1 ? 's' : ''} offline with ${totalPending} pending sync item${totalPending > 1 ? 's' : ''}.`);
      } else {
        setOfflineQueuedTerminalsAlert('');
      }

      // 2. Plans
      const plans = JSON.parse(localStorage.getItem('erp_admin_plans') || '[]');
      const activePlans = plans.filter(p => String(p.status).toUpperCase() === 'ACTIVE').length || 3;

      // 3. Merchants/Users
      const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
      const totalMerchants = users.length;

      // 4. Sync status
      const syncLogs = JSON.parse(localStorage.getItem('erp_sync_logs') || '[]');
      const pendingSyncs = syncLogs.filter(s => ['PENDING', 'WARNING', 'FAILED', 'QUEUED'].includes(String(s.status).toUpperCase())).length;

      // Calculate relative heartbeat timestamp from sync logs
      if (syncLogs.length > 0) {
        const sorted = [...syncLogs].sort((a, b) => new Date(b.timestamp || b.time || 0) - new Date(a.timestamp || a.time || 0));
        const latest = sorted[0];
        if (latest && (latest.timestamp || latest.time)) {
          setLastSyncText(formatLogTime(latest.timestamp || latest.time));
        }
      } else {
        setLastSyncText('3m ago');
      }

      // Simulated network latency on load
      setPingLatency(Math.floor(12 + Math.random() * 26));

      // 5. Gross Platform Volume
      const rawSales = localStorage.getItem('erp_sales') || localStorage.getItem('sales') || localStorage.getItem('invoices') || '[]';
      const sales = JSON.parse(rawSales);
      const grossVolume = sales.reduce((sum, s) => sum + (Number(s.grandTotal || s.total) || 0), 0);

      // 6. Low stock alert count
      const products = JSON.parse(localStorage.getItem('erp_products') || '[]');
      const lowStockCount = products.filter(p => Number(p.stock) <= 10).length || 0;

      // 7. Recent logs
      const logs = JSON.parse(localStorage.getItem('erp_activity_logs') || '[]');
      const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp || b.createdAt || 0) - new Date(a.timestamp || a.createdAt || 0));
      const recentLogs = sortedLogs.slice(0, 3).map(l => ({
        ...l,
        timeFormatted: formatLogTime(l.timestamp || l.createdAt)
      }));

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

      // 8. Load subscription requests
      const rawReqs = localStorage.getItem('erp_admin_sub_requests');
      let reqsList = [];
      if (rawReqs) {
        reqsList = JSON.parse(rawReqs);
      }
      if (!reqsList || reqsList.length === 0) {
        reqsList = [
          {
            id: "REQ-2026-101",
            merchantName: "Aman Gupta",
            storeName: "Gupta Supermart",
            phone: "9876543210",
            email: "aman@guptamart.com",
            planId: "PLAN-PRO",
            planName: "Gold Pro",
            billingCycle: "YEARLY",
            amount: 6999,
            paymentMode: "UPI / PhonePe",
            utrNumber: "UPI202688491290",
            paymentProofUrl: "",
            requestedAt: new Date(Date.now() - 3600000).toISOString(),
            status: "PENDING"
          },
          {
            id: "REQ-2026-102",
            merchantName: "Pooja Verma",
            storeName: "Verma Organic Store",
            phone: "9811223344",
            email: "pooja@vermaorganics.in",
            planId: "PLAN-BASIC",
            planName: "Silver Starter",
            billingCycle: "MONTHLY",
            amount: 299,
            paymentMode: "Bank IMPS",
            utrNumber: "IMPS7736184920",
            paymentProofUrl: "",
            requestedAt: new Date(Date.now() - 14400000).toISOString(),
            status: "PENDING"
          }
        ];
        localStorage.setItem('erp_admin_sub_requests', JSON.stringify(reqsList));
      }
      setSubRequests(reqsList);

      // 9. Load recent merchants
      const sortedUsers = [...users].sort((a, b) => new Date(b.registeredDate || b.joined || b.createdAt || 0) - new Date(a.registeredDate || a.joined || a.createdAt || 0));
      const recentList = sortedUsers.slice(0, 4).map(u => ({
        id: u.id,
        name: u.storeName || u.name || 'Unnamed Merchant',
        plan: u.planName || u.plan || 'No Active Plan',
        status: u.status || 'Active'
      }));
      setRecentMerchants(recentList);
    };

    loadDashboardData();

    // Load Idle Ads config
    const rawConfig = localStorage.getItem('erp_ad_config');
    let config = { enableIdleAds: true, idleTimeoutSeconds: 10, adDisplayMode: 'FULLSCREEN_SAVER', activeBanners: [] };
    if (rawConfig) {
      config = JSON.parse(rawConfig);
    }
    setAdConfig(config);

    const idleSeconds = Number(config.idleTimeoutSeconds) || 10;

    let timeoutId;
    const resetTimer = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsIdle(true);
      }, idleSeconds * 1000);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const raw = localStorage.getItem('erp_admin_counters');
      if (raw) {
        const list = JSON.parse(raw);
        const { updated, changed } = simulateOfflineTransactions(list);
        if (changed) {
          localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
          localStorage.setItem('counters', JSON.stringify(updated));
          
          // Re-trigger alert calculation
          const offlineWithQueue = updated.filter(c => c.status === 'OFFLINE' && c.offlineQueue?.length > 0);
          if (offlineWithQueue.length > 0) {
            const totalPending = offlineWithQueue.reduce((sum, c) => sum + (c.offlineQueue?.length || 0), 0);
            setOfflineQueuedTerminalsAlert(`⚠ ${offlineWithQueue.length} terminal${offlineWithQueue.length > 1 ? 's' : ''} offline with ${totalPending} pending sync item${totalPending > 1 ? 's' : ''}.`);
          } else {
            setOfflineQueuedTerminalsAlert('');
          }
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeBannersToRender = (adConfig.activeBanners || []).filter(b => b.status === 'ACTIVE').length > 0
    ? adConfig.activeBanners.filter(b => b.status === 'ACTIVE')
    : [
        {
          id: 'DEFAULT-PROMO',
          title: 'Upgrade to Moliaan ERP Gold Pro',
          imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&h=380&auto=format&fit=crop',
          targetUrl: '/admin/plans',
          ctaText: 'View Gold Pro Plan',
          status: 'ACTIVE'
        }
      ];

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
    const raw = localStorage.getItem('erp_admin_sub_requests') || '[]';
    const reqs = JSON.parse(raw);
    const matchedReq = reqs.find(r => r.id === id);
    if (!matchedReq) return;

    const updated = reqs.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r);
    localStorage.setItem('erp_admin_sub_requests', JSON.stringify(updated));
    setSubRequests(updated);

    // Update merchant plan in users list
    const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.storeName === matchedReq.storeName || u.name === matchedReq.merchantName) {
        return { ...u, planName: matchedReq.planName, planId: matchedReq.planId, status: 'Active' };
      }
      return u;
    });
    localStorage.setItem('erp_users', JSON.stringify(updatedUsers));

    // Audit logs
    logActivity({
      activityType: 'SUBSCRIPTION_REQUEST_APPROVED',
      module: 'Subscriptions',
      actionDescription: `Approved plan "${matchedReq.planName}" upgrade request for ${matchedReq.storeName} (${matchedReq.merchantName})`
    });

    toast.showSuccess('Approved', `Subscription request for "${merchant}" approved successfully.`);
  };

  const handleRejectRequest = (id, merchant) => {
    const raw = localStorage.getItem('erp_admin_sub_requests') || '[]';
    const reqs = JSON.parse(raw);

    const updated = reqs.map(r => r.id === id ? { ...r, status: 'REJECTED', rejectReason: 'Rejected via Dashboard' } : r);
    localStorage.setItem('erp_admin_sub_requests', JSON.stringify(updated));
    setSubRequests(updated);

    toast.showInfo('Rejected', `Subscription request for "${merchant}" was rejected.`);
  };

  const pendingRequests = subRequests.filter(r => r.status === 'PENDING');

  const statCards = [
    { label: 'POS Terminals', value: metrics.totalCounters, subtext: `${metrics.onlineCounters} Online`, icon: Monitor, color: '#035096', path: '/admin/counters/reports' },
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Admin Dashboard
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
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
      <div className="responsive-grid-4">
        {statCards.map((card, idx) => (
          <div key={idx} onClick={() => navigate(card.path)} style={{ cursor: 'pointer' }}>
            <StatCard 
              label={card.label} 
              value={card.value} 
              icon={card.icon} 
              color={card.color} 
            />
          </div>
        ))}
      </div>

      {/* Quick Action Launchpad */}
      <Card style={{ padding: '24px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>
          Quick Action Launchpad
        </span>
        <div className="quick-actions-grid">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 12px',
                  background: 'var(--bg-control)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#035096';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-muted)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(3, 80, 150, 0.08)',
                  color: '#035096',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <Icon size={16} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
                  {action.label}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two-Column Mid Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Sync Health & Telemetry */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-control)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sync Health & Telemetry
              </span>
              <Badge variant="warning">
                {metrics.pendingSyncs} Queue Batches
              </Badge>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Gateway Ping Latency</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {pingLatency}ms (Simulated)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-muted)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Last Sync Heartbeat</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 700 }}>{lastSyncText}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Database Buffer Status</span>
                <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>
                  {metrics.pendingSyncs > 0 ? `${Math.max(90, 100 - metrics.pendingSyncs)}% Synced` : '100% Synced'}
                </span>
              </div>
              {offlineQueuedTerminalsAlert && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 20px', background: 'rgba(239, 68, 68, 0.08)', borderTop: '1px solid var(--border-muted)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, textAlign: 'center' }}>
                  {offlineQueuedTerminalsAlert}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/data-sync/report')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderTop: '1px solid var(--border-muted)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-control)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            View Sync Queue <ArrowRight size={14} />
          </button>
        </Card>

        {/* Developer Audit Logs */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-control)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Developer Audit Logs
              </span>
              <HardDrive size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {metrics.recentLogs.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '24px', textAlign: 'center' }}>No recent activities.</span>
              ) : (
                metrics.recentLogs.map((log, idx) => (
                  <div 
                    key={log.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '14px 20px', 
                      borderBottom: idx === metrics.recentLogs.length - 1 ? 'none' : '1px solid var(--border-muted)' 
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', marginRight: '16px' }}>
                      <span 
                        style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}
                        title={log.actionDescription}
                      >
                        {log.actionDescription}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.module} • {log.userName || log.operator || 'System'}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{log.timeFormatted || 'Just now'}</span>
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
              background: 'transparent',
              border: 'none',
              borderTop: '1px solid var(--border-muted)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-control)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            View All Logs <ArrowRight size={14} />
          </button>
        </Card>

      </div>

      {/* Two Lower Lists: Sub requests & Recent Merchants */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Subscription Requests Widget */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-control)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subscription Requests
              </span>
              <Badge variant="danger">
                {pendingRequests.length} Pending
              </Badge>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pendingRequests.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No pending subscription requests.
                </div>
              ) : (
                pendingRequests.map((req, idx) => (
                  <div 
                    key={req.id} 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      padding: '14px 20px', 
                      borderBottom: idx === pendingRequests.length - 1 ? 'none' : '1px solid var(--border-muted)' 
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>{req.merchantName || req.merchant}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Plan: {req.planName || req.plan} • {formatLogTime(req.requestedAt || req.date)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button 
                        variant="purple"
                        onClick={() => handleApproveRequest(req.id, req.merchantName || req.merchant)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <Check size={12} /> Approve
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => handleRejectRequest(req.id, req.merchantName || req.merchant)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}
                      >
                        <X size={12} /> Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <button
            onClick={() => navigate('/admin/subscriptions/requests')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderTop: '1px solid var(--border-muted)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-control)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Manage Requests <ArrowRight size={14} />
          </button>
        </Card>

        {/* Recently Added Merchants */}
        <Card style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-muted)', background: 'var(--bg-control)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Recently Added Merchants
              </span>
              <Store size={16} style={{ color: 'var(--text-muted)' }} />
            </div>

            <Table headers={[{ label: 'Merchant' }, { label: 'SaaS Plan' }, { label: 'Status' }]} style={{ borderRadius: '0', border: 'none', boxShadow: 'none' }}>
              {recentMerchants.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No registered merchants.
                  </td>
                </tr>
              ) : (
                recentMerchants.map((merchant) => (
                  <tr 
                    key={merchant.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-muted)',
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{merchant.name}</td>
                    <td style={{ padding: '12px 16px' }}>{merchant.plan}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={merchant.status === 'Active' ? 'success' : 'danger'}>
                        {merchant.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </div>

          <button
            onClick={() => navigate('/admin/users')}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderTop: '1px solid var(--border-muted)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-control)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            View All Merchants <ArrowRight size={14} />
          </button>
        </Card>

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
                background: '#035096',
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
