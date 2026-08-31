import React from 'react';

export default function Button({ children, variant = 'primary', style = {}, ...props }) {
  const getStyles = () => {
    const base = {
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      transition: 'all 0.2s',
      boxSizing: 'border-box'
    };

    if (variant === 'primary') {
      return {
        ...base,
        background: '#1f2937',
        color: '#ffffff',
        border: 'none',
        ...style
      };
    }

    if (variant === 'secondary') {
      return {
        ...base,
        background: '#ffffff',
        border: '1px solid #d1d5db',
        color: '#4b5563',
        ...style
      };
    }

    if (variant === 'purple') {
      return {
        ...base,
        background: 'linear-gradient(to right, #035096, #3FA9F5)',
        color: '#ffffff',
        border: 'none',
        ...style
      };
    }

    return { ...base, ...style };
  };

  return (
    <button style={getStyles()} {...props}>
      {children}
    </button>
  );
}
