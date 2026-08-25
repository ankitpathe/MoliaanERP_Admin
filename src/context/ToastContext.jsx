import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, message, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showSuccess = (title, message, duration = 4000) => addToast('success', title, message, duration);
  const showError = (title, message, duration = 5000) => addToast('error', title, message, duration);
  const showWarning = (title, message, duration = 4000) => addToast('warning', title, message, duration);
  const showInfo = (title, message, duration = 4000) => addToast('info', title, message, duration);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        dismiss(toasts[toasts.length - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toasts, showSuccess, showError, showWarning, showInfo, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, dismiss }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '320px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} dismiss={dismiss} />
      ))}
    </div>
  );
};

const ToastCard = ({ toast, dismiss }) => {
  const { id, type, title, message, duration = 4000 } = toast;
  const [remaining, setRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const startTime = useRef(Date.now());
  const timerId = useRef(null);

  useEffect(() => {
    if (isPaused) {
      if (timerId.current) clearTimeout(timerId.current);
      return;
    }

    startTime.current = Date.now();
    timerId.current = window.setTimeout(() => {
      dismiss(id);
    }, remaining);

    return () => {
      if (timerId.current) clearTimeout(timerId.current);
    };
  }, [isPaused, remaining, id, dismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTime.current;
    setRemaining((prev) => Math.max(0, prev - elapsed));
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const typeConfig = {
    success: {
      color: '#10b981',
      bgIcon: 'rgba(16, 185, 129, 0.15)',
      icon: <CheckCircle size={18} />
    },
    error: {
      color: '#f43f5e',
      bgIcon: 'rgba(244, 63, 94, 0.15)',
      icon: <AlertCircle size={18} />
    },
    warning: {
      color: '#f59e0b',
      bgIcon: 'rgba(245, 158, 11, 0.15)',
      icon: <AlertTriangle size={18} />
    },
    info: {
      color: '#38bdf8',
      bgIcon: 'rgba(56, 189, 248, 0.15)',
      icon: <Info size={18} />
    }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        background: '#1e293b',
        color: '#ffffff',
        padding: '16px 20px 20px 20px',
        borderRadius: '12px',
        border: '1px solid #334155',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)',
        position: 'relative',
        width: '100%',
        minHeight: '82px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pointerEvents: 'auto',
        animation: 'toast-slide-in 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }}
    >
      {/* Type Icon Container */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        background: config.bgIcon,
        color: config.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {config.icon}
      </div>

      {/* Main Text Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
        paddingRight: '16px'
      }}>
        <h4 style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          margin: 0
        }}>
          {title}
        </h4>
        <p style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          lineHeight: '1.4',
          margin: 0
        }}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => dismiss(id)}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '6px'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        type="button"
      >
        <X size={14} />
      </button>

      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Bottom Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: '0px',
        left: '0px',
        right: '0px',
        height: '4px',
        background: 'rgba(255, 255, 255, 0.1)'
      }}>
        <div
          style={{
            height: '100%',
            background: config.color,
            width: isPaused ? `${(remaining / duration) * 100}%` : '0%',
            transition: isPaused ? 'none' : `width ${remaining}ms linear`,
            animation: isPaused ? 'none' : `toast-progress ${remaining}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
