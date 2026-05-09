import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStudents }       from '../context/StudentContext';
import { useAuth, PERMISSIONS } from '../context/AuthContext';
import styles from './Navbar.module.css';
import logo from '../assets/logo.png';

function nameColor(name='') {
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9'];
  let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))%colors.length;
  return colors[h];
}

export default function Navbar() {
  const { dark, setDark }            = useStudents();
  const { currentUser, permissions, logout } = useAuth();
  const navigate                     = useNavigate();
  const [menuOpen, setMenuOpen]      = useState(false);
  const menuRef                      = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleDarkToggle = (e) => {
    const rect   = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width  / 2;
    const y = rect.top  + rect.height / 2;
    const maxDim = Math.max(window.innerWidth, window.innerHeight) * 2.5;
    const ripple = document.createElement('div');
    ripple.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;background:${dark?'#f4f5fb':'#0c0e16'};transform:translate(-50%,-50%);transition:width .6s ease,height .6s ease,opacity .6s ease;z-index:99998;pointer-events:none;opacity:.95;`;
    document.body.appendChild(ripple);
    requestAnimationFrame(() => { ripple.style.width=`${maxDim}px`; ripple.style.height=`${maxDim}px`; });
    setTimeout(() => setDark(d=>!d), 300);
    setTimeout(() => { ripple.style.opacity='0'; setTimeout(() => ripple.remove(), 300); }, 600);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const perm = currentUser ? PERMISSIONS[currentUser.role] : null;
  const avatarColor = nameColor(currentUser?.name || '');

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main navigation">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>

      {/* Brand */}
      <div className={styles.brand}
         onClick={() => navigate('/')}
         role="link"
         aria-label="SMS home"
         tabIndex={0}
         onKeyDown={e => e.key === 'Enter' && navigate('/')}>
          <img src={logo} alt="Logo" className={styles.logo} />
      </div>

      {/* Nav links */}
      <div className={styles.links} role="menubar">
        <NavLink to="/"         aria-label="Dashboard" className={({isActive})=>isActive?styles.active:styles.link} end>Dashboard</NavLink>
        <NavLink to="/students" aria-label="Students"  className={({isActive})=>isActive?styles.active:styles.link}>Students</NavLink>
        <NavLink to="/stats"    aria-label="Statistics" className={({isActive})=>isActive?styles.active:styles.link}>Stats</NavLink>
        {permissions?.canViewActivity  && <NavLink to="/activity" aria-label="Activity log" className={({isActive})=>isActive?styles.active:styles.link}>Activity</NavLink>}
        {permissions?.canManageUsers   && <NavLink to="/users"    aria-label="User management" className={({isActive})=>isActive?styles.active:styles.link}>Users</NavLink>}
        {permissions?.canAddStudent && <NavLink to="/add-student" className={styles.addLink} aria-label="Add new student">+ Add Student</NavLink>}
        {permissions?.canAddStudent && <NavLink to="/api-import" className={({isActive}) => isActive ? styles.active : styles.link} aria-label="Import from API">🔌 Import</NavLink>}
      </div>

      {/* Center logo */}
      <div className={styles.centerLogo}>
        <img src={logo} alt="Logo" className={styles.centerLogoImg} />
      </div>

      {/* Right controls */}
      <div className={styles.controls}>
        <span className={styles.shortcutHint} title="Ctrl+K to search" aria-hidden="true">⌘K</span>

        <button
          className={styles.darkBtn}
          onClick={handleDarkToggle}
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* User avatar + dropdown */}
        {currentUser && (
          <div ref={menuRef} style={{ position:'relative' }}>
            <button
              className={styles.avatarBtn}
              onClick={() => setMenuOpen(m=>!m)}
              aria-label="User menu"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <div className={styles.avatar} style={{ background: avatarColor+'22', color: avatarColor }}>
                {currentUser.avatar || currentUser.name[0]}
              </div>
              <div className={styles.avatarInfo}>
                <span className={styles.avatarName}>{currentUser.name.split(' ')[0]}</span>
                <span className={styles.avatarRole} style={{ color: perm?.color }}>{perm?.icon} {perm?.badge}</span>
              </div>
              <span style={{ fontSize:'10px', color:'var(--text-muted)', marginLeft:'2px' }}>▼</span>
            </button>

            {menuOpen && (
              <div className={styles.dropdown} role="menu" aria-label="User options">
                {/* User info header */}
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownAvatar} style={{ background: avatarColor+'22', color: avatarColor }}>
                    {currentUser.avatar}
                  </div>
                  <div>
                    <p className={styles.dropdownName}>{currentUser.name}</p>
                    <p className={styles.dropdownEmail}>{currentUser.email}</p>
                    <span className={styles.dropdownBadge} style={{ background: perm?.bg, color: perm?.color }}>
                      {perm?.icon} {perm?.label}
                    </span>
                  </div>
                </div>

                <div className={styles.dropdownDivider} />

                {/* Permissions summary */}
                <div className={styles.dropdownPerms}>
                  {[
                    ['canAddStudent',    '➕ Add students'],
                    ['canEditStudent',   '✏️  Edit students'],
                    ['canDeleteStudent', '🗑️  Delete students'],
                    ['canManageUsers',   '👥 Manage users'],
                  ].map(([key, label]) => (
                    <div key={key} className={styles.permRow}>
                      <span className={permissions?.[key] ? styles.permYes : styles.permNo}>
                        {permissions?.[key] ? '✅' : '🚫'}
                      </span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.dropdownDivider} />

                <button className={styles.logoutBtn} onClick={handleLogout} role="menuitem" aria-label="Sign out">
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
