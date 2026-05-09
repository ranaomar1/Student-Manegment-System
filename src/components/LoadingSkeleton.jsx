import React from 'react';

export function CardSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '12px', padding: '16px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 11, width: '40%' }} />
      </div>
      <div className="skeleton" style={{ width: 60, height: 24, borderRadius: 6 }} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_,i) => (
          <div key={i} className="skeleton" style={{ height: 90, borderRadius: 12 }} />
        ))}
      </div>
      {[...Array(3)].map((_,i) => (
        <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10, marginBottom: 10 }} />
      ))}
    </div>
  );
}
