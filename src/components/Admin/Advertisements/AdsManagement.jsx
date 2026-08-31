import React from 'react';
import { useAdCampaigns } from './hooks/useAdCampaigns';
import PageHeader from '../../ui/PageHeader';
import Button from '../../ui/Button';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { Plus, Download } from 'lucide-react';

// Subcomponents
import AdMetricsRow from './components/AdMetricsRow';
import AdExpiryBanner from './components/AdExpiryBanner';
import AdFiltersBar from './components/AdFiltersBar';
import AdCampaignsTable from './components/AdCampaignsTable';
import AdvertiserDirectory from './components/AdvertiserDirectory';
import CreateEditAdModal from './components/CreateEditAdModal';
import AdPerformanceInspector from './components/AdPerformanceInspector';

export default function AdsManagement() {
  const {
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
    uploadMode,
    setUploadMode,
    imageUrl,
    setImageUrl,
    targetUrl,
    setTargetUrl,
    selectedFile,
    setSelectedFile,
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
    revenue,
    setRevenue,
    paymentStatus,
    setPaymentStatus,
    rotationSpeed,
    setRotationSpeed,
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
    handleBulkPause,
    handleBulkDelete,
    handleExportCSV,
    activeFooterAds,
    activeSidebarAds,
    IMAGE_LIMITS,
    advertisersList,
    filteredAds,
    expiringAds
  } = useAdCampaigns();

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
      <AdMetricsRow
        activeCampaignsCount={activeCampaignsCount}
        totalImpressions={totalImpressions}
        totalClicks={totalClicks}
        avgCTR={avgCTR}
        totalAdRevenue={totalAdRevenue}
      />

      {/* Expiry Alerts Banner */}
      <AdExpiryBanner
        expiringAds={expiringAds}
        isAlertDismissed={isAlertDismissed}
        setIsAlertDismissed={setIsAlertDismissed}
        handleExtendCampaign={handleExtendCampaign}
      />

      {/* Search & Filters Controls */}
      <AdFiltersBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        slotTypeFilter={slotTypeFilter}
        setSlotTypeFilter={setSlotTypeFilter}
        selectedAdIds={selectedAdIds}
        handleBulkPause={handleBulkPause}
        handleBulkDelete={handleBulkDelete}
        handleExportCSV={handleExportCSV}
        ads={ads}
      />

      {/* Campaigns Table */}
      <AdCampaignsTable
        activeSidebarAds={activeSidebarAds}
        activeFooterAds={activeFooterAds}
        filteredAds={filteredAds}
        getAdStatus={getAdStatus}
        handleEditClick={handleEditClick}
        handleToggleStatus={handleToggleStatus}
        handleDelete={handleDelete}
      />

      {/* Advertiser Directory Section */}
      <AdvertiserDirectory advertisersList={advertisersList} />

      {/* Create/Edit Modal */}
      <CreateEditAdModal
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
        editingAd={editingAd}
        setEditingAd={setEditingAd}
        handleCreateCampaign={handleCreateCampaign}
        title={title}
        setTitle={setTitle}
        advertiser={advertiser}
        setAdvertiser={setAdvertiser}
        placement={placement}
        setPlacement={setPlacement}
        uploadMode={uploadMode}
        setUploadMode={setUploadMode}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        handleFileChange={handleFileChange}
        IMAGE_LIMITS={IMAGE_LIMITS}
        setSelectedFile={setSelectedFile}
        targetUrl={targetUrl}
        setTargetUrl={setTargetUrl}
        rotationSpeed={rotationSpeed}
        setRotationSpeed={setRotationSpeed}
        showScheduleSettings={showScheduleSettings}
        setShowScheduleSettings={setShowScheduleSettings}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        restrictHours={restrictHours}
        setRestrictHours={setRestrictHours}
        activeStartTime={activeStartTime}
        setActiveStartTime={setActiveStartTime}
        activeEndTime={activeEndTime}
        setActiveEndTime={setActiveEndTime}
        showBillingSettings={showBillingSettings}
        setShowBillingSettings={setShowBillingSettings}
        revenue={revenue}
        setRevenue={setRevenue}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
      />

      {/* Detail / Preview Modal */}
      <AdPerformanceInspector
        inspectingAd={inspectingAd}
        setInspectingAd={setInspectingAd}
        previewAd={previewAd}
        setPreviewAd={setPreviewAd}
        previewDevice={previewDevice}
        setPreviewDevice={setPreviewDevice}
      />

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
