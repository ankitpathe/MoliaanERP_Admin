import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Megaphone, Play, Pause, Trash2, Plus, Download, Monitor, Eye, ExternalLink, Activity, Sparkles, Settings, Edit } from 'lucide-react';
import ConfirmDialog from '../../ui/ConfirmDialog';
import Select from '../../ui/Select';
import AdImage from './AdImage';
import { saveImage, deleteImage } from '../../../utils/imageStorage';

const SEED_ADS = [
  {
    id: 'AD-901',
    title: 'Moliaan ERP Pro Upgrade',
    type: 'VERTICAL',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&h=600&auto=format&fit=crop',
    targetUrl: '/admin/plans',
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    priority: 'High',
    status: 'ACTIVE',
    impressions: 1420,
    clicks: 89,
    rotationSpeed: 5
  },
  {
    id: 'AD-902',
    title: 'Annual Sale - 2 POS Free!',
    type: 'HORIZONTAL',
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=728&h=90&auto=format&fit=crop',
    targetUrl: '/admin/plans/new',
    startDate: '2026-08-10',
    endDate: '2026-09-30',
    priority: 'Medium',
    status: 'ACTIVE',
    impressions: 2150,
    clicks: 142,
    rotationSpeed: 6
  }
];

const DEFAULT_AD_CONFIG = {
  enableIdleAds: true,
  idleTimeoutSeconds: 10,
  adDisplayMode: 'FULLSCREEN_SAVER',
  activeBanners: [
    { id: 'IAD-001', title: 'Moliaan ERP Pro Plan', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&h=450&fit=crop', ctaText: 'Upgrade Now', targetUrl: '/admin/plans', status: 'ACTIVE' },
    { id: 'IAD-002', title: 'Dual POS Thermal Printer Offer', imageUrl: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&h=450&fit=crop', ctaText: 'View Hardware', targetUrl: '/admin/counters/new', status: 'ACTIVE' }
  ]
};

export default function AdManager() {
  const toast = useToast();

  // General Ads list
  const [ads, setAds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  // Standard Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('VERTICAL');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [rotationSpeed, setRotationSpeed] = useState(5);
  const [uploadMode, setUploadMode] = useState('FILE'); // 'FILE' | 'URL'

  // Idle Ads Config state
  const [enableIdleAds, setEnableIdleAds] = useState(true);
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(10);
  const [adDisplayMode, setAdDisplayMode] = useState('FULLSCREEN_SAVER');
  const [activeBanners, setActiveBanners] = useState([]);
  const [editingIdleBanner, setEditingIdleBanner] = useState(null);

  // Idle Ad Creation state
  const [newIdleTitle, setNewIdleTitle] = useState('');
  const [newIdleImageUrl, setNewIdleImageUrl] = useState('');
  const [newIdleCtaText, setNewIdleCtaText] = useState('Learn More');
  const [newIdleTargetUrl, setNewIdleTargetUrl] = useState('/admin/dashboard');
  const [idleUploadMode, setIdleUploadMode] = useState('FILE');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    // Load standard ads
    const rawAds = localStorage.getItem('erp_advertisements');
    if (!rawAds) {
      localStorage.setItem('erp_advertisements', JSON.stringify(SEED_ADS));
      setAds(SEED_ADS);
    } else {
      setAds(JSON.parse(rawAds));
    }

    // Load Idle Ads config
    const rawConfig = localStorage.getItem('erp_ad_config');
    if (!rawConfig) {
      localStorage.setItem('erp_ad_config', JSON.stringify(DEFAULT_AD_CONFIG));
      setEnableIdleAds(DEFAULT_AD_CONFIG.enableIdleAds);
      setIdleTimeoutSeconds(DEFAULT_AD_CONFIG.idleTimeoutSeconds);
      setAdDisplayMode(DEFAULT_AD_CONFIG.adDisplayMode);
      setActiveBanners(DEFAULT_AD_CONFIG.activeBanners);
    } else {
      const parsed = JSON.parse(rawConfig);
      setEnableIdleAds(parsed.enableIdleAds ?? true);
      setIdleTimeoutSeconds(parsed.idleTimeoutSeconds ?? 10);
      setAdDisplayMode(parsed.adDisplayMode ?? 'FULLSCREEN_SAVER');
      setActiveBanners(parsed.activeBanners || []);
    }
  }, []);

  const saveAds = (updated) => {
    try {
      localStorage.setItem('erp_advertisements', JSON.stringify(updated));
    } catch (err) {
      if (err && err.name === 'QuotaExceededError') {
        throw err; // re-throw so handleCreateOrUpdateCampaign can show the proper toast
      }
    }
    setAds(updated);
  };

  const handleToggleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = ads.map(a => (a.id === id ? { ...a, status: nextStatus } : a));
    saveAds(updated);
    toast.showSuccess('Campaign Updated', `Campaign status changed to ${nextStatus}.`);
  };

  const handleDelete = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Ad Campaign',
      message: `Are you sure you want to delete ad campaign "${name}"?`,
      onConfirm: () => {
        const updated = ads.filter(a => a.id !== id);
        saveAds(updated);
        logActivity({
          activityType: 'AD_CAMPAIGN_DELETED',
          module: 'Advertisements',
          actionDescription: `Deleted ad campaign "${name}" [ID: ${id}]`
        });
        toast.showSuccess('Campaign Deleted', 'Ad campaign removed successfully.');
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.showError('File Too Large', 'Image must be under 5MB');
      return;
    }
    setSelectedFile(file);
    setImageUrl('LOCAL_FILE_SELECTED');
    toast.showSuccess('File Loaded', 'Local image creative loaded successfully.');
  };

  const handleStartEditAd = (ad) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setType(ad.type);
    setImageUrl(ad.imageUrl);
    setTargetUrl(ad.targetUrl);
    setPriority(ad.priority);
    setRotationSpeed(ad.rotationSpeed);
    setUploadMode(ad.imageStorageType === 'indexeddb' ? 'FILE' : 'URL');
    setSelectedFile(null);
    setShowCreateModal(true);
  };

  const handleCreateOrUpdateCampaign = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.showError('Required', 'Please enter a Campaign Title.');
      return;
    }
    if (uploadMode === 'FILE' && !imageUrl && !selectedFile) {
      toast.showError('Required', 'Please select an image file to upload.');
      return;
    }
    if (uploadMode === 'URL' && !imageUrl.trim()) {
      toast.showError('Required', 'Please enter a valid Image URL.');
      return;
    }
    if (!targetUrl.trim()) {
      toast.showError('Required', 'Please enter a CTA Target Link.');
      return;
    }

    try {
      const campaignId = editingAd ? editingAd.id : `AD-${Date.now().toString().slice(-4)}`;
      
      let finalAdObject = {
        id: campaignId,
        title: title.trim(),
        type,
        targetUrl: targetUrl.trim(),
        priority,
        rotationSpeed: Number(rotationSpeed) || 5
      };

      if (uploadMode === 'FILE') {
        if (selectedFile) {
          await saveImage(campaignId, selectedFile);
          finalAdObject.imageStorageType = 'indexeddb';
          finalAdObject.imageId = campaignId;
          finalAdObject.imageUrl = '';
        } else {
          // Editing, keeping existing file
          finalAdObject.imageStorageType = editingAd ? (editingAd.imageStorageType || 'indexeddb') : 'indexeddb';
          finalAdObject.imageId = editingAd ? (editingAd.imageId || campaignId) : campaignId;
          finalAdObject.imageUrl = editingAd ? (editingAd.imageUrl || '') : '';
        }
      } else {
        finalAdObject.imageStorageType = 'url';
        finalAdObject.imageUrl = imageUrl.trim();
        finalAdObject.imageId = null;
      }

      if (editingAd) {
        const updated = ads.map(a => (a.id === editingAd.id ? { ...a, ...finalAdObject } : a));
        saveAds(updated);
        logActivity({
          activityType: 'AD_CAMPAIGN_UPDATED',
          module: 'Advertisements',
          actionDescription: `Updated ad campaign "${title}"`
        });
        toast.showSuccess('Campaign Updated', `Ad campaign "${title}" updated successfully.`);
        setEditingAd(null);
        setShowCreateModal(false);
      } else {
        const newAd = {
          ...finalAdObject,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: 'ACTIVE',
          impressions: 0,
          clicks: 0
        };

        const updated = [...ads, newAd];
        saveAds(updated);

        logActivity({
          activityType: 'AD_CAMPAIGN_CREATED',
          module: 'Advertisements',
          actionDescription: `Created new ${type} ad campaign "${title}"`
        });

        toast.showSuccess('Campaign Created', `New ad campaign "${title}" is now active.`);
        setShowCreateModal(false);
      }

      // Reset Form
      setTitle('');
      setImageUrl('');
      setTargetUrl('');
      setPriority('Medium');
      setRotationSpeed(5);
      setUploadMode('FILE');
      setSelectedFile(null);

    } catch (err) {
      toast.showError('Save Failed', 'An unexpected error occurred. Please try again.');
      console.error('[AdManager] handleCreateOrUpdateCampaign error:', err);
    }
  };

  // Idle screen policy save
  const handleSaveAdPolicy = () => {
    const currentConfig = {
      enableIdleAds,
      idleTimeoutSeconds: Number(idleTimeoutSeconds),
      adDisplayMode,
      activeBanners
    };
    localStorage.setItem('erp_ad_config', JSON.stringify(currentConfig));
    logActivity({
      activityType: 'IDLE_AD_CONFIG_UPDATED',
      module: 'Advertisements',
      actionDescription: `Updated Idle Screen-Saver settings (Timeout: ${idleTimeoutSeconds}s, Display: ${adDisplayMode})`
    });
    toast.showSuccess('Policy Saved', 'Idle Screen-Saver settings updated successfully.');
  };

  // Idle image local upload
  const handleIdleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.showError('File Too Large', 'File exceeds recommended limit of 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewIdleImageUrl(reader.result);
      toast.showSuccess('File Loaded', 'Local image loaded successfully.');
    };
    reader.readAsDataURL(file);
  };

  const handleStartEditIdleBanner = (banner) => {
    setEditingIdleBanner(banner);
    setNewIdleTitle(banner.title);
    setNewIdleImageUrl(banner.imageUrl);
    setNewIdleCtaText(banner.ctaText);
    setNewIdleTargetUrl(banner.targetUrl);
    setIdleUploadMode(banner.imageUrl.startsWith('data:') ? 'FILE' : 'URL');
  };

  const handleCancelIdleEdit = () => {
    setEditingIdleBanner(null);
    setNewIdleTitle('');
    setNewIdleImageUrl('');
    setNewIdleCtaText('Learn More');
    setNewIdleTargetUrl('/admin/dashboard');
  };

  // Add or update idle banner
  const handleSaveIdleBanner = (e) => {
    e.preventDefault();
    if (!newIdleTitle.trim()) {
      toast.showError('Required', 'Please enter a Promo Title.');
      return;
    }
    if (idleUploadMode === 'FILE' && !newIdleImageUrl) {
      toast.showError('Required', 'Please select an image file to upload.');
      return;
    }
    if (idleUploadMode === 'URL' && !newIdleImageUrl.trim()) {
      toast.showError('Required', 'Please enter a valid image URL.');
      return;
    }
    if (!newIdleTargetUrl.trim()) {
      toast.showError('Required', 'Please enter a CTA Target URL.');
      return;
    }

    let updatedBanners = [];

    if (editingIdleBanner) {
      updatedBanners = activeBanners.map(b => {
        if (b.id === editingIdleBanner.id) {
          return {
            ...b,
            title: newIdleTitle.trim(),
            imageUrl: newIdleImageUrl.trim(),
            ctaText: newIdleCtaText.trim() || 'Learn More',
            targetUrl: newIdleTargetUrl.trim()
          };
        }
        return b;
      });
      toast.showSuccess('Banner Updated', 'Screen-saver banner updated successfully.');
      setEditingIdleBanner(null);
    } else {
      const newBanner = {
        id: `IAD-${Date.now().toString().slice(-4)}`,
        title: newIdleTitle.trim(),
        imageUrl: newIdleImageUrl.trim(),
        ctaText: newIdleCtaText.trim() || 'Learn More',
        targetUrl: newIdleTargetUrl.trim(),
        status: 'ACTIVE'
      };
      updatedBanners = [...activeBanners, newBanner];
      toast.showSuccess('Banner Added', 'New screen-saver banner saved.');
    }

    setActiveBanners(updatedBanners);

    const currentConfig = {
      enableIdleAds,
      idleTimeoutSeconds: Number(idleTimeoutSeconds),
      adDisplayMode,
      activeBanners: updatedBanners
    };
    localStorage.setItem('erp_ad_config', JSON.stringify(currentConfig));

    logActivity({
      activityType: editingIdleBanner ? 'IDLE_BANNER_UPDATED' : 'IDLE_BANNER_ADDED',
      module: 'Advertisements',
      actionDescription: editingIdleBanner 
        ? `Updated Idle Screen banner "${newIdleTitle}"` 
        : `Added new Idle Screen banner "${newIdleTitle}"`
    });

    // Reset Form
    setNewIdleTitle('');
    setNewIdleImageUrl('');
    setNewIdleCtaText('Learn More');
    setNewIdleTargetUrl('/admin/dashboard');
  };

  // Toggle idle banner status
  const handleToggleIdleBannerStatus = (id) => {
    const updated = activeBanners.map(b => (b.id === id ? { ...b, status: b.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : b));
    setActiveBanners(updated);
    const currentConfig = {
      enableIdleAds,
      idleTimeoutSeconds: Number(idleTimeoutSeconds),
      adDisplayMode,
      activeBanners: updated
    };
    localStorage.setItem('erp_ad_config', JSON.stringify(currentConfig));
    toast.showSuccess('Updated', 'Banner status updated.');
  };

  // Delete idle banner
  const handleDeleteIdleBanner = (id, name) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Screen-Saver Banner',
      message: `Are you sure you want to remove idle banner "${name}"?`,
      onConfirm: () => {
        const updated = activeBanners.filter(b => b.id !== id);
        setActiveBanners(updated);
        const currentConfig = {
          enableIdleAds,
          idleTimeoutSeconds: Number(idleTimeoutSeconds),
          adDisplayMode,
          activeBanners: updated
        };
        localStorage.setItem('erp_ad_config', JSON.stringify(currentConfig));
        toast.showSuccess('Deleted', 'Screen-saver banner removed.');
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Standard metrics
  const activeCount = ads.filter(a => a.status === 'ACTIVE').length;
  const totalImpressions = ads.reduce((sum, a) => sum + (a.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, a) => sum + (a.clicks || 0), 0);
  const clickThroughRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>
            Promotion & Ads Management
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Configure sponsored skyscraper banners, footer promotions, and idle screen-savers.
          </span>
        </div>

        <button 
          onClick={() => { setEditingAd(null); setShowCreateModal(true); }}
          style={{
            padding: '8px 16px',
            background: '#1f2937',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#374151'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f2937'}
        >
          <Plus size={14} /> Create Campaign
        </button>
      </div>

      {/* Metrics Row */}
      <div className="responsive-grid-4">
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Active Campaigns</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '4px 0' }}>{activeCount} / {ads.length}</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(3, 80, 150, 0.08)', color: '#035096', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Total Impressions</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '4px 0' }}>{totalImpressions.toLocaleString()}</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Eye size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Click-Throughs</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0891b2', margin: '4px 0' }}>{totalClicks}</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(8, 145, 178, 0.08)', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ExternalLink size={18} />
          </div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>CTR Performance</span>
            <h4 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#dc2626', margin: '4px 0' }}>{clickThroughRate}%</h4>
          </div>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(220, 38, 38, 0.08)', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} />
          </div>
        </div>
      </div>

      {/* Section 1: Idle Screen-Saver Settings Card */}
      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
          <Settings size={18} style={{ color: '#035096' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Section 1 - Idle Screen-Saver Settings
          </span>
        </div>

        <div className="responsive-grid-4">
          
          {/* Toggle Switch */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Dashboard Auto-Ads Trigger</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <button 
                type="button" 
                onClick={() => setEnableIdleAds(!enableIdleAds)}
                style={{
                  width: '40px',
                  height: '22px',
                  borderRadius: '99px',
                  background: enableIdleAds ? '#035096' : '#d1d5db',
                  border: 'none',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: enableIdleAds ? '21px' : '3px',
                  transition: 'left 0.2s'
                }} />
              </button>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: enableIdleAds ? '#035096' : '#4b5563' }}>
                {enableIdleAds ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Timeout Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Idle Inactivity Timeout</span>
            <Select
              value={idleTimeoutSeconds}
              onChange={e => setIdleTimeoutSeconds(Number(e.target.value))}
              style={{ width: '100%' }}
            >
              <option value="5">5 Seconds (Testing)</option>
              <option value="10">10 Seconds</option>
              <option value="20">20 Seconds</option>
              <option value="30">30 Seconds</option>
            </Select>
          </div>

          {/* Display Mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Ad Overlay Display Mode</span>
            <Select
              value={adDisplayMode}
              onChange={e => setAdDisplayMode(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="FULLSCREEN_SAVER">Fullscreen Saver Overlay</option>
              <option value="RIGHT_SLIDER">Sidebar Popout Slider</option>
            </Select>
          </div>

        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
          <button
            onClick={handleSaveAdPolicy}
            style={{
              padding: '8px 16px',
              background: '#035096',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Save Ad Policy
          </button>
        </div>
      </div>

      {/* Section 2: Banner Uploads & Media Gallery */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Banner Upload Form */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Plus size={18} style={{ color: '#035096' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {editingIdleBanner ? 'Edit Screen-Saver Banner' : 'Upload Screen-Saver Banner'}
            </span>
          </div>

          <form onSubmit={handleSaveIdleBanner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Promo Title *</span>
              <input 
                type="text" 
                value={newIdleTitle}
                onChange={e => setNewIdleTitle(e.target.value)}
                placeholder="e.g. Moliaan Pro Saver"
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Media Source</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setIdleUploadMode('FILE'); setNewIdleImageUrl(''); }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: idleUploadMode === 'FILE' ? '#1f2937' : '#ffffff',
                    color: idleUploadMode === 'FILE' ? '#ffffff' : '#374151',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => { setIdleUploadMode('URL'); setNewIdleImageUrl(''); }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background: idleUploadMode === 'URL' ? '#1f2937' : '#ffffff',
                    color: idleUploadMode === 'URL' ? '#ffffff' : '#374151',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Banner URL
                </button>
              </div>
            </div>

            {idleUploadMode === 'FILE' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="file"
                  accept="image/*"
                  onChange={handleIdleFileChange}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.8rem', background: '#ffffff', cursor: 'pointer' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="text" 
                  value={newIdleImageUrl}
                  onChange={e => setNewIdleImageUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                />
              </div>
            )}

            <div className="responsive-two-cols">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>CTA Button Text</span>
                <input 
                  type="text" 
                  value={newIdleCtaText}
                  onChange={e => setNewIdleCtaText(e.target.value)}
                  placeholder="e.g. Upgrade Now"
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Target Link *</span>
                <input 
                  type="text" 
                  value={newIdleTargetUrl}
                  onChange={e => setNewIdleTargetUrl(e.target.value)}
                  placeholder="e.g. /admin/plans"
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: '#1f2937',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {editingIdleBanner ? 'Update Banner' : 'Add Screen Banner'}
              </button>

              {editingIdleBanner && (
                <button
                  type="button"
                  onClick={handleCancelIdleEdit}
                  style={{
                    padding: '10px 16px',
                    background: '#ffffff',
                    color: '#4b5563',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Media Gallery / Table */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
            <Monitor size={18} style={{ color: '#035096' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Screen-Saver Gallery
            </span>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeBanners.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', padding: '20px' }}>No banners uploaded.</span>
            ) : (
              activeBanners.map(b => (
                <div key={b.id} style={{ display: 'flex', gap: '12px', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={b.imageUrl} alt={b.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>{b.title}</span>
                      <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>CTA: {b.ctaText} • {b.targetUrl}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleStartEditIdleBanner(b)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        background: '#ffffff',
                        color: '#4b5563',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Edit Banner"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={() => handleToggleIdleBannerStatus(b.id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        background: b.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                        color: b.status === 'ACTIVE' ? '#065f46' : '#991b1b',
                        cursor: 'pointer'
                      }}
                    >
                      {b.status === 'ACTIVE' ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => handleDeleteIdleBanner(b.id, b.title)}
                      style={{
                        padding: '4px',
                        borderRadius: '4px',
                        border: '1px solid #fee2e2',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Campaigns split grids (Original Standard Ads) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left: Standard Campaigns Table */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Campaign / Placement</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Impressions</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Clicks</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad, idx) => (
                <tr key={ad.id} style={{ borderBottom: idx === ads.length - 1 ? 'none' : '1px solid #e5e7eb', fontSize: '0.8rem', color: '#374151' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 700, color: '#111827' }}>{ad.title}</span>
                      <span style={{ fontSize: '0.725rem', color: '#6b7280' }}>ID: {ad.id} • Speed: {ad.rotationSpeed}s</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: ad.type === 'VERTICAL' ? '#f3e8ff' : '#e0f2fe',
                      color: ad.type === 'VERTICAL' ? '#7e22ce' : '#0369a1'
                    }}>
                      {ad.type}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: ad.status === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                      color: ad.status === 'ACTIVE' ? '#065f46' : '#991b1b'
                    }}>
                      {ad.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>{ad.impressions}</td>
                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>{ad.clicks}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        onClick={() => handleStartEditAd(ad)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid #d1d5db',
                          background: '#ffffff',
                          color: '#4b5563',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit Campaign"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(ad.id, ad.status)}
                        style={{
                          padding: '6px 10px',
                          background: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          color: '#374151',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {ad.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(ad.id, ad.title)}
                        style={{
                          padding: '6px',
                          background: '#ffffff',
                          border: '1px solid #fee2e2',
                          borderRadius: '6px',
                          color: '#dc2626',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right: Live Simulator */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Customer Ad Display Simulator
          </span>
          
          <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '16px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            {/* Vertical Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '150px' }}>
              <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>Sky-scraper Slot (300x600)</span>
              <div style={{ width: '120px', height: '240px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {ads.find(a => a.type === 'VERTICAL' && a.status === 'ACTIVE') ? (
                  <AdImage 
                    ad={ads.find(a => a.type === 'VERTICAL' && a.status === 'ACTIVE')} 
                    alt="Vertical preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No active Vertical Ads</span>
                )}
                <span style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '2px 4px', fontSize: '0.55rem', borderRadius: '2px', fontWeight: 700 }}>Sponsored</span>
              </div>
            </div>

            {/* Horizontal Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%' }}>
              <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>Footer Slot (Banner Stripe)</span>
              <div style={{ width: '100%', height: '35px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {ads.find(a => a.type === 'HORIZONTAL' && a.status === 'ACTIVE') ? (
                  <AdImage 
                    ad={ads.find(a => a.type === 'HORIZONTAL' && a.status === 'ACTIVE')} 
                    alt="Horizontal preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>No active Horizontal Ads</span>
                )}
                <span style={{ position: 'absolute', top: '2px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '1px 3px', fontSize: '0.55rem', borderRadius: '2px', fontWeight: 700 }}>Ad</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Create Modal (Standard Campaign) */}
      {showCreateModal && (
        <>
          <div 
            onClick={() => { setEditingAd(null); setShowCreateModal(false); setTitle(''); setImageUrl(''); setTargetUrl(''); setUploadMode('FILE'); setSelectedFile(null); }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 998 }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            width: '450px',
            padding: '24px',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                {editingAd ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
              </h3>
            </div>

            <form onSubmit={handleCreateOrUpdateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Campaign Title / Name *</span>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Free POS Hardware Promo"
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Slot Placement *</span>
                <Select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="VERTICAL">Right Side Vertical (Skyscraper)</option>
                  <option value="HORIZONTAL">Bottom Footer Strip (Full-width)</option>
                </Select>
              </div>

              {/* Image Input Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Image Resource Mode</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => { setUploadMode('FILE'); setImageUrl(''); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      background: uploadMode === 'FILE' ? '#1f2937' : '#ffffff',
                      color: uploadMode === 'FILE' ? '#ffffff' : '#374151',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUploadMode('URL'); setImageUrl(''); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      background: uploadMode === 'URL' ? '#1f2937' : '#ffffff',
                      color: uploadMode === 'URL' ? '#ffffff' : '#374151',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Image URL
                  </button>
                </div>
              </div>

              {uploadMode === 'FILE' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Choose Local File *</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.8rem',
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Image URL *</span>
                  <input 
                    type="text" 
                    value={imageUrl} 
                    onChange={e => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              {/* Aspect Ratio & Spec Guidelines Box */}
              <div style={{
                padding: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#475569',
                lineHeight: '1.4'
              }}>
                {type === 'VERTICAL' ? (
                  <div>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>Vertical Skyscraper Placement Specs:</strong>
                    <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <li>Standard slot size: <strong style={{ color: '#0f172a' }}>300px x 600px</strong> (Aspect Ratio 1:2)</li>
                      <li>Recommended upload: <strong style={{ color: '#0f172a' }}>600px x 1200px</strong> (High-DPI / Retina)</li>
                      <li>Recommended max file size: <strong style={{ color: '#0f172a' }}>5 MB</strong></li>
                    </ul>
                  </div>
                ) : (
                  <div>
                    <strong style={{ color: '#1e293b', display: 'block', marginBottom: '4px' }}>Horizontal Footer Stripe Placement Specs:</strong>
                    <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <li>Standard slot size: <strong style={{ color: '#0f172a' }}>728px x 90px</strong> (Aspect Ratio ~8:1)</li>
                      <li>Recommended upload: <strong style={{ color: '#0f172a' }}>1456px x 180px</strong> (High-DPI / Retina)</li>
                      <li>Recommended max file size: <strong style={{ color: '#0f172a' }}>250 KB</strong></li>
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>CTA Target Link *</span>
                <input 
                  type="text" 
                  value={targetUrl} 
                  onChange={e => setTargetUrl(e.target.value)}
                  placeholder="e.g. /admin/plans"
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                />
              </div>

              <div className="responsive-two-cols">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Priority</span>
                  <Select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </Select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Rotation Speed (secs)</span>
                  <input 
                    type="number" 
                    value={rotationSpeed} 
                    onChange={e => setRotationSpeed(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '8px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => { setEditingAd(null); setShowCreateModal(false); setTitle(''); setImageUrl(''); setTargetUrl(''); setUploadMode('FILE'); setSelectedFile(null); }}
                  style={{ padding: '8px 16px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 16px', background: '#1f2937', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  {editingAd ? 'Save Changes' : 'Save Campaign'}
                </button>
              </div>

            </form>
          </div>
        </>
      )}

      {/* Custom styled confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
      />

    </div>
  );
}
