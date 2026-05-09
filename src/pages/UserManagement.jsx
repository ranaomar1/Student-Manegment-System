import React, { useState } from 'react';
import { useAuth, PERMISSIONS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

const ROLES = ['admin','doctor','engineer'];

function roleStyle(role) {
  const p = PERMISSIONS[role];
  return { background: p.bg, color: p.color };
}

function initials(name) {
  return name.split(' ').slice(0,2).map(w=>w[0].toUpperCase()).join('');
}

function nameColor(name) {
  const colors = [
    {bg:'#ede9fe',color:'#7c3aed'},{bg:'#d1fae5',color:'#065f46'},
    {bg:'#fef3c7',color:'#92400e'},{bg:'#fee2e2',color:'#991b1b'},
    {bg:'#e0f2fe',color:'#0369a1'},{bg:'#fce7f3',color:'#9d174d'},
  ];
  let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))%colors.length;
  return colors[h];
}

export default function UserManagement() {
  const { users, currentUser, updateUserRole } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = (userId, newRole) => {
    if (userId === currentUser.id) {
      addToast("You can't change your own role", 'warning'); return;
    }
    updateUserRole(userId, newRole);
    const user = users.find(u => u.id === userId);
    addToast(`${user?.name}'s role updated to ${newRole}`, 'success');
  };

  return (
    <div className={`${styles.container} page-enter`} style={{ maxWidth:'800px' }}>
      <button onClick={() => navigate(-1)} style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontWeight:600,fontSize:'14px',marginBottom:'16px' }}>
        ← Back
      </button>
      <h1 className={styles.title}>User Management</h1>
      <p className={styles.subtitle}>Manage roles for all registered users</p>

      {/* Role legend */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'24px', flexWrap:'wrap' }}>
        {ROLES.map(r => {
          const p = PERMISSIONS[r];
          return (
            <div key={r} style={{ background:p.bg, border:`1px solid ${p.color}33`, borderRadius:'10px', padding:'10px 14px', display:'flex', gap:'8px', alignItems:'center' }}>
              <span style={{ fontSize:'18px' }}>{p.icon}</span>
              <div>
                <p style={{ fontWeight:700, color:p.color, fontSize:'13px' }}>{p.label}</p>
                <p style={{ fontSize:'11px', color:'var(--text-muted)' }}>
                  {p.canAddStudent ? '✅ Add' : '—'} · {p.canDeleteStudent ? '✅ Delete' : '—'} · {p.canManageUsers ? '✅ Users' : '—'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:'20px' }}>
        <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }}>🔍</span>
        <input
          type="text" placeholder="Search users…"
          value={search} onChange={e => setSearch(e.target.value)}
          aria-label="Search users"
          style={{ width:'100%', padding:'11px 12px 11px 38px', background:'var(--input-bg)', border:'1.5px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none' }}
        />
      </div>

      {/* User list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {filtered.map(user => {
          const av = nameColor(user.name);
          const perm = PERMISSIONS[user.role];
          const isSelf = user.id === currentUser.id;
          return (
            <div key={user.id} style={{
              display:'flex', alignItems:'center', gap:'14px',
              background:'var(--surface)', border:'1px solid var(--border)',
              borderRadius:'14px', padding:'14px 18px',
              animation:'fadeUp 0.15s ease both',
              opacity: isSelf ? 0.85 : 1,
            }}>
              {/* Avatar */}
              <div style={{ width:'44px',height:'44px',borderRadius:'50%',background:av.bg,color:av.color,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:'15px',flexShrink:0 }}>
                {initials(user.name)}
              </div>

              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <p style={{ fontWeight:700, color:'var(--text)', fontSize:'14px' }}>{user.name}</p>
                  {isSelf && <span style={{ fontSize:'11px', background:'var(--hover)', color:'var(--text-muted)', padding:'2px 7px', borderRadius:'6px', fontWeight:600 }}>You</span>}
                </div>
                <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>{user.email} · {user.department || 'General'}</p>
              </div>

              {/* Role badge */}
              <span style={{ ...roleStyle(user.role), fontSize:'12px', fontWeight:700, padding:'4px 10px', borderRadius:'20px', flexShrink:0 }}>
                {perm.icon} {perm.badge}
              </span>

              {/* Role selector */}
              {!isSelf ? (
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                  aria-label={`Change role for ${user.name}`}
                  style={{ padding:'8px 12px', borderRadius:'8px', border:'1.5px solid var(--border)', background:'var(--input-bg)', color:'var(--text)', fontSize:'13px', fontWeight:600, cursor:'pointer' }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{PERMISSIONS[r].label}</option>)}
                </select>
              ) : (
                <span style={{ fontSize:'12px', color:'var(--text-muted)', fontStyle:'italic' }}>Cannot change own role</span>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize:'12px', color:'var(--text-muted)', textAlign:'center', marginTop:'20px' }}>
        {users.length} total accounts · Role changes take effect immediately
      </p>
    </div>
  );
}
