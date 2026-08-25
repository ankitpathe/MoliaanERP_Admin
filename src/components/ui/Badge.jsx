import React from 'react';

export default function Badge({ children, variant = 'info', style = {}, ...props }) {
  const getStyles = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '0.75rem',
      fontWeight: 600,
      boxSizing: 'border-box'
    };

    if (variant === 'active' || variant === 'success') {
      return {
        ...base,
        background: '#d1fae5',
        color: '#065f46',
        ...style
      };
    }

    if (variant === 'inactive' || variant === 'danger') {
      return {
        ...base,
        background: '#fee2e2',
        color: '#991b1b',
        ...style
      };
    }

    if (variant === 'warning') {
      return {
        ...base,
        background: '#fef3c7',
        color: '#92400e',
        ...style
      };
    }

    return {
      ...base,
      background: '#f3f4f6',
      color: '#4b5563',
      ...style
    };
  };

  return (
    <span style={getStyles()} {...props}>
      {children}
    </span>
  );
}
