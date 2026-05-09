import React from 'react';

function nameColor(name) {
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#0ea5e9'];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

function initials(name) {
  return name.split(' ').slice(0,2).map(w=>w[0].toUpperCase()).join('');
}

const GRADE_NUM = { 'Grade 1':1,'Grade 2':2,'Grade 3':3,'Grade 4':4,'Grade 5':5,'Grade 6':6 };

export default function CompareModal({ students, onClose }) {
  const [a, b] = students;

  const fields = [
    { label: 'Age',   va: a.age,   vb: b.age,   compare: true },
    { label: 'Grade', va: GRADE_NUM[a.grade]||0, vb: GRADE_NUM[b.grade]||0, display: [a.grade, b.grade], compare: true },
    { label: 'Status', va: a.status, vb: b.status, compare: false },
  ];

  return (
    <div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)',
      display:'flex',alignItems:'center',justifyContent:'center',zIndex:9000,
      animation:'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:'var(--surface)',borderRadius:'20px',padding:'28px',
        width:'500px',maxWidth:'95vw',
        boxShadow:'0 24px 64px rgba(0,0,0,0.3)',
        animation:'onboardIn 0.35s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
          <h3 style={{ color:'var(--text)', fontWeight:800, fontSize:'18px' }}>⚖️ Compare Students</h3>
          <button onClick={onClose} style={{ background:'none',border:'none',color:'var(--text-muted)',fontSize:'20px',cursor:'pointer' }}>✕</button>
        </div>

        {/* Headers */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 40px 1fr', gap:'12px', marginBottom:'20px' }}>
          {[a, b].map((s, i) => (
            <div key={i} style={{ textAlign:'center', background:'var(--hover)', borderRadius:'12px', padding:'16px 12px' }}>
              <div style={{
                width:'48px',height:'48px',borderRadius:'50%',
                background:nameColor(s.name)+'22',color:nameColor(s.name),
                display:'flex',alignItems:'center',justifyContent:'center',
                fontWeight:900,fontSize:'18px',margin:'0 auto 8px',
              }}>{initials(s.name)}</div>
              <p style={{ fontWeight:700, color:'var(--text)', fontSize:'14px' }}>{s.name}</p>
              <p style={{ color:'var(--text-muted)', fontSize:'12px' }}>ID #{String(s.id).padStart(4,'0')}</p>
            </div>
          ))}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-muted)',fontWeight:700,fontSize:'18px' }}>VS</div>
        </div>

        {/* Fields */}
        {fields.map(f => {
          const aWins = f.compare && typeof f.va === 'number' && f.va > f.vb;
          const bWins = f.compare && typeof f.vb === 'number' && f.vb > f.va;
          const displayA = f.display ? f.display[0] : f.va;
          const displayB = f.display ? f.display[1] : f.vb;
          return (
            <div key={f.label} style={{ display:'grid', gridTemplateColumns:'1fr 60px 1fr', gap:'8px', marginBottom:'10px', alignItems:'center' }}>
              <div style={{
                textAlign:'center', padding:'12px', borderRadius:'10px',
                background: aWins ? 'rgba(16,185,129,0.1)' : 'var(--hover)',
                border: aWins ? '2px solid #10b981' : '2px solid transparent',
                fontWeight:700, color:'var(--text)', fontSize:'15px',
              }}>{displayA}{aWins && ' 🏆'}</div>
              <div style={{ textAlign:'center',color:'var(--text-muted)',fontWeight:700,fontSize:'12px',letterSpacing:'1px' }}>{f.label.toUpperCase()}</div>
              <div style={{
                textAlign:'center', padding:'12px', borderRadius:'10px',
                background: bWins ? 'rgba(16,185,129,0.1)' : 'var(--hover)',
                border: bWins ? '2px solid #10b981' : '2px solid transparent',
                fontWeight:700, color:'var(--text)', fontSize:'15px',
              }}>{displayB}{bWins && ' 🏆'}</div>
            </div>
          );
        })}

        <button onClick={onClose} style={{
          width:'100%',marginTop:'16px',padding:'12px',
          background:'var(--accent)',color:'#fff',border:'none',
          borderRadius:'12px',fontWeight:700,fontSize:'15px',cursor:'pointer',
        }}>Done</button>
      </div>
    </div>
  );
}
