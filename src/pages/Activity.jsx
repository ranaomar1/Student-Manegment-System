import React from 'react';
import { useStudents } from '../context/StudentContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

function formatDateTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

const ACTION_CONFIG = {
  Added:   { icon: '🟢', color: '#10b981', bg: '#d1fae5' },
  Edited:  { icon: '✏️',  color: '#f59e0b', bg: '#fef3c7' },
  Deleted: { icon: '🔴', color: '#ef4444', bg: '#fee2e2' },
};

export default function Activity() {
  const { activityLog } = useStudents();
  const navigate = useNavigate();

  return (
    <div className={`${styles.container} page-enter`} style={{ maxWidth: '700px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '16px', fontSize: '14px', fontWeight: 600 }}
      >← Back</button>
      <h1 className={styles.title}>Activity Log</h1>
      <p className={styles.subtitle}>All student events, newest first</p>

      {activityLog.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '40px', marginBottom: '12px' }}>📋</p>
          <p style={{ fontWeight: 600, marginBottom: '6px' }}>No activity yet</p>
          <p style={{ fontSize: '13px' }}>Actions like adding, editing, or deleting students will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          {activityLog.map((entry, i) => {
            const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.Edited;
            return (
              <div key={entry.id || i} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '14px 18px',
                animation: `fadeUp 0.2s ease ${Math.min(i, 10) * 0.03}s both`,
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', flexShrink: 0,
                }}>{cfg.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px', marginBottom: '2px' }}>
                    <span style={{ color: cfg.color }}>{entry.action}</span>
                    {' — '}
                    <span>{entry.studentName}</span>
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDateTime(entry.date)}</p>
                </div>
                {entry.action !== 'Deleted' && entry.studentId && (
                  <button onClick={() => navigate(`/student/${entry.studentId}`)} style={{
                    background: 'var(--hover)', border: '1px solid var(--border)',
                    borderRadius: '8px', padding: '6px 12px',
                    fontSize: '12px', fontWeight: 600, color: 'var(--text-sub)',
                    cursor: 'pointer', flexShrink: 0,
                  }}>View →</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
