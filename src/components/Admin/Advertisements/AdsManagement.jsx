import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Megaphone, Play, Pause, Trash2, Plus, Download, Eye, ExternalLink, Activity, Sparkles, AlertTriangle, IndianRupee, CreditCard, RefreshCw, X } from 'lucide-react';
import Card from '../../ui/Card';
import PageHeader from '../../ui/PageHeader';
import StatCard from '../../ui/StatCard';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Badge from '../../ui/Badge';
import Table from '../../ui/Table';
import AdImage from './AdImage';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { saveImage, deleteImage } from '../../../utils/imageStorage';

const IMAGE_LIMITS = {
  maxSizeBytes: 2 * 1024 * 1024,
  maxSizeMB: 2,
  dimensions: {
    Sidebar: { recommended: "300x600px", maxWidth: 400, maxHeight: 800 },
    Footer: { recommended: "728x90px", maxWidth: 800, maxHeight: 200 }
  }
};

const SEED_ADS = [
  {
    id: "AD-2026-01",
    title: "Moliaan ERP Pro Upgrade Banner",
    advertiser: "Moliaan Corp",
    placement: "Merchant Dashboard (Vertical Skyscraper)",
    aspectRatio: "1:2 (300x600)",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=600&auto=format&fit=crop&q=80",
    targetUrl: "https://moliaan.com/pricing",
    impressions: 4820,
    clicks: 342,
    revenue: 15000,
    paymentStatus: "paid",
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: new Date(Date.now() + 86400000 * 3).toISOString(), // Expiring in 3 days for alert banner test
    status: "ACTIVE"
  },
  {
    id: "AD-2026-02",
    title: "Fast GST Billing & Thermal Print Promo",
    advertiser: "Apex Hardware Solutions",
    placement: "POS Dual-Screen (Horizontal Leaderboard)",
    aspectRatio: "16:9 (1200x628)",
    imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&auto=format&fit=crop&q=80",
    targetUrl: "https://moliaan.com/features",
    impressions: 12450,
    clicks: 890,
    revenue: 25000,
    paymentStatus: "paid",
    startDate: "2026-08-15T00:00:00.000Z",
    endDate: "2026-10-15T00:00:00.000Z",
    status: "ACTIVE"
  },
  {
    id: "AD-2026-03",
    title: "Weekend Discount Cashier Receipt Footer",
    advertiser: "WWE Arena Supermart",
    placement: "Thermal Invoice Footer",
    aspectRatio: "Text & Mini QR",
    imageUrl: "",
    targetUrl: "https://moliaan.com/offers",
    impressions: 1820,
    clicks: 45,
    revenue: 5000,
    paymentStatus: "pending",
    startDate: "2026-07-01T00:00:00.000Z",
    endDate: "2026-08-20T00:00:00.000Z",
    status: "EXPIRED"
  }
];

export default function AdsManagement() {
  const toast = useToast();
  const [ads, setAds] = useState([]);

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [slotTypeFilter, setSlotTypeFilter] = useState('ALL');
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);

  // Bulk actions state
  const [selectedAdIds, setSelectedAdIds] = useState([]);

  // Modal and inspector states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [showScheduleSettings, setShowScheduleSettings] = useState(false);
  const [showBillingSettings, setShowBillingSettings] = useState(false);
  const [inspectingAd, setInspectingAd] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  // Form states
  const [title, setTitle] = useState('');
  const [advertiser, setAdvertiser] = useState('');
  const [placement, setPlacement] = useState('Sidebar');
  const [aspectRatio, setAspectRatio] = useState('1:2 (300x600)');
  const [targetUrl, setTargetUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [revenue, setRevenue] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [uploadMode, setUploadMode] = useState('FILE'); // 'URL' | 'FILE'
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Scheduling states
  const [restrictHours, setRestrictHours] = useState(false);
  const [activeStartTime, setActiveStartTime] = useState('09:00');
  const [activeEndTime, setActiveEndTime] = useState('22:00');
  const [activeDays, setActiveDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [rotationSpeed, setRotationSpeed] = useState(8);

  useEffect(() => {
    const loadAds = () => {
      const raw = localStorage.getItem('erp_admin_ads');
      let data = [];
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (e) {
          data = [];
        }
      }
      if (!data || data.length === 0) {
        data = SEED_ADS;
      }
      const normalized = data.map(ad => {
        return {
          id: ad.id || "AD-" + Date.now().toString().slice(-4),
          title: ad.title || "Generic Campaign",
          advertiser: ad.advertiser || "Direct Sponsor",
          placement: ad.placement || "Merchant Dashboard (Vertical Skyscraper)",
          aspectRatio: ad.aspectRatio || "1:2 (300x600)",
          imageUrl: ad.imageUrl || "",
          imageStorageType: ad.imageStorageType || "",
          imageId: ad.imageId || "",
          targetUrl: ad.targetUrl || "https://moliaan.com",
          impressions: Number(ad.impressions) >= 0 ? Number(ad.impressions) : 0,
          clicks: Number(ad.clicks) >= 0 ? Number(ad.clicks) : 0,
          revenue: Number(ad.revenue) >= 0 ? Number(ad.revenue) : 0,
          paymentStatus: ad.paymentStatus || "paid",
          startDate: ad.startDate || new Date().toISOString(),
          endDate: ad.endDate || new Date(Date.now() + 86400000 * 30).toISOString(),
          restrictHours: ad.restrictHours === undefined ? false : ad.restrictHours,
          activeStartTime: ad.activeStartTime || "09:00",
          activeEndTime: ad.activeEndTime || "22:00",
          activeDays: ad.activeDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
          rotationSpeed: Number(ad.rotationSpeed) || 5,
          status: ad.status || "ACTIVE"
        };
      });
      localStorage.setItem('erp_admin_ads', JSON.stringify(normalized));
      setAds(normalized);
    };
    loadAds();
  }, []);

  const saveAds = (updated) => {
    localStorage.setItem('erp_admin_ads', JSON.stringify(updated));
    setAds(updated);
  };

  const isAdCurrentlyEligible = (ad) => {
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    if (now < start || now > end) return false;

    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDay = daysOfWeek[now.getDay()];
    const activeDays = ad.activeDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    if (!activeDays.includes(currentDay)) return false;

    if (ad.restrictHours && ad.activeStartTime && ad.activeEndTime) {
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      if (currentTimeString < ad.activeStartTime || currentTimeString > ad.activeEndTime) {
        return false;
      }
    }
    return true;
  };

  const getAdStatus = (ad) => {
    if (ad.status === 'PAUSED') return 'PAUSED';
    const now = new Date();
    if (new Date(ad.endDate) < now) return 'EXPIRED';
    if (new Date(ad.startDate) > now) return 'SCHEDULED';
    if (isAdCurrentlyEligible(ad)) return 'LIVE_NOW';
    return 'OUTSIDE_HOURS';
  };

  // KPIs
  const activeCampaignsCount = ads.filter(a => a.status === 'ACTIVE' && isAdCurrentlyEligible(a)).length;
  const totalImpressions = ads.reduce((s, a) => s + (Number(a.impressions) || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (Number(a.clicks) || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const totalAdRevenue = ads.reduce((s, a) => s + (Number(a.revenue) || 0), 0);

  // Toggle status
  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = ads.map(a => a.id === id ? { ...a, status: newStatus } : a);
    saveAds(updated);
    toast.showSuccess('Status Toggled', `Campaign is now ${newStatus}.`);
  };

  const handleEditClick = (ad) => {
    setEditingAd(ad);
    setTitle(ad.title || '');
    setAdvertiser(ad.advertiser || '');
    setPlacement(ad.placement === 'Merchant Dashboard (Vertical Skyscraper)' ? 'Sidebar' : ad.placement === 'POS Dual-Screen (Horizontal Leaderboard)' ? 'Footer' : ad.placement);
    setAspectRatio(ad.aspectRatio || '1:2 (300x600)');
    setTargetUrl(ad.targetUrl || '');
    setImageUrl(ad.imageUrl || '');
    setUploadMode(ad.imageStorageType === 'indexeddb' ? 'FILE' : 'URL');
    setRevenue(ad.revenue || '');
    setPaymentStatus(ad.paymentStatus || 'paid');
    setStartDate(ad.startDate ? ad.startDate.slice(0, 10) : '');
    setEndDate(ad.endDate ? ad.endDate.slice(0, 10) : '');
    setRestrictHours(ad.restrictHours || false);
    setActiveStartTime(ad.activeStartTime || '09:00');
    setActiveEndTime(ad.activeEndTime || '22:00');
    setRotationSpeed(ad.rotationSpeed || 8);
    setShowCreateModal(true);
  };

  const handleNewAdClick = () => {
    setEditingAd(null);
    setTitle('');
    setAdvertiser('');
    setPlacement('Sidebar');
    setTargetUrl('');
    setImageUrl('');
    setUploadMode('FILE');
    setRevenue('');
    setPaymentStatus('paid');
    setStartDate('');
    setEndDate('');
    setRestrictHours(false);
    setRotationSpeed(8);
    setShowCreateModal(true);
  };

  // Delete Campaign
  const handleDelete = (id, label) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Ad Campaign',
      message: `Are you sure you want to delete campaign "${label}"?`,
      onConfirm: () => {
        const updated = ads.filter(a => a.id !== id);
        saveAds(updated);
        deleteImage(id); // delete associated file from storage if any
        toast.showSuccess('Campaign Deleted', 'The advertising campaign was removed.');
        setSelectedAdIds(prev => prev.filter(x => x !== id));
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Extend campaign by 30 days
  const handleExtendCampaign = (id) => {
    const updated = ads.map(a => {
      if (a.id === id) {
        const currentEnd = new Date(a.endDate).getTime();
        const newEnd = new Date(currentEnd + 86400000 * 30).toISOString();
        return { ...a, endDate: newEnd, status: 'ACTIVE' };
      }
      return a;
    });
    saveAds(updated);
    toast.showSuccess('Campaign Extended', 'Ad campaign validity extended by 30 days.');
  };

  // Save new/edited campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!title || !advertiser || !targetUrl) {
      toast.showError('Validation Error', 'Please fill in Title, Brand and Redirect URL.');
      return;
    }

    const campaignId = editingAd ? editingAd.id : ("AD-" + Date.now().toString().slice(-4));
    let finalImageUrl = imageUrl;
    let imageStorageType = editingAd ? editingAd.imageStorageType : "";
    let imageId = editingAd ? editingAd.imageId : "";

    if (uploadMode === 'FILE' && selectedFile) {
      try {
        await saveImage(campaignId, selectedFile);
        imageStorageType = "indexeddb";
        imageId = campaignId;
        finalImageUrl = "";
      } catch (err) {
        toast.showError('Storage Limit', 'Could not save file to storage. File may be too large.');
        return;
      }
    }

    const adData = {
      id: campaignId,
      title,
      advertiser: advertiser.trim(),
      placement,
      aspectRatio: placement === 'Sidebar' ? '1:2 (300x600)' : '16:9 (1200x628)',
      imageUrl: finalImageUrl,
      imageStorageType,
      imageId,
      targetUrl,
      impressions: editingAd ? editingAd.impressions : 0,
      clicks: editingAd ? editingAd.clicks : 0,
      revenue: parseFloat(revenue) || 0,
      paymentStatus: paymentStatus,
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 86400000 * 365 * 10).toISOString(),
      restrictHours,
      activeStartTime,
      activeEndTime,
      activeDays: editingAd ? editingAd.activeDays : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      rotationSpeed: Number(rotationSpeed) || 8,
      status: editingAd ? editingAd.status : "ACTIVE"
    };

    let updated;
    if (editingAd) {
      updated = ads.map(a => a.id === editingAd.id ? adData : a);
      toast.showSuccess('Campaign Updated', `Ad Campaign "${title}" was updated successfully.`);
    } else {
      updated = [adData, ...ads];
      toast.showSuccess('Campaign Created', `Ad Campaign "${title}" launched successfully.`);
    }

    saveAds(updated);

    logActivity({
      activityType: editingAd ? 'AD_CAMPAIGN_UPDATED' : 'AD_CAMPAIGN_CREATED',
      module: 'Advertisements',
      actionDescription: `${editingAd ? 'Updated' : 'Created'} ad campaign "${title}" targeting ${placement}.`
    });

    setShowCreateModal(false);
    setEditingAd(null);
    setTitle('');
    setAdvertiser('');
    setTargetUrl('');
    setStartDate('');
    setEndDate('');
    setRevenue('');
    setImageUrl('');
    setSelectedFile(null);
    setRestrictHours(false);
    setRotationSpeed(8);
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > IMAGE_LIMITS.maxSizeBytes) {
        toast.showError('File Too Large', `Maximum file size allowed is ${IMAGE_LIMITS.maxSizeMB} MB.`);
        e.target.value = '';
        return;
      }

      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        const key = placement === 'Footer' || placement.includes('Leaderboard') ? 'Footer' : 'Sidebar';
        const limit = IMAGE_LIMITS.dimensions[key];
        
        if (width > limit.maxWidth || height > limit.maxHeight) {
          toast.showError('Dimension Mismatch', `Banner dimensions exceed maximum allowed size (${limit.maxWidth}x${limit.maxHeight}px). Recommended size: ${limit.recommended}.`);
          setSelectedFile(null);
          e.target.value = '';
          return;
        }
        setSelectedFile(file);
      };
    }
  };

  // Live filter applications
  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      (ad.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (ad.advertiser || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || ad.status === statusFilter;

    let matchesSlot = true;
    if (slotTypeFilter !== 'ALL') {
      if (slotTypeFilter === 'VERTICAL') {
        matchesSlot = ad.placement.includes('Vertical') || ad.aspectRatio.includes('1:2') || ad.placement === 'Sidebar';
      } else if (slotTypeFilter === 'HORIZONTAL') {
        matchesSlot = ad.placement.includes('Horizontal') || ad.aspectRatio.includes('16:9') || ad.placement === 'Footer';
      }
    }

    return matchesSearch && matchesStatus && matchesSlot;
  });

  // Expiry checks (active ads expiring within next 7 days)
  const expiringAds = ads.filter(ad => {
    if (ad.status !== 'ACTIVE') return false;
    const diff = new Date(ad.endDate).getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  });

  // Derived Advertiser Directory calculation
  const advertiserGroups = ads.reduce((acc, ad) => {
    const adv = ad.advertiser || 'Direct Sponsor';
    if (!acc[adv]) {
      acc[adv] = { name: adv, totalCampaigns: 0, totalRevenue: 0, lastDate: null };
    }
    acc[adv].totalCampaigns += 1;
    acc[adv].totalRevenue += Number(ad.revenue) || 0;
    const adDate = new Date(ad.startDate).getTime();
    if (!acc[adv].lastDate || adDate > new Date(acc[adv].lastDate).getTime()) {
      acc[adv].lastDate = ad.startDate;
    }
    return acc;
  }, {});
  const advertisersList = Object.values(advertiserGroups);

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedAdIds(filteredAds.map(a => a.id));
    } else {
      setSelectedAdIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedAdIds.includes(id)) {
      setSelectedAdIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedAdIds(prev => [...prev, id]);
    }
  };

  const handleBulkPause = () => {
    const updated = ads.map(a => selectedAdIds.includes(a.id) ? { ...a, status: 'PAUSED' } : a);
    saveAds(updated);
    toast.showSuccess('Bulk Action Success', `Paused ${selectedAdIds.length} campaigns.`);
    setSelectedAdIds([]);
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Bulk Delete Campaigns',
      message: `Are you sure you want to permanently delete the ${selectedAdIds.length} selected campaigns?`,
      onConfirm: () => {
        const updated = ads.filter(a => !selectedAdIds.includes(a.id));
        saveAds(updated);
        selectedAdIds.forEach(id => deleteImage(id));
        toast.showSuccess('Bulk Action Success', `Permanently deleted selected campaigns.`);
        setSelectedAdIds([]);
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleExportCSV = (adsToExport) => {
    const headers = ['Campaign ID', 'Title', 'Advertiser', 'Placement', 'Aspect Ratio', 'Target URL', 'Impressions', 'Clicks', 'CTR %', 'Revenue (INR)', 'Payment Status', 'Start Date', 'End Date', 'Status'];
    const rows = adsToExport.map(a => {
      const ctr = a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(2) : '0.00';
      return [
        a.id,
        `"${a.title.replace(/"/g, '""')}"`,
        `"${a.advertiser.replace(/"/g, '""')}"`,
        `"${a.placement}"`,
        a.aspectRatio,
        a.targetUrl,
        a.impressions,
        a.clicks,
        ctr,
        a.revenue,
        a.paymentStatus,
        a.startDate,
        a.endDate,
        a.status
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Campaign_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.showSuccess('Report Exported', 'CSV Campaign report downloaded.');
  };

  const activeFooterAds = ads.filter(a => a.status === 'ACTIVE' && (a.placement === 'Footer' || a.placement.includes('Leaderboard')) && isAdCurrentlyEligible(a));
  const activeSidebarAds = ads.filter(a => a.status === 'ACTIVE' && (a.placement === 'Sidebar' || a.placement.includes('Skyscraper')) && isAdCurrentlyEligible(a));

  const tableHeaders = [
    { label: 'Ad Info' },
    { label: 'Placement' },
    { label: 'Rotation' },
    { label: 'Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
      
      <PageHeader
        breadcrumb="Admin / Campaigns"
        title="Promotions & Ads Dashboard"
        subtitle="Manage central advertisements, dashboard banners, and cashier receipt promotions."
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={() => handleExportCSV(ads)}>
              <Download size={14} /> Export Report
            </Button>
            <Button variant="purple" onClick={handleNewAdClick}>
              <Plus size={14} /> New Ad Campaign
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <StatCard label="Active Campaigns" value={activeCampaignsCount} icon={Sparkles} color="#7c3aed" />
        <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} icon={Megaphone} color="#06b6d4" />
        <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} icon={ExternalLink} color="#10b981" />
        <StatCard label="Avg. Click-Through Rate" value={`${avgCTR}%`} icon={Activity} color="#ef4444" />
        <StatCard label="Total Ad Revenue" value={`₹${totalAdRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="#059669" />
      </div>

      {/* Expiry Alerts Banner */}
      {expiringAds.length > 0 && !isAlertDismissed && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} style={{ color: '#d97706', marginTop: '2px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400e' }}>
                {expiringAds.length} campaign(s) expiring soon
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                {expiringAds.map(a => (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#b45309' }}>
                    <span>• {a.title} ({a.advertiser}) — Ends: {new Date(a.endDate).toLocaleDateString()}</span>
                    <button 
                      onClick={() => handleExtendCampaign(a.id)}
                      style={{ background: '#f59e0b', border: 'none', borderRadius: '4px', color: '#ffffff', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Quick Renew (30d)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => setIsAlertDismissed(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search & Filters Controls */}
      <Card style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <Input 
            placeholder="Search campaigns, advertiser clients..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div style={{ width: '150px' }}>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
          </Select>
        </div>
        <div style={{ width: '160px' }}>
          <Select value={slotTypeFilter} onChange={e => setSlotTypeFilter(e.target.value)}>
            <option value="ALL">All Slot Types</option>
            <option value="VERTICAL">Vertical Skyscraper</option>
            <option value="HORIZONTAL">Horizontal Banner</option>
          </Select>
        </div>
      </Card>

      {/* Bulk actions panel */}
      {selectedAdIds.length > 0 && (
        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b21a8' }}>
            {selectedAdIds.length} campaigns selected
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={handleBulkPause} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Pause Selected
            </Button>
            <Button variant="secondary" onClick={() => handleExportCSV(ads.filter(a => selectedAdIds.includes(a.id)))} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Export Selected
            </Button>
            <Button variant="danger" onClick={handleBulkDelete} style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Rotation Status Info Note */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-control)', border: '1px solid var(--border-muted)', padding: '10px 14px', borderRadius: '10px' }}>
        <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          🔄 Current Rotation Status:
        </span>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
            <strong>Sidebar:</strong> {activeSidebarAds.length} active ad{activeSidebarAds.length !== 1 ? 's' : ''} {activeSidebarAds.length > 0 && `(rotating every ${activeSidebarAds[0]?.rotationSpeed || 8}s)`}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>
            <strong>Footer:</strong> {activeFooterAds.length} active ad{activeFooterAds.length !== 1 ? 's' : ''} {activeFooterAds.length > 0 && `(rotating every ${activeFooterAds[0]?.rotationSpeed || 8}s)`}
          </span>
        </div>
      </div>

      {/* Table view */}
      <Card style={{ padding: '16px' }}>
        <Table headers={tableHeaders}>
          {filteredAds.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
                No ads matching filters.
              </td>
            </tr>
          ) : (
            filteredAds.map(ad => {
              const compStatus = getAdStatus(ad);
              const badgeVariant = 
                compStatus === 'LIVE_NOW' ? 'success' :
                compStatus === 'PAUSED' ? 'warning' :
                compStatus === 'EXPIRED' ? 'danger' :
                compStatus === 'SCHEDULED' ? 'info' : 'secondary';
              
              const badgeLabel = 
                compStatus === 'LIVE_NOW' ? 'Active' :
                compStatus === 'PAUSED' ? 'Paused' :
                compStatus === 'EXPIRED' ? 'Expired' :
                compStatus === 'SCHEDULED' ? 'Scheduled' : 'Inactive';

              return (
                <tr key={ad.id} style={{ borderBottom: '1px solid var(--border-muted)', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-control)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {ad.imageUrl || ad.imageId ? (
                          <AdImage ad={ad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Megaphone size={14} style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ad.title}</strong>
                        <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{ad.advertiser}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={ad.placement === 'Footer' || ad.placement.includes('Leaderboard') ? 'info' : 'secondary'}>
                      {ad.placement === 'Footer' || ad.placement.includes('Leaderboard') ? 'Footer' : 'Sidebar'}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{ad.rotationSpeed || 8}s</td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" onClick={() => handleEditClick(ad)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                        Edit
                      </Button>
                      <Button variant="secondary" onClick={() => handleToggleStatus(ad.id, ad.status)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                        {ad.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button variant="secondary" onClick={() => handleDelete(ad.id, ad.title)} style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#ef4444' }}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </Card>

      {/* Advertiser Directory Section */}
      <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Advertiser Client Directory</h3>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Aggregated statistics and total campaign expenditures per client.</span>
        </div>
        <Table headers={[{ label: 'Advertiser / Brand' }, { label: 'Total Campaigns' }, { label: 'Total Contribution' }, { label: 'Latest Launch Date' }]}>
          {advertisersList.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '20px 0', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
                No advertiser directory records.
              </td>
            </tr>
          ) : (
            advertisersList.map((adv, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.75rem' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>{adv.name}</td>
                <td style={{ padding: '10px 12px' }}>{adv.totalCampaigns} Campaigns</td>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#059669' }}>₹{adv.totalRevenue.toLocaleString('en-IN')}</td>
                <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                  {adv.lastDate ? new Date(adv.lastDate).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {/* New/Edit Campaign Modal */}
      {showCreateModal && (
        <>
          <div 
            onClick={() => { setShowCreateModal(false); setEditingAd(null); }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <form onSubmit={handleCreateCampaign} style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '445px',
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-muted)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ borderBottom: '1px solid var(--border-muted)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {editingAd ? 'Edit Ad Campaign' : 'Create Ad Campaign'}
              </span>
              <button 
                type="button" 
                onClick={() => { setShowCreateModal(false); setEditingAd(null); }} 
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Campaign Title *</span>
              <Input 
                type="text" 
                placeholder="e.g. Pro Upgrade Offer"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Advertiser / Brand Name *</span>
              <Input 
                type="text" 
                placeholder="e.g. Apex Hardware Solutions"
                value={advertiser}
                onChange={e => setAdvertiser(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Placement *</span>
              <Select value={placement} onChange={e => { setPlacement(e.target.value); setSelectedFile(null); }}>
                <option value="Sidebar">Sidebar Banner</option>
                <option value="Footer">Footer Banner</option>
              </Select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Image Creative</span>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-muted)', gap: '12px', marginBottom: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setUploadMode('FILE')}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    background: 'transparent',
                    borderBottom: uploadMode === 'FILE' ? '2px solid var(--accent-primary)' : 'none',
                    color: uploadMode === 'FILE' ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Upload File
                </button>
                <button 
                  type="button" 
                  onClick={() => setUploadMode('URL')}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    background: 'transparent',
                    borderBottom: uploadMode === 'URL' ? '2px solid var(--accent-primary)' : 'none',
                    color: uploadMode === 'URL' ? 'var(--text-primary)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Image URL
                </button>
              </div>

              {uploadMode === 'URL' ? (
                <Input 
                  type="text" 
                  placeholder="https://example.com/banner.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}
                  />
                  <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Max file size: {IMAGE_LIMITS.maxSizeMB}MB • Recommended: {IMAGE_LIMITS.dimensions[placement === 'Footer' ? 'Footer' : 'Sidebar']?.recommended}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Target Redirect URL *</span>
              <Input 
                type="text" 
                placeholder="https://example.com"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>Rotation Interval (seconds) *</span>
              <Input 
                type="number"
                min="1"
                max="60"
                value={rotationSpeed}
                onChange={e => setRotationSpeed(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                Ad will show for {rotationSpeed || 8} seconds before rotating.
              </span>
            </div>

            {/* SCHEDULE SECTION (COLLAPSED OPTIONAL) */}
            <button 
              type="button" 
              onClick={() => setShowScheduleSettings(!showScheduleSettings)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--bg-control)',
                border: '1px solid var(--border-muted)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>Schedule Settings (optional)</span>
              <span>{showScheduleSettings ? '▲' : '▼'}</span>
            </button>

            {showScheduleSettings && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid var(--border-muted)', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Start Date</span>
                    <Input 
                      type="date" 
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>End Date</span>
                    <Input 
                      type="date" 
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Restrict to specific hours</span>
                  <input 
                    type="checkbox" 
                    checked={restrictHours}
                    onChange={e => setRestrictHours(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </div>

                {restrictHours && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Start Time</span>
                      <input 
                        type="time" 
                        value={activeStartTime}
                        onChange={e => setActiveStartTime(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-muted)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>End Time</span>
                      <input 
                        type="time" 
                        value={activeEndTime}
                        onChange={e => setActiveEndTime(e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-muted)',
                          fontSize: '0.8rem',
                          outline: 'none',
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BILLING INFO SECTION (COLLAPSED OPTIONAL) */}
            <button 
              type="button" 
              onClick={() => setShowBillingSettings(!showBillingSettings)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'var(--bg-control)',
                border: '1px solid var(--border-muted)',
                color: 'var(--text-primary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>Billing Info (optional)</span>
              <span>{showBillingSettings ? '▲' : '▼'}</span>
            </button>

            {showBillingSettings && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', border: '1px solid var(--border-muted)', borderRadius: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ad Revenue (₹)</span>
                    <Input 
                      type="number" 
                      placeholder="e.g. 15000"
                      value={revenue}
                      onChange={e => setRevenue(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Payment Status</span>
                    <Select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button 
                type="button" 
                onClick={() => { setShowCreateModal(false); setEditingAd(null); }}
                style={{ flex: 1, padding: '10px', background: 'var(--bg-control)', border: '1px solid var(--border-muted)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 1, padding: '10px', background: 'var(--accent-primary)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                {editingAd ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </>
      )}

      {/* Inspect / Preview Modal with performance chart */}
      {inspectingAd && (() => {
        const adCTR = inspectingAd.impressions > 0 ? ((inspectingAd.clicks / inspectingAd.impressions) * 100).toFixed(2) : '0.00';
        
        // Generate daily time-series mock data for SVG chart (7 days period)
        const dailyImps = [];
        const dailyClicks = [];
        const baseImps = inspectingAd.impressions / 7;
        const baseClicks = inspectingAd.clicks / 7;
        for (let i = 0; i < 7; i++) {
          dailyImps.push(Math.round(baseImps * (0.7 + Math.random() * 0.6)));
          dailyClicks.push(Math.round(baseClicks * (0.6 + Math.random() * 0.8)));
        }

        // SVG Chart coordinates calculations
        const width = 360;
        const height = 100;
        const maxVal = Math.max(...dailyImps, 1);
        const points = dailyImps.map((val, idx) => {
          const x = (idx / 6) * (width - 20) + 10;
          const y = height - (val / maxVal) * (height - 20) - 10;
          return `${x},${y}`;
        }).join(' ');

        return (
          <>
            <div 
              onClick={() => setInspectingAd(null)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
            />
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '450px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '24px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>Inspect Ad Campaign</span>
                <button type="button" onClick={() => setInspectingAd(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Title</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{inspectingAd.title}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Advertiser</span>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{inspectingAd.advertiser}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Placement</span>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{inspectingAd.placement}</div>
                </div>
              </div>

              {/* Performance Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Impressions</span>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{inspectingAd.impressions.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Clicks</span>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{inspectingAd.clicks.toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>CTR</span>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#7c3aed' }}>{adCTR}%</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Revenue</span>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#059669' }}>₹{inspectingAd.revenue}</div>
                </div>
              </div>

              {/* Performance Trend Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Performance Trend (Daily Impressions)</span>
                <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
                  <svg width={width} height={height}>
                    <polyline
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2.5"
                      points={points}
                    />
                    {dailyImps.map((val, idx) => {
                      const x = (idx / 6) * (width - 20) + 10;
                      const y = height - (val / maxVal) * (height - 20) - 10;
                      return (
                        <circle key={idx} cx={x} cy={y} r="4" fill="#4f46e5" />
                      );
                    })}
                  </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#9ca3af', padding: '0 4px' }}>
                  <span>Day 1</span>
                  <span>Day 4</span>
                  <span>Day 7</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Banner Creative Preview</span>
                <div style={{ background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px', border: '1px solid #cbd5e1' }}>
                  {inspectingAd.imageUrl || inspectingAd.imageId ? (
                    <AdImage ad={inspectingAd} style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={18} /> No visual asset (Text Banner)
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => setInspectingAd(null)}
                  style={{ flex: 1, padding: '10px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Dismiss Detail View
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Live Merchant Preview Simulation Modal */}
      {previewAd && (() => {
        const isSkyscraper = previewAd.placement === "Merchant Dashboard (Vertical Skyscraper)";
        const isLeaderboard = previewAd.placement === "POS Dual-Screen (Horizontal Leaderboard)";
        const isReceiptFooter = previewAd.placement === "Thermal Invoice Footer";

        // Device widths mapping
        const deviceWidthMap = {
          desktop: '800px',
          tablet: '480px',
          mobile: '320px'
        };
        const currentWidth = deviceWidthMap[previewDevice] || '800px';

        return (
          <>
            <div 
              onClick={() => setPreviewAd(null)}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
            />
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '900px',
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
              <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1f2937' }}>Live Merchant Dashboard Simulation Preview</span>
                
                <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                  {[
                    { key: 'desktop', label: '🖥️ Desktop POS' },
                    { key: 'tablet', label: '📱 Tablet' },
                    { key: 'mobile', label: '📲 Mobile POS' }
                  ].map(dev => (
                    <button
                      key={dev.key}
                      type="button"
                      onClick={() => setPreviewDevice(dev.key)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        border: 'none',
                        background: previewDevice === dev.key ? '#ffffff' : 'transparent',
                        color: previewDevice === dev.key ? '#4f46e5' : '#64748b',
                        borderRadius: '6px',
                        boxShadow: previewDevice === dev.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      {dev.label}
                    </button>
                  ))}
                </div>

                <button type="button" onClick={() => setPreviewAd(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '340px' }}>
                <div style={{
                  width: '100%',
                  maxWidth: currentWidth,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'max-width 0.3s ease'
                }}>
                  
                  {isReceiptFooter ? (
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', background: '#f1f5f9' }}>
                      <div style={{
                        width: '240px',
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '16px',
                        fontFamily: 'Courier New, monospace',
                        fontSize: '0.675rem',
                        color: '#1f2937'
                      }}>
                        <div style={{ textAlign: 'center', fontWeight: 'bold', borderBottom: '1px dashed #9ca3af', paddingBottom: '6px', marginBottom: '8px' }}>
                          MOLIAAN RETAIL ERP
                        </div>
                        <div>Store: WWE Arena Supermart</div>
                        <div>Invoice: INV-2026-9811</div>
                        <div style={{ margin: '8px 0', borderBottom: '1px dashed #9ca3af', paddingBottom: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Rice 5kg x 1</span>
                            <span>₹650.00</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Oil 1L x 2</span>
                            <span>₹360.00</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span>Total:</span>
                          <span>₹1,010.00</span>
                        </div>
                        
                        <div style={{ marginTop: '16px', borderTop: '2px dashed #9ca3af', paddingTop: '10px', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.6rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>★ Coupon Offer ★</span>
                          <strong style={{ fontSize: '0.7rem', color: '#111827', display: 'block' }}>{previewAd.title}</strong>
                          {previewAd.imageUrl || previewAd.imageId ? (
                            <div style={{ width: '80px', height: '80px', margin: '6px auto', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                              <AdImage ad={previewAd} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div style={{ width: '50px', height: '50px', border: '1px solid #000', margin: '6px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 'bold' }}>QR MOCK</div>
                          )}
                          <span style={{ fontSize: '0.55rem', color: '#6b7280', display: 'block', marginTop: '4px' }}>Scan to redeem at: {previewAd.targetUrl}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', minHeight: '300px', width: '100%' }}>
                      {previewDevice !== 'mobile' && (
                        <div style={{ width: '60px', background: '#1e293b', padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 800, fontSize: '0.75rem' }}>M</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center', marginTop: '10px' }}>
                            {['📊', '🧾', '🖥️', '📦'].map((ico, idx) => (
                              <div key={idx} style={{ fontSize: '0.85rem', cursor: 'pointer', opacity: idx === 0 ? 1 : 0.4 }} title={['Dashboard', 'Billing', 'POS Terminal', 'Stock'][idx]}>
                                {ico}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                        <div style={{ height: '40px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                          <strong style={{ color: '#334155' }}>WWE Arena Supermart</strong>
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Today: ₹18,450</span>
                        </div>

                        <div style={{ padding: '12px', display: 'flex', gap: '12px', flexDirection: 'column', flex: 1 }}>
                          {isLeaderboard && (
                            <div style={{ width: '100%', aspectRatio: '1200/628', maxHeight: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                              <AdImage ad={previewAd} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '12px', flex: 1, flexDirection: previewDevice === 'mobile' ? 'column' : 'row' }}>
                            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px', flex: 1 }}>
                                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Sales Analytics Graph</span>
                                <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '6px 0', borderBottom: '1px solid #e2e8f0' }}>
                                  {[30, 45, 25, 60, 50, 75, 40, 90].map((h, i) => (
                                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #3b82f6, #60a5fa)', borderRadius: '2px' }} />
                                  ))}
                                </div>
                              </div>
                              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Recent Terminal Orders</span>
                                <div style={{ fontSize: '0.6rem', color: '#475569', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <div>Order #POS-8991 • ₹1,420 • UPI</div>
                                  <div>Order #POS-8990 • ₹340 • CASH</div>
                                </div>
                              </div>
                            </div>

                            {isSkyscraper && (
                              <div style={{ width: previewDevice === 'mobile' ? '100%' : '110px', aspectRatio: '1/2', minHeight: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', background: '#ffffff' }}>
                                <AdImage ad={previewAd} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge variant="success">Resolution: Retina 2x Crisp</Badge>
                  <Badge variant="info">Ratio: {previewAd.aspectRatio}</Badge>
                  <Badge variant="warning" style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>Target: {previewAd.targetUrl}</Badge>
                </div>
                
                <a 
                  href={previewAd.targetUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    padding: '6px 12px', 
                    background: '#7c3aed', 
                    color: '#ffffff', 
                    borderRadius: '8px', 
                    textDecoration: 'none', 
                    fontWeight: 700, 
                    fontSize: '0.75rem', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px' 
                  }}
                >
                  Test Redirect <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </>
        );
      })()}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

    </div>
  );
}
