import React from 'react';
import Card from '../../../ui/Card';
import Table from '../../../ui/Table';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';
import AdImage from '../AdImage';
import { Megaphone } from 'lucide-react';

export default function AdCampaignsTable({
  activeSidebarAds,
  activeFooterAds,
  filteredAds,
  getAdStatus,
  handleEditClick,
  handleToggleStatus,
  handleDelete
}) {
  const tableHeaders = [
    { label: 'Ad Info' },
    { label: 'Placement' },
    { label: 'Rotation' },
    { label: 'Status' },
    { label: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <>
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
        <div className="desktop-view">
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
        </div>

        <div className="mobile-view">
          {filteredAds.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
              No ads matching filters.
            </div>
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
                <div key={ad.id} style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-control)', border: '1px solid var(--border-muted)', borderRadius: '12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ad.imageUrl || ad.imageId ? (
                        <AdImage ad={ad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Megaphone size={14} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{ad.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{ad.advertiser}</span>
                    </div>
                    <Badge variant={badgeVariant}>{badgeLabel}</Badge>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px solid var(--border-muted)', paddingTop: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Placement:</span>{' '}
                      <span style={{ fontWeight: 600 }}>{ad.placement}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Rotation:</span>{' '}
                      <span style={{ fontWeight: 600 }}>{ad.rotationSpeed || 8}s</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-muted)', paddingTop: '8px' }}>
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
                </div>
              );
            })
          )}
        </div>
      </Card>
    </>
  );
}
