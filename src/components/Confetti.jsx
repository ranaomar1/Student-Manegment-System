import React, { useEffect, useState } from 'react';

const COLORS = ['#6366f1','#10b981','#f59e0b','#f43f5e','#06b6d4','#8b5cf6'];
const SHAPES = ['■','●','▲','★','◆'];

export default function Confetti({ active }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (!active) return;
    const arr = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 2 + Math.random() * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 8 + Math.random() * 12,
    }));
    setPieces(arr);
    const t = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(t);
  }, [active]);

  if (!pieces.length) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none', zIndex: 9998, overflow: 'hidden',
    }}>
      {pieces.map(p => (
        <span key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`,
          top: '-20px',
          color: p.color,
          fontSize: `${p.size}px`,
          animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
        }}>{p.shape}</span>
      ))}
    </div>
  );
}
