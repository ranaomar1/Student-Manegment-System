import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import StudentIdCard from '../components/StudentIdCard';
import styles from './StudentDetail.module.css';

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

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

const GRADE_NUM = { 'Grade 1':1,'Grade 2':2,'Grade 3':3,'Grade 4':4,'Grade 5':5,'Grade 6':6 };

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

// Simple markdown renderer: **bold**, *italic*, - list
function RenderMarkdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div style={{ lineHeight: 1.7, fontSize: '14px', color: 'var(--text-sub)' }}>
      {lines.map((line, i) => {
        if (line.startsWith('- ')) {
          return (
            <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', marginBottom:'2px' }}>
              <span style={{ color:'var(--accent)', fontWeight:700, marginTop:'2px' }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: parseInline(line.slice(2)) }} />
            </div>
          );
        }
        return <p key={i} style={{ marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: parseInline(line) || '&nbsp;' }} />;
      })}
    </div>
  );
}

function parseInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function isBirthdaySoon(birthday) {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  const diff = (thisYearBday - today) / (1000*60*60*24);
  return diff >= 0 && diff <= 7;
}

export default function StudentDetail() {
  const { id } = useParams();
  const { getStudent, deleteStudent, trackView } = useStudents();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const student = getStudent(id);

  useEffect(() => {
    if (student) trackView(student);
  }, [student?.id]);

  if (!student) return (
    <div className={styles.container}>
      <p style={{color:'var(--text-sub)'}}>Student not found.</p>
      <button className={styles.backBtn} onClick={() => navigate('/students')}>← Back</button>
    </div>
  );

  const avatarColors = nameColor(student.name);
  const gradeProgress = ((GRADE_NUM[student.grade] || 1) / 6) * 100;
  const timeline = student.timeline || [];
  const birthdaySoon = isBirthdaySoon(student.birthday);

  return (
    <div className={`${styles.container} page-enter`}>
      <button className={styles.backBtn} onClick={() => navigate('/students')}>← Back to Students</button>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar} style={{ background: avatarColors.bg, color: avatarColors.color }}>
            {initials(student.name)}
          </div>
          <div className={styles.headerInfo}>
            <h2 className={styles.name}>
              {student.name}
              {birthdaySoon && <span style={{ marginLeft:'10px' }} title="Birthday this week!">🎂</span>}
            </h2>
            <p className={styles.sub}>ID #{String(student.id).padStart(4,'0')} · {student.grade}</p>
            {student.birthday && (
              <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>
                🗓 Birthday: {new Date(student.birthday).toLocaleDateString('en-US', { month:'long', day:'numeric' })}
                {birthdaySoon && <span style={{ color:'#f59e0b', marginLeft:'8px', fontWeight:700 }}>This week! 🎉</span>}
              </p>
            )}
          </div>
          <span className={`${styles.badge} ${student.status==='Active' ? styles.active : styles.inactive}`}>
            {student.status}
          </span>
        </div>

        <div className={styles.divider} />

        <div className={styles.detailsGrid}>
          {[['Age', `${student.age} years`], ['Grade', student.grade], ['Status', student.status]].map(([k,v]) => (
            <div key={k} className={styles.detailItem}>
              <p className={styles.detailKey}>{k}</p>
              <p className={styles.detailVal}>{v}</p>
            </div>
          ))}
        </div>

        {/* Grade Progress Bar */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
            <span style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:600 }}>GRADE PROGRESS</span>
            <span style={{ fontSize:'12px', color:'var(--accent)', fontWeight:600 }}>{Math.round(gradeProgress)}%</span>
          </div>
          <div style={{ height:'8px', background:'var(--border)', borderRadius:'4px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${gradeProgress}%`, background:`linear-gradient(90deg, var(--accent), var(--accent-dk))`, borderRadius:'4px', transition:'width 0.8s ease' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
            {['G1','G2','G3','G4','G5','G6'].map((g,i) => (
              <span key={g} style={{ fontSize:'10px', color: i < GRADE_NUM[student.grade] ? 'var(--accent)' : 'var(--text-muted)' }}>{g}</span>
            ))}
          </div>
        </div>

        {/* Notes with Markdown */}
        <div className={styles.divider} />
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
            <p className={styles.detailKey}>Notes</p>
            <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>Supports **bold**, *italic*, - lists</span>
          </div>
          {student.notes
            ? <RenderMarkdown text={student.notes} />
            : <p style={{ color:'var(--text-muted)', fontSize:'13px', fontStyle:'italic' }}>No notes yet.</p>
          }
        </div>

        {/* Timeline */}
        {timeline.length > 0 && <>
          <div className={styles.divider} />
          <p className={styles.detailKey} style={{ marginBottom:'10px' }}>Activity Timeline</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[...timeline].reverse().map((entry, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'8px 12px', background:'var(--hover)', borderRadius:'8px', fontSize:'13px',
              }}>
                <span>{entry.action === 'Added' ? '🟢' : '✏️'}</span>
                <span style={{ fontWeight:600, color:'var(--text)' }}>{entry.action}</span>
                <span style={{ color:'var(--text-muted)', marginLeft:'auto' }}>{formatDate(entry.date)}</span>
              </div>
            ))}
          </div>
        </>}

        <div className={styles.divider} />
        <div className={styles.footer}>
          <button className={styles.editBtn} onClick={() => navigate(`/edit-student/${student.id}`)}>✏️ Edit</button>
          <button className={styles.editBtn}
            onClick={() => setShowIdCard(true)}
            style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)', color:'#fff', border:'none' }}
          >🪪 ID Card</button>
          <button className={styles.editBtn}
            onClick={() => window.print()}
            style={{ background:'var(--hover)', color:'var(--text)', border:'1px solid var(--border)' }}
          >🖨 Print</button>
          <button className={styles.deleteBtn} onClick={() => setShowConfirm(true)}>🗑️ Delete</button>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          name={student.name}
          onConfirm={() => {
            deleteStudent(student.id);
            addToast(`"${student.name}" deleted`, 'error');
            navigate('/students');
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showIdCard && <StudentIdCard student={student} onClose={() => setShowIdCard(false)} />}
    </div>
  );
}
