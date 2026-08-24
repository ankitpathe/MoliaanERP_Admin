import React from 'react';

export default function General() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: 0 }}>General Configurations</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563' }}>Organization Name</label>
        <input 
          type="text" 
          defaultValue="ONE ERP" 
          style={{ 
            width: '100%', 
            padding: '10px 14px', 
            fontSize: '0.875rem',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            outline: 'none',
            background: '#fafafa',
            color: '#1f2937'
          }} 
        />
      </div>
      <button 
        style={{ 
          padding: '10px 16px', 
          fontSize: '0.875rem', 
          fontWeight: 600, 
          background: '#7c7a6e', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '10px',
          cursor: 'pointer',
          alignSelf: 'flex-start',
          transition: 'background-color 0.2s'
        }} 
        onClick={() => alert('General settings updated!')}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d6b5e'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c7a6e'}
      >
        Save Settings
      </button>
    </div>
  );
}
