import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { EXERCISES, DOMAINS } from '@/lib/exercises';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import NeuroMascot from '@/components/mascot/NeuroMascot';
import GAME_MAP from '@/components/games/GameMap';
import { useKeyboard } from '@/lib/useKeyboard';



export default function Exercise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = EXERCISES.find(e => e.id === id);
  const [phase, setPhase] = useState('intro'); // intro, ready, countdown, playing, trial, result
  const [countdown, setCountdown] = useState(3);
  const [isTrial, setIsTrial] = useState(false);
  const [result, setResult] = useState(null);
  const [lastNeuroResult, setLastNeuroResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [level, setLevel] = useState(exercise?.difficulty || 1);
  const containerRef = useRef(null);

  // Countdown logic
  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) {
      const t = setTimeout(() => setPhase(isTrial ? 'trial' : 'playing'), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown, isTrial]);

  const goFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const startReady = (trial = false) => {
    goFullscreen();
    setIsTrial(trial);
    setPhase('ready');
  };

  const startCountdown = () => {
    setCountdown(3);
    setPhase('countdown');
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  useKeyboard({
    'Enter': () => {
      if (phase === 'intro') startReady(false);
      else if (phase === 'ready') startCountdown();
      else if (phase === 'result') { exitFullscreen(); setPhase('intro'); setResult(null); }
    },
    '1': () => phase === 'intro' && setLevel(1),
    '2': () => phase === 'intro' && setLevel(2),
    '3': () => phase === 'intro' && setLevel(3),
  }, [phase]);

  if (!exercise) return <div className="p-8 text-center text-slate-500">Übung nicht gefunden</div>;

  const domain = DOMAINS[exercise.domain];
  const GameComponent = GAME_MAP[id];

  const handleTrialComplete = () => {
    // After trial: go back to ready screen
    setPhase('ready');
  };

  const handleComplete = async (gameResult) => {
    if (isTrial) { handleTrialComplete(); return; }
    setResult(gameResult);
    setPhase('result');
    setLastNeuroResult({ ...gameResult, exercise_name: exercise.name, domain: exercise.domain });
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ExerciseResult.create({
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        domain: exercise.domain,
        score: gameResult.score,
        accuracy: gameResult.accuracy,
        reaction_time_ms: gameResult.reaction_time_ms,
        level,
        xp_earned: Math.round(exercise.xpReward * (gameResult.score / 100)),
        duration_seconds: 30,
        completed: true,
      });
      // Update profile XP
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        const p = profiles[0];
        await base44.entities.UserProfile.update(p.id, {
          total_xp: (p.total_xp || 0) + Math.round(exercise.xpReward * (gameResult.score / 100)),
        });
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const isFullscreenPhase = ['ready', 'countdown', 'playing', 'trial'].includes(phase);

  return (
    <div ref={containerRef} className={`min-h-screen ${isFullscreenPhase ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'pb-24 md:pb-8'}`}>
      {/* Header — hidden during fullscreen phases */}
      <div className={`${domain.gradient} px-4 pt-6 pb-8 ${isFullscreenPhase ? 'hidden' : ''}`}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => { exitFullscreen(); navigate('/train'); }} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
              {exercise.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{exercise.name}</h1>
              <p className="text-white/80 text-sm">{exercise.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/90 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{domain.name}</span>
                <span className="text-white/90 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">+{exercise.xpReward} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={isFullscreenPhase ? 'flex flex-col items-center justify-center min-h-screen px-4 py-6' : 'max-w-lg mx-auto px-4 -mt-4'}>
        <div className={isFullscreenPhase ? 'w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-slate-100' : 'bg-white rounded-3xl shadow-xl p-5 border border-slate-100'}>
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4 space-y-5">
                <div className="text-6xl">{exercise.icon}</div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{exercise.name}</h2>
                  <p className="text-slate-500 mt-2">{exercise.description}</p>
                </div>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3].map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        level === l ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600'
                      }`}
                      style={level === l ? { backgroundColor: domain.color } : {}}
                    >
                      {l === 1 ? '😊 Leicht' : l === 2 ? '😤 Mittel' : '🔥 Schwer'}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => startReady(true)}
                    className="flex-1 py-4 rounded-2xl border-2 font-black text-base transition-all hover:scale-105 active:scale-95 text-slate-600 border-slate-300 hover:border-slate-400"
                  >
                    🧪 Testdurchlauf
                  </button>
                  <button
                    onClick={() => startReady(false)}
                    className={`flex-1 py-4 rounded-2xl text-white font-black text-base shadow-lg transition-transform hover:scale-105 active:scale-95 ${domain.gradient}`}
                  >
                    Übung starten! 🚀
                  </button>
                </div>
                <p className="text-xs text-slate-400 text-center">⌨️ Tasten: 1/2/3 = Schwierigkeitsgrad · Enter = Starten · In Spielen: Ziffern & J/N</p>
              </motion.div>
            )}

            {phase === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-10 space-y-6 text-center"
              >
                <div className="text-7xl">{exercise.icon}</div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">{exercise.name}</h2>
                  {isTrial && <div className="mt-2 inline-block bg-amber-100 text-amber-700 text-sm font-bold px-3 py-1 rounded-full">🧪 Testdurchlauf — kein XP</div>}
                </div>
                <p className="text-slate-500 text-sm max-w-xs">{exercise.description}</p>
                <button
                  onClick={startCountdown}
                  className={`px-10 py-4 rounded-2xl text-white font-black text-xl shadow-xl transition-transform hover:scale-105 active:scale-95 ${domain.gradient}`}
                >
                  Bereit! ✊
                </button>
                <button onClick={() => { exitFullscreen(); setPhase('intro'); }} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  ← Zurück zur Auswahl
                </button>
              </motion.div>
            )}

            {phase === 'countdown' && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 space-y-4"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 0.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="text-9xl font-black"
                    style={{ color: countdown > 0 ? domain.color : '#10b981' }}
                  >
                    {countdown === 0 ? '🚀' : countdown}
                  </motion.div>
                </AnimatePresence>
                <div className="text-slate-500 font-bold text-lg">
                  {countdown === 0 ? 'Los!' : countdown === 1 ? 'Bereit?' : 'Gleich geht\'s los...'}
                </div>
              </motion.div>
            )}

            {(phase === 'playing' || phase === 'trial') && GameComponent && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {phase === 'trial' && (
                  <div className="mb-3 flex items-center justify-between">
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">🧪 Testdurchlauf</span>
                    <button onClick={() => { setPhase('ready'); }} className="text-xs text-slate-400 hover:text-slate-600">Abbrechen</button>
                  </div>
                )}
                <GameComponent onComplete={handleComplete} level={level} />
              </motion.div>
            )}

            {phase === 'result' && result && !isTrial && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-5">
                <div className="text-6xl">
                  {result.score >= 80 ? '🏆' : result.score >= 60 ? '🌟' : result.score >= 40 ? '👍' : '💪'}
                </div>
                <div>
                  <div className="text-4xl font-black" style={{ color: domain.color }}>{result.score}%</div>
                  <div className="text-slate-500 text-sm font-semibold mt-1">
                    {result.score >= 80 ? 'Ausgezeichnet!' : result.score >= 60 ? 'Gute Arbeit!' : result.score >= 40 ? 'Weiter so!' : 'Übung macht den Meister!'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Ergebnis', value: `${result.score}%`, icon: '🎯' },
                    { label: 'Genauigkeit', value: `${result.accuracy}%`, icon: '✅' },
                    { label: 'XP erhalten', value: `+${Math.round(exercise.xpReward * result.score / 100)}`, icon: '⚡' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-2xl p-3">
                      <div className="text-lg">{s.icon}</div>
                      <div className="font-black text-slate-800 text-sm">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                {saving && <div className="text-xs text-slate-400 font-medium">Ergebnisse werden gespeichert...</div>}
                <div className="flex gap-3">
                  <button
                    onClick={() => { exitFullscreen(); setPhase('intro'); setResult(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Nochmal
                  </button>
                  <button
                    onClick={() => { exitFullscreen(); navigate('/train'); }}
                    className={`flex-1 py-3 rounded-2xl text-white font-bold ${domain.gradient} shadow-md`}
                  >
                    Nächste Übung →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <NeuroMascot lastResult={lastNeuroResult} popupsEnabled={true} />
    </div>
  );
}