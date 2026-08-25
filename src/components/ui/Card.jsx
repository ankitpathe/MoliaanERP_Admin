import React from 'react';

export default function Card({ children, style = {}, ...props }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
