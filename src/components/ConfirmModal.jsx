import React, { useEffect } from 'react';

export default function ConfirmModal({ name, onConfirm, onCancel }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(3px)', animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '18px', padding: '32px 28px', width: '100%', maxWidth: '380px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          animation: 'fadeUp 0.2s cubic-bezier(.34,1.56,.64,1) both',
          textAlign: 'center',
        }}
      >
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: '#fee2e2', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px',
        }}>🗑️</div>
        <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px', color: 'var(--text)' }}>
          Delete Student?
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '24px', lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{name}</strong>?
          <br />This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px', fontWeight: 600,
              background: 'var(--hover)', border: '1px solid var(--border)',
              color: 'var(--text-sub)', fontSize: '14px',
            }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px', borderRadius: '10px', fontWeight: 700,
              background: '#ef4444', color: '#fff', border: 'none', fontSize: '14px',
            }}
          >Delete</button>
        </div>
      </div>
    </div>
  );
}
