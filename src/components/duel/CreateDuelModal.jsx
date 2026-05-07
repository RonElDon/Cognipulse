import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { EXERCISES, DOMAINS } from '@/lib/exercises';
import { X, Swords } from 'lucide-react';

export default function CreateDuelModal({ user, profile, onClose, onCreated }) {
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]?.id || '');
  const [creating, setCreating] = useState(false);

  const exercise = EXERCISES.find(e => e.id === selectedExercise);

  const handleCreate = async () => {
    if (!exercise) return;
    setCreating(true);
    const expires = new Date();
    expires.setDate(expires.getDate() + 3); // 3 days to respond

    const duel = await base44.entities.Duel.create({
      challenger_email: user.email,
      challenger_name: profile?.display_name || user.full_name || 'Herausforderer',
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      domain: exercise.domain,
      status: 'open',
      expires_at: expires.toISOString(),
    });
    setCreating(false);
    onCreated(duel.id, exercise.id);
  };

  // Group exercises by domain
  const grouped = EXERCISES.reduce((acc, ex) => {
    if (!acc[ex.domain]) acc[ex.domain] = [];
    acc[ex.domain].push(ex);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 md:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-5 relative max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-black text-slate-800 dark:text-slate-100 text-lg mb-1 flex items-center gap-2">
          <Swords className="w-5 h-5 text-rose-500" /> Duell erstellen
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Wähle eine Übung. Du spielst zuerst, dann kann jeder andere mitspielen!</p>

        <div className="overflow-y-auto flex-1 space-y-3 pr-1">
          {Object.entries(grouped).map(([domainId, exs]) => {
            const domain = DOMAINS[domainId];
            return (
              <div key={domainId}>
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                  <span>{domain?.icon}</span>
                  <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">{domain?.nameDE}</span>
                </div>
                <div className="space-y-1">
                  {exs.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => setSelectedExercise(ex.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left ${
                        selectedExercise === ex.id
                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20'
                          : 'border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xl">{ex.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-bold text-sm ${selectedExercise === ex.id ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>{ex.name}</div>
                        <div className="text-xs text-slate-400">+{ex.xpReward} XP</div>
                      </div>
                      {selectedExercise === ex.id && <div className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          {exercise && (
            <div className="flex items-center gap-2 mb-3 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
              <span className="text-lg">{exercise.icon}</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{exercise.name}</span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: DOMAINS[exercise.domain]?.color + '20', color: DOMAINS[exercise.domain]?.color }}>
                {DOMAINS[exercise.domain]?.nameDE}
              </span>
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={!selectedExercise || creating}
            className="w-full py-3.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {creating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Swords className="w-4 h-4" />}
            {creating ? 'Erstelle...' : 'Duell starten & spielen!'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}