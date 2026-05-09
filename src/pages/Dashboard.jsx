import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import DashboardCard from '../components/DashboardCard';
import AnimatedCounter from '../components/AnimatedCounter';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import styles from './Dashboard.module.css';

const GRADE_COLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6','#ec4899','#14b8a6'];

function nameColor(name) {
  const colors = [
    { bg:'#ede9fe', color:'#7c3aed' }, { bg:'#d1fae5', color:'#065f46' },
    { bg:'#fef3c7', color:'#92400e' }, { bg:'#fee2e2', color:'#991b1b' },
    { bg:'#e0f2fe', color:'#0369a1' }, { bg:'#fce7f3', color:'#9d174d' },
  ];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

function initials(name) {
  return name.split(' ').slice(0,2).map(w=>w[0].toUpperCase()).join('');
}

function isBirthdaySoon(birthday) {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  const diff = (thisYearBday - today) / (1000*60*60*24);
  return diff >= 0 && diff <= 7;
}

export default function Dashboard() {
  const { students, recentlyViewed } = useStudents();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const activeCount   = students.filter(s => s.status === 'Active').length;
  const inactiveCount = students.length - activeCount;
  const gradeMap      = {};
  students.forEach(s => { gradeMap[s.grade] = (gradeMap[s.grade] || 0) + 1; });
  const grades  = Object.entries(gradeMap).sort((a,b) => a[0].localeCompare(b[0]));
  const maxVal  = Math.max(...grades.map(g => g[1]), 1);
  const avgAge  = students.length
    ? (students.reduce((s,st) => s + st.age, 0) / students.length).toFixed(1)
    : '—';

  const birthdayStudents = students.filter(s => isBirthdaySoon(s.birthday));
  const today = new Date().toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' });

  if (loading) return (
    <div className={styles.container}>
      <div className={styles.titleSkeleton} style={{ height:32, width:220, marginBottom:8 }} />
      <div className={styles.titleSkeleton} style={{ height:16, width:160, marginBottom:28 }} />
      <DashboardSkeleton />
    </div>
  );

  return (
    <div className={`${styles.container} page-enter`}>
      <h1 className={styles.title}>Good morning 👋</h1>
      <p className={styles.subtitle}>{today} · Here's your student overview</p>

      <div className={styles.metricsGrid}>
        <DashboardCard label="Total Students" value={<AnimatedCounter value={students.length} />} color="#6366f1" icon="👥" />
        <DashboardCard label="Active"          value={<AnimatedCounter value={activeCount} />}    color="#10b981" icon="✅" />
        <DashboardCard label="Inactive"        value={<AnimatedCounter value={inactiveCount} />}  color="#f59e0b" icon="⏸️" />
        <DashboardCard label="Avg. Age"        value={avgAge}                                      color="#3b82f6" icon="🎓" />
      </div>

      {/* Birthday alerts */}
      {birthdayStudents.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08))',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '14px', padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px',
        }}>
          <span style={{ fontSize: '24px' }}>🎂</span>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '14px' }}>
              Birthday{birthdayStudents.length > 1 ? 's' : ''} this week!
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
              {birthdayStudents.map(s => s.name).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className={styles.midRow}>
        <div className={styles.chartCard}>
          <p className={styles.sectionTitle}>Students per Grade</p>
          <div className={styles.chart}>
            {grades.length === 0
              ? <p style={{ color:'var(--text-muted)', fontSize:'13px', margin:'auto' }}>No data yet</p>
              : grades.map(([grade, count], i) => (
                <div key={grade} className={styles.barGroup}>
                  <span className={styles.barCount}>{count}</span>
                  <div className={styles.bar}
                    style={{ height:`${(count / maxVal) * 100}%`, background: GRADE_COLORS[i % GRADE_COLORS.length] }} />
                  <span className={styles.barLabel}>{grade.replace('Grade ', 'G')}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className={styles.actionsCol}>
          {[
            { icon:'👥', title:'View Students', sub:'Browse & manage', path:'/students' },
            { icon:'➕', title:'Add Student',   sub:'Register new',    path:'/add-student' },
            { icon:'📊', title:'Statistics',    sub:'Charts & insights',path:'/stats' },
            { icon:'📋', title:'Activity Log',  sub:'All events',       path:'/activity' },
          ].map(a => (
            <button key={a.path} className={styles.actionCard} onClick={() => navigate(a.path)}>
              <div className={styles.actionIcon}>{a.icon}</div>
              <div>
                <p className={styles.actionTitle}>{a.title}</p>
                <p className={styles.actionSub}>{a.sub}</p>
              </div>
              <span style={{ marginLeft:'auto', color:'var(--text-muted)', fontSize:'14px' }}>›</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🕐 Recently Viewed</h2>
          </div>
          <div style={{ display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' }}>
            {recentlyViewed.map(s => {
              const av = nameColor(s.name);
              return (
                <button key={s.id} onClick={() => navigate(`/student/${s.id}`)} style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  background:'var(--surface)', border:'1px solid var(--border)',
                  borderRadius:'12px', padding:'10px 14px', cursor:'pointer',
                  transition:'all 0.15s ease', flex: '1', minWidth: '160px', maxWidth: '200px',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.boxShadow='0 4px 12px rgba(var(--accent-rgb),0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
                >
                  <div style={{ width:'32px',height:'32px',borderRadius:'50%',background:av.bg,color:av.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'12px',flexShrink:0 }}>
                    {initials(s.name)}
                  </div>
                  <div style={{ textAlign:'left', minWidth:0 }}>
                    <p style={{ fontWeight:700, color:'var(--text)', fontSize:'13px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</p>
                    <p style={{ color:'var(--text-muted)', fontSize:'11px' }}>{s.grade}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recent Students</h2>
        <button className={styles.seeAll} onClick={() => navigate('/students')}>See all →</button>
      </div>

      <div className={styles.recentList}>
        {students.length === 0 ? (
          <div className={styles.empty}>
            <p style={{fontSize:'36px',marginBottom:'0.5rem'}}>🎓</p>
            <p>No students yet. <button className={styles.emptyLink} onClick={() => navigate('/add-student')}>Add one →</button></p>
          </div>
        ) : (
          [...students].slice(-5).reverse().map(s => {
            const av = nameColor(s.name);
            return (
              <div key={s.id} className={styles.recentItem} onClick={() => navigate(`/student/${s.id}`)}>
                <div className={styles.recentAvatar} style={{ background:av.bg, color:av.color }}>{s.name.split(' ').slice(0,2).map(w=>w[0]).join('')}</div>
                <div className={styles.recentInfo}>
                  <p className={styles.recentName}>{s.name}{isBirthdaySoon(s.birthday) && ' 🎂'}</p>
                  <p className={styles.recentSub}>{s.grade} · Age {s.age}</p>
                </div>
                <span className={`${styles.badge} ${s.status==='Active' ? styles.badgeActive : styles.badgeInactive}`}>{s.status}</span>
                <span className={styles.recentArrow}>›</span>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.tipRow}>
        💡 Press <kbd className={styles.kbd}>Ctrl+K</kbd> to search · <kbd className={styles.kbd}>↑↓</kbd> to navigate in Students list
      </div>
    </div>
  );
}
