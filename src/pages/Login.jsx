import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PERMISSIONS } from '../context/AuthContext';
import styles from './Login.module.css';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';


const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    email: 'admin@university.edu',
    password: 'Admin@123',
    name: 'Dr. Amal Samir'
  },

  {
    role: 'doctor',
    email: 'doctor@university.edu',
    password: 'Doctor@123',
    name: 'Dr. Khaled Nour'
  },

  {
    role: 'engineer',
    email: 'engineer@university.edu',
    password: 'Engineer@123',
    name: 'Eng. Rania Hassan'
  },

];

export default function Login({ onSwitch }) {
  const { login, authError, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  useEffect(() => { clearError(); }, []);

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    if (!password.trim()) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErr(errs); return; }
    setFieldErr({});
    await login(email, password);
  };

  const fillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setFieldErr({});
    clearError();
  };

  return (
    <div className={styles.page}>
      {/* Left decorative panel */}
      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <div className={styles.panelLogo}>🎓</div>
          <h1 className={styles.panelTitle}>SMS</h1>
          <p className={styles.panelSub}>Student Management System</p>
          <div className={styles.panelFeatures}>
            {['Manage students & grades', 'Role-based access control', 'Activity logs & analytics', 'Printable ID cards'].map((f, i) => (
              <div key={i} className={styles.featureRow}>
                <span className={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className={styles.demoSection}>
            <p className={styles.demoTitle}>Demo Accounts</p>
            {DEMO_ACCOUNTS.map(acc => {
              const perm = PERMISSIONS[acc.role];
              return (
                <button key={acc.role} className={styles.demoCard} onClick={() => fillDemo(acc)}>
                  <span className={styles.demoIcon}>{perm.icon}</span>
                  <div className={styles.demoInfo}>
                    <span className={styles.demoName}>{acc.name}</span>
                    <span className={styles.demoEmail}>{acc.email}</span>
                  </div>
                  <span className={styles.demoBadge} style={{ background: perm.bg, color: perm.color }}>{perm.badge}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome To Our System</h2>
            <p className={styles.formSub}>Sign in to your university account</p>
          </div>

          {authError && (
            <div className={styles.errorBanner}>
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.group}>
              <label className={styles.label}>Email address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉️</span>
                <input
                  className={`${styles.input} ${fieldErr.email ? styles.inputErr : ''}`}
                  type="email" placeholder="you@university.edu"
                  value={email} onChange={e => { setEmail(e.target.value); setFieldErr(p => ({ ...p, email: '' })); }}
                  autoComplete="email"
                />
              </div>
              {fieldErr.email && <p className={styles.err}>{fieldErr.email}</p>}
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔑</span>
                <input
                  className={`${styles.input} ${fieldErr.password ? styles.inputErr : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => { setPassword(e.target.value); setFieldErr(p => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErr.password && <p className={styles.err}>{fieldErr.password}</p>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <span className={styles.spinner} /> : 'Sign In'}
            </button>
          </form>

          <p className={styles.switchText}>
            Don't have an account?{' '}
            <button className={styles.switchBtn} onClick={onSwitch}>Create account →</button>
          </p>
        </div>
      </div>
    </div>
  );
}
