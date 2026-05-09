import React from 'react';
import { useStudents } from '../context/StudentContext';
import styles from './Stats.module.css';

const GRADE_COLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#14b8a6'];
const PIE_COLORS   = ['#10b981','#f59e0b'];

function PieSlice({ pct, color, offset }) {
  const r = 60;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return (
    <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="28"
      strokeDasharray={`${dash} ${circumference - dash}`}
      strokeDashoffset={-offset * circumference / 100}
      style={{ transition: 'stroke-dasharray 0.8s ease' }} />
  );
}

export default function Stats() {
  const { students } = useStudents();

  const activeCount   = students.filter(s => s.status === 'Active').length;
  const inactiveCount = students.length - activeCount;
  const activePct     = students.length ? Math.round((activeCount / students.length) * 100) : 0;

  const gradeMap = {};
  const ageMap   = {};
  students.forEach(s => {
    gradeMap[s.grade] = (gradeMap[s.grade] || 0) + 1;
    const bucket = `${Math.floor(s.age/5)*5}–${Math.floor(s.age/5)*5+4}`;
    ageMap[bucket] = (ageMap[bucket] || 0) + 1;
  });
  const grades   = Object.entries(gradeMap).sort((a,b) => a[0].localeCompare(b[0]));
  const ageBuckets = Object.entries(ageMap).sort((a,b) => parseInt(a[0]) - parseInt(b[0]));
  const maxGrade = Math.max(...grades.map(g => g[1]), 1);
  const maxAge   = Math.max(...ageBuckets.map(a => a[1]), 1);
  const avgAge   = students.length ? (students.reduce((s,st) => s + st.age, 0) / students.length).toFixed(1) : 0;

  return (
    <div className={`${styles.container} page-enter`}>
      <h1 className={styles.title}>📊 Statistics</h1>
      <p className={styles.sub}>Deep dive into your student data</p>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        {[
          { label: 'Total Students', value: students.length, icon: '👥', color: '#6366f1' },
          { label: 'Active Rate',    value: `${activePct}%`, icon: '✅', color: '#10b981' },
          { label: 'Average Age',    value: avgAge,          icon: '📅', color: '#f59e0b' },
          { label: 'Grade Levels',   value: grades.length,  icon: '🎓', color: '#3b82f6' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={styles.summaryCard} style={{ borderTop: `3px solid ${color}` }}>
            <span style={{ fontSize: '24px' }}>{icon}</span>
            <p className={styles.summaryValue} style={{ color }}>{value}</p>
            <p className={styles.summaryLabel}>{label}</p>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        {/* Grade bar chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Students by Grade</h3>
          <div className={styles.barChart}>
            {grades.map(([grade, count], i) => (
              <div key={grade} className={styles.barGroup}>
                <span className={styles.barCount}>{count}</span>
                <div className={styles.barWrap}>
                  <div className={styles.bar}
                    style={{ width: `${(count / maxGrade) * 100}%`, background: GRADE_COLORS[i % GRADE_COLORS.length] }} />
                </div>
                <span className={styles.barLabel}>{grade.replace('Grade ', 'G')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pie chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Active vs Inactive</h3>
          <div className={styles.pieWrap}>
            <svg viewBox="0 0 140 140" width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
              <PieSlice pct={activePct}       color="#10b981" offset={0} />
              <PieSlice pct={100 - activePct} color="#f59e0b" offset={activePct} />
            </svg>
            <div className={styles.pieLegend}>
              <div className={styles.legendItem}>
                <span style={{ background: '#10b981' }} className={styles.dot} />
                <span>Active ({activeCount})</span>
              </div>
              <div className={styles.legendItem}>
                <span style={{ background: '#f59e0b' }} className={styles.dot} />
                <span>Inactive ({inactiveCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Age distribution */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Age Distribution</h3>
          <div className={styles.barChart}>
            {ageBuckets.map(([bucket, count], i) => (
              <div key={bucket} className={styles.barGroup}>
                <span className={styles.barCount}>{count}</span>
                <div className={styles.barWrap}>
                  <div className={styles.bar}
                    style={{ width: `${(count / maxAge) * 100}%`, background: GRADE_COLORS[i % GRADE_COLORS.length] }} />
                </div>
                <span className={styles.barLabel}>{bucket}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grade table */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Grade Breakdown</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Grade</th><th>Count</th><th>Active</th><th>%</th>
              </tr>
            </thead>
            <tbody>
              {grades.map(([grade, count], i) => {
                const active = students.filter(s => s.grade === grade && s.status === 'Active').length;
                const pct = Math.round((count / students.length) * 100);
                return (
                  <tr key={grade}>
                    <td><span className={styles.dot} style={{ background: GRADE_COLORS[i % GRADE_COLORS.length] }} />{grade}</td>
                    <td>{count}</td>
                    <td style={{ color: '#10b981' }}>{active}</td>
                    <td>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className={styles.empty}>
          <p style={{ fontSize: '48px', marginBottom: '12px' }}>📊</p>
          <p>No data to display yet. Add some students first!</p>
        </div>
      )}
    </div>
  );
}
