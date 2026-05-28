import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GAME_MAP from '@/components/games/GameMap';
import { base44 } from '@/api/base44Client';
import PostAssessmentNeuro from '@/components/onboarding/PostAssessmentNeuro';
import ExerciseTemplate from '@/components/exercise/ExerciseTemplate';
import PreBaselineContext from '@/components/onboarding/PreBaselineContext';

const BASELINE_POOL = {
  attention:  [
    { id: 'att_2', nameExercise: 'Zahlenjagd',        desc: 'Finde schnell die gesuchten Zahlen im Gitter.' },
    { id: 'att_3', nameExercise: 'Farbenwechsel',      desc: 'Reagiere auf wechselnde Farben so schnell wie möglich.' },
    { id: 'att_6', nameExercise: 'Ablenkungsschutz',   desc: 'Fokussiere dich trotz ablenkender Reize.' },
    { id: 'att_7', nameExercise: 'Blitz-Erkennung',    desc: 'Erkenne kurz aufblitzende Symbole auf dem Bildschirm.' },
  ],
  memory: [
    { id: 'mem_2', nameExercise: 'Sequenz-Erinnerung', desc: 'Merke dir die Reihenfolge der gezeigten Elemente.' },
    { id: 'mem_3', nameExercise: 'Wortliste',           desc: 'Präge dir eine kurze Wortliste ein und erinnere sie.' },
    { id: 'mem_5', nameExercise: 'Positionsgedächtnis', desc: 'Behalte im Kopf, wo Objekte auf dem Feld waren.' },
    { id: 'mem_7', nameExercise: 'Geschichten-Erinnerung', desc: 'Lies eine kurze Geschichte und beantworte Fragen dazu.' },
  ],
  executive: [
    { id: 'exe_1', nameExercise: 'Aufgabenwechsel',    desc: 'Wechsle schnell zwischen zwei verschiedenen Regeln.' },
    { id: 'exe_2', nameExercise: 'Stoppsignal',        desc: 'Stoppe deine Reaktion wenn ein Signal erscheint.' },
    { id: 'exe_4', nameExercise: 'Stroop-Herausforderung', desc: 'Nenne die Farbe, ignoriere das geschriebene Wort.' },
  ],
  visuomotor: [
    { id: 'vis_3', nameExercise: 'Ziel antippen',      desc: 'Tippe präzise auf erscheinende Ziele.' },
    { id: 'vis_5', nameExercise: 'Bewegtes Ziel',      desc: 'Verfolge und treffe ein sich bewegendes Ziel.' },
    { id: 'vis_7', nameExercise: 'Raster-Navigator',   desc: 'Navigiere durch ein Raster mit genauen Eingaben.' },
  ],
  processing: [
    { id: 'pro_2', nameExercise: 'Schnellsortierung',  desc: 'Sortiere Elemente nach Kategorie so schnell wie möglich.' },
    { id: 'pro_6', nameExercise: 'Wahr/Falsch-Blitz',  desc: 'Entscheide blitzschnell ob Aussagen wahr oder falsch sind.' },
    { id: 'pro_7', nameExercise: 'Farb-Wort-Tempo',    desc: 'Verarbeite Farben und Wörter in schneller Folge.' },
  ],
  reasoning: [
    { id: 'rea_1', nameExercise: 'Muster-Meister',     desc: 'Erkenne das Muster und vervollständige die Sequenz.' },
    { id: 'rea_2', nameExercise: 'Zahlenfolgen',       desc: 'Finde die logische Fortsetzung von Zahlenreihen.' },
    { id: 'rea_5', nameExercise: 'Analogie-Training',  desc: 'Löse Analogie-Aufgaben mit Wörtern und Konzepten.' },
  ],
};

const DOMAIN_META = {
  attention:  { name: 'Aufmerksamkeit',      icon: '🎯', color: '#f59e0b' },
  memory:     { name: 'Gedächtnis',           icon: '🧠', color: '#6366f1' },
  executive:  { name: 'Exekutive Funktion',   icon: '⚙️', color: '#10b981' },
  visuomotor: { name: 'Visuomotorik',         icon: '👁️', color: '#f97316' },
  processing: { name: 'Verarbeitung',         icon: '⚡', color: '#06b6d4' },
  reasoning:  { name: 'Logik',                icon: '🔮', color: '#f43f5e' },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Pick one random exercise per domain (6 total)
const BASELINE_EXERCISES = Object.entries(BASELINE_POOL).map(([domain, pool]) => {
  const picked = pickRandom(pool);
  return { ...picked, domain, ...DOMAIN_META[domain] };
});

export default function BaselineAssessment() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro'); // intro | precontext | between | exercise | done
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState([]);
  const [lastResult, setLastResult] = useState(null);
  const [contextData, setContextData] = useState(null);
  const completedRef = useRef(false);

  // Enter to start test from intro
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && phase === 'intro') setPhase('precontext');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  const handleComplete = async (gameResult) => {
    if (completedRef.current) return;
    completedRef.current = true;

    const ex = BASELINE_EXERCISES[currentIdx];
    const newResults = [...results, {
      ...gameResult,
      exercise_id: ex.id,
      domain: ex.domain,
      exercise_name: ex.nameExercise,
    }];
    setResults(newResults);

    try {
      await base44.entities.ExerciseResult.create({
        exercise_id: ex.id,
        exercise_name: ex.nameExercise,
        domain: ex.domain,
        score: gameResult.score,
        accuracy: gameResult.accuracy,
        reaction_time_ms: gameResult.reaction_time_ms,
        level: 2,
        xp_earned: 0,
        duration_seconds: 30,
        completed: true,
      });
    } catch (e) { console.error(e); }

    completedRef.current = false;

    const nextIdx = currentIdx + 1;
    const isLastExercise = nextIdx >= BASELINE_EXERCISES.length;
    setLastResult({ ...gameResult, exercise_name: ex.nameExercise, domain: ex.domain, icon: ex.icon, color: ex.color, _isLast: isLastExercise });

    if (isLastExercise) {
      // Save baseline to profile
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        if (profiles.length > 0) {
          const domainScores = {};
          newResults.forEach(r => { domainScores[r.domain] = r.score; });
          const overallAccuracy = Math.round(newResults.reduce((s, r) => s + r.score, 0) / newResults.length);
          const avgReaction = Math.round(newResults.filter(r => r.reaction_time_ms).reduce((s, r, _, a) => s + r.reaction_time_ms / a.length, 0));
          await base44.entities.UserProfile.update(profiles[0].id, {
            onboarding_completed: true,
            baseline_assessment_completed: true,
            baseline_results: {
              domain_scores: domainScores,
              overall_accuracy: overallAccuracy,
              avg_reaction_time_ms: avgReaction,
              assessed_at: new Date().toISOString(),
            },
          });
        }
      } catch (e) { console.error(e); }
      setPhase('between'); // show last result before done
    } else {
      setCurrentIdx(nextIdx);
      setPhase('between');
    }
  };



  // ── BETWEEN EXERCISES ──────────────────────────────────────
  if (phase === 'between' && lastResult) {
    const isLast = lastResult._isLast;
    const nextEx = !isLast ? BASELINE_EXERCISES[currentIdx] : null;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          {/* Result summary */}
          <div className="text-5xl">{lastResult.icon}</div>
          <div>
            <div className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">{lastResult.exercise_name}</div>
            <h2 className="text-2xl font-black text-white mb-1">Ergebnis</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-3xl font-black text-white">{lastResult.score ?? '—'}%</div>
              <div className="text-white/40 text-xs mt-1">Score</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="text-3xl font-black text-white">
                {lastResult.accuracy != null ? `${Math.round(lastResult.accuracy)}%` : '—'}
              </div>
              <div className="text-white/40 text-xs mt-1">Genauigkeit</div>
            </div>
            {lastResult.reaction_time_ms > 0 && (
              <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-3xl font-black text-white">{Math.round(lastResult.reaction_time_ms)} ms</div>
                <div className="text-white/40 text-xs mt-1">Reaktionszeit</div>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="text-white/40 text-xs">
            {results.length} / {BASELINE_EXERCISES.length} Übungen abgeschlossen
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${(results.length / BASELINE_EXERCISES.length) * 100}%` }}
            />
          </div>

          {isLast ? (
            <button
              onClick={() => setPhase('done')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-base shadow-xl hover:opacity-90 transition-all"
            >
              Auswertung ansehen 🏆
            </button>
          ) : (
            <div className="space-y-3">
              <div className="text-white/40 text-xs">Nächste Übung: <span className="text-white/70 font-bold">{nextEx?.nameExercise}</span></div>
              <button
                onClick={() => setPhase('exercise')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
              >
                Weiter → {nextEx?.icon}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ── PRE-CONTEXT ────────────────────────────────────────────
  if (phase === 'precontext') {
    return <PreBaselineContext onDone={(data) => { setContextData(data); setPhase('exercise'); }} />;
  }

  // ── INTRO ──────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-6xl">🧪</div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Einschätzungstest</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              {BASELINE_EXERCISES.length} kurze Übungen aus verschiedenen Bereichen — je etwa 30–60 Sekunden. Kein Richtig oder Falsch, ich möchte nur verstehen, wo du gerade stehst.
            </p>
          </div>
          <div className="space-y-2">
            {BASELINE_EXERCISES.map((ex) => (
              <div key={ex.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-left">
                <span className="text-xl">{ex.icon}</span>
                <div className="flex-1">
                  <div className="text-white/80 text-xs font-semibold">{ex.name}</div>
                  <div className="text-white/40 text-xs">{ex.nameExercise}</div>
                </div>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: ex.color }} />
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase('precontext')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Test starten 🚀
          </button>
          <button onClick={() => navigate(-1)} className="text-white/30 text-xs hover:text-white/50 transition-colors">
            Zurück
          </button>
        </motion.div>
      </div>
    );
  }

  // ── DONE ───────────────────────────────────────────────────
  if (phase === 'done') {
    return <PostAssessmentNeuro results={results} />;
  }

  // ── SEQUENTIAL EXERCISE ────────────────────────────────────
  const ex = BASELINE_EXERCISES[currentIdx];
  const GameComponent = GAME_MAP[ex.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex flex-col items-center justify-center p-4">
      {/* Progress */}
      <div className="w-full max-w-lg mb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-semibold">
            {currentIdx + 1} / {BASELINE_EXERCISES.length}
          </span>
          <span className="text-white/50 text-xs">{ex.name}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
            animate={{ width: `${((currentIdx) / BASELINE_EXERCISES.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* ExerciseTemplate — one at a time */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          className="w-full max-w-lg"
        >
          <ExerciseTemplate
            title={ex.nameExercise}
            description={ex.desc}
            icon={ex.icon}
            accentColor={ex.color}
            onComplete={handleComplete}
            onExit={() => {}}
          >
            {({ onComplete }) =>
              GameComponent
                ? <GameComponent onComplete={onComplete} level={2} />
                : <div className="text-center py-8 text-slate-400">Übung nicht verfügbar</div>
            }
          </ExerciseTemplate>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}