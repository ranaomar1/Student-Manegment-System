import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StudentCard.module.css';

const GRADE_COLORS = {
  'Grade 1': '#e8f5e9:#2e7d32', 'Grade 2': '#e3f2fd:#1565c0',
  'Grade 3': '#fce4ec:#c62828', 'Grade 4': '#fff3e0:#e65100',
  'Grade 5': '#f3e5f5:#6a1b9a', 'Grade 6': '#e0f7fa:#00695c',
};

function gradeBadgeStyle(grade) {
  const val = GRADE_COLORS[grade] || '#f3f4f6:#374151';
  const [bg, color] = val.split(':');
  return { background: bg, color };
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Color avatar based on name hash
function nameAvatarColor(name) {
  const colors = [
    { bg:'#ede9fe', color:'#7c3aed' },
    { bg:'#d1fae5', color:'#065f46' },
    { bg:'#fef3c7', color:'#92400e' },
    { bg:'#fee2e2', color:'#991b1b' },
    { bg:'#e0f2fe', color:'#0369a1' },
    { bg:'#fce7f3', color:'#9d174d' },
  ];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

const GRADE_NUM = { 'Grade 1':1,'Grade 2':2,'Grade 3':3,'Grade 4':4,'Grade 5':5,'Grade 6':6 };

// Check if birthday is within this week
function isBirthdaySoon(birthday) {
  if (!birthday) return false;
  const today = new Date();
  const bday = new Date(birthday);
  const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  const diff = (thisYearBday - today) / (1000*60*60*24);
  return diff >= 0 && diff <= 7;
}

// Highlight text
function Highlight({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{str}</>;
  return (
    <>
      {str.slice(0, idx)}
      <mark style={{ background:'#fef08a', color:'#713f12', borderRadius:'2px', padding:'0 1px' }}>
        {str.slice(idx, idx + query.length)}
      </mark>
      {str.slice(idx + query.length)}
    </>
  );
}

export default function StudentCard({
  student, onDelete, bulkMode, selected, onToggle,
  compareMode, compareSelected, onCompareToggle,
  highlight, isFocused, onFocus
}) {
  const navigate = useNavigate();
  const avatarColors = nameAvatarColor(student.name);
  const gradeProgress = ((GRADE_NUM[student.grade] || 1) / 6) * 100;
  const hasBirthday = isBirthdaySoon(student.birthday);
  const cardRef = useRef();

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }
  }, [isFocused]);

  const isSelectMode = bulkMode || compareMode;
  const isSelected = bulkMode ? selected : compareMode ? compareSelected : false;

  const handleClick = () => {
    if (bulkMode) onToggle(student.id);
    else if (compareMode) onCompareToggle(student.id);
  };

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''} ${isFocused ? styles.cardFocused : ''}`}
      onClick={isSelectMode ? handleClick : undefined}
      style={isSelectMode ? { cursor:'pointer' } : {}}
      onMouseEnter={!isSelectMode ? onFocus : undefined}
    >
      {isSelectMode && (
        <div className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ''}`}>
          {isSelected && '✓'}
        </div>
      )}

      <div className={styles.avatar} style={{ background: avatarColors.bg, color: avatarColors.color }}>
        {initials(student.name)}
      </div>

      <div className={styles.info}>
        <p className={styles.name}>
          <Highlight text={student.name} query={highlight} />
          {hasBirthday && <span style={{ marginLeft:'6px' }} title="Birthday this week!">🎂</span>}
        </p>
        <p className={styles.sub}>Age {student.age}</p>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${gradeProgress}%` }} />
        </div>
      </div>

      <span className={styles.gradeBadge} style={gradeBadgeStyle(student.grade)}>{student.grade}</span>
      <span className={`${styles.badge} ${student.status === 'Active' ? styles.active : styles.inactive}`}>
        {student.status}
      </span>

      {!isSelectMode && (
        <div className={styles.actions}>
          <button className={styles.viewBtn} onClick={() => navigate(`/student/${student.id}`)}>View</button>
          <button className={styles.editBtn} onClick={() => navigate(`/edit-student/${student.id}`)}>Edit</button>
          <button className={styles.deleteBtn} onClick={() => onDelete(student.id, student.name)}>Delete</button>
        </div>
      )}
    </div>
  );
}
