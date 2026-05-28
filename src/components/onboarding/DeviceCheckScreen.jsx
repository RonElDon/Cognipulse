import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Volume2, Monitor, CheckCircle2, Loader2 } from 'lucide-react';

const CHECKS = [
  { id: 'touch', icon: Smartphone, label: 'Touch / Klick-Reaktion', desc: 'Tippe unten auf das Feld' },
  { id: 'audio', icon: Volume2, label: 'Ton', desc: 'Stelle sicher, dass du Töne hören kannst' },
  { id: 'screen', icon: Monitor, label: 'Bildschirmgröße', desc: 'Ideal für das Training' },
];

export default function DeviceCheckScreen({ onDone }) {
  const [step, setStep] = useState(0); // 0=touch, 1=audio, 2=screen, 3=done
  const [results, setResults] = useState({});
  const [tapping, setTapping] = useState(false);
  const audioCtxRef = useRef(null);

  // Screen size check runs automatically
  useEffect(() => {
    if (step === 2) {
      const w = window.innerWidth;
      const ok = w >= 320;
      setTimeout(() => {
        setResults(r => ({ ...r, screen: ok }));
        setStep(3);
      }, 900);
    }
  }, [step]);

  const handleTouchCheck = () => {
    setTapping(true);
    setTimeout(() => {
      setTapping(false);
      setResults(r => ({ ...r, touch: true }));
      setStep(1);
    }, 500);
  };

  const handleAudioCheck = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
    setResults(r => ({ ...r, audio: true }));
    setTimeout(() => setStep(2), 600);
  };

  if (step === 3) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-6xl">✅</div>
          <div>
            <h2 className="text-2xl font-black text-white mb-2">Gerät bereit!</h2>
            <p className="text-white/50 text-sm">Alles sieht gut aus. Du kannst loslegen.</p>
          </div>
          <div className="space-y-2">
            {CHECKS.map(c => (
              <div key={c.id} className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-500/20 rounded-xl px-4 py-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300 text-sm font-semibold">{c.label}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onDone}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Weiter zu Neuro 🧠
          </button>
        </motion.div>
      </div>
    );
  }

  const current = CHECKS[step];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {CHECKS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-purple-400' : i < step ? 'w-4 bg-emerald-500' : 'w-4 bg-white/15'}`} />
          ))}
        </div>

        <div className="text-xs text-white/30 font-semibold uppercase tracking-widest">Geräte-Check {step + 1} / {CHECKS.length}</div>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
          <Icon className="w-10 h-10 text-purple-400" />
        </div>

        <div>
          <h2 className="text-xl font-black text-white mb-1">{current.label}</h2>
          <p className="text-white/50 text-sm">{current.desc}</p>
        </div>

        {step === 0 && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleTouchCheck}
            className={`w-full py-16 rounded-3xl border-2 transition-all text-white font-black text-lg ${
              tapping
                ? 'bg-purple-600 border-purple-400 scale-95'
                : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-purple-400/50'
            }`}
          >
            {tapping ? '✓ Registriert!' : 'Hier tippen / klicken'}
          </motion.button>
        )}

        {step === 1 && (
          <button
            onClick={handleAudioCheck}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            🔊 Testton abspielen
          </button>
        )}

        {step === 2 && (
          <div className="flex items-center justify-center gap-2 text-white/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Prüfe Bildschirm...</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}