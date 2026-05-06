import { useState, useEffect, useRef, useCallback } from 'react';

// att_1: Spotlight Focus
export function SpotlightFocus({ onComplete, level }) {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const reactions = useRef([]);

  const spawnTarget = useCallback(() => {
    const id = Date.now() + Math.random();
    const x = 5 + Math.random() * 85;
    const y = 5 + Math.random() * 85;
    setTargets(t => [...t, { id, x, y, spawnTime: Date.now() }]);
    setTimeout(() => {
      setTargets(t => { if (t.find(tt => tt.id === id)) setMissed(m => m + 1); return t.filter(tt => tt.id !== id); });
    }, Math.max(1800 - level * 250, 700));
  }, [level]);

  useEffect(() => {
    const si = setInterval(spawnTarget, Math.max(1100 - level * 120, 500));
    const ti = setInterval(() => setTimeLeft(t => {
      if (t <= 1) {
        clearInterval(si); clearInterval(ti);
        setTimeout(() => {
          const total = score + missed;
          const acc = total > 0 ? Math.round((score / total) * 100) : 0;
          const avgRT = reactions.current.length > 0 ? Math.round(reactions.current.reduce((a, b) => a + b) / reactions.current.length) : 800;
          onComplete({ score: acc, accuracy: acc, reaction_time_ms: avgRT });
        }, 300);
        return 0;
      }
      return t - 1;
    }), 1000);
    return () => { clearInterval(si); clearInterval(ti); };
  }, [spawnTarget, score, missed]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold text-slate-600">
        <span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span><span className="text-red-400">✗ {missed}</span>
      </div>
      <div className="relative bg-slate-100 rounded-2xl overflow-hidden" style={{ height: 340 }}>
        <p className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-semibold">Tippe alle 🎯!</p>
        {targets.map(t => (
          <button key={t.id} onClick={() => { reactions.current.push(Date.now() - t.spawnTime); setScore(s => s + 1); setTargets(tt => tt.filter(x => x.id !== t.id)); }}
            className="absolute w-14 h-14 rounded-full bg-amber-400 border-4 border-amber-500 shadow-lg pop-in flex items-center justify-center text-xl hover:scale-110 transition-transform"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-50%)' }}>🎯</button>
        ))}
      </div>
    </div>
  );
}

// att_2: Number Hunt
export function NumberHunt({ onComplete, level }) {
  const gridN = 4 + level;
  const [target] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [grid] = useState(() => Array.from({ length: gridN * gridN }, () => Math.floor(Math.random() * 9) + 1));
  const [found, setFound] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const targetCount = grid.filter(n => n === target).length;

  useEffect(() => {
    const ti = setInterval(() => setTimeLeft(t => {
      if (t <= 1) {
        clearInterval(ti);
        const acc = Math.round((found.length / Math.max(targetCount, 1)) * 100);
        setTimeout(() => onComplete({ score: Math.min(acc, 100), accuracy: acc, reaction_time_ms: 500 }), 300);
        return 0;
      }
      return t - 1;
    }), 1000);
    return () => clearInterval(ti);
  }, [found, targetCount]);

  const handleClick = (idx) => {
    if (found.includes(idx)) return;
    if (grid[idx] === target) {
      const newFound = [...found, idx];
      setFound(newFound);
      if (newFound.length === targetCount) {
        const elapsed = 30 - timeLeft;
        const score = Math.max(0, Math.round(100 - elapsed * 1.5));
        onComplete({ score, accuracy: 100, reaction_time_ms: elapsed * 1000 / targetCount });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold text-slate-600">
        <span>Suche: <span className="text-2xl font-black text-indigo-600">{target}</span></span>
        <span>⏱ {timeLeft}s</span>
        <span className="text-green-600">{found.length}/{targetCount}</span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridN}, 1fr)` }}>
        {grid.map((n, i) => (
          <button key={i} onClick={() => handleClick(i)}
            className={`aspect-square rounded-lg text-sm font-black transition-all ${found.includes(i) ? 'bg-green-400 text-white scale-90' : 'bg-white border-2 border-slate-200 text-slate-800 hover:bg-indigo-50'}`}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// att_3: Color Switch
export function ColorSwitch({ onComplete, level }) {
  const colors = ['🔴', '🔵', '🟡', '🟢', '🟠', '🟣'];
  const [target, setTarget] = useState(() => colors[Math.floor(Math.random() * 4)]);
  const [current, setCurrent] = useState(() => colors[Math.floor(Math.random() * 6)]);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const total = useRef(0);

  useEffect(() => {
    const ti = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(ti); const acc = total.current > 0 ? Math.round((score / total.current) * 100) : 0; setTimeout(() => onComplete({ score: Math.max(0, acc - errors * 5), accuracy: acc, reaction_time_ms: 400 }), 300); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(ti);
  }, [score, errors]);

  const next = () => setCurrent(colors[Math.floor(Math.random() * 6)]);
  const handleYes = () => { total.current++; if (current === target) setScore(s => s + 1); else setErrors(e => e + 1); if ((score + 1) % (3 + level) === 0) setTarget(colors[Math.floor(Math.random() * 4)]); next(); };
  const handleNo = () => { total.current++; if (current !== target) setScore(s => s + 1); else setErrors(e => e + 1); next(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600">
        <span>Ziel: <span className="text-2xl">{target}</span></span><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span>
      </div>
      <div className="bg-slate-50 rounded-2xl p-8 text-center"><div className="text-8xl mb-2">{current}</div><p className="text-sm text-slate-400">Passt das zum Ziel?</p></div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleYes} className="py-4 rounded-2xl bg-green-500 text-white font-black text-lg hover:bg-green-600 active:scale-95">✅ JA</button>
        <button onClick={handleNo} className="py-4 rounded-2xl bg-red-400 text-white font-black text-lg hover:bg-red-500 active:scale-95">❌ NEIN</button>
      </div>
    </div>
  );
}

// att_4: Sustained Watch
export function SustainedWatch({ onComplete, level }) {
  const [current, setCurrent] = useState('🟦');
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const targetRef = useRef(false);
  const total = useRef(0);

  useEffect(() => {
    const showNext = () => {
      const isRare = Math.random() < 0.2;
      targetRef.current = isRare;
      setCurrent(isRare ? '🟥' : '🟦');
      if (isRare) total.current++;
    };
    const si = setInterval(showNext, Math.max(1200 - level * 150, 600));
    const ti = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(si); clearInterval(ti); const acc = total.current > 0 ? Math.round((hits / total.current) * 100) : 0; setTimeout(() => onComplete({ score: Math.max(0, acc - misses * 8), accuracy: acc, reaction_time_ms: 500 }), 300); return 0; }
      return t - 1;
    }), 1000);
    return () => { clearInterval(si); clearInterval(ti); };
  }, [hits, misses, level]);

  const handleTap = () => { if (targetRef.current) setHits(h => h + 1); else setMisses(m => m + 1); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">Treffer: {hits}</span><span className="text-red-400">Fehler: {misses}</span></div>
      <p className="text-center text-sm font-bold text-slate-500">Tippe NUR bei 🟥!</p>
      <button onClick={handleTap} className="w-full h-56 rounded-3xl flex items-center justify-center text-9xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all">{current}</button>
    </div>
  );
}

// att_5: Divided Attention
export function DividedAttention({ onComplete, level }) {
  const count = 2 + level;
  const [targets, setTargets] = useState(() =>
    Array.from({ length: count }, (_, i) => ({ id: i, x: 20 + (i * 60 / count), y: 50, dx: (Math.random() - 0.5) * 2, dy: (Math.random() - 0.5) * 2 }))
  );
  const [clicked, setClicked] = useState(new Set());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const roundRef = useRef(1);

  useEffect(() => {
    const move = setInterval(() => setTargets(ts => ts.map(t => {
      let nx = t.x + t.dx * 1.5; let ny = t.y + t.dy * 1.5;
      return { ...t, x: Math.max(5, Math.min(90, nx)), y: Math.max(5, Math.min(90, ny)), dx: (nx < 5 || nx > 90) ? -t.dx : t.dx, dy: (ny < 5 || ny > 90) ? -t.dy : t.dy };
    })), 50);
    const ti = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(move); clearInterval(ti); const acc = Math.round((score / (roundRef.current * count)) * 100); setTimeout(() => onComplete({ score: Math.min(100, acc), accuracy: acc, reaction_time_ms: 400 }), 300); return 0; }
      return t - 1;
    }), 1000);
    return () => { clearInterval(move); clearInterval(ti); };
  }, [score, count]);

  const handleClick = (id) => {
    const newC = new Set(clicked); newC.add(id); setClicked(newC);
    if (newC.size === count) { setScore(s => s + 1); roundRef.current++; setClicked(new Set()); }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span>Tippe alle {count} Punkte!</span><span className="text-green-600">✓ {score}</span></div>
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden" style={{ height: 340 }}>
        {targets.map(t => (
          <button key={t.id} onClick={() => handleClick(t.id)}
            className={`absolute w-10 h-10 rounded-full border-4 transition-all ${clicked.has(t.id) ? 'bg-green-400 border-green-500 scale-125' : 'bg-cyan-400 border-cyan-300 hover:scale-110'}`}
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-50%)' }} />
        ))}
      </div>
    </div>
  );
}

// att_6: Distractor Shield
export function DistractorShield({ onComplete, level }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState(0);
  const [grid, setGrid] = useState(() => generateGrid(level));

  function generateGrid(lvl) {
    const size = 9 + lvl * 4;
    const ti = Math.floor(Math.random() * size);
    return Array.from({ length: size }, (_, i) => ({ id: i, isTarget: i === ti }));
  }

  useEffect(() => {
    const ti = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(ti); const acc = score + errors > 0 ? Math.round(score / (score + errors) * 100) : 0; setTimeout(() => onComplete({ score: acc, accuracy: acc, reaction_time_ms: 400 }), 300); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(ti);
  }, [score, errors]);

  const handleClick = (isTarget) => {
    if (isTarget) setScore(s => s + 1); else setErrors(e => e + 1);
    setGrid(generateGrid(level));
  };

  const cols = 3 + level;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>Finde 🔷!</span><span>⏱ {timeLeft}s</span><span className="text-green-600">✓ {score}</span></div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {grid.map(cell => (
          <button key={cell.id} onClick={() => handleClick(cell.isTarget)}
            className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center text-xl hover:bg-slate-200 active:scale-90 transition-all">
            {cell.isTarget ? '🔷' : '⭐'}
          </button>
        ))}
      </div>
    </div>
  );
}

// att_7: Flash Detect
export function FlashDetect({ onComplete, level }) {
  const [phase, setPhase] = useState('waiting');
  const [results, setResults] = useState([]);
  const [round, setRound] = useState(0);
  const total = 6;
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const nextRound = useCallback(() => {
    setPhase('waiting');
    const delay = 1200 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setPhase('flash'); startRef.current = Date.now();
      timerRef.current = setTimeout(() => setPhase('missed'), Math.max(600 - level * 50, 250));
    }, delay);
  }, [level]);

  useEffect(() => { nextRound(); return () => clearTimeout(timerRef.current); }, []);

  const handleTap = () => {
    if (phase === 'flash') {
      const rt = Date.now() - startRef.current;
      clearTimeout(timerRef.current);
      const newR = [...results, rt];
      setResults(newR);
      const nr = round + 1; setRound(nr);
      if (nr >= total) { const avg = Math.round(newR.reduce((a, b) => a + b) / newR.length); setTimeout(() => onComplete({ score: Math.min(100, Math.max(0, Math.round(100 - (avg - 150) / 4))), accuracy: 100, reaction_time_ms: avg }), 500); }
      else { setPhase('hit'); setTimeout(nextRound, 700); }
    } else if (phase === 'waiting') {
      clearTimeout(timerRef.current); setPhase('tooEarly');
      const nr = round + 1; setRound(nr);
      if (nr >= total) setTimeout(() => onComplete({ score: 20, accuracy: 50, reaction_time_ms: 999 }), 500);
      else setTimeout(nextRound, 1000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm font-bold"><span className="text-slate-600">Runde {Math.min(round + 1, total)}/{total}</span></div>
      <button onClick={handleTap} className={`w-full rounded-3xl h-64 flex flex-col items-center justify-center gap-3 transition-all duration-100 active:scale-95 ${phase === 'flash' ? 'bg-yellow-300 shadow-2xl' : phase === 'tooEarly' ? 'bg-red-200' : phase === 'hit' ? 'bg-green-200' : phase === 'missed' ? 'bg-slate-300' : 'bg-slate-200'}`}>
        <div className="text-5xl">{phase === 'flash' ? '⚡' : phase === 'hit' ? '✅' : phase === 'tooEarly' ? '❌' : phase === 'missed' ? '😅' : '👁️'}</div>
        <div className="font-black text-slate-700">{phase === 'flash' ? 'JETZT!' : phase === 'hit' ? 'Gut!' : phase === 'tooEarly' ? 'Zu früh!' : phase === 'missed' ? 'Verpasst!' : 'Warte auf Blitz...'}</div>
      </button>
    </div>
  );
}

// att_8: Focus Marathon
export function FocusMarathon({ onComplete, level }) {
  const [streak, setStreak] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [current, setCurrent] = useState({ shape: '🔵', isTarget: true });

  const generate = () => {
    const shapes = ['🔵', '🔴', '🟢', '🟡', '🟣', '🟠'];
    const isTarget = Math.random() > 0.35;
    setCurrent({ shape: isTarget ? '🔵' : shapes[Math.floor(Math.random() * 5) + 1], isTarget });
  };

  useEffect(() => {
    const ti = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(ti); const score = streak + errors > 0 ? Math.max(0, Math.round((streak / (streak + errors)) * 100)) : 0; setTimeout(() => onComplete({ score, accuracy: score, reaction_time_ms: 300 }), 300); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(ti);
  }, [streak, errors]);

  const handleYes = () => { if (current.isTarget) setStreak(s => s + 1); else setErrors(e => e + 1); generate(); };
  const handleNo = () => { if (!current.isTarget) setStreak(s => s + 1); else setErrors(e => e + 1); generate(); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600"><span>⏱ {timeLeft}s</span><span className="text-green-600">Serie: {streak}</span><span className="text-red-400">Fehler: {errors}</span></div>
      <p className="text-center text-sm text-slate-500 font-bold">Ist es 🔵?</p>
      <div className="bg-slate-50 rounded-2xl p-10 text-center text-9xl">{current.shape}</div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={handleYes} className="py-4 rounded-2xl bg-green-500 text-white font-black text-lg active:scale-95">✅ JA</button>
        <button onClick={handleNo} className="py-4 rounded-2xl bg-red-400 text-white font-black text-lg active:scale-95">❌ NEIN</button>
      </div>
    </div>
  );
}