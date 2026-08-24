import React from 'react';
import { useOutletContext } from 'react-router-dom';

export default function Appearance() {
  const context = useOutletContext();
  const theme = context?.theme || 'light';
  const setTheme = context?.setTheme || (() => {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Theme Preferences</h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setTheme('light')}
          style={{ 
            padding: '12px 20px', 
            cursor: 'pointer', 
            borderRadius: '10px',
            border: theme === 'light' ? '2px solid #7c7a6e' : '1px solid #e5e7eb', 
            background: theme === 'light' ? '#f5ebe1' : '#ffffff',
            color: theme === 'light' ? '#7c7a6e' : '#4b5563',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          Cream Light
        </button>
        <button 
          onClick={() => setTheme('dark')}
          style={{ 
            padding: '12px 20px', 
            cursor: 'pointer', 
            borderRadius: '10px',
            border: theme === 'dark' ? '2px solid #a855f7' : '1px solid #e5e7eb', 
            background: theme === 'dark' ? '#161022' : '#ffffff',
            color: theme === 'dark' ? '#a855f7' : '#4b5563',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
        >
          Charcoal Dark
        </button>
      </div>
    </div>
  );
}
