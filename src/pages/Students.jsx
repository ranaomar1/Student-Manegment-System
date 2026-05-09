import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '../context/StudentContext';
import { useToast } from '../context/ToastContext';
import StudentCard from '../components/StudentCard';
import CompareModal from '../components/CompareModal';
import { CardSkeleton } from '../components/LoadingSkeleton';
import styles from './Students.module.css';

const GRADES   = ['All','Grade 1','Grade 2','Grade 3','Grade 4'];
const STATUSES = ['All','Active','Inactive'];
const SORTS    = [
  { label:'Name A–Z', fn:(a,b)=>a.name.localeCompare(b.name) },
  { label:'Name Z–A', fn:(a,b)=>b.name.localeCompare(a.name) },
  { label:'Age ↑',    fn:(a,b)=>a.age-b.age },
  { label:'Age ↓',    fn:(a,b)=>b.age-a.age },
  { label:'Grade',    fn:(a,b)=>a.grade.localeCompare(b.grade) },
];
const PAGE_SIZE = 6;

// Highlight matching text
function Highlight({ text, query }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: '#fef08a', color: '#713f12', borderRadius: '2px', padding: '0 1px' }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function Students() {
  const { students, loading, deleteStudent, deleteMany, selectedIds, toggleSelect, clearSelect, addStudent } = useStudents();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [search,       setSearch]       = useState('');
  const [grade,        setGrade]        = useState('All');
  const [status,       setStatus]       = useState('All');
  const [sortIdx,      setSortIdx]      = useState(0);
  const [page,         setPage]         = useState(1);
  const [bulkMode,     setBulkMode]     = useState(false);
  const [compareMode,  setCompareMode]  = useState(false);
  const [compareIds,   setCompareIds]   = useState([]);
  const [showCompare,  setShowCompare]  = useState(false);
  const [focusedIdx,   setFocusedIdx]   = useState(-1);
  const importRef = useRef();

  // Keyboard navigation
  const filtered = students
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => grade  === 'All' || s.grade  === grade)
    .filter(s => status === 'All' || s.status === status)
    .sort(SORTS[sortIdx].fn);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIdx(i => Math.min(i + 1, paginated.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && focusedIdx >= 0) {
        navigate(`/student/${paginated[focusedIdx].id}`);
      } else if (e.key === 'Escape') {
        setFocusedIdx(-1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paginated, focusedIdx, navigate]);

  const exportCSV = () => {
    const rows = ['ID,Name,Age,Grade,Status',
      ...filtered.map(s => `${s.id},${s.name},${s.age},${s.grade},${s.status}`)
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows], { type:'text/csv' }));
    a.download = 'students.csv'; a.click();
    addToast(`Exported ${filtered.length} students`, 'success');
  };

  const importCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const count = ev.target.result.trim().split('\n').slice(1).filter(Boolean).length;
      addToast(`Imported ${count} students from CSV`, 'info');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    const ids = [...selectedIds];
    const deletedStudents = students.filter(s => ids.includes(s.id));
    deleteMany(ids);
    addToast(`Deleted ${ids.length} students`, 'error', () => {
      deletedStudents.forEach(s => addStudent({ name:s.name, age:s.age, grade:s.grade, status:s.status, notes:s.notes, birthday:s.birthday }));
      addToast('Undo successful ↩', 'success');
    });
    setBulkMode(false);
  };

  const handleDelete = (id, name) => {
    const s = students.find(st => st.id === id);
    deleteStudent(id);
    addToast(`"${name}" deleted`, 'error', () => {
      if (s) {
        addStudent({ name:s.name, age:s.age, grade:s.grade, status:s.status, notes:s.notes, birthday:s.birthday });
        addToast('Undo successful ↩', 'success');
      }
    });
  };

  const resetFilters = () => { setSearch(''); setGrade('All'); setStatus('All'); setSortIdx(0); setPage(1); };
  const hasFilters = search || grade !== 'All' || status !== 'All';

  // Smart filter chips
  const activeFilters = [];
  if (grade !== 'All') activeFilters.push({ label: grade, clear: () => setGrade('All') });
  if (status !== 'All') activeFilters.push({ label: status, clear: () => setStatus('All') });
  if (search) activeFilters.push({ label: `"${search}"`, clear: () => setSearch('') });

  const toggleCompareSelect = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compareStudents = students.filter(s => compareIds.includes(s.id));

  if (loading) {
  return (
    <div className={styles.list}>
      {[...Array(6)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

  return (
    <div className={`${styles.container} page-enter`}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          Students
          <span className={styles.count}>{filtered.length}</span>
        </h1>
        <div className={styles.headerActions}>
          <button className={styles.csvBtn} onClick={() => importRef.current.click()}>⬆ Import</button>
          <input ref={importRef} type="file" accept=".csv" style={{display:'none'}} onChange={importCSV} />
          <button className={styles.csvBtn} onClick={exportCSV}>⬇ Export</button>
          <button
            className={`${styles.csvBtn} ${compareMode ? styles.csvBtnActive : ''}`}
            onClick={() => { setCompareMode(m => !m); setCompareIds([]); }}
          >{compareMode ? '✕ Compare' : '⚖️ Compare'}</button>
          <button
            className={`${styles.csvBtn} ${bulkMode ? styles.csvBtnActive : ''}`}
            onClick={() => { setBulkMode(m => !m); clearSelect(); }}
          >{bulkMode ? '✕ Cancel' : '☑ Bulk'}</button>
          <button className={styles.addBtn} onClick={() => navigate('/add-student')}>+ Add Student</button>
        </div>
      </div>

      {/* Compare bar */}
      {compareMode && (
        <div className={styles.bulkBar} style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
          <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {compareIds.length === 0 && '⚖️ Select 2 students to compare'}
            {compareIds.length === 1 && '⚖️ Select 1 more student'}
            {compareIds.length === 2 && '✅ Ready to compare!'}
          </span>
          {compareIds.length === 2 && (
            <button className={styles.bulkDelete} style={{ background: 'var(--accent)' }} onClick={() => setShowCompare(true)}>Compare Now →</button>
          )}
          <button className={styles.bulkClear} onClick={() => setCompareIds([])}>Clear</button>
        </div>
      )}

      {bulkMode && selectedIds.length > 0 && (
        <div className={styles.bulkBar}>
          <span>{selectedIds.length} selected</span>
          <button className={styles.bulkDelete} onClick={handleBulkDelete}>🗑 Delete Selected</button>
          <button className={styles.bulkClear} onClick={clearSelect}>Clear</button>
        </div>
      )}

      {/* Smart filter chips */}
      {(activeFilters.length > 0 || hasFilters) && (
        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'12px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'13px', color:'var(--text-muted)', fontWeight:600 }}>
            Showing {filtered.length} of {students.length}
          </span>
          {activeFilters.map((f, i) => (
            <span key={i} style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              background:'rgba(99,102,241,0.12)', color:'var(--accent)',
              padding:'4px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:700,
              border: '1px solid rgba(99,102,241,0.25)',
            }}>
              {f.label}
              <button onClick={f.clear} style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:'12px',padding:'0',lineHeight:1 }}>✕</button>
            </span>
          ))}
          {activeFilters.length > 1 && (
            <button onClick={resetFilters} style={{ background:'none',border:'none',color:'var(--text-muted)',fontSize:'12px',cursor:'pointer',fontWeight:600 }}>Clear all</button>
          )}
        </div>
      )}

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.search}
          type="text"
          placeholder="Search by name… (Ctrl+K)"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); setFocusedIdx(-1); }}
        />
        {search && (
          <button className={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      <div className={styles.toolRow}>
        <div className={styles.filters}>
          {GRADES.map(g => (
            <button key={g}
              className={`${styles.chip} ${grade===g ? styles.chipActive : ''}`}
              onClick={() => { setGrade(g); setPage(1); }}
            >{g}</button>
          ))}
        </div>
        <div className={styles.filterRight}>
          {STATUSES.map(st => (
            <button key={st}
              className={`${styles.chip} ${status===st ? styles.chipActive : ''}`}
              onClick={() => { setStatus(st); setPage(1); }}
            >{st}</button>
          ))}
          <select className={styles.sortSelect} value={sortIdx}
            onChange={e => setSortIdx(Number(e.target.value))}>
            {SORTS.map((s,i) => <option key={i} value={i}>{s.label}</option>)}
          </select>
          {hasFilters && (
            <button className={styles.csvBtn} onClick={resetFilters} title="Reset filters">↺ Reset</button>
          )}
        </div>
      </div>

      {/* Keyboard nav hint */}
      {filtered.length > 0 && (
        <p style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'8px' }}>
          💡 Use <kbd style={{background:'var(--hover)',border:'1px solid var(--border)',borderRadius:'4px',padding:'1px 5px',fontSize:'11px'}}>↑↓</kbd> to navigate · <kbd style={{background:'var(--hover)',border:'1px solid var(--border)',borderRadius:'4px',padding:'1px 5px',fontSize:'11px'}}>Enter</kbd> to open · <kbd style={{background:'var(--hover)',border:'1px solid var(--border)',borderRadius:'4px',padding:'1px 5px',fontSize:'11px'}}>Esc</kbd> to deselect
        </p>
      )}
      

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p style={{fontSize:'40px',marginBottom:'12px'}}>🔍</p>
          <p style={{fontWeight:600,marginBottom:'6px'}}>No students match your filters</p>
          <p style={{fontSize:'13px'}}>Try adjusting your search or <button onClick={resetFilters} style={{background:'none',border:'none',color:'var(--accent)',fontWeight:600,cursor:'pointer'}}>reset all filters</button></p>
        </div>
      ) : (
        <>
          <div className={styles.list}>
            {paginated.map((s, idx) => (
              <StudentCard
                key={s.id}
                student={s}
                onDelete={handleDelete}
                bulkMode={bulkMode}
                selected={selectedIds.includes(s.id)}
                onToggle={toggleSelect}
                compareMode={compareMode}
                compareSelected={compareIds.includes(s.id)}
                onCompareToggle={toggleCompareSelect}
                highlight={search}
                isFocused={focusedIdx === idx}
                onFocus={() => setFocusedIdx(idx)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page===1} onClick={() => setPage(p=>p-1)} className={styles.pageBtn}>‹</button>
              {[...Array(totalPages)].map((_,i) => (
                <button key={i}
                  className={`${styles.pageBtn} ${page===i+1 ? styles.pageBtnActive : ''}`}
                  onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} className={styles.pageBtn}>›</button>
            </div>
          )}
        </>
      )}

      {showCompare && compareStudents.length === 2 && (
        <CompareModal students={compareStudents} onClose={() => setShowCompare(false)} />
      )}
    </div>
  );
}
