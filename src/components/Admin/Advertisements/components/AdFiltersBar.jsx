import React from 'react';
import Card from '../../../ui/Card';
import Input from '../../../ui/Input';
import Select from '../../../ui/Select';
import Button from '../../../ui/Button';

export default function AdFiltersBar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  slotTypeFilter,
  setSlotTypeFilter,
  selectedAdIds,
  handleBulkPause,
  handleBulkDelete,
  handleExportCSV,
  ads
}) {
  return (
    <>
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
    </>
  );
}
