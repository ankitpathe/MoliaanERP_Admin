import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Select({
  children,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  style = {},
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Parse options from children if children are provided instead of options array
  let parsedOptions = [];
  if (options) {
    parsedOptions = options;
  } else if (children) {
    React.Children.forEach(children, child => {
      if (child && child.type === 'option') {
        parsedOptions.push({
          value: child.props.value,
          label: child.props.children
        });
      }
    });
  }

  const selectedOption = parsedOptions.find(opt => String(opt.value) === String(value));

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focus index when closed
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    // Call mock event structure for backwards compatibility with onChange(e)
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      setFocusedIndex(prev => (prev + 1) % parsedOptions.length);
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setFocusedIndex(prev => (prev - 1 + parsedOptions.length) % parsedOptions.length);
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < parsedOptions.length) {
        handleSelect(parsedOptions[focusedIndex].value);
      } else if (selectedOption) {
        setIsOpen(false);
      }
      e.preventDefault();
    }
  };

  return (
    <div 
      ref={containerRef} 
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        outline: 'none',
        minWidth: '160px',
        boxSizing: 'border-box',
        ...style
      }}
      {...props}
    >
      {label && (
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          {label}
        </span>
      )}
      
      {/* Closed trigger state */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          fontSize: '0.85rem',
          borderRadius: '8px',
          border: '1px solid var(--border-muted)',
          background: 'var(--bg-control)',
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box',
          height: '38px',
          boxShadow: isOpen ? '0 0 0 2px rgba(124, 58, 237, 0.2)' : 'none',
          borderColor: isOpen ? '#7c3aed' : 'var(--border-muted)'
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }} />
      </div>

      {/* Dropdown open state */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: label ? 'calc(100% - 2px)' : 'calc(100% + 4px)',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          border: '1px solid var(--border-muted)',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 9999,
          maxHeight: '220px',
          overflowY: 'auto',
          padding: '4px 0',
          boxSizing: 'border-box'
        }}>
          {parsedOptions.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              No options
            </div>
          ) : (
            parsedOptions.map((opt, idx) => {
              const isSelected = String(opt.value) === String(value);
              const isFocused = idx === focusedIndex;
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '0.825rem',
                    color: isSelected ? '#7c3aed' : 'var(--text-primary)',
                    background: isSelected ? 'var(--accent-primary-glow)' : isFocused ? 'var(--bg-control-hover)' : 'transparent',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={14} style={{ color: '#7c3aed' }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
