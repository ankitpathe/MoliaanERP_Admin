import React from 'react';

export default function Input({ style = {}, ...props }) {
  const isDark = document.documentElement.classList.contains('dark');
  return (
    <input
      style={{
        padding: '8px 12px',
        fontSize: '0.85rem',
        borderRadius: '8px',
        border: isDark ? '1px solid var(--border-muted)' : '1px solid #d1d5db',
        outline: 'none',
        background: 'var(--bg-control)',
        color: 'var(--text-primary)',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    />
  );
}
