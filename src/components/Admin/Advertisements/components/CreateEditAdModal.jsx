import React from 'react';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';

export default function CreateEditAdModal({
  showCreateModal,
  setShowCreateModal,
  editingAd,
  setEditingAd,
  handleCreateCampaign,
  title,
  setTitle,
  advertiser,
  setAdvertiser,
  placement,
  setPlacement,
  uploadMode,
  setUploadMode,
  imageUrl,
  setImageUrl,
  handleFileChange,
  IMAGE_LIMITS,
  setSelectedFile,
  targetUrl,
  setTargetUrl,
  rotationSpeed,
  setRotationSpeed,
  showScheduleSettings,
  setShowScheduleSettings,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  restrictHours,
  setRestrictHours,
  activeStartTime,
  setActiveStartTime,
  activeEndTime,
  setActiveEndTime,
  showBillingSettings,
  setShowBillingSettings,
  revenue,
  setRevenue,
  paymentStatus,
  setPaymentStatus
}) {
  if (!showCreateModal) return null;

  return (
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
            <div className="responsive-two-cols">
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
              <div className="responsive-two-cols">
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
  );
}
