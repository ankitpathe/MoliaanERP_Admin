import React, { useState } from 'react';

export default function AdminLayout({ sidebar, header, children }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-main)',
      background: 'var(--bg-main-grad)',
      position: 'relative',
      padding: '24px',
      gap: '24px',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      
      {/* Background Glow Blobs */}
      <div className="bg-glow-container">
        <div className="glow-blob glow-purple-1"></div>
        <div className="glow-blob glow-pink-1"></div>
        <div className="glow-blob glow-purple-2"></div>
      </div>

      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-container">
        {React.cloneElement(sidebar, { onCloseMobile: null })}
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
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              backdropFilter: 'blur(8px)',
              zIndex: 998
            }}
          />
          <div 
            style={{
              position: 'fixed',
              top: '16px',
              left: '16px',
              bottom: '16px',
              zIndex: 999,
              animation: 'slide-in 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {React.cloneElement(sidebar, { onCloseMobile: () => setMobileSidebarOpen(false) })}
          </div>
        </>
      )}

      {/* Unified Main Content Card Workspace */}
      <div className="glass-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        height: '100%',
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 20px 40px -15px rgba(27, 32, 46, 0.05)'
      }}>
        {React.cloneElement(header, { 
          onMenuToggle: () => setMobileSidebarOpen(!mobileSidebarOpen) 
        })}
        
        <main style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          padding: '24px',
          overflowY: 'auto'
        }}>
          {children}
        </main>
      </div>

      {/* Responsive adjustments & animations */}
      <style>{`
        .desktop-sidebar-container {
          display: block;
          flex-shrink: 0;
        }
        @media (max-width: 1023px) {
          .desktop-sidebar-container {
            display: none !important;
          }
        }
        
        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
