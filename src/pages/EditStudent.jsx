import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import { useToast } from '../context/ToastContext';
import styles from './AddStudent.module.css';

const GRADES = ['Grade 1','Grade 2','Grade 3','Grade 4'];

export default function EditStudent() {
  const { id } = useParams();
  const { getStudent, editStudent } = useStudents();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const student = getStudent(id);

  const [form, setForm]     = useState(student ? { ...student, age: String(student.age) } : null);
  const [errors, setErrors] = useState({});

  if (!student) return (
    <div style={{padding:'2rem',textAlign:'center',color:'var(--text-sub)'}}>
      Student not found. <button onClick={() => navigate('/students')} style={{color:'var(--accent)',background:'none',border:'none',fontWeight:500}}>Go back</button>
    </div>
  );

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                             errs.name  = 'Student name is required.';
    if (!form.age || form.age < 10 || form.age > 26)  errs.age   = 'Enter a valid age (10–26).';
    if (!form.grade)                                   errs.grade = 'Please select a grade.';
    return errs;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    editStudent(Number(id), { ...form, age: Number(form.age) });
    addToast(`✏️ ${form.name} updated successfully!`, 'info');
    navigate(`/student/${id}`);
  };

  return (
    <div className={`${styles.container} page-enter`}>
      <h1 className={styles.title}>Edit Student</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.group}>
          <label className={styles.label}>Student Name</label>
          <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            name="name" type="text" value={form.name} onChange={handleChange} />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Age</label>
            <input className={`${styles.input} ${errors.age ? styles.inputError : ''}`}
              name="age" type="number" min="10" max="26" value={form.age} onChange={handleChange} />
            {errors.age && <p className={styles.error}>{errors.age}</p>}
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Grade</label>
            <select className={`${styles.input} ${errors.grade ? styles.inputError : ''}`}
              name="grade" value={form.grade} onChange={handleChange}>
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
          <label className={styles.label}>Birthday</label>
          <input className={styles.input} name="birthday" type="date"
            value={form.birthday || ''} onChange={handleChange} />
        </div>
        <div className={styles.group}>
          <label className={styles.label}>Notes — supports **bold**, *italic*, - list</label>
          <textarea className={styles.input} name="notes" rows="3"
            value={form.notes} onChange={handleChange} style={{ resize: 'none' }} />
        </div>
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelBtn} onClick={() => navigate(`/student/${id}`)}>Cancel</button>
          <button type="submit" className={styles.submitBtn}>Save Changes</button>
        </div>
      </form>
    </div>
  );
}
