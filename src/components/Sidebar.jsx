import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import { useAuth, PERMISSIONS } from '../context/AuthContext';
import styles from './Sidebar.module.css';
import logo from '../assets/logo.png';

function nameColor(name = '') {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

export default function Sidebar() {
  const { dark, setDark, clearRecentlyViewed } = useStudents();
  const { currentUser, permissions, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sms_sidebar_collapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sms_sidebar_collapsed', String(collapsed));
    document.body.setAttribute('data-sidebar', collapsed ? 'collapsed' : 'expanded');
  }, [collapsed]);

  useEffect(() => {
    // Set initial value on mount
    document.body.setAttribute('data-sidebar', collapsed ? 'collapsed' : 'expanded');
  }, []);
  const profileRef = useRef();

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleDarkToggle = () => setDark((d) => !d);

  const handleLogout = () => {
    clearRecentlyViewed();
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const perm = currentUser ? PERMISSIONS[currentUser.role] : null;
  const avatarColor = nameColor(currentUser?.name || '');

  const navItems = [
    { to: '/', icon: '🏠', label: 'Dashboard', end: true },
    { to: '/students', icon: '👥', label: 'Students' },
    { to: '/stats', icon: '📊', label: 'Stats' },
    permissions?.canViewActivity && { to: '/activity', icon: '🕑', label: 'Activity' },
    permissions?.canManageUsers && { to: '/users', icon: '⚙️', label: 'Users' },
    permissions?.canAddStudent && { to: '/add-student', icon: '➕', label: 'Add Student', highlight: true },
    permissions?.canAddStudent && { to: '/api-import', icon: '🔌', label: 'Import' },
  ].filter(Boolean);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`} role="navigation" aria-label="Main navigation">
      {/* Toggle collapse */}
      <button
        className={styles.collapseBtn}
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '›' : '‹'}
      </button>

      {/* Brand */}
      <div
        className={styles.brand}
        onClick={() => navigate('/')}
        role="link"
        tabIndex={0}
        aria-label="SMS home"
        onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
      >
        <img src={logo} alt="SMS Logo" className={styles.logo} />
        {!collapsed && (
          <div className={styles.brandText}>
            <span className={styles.brandName}>SMS</span>
            <span className={styles.brandSub}>Student Management</span>
          </div>
        )}
      </div>

      <div className={styles.divider} />

      {/* Nav links */}
      <nav className={styles.nav} role="menubar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''} ${item.highlight ? styles.highlight : ''}`
            }
            title={collapsed ? item.label : undefined}
            aria-label={item.label}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      <div className={styles.divider} />

      {/* Dark mode toggle */}
      <button
        className={styles.darkBtn}
        onClick={handleDarkToggle}
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={dark ? 'Light mode' : 'Dark mode'}
      >
        <span className={styles.navIcon}>{dark ? '☀️' : '🌙'}</span>
        {!collapsed && <span className={styles.navLabel}>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
      </button>

      {/* Profile section */}
      {currentUser && (
        <div ref={profileRef} className={styles.profileWrapper}>
          <button
            className={styles.profileBtn}
            onClick={() => setProfileOpen((o) => !o)}
            aria-label="User profile"
            aria-expanded={profileOpen}
            title={collapsed ? currentUser.name : undefined}
          >
            <div
              className={styles.avatar}
              style={{ background: avatarColor + '22', color: avatarColor }}
            >
              {currentUser.avatar || currentUser.name[0]}
            </div>
            {!collapsed && (
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>{currentUser.name}</span>
                <span className={styles.profileRole} style={{ color: perm?.color }}>
                  {perm?.icon} {perm?.badge}
                </span>
              </div>
            )}
            {!collapsed && (
              <span className={styles.chevron} style={{ transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
                ▲
              </span>
            )}
          </button>

          {profileOpen && (
            <div className={styles.profilePopup} role="dialog" aria-label="User profile">
              {/* Header */}
              <div className={styles.popupHeader}>
                <div
                  className={styles.popupAvatar}
                  style={{ background: avatarColor + '22', color: avatarColor }}
                >
                  {currentUser.avatar || currentUser.name[0]}
                </div>
                <div>
                  <p className={styles.popupName}>{currentUser.name}</p>
                  <p className={styles.popupEmail}>{currentUser.email}</p>
                  <span
                    className={styles.popupBadge}
                    style={{ background: perm?.bg, color: perm?.color }}
                  >
                    {perm?.icon} {perm?.label}
                  </span>
                </div>
              </div>

              <div className={styles.popupDivider} />

              {/* Department */}
              {currentUser.department && (
                <div className={styles.popupDetail}>
                  <span>🏢</span>
                  <span>{currentUser.department}</span>
                </div>
              )}

              {/* Permissions */}
              <div className={styles.popupPerms}>
                <p className={styles.popupPermsTitle}>Permissions</p>
                {[
                  ['canAddStudent', '➕ Add students'],
                  ['canEditStudent', '✏️ Edit students'],
                  ['canDeleteStudent', '🗑️ Delete students'],
                  ['canManageUsers', '👥 Manage users'],
                  ['canViewActivity', '📋 View activity'],
                  ['canExportImport', '📤 Export/Import'],
                ].map(([key, label]) => (
                  <div key={key} className={styles.permRow}>
                    <span className={permissions?.[key] ? styles.permYes : styles.permNo}>
                      {permissions?.[key] ? '✅' : '🚫'}
                    </span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className={styles.popupDivider} />

              <button
                className={styles.logoutBtn}
                onClick={handleLogout}
                aria-label="Sign out"
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
