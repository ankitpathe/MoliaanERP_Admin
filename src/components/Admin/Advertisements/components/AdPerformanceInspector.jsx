import React from 'react';
import AdImage from '../AdImage';
import Badge from '../../../ui/Badge';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export default function AdPerformanceInspector({
  inspectingAd,
  setInspectingAd,
  previewAd,
  setPreviewAd,
  previewDevice,
  setPreviewDevice
}) {
  if (!inspectingAd && !previewAd) return null;

  if (inspectingAd) {
    const adCTR = inspectingAd.impressions > 0 ? ((inspectingAd.clicks / inspectingAd.impressions) * 100).toFixed(2) : '0.00';
    
    // Generate daily time-series mock data for SVG chart (7 days period)
    const dailyImps = [];
    const dailyClicks = [];
    const baseImps = inspectingAd.impressions / 7;
    const baseClicks = inspectingAd.clicks / 7;
    for (let i = 0; i < 7; i++) {
      dailyImps.push(Math.round(baseImps * (0.7 + Math.random() * 0.6)));
      dailyClicks.push(Math.round(baseClicks * (0.6 + Math.random() * 0.8)));
    }

    // SVG Chart coordinates calculations
    const width = 360;
    const height = 100;
    const maxVal = Math.max(...dailyImps, 1);
    const points = dailyImps.map((val, idx) => {
      const x = (idx / 6) * (width - 20) + 10;
      const y = height - (val / maxVal) * (height - 20) - 10;
      return `${x},${y}`;
    }).join(' ');

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
          width: '450px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          padding: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}>
          <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>Inspect Ad Campaign</span>
            <button type="button" onClick={() => setInspectingAd(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#9ca3af' }}>×</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Title</span>
            <strong style={{ fontSize: '0.9rem', color: '#1f2937' }}>{inspectingAd.title}</strong>
          </div>

          <div className="responsive-two-cols">
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Advertiser</span>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{inspectingAd.advertiser}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Placement</span>
              <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{inspectingAd.placement}</div>
            </div>
          </div>

          {/* Performance Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Impressions</span>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{inspectingAd.impressions.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Clicks</span>
              <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{inspectingAd.clicks.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>CTR</span>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#035096' }}>{adCTR}%</div>
            </div>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>Revenue</span>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#059669' }}>₹{inspectingAd.revenue}</div>
            </div>
          </div>

          {/* Performance Trend Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Performance Trend (Daily Impressions)</span>
            <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
              <svg width={width} height={height}>
                <polyline
                  fill="none"
                  stroke="#035096"
                  strokeWidth="2.5"
                  points={points}
                />
                {dailyImps.map((val, idx) => {
                  const x = (idx / 6) * (width - 20) + 10;
                  const y = height - (val / maxVal) * (height - 20) - 10;
                  return (
                    <circle key={idx} cx={x} cy={y} r="4" fill="#3fa9f5" />
                  );
                })}
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#9ca3af', padding: '0 4px' }}>
              <span>Day 1</span>
              <span>Day 4</span>
              <span>Day 7</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>Banner Creative Preview</span>
            <div style={{ background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '120px', border: '1px solid #cbd5e1' }}>
              {inspectingAd.imageUrl || inspectingAd.imageId ? (
                <AdImage ad={inspectingAd} style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }} />
              ) : (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={18} /> No visual asset (Text Banner)
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button 
              type="button" 
              onClick={() => setInspectingAd(null)}
              style={{ flex: 1, padding: '10px', background: '#035096', border: 'none', borderRadius: '8px', color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Dismiss Detail View
            </button>
          </div>
        </div>
      </>
    );
  }

  // Else, previewAd must be active:
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
        <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1f2937' }}>Live Merchant Dashboard Simulation Preview</span>
          
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
                  color: previewDevice === dev.key ? '#3fa9f5' : '#64748b',
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

        <div style={{ display: 'flex', justifyContent: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '340px' }}>
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
              <div style={{ display: 'flex', minHeight: '300px', width: '100%' }}>
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

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                  <div style={{ height: '40px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem' }}>
                    <strong style={{ color: '#334155' }}>WWE Arena Supermart</strong>
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Today: ₹18,450</span>
                  </div>

                  <div style={{ padding: '12px', display: 'flex', gap: '12px', flexDirection: 'column', flex: 1 }}>
                    {isLeaderboard && (
                      <div style={{ width: '100%', aspectRatio: '1200/628', maxHeight: '120px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <AdImage ad={previewAd} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

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
              background: '#035096', 
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
}
