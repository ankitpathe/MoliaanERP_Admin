import React from 'react';

export default function Input({ style = {}, ...props }) {
  return (
    <input
      style={{
        padding: '8px 12px',
        fontSize: '0.85rem',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        outline: 'none',
        background: '#ffffff',
        color: '#1f2937',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    />
  );
}
