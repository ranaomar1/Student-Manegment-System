import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './Login.module.css';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png';


const DEPARTMENTS = ['Mathematics', 'Science', 'Arabic', 'English', 'History', 'Geography', 'Administration', 'IT', 'Arts', 'Physical Education', 'Other'];

export default function Signup({ onSwitch }) {
  const { signup, authError, clearError, isLoading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', department: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [fieldErr, setFieldErr]   = useState({});
  const [strength, setStrength]   = useState(0);

  useEffect(() => { clearError(); }, []);

  // Password strength meter
  useEffect(() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8)          score++;
    if (/[A-Z]/.test(p))        score++;
    if (/[0-9]/.test(p))        score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    setStrength(score);
  }, [form.password]);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().split(' ').length < 2)
      e.name = 'Please enter your full name (first & last)';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!form.password || form.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm)
      e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErr(errs); return; }
    setFieldErr({});
    await signup({ name: form.name, email: form.email, password: form.password, department: form.department });
  };

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setFieldErr(p => ({ ...p, [k]: '' }));
  };

  const strengthColors = ['#e5e7eb', '#ef4444', '#f59e0b', '#10b981', '#6366f1'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.panel}>
        <div className={styles.panelInner}>
          <div className={styles.panelLogo}>🎓</div>
          <h1 className={styles.panelTitle}>Join SMS</h1>
          <p className={styles.panelSub}>Create your university account</p>
          <div className={styles.panelFeatures}>
            <div className={styles.roleInfo}>
              <p className={styles.roleInfoTitle}>New accounts start as:</p>
              <div className={styles.roleInfoBadge}>
                <span>👁️</span>
                <div>
                  <p style={{ fontWeight: 700, color: '#f1f2f6' }}>Viewer</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>
                    Can browse students & view stats. An admin can upgrade your role after joining.
                  </p>
                </div>
              </div>
              <div className={styles.roleUpgrade}>
                <div className={styles.upgradeRow}>
                  <span>Doctor — add & edit students</span>
                </div>
                <div className={styles.upgradeRow}>
                  <span>Admin — full system control</span>
                </div>
              </div>
            </div>
          </div>
          <p className={styles.alreadyHave}>
            Already have an account?{' '}
            <button className={styles.switchBtnLight} onClick={onSwitch}>Sign in →</button>
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create Account</h2>
            <p className={styles.formSub}>Join your university's management system</p>
          </div>

          {authError && (
            <div className={styles.errorBanner}>
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.group}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>👤</span>
                <input className={`${styles.input} ${fieldErr.name ? styles.inputErr : ''}`}
                  type="text" placeholder="e.g. Ahmed Hassan"
                  value={form.name} onChange={set('name')} autoComplete="name" />
              </div>
              {fieldErr.name && <p className={styles.err}>{fieldErr.name}</p>}
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Email address</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>✉️</span>
                <input className={`${styles.input} ${fieldErr.email ? styles.inputErr : ''}`}
                  type="email" placeholder="you@university.edu"
                  value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              {fieldErr.email && <p className={styles.err}>{fieldErr.email}</p>}
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Department <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(optional)</span></label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🏫</span>
                <select className={styles.input} value={form.department} onChange={set('department')}
                  style={{ paddingLeft: '40px' }}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔑</span>
                <input className={`${styles.input} ${fieldErr.password ? styles.inputErr : ''}`}
                  type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters"
                  value={form.password} onChange={set('password')} autoComplete="new-password" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v=>!v)}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className={styles.strengthMeter}>
                  {[1,2,3,4].map(i => (
                    <div key={i} className={styles.strengthBar}
                      style={{ background: i <= strength ? strengthColors[strength] : '#e5e7eb' }} />
                  ))}
                  <span style={{ fontSize: '11px', color: strengthColors[strength], fontWeight: 700, marginLeft: '4px' }}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
              {fieldErr.password && <p className={styles.err}>{fieldErr.password}</p>}
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>🔒</span>
                <input className={`${styles.input} ${fieldErr.confirm ? styles.inputErr : ''}`}
                  type={showConf ? 'text' : 'password'} placeholder="Re-enter password"
                  value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConf(v=>!v)}>
                  {showConf ? '🙈' : '👁️'}
                </button>
              </div>
              {form.confirm && !fieldErr.confirm && form.password === form.confirm && (
                <p style={{ fontSize:'12px', color:'#10b981', marginTop:'4px', fontWeight:600 }}>✅ Passwords match</p>
              )}
              {fieldErr.confirm && <p className={styles.err}>{fieldErr.confirm}</p>}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <span className={styles.spinner} /> : 'Create Account 🎉'}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <button className={styles.switchBtn} onClick={onSwitch}>Sign in →</button>
          </p>
        </div>
      </div>
    </div>
  );
}
