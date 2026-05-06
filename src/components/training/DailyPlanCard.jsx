import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { EXERCISES, DOMAINS } from '@/lib/exercises';
import { Brain, ChevronRight, CheckCircle2, Sparkles, RefreshCw, Zap } from 'lucide-react';

export default function DailyPlanCard() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlan = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await base44.functions.invoke('generateTrainingPlan', {});
      setPlan(res.data.plan);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  // Mark exercise as completed in plan
  const handleComplete = async (exerciseId) => {
    if (!plan) return;
    const already = plan.completed_exercises || [];
    if (already.includes(exerciseId)) return;
    const updated = [...already, exerciseId];
    await base44.entities.TrainingPlan.update(plan.id, { completed_exercises: updated });
    setPlan(prev => ({ ...prev, completed_exercises: updated }));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-purple-600" />
          <h2 className="font-black text-slate-800 dark:text-slate-100">Neuro's Tagesplan</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const exercises = (plan.exercises || []).map(id => EXERCISES.find(e => e.id === id)).filter(Boolean);
  const completed = plan.completed_exercises || [];
  const doneCount = completed.length;
  const totalCount = exercises.length;
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
  const allDone = doneCount >= totalCount;

  const focusDomains = plan.focus_domains || [];

  const totalXP = exercises.reduce((sum, ex) => sum + (ex?.xpReward || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-5 border border-slate-100 dark:border-slate-700"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h2 className="font-black text-slate-800 dark:text-slate-100">Neuro's Tagesplan</h2>
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Fokus heute: {focusDomains.map(d => DOMAINS[d]?.icon).join(' ')} · {doneCount}/{totalCount} erledigt
          </p>
        </div>
        <button
          onClick={() => loadPlan(true)}
          disabled={refreshing}
          className="p-1.5 rounded-xl text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
          title="Plan neu laden"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {allDone ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🏆</div>
          <div className="font-black text-slate-800 dark:text-slate-100">Tagesplan geschafft!</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">+{totalXP} XP gesammelt — großartig! 🎉</div>
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex, i) => {
            const domain = DOMAINS[ex.domain];
            const done = completed.includes(ex.id);
            return (
              <div key={ex.id} className={`flex items-center gap-3 rounded-2xl transition-all ${done ? 'opacity-50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                {/* Order number or check */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black ${
                  done ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
                }`}>
                  {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>

                <Link
                  to={`/exercise/${ex.id}`}
                  onClick={() => handleComplete(ex.id)}
                  className="flex-1 flex items-center gap-3 py-2 min-w-0"
                >
                  <div className={`w-10 h-10 rounded-xl ${domain.gradient} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                    {ex.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-bold truncate ${done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {ex.nameDE || ex.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{domain.nameDE} · +{ex.xpReward} XP</div>
                  </div>
                  {!done && <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />}
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Total XP */}
      {!allDone && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Gesamt erreichbar</span>
          <div className="flex items-center gap-1 text-yellow-500 font-black text-sm">
            <Zap className="w-3.5 h-3.5" /> +{totalXP} XP
          </div>
        </div>
      )}
    </motion.div>
  );
}