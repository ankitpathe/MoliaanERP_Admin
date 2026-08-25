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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-4 sm:bottom-4 z-[9999] flex flex-col gap-3 w-[calc(100%-2rem)] sm:w-full max-w-sm pointer-events-none">
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
      border: 'border-emerald-500/30 dark:border-emerald-500/20',
      bgBar: '#10b981',
      badge: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    error: {
      border: 'border-rose-500/30 dark:border-rose-500/20',
      bgBar: '#f43f5e',
      badge: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    warning: {
      border: 'border-amber-500/30 dark:border-amber-500/20',
      bgBar: '#f59e0b',
      badge: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    info: {
      border: 'border-sky-500/30 dark:border-sky-500/20',
      bgBar: '#0ea5e9',
      badge: 'bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400',
      icon: <Info className="w-5 h-5" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-full rounded-[16px] border ${config.border} bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xl p-4 flex gap-3 overflow-hidden select-none`}
      style={{
        animation: 'toast-slide-up 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards'
      }}
    >
      <div className={`p-2 rounded-xl self-start shrink-0 ${config.badge}`}>
        {config.icon}
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs tracking-wide uppercase">{title}</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{message}</p>
      </div>

      <button
        onClick={() => dismiss(id)}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors cursor-pointer"
        type="button"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* CSS Keyframe Animations injection */}
      <style>{`
        @keyframes toast-slide-up {
          from { transform: translateY(50px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3.5px] bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full"
          style={{
            background: config.bgBar,
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
