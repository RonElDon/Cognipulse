import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// phase: idle -> waiting -> signal -> result | tooEarly
export default function ReactionTest({ mode, onPass }) {
  // mode: 'visual' or 'audio'
  const [phase, setPhase] = useState('idle');
  const [reactionMs, setReactionMs] = useState(null);
  const signalTimeRef = useRef(null);
  const timeoutRef = useRef(null);
  const audioCtxRef = useRef(null);

  const playBoop = useCallback(() => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (_) {}
  }, []);

  const startTest = () => {
    setPhase('waiting');
    setReactionMs(null);
    // pre-warm audio context on user gesture (needed for audio mode)
    if (mode === 'audio') {
      try {
        audioCtxRef.current = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      } catch (_) {}
    }
    const delay = 1200 + Math.random() * 2300; // 1.2s - 3.5s
    timeoutRef.current = setTimeout(() => {
      signalTimeRef.current = performance.now();
      setPhase('signal');
      if (mode === 'audio') playBoop();
    }, delay);
  };

  const handleReact = () => {
    if (phase === 'waiting') {
      // clicked before signal
      clearTimeout(timeoutRef.current);
      setPhase('tooEarly');
      return;
    }
    if (phase === 'signal') {
      const ms = Math.round(performance.now() - signalTimeRef.current);
      setReactionMs(ms);
      setPhase('result');
    }
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const config = {
    visual: {
      idleLabel: 'Klicke, sobald der Kreis grün aufleuchtet.',
      cta: '👁️ Visuellen Test starten',
    },
    audio: {
      idleLabel: 'Klicke, sobald du den Ton hörst.',
      cta: '🔊 Ton-Test starten',
    },
  }[mode];

  return (
    <div className="w-full space-y-4">
      {phase === 'idle' && (
        <>
          <p className="text-white/50 text-sm">{config.idleLabel}</p>
          <button
            onClick={startTest}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            {config.cta}
          </button>
        </>
      )}

      {(phase === 'waiting' || phase === 'signal') && (
        <button
          onClick={handleReact}
          className="w-full flex items-center justify-center py-10 rounded-3xl border-2 border-white/10 bg-white/5 transition-colors"
        >
          <AnimatePresence mode="wait">
            {phase === 'waiting' ? (
              <motion.div
                key="wait"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-24 h-24 rounded-full bg-slate-600/40 border border-white/10" />
                <span className="text-white/40 text-sm font-semibold">
                  {mode === 'audio' ? 'Warte auf den Ton...' : 'Bereit machen...'}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="go"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [1, 1.12, 1], opacity: 1 }}
                transition={{ scale: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } }}
                className="flex flex-col items-center gap-3"
              >
                <div
                  className="w-24 h-24 rounded-full bg-emerald-400"
                  style={{ boxShadow: '0 0 40px 10px rgba(16,185,129,0.6)' }}
                />
                <span className="text-emerald-300 text-base font-black">JETZT KLICKEN!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      )}

      {phase === 'tooEarly' && (
        <div className="space-y-4">
          <div className="py-8 rounded-3xl bg-rose-900/20 border border-rose-500/30">
            <div className="text-4xl mb-2">😅</div>
            <div className="text-rose-300 font-black">Zu früh!</div>
            <div className="text-white/40 text-sm">Warte auf das Signal.</div>
          </div>
          <button
            onClick={startTest}
            className="w-full py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/15 transition-all"
          >
            Nochmal versuchen
          </button>
        </div>
      )}

      {phase === 'result' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="py-8 rounded-3xl bg-emerald-900/20 border border-emerald-500/30">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-emerald-300 font-black text-2xl">{reactionMs} ms</div>
            <div className="text-white/40 text-sm">
              {reactionMs < 300 ? 'Blitzschnell!' : reactionMs < 500 ? 'Sehr gut!' : 'Reaktion erkannt!'}
            </div>
          </div>
          <button
            onClick={() => onPass(reactionMs)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Weiter →
          </button>
        </motion.div>
      )}
    </div>
  );
}