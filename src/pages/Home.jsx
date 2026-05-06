import { useState, useEffect } from 'react';
// Dark mode classes via ThemeContext in AppLayout
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';
import { DOMAINS, getLevel } from '@/lib/exercises';
import XPBar from '@/components/ui/XPBar';
import { Brain, Flame, Trophy, Zap, ChevronRight, Star, TrendingUp, Target } from 'lucide-react';
import DailyPlanCard from '@/components/training/DailyPlanCard';
import { useTheme } from '@/lib/ThemeContext';

const MOTIVATIONAL = [
  "Dein Gehirn ist ein Muskel — trainiere es täglich! 🧠",
  "Jede Wiederholung zählt. Du schaffst das! 💪",
  "Ein schärferer Geist, ein besseres Leben! ⚡",
  "5 Minuten täglich halten den Kopf klar! 🌟",
  "Level up deinen Verstand! 🚀",
];

export default function Home() {
  const { profile, loading } = useProfile();
  const [recentResults, setRecentResults] = useState([]);
  const [user, setUser] = useState(null);
  const { heroStyle, heroClass } = useTheme();
  const quote = MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.ExerciseResult.list('-created_date', 10).then(setRecentResults).catch(() => {});
  }, []);

  const xp = profile?.total_xp || 0;
  const { current: lvl } = getLevel(xp);
  const streak = profile?.current_streak || 0;

  // Domain scores: which areas need attention?
  const domainScores = Object.keys(DOMAINS).map(key => {
    const domainResults = recentResults.filter(r => r.domain === key);
    const avg = domainResults.length > 0
      ? Math.round(domainResults.reduce((s, r) => s + (r.score || 0), 0) / domainResults.length)
      : null;
    return { ...DOMAINS[key], avgScore: avg, count: domainResults.length };
  }).sort((a, b) => {
    if (a.avgScore === null && b.avgScore !== null) return -1;
    if (b.avgScore === null && a.avgScore !== null) return 1;
    return (a.avgScore ?? 0) - (b.avgScore ?? 0);
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Hero Header */}
      <div className={`${heroClass} px-6 pt-8 pb-12 relative overflow-hidden`} style={heroStyle}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/80 text-sm font-semibold mb-1">
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-3xl font-black text-white mb-1">
              Hey, {profile?.display_name?.split(' ')[0] || user?.full_name?.split(' ')[0] || 'Champion'}! 👋
            </h1>
            <p className="text-white/90 text-base font-medium">{quote}</p>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="mt-5 grid grid-cols-3 gap-3"
          >
            {[
              { icon: Zap, label: 'XP', value: xp, color: 'bg-yellow-400/20 text-yellow-100' },
              { icon: Flame, label: 'Serie', value: `${streak}T`, color: 'bg-orange-400/20 text-orange-100' },
              { icon: Star, label: 'Level', value: lvl.level, color: 'bg-purple-400/20 text-purple-100' },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center backdrop-blur-sm`}>
                <s.icon className="w-5 h-5 mx-auto mb-1 opacity-90" />
                <div className="text-xl font-black">{s.value}</div>
                <div className="text-xs font-semibold opacity-80">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* XP Bar */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4"
          >
            <XPBar xp={xp} compact />
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-5">

        {/* Daily Training Plan by Neuro — primary focus */}
        <DailyPlanCard />

        {/* Cognitive Focus Areas — sorted by weakest first */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              Kognitive Bereiche
            </h2>
            <Link to="/train" className="text-xs text-purple-600 font-bold flex items-center gap-1 hover:text-purple-700">
              Alle Übungen <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {domainScores.slice(0, 5).map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04 }}
              >
                <Link
                  to={`/train?domain=${d.id}`}
                  className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className={`w-10 h-10 rounded-xl ${d.gradient} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                    {d.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{d.nameDE || d.name}</span>
                      {d.avgScore !== null
                        ? <span className="text-xs font-black" style={{ color: d.color }}>{d.avgScore}%</span>
                        : <span className="text-xs font-semibold text-slate-400">Neu</span>
                      }
                    </div>
                    <div className="mt-1.5 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        className="h-1.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                        initial={{ width: 0 }}
                        animate={{ width: d.avgScore !== null ? `${d.avgScore}%` : '0%' }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.05 }}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom nav cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 pb-2"
        >
          <Link to="/progress" className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <TrendingUp className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <span className="font-bold text-sm">Mein Fortschritt</span>
          </Link>
          <Link to="/leaderboard" className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
            <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <span className="font-bold text-sm">Rangliste</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}