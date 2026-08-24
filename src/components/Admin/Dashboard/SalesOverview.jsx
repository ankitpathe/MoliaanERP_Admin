import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function SalesOverview({ sales }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

  // Period totals
  const todaySales = sales
    .filter(s => s.date === todayStr)
    .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  const weeklySales = sales
    .filter(s => new Date(s.date) >= oneWeekAgo)
    .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  const monthlySales = sales
    .filter(s => new Date(s.date) >= oneMonthAgo)
    .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  const totalSalesVal = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

  // Group daily sales for a clean mini-chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const total = sales
      .filter(s => s.date === date)
      .reduce((sum, s) => sum + (Number(s.total) || 0), 0);
    const dayLabel = new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });
    return { date, dayLabel, total };
  });

  const maxTotal = Math.max(...chartData.map(d => d.total), 1000);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TrendingUp size={18} style={{ color: '#059669' }} />
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>Sales Performance Overview</h3>
      </div>

      {/* Totals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { label: "Today's Sales", value: todaySales },
          { label: "This Week", value: weeklySales },
          { label: "This Month", value: monthlySales },
          { label: "Total Revenue", value: totalSalesVal }
        ].map((item, idx) => (
          <div key={idx} style={{ background: '#fafafa', padding: '12px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>{item.label}</span>
            <strong style={{ fontSize: '1.1rem', color: '#111827', display: 'block', marginTop: '4px' }}>
              ₹{item.value.toLocaleString('en-IN')}
            </strong>
          </div>
        ))}
      </div>

      {/* Simple Pure-CSS Column Chart */}
      <div style={{ marginTop: '12px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: '16px' }}>Daily Sales (Last 7 Days)</span>
        
        {sales.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
            No sales data available yet
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '140px', padding: '0 8px' }}>
            {chartData.map((dataPoint, idx) => {
              const barHeight = (dataPoint.total / maxTotal) * 100;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#10b981' }}>
                    {dataPoint.total > 0 ? `₹${dataPoint.total}` : ''}
                  </span>
                  <div style={{
                    width: '60%',
                    maxWidth: '36px',
                    height: `${Math.max(barHeight, 4)}px`,
                    background: dataPoint.total > 0 ? '#10b981' : '#e5e7eb',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.3s ease'
                  }} />
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{dataPoint.dayLabel}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
