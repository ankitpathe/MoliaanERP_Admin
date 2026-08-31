import { useState, useEffect } from 'react';
import { useToast } from '../../../../hooks/useToast';
import { logActivity } from '../../../../services/activityLogger';
import { saveImage, deleteImage } from '../../../../utils/imageStorage';

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

export function useAdCampaigns() {
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
    const activeDaysList = ad.activeDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    if (!activeDaysList.includes(currentDay)) return false;

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
    if (e && e.preventDefault) e.preventDefault();
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
    const csvHeaders = ['Campaign ID', 'Title', 'Advertiser', 'Placement', 'Aspect Ratio', 'Target URL', 'Impressions', 'Clicks', 'CTR %', 'Revenue (INR)', 'Payment Status', 'Start Date', 'End Date', 'Status'];
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

    const csvContent = [csvHeaders.join(','), ...rows.map(r => r.join(','))].join('\n');
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

  return {
    ads,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    slotTypeFilter,
    setSlotTypeFilter,
    isAlertDismissed,
    setIsAlertDismissed,
    selectedAdIds,
    setSelectedAdIds,
    showCreateModal,
    setShowCreateModal,
    editingAd,
    setEditingAd,
    showScheduleSettings,
    setShowScheduleSettings,
    showBillingSettings,
    setShowBillingSettings,
    inspectingAd,
    setInspectingAd,
    previewAd,
    setPreviewAd,
    previewDevice,
    setPreviewDevice,
    confirmDialog,
    setConfirmDialog,
    title,
    setTitle,
    advertiser,
    setAdvertiser,
    placement,
    setPlacement,
    aspectRatio,
    setAspectRatio,
    targetUrl,
    setTargetUrl,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    revenue,
    setRevenue,
    paymentStatus,
    setPaymentStatus,
    uploadMode,
    setUploadMode,
    imageUrl,
    setImageUrl,
    selectedFile,
    setSelectedFile,
    restrictHours,
    setRestrictHours,
    activeStartTime,
    setActiveStartTime,
    activeEndTime,
    setActiveEndTime,
    activeDays,
    setActiveDays,
    rotationSpeed,
    setRotationSpeed,
    isAdCurrentlyEligible,
    getAdStatus,
    activeCampaignsCount,
    totalImpressions,
    totalClicks,
    avgCTR,
    totalAdRevenue,
    handleToggleStatus,
    handleEditClick,
    handleNewAdClick,
    handleDelete,
    handleExtendCampaign,
    handleCreateCampaign,
    handleFileChange,
    handleSelectAll,
    handleSelectRow,
    handleBulkPause,
    handleBulkDelete,
    handleExportCSV,
    activeFooterAds,
    activeSidebarAds,
    IMAGE_LIMITS,
    expiringAds,
    advertisersList,
    filteredAds
  };
}
