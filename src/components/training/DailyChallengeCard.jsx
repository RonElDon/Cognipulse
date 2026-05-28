import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DOMAINS } from '@/lib/exercises';
import { Target, CheckCircle2, Circle, Zap, Trophy, Flame } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function generateGoals() {
  const allDomainIds = Object.keys(DOMAINS);
  const randomDomain = allDomainIds[Math.floor(Math.random() * allDomainIds.length)];
  const randomDomain2 = allDomainIds.filter(d => d !== randomDomain)[Math.floor(Math.random() * (allDomainIds.length - 1))];

  return [
    {
      id: 'g1',
      label: '3 Übungen abschließen',
      target: 3,
      type: 'exercises_count',
      completed: false,
    },
    {
      id: 'g2',
      label: `${DOMAINS[randomDomain].icon} ${DOMAINS[randomDomain].nameDE} meistern`,
      target: 1,
      type: 'domain_exercises',
      domain: randomDomain,
      completed: false,
    },
    {
      id: 'g3',
      label: `${DOMAINS[randomDomain2].icon} ${DOMAINS[randomDomain2].nameDE} ≥ 70%`,
      target: 70,
      type: 'min_score',
      domain: randomDomain2,
      completed: false,
    },
  ];
}

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bonusActive, setBonusActive] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    loadChallenge();
  }, []);

  const loadChallenge = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const today = todayStr();

      // Check for bonus from yesterday's completed challenge
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const [todayChallenges, yesterdayChallenges, todayResults] = await Promise.all([
        base44.entities.DailyChallenge.filter({ created_by: user.email, date: today }),
        base44.entities.DailyChallenge.filter({ created_by: user.email, date: yesterdayStr }),
        base44.entities.ExerciseResult.filter({ created_by: user.email }),
      ]);

      // Check if yesterday's bonus is active
      const yChallenge = yesterdayChallenges[0];
      if (yChallenge?.all_completed && !yChallenge?.bonus_claimed) {
        setBonusActive(true);
      }

      let todayChallenge = todayChallenges[0];
      if (!todayChallenge) {
        // Create new challenge for today
        todayChallenge = await base44.entities.DailyChallenge.create({
          date: today,
          goals: generateGoals(),
          all_completed: false,
          bonus_multiplier: 1.5,
          bonus_claimed: false,
        });
      }

      // Evaluate goal progress against today's results
      const todayResultsFiltered = todayResults.filter(r =>
        r.created_date?.startsWith(today)
      );
      const updatedGoals = evaluateGoals(todayChallenge.goals, todayResultsFiltered);
      const allDone = updatedGoals.every(g => g.completed);

      if (allDone !== todayChallenge.all_completed || JSON.stringify(updatedGoals) !== JSON.stringify(todayChallenge.goals)) {
        const updated = await base44.entities.DailyChallenge.update(todayChallenge.id, {
          goals: updatedGoals,
          all_completed: allDone,
        });
        setChallenge(updated);
      } else {
        setChallenge({ ...todayChallenge, goals: updatedGoals, all_completed: allDone });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const claimBonus = async () => {
    try {
      const user = await base44.auth.me();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const [yc] = await base44.entities.DailyChallenge.filter({ created_by: user.email, date: yesterdayStr });
      if (yc) await base44.entities.DailyChallenge.update(yc.id, { bonus_claimed: true });
      setBonusActive(false);
    } catch (e) {}
  };

  if (loading) return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-rose-500" />
        <h2 className="font-black text-slate-800 dark:text-slate-100">Tages-Challenge</h2>
      </div>
      <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-10 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse"/>)}</div>
    </div>
  );

  if (!challenge) return null;

  const completedCount = challenge.goals?.filter(g => g.completed).length || 0;
  const total = challenge.goals?.length || 0;
  const progress = total > 0 ? (completedCount / total) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
      className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-5 border border-slate-100 dark:border-slate-700"
    >
      {/* Bonus Banner */}
      <AnimatePresence>
        {bonusActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-3 flex items-center gap-3"
          >
            <span className="text-2xl">🎉</span>
            <div className="flex-1">
              <div className="font-black text-white text-sm">{t('dailyChallenge.bonusBanner')}</div>
              <div className="text-white/80 text-xs">{t('dailyChallenge.bonusBannerSub')}</div>
            </div>
            <button onClick={claimBonus} className="bg-white/30 hover:bg-white/50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
              {t('dailyChallenge.ok')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-rose-500" />
          <h2 className="font-black text-slate-800 dark:text-slate-100">{t('dailyChallenge.title')}</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          {completedCount}/{total}
          {challenge.all_completed && <Trophy className="w-4 h-4 text-yellow-500" />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
        <motion.div
          className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Goals */}
      <div className="space-y-2">
        {challenge.goals?.map(goal => (
          <div key={goal.id} className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
            goal.completed ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-slate-50 dark:bg-slate-700/50'
          }`}>
            {goal.completed
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              : <Circle className="w-5 h-5 text-slate-300 flex-shrink-0" />
            }
            <span className={`text-sm font-semibold flex-1 ${
              goal.completed ? 'text-emerald-700 dark:text-emerald-400 line-through' : 'text-slate-700 dark:text-slate-200'
            }`}>
              {goal.label}
            </span>
          </div>
        ))}
      </div>

      {/* Reward info */}
      {!challenge.all_completed ? (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {t('dailyChallenge.reward')} <span className="font-black text-yellow-600 dark:text-yellow-400">{t('dailyChallenge.bonus')}</span>
          </span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2"
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
            {t('dailyChallenge.completed')}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

function evaluateGoals(goals, todayResults) {
  return goals.map(goal => {
    let completed = false;
    if (goal.type === 'exercises_count') {
      completed = todayResults.length >= goal.target;
    } else if (goal.type === 'domain_exercises') {
      completed = todayResults.filter(r => r.domain === goal.domain).length >= goal.target;
    } else if (goal.type === 'min_score') {
      completed = todayResults.some(r => r.domain === goal.domain && r.score >= goal.target);
    }
    return { ...goal, completed };
  });
}