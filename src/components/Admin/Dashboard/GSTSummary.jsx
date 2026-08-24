import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Percent } from 'lucide-react';

export default function GSTSummary({ sales }) {
  const navigate = useNavigate();

  // Compute GST based on sales totals
  // Assuming a standard avg rate of 18% if direct tax details aren't stored
  const totalSalesVal = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
  const estimatedTaxableSales = totalSalesVal / 1.18;
  const estimatedGST = totalSalesVal - estimatedTaxableSales;

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Percent size={18} style={{ color: '#0f9f6e' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>GST / Tax Summary</h3>
        </div>
        <button 
          onClick={() => navigate('/gst/summary')}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#7c7a6e',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          View Tax Summary
        </button>
      </div>

      {sales.length === 0 ? (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#9ca3af', border: '1px dashed #e5e7eb', borderRadius: '12px' }}>
          No tax data available yet
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#fafafa', padding: '14px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Taxable Sales Volume</span>
            <strong style={{ fontSize: '1.25rem', color: '#111827', display: 'block', marginTop: '6px' }}>
              ₹{estimatedTaxableSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </strong>
          </div>
          <div style={{ background: '#fafafa', padding: '14px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Estimated GST Output</span>
            <strong style={{ fontSize: '1.25rem', color: '#0f9f6e', display: 'block', marginTop: '6px' }}>
              ₹{estimatedGST.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
