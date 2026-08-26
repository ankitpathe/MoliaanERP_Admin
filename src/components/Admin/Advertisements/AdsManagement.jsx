import React, { useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import { logActivity } from '../../../services/activityLogger';
import { Megaphone, Play, Pause, Trash2, Plus, Download, Eye, ExternalLink, Activity, Sparkles, AlertTriangle } from 'lucide-react';
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

const SEED_ADS = [
  {
    id: "AD-2026-01",
    title: "Moliaan ERP Pro Upgrade Banner",
    placement: "Merchant Dashboard (Vertical Skyscraper)",
    aspectRatio: "1:2 (300x600)",
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67e55722c0?w=600&auto=format&fit=crop&q=80",
    targetUrl: "https://moliaan.com/pricing",
    impressions: 4820,
    clicks: 342,
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: "2026-09-30T00:00:00.000Z",
    status: "ACTIVE"
  },
  {
    id: "AD-2026-02",
    title: "Fast GST Billing & Thermal Print Promo",
    placement: "POS Dual-Screen (Horizontal Leaderboard)",
    aspectRatio: "16:9 (1200x628)",
    imageUrl: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=1200&auto=format&fit=crop&q=80",
    targetUrl: "https://moliaan.com/features",
    impressions: 12450,
    clicks: 890,
    startDate: "2026-08-15T00:00:00.000Z",
    endDate: "2026-10-15T00:00:00.000Z",
    status: "ACTIVE"
  },
  {
    id: "AD-2026-03",
    title: "Weekend Discount Cashier Receipt Footer",
    placement: "Thermal Invoice Footer",
    aspectRatio: "Text & Mini QR",
    imageUrl: "",
    targetUrl: "https://moliaan.com/offers",
    impressions: 1820,
    clicks: 45,
    startDate: "2026-07-01T00:00:00.000Z",
    endDate: "2026-08-20T00:00:00.000Z",
    status: "EXPIRED"
  }
];

export default function AdsManagement() {
  const toast = useToast();
  const [ads, setAds] = useState([]);

  // Modal and inspector states
  const [showCreateModal, setShowCreateModal] = useState(false);
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
  const [placement, setPlacement] = useState('Merchant Dashboard (Vertical Skyscraper)');
  const [aspectRatio, setAspectRatio] = useState('1:2 (300x600)');
  const [targetUrl, setTargetUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uploadMode, setUploadMode] = useState('URL'); // 'URL' | 'FILE'
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

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
          placement: ad.placement || "Merchant Dashboard (Vertical Skyscraper)",
          aspectRatio: ad.aspectRatio || "1:2 (300x600)",
          imageUrl: ad.imageUrl || "",
          imageStorageType: ad.imageStorageType || "",
          imageId: ad.imageId || "",
          targetUrl: ad.targetUrl || "https://moliaan.com",
          impressions: Number(ad.impressions) >= 0 ? Number(ad.impressions) : 0,
          clicks: Number(ad.clicks) >= 0 ? Number(ad.clicks) : 0,
          startDate: ad.startDate || new Date().toISOString(),
          endDate: ad.endDate || new Date(Date.now() + 86400000 * 30).toISOString(),
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

  // KPIs
  const activeCampaignsCount = ads.filter(a => a.status === 'ACTIVE').length;
  const totalImpressions = ads.reduce((s, a) => s + (Number(a.impressions) || 0), 0);
  const totalClicks = ads.reduce((s, a) => s + (Number(a.clicks) || 0), 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  // Toggle status
  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const updated = ads.map(a => a.id === id ? { ...a, status: newStatus } : a);
    saveAds(updated);
    toast.showSuccess('Status Toggled', `Campaign is now ${newStatus}.`);
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
        setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  // Save new campaign
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!title || !targetUrl || !startDate || !endDate) {
      toast.showError('Validation Error', 'Please fill in all campaign fields.');
      return;
    }

    const campaignId = "AD-" + Date.now().toString().slice(-4);
    let finalImageUrl = imageUrl;
    let imageStorageType = "";
    let imageId = "";

    if (uploadMode === 'FILE' && selectedFile) {
      // Save image to IndexedDB
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

    const newAd = {
      id: campaignId,
      title,
      placement,
      aspectRatio,
      imageUrl: finalImageUrl,
      imageStorageType,
      imageId,
      targetUrl,
      impressions: 0,
      clicks: 0,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: "ACTIVE"
    };

    const updated = [newAd, ...ads];
    saveAds(updated);

    logActivity({
      activityType: 'AD_CAMPAIGN_CREATED',
      module: 'Advertisements',
      actionDescription: `Created ad campaign "${title}" targeting ${placement}.`
    });

    toast.showSuccess('Campaign Created', `Ad Campaign "${title}" launched successfully.`);
    setShowCreateModal(false);
    setTitle('');
    setTargetUrl('');
    setStartDate('');
    setEndDate('');
    setImageUrl('');
    setSelectedFile(null);
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.showError('File Too Large', 'Maximum file size allowed is 5 MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const tableHeaders = [
    { label: 'Campaign Info' },
    { label: 'Placement & Ratio' },
    { label: 'Target Link' },
    { label: 'Performance (Clicks / Imps)' },
    { label: 'CTR' },
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
          <Button variant="purple" onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> New Ad Campaign
          </Button>
        }
      />

      {/* KPI Stats Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard label="Active Campaigns" value={activeCampaignsCount} icon={Sparkles} color="#7c3aed" />
        <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} icon={Megaphone} color="#06b6d4" />
        <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} icon={ExternalLink} color="#10b981" />
        <StatCard label="Avg. Click-Through Rate" value={`${avgCTR}%`} icon={Activity} color="#ef4444" />
      </div>

      {/* Table view */}
      <Card style={{ padding: '16px' }}>
        <Table headers={tableHeaders}>
          {ads.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#6b7280' }}>
                No active promotional campaigns configured.
              </td>
            </tr>
          ) : (
            ads.map(ad => {
              const adCTR = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';
              return (
                <tr key={ad.id} style={{ borderBottom: '1px solid #f3f4f6', fontSize: '0.8rem', color: '#374151' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ad.imageUrl || ad.imageId ? (
                          <AdImage ad={ad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Megaphone size={16} style={{ color: '#9ca3af' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontWeight: 700, color: '#111827' }}>{ad.title}</strong>
                        <span style={{ fontSize: '0.675rem', color: '#6b7280' }}>ID: {ad.id}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600 }}>{ad.placement}</span>
                      <span style={{ fontSize: '0.675rem', color: '#6b7280' }}>Ratio: {ad.aspectRatio}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Link <ExternalLink size={12} />
                    </a>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontWeight: 700 }}>{ad.clicks} Clicks</span> / <span style={{ color: '#6b7280' }}>{ad.impressions} Imps</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: '#111827' }}>
                    {adCTR}%
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Badge variant={ad.status === 'ACTIVE' ? 'success' : ad.status === 'PAUSED' ? 'warning' : 'danger'}>
                      {ad.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <Button variant="secondary" onClick={() => setPreviewAd(ad)} style={{ padding: '4px 8px', fontSize: '0.7rem', gap: '4px' }}>
                        <Eye size={12} /> Live Merchant Preview
                      </Button>
                      <Button variant="secondary" onClick={() => setInspectingAd(ad)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                        <Eye size={12} /> Inspect
                      </Button>
                      <Button variant="secondary" onClick={() => handleToggleStatus(ad.id, ad.status)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                        {ad.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
                      </Button>
                      <Button variant="secondary" onClick={() => handleDelete(ad.id, ad.title)} style={{ padding: '4px 8px', fontSize: '0.7rem', color: '#ef4444' }}>
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </Card>

      {/* New Campaign Modal */}
      {showCreateModal && (
        <>
          <div 
            onClick={() => setShowCreateModal(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', zIndex: 9998 }}
          />
          <form onSubmit={handleCreateCampaign} style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '420px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '24px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>Create Ad Campaign</span>
              <button type="button" onClick={() => setShowCreateModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Campaign Title *</span>
              <Input 
                type="text" 
                placeholder="e.g. Pro Upgrade Offer"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Placement Selector *</span>
              <Select value={placement} onChange={e => setPlacement(e.target.value)}>
                <option value="Merchant Dashboard (Vertical Skyscraper)">Merchant Dashboard (Vertical Skyscraper)</option>
                <option value="POS Dual-Screen (Horizontal Leaderboard)">POS Dual-Screen (Horizontal Leaderboard)</option>
                <option value="Thermal Invoice Footer">Thermal Invoice Footer</option>
              </Select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Banner Aspect Ratio *</span>
              <Select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)}>
                <option value="1:2 (300x600)">1:2 (300x600)</option>
                <option value="16:9 (1200x628)">16:9 (1200x628)</option>
                <option value="Text & Mini QR">Text & Mini QR</option>
              </Select>
            </div>

            {/* Live Preview Aspect Ratio box */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Aspect Ratio Preview</span>
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {aspectRatio === "1:2 (300x600)" ? (
                  <div style={{ width: '60px', height: '120px', background: '#e2e8f0', border: '1px solid #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', color: '#475569' }}>
                    1:2
                  </div>
                ) : aspectRatio === "16:9 (1200x628)" ? (
                  <div style={{ width: '160px', height: '90px', background: '#e2e8f0', border: '1px solid #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', color: '#475569' }}>
                    16:9
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '40px', background: '#e2e8f0', border: '1px solid #94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.65rem', color: '#475569' }}>
                    Text / Footer
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={() => setUploadMode('URL')}
                style={{ flex: 1, padding: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #d1d5db', borderRadius: '6px', background: uploadMode === 'URL' ? '#e0f2fe' : '#ffffff', color: uploadMode === 'URL' ? '#0369a1' : '#4b5563', cursor: 'pointer' }}
              >
                Image URL
              </button>
              <button 
                type="button" 
                onClick={() => setUploadMode('FILE')}
                style={{ flex: 1, padding: '6px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #d1d5db', borderRadius: '6px', background: uploadMode === 'FILE' ? '#e0f2fe' : '#ffffff', color: uploadMode === 'FILE' ? '#0369a1' : '#4b5563', cursor: 'pointer' }}
              >
                Upload File
              </button>
            </div>

            {uploadMode === 'URL' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Image URL</span>
                <Input 
                  type="text" 
                  placeholder="https://example.com/banner.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Upload File (Max 5MB)</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Target URL *</span>
              <Input 
                type="text" 
                placeholder="https://example.com"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Start Date *</span>
                <Input 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>End Date *</span>
                <Input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                style={{ flex: 1, padding: '10px', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#4b5563', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ flex: 1, padding: '10px', background: 'linear-gradient(to right, #7c3aed, #4f46e5)', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Create Campaign
              </button>
            </div>
          </form>
        </>
      )}

      {/* Inspect / Preview Modal */}
      {inspectingAd && (() => {
        const adCTR = inspectingAd.impressions > 0 ? ((inspectingAd.clicks / inspectingAd.impressions) * 100).toFixed(2) : '0.00';
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
              width: '420px',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              padding: '24px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem' }}>Inspect Ad Campaign</span>
                <button type="button" onClick={() => setInspectingAd(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Title</span>
                <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{inspectingAd.title}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Placement</span>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{inspectingAd.placement}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Aspect Ratio</span>
                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{inspectingAd.aspectRatio}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Impressions</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{inspectingAd.impressions}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>Clicks</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{inspectingAd.clicks}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>CTR</span>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#7c3aed' }}>{adCTR}%</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Live Banner Preview</span>
                <div style={{ background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '140px', border: '1px solid #cbd5e1' }}>
                  {inspectingAd.imageUrl || inspectingAd.imageId ? (
                    <AdImage ad={inspectingAd} style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={18} /> No visual asset (Text Banner)
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Target Destination</span>
                <a href={inspectingAd.targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}>
                  {inspectingAd.targetUrl} <ExternalLink size={12} />
                </a>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button 
                  type="button" 
                  onClick={() => setInspectingAd(null)}
                  style={{ flex: 1, padding: '10px', background: '#7c3aed', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Dismiss Preview
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
              {/* Header Controls */}
              <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1f2937' }}>Live Merchant Dashboard Simulation Preview</span>
                
                {/* Device Switcher Pills */}
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

              {/* Simulation Screen Wrapper */}
              <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '340px' }}>
                
                {/* Simulated Screen Container */}
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
                    /* Simulated 80mm Cashier Thermal Receipt mock */
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
                        
                        {/* Dynamic Receipt Footer Promo Banner Mock */}
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
                    /* Mock Merchant Dashboard Layout */
                    <div style={{ display: 'flex', minHeight: '300px', width: '100%' }}>
                      
                      {/* Left Mini-Sidebar */}
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

                      {/* Main Simulated Panel */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                        {/* Top simulated header bar */}
                        <div style={{ height: '40px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                          <strong style={{ color: '#334155' }}>WWE Arena Supermart</strong>
                          <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Today: ₹18,450</span>
                        </div>

                        {/* Layout contents */}
                        <div style={{ padding: '12px', display: 'flex', gap: '12px', flexDirection: 'column', flex: 1 }}>
                          
                          {/* Leaderboard ad inject */}
                          {isLeaderboard && (
                            <div style={{ width: '100%', aspectRatio: '1200/628', maxHeight: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                              <AdImage ad={previewAd} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}

                          {/* Center Dashboard simulator widgets */}
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

                            {/* Side panel Skyscraper ad inject */}
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

              {/* Real-time validation pills */}
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
