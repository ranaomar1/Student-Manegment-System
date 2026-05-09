import React, { useState } from 'react';

const STEPS = [
  {
    emoji: '🎓',
    title: 'Welcome to SMS',
    desc: 'Your all-in-one platform to manage students, track progress, and stay organized.',
    bg: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    emoji: '🔍',
    title: 'Search & Filter Instantly',
    desc: 'Use Ctrl+K from anywhere to search. Filter by grade, status, and sort on the fly.',
    bg: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
  },
  {
    emoji: '🪪',
    title: 'Student ID Cards',
    desc: 'Generate printable ID cards with QR codes from any student profile. Export as PDF.',
    bg: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else {
      setExiting(true);
      setTimeout(onDone, 400);
    }
  };

  const s = STEPS[step];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      animation: exiting ? 'fadeOut 0.4s ease forwards' : 'fadeIn 0.3s ease',
    }}>
      <style>{`
        @keyframes onboardIn { from { opacity:0; transform: scale(0.88) translateY(30px); } to { opacity:1; transform: scale(1) translateY(0); } }
        @keyframes fadeOut { to { opacity: 0; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes stepPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      `}</style>
      <div style={{
        background: 'var(--surface)',
        borderRadius: '24px',
        padding: '0',
        width: '420px',
        maxWidth: '92vw',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
        animation: 'onboardIn 0.5s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Hero */}
        <div style={{
          background: s.bg,
          padding: '48px 32px 40px',
          textAlign: 'center',
          transition: 'background 0.4s ease',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{s.emoji}</div>
          <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 800, marginBottom: '10px', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>{s.title}</h2>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '15px', lineHeight: 1.6 }}>{s.desc}</p>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px 32px 0' }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => setStep(i)} style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === step ? '#6366f1' : 'var(--border)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }} />
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '20px 32px 28px', display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onDone} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: '14px', cursor: 'pointer',
          }}>Skip</button>
          <button onClick={next} style={{
            background: s.bg,
            color: '#fff', border: 'none',
            padding: '12px 28px', borderRadius: '12px',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
            onMouseEnter={e => { e.target.style.transform='scale(1.04)'; e.target.style.boxShadow='0 6px 20px rgba(99,102,241,0.5)'; }}
            onMouseLeave={e => { e.target.style.transform='scale(1)'; e.target.style.boxShadow='0 4px 16px rgba(99,102,241,0.4)'; }}
          >
            {step < STEPS.length - 1 ? 'Next →' : "Let's Go 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
