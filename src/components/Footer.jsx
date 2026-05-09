import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import { useAuth, PERMISSIONS } from '../context/AuthContext';
import { fetchRandomQuote } from '../services/api';
import styles from './Footer.module.css';
import logo from '../assets/logo.png';

function timeAgo(ts) {
  if (!ts) return '—';
  const s = (Date.now() - ts) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

export default function Footer() {
  const { students, activityLog } = useStudents();
  const { currentUser, permissions } = useAuth();
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const [quote, setQuote] = useState(null);

  const activeCount   = students.filter(s => s.status === 'Active').length;
  const inactiveCount = students.length - activeCount;
  const gradeCount    = new Set(students.map(s => s.grade)).size;
  const lastActivity  = activityLog[0];
  const perm          = currentUser ? PERMISSIONS[currentUser.role] : null;

  // Fetch motivational quote from API
  useEffect(() => {
    fetchRandomQuote().then(({ data }) => { if (data) setQuote(data); });
  }, []);

  const NAV_LINKS = [
    { to:'/',         label:'Dashboard',    always: true },
    { to:'/students', label:'Students',     always: true },
    { to:'/stats',    label:'Statistics',   always: true },
    { to:'/activity', label:'Activity Log', perm:'canViewActivity' },
    { to:'/users',    label:'User Management', perm:'canManageUsers' },
    { to:'/add-student', label:'Add Student',  perm:'canAddStudent' },
  ].filter(l => l.always || (permissions && permissions[l.perm]));

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>

        {/* ── Col 1: Brand + Status ─────────────────────── */}
        <div className={styles.col}>
          <div className={styles.brand}>
            <img src={logo} alt="SMS Logo" className={styles.brandLogo} />
            <div>
              <p className={styles.brandName}>
                <span className={styles.brandAccent}>SMS</span>
              </p>
              <p className={styles.brandSub}>Student Management System</p>
            </div>
          </div>

          {/* System status */}
          <div className={styles.statusPill} aria-label="System status: operational">
            <span className={styles.statusDot} aria-hidden="true" />
            All systems operational
          </div>

          {/* Logged-in user chip */}
          {currentUser && perm && (
            <div className={styles.userChip}>
              <span style={{ color: perm.color }}>{perm.icon}</span>
              <span className={styles.userChipName}>{currentUser.name}</span>
              <span className={styles.userChipRole} style={{ background: perm.bg, color: perm.color }}>
                {perm.badge}
              </span>
            </div>
          )}

          <p className={styles.copy}>© {year} SMS · All rights reserved</p>
        </div>

        {/* ── Col 2: Navigation ─────────────────────────── */}
        <div className={styles.col}>
          <p className={styles.colTitle}>Navigation</p>
          <nav aria-label="Footer navigation">
            <ul className={styles.navList}>
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({isActive}) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                    end={link.to === '/'}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Col 3: Live stats ─────────────────────────── */}
        <div className={styles.col}>
          <p className={styles.colTitle}>Live Stats</p>
          <div className={styles.statGrid}>
            <div className={styles.statBox}>
              <span className={styles.statNum}>{students.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statBox} style={{ '--stat-color': '#10b981' }}>
              <span className={styles.statNum} style={{ color:'#10b981' }}>{activeCount}</span>
              <span className={styles.statLabel}>Active</span>
            </div>
            <div className={styles.statBox} style={{ '--stat-color': '#f59e0b' }}>
              <span className={styles.statNum} style={{ color:'#f59e0b' }}>{inactiveCount}</span>
              <span className={styles.statLabel}>Inactive</span>
            </div>
            <div className={styles.statBox} style={{ '--stat-color': '#6366f1' }}>
              <span className={styles.statNum} style={{ color:'#6366f1' }}>{gradeCount}</span>
              <span className={styles.statLabel}>Grades</span>
            </div>
          </div>

          {/* Last activity */}
          {permissions?.canViewActivity && (
            <button
              className={styles.activityPill}
              onClick={() => navigate('/activity')}
              aria-label="View activity log"
            >
              <span>📋</span>
              <span className={styles.activityText}>
                {lastActivity
                  ? <>{lastActivity.action} <strong>{lastActivity.studentName}</strong> · {timeAgo(lastActivity.date)}</>
                  : 'No activity yet'
                }
              </span>
              <span className={styles.activityArrow}>→</span>
            </button>
          )}
        </div>

        {/* ── Col 4: Quote ──────────────────────────────── */}
        <div className={styles.col}>
          <p className={styles.colTitle}>Daily Inspiration</p>
          {quote ? (
            <figure className={styles.quoteBox} aria-label="Motivational quote">
              <blockquote className={styles.quoteText}>
                "{quote.quote.length > 120 ? quote.quote.slice(0, 120) + '…' : quote.quote}"
              </blockquote>
              <figcaption className={styles.quoteAuthor}>— {quote.author}</figcaption>
            </figure>
          ) : (
            <div className={styles.quoteSkeleton} aria-busy="true" aria-label="Loading quote" />
          )}

          <p className={styles.madeWith}>
            Built with <span className={styles.heart} aria-label="love">♥</span> for education
          </p>
        </div>

      </div>

      {/* ── Bottom bar ──────────────────────────────────── */}
      <div className={styles.bottomBar}>
        <p className={styles.bottomLeft}>
          Keyboard shortcuts: <kbd className={styles.kbd}>Ctrl+K</kbd> search · <kbd className={styles.kbd}>↑↓</kbd> navigate · <kbd className={styles.kbd}>Enter</kbd> open
        </p>
        <div className={styles.bottomRight}>
          <span className={styles.techBadge} title="React">⚛️ React</span>
          <span className={styles.techBadge} title="DummyJSON API">🔌 DummyJSON API</span>
          <span className={styles.techBadge} title="localStorage">💾 localStorage</span>
        </div>
      </div>
    </footer>
  );
}
