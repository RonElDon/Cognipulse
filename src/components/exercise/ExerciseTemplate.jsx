import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

/**
 * Universal exercise wrapper.
 * Props:
 *   title        string   — exercise name
 *   description  string   — one-sentence explanation (max ~15 words)
 *   icon         string   — emoji icon
 *   accentColor  string   — hex/css color for highlights
 *   duration     number   — seconds (for display; actual timeout handled by child)
 *   onComplete   fn(result) — called when child signals completion
 *   onExit       fn()     — called when user quits early
 *   children     ReactNode — the actual game component, receives { onComplete, level }
 *
 * Controlled from outside: pass children as render prop or plain JSX child.
 * Usage:
 *   <ExerciseTemplate title="Fokus-Blitz" ... onComplete={save}>
 *     {({ onComplete }) => <MyGame onComplete={onComplete} level={2} />}
 *   </ExerciseTemplate>
 */

const COUNTDOWN_STEPS = [3, 2, 1, 'Los!'];

export default function ExerciseTemplate({
  title,
  description,
  icon = '🧠',
  accentColor = '#8b5cf6',
  onComplete,
  onExit,
  children,
}) {
  const [phase, setPhase] = useState('idle'); // idle | countdown | playing | done
  const [countdownIdx, setCountdownIdx] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  // ── Countdown logic ──────────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdownIdx >= COUNTDOWN_STEPS.length) {
      setPhase('playing');
      return;
    }
    const delay = countdownIdx === COUNTDOWN_STEPS.length - 1 ? 500 : 800;
    timerRef.current = setTimeout(() => setCountdownIdx(i => i + 1), delay);
    return () => clearTimeout(timerRef.current);
  }, [phase, countdownIdx]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && (phase === 'playing' || phase === 'countdown')) {
        handleExit();
      } else if (e.key === 'Enter' && phase === 'idle') {
        handleStart();
      } else if (e.key === 'Enter' && phase === 'done') {
        handleExit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  const handleStart = () => {
    setCountdownIdx(0);
    setPhase('countdown');
  };

  const handleExit = () => {
    setPhase('idle');
    setResult(null);
    onExit?.();
  };

  const handleGameComplete = (gameResult) => {
    setResult(gameResult);
    setPhase('done');
    onComplete?.(gameResult);
  };

  const handleRetry = () => {
    setResult(null);
    setPhase('idle');
  };

  // ── IDLE CARD ─────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: `${accentColor}33` }}
          >
            {icon}
          </div>
          <div>
            <div className="text-white font-black text-base leading-tight">{title}</div>
            <div className="text-white/50 text-xs mt-0.5 leading-snug">{description}</div>
          </div>
        </div>
        <button
          onClick={handleStart}
          className="w-full py-3 rounded-xl text-white font-black text-sm shadow-lg transition-all hover:opacity-90 active:scale-95"
          style={{ background: accentColor }}
        >
          {result ? '🔁 Wiederholen' : 'Beginnen →'}
        </button>
        {result && (
          <div className="text-center text-white/40 text-xs font-semibold">
            Letztes Ergebnis: {result.score}%
          </div>
        )}
      </div>
    );
  }

  // ── FULLSCREEN OVERLAY (countdown / playing / done) ───────
  const currentStep = COUNTDOWN_STEPS[countdownIdx];
  const isNumber = typeof currentStep === 'number';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 flex-shrink-0">
        <button
          onClick={handleExit}
          className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {title}
        </button>
        {phase === 'playing' && (
          <div className="text-white/30 text-xs font-mono">ESC = Beenden</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 overflow-auto">
        <AnimatePresence mode="wait">

          {/* COUNTDOWN */}
          {phase === 'countdown' && (
            <motion.div
              key={`cd-${countdownIdx}`}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="text-center select-none"
            >
              <div
                className="font-black leading-none"
                style={{
                  fontSize: isNumber ? '7rem' : '4rem',
                  color: isNumber ? accentColor : '#10b981',
                }}
              >
                {currentStep}
              </div>
              {!isNumber && (
                <div className="text-white/40 text-sm font-bold mt-3">Viel Erfolg!</div>
              )}
            </motion.div>
          )}

          {/* PLAYING */}
          {phase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100"
            >
              {typeof children === 'function'
                ? children({ onComplete: handleGameComplete })
                : children}
            </motion.div>
          )}

          {/* DONE */}
          {phase === 'done' && result && (
            <motion.div
              key="done"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm text-center space-y-5"
            >
              <div className="text-6xl">
                {result.score >= 80 ? '🏆' : result.score >= 60 ? '🌟' : result.score >= 40 ? '👍' : '💪'}
              </div>
              <div>
                <div className="text-5xl font-black" style={{ color: accentColor }}>{result.score}%</div>
                <div className="text-white/50 text-sm mt-1">
                  {result.score >= 80 ? 'Ausgezeichnet!' : result.score >= 60 ? 'Gute Arbeit!' : result.score >= 40 ? 'Weiter so!' : 'Übung macht den Meister!'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Genauigkeit', value: `${result.accuracy ?? result.score}%`, icon: '✅' },
                  { label: 'Score', value: `${result.score}%`, icon: '🎯' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-3">
                    <div className="text-xl">{s.icon}</div>
                    <div className="font-black text-white text-base">{s.value}</div>
                    <div className="text-xs text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 rounded-2xl border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                >
                  🔁 Nochmal
                </button>
                <button
                  onClick={handleExit}
                  className="flex-1 py-3 rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:opacity-90"
                  style={{ background: accentColor }}
                >
                  Fertig ✓
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}