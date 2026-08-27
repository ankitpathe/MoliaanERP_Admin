import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MessageSquare, AlertCircle, CheckCircle, Clock, Search, HelpCircle, ArrowRight, CornerDownRight } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import Card from '../../../components/ui/Card';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Table from '../../../components/ui/Table';

const SEED_HELP_REQUESTS = [
  {
    id: "HELP-001",
    senderName: "Ramesh Sharma",
    senderType: "merchant",
    senderId: "USR001",
    subject: "Need help changing subscription plan",
    description: "I want to switch from WWE Arena Pro plan to WWE Lite, but the change subscription option says it requires admin approval. Please approve.",
    priority: "medium",
    status: "open",
    createdAt: "2026-08-27T10:30:00.000Z"
  },
  {
    id: "HELP-002",
    senderName: "Sohan Singh",
    senderType: "counter operator",
    senderId: "CNT002",
    subject: "Counter POS-02 not syncing",
    description: "POS terminal 2 has internet connectivity but transactions are not getting pushed to the cloud server. Shows offline warning badge.",
    priority: "urgent",
    status: "open",
    createdAt: "2026-08-27T11:45:00.000Z"
  },
  {
    id: "HELP-003",
    senderName: "Ajay Kumar",
    senderType: "staff",
    senderId: "USR002",
    subject: "Unable to print receipt",
    description: "The thermal printer is printing blank pages. We checked paper loading direction and it seems correct. Printer model: Epson TM-T82III.",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-08-27T08:15:00.000Z"
  },
  {
    id: "HELP-004",
    senderName: "Rajesh Patel",
    senderType: "merchant",
    senderId: "USR003",
    subject: "Daily stock report exporting fails",
    description: "When I click 'Export as CSV' in stock reports, it loader spins infinitely. Tested on Chrome and Safari.",
    priority: "low",
    status: "resolved",
    createdAt: "2026-08-26T14:20:00.000Z",
    adminReply: "We have resolved the rendering issues. Please clear cache and try again.",
    resolvedAt: "2026-08-27T09:00:00.000Z"
  },
  {
    id: "HELP-005",
    senderName: "Amit Verma",
    senderType: "counter operator",
    senderId: "CNT001",
    subject: "GST tax calculation error on checkout",
    description: "Tax rate for item category 'Beverages' is computing at 18% instead of the revised 12% in the system master.",
    priority: "urgent",
    status: "open",
    createdAt: "2026-08-27T15:10:00.000Z"
  },
  {
    id: "HELP-006",
    senderName: "Vijay Mathur",
    senderType: "staff",
    senderId: "USR004",
    subject: "Scanner not reading QR coupon",
    description: "Barcode scanner scans EAN-13 correctly but completely ignores the promotional coupon 2D QR codes.",
    priority: "low",
    status: "resolved",
    createdAt: "2026-08-25T11:00:00.000Z",
    adminReply: "Please configure the scanner to enable 2D symbology decoding in scanner manual.",
    resolvedAt: "2026-08-26T10:00:00.000Z"
  }
];

export default function HelpInbox() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Detail viewing
  const [viewingRequest, setViewingRequest] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Load from localStorage
  useEffect(() => {
    let data = [];
    const raw = localStorage.getItem('helpRequests');
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        data = [];
      }
    }
    if (!data || data.length === 0) {
      data = SEED_HELP_REQUESTS;
      localStorage.setItem('helpRequests', JSON.stringify(data));
    }
    setRequests(data);
  }, []);

  // Listen to search query parameter to automatically inspect details (Step 3 integration)
  useEffect(() => {
    const inspectId = searchParams.get('id');
    if (inspectId && requests.length > 0) {
      const match = requests.find(r => r.id === inspectId);
      if (match) {
        setViewingRequest(match);
      }
    }
  }, [searchParams, requests]);

  const saveRequests = (updated) => {
    localStorage.setItem('helpRequests', JSON.stringify(updated));
    setRequests(updated);
    // Dispatch events to notify other components (header and sidebar)
    window.dispatchEvent(new Event('help_requests_updated'));
  };

  // KPIs
  const totalCount = requests.length;
  const openCount = requests.filter(r => r.status === 'open').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved').length;

  // Filter & Sort
  const filtered = requests.filter(r => {
    const matchesSearch = 
      (r.senderName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.subject || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort by urgency: Open + Urgent/High first, then normal date sorting
  const sorted = [...filtered].sort((a, b) => {
    const getPriorityWeight = (priority) => {
      if (priority === 'urgent') return 4;
      if (priority === 'high') return 3;
      if (priority === 'medium') return 2;
      return 1;
    };

    // Prioritize Open/In Progress over Resolved
    const aIsPending = a.status !== 'resolved' ? 1 : 0;
    const bIsPending = b.status !== 'resolved' ? 1 : 0;
    
    if (aIsPending !== bIsPending) {
      return bIsPending - aIsPending;
    }

    // Among pending, prioritize by priority level
    if (aIsPending && bIsPending) {
      const aWeight = getPriorityWeight(a.priority);
      const bWeight = getPriorityWeight(b.priority);
      if (aWeight !== bWeight) {
        return bWeight - aWeight;
      }
    }

    // Default to newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handle status update
  const handleUpdateStatus = (id, newStatus) => {
    const updated = requests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: newStatus,
          resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : r.resolvedAt
        };
      }
      return r;
    });
    saveRequests(updated);
    
    // Update the local viewing state if open
    if (viewingRequest && viewingRequest.id === id) {
      setViewingRequest(prev => ({
        ...prev,
        status: newStatus,
        resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : prev.resolvedAt
      }));
    }

    toast.showSuccess('Status Updated', `Help request status changed to ${newStatus.replace('_', ' ')}.`);
  };

  // Handle Admin Reply
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const updated = requests.map(r => {
      if (r.id === viewingRequest.id) {
        return {
          ...r,
          adminReply: replyText.trim(),
          resolvedAt: r.resolvedAt || (r.status === 'resolved' ? new Date().toISOString() : null)
        };
      }
      return r;
    });

    saveRequests(updated);
    setViewingRequest(prev => ({
      ...prev,
      adminReply: replyText.trim()
    }));
    setReplyText('');
    toast.showSuccess('Reply Sent', 'Your response has been saved to the request record.');
  };

  const getPriorityBadgeVariant = (priority) => {
    if (priority === 'urgent') return 'danger';
    if (priority === 'high') return 'warning';
    if (priority === 'medium') return 'info';
    return 'secondary';
  };

  const getStatusBadgeVariant = (status) => {
    if (status === 'resolved') return 'success';
    if (status === 'in_progress') return 'warning';
    return 'info';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      <PageHeader 
        breadcrumb="Admin / Help Requests" 
        title="Help Requests Inbox" 
        subtitle="Manage and resolve support tickets submitted by merchants, staff, and counter operators."
      />

      {/* KPI Stats Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <StatCard label="Total Requests" value={totalCount} icon={MessageSquare} color="#3b82f6" />
        <StatCard label="Open" value={openCount} icon={AlertCircle} color="#ef4444" />
        <StatCard label="In Progress" value={inProgressCount} icon={Clock} color="#f59e0b" />
        <StatCard label="Resolved" value={resolvedCount} icon={CheckCircle} color="#10b981" />
      </div>

      {/* Filter Controls */}
      <Card style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input 
            placeholder="Search by sender name, issue summary..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div style={{ width: '160px' }}>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </Select>
        </div>
        <div style={{ width: '160px' }}>
          <Select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
      </Card>

      {/* Requests Inbox Table */}
      <Card style={{ padding: '16px' }}>
        <Table headers={[{ label: 'Sender' }, { label: 'Subject / Summary' }, { label: 'Priority' }, { label: 'Status' }, { label: 'Date Received' }, { label: 'Action', style: { textAlign: 'right' } }]}>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
                No help requests matched your filters.
              </td>
            </tr>
          ) : (
            sorted.map(req => {
              const dateStr = new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
              return (
                <tr 
                  key={req.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-muted)', 
                    fontSize: '0.825rem', 
                    color: 'var(--text-primary)',
                    background: req.status === 'open' && req.priority === 'urgent' 
                      ? (document.documentElement.classList.contains('dark') ? 'rgba(239, 68, 68, 0.15)' : '#fff5f5') 
                      : 'transparent'
                  }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{req.senderName}</strong>
                      <div>
                        <Badge variant="secondary">{req.senderType.toUpperCase()}</Badge>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{req.subject}</span>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                        {req.description}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={getPriorityBadgeVariant(req.priority)}>
                      {req.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={getStatusBadgeVariant(req.status)}>
                      {req.status === 'in_progress' ? 'IN PROGRESS' : req.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#6b7280' }}>{dateStr}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Button variant="secondary" onClick={() => setViewingRequest(req)} style={{ padding: '4px 10px', fontSize: '0.725rem' }}>
                      View Request
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </Card>

      {/* Details drawer/modal overlay */}
      {viewingRequest && (
        <>
          <div 
            onClick={() => { setViewingRequest(null); setSearchParams({}); }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '480px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '92vh',
            overflowY: 'auto'
          }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Help Request Detail</span>
              <button 
                type="button" 
                onClick={() => { setViewingRequest(null); setSearchParams({}); }} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}
              >
                ×
              </button>
            </div>

            {/* Sender details and entity link */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Sender Context</span>
              <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{viewingRequest.senderName}</strong> ({viewingRequest.senderType})
                </div>
                {/* Clickable link to matching detail page */}
                {viewingRequest.senderType === 'counter operator' ? (
                  <Link 
                    to={`/admin/counters/${viewingRequest.senderId}`}
                    onClick={() => setViewingRequest(null)}
                    style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}
                  >
                    View Counter <ArrowRight size={12} />
                  </Link>
                ) : (
                  <Link 
                    to={`/admin/users/${viewingRequest.senderId}`}
                    onClick={() => setViewingRequest(null)}
                    style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' }}
                  >
                    View Profile <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>Subject</span>
              <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{viewingRequest.subject}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>Issue Description</span>
              <div style={{ fontSize: '0.8rem', color: '#374151', padding: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                {viewingRequest.description}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Priority</span>
                <div style={{ marginTop: '4px' }}>
                  <Badge variant={getPriorityBadgeVariant(viewingRequest.priority)}>{viewingRequest.priority.toUpperCase()}</Badge>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Status</span>
                <div style={{ marginTop: '4px' }}>
                  <Badge variant={getStatusBadgeVariant(viewingRequest.status)}>{viewingRequest.status.replace('_', ' ').toUpperCase()}</Badge>
                </div>
              </div>
            </div>

            {/* Status change select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#4b5563' }}>Manage Status</span>
              <Select 
                value={viewingRequest.status}
                onChange={e => handleUpdateStatus(viewingRequest.id, e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </Select>
            </div>

            {/* Admin Response section */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>Reply to Requester</span>
              
              {viewingRequest.adminReply && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#7c3aed', fontWeight: 700, marginBottom: '4px' }}>
                    <CornerDownRight size={12} /> Admin Reply Response:
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#4b5563', margin: 0 }}>{viewingRequest.adminReply}</p>
                </div>
              )}

              <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <textarea 
                  rows="3"
                  placeholder="Type response instructions here..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.8rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                  required
                />
                <Button type="submit" variant="purple" style={{ padding: '6px', fontSize: '0.75rem', alignSelf: 'flex-end' }}>
                  Send Reply
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
