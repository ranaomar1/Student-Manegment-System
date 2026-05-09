import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import { useToast } from '../context/ToastContext';
import Confetti from '../components/Confetti';
import styles from './AddStudent.module.css';

const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4'];
const DRAFT_KEY = 'sms_draft_student';

export default function AddStudent() {
  const { addStudent } = useStudents();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [confetti, setConfetti] = useState(false);

  const [form, setForm] = useState(() => {
    try {
      const d = localStorage.getItem(DRAFT_KEY);
      return d ? JSON.parse(d) : { name:'', age:'', grade:'', status:'Active', notes:'', birthday:'' };
    } catch { return { name:'', age:'', grade:'', status:'Active', notes:'' }; }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                              errs.name  = 'Student name is required.';
    if (!form.age || form.age < 10 || form.age > 26)   errs.age   = 'Enter a valid age (10–26).';
    if (!form.grade)                                    errs.grade = 'Please select a grade.';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    addStudent({ ...form, age: Number(form.age) });
    localStorage.removeItem(DRAFT_KEY);
    addToast(`🎉 ${form.name} added successfully!`, 'success');
    setConfetti(true);
    setTimeout(() => navigate('/students'), 1500);
  };

  const hasDraft = form.name || form.age || form.grade || form.notes;

  return (
    <>
      <Confetti active={confetti} />
      <div className={`${styles.container} page-enter`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h1 className={styles.title}>Add New Student</h1>
          {hasDraft && (
            <span style={{
              fontSize: '11px', background: 'rgba(var(--accent-rgb),0.12)',
              color: 'var(--accent)', padding: '3px 8px', borderRadius: '20px', fontWeight: 600
            }}>✏️ Draft saved</span>
          )}
        </div>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.group}>
            <label className={styles.label}>Student Name</label>
            <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              name="name" type="text" placeholder="e.g. Ahmed Hassan"
              value={form.name} onChange={handleChange} />
            {errors.name && <p className={styles.error}>{errors.name}</p>}
          </div>
          <div className={styles.row}>
            <div className={styles.group}>
              <label className={styles.label}>Age</label>
              <input className={`${styles.input} ${errors.age ? styles.inputError : ''}`}
                name="age" type="number" placeholder="e.g. 20" min="10" max="26"
                value={form.age} onChange={handleChange} />
              {errors.age && <p className={styles.error}>{errors.age}</p>}
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Grade</label>
              <select className={`${styles.input} ${errors.grade ? styles.inputError : ''}`}
                name="grade" value={form.grade} onChange={handleChange}>
                <option value="">Select grade</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.grade && <p className={styles.error}>{errors.grade}</p>}
            </div>
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Status</label>
            <div className={styles.radioGroup}>
              {['Active','Inactive'].map(s => (
                <label key={s} className={`${styles.radioLabel} ${form.status===s ? styles.radioActive : ''}`}>
                  <input type="radio" name="status" value={s} checked={form.status===s} onChange={handleChange} style={{display:'none'}} />
                  {s === 'Active' ? '✅' : '⏸️'} {s}
                </label>
              ))}
            </div>
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Birthday (optional)</label>
            <input className={styles.input} name="birthday" type="date"
              value={form.birthday || ''} onChange={handleChange} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Notes (optional) — supports **bold**, *italic*, - list</label>
            <textarea className={styles.input} name="notes" rows="3"
              placeholder="Any notes about this student..."
              value={form.notes} onChange={handleChange}
              style={{ resize: 'none' }} />
          </div>
          <div className={styles.buttons}>
            <button type="button" className={styles.cancelBtn} onClick={() => navigate('/students')}>Cancel</button>
            {hasDraft && (
              <button type="button" className={styles.cancelBtn}
                onClick={() => { localStorage.removeItem(DRAFT_KEY); setForm({ name:'', age:'', grade:'', status:'Active', notes:'' }); }}>
                Clear Draft
              </button>
            )}
            <button type="submit" className={styles.submitBtn}>Add Student 🎉</button>
          </div>
        </form>
      </div>
    </>
  );
}
