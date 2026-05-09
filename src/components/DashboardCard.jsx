import React from 'react';
import styles from './DashboardCard.module.css';

export default function DashboardCard({ label, value, color, icon, trend }) {
  return (
    <div className={styles.card}>
      <div className={styles.iconWrap} style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <p className={styles.value} style={{ color }}>{value}</p>
      <p className={styles.label}>{label}</p>
      {trend !== undefined && (
        <p className={styles.trend} style={{ color: trend >= 0 ? '#10b981' : '#ef4444' }}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} this week
        </p>
      )}
    </div>
  );
}
