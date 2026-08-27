import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Monitor, Activity, Radio, RefreshCw, Trash2, Cpu, Calendar, CreditCard, Clock, ShieldAlert, Edit, ArrowLeft, CheckCircle } from 'lucide-react';
import { toggleCounterStatus, simulateOfflineTransactions } from '../../../utils/syncSimulator';

// Shared UI components import
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';
import SectionDivider from '../../../components/ui/SectionDivider';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

const DUMMY_ACTIVITIES = [
  { text: "Counter telemetry handshake completed", time: "10 mins ago" },
  { text: "Staff session logged in: default_cashier", time: "2 hours ago" },
  { text: "Local transactions data packet sync (success)", time: "3 hours ago" },
  { text: "Receipt printer spooler cleared", time: "Yesterday" },
  { text: "Heartbeat ping validated by JWT Gatekeeper", time: "2 days ago" }
];

export default function CounterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [counter, setCounter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    variant: 'danger'
  });

  const loadCounterDetail = () => {
    setLoading(true);
    const rawCounters = localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters');
    if (!rawCounters) {
      setLoading(false);
      return;
    }

    const countersList = JSON.parse(rawCounters);
    const found = countersList.find(c => 
      String(c.id).toLowerCase() === String(id).toLowerCase() || 
      String(c.code).toLowerCase() === String(id).toLowerCase()
    );

    if (found) {
      // Extend schema with plan/subscription metadata if missing
      let updatedFound = { ...found };
      let needsSave = false;

      if (!updatedFound.planName) {
        // Look up erp_admin_plans to seed
        const plans = JSON.parse(localStorage.getItem('erp_admin_plans') || '[]');
        const defaultPlan = plans[0] || {
          id: 'PLAN-WWE-899',
          title: 'WWE Pro Plan',
          monthlyPrice: 899,
          billingFrequency: 'MONTHLY'
        };

        updatedFound.planId = defaultPlan.id;
        updatedFound.planName = defaultPlan.title;
        updatedFound.planPrice = defaultPlan.monthlyPrice;
        updatedFound.billingFrequency = defaultPlan.billingFrequency || 'MONTHLY';
        
        // 30 days ago
        updatedFound.purchasedDate = new Date(Date.now() - 30 * 24 * 3600000).toISOString().split('T')[0];
        // 15 days remaining
        updatedFound.expiryDate = new Date(Date.now() + 15 * 24 * 3600000).toISOString().split('T')[0];
        
        needsSave = true;
      }

      // Default mock fields if missing
      if (!updatedFound.macAddress) {
        updatedFound.macAddress = "00:1A:2B:3C:4D:5E";
        updatedFound.counterType = "Standard POS Node";
        updatedFound.createdDate = "2026-08-01";
        updatedFound.avgLatency = "14ms";
        updatedFound.syncErrors = 0;
        updatedFound.bufferStatus = "CLEAN (0 pending)";
        updatedFound.totalBillsAllTime = 284;
        updatedFound.avgDailySales = 12450;
        needsSave = true;
      }

      if (needsSave) {
        const updatedList = countersList.map(c => 
          (String(c.id).toLowerCase() === String(id).toLowerCase() || String(c.code).toLowerCase() === String(id).toLowerCase()) ? updatedFound : c
        );
        localStorage.setItem('erp_admin_counters', JSON.stringify(updatedList));
        localStorage.setItem('counters', JSON.stringify(updatedList));
      }

      setCounter(updatedFound);

      // Load activities
      const rawLogs = localStorage.getItem('erp_activity_logs');
      if (rawLogs) {
        try {
          const parsed = JSON.parse(rawLogs);
          const filtered = parsed
            .filter(l => 
              l.resource.includes(updatedFound.code) || 
              l.resource.includes(updatedFound.name) ||
              (l.details && l.details.counterId === updatedFound.id)
            )
            .map(l => ({
              text: `${l.actionDescription || l.action} (${l.module})`,
              time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Just now'
            }));
          setActivities(filtered.length > 0 ? filtered : DUMMY_ACTIVITIES);
        } catch (e) {
          setActivities(DUMMY_ACTIVITIES);
        }
      } else {
        setActivities(DUMMY_ACTIVITIES);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCounterDetail();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      const raw = localStorage.getItem('erp_admin_counters');
      if (raw) {
        const list = JSON.parse(raw);
        const { updated, changed } = simulateOfflineTransactions(list);
        if (changed) {
          localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
          localStorage.setItem('counters', JSON.stringify(updated));
          const found = updated.find(c => String(c.id).toLowerCase() === String(id).toLowerCase() || String(c.code).toLowerCase() === String(id).toLowerCase());
          if (found) {
            setCounter(found);
          }
        }
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [id, counter]);

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto' }} />
        <span style={{ display: 'block', marginTop: '10px', fontSize: '0.85rem' }}>Loading terminal data...</span>
      </div>
    );
  }

  if (!counter) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <ShieldAlert size={48} style={{ color: '#ef4444' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}>Counter Not Found</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>The terminal ID code or resource endpoint does not match any registered counters.</p>
          <Button variant="purple" onClick={() => navigate('/admin/counters/reports')}>
            <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Return to Counter Reports
          </Button>
        </div>
      </div>
    );
  }

  // Toggle counter active/offline status
  const handleToggleStatus = () => {
    const rawCounters = localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters');
    if (rawCounters) {
      const list = JSON.parse(rawCounters);
      const { updatedCounters, nextStatus, processedCount, counterName } = toggleCounterStatus(list, counter.id, counter.status);

      localStorage.setItem('erp_admin_counters', JSON.stringify(updatedCounters));
      localStorage.setItem('counters', JSON.stringify(updatedCounters));
      
      const found = updatedCounters.find(c => c.id === counter.id);
      if (found) {
        setCounter(found);
      }

      toast.showSuccess('Status Updated', `Terminal "${counterName}" is now ${nextStatus}`);
      if (processedCount > 0) {
        toast.showSuccess('Sync Processing', `Synced ${processedCount} queued transactions from ${counterName}`);
      }
    }
  };

  // Renew Plan
  const handleRenewPlan = () => {
    // Extend expiry by 30 days
    const today = new Date();
    const newExpiry = new Date(today.getTime() + 30 * 24 * 3600000).toISOString().split('T')[0];
    
    const rawCounters = localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters');
    if (rawCounters) {
      const list = JSON.parse(rawCounters);
      const updated = list.map(c => 
        (String(c.id).toLowerCase() === String(id).toLowerCase() || String(c.code).toLowerCase() === String(id).toLowerCase())
          ? { ...c, expiryDate: newExpiry, purchasedDate: today.toISOString().split('T')[0] } 
          : c
      );
      localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
      localStorage.setItem('counters', JSON.stringify(updated));
      setCounter(prev => ({ ...prev, expiryDate: newExpiry, purchasedDate: today.toISOString().split('T')[0] }));

      logActivity({
        activityType: 'PLAN_RENEWED',
        module: 'Subscriptions',
        actionDescription: `Renewed SaaS pricing tier for counter "${counter.name}" [New Expiry: ${newExpiry}]`
      });

      toast.showSuccess('Plan Renewed', `Billing tier active. Expiry extended to ${newExpiry}`);
    }
  };

  // Deactivate Counter
  const handleDeactivate = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Deactivate Terminal Counter',
      message: `Are you sure you want to suspend node "${counter.name}"? This stops real-time sync telemetry websocket connections.`,
      variant: 'warning',
      onConfirm: () => {
        const rawCounters = localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters');
        if (rawCounters) {
          const list = JSON.parse(rawCounters);
          const updated = list.map(c => 
            (String(c.id).toLowerCase() === String(id).toLowerCase() || String(c.code).toLowerCase() === String(id).toLowerCase())
              ? { ...c, status: 'OFFLINE' } 
              : c
          );
          localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
          localStorage.setItem('counters', JSON.stringify(updated));
          setCounter(prev => ({ ...prev, status: 'OFFLINE' }));

          logActivity({
            activityType: 'COUNTER_DEACTIVATED',
            module: 'POS Terminals',
            actionDescription: `Deactivated counter terminal: ${counter.name}`
          });
          toast.showSuccess('Node Suspended', 'POS Counter deactivated.');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Delete Counter
  const handleDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete POS Terminal Node',
      message: `Are you sure you want to permanently delete terminal "${counter.name}"? This action clears all local cashier data logs.`,
      variant: 'danger',
      onConfirm: () => {
        const rawCounters = localStorage.getItem('erp_admin_counters') || localStorage.getItem('counters');
        if (rawCounters) {
          const list = JSON.parse(rawCounters);
          const updated = list.filter(c => 
            String(c.id).toLowerCase() !== String(id).toLowerCase() && 
            String(c.code).toLowerCase() !== String(id).toLowerCase()
          );
          localStorage.setItem('erp_admin_counters', JSON.stringify(updated));
          localStorage.setItem('counters', JSON.stringify(updated));

          logActivity({
            activityType: 'COUNTER_DELETED',
            module: 'POS Terminals',
            actionDescription: `Permanently deleted counter node: ${counter.name} [Code: ${counter.code}]`
          });
          toast.showSuccess('Node Deleted', 'Terminal removed from registry.');
          navigate('/admin/counters/reports');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Calculate Expiry Data
  const expiry = new Date(counter.expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining > 0 && daysRemaining < 7;
  const isExpired = daysRemaining <= 0;
  
  const statusBadgeVariant = isExpired ? 'danger' : isExpiringSoon ? 'warning' : 'success';
  const statusBadgeText = isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Page Header */}
      <PageHeader
        breadcrumb={`Admin / Counters / Reports / ${counter.name}`}
        title={counter.name}
        subtitle={`Terminal Code: ${counter.code}`}
        extra={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Badge variant={counter.status === 'ONLINE' ? 'success' : 'danger'}>
              {counter.status}
            </Badge>
            {counter.status === 'OFFLINE' && counter.offlineQueue && counter.offlineQueue.length > 0 && (
              <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, background: '#fee2e2', padding: '2px 8px', borderRadius: '6px', border: '1px solid #fca5a5' }}>
                {counter.offlineQueue.length} Queued to Sync
              </span>
            )}
            <Button 
              variant={counter.status === 'ONLINE' ? 'secondary' : 'primary'} 
              onClick={handleToggleStatus}
              style={{ color: counter.status === 'ONLINE' ? '#ef4444' : '#10b981' }}
            >
              {counter.status === 'ONLINE' ? 'Mark as Offline' : 'Mark as Online'}
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/admin/counters/edit/${counter.id}`)}>
              <Edit size={14} /> Edit Counter
            </Button>
          </div>
        }
      />

      {/* Grid columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left column info stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Basic Information */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Basic Information
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Physical location details, node metadata registry, and assigned cashier.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Counter Name</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>{counter.name || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Counter Code</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>{counter.code || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Location / Branch</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 650, color: '#374151' }}>{counter.location ? counter.location : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Staff</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{counter.assignedStaff ? counter.assignedStaff : <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Printer / Hardware Model</span>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>{counter.printerType || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Device MAC Address</span>
                <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#4b5563' }}>{counter.macAddress || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Counter Type</span>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>{counter.counterType || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Created On</span>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>{counter.createdDate || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned</span>}</span>
              </div>
            </div>
          </Card>

          {/* Subscription & Billing Card */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                  Subscription & Billing
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Active SaaS pricing plan and license limits.</span>
              </div>
              <Badge variant={statusBadgeVariant}>{statusBadgeText}</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Plan Name</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed' }}>{counter.planName}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Plan Price</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>₹{counter.planPrice} / {counter.billingFrequency}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Purchased On</span>
                <span style={{ fontSize: '0.85rem' }}>{counter.purchasedDate}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Expiration Date</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{counter.expiryDate}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Billing Frequency</span>
                <Badge variant={counter.billingFrequency === 'YEARLY' ? 'purple' : 'info'}>
                  {counter.billingFrequency}
                </Badge>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase' }}>Days Remaining</span>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: 800, 
                  color: daysRemaining < 7 ? '#ef4444' : daysRemaining < 30 ? '#f59e0b' : '#10b981' 
                }}>
                  {daysRemaining > 0 ? `${daysRemaining} Days` : 'Expired'}
                </span>
              </div>
            </div>

            <Button variant="purple" onClick={handleRenewPlan} style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
              Renew Plan License
            </Button>
          </Card>

          {/* Sync & Health */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Sync Health & Telemetry
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Real-time database sync packets status.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #f9fafb', paddingBottom: '6px' }}>
                <span style={{ color: '#6b7280', fontWeight: 550 }}>Last Heartbeat Ping</span>
                <span style={{ fontWeight: 600 }}>{new Date(counter.lastHeartbeat).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #f9fafb', paddingBottom: '6px' }}>
                <span style={{ color: '#6b7280', fontWeight: 550 }}>Avg Sync Network Latency</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{counter.avgLatency}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #f9fafb', paddingBottom: '6px' }}>
                <span style={{ color: '#6b7280', fontWeight: 550 }}>Sync Queue Errors (Last 7 Days)</span>
                <span style={{ fontWeight: 700, color: counter.syncErrors > 0 ? '#ef4444' : '#10b981' }}>{counter.syncErrors} Errors</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#6b7280', fontWeight: 550 }}>Database Buffer status</span>
                <span style={{ fontWeight: 600, color: '#0891b2' }}>{counter.bufferStatus}</span>
              </div>
            </div>
          </Card>

        </div>

        {/* Right column info stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Timeline Activity Log */}
          <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>
                Terminal Activity Log
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Chronological operational events mapped to this terminal.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activities.map((act, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.75rem' }}>
                  <div style={{ marginTop: '2px', width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{act.text}</span>
                    <span style={{ fontSize: '0.675rem', color: '#9ca3af' }}>{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Danger Zone */}
          <div style={{ border: '1px solid #fee2e2', background: 'rgba(254, 226, 226, 0.15)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Danger Zone: Counter Controls
              </span>
              <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>
                Suspension stops telemetry pings. Delete operation is irreversible.
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="danger" onClick={handleDeactivate} style={{ padding: '8px 14px', fontSize: '0.75rem', flex: 1, minWidth: '120px' }}>
                Deactivate Counter
              </Button>
              <Button variant="danger" onClick={handleDelete} style={{ padding: '8px 14px', fontSize: '0.75rem', flex: 1, minWidth: '120px' }}>
                Delete Counter
              </Button>
            </div>
          </div>

        </div>

      </div>

      {/* Sales & Usage statistics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Terminal Usage & Sales statistics
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <StatCard label="Shift Sales Today" value={`₹${(counter.grossSalesToday || 0).toLocaleString('en-IN')}`} icon={Activity} color="#4f46e5" />
          <StatCard label="Transactions Today" value={counter.totalBillsToday || 0} icon={Monitor} color="#10b981" />
          <StatCard label="All-Time Bills" value={counter.totalBillsAllTime} icon={Clock} color="#0891b2" />
          <StatCard label="Avg Daily Sales (7d)" value={`₹${counter.avgDailySales.toLocaleString('en-IN')}`} icon={Activity} color="#f59e0b" />
        </div>
      </div>

      {/* Shared ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
