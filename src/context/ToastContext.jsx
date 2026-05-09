import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();
let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const undoCallbacks = useRef({});

  const addToast = useCallback((message, type = 'success', undoCallback = null) => {
    const id = ++toastId;
    if (undoCallback) undoCallbacks.current[id] = undoCallback;
    setToasts(prev => [...prev, { id, message, type, hasUndo: !!undoCallback }]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete undoCallbacks.current[id];
    }, undoCallback ? 5000 : 3500);
    return () => clearTimeout(timer);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    delete undoCallbacks.current[id];
  }, []);

  const triggerUndo = useCallback((id) => {
    if (undoCallbacks.current[id]) {
      undoCallbacks.current[id]();
      removeToast(id);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        zIndex: 9999, pointerEvents: 'none'
      }}>
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onRemove={removeToast} onUndo={triggerUndo} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onRemove, onUndo }) {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const colors = {
    success: 'linear-gradient(135deg,#10b981,#059669)',
    error:   'linear-gradient(135deg,#ef4444,#dc2626)',
    info:    'linear-gradient(135deg,#6366f1,#4f46e5)',
    warning: 'linear-gradient(135deg,#f59e0b,#d97706)',
  };

  return (
    <div style={{
      pointerEvents: 'all',
      background: colors[toast.type] || colors.success,
      color: '#fff',
      padding: '12px 18px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      animation: 'toastIn 0.3s cubic-bezier(.34,1.56,.64,1) both',
      minWidth: '220px',
      maxWidth: '340px',
    }}>
      <span>{icons[toast.type]}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      {toast.hasUndo && (
        <button
          onClick={() => onUndo(toast.id)}
          style={{
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '12px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >Undo</button>
      )}
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
          fontSize: '16px', cursor: 'pointer', padding: '0 2px', flexShrink: 0,
        }}
      >✕</button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
