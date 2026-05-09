import React, { useState } from 'react';
import { useStudents } from '../context/StudentContext';
import { useToast }    from '../context/ToastContext';
import { fetchStudents, searchStudentsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

export default function ApiImport() {
  const { addStudent } = useStudents();
  const { addToast }   = useToast();
  const navigate       = useNavigate();
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [query,    setQuery]    = useState('');
  const [imported, setImported] = useState(new Set());
  const [page,     setPage]     = useState(0);

  const load = async (q='', skip=0) => {
    setLoading(true); setError('');
    const { data, error: e } = q ? await searchStudentsApi(q) : await fetchStudents(10, skip);
    setLoading(false);
    if (e) { setError('Could not reach DummyJSON API. Check your connection.'); return; }
    setResults(data || []);
  };

  const handleImport = (student) => {
    addStudent({ name:student.name, age:student.age, grade:student.grade, status:student.status, notes:student.notes, birthday:student.birthday });
    setImported(prev => new Set([...prev, student.id]));
    addToast(`"${student.name}" imported successfully`, 'success');
  };

  const importAll = () => {
    const toImport = results.filter(s => !imported.has(s.id));
    toImport.forEach(s => addStudent({ name:s.name, age:s.age, grade:s.grade, status:s.status, notes:s.notes, birthday:s.birthday }));
    setImported(prev => new Set([...prev, ...toImport.map(s=>s.id)]));
    addToast(`Imported ${toImport.length} students from API`, 'success');
  };

  return (
    <div className={`${styles.container} page-enter`} style={{ maxWidth:'800px' }}>
      <button onClick={() => navigate(-1)} style={{ background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontWeight:600,fontSize:'14px',marginBottom:'16px' }}>← Back</button>
      <h1 className={styles.title}>🔌 API Import</h1>
      <p className={styles.subtitle}>Import real student data from DummyJSON API</p>

      {/* Search */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
          <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)' }}>🔍</span>
          <input
            type="text" placeholder="Search by name…"
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key==='Enter' && load(query)}
            aria-label="Search students from API"
            style={{ width:'100%', padding:'10px 12px 10px 38px', background:'var(--input-bg)', border:'1.5px solid var(--border)', borderRadius:'10px', color:'var(--text)', fontSize:'14px', outline:'none' }}
          />
        </div>
        <button onClick={() => load(query)} disabled={loading}
          style={{ padding:'10px 20px', background:'var(--accent)', color:'#fff', border:'none', borderRadius:'10px', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity: loading ? 0.7:1 }}
          aria-label="Search students"
        >
          {loading ? '⏳ Loading…' : '🔍 Search'}
        </button>
        <button onClick={() => { setQuery(''); load('', page*10); }}
          style={{ padding:'10px 16px', background:'var(--hover)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:'10px', fontWeight:600, fontSize:'14px', cursor:'pointer' }}
          aria-label="Load random students"
        >🎲 Random</button>
      </div>

      {error && (
        <div role="alert" style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:'10px', padding:'12px 16px', color:'#991b1b', fontSize:'14px', marginBottom:'16px' }}>
          ⚠️ {error}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>{results.length} students found · {imported.size} imported</p>
          <button onClick={importAll} style={{ padding:'8px 16px', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:'8px', fontWeight:700, fontSize:'13px', cursor:'pointer' }}
            aria-label={`Import all ${results.filter(s=>!imported.has(s.id)).length} students`}
          >
            ⬇️ Import All ({results.filter(s=>!imported.has(s.id)).length})
          </button>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }} role="list" aria-label="API students">
        {results.map(s => (
          <div key={s.id} role="listitem" style={{
            display:'flex', alignItems:'center', gap:'14px',
            background:'var(--surface)', border:`1px solid ${imported.has(s.id) ? '#10b981' : 'var(--border)'}`,
            borderRadius:'12px', padding:'12px 16px',
            transition:'border-color 0.2s',
          }}>
            {s.avatar ? (
              <img src={s.avatar} alt={`${s.name} avatar`} style={{ width:'40px',height:'40px',borderRadius:'50%',objectFit:'cover',flexShrink:0 }} />
            ) : (
              <div style={{ width:'40px',height:'40px',borderRadius:'50%',background:'var(--hover)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'14px',color:'var(--accent)',flexShrink:0 }}>
                {s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </div>
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:700, color:'var(--text)', fontSize:'14px' }}>{s.name}</p>
              <p style={{ fontSize:'12px', color:'var(--text-muted)' }}>{s.grade} · Age {s.age} · {s.status}</p>
              {s.email && <p style={{ fontSize:'11px', color:'var(--text-muted)' }}>{s.email}</p>}
            </div>
            <button
              onClick={() => !imported.has(s.id) && handleImport(s)}
              disabled={imported.has(s.id)}
              aria-label={imported.has(s.id) ? `${s.name} already imported` : `Import ${s.name}`}
              style={{
                padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor: imported.has(s.id)?'default':'pointer',
                background: imported.has(s.id) ? 'rgba(16,185,129,0.1)' : 'var(--accent)',
                color: imported.has(s.id) ? '#10b981' : '#fff',
                border: imported.has(s.id) ? '1px solid #10b981' : 'none',
                flexShrink:0,
              }}
            >
              {imported.has(s.id) ? '✅ Imported' : '⬇️ Import'}
            </button>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && (
        <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>
          <p style={{ fontSize:'40px', marginBottom:'12px' }}>🔌</p>
          <p style={{ fontWeight:600, marginBottom:'6px' }}>Ready to fetch data</p>
          <p style={{ fontSize:'13px' }}>Click "Random" or search to load students from DummyJSON API</p>
        </div>
      )}

      {/* Pagination for random */}
      {results.length > 0 && !query && (
        <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginTop:'20px' }}>
          <button disabled={page===0} onClick={() => { const p=page-1; setPage(p); load('', p*10); }}
            style={{ padding:'8px 16px',background:'var(--hover)',border:'1px solid var(--border)',borderRadius:'8px',fontWeight:600,cursor:page===0?'default':'pointer',opacity:page===0?0.5:1,color:'var(--text)' }}>
            ‹ Prev
          </button>
          <span style={{ padding:'8px 14px',color:'var(--text-muted)',fontSize:'13px',fontWeight:600 }}>Page {page+1}</span>
          <button onClick={() => { const p=page+1; setPage(p); load('', p*10); }}
            style={{ padding:'8px 16px',background:'var(--hover)',border:'1px solid var(--border)',borderRadius:'8px',fontWeight:600,cursor:'pointer',color:'var(--text)' }}>
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
