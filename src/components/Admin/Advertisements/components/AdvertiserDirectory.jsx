import React from 'react';
import Card from '../../../ui/Card';
import Table from '../../../ui/Table';

export default function AdvertiserDirectory({ advertisersList }) {
  return (
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
  );
}
