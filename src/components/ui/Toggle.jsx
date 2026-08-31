import React from 'react';

export default function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange && onChange(!checked)}
      disabled={disabled}
      style={{
        width: '40px',
        height: '22px',
        borderRadius: '99px',
        background: checked ? '#035096' : '#d1d5db',
        position: 'relative',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.2s',
        padding: '2px',
        display: 'inline-flex',
        alignItems: 'center',
        outline: 'none'
      }}
    >
      <span
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transform: checked ? 'translateX(18px)' : 'translateX(0)',
          transition: 'transform 0.2s'
        }}
      />
    </button>
  );
}
