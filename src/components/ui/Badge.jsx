import React from 'react';

export default function Badge({ children, variant = 'info', style = {}, ...props }) {
  const isDark = document.documentElement.classList.contains('dark');
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

    const variantNormalized = String(variant).toLowerCase();

    if (variantNormalized === 'purple' || variantNormalized === 'primary' || variantNormalized === 'brand') {
      return {
        ...base,
        background: isDark ? 'rgba(3, 80, 150, 0.15)' : '#e0effe',
        color: isDark ? '#3fa9f5' : '#035096',
        border: isDark ? '1px solid rgba(3, 80, 150, 0.25)' : 'none',
        ...style
      };
    }

    if (variantNormalized === 'active' || variantNormalized === 'success' || variantNormalized === 'resolved') {
      return {
        ...base,
        background: isDark ? 'rgba(16, 185, 129, 0.15)' : '#d1fae5',
        color: isDark ? '#34d399' : '#065f46',
        border: isDark ? '1px solid rgba(16, 185, 129, 0.25)' : 'none',
        ...style
      };
    }

    if (variantNormalized === 'inactive' || variantNormalized === 'danger' || variantNormalized === 'urgent' || variantNormalized === 'high') {
      return {
        ...base,
        background: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
        color: isDark ? '#f87171' : '#991b1b',
        border: isDark ? '1px solid rgba(239, 68, 68, 0.25)' : 'none',
        ...style
      };
    }

    if (variantNormalized === 'warning' || variantNormalized === 'in_progress' || variantNormalized === 'medium') {
      return {
        ...base,
        background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
        color: isDark ? '#fbbf24' : '#92400e',
        border: isDark ? '1px solid rgba(245, 158, 11, 0.25)' : 'none',
        ...style
      };
    }

    if (variantNormalized === 'low' || variantNormalized === 'open' || variantNormalized === 'info') {
      return {
        ...base,
        background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
        color: isDark ? '#60a5fa' : '#1d4ed8',
        border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : 'none',
        ...style
      };
    }

    return {
      ...base,
      background: isDark ? '#374151' : '#f3f4f6',
      color: isDark ? '#d1d5db' : '#4b5563',
      ...style
    };
  };

  return (
    <span style={getStyles()} {...props}>
      {children}
    </span>
  );
}
