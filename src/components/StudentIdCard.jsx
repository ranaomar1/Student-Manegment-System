import React, { useRef } from 'react';

// Avatar color based on name hash
function nameColor(name) {
  const colors = [
    ['#6366f1','#c7d2fe'], ['#10b981','#d1fae5'], ['#f59e0b','#fef3c7'],
    ['#ef4444','#fee2e2'], ['#8b5cf6','#ede9fe'], ['#0ea5e9','#e0f2fe'],
  ];
  let h = 0;
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

function initials(name) {
  return name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Simple QR-like visual (deterministic pixel pattern from id)
function MiniQR({ value }) {
  const size = 7;
  const cells = [];
  let seed = 0;
  for (let c of String(value)) seed = (seed * 31 + c.charCodeAt(0)) & 0xfffffff;
  const rand = () => { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; return (seed & 0xfffffff) / 0xfffffff; };
  for (let r = 0; r < size; r++) {
    for (let col = 0; col < size; col++) {
      // corner squares
      const corner = (r < 2 && col < 2) || (r < 2 && col >= size-2) || (r >= size-2 && col < 2);
      cells.push({ r, c: col, filled: corner ? true : rand() > 0.45 });
    }
  }
  const cell = 20;
  return (
    <svg width={size*cell} height={size*cell} style={{ borderRadius: '4px' }}>
      {cells.map(({ r, c, filled }, i) => filled && (
        <rect key={i} x={c*cell+1} y={r*cell+1} width={cell-2} height={cell-2} rx="2" fill="#1a1a2e" />
      ))}
    </svg>
  );
}

export default function StudentIdCard({ student, onClose }) {
  const cardRef = useRef();
  const [avatarColor, avatarBg] = nameColor(student.name);

  const printCard = () => {
    const win = window.open('', '_blank', 'width=500,height=350');
    win.document.write(`
      <html><head><title>Student ID - ${student.name}</title>
      <style>
        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f4f5fb; font-family: 'Segoe UI', sans-serif; }
        @media print { body { background: white; } }
      </style></head>
      <body>${cardRef.current.outerHTML}<script>window.print();window.close();<\/script></body></html>
    `);
    win.document.close();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000,
      animation: 'fadeIn 0.2s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: '20px',
        padding: '28px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
        animation: 'onboardIn 0.35s cubic-bezier(.34,1.56,.64,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
      }}>
        <h3 style={{ color: 'var(--text)', fontWeight: 800, fontSize: '16px', alignSelf: 'flex-start' }}>🪪 Student ID Card</h3>

        {/* THE CARD */}
        <div ref={cardRef} style={{
          width: '340px', height: '200px',
          borderRadius: '16px', overflow: 'hidden', position: 'relative',
          background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
          fontFamily: "'Segoe UI', sans-serif",
          flexShrink: 0,
        }}>
          {/* Decorative circles */}
          <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background: 'rgba(99,102,241,0.2)' }} />
          <div style={{ position:'absolute', bottom:'-20px', left:'-20px', width:'80px', height:'80px', borderRadius:'50%', background: 'rgba(99,102,241,0.15)' }} />

          {/* Header strip */}
          <div style={{ background: avatarColor, height: '6px', width: '100%' }} />

          <div style={{ padding: '16px 18px', display: 'flex', gap: '16px', alignItems: 'flex-start', height: 'calc(100% - 6px)' }}>
            {/* Left: Avatar + info */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, letterSpacing: '2px', marginBottom: '10px' }}>STUDENT ID CARD</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '50%',
                  background: avatarBg, color: avatarColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: '18px',
                  border: `2px solid ${avatarColor}`,
                  flexShrink: 0,
                }}>{initials(student.name)}</div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 800, fontSize: '15px', marginBottom: '2px' }}>{student.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{student.grade}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[['ID', `#${String(student.id).padStart(4,'0')}`], ['Age', student.age], ['Status', student.status]].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', marginBottom: '2px' }}>{k}</p>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '10px', padding: '4px 8px', background: student.status === 'Active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', borderRadius: '4px', display: 'inline-block' }}>
                <span style={{ color: student.status === 'Active' ? '#6ee7b7' : '#fca5a5', fontSize: '10px', fontWeight: 700 }}>● {student.status.toUpperCase()}</span>
              </div>
            </div>

            {/* Right: QR */}
            <div style={{ flexShrink: 0, background: 'white', borderRadius: '10px', padding: '8px', marginTop: '12px' }}>
              <MiniQR value={`SMS-STUDENT-${student.id}-${student.name}`} />
              <p style={{ textAlign: 'center', fontSize: '8px', color: '#666', marginTop: '4px', fontWeight: 700 }}>SCAN TO VIEW</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={printCard} style={{
            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
            color: '#fff', border: 'none', borderRadius: '10px',
            padding: '10px 22px', fontWeight: 700, cursor: 'pointer', fontSize: '14px',
          }}>🖨 Print / Save PDF</button>
          <button onClick={onClose} style={{
            background: 'var(--hover)', color: 'var(--text)',
            border: '1px solid var(--border)', borderRadius: '10px',
            padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '14px',
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}
