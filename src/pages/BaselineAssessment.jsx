import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import GAME_MAP from '@/components/games/GameMap';
import { DOMAINS } from '@/lib/exercises';
import { base44 } from '@/api/base44Client';

const BASELINE_POOL = {
  attention:  [
    { id: 'att_2', nameExercise: 'Zahlenjagd' },
    { id: 'att_3', nameExercise: 'Farbenwechsel' },
    { id: 'att_6', nameExercise: 'Ablenkungsschutz' },
    { id: 'att_7', nameExercise: 'Blitz-Erkennung' },
  ],
  memory: [
    { id: 'mem_2', nameExercise: 'Sequenz-Erinnerung' },
    { id: 'mem_3', nameExercise: 'Wortliste' },
    { id: 'mem_5', nameExercise: 'Positionsgedächtnis' },
    { id: 'mem_7', nameExercise: 'Geschichten-Erinnerung' },
  ],
  executive: [
    { id: 'exe_1', nameExercise: 'Aufgabenwechsel' },
    { id: 'exe_2', nameExercise: 'Stoppsignal' },
    { id: 'exe_4', nameExercise: 'Stroop-Herausforderung' },
    { id: 'exe_8', nameExercise: 'Hemmungs-Rennen' },
  ],
  visuomotor: [
    { id: 'vis_3', nameExercise: 'Ziel antippen' },
    { id: 'vis_5', nameExercise: 'Bewegtes Ziel' },
    { id: 'vis_7', nameExercise: 'Raster-Navigator' },
  ],
  processing: [
    { id: 'pro_2', nameExercise: 'Schnellsortierung' },
    { id: 'pro_6', nameExercise: 'Wahr/Falsch-Blitz' },
    { id: 'pro_7', nameExercise: 'Farb-Wort-Tempo' },
  ],
  reasoning: [
    { id: 'rea_1', nameExercise: 'Muster-Meister' },
    { id: 'rea_2', nameExercise: 'Zahlenfolgen' },
    { id: 'rea_5', nameExercise: 'Analogie-Training' },
  ],
};

const DOMAIN_META = {
  attention:  { name: 'Aufmerksamkeit',          icon: '🎯' },
  memory:     { name: 'Gedächtnis',               icon: '🧠' },
  executive:  { name: 'Exekutive Funktionen',     icon: '⚙️' },
  visuomotor: { name: 'Visuomotorik',             icon: '👁️' },
  processing: { name: 'Verarbeitungsgeschw.',     icon: '⚡' },
  reasoning:  { name: 'Logik & Schlussfolgerung', icon: '🔮' },
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const BASELINE_EXERCISES = Object.entries(BASELINE_POOL).map(([domain, pool]) => {
  const picked = pickRandom(pool);
  return { ...picked, domain, ...DOMAIN_META[domain] };
});

export default function BaselineAssessment() {
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(-1); // -1 = intro, 0-5 = exercises, 6 = done
  const [results, setResults] = useState([]);
  const [saving, setSaving] = useState(false);

  const currentExercise = currentIdx >= 0 && currentIdx < BASELINE_EXERCISES.length
    ? BASELINE_EXERCISES[currentIdx]
    : null;

  const GameComponent = currentExercise ? GAME_MAP[currentExercise.id] : null;

  const handleComplete = async (gameResult) => {
    const ex = BASELINE_EXERCISES[currentIdx];
    const newResults = [...results, { ...gameResult, exercise_id: ex.id, domain: ex.domain, exercise_name: ex.nameExercise }];
    setResults(newResults);

    // Save ExerciseResult
    setSaving(true);
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
    setSaving(false);

    if (currentIdx + 1 >= BASELINE_EXERCISES.length) {
      // All done — save baseline results to profile
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
      setCurrentIdx(6);
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  };

  // INTRO
  if (currentIdx === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-6xl">🧪</div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Einschätzungstest</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              6 kurze Übungen aus verschiedenen Bereichen — je etwa 30 Sekunden. Kein Richtig oder Falsch, ich möchte nur verstehen wo du gerade stehst.
            </p>
          </div>
          <div className="space-y-2">
            {BASELINE_EXERCISES.map((ex, i) => {
              const domain = DOMAINS[ex.domain];
              return (
                <div key={ex.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-left">
                  <span className="text-xl">{ex.icon}</span>
                  <div className="flex-1">
                    <div className="text-white/80 text-xs font-semibold">{ex.name}</div>
                    <div className="text-white/40 text-xs">{ex.nameExercise}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: domain.color }} />
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentIdx(0)}
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

  // DONE
  if (currentIdx === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-6xl">🎉</div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Test abgeschlossen!</h1>
            <p className="text-white/60 text-sm">Neuro analysiert jetzt deine Ergebnisse und stellt dein Training zusammen.</p>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => {
              const domain = DOMAINS[r.domain];
              const domainMeta = BASELINE_EXERCISES.find(ex => ex.domain === r.domain);
              return (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-xl">{domainMeta?.icon || '🧠'}</span>
                  <div className="flex-1 text-left">
                    <div className="text-white/80 text-xs font-semibold">{domainMeta?.name || r.domain}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-black text-sm" style={{ color: domain?.color || '#fff' }}>{r.score}%</span>
                </div>
              );
            })}
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-base shadow-xl hover:from-emerald-500 hover:to-cyan-500 transition-all"
          >
            Zur App →
          </button>
        </motion.div>
      </div>
    );
  }

  // EXERCISE
  const ex = BASELINE_EXERCISES[currentIdx];
  const domain = DOMAINS[ex.domain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex flex-col items-center justify-center p-4">
      {/* Progress */}
      <div className="w-full max-w-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/50 text-xs font-semibold">Übung {currentIdx + 1} von {BASELINE_EXERCISES.length}</span>
          <span className="text-white/50 text-xs">{ex.name}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: `${(currentIdx / BASELINE_EXERCISES.length) * 100}%` }}
            animate={{ width: `${((currentIdx + 1) / BASELINE_EXERCISES.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 border border-slate-100">
        <AnimatePresence mode="wait">
          <motion.div key={currentIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {GameComponent ? (
              <GameComponent onComplete={handleComplete} level={2} />
            ) : (
              <div className="text-center py-8 text-slate-400">Übung nicht verfügbar</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}