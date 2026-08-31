import React from 'react';
import StatCard from '../../../ui/StatCard';
import { Sparkles, Megaphone, ExternalLink, Activity, IndianRupee } from 'lucide-react';

export default function AdMetricsRow({ activeCampaignsCount, totalImpressions, totalClicks, avgCTR, totalAdRevenue }) {
  return (
    <div className="responsive-grid-4">
      <StatCard label="Active Campaigns" value={activeCampaignsCount} icon={Sparkles} color="#035096" />
      <StatCard label="Total Impressions" value={totalImpressions.toLocaleString()} icon={Megaphone} color="#06b6d4" />
      <StatCard label="Total Clicks" value={totalClicks.toLocaleString()} icon={ExternalLink} color="#10b981" />
      <StatCard label="Avg. Click-Through Rate" value={`${avgCTR}%`} icon={Activity} color="#ef4444" />
      <StatCard label="Total Ad Revenue" value={`₹${totalAdRevenue.toLocaleString('en-IN')}`} icon={IndianRupee} color="#059669" />
    </div>
  );
}
