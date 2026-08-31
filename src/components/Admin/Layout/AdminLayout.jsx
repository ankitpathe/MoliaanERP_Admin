import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import AdImage from '../Advertisements/AdImage';

export default function AdminLayout({ sidebar, header, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const isDashboard = location.pathname === '/admin/dashboard';

  // Ad states
  const [activeVerts, setActiveVerts] = useState([]);
  const [activeHorizs, setActiveHorizs] = useState([]);
  const [currentVertIndex, setCurrentVertIndex] = useState(0);
  const [currentHorizIndex, setCurrentHorizIndex] = useState(0);

  const isAdCurrentlyEligible = (ad) => {
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);
    if (now < start || now > end) return false;

    const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDay = daysOfWeek[now.getDay()];
    const activeDays = ad.activeDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    if (!activeDays.includes(currentDay)) return false;

    if (ad.restrictHours && ad.activeStartTime && ad.activeEndTime) {
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      if (currentTimeString < ad.activeStartTime || currentTimeString > ad.activeEndTime) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const loadAds = () => {
      const raw = localStorage.getItem('erp_admin_ads') || localStorage.getItem('erp_advertisements') || '[]';
      const storedAds = JSON.parse(raw);
      const verts = storedAds.filter(a => 
        (a.type === 'VERTICAL' || a.placement === 'Merchant Dashboard (Vertical Skyscraper)' || a.placement === 'Sidebar') && 
        (a.status === 'ACTIVE' || a.status === 'active') &&
        isAdCurrentlyEligible(a)
      );
      const horizs = storedAds.filter(a => 
        (a.type === 'HORIZONTAL' || a.placement === 'POS Dual-Screen (Horizontal Leaderboard)' || a.placement === 'Footer') && 
        (a.status === 'ACTIVE' || a.status === 'active') &&
        isAdCurrentlyEligible(a)
      );

      console.log("Dashboard Ad Filter Check [Vertical]:", verts);
      console.log("Dashboard Ad Filter Check [Horizontal]:", horizs);

      setActiveVerts(verts);
      setActiveHorizs(horizs);
    };

    loadAds();
    window.addEventListener('storage', loadAds);
    return () => window.removeEventListener('storage', loadAds);
  }, []);

  // Auto-rotating vertical ads
  useEffect(() => {
    if (activeVerts.length > 0) {
      // Increment initial impression for the first active ad on mount/load
      incrementImpression(activeVerts[currentVertIndex].id);
    }

    if (activeVerts.length > 1) {
      const vertAd = activeVerts[currentVertIndex];
      const speed = (Number(vertAd?.rotationSpeed) || 8) * 1000;
      const interval = setInterval(() => {
        const nextIdx = (currentVertIndex + 1) % activeVerts.length;
        setCurrentVertIndex(nextIdx);
        incrementImpression(activeVerts[nextIdx].id);
      }, speed);
      return () => clearInterval(interval);
    }
  }, [activeVerts, currentVertIndex]);

  // Auto-rotating horizontal ads
  useEffect(() => {
    if (activeHorizs.length > 0) {
      incrementImpression(activeHorizs[currentHorizIndex].id);
    }

    if (activeHorizs.length > 1) {
      const horizAd = activeHorizs[currentHorizIndex];
      const speed = (Number(horizAd?.rotationSpeed) || 8) * 1000;
      const interval = setInterval(() => {
        const nextIdx = (currentHorizIndex + 1) % activeHorizs.length;
        setCurrentHorizIndex(nextIdx);
        incrementImpression(activeHorizs[nextIdx].id);
      }, speed);
      return () => clearInterval(interval);
    }
  }, [activeHorizs, currentHorizIndex]);

  const incrementImpression = (adId) => {
    try {
      const key = localStorage.getItem('erp_admin_ads') ? 'erp_admin_ads' : 'erp_advertisements';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = stored.map(a => {
        if (a.id === adId) {
          return { ...a, impressions: (Number(a.impressions) || 0) + 1 };
        }
        return a;
      });
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdClick = (ad) => {
    try {
      const key = localStorage.getItem('erp_admin_ads') ? 'erp_admin_ads' : 'erp_advertisements';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');
      const updated = stored.map(a => {
        if (a.id === ad.id) {
          return { ...a, clicks: (Number(a.clicks) || 0) + 1 };
        }
        return a;
      });
      localStorage.setItem(key, JSON.stringify(updated));

      toast.showInfo('Promo Link', `Navigating to target: ${ad.title}`);
      if (ad.targetUrl.startsWith('http')) {
        window.open(ad.targetUrl, '_blank');
      } else {
        navigate(ad.targetUrl);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const currentVertAd = activeVerts[currentVertIndex];
  const currentHorizAd = activeHorizs[currentHorizIndex];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-main)',
      position: 'relative',
      padding: '0px',
      gap: '0px',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* Desktop Sidebar (Left Panel - Full Height) */}
      <div className="desktop-sidebar-container">
        {sidebar}
      </div>
 
      {/* Mobile/Tablet Sidebar Drawer */}
      {mobileSidebarOpen && (
        <>
          <div 
            onClick={() => setMobileSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 998
            }}
          />
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '280px',
              zIndex: 999,
              boxShadow: '4px 0 25px rgba(0,0,0,0.15)',
              animation: 'slide-in 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {React.cloneElement(sidebar, { onCloseMobile: () => setMobileSidebarOpen(false) })}
          </div>
        </>
      )}
 
      {/* Unified Middle Content Workspace */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        overflow: 'hidden',
        background: 'transparent'
      }}>
        
        {/* Full-Width Header at top */}
        {React.cloneElement(header, { 
          onMenuToggle: () => setMobileSidebarOpen(!mobileSidebarOpen) 
        })}
        
        {/* Content Split: Scrollable page children (left) + Sticky vertical ad sidebar (right) */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          width: '100%'
        }}>
          
          {/* Scrollable Page Children Area */}
          <main className="admin-main-content" style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflowY: 'auto',
            minWidth: 0
          }}>
            {children}
          </main>

          {/* Desktop Right Ad Sidebar (Right Panel - Starts below Header) */}
          {isDashboard && (
            <div className="desktop-ad-sidebar">
              <div style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                height: '100%',
                boxSizing: 'border-box',
                overflowY: 'auto'
              }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#9ca3af',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}>
                  Sponsored Creative
                </span>

                {currentVertAd ? (
                  <div 
                    onClick={() => handleAdClick(currentVertAd)}
                    style={{
                      width: '100%',
                      height: 'calc(100vh - 180px)',
                      minHeight: '460px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                  >
                    <AdImage 
                      ad={currentVertAd} 
                      alt={currentVertAd.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '0px',
                      left: '0px',
                      right: '0px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                      padding: '24px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <span style={{ color: '#ffffff', fontSize: '0.85rem', fontWeight: 700 }}>{currentVertAd.title}</span>
                      <span style={{
                        color: '#38bdf8',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        Learn More <ArrowRight size={10} />
                      </span>
                    </div>
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.6)',
                      color: '#ffffff',
                      padding: '2px 6px',
                      fontSize: '0.6rem',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      Ad
                    </span>
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: 'calc(100vh - 180px)',
                    minHeight: '460px',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    padding: '24px',
                    textAlign: 'center',
                    gap: '12px',
                    boxSizing: 'border-box'
                  }}>
                    <Sparkles size={28} style={{ color: '#cbd5e1' }} />
                    <div>
                      <span style={{ display: 'block', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>Partner with Us</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Reach thousands of daily terminal counters. Advertise here.</span>
                    </div>
                    <button 
                      onClick={() => navigate('/admin/advertisements')}
                      style={{
                        marginTop: '12px',
                        padding: '8px 16px',
                        border: '1px solid #035096',
                        color: '#035096',
                        background: 'transparent',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Global Bottom Horizontal Ad Stripe (Full width of middle pane) */}
        {isDashboard && (
          <div className="admin-footer-ad-stripe" style={{
            width: '100%',
            borderTop: '1px solid #e5e7eb',
            background: '#ffffff',
            boxSizing: 'border-box',
            flexShrink: 0
          }}>
            {currentHorizAd ? (
              <div 
                onClick={() => handleAdClick(currentHorizAd)}
                style={{
                  width: '100%',
                  height: 'auto',
                  aspectRatio: '1456 / 180',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <AdImage 
                  ad={currentHorizAd} 
                  alt={currentHorizAd.title}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  color: '#ffffff',
                  padding: '2px 6px',
                  fontSize: '0.65rem',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  Ad • {currentHorizAd.title}
                </span>
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '70px',
                borderRadius: '8px',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                color: '#94a3b8',
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
                Advertise with Moliaan ERP - Contact us at sales@moliaan.com
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responsive adjustments & animations */}
      <style>{`
        .admin-main-content {
          padding: 24px;
        }
        .admin-footer-ad-stripe {
          padding: 12px 24px;
        }
        .desktop-sidebar-container {
          display: block;
          flex-shrink: 0;
        }
        .desktop-ad-sidebar {
          display: flex;
          flex-direction: column;
          width: 280px;
          height: 100%;
          border-left: 1px solid var(--border-muted);
          background: var(--bg-sidebar);
          flex-shrink: 0;
        }
        @media (max-width: 1023px) {
          .desktop-sidebar-container {
            display: none !important;
          }
          .mobile-burger-btn {
            display: flex !important;
          }
        }
        @media (min-width: 1024px) {
          .mobile-burger-btn {
            display: none !important;
          }
        }
        @media (max-width: 1200px) {
          .desktop-ad-sidebar {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .admin-main-content {
            padding: 16px;
          }
          .admin-footer-ad-stripe {
            padding: 12px 16px;
          }
        }
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
