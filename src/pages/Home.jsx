import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';
import { DOMAINS, EXERCISES, getLevel } from '@/lib/exercises';
import XPBar from '@/components/ui/XPBar';
import { Brain, Flame, Trophy, Zap, ChevronRight, PlayCircle, Star } from 'lucide-react';

const MOTIVATIONAL = [
  "Your brain is a muscle — train it daily! 🧠",
  "Every rep counts. You got this! 💪",
  "Sharper mind, better life! ⚡",
  "5 minutes a day keeps brain fog away! 🌟",
  "Level up your mind today! 🚀",
];

export default function Home() {
  const { profile, loading } = useProfile();
  const [recentResults, setRecentResults] = useState([]);
  const [user, setUser] = useState(null);
  const quote = MOTIVATIONAL[new Date().getDay() % MOTIVATIONAL.length];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.ExerciseResult.list('-created_date', 3).then(setRecentResults).catch(() => {});
  }, []);

  const xp = profile?.total_xp || 0;
  const { current: lvl } = getLevel(xp);
  const streak = profile?.current_streak || 0;

  // Domain scores from recent results (simplified)
  const domainScores = Object.keys(DOMAINS).map(key => {
    const domainResults = recentResults.filter(r => r.domain === key);
    const avg = domainResults.length > 0
      ? Math.round(domainResults.reduce((s, r) => s + (r.score || 0), 0) / domainResults.length)
      : null;
    return { ...DOMAINS[key], avgScore: avg };
  });

  const todayExercises = EXERCISES.slice(0, 3);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Hero Header */}
      <div className="hero-gradient px-6 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/80 text-sm font-semibold mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
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
              { icon: Flame, label: 'Streak', value: `${streak}d`, color: 'bg-orange-400/20 text-orange-100' },
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

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-6">
        {/* Today's Exercises */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-5 border border-slate-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-purple-600" />
              Today's Training
            </h2>
            <Link to="/train" className="text-sm text-purple-600 font-bold flex items-center gap-1 hover:text-purple-700">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayExercises.map((ex, i) => {
              const domain = DOMAINS[ex.domain];
              return (
                <Link
                  key={ex.id}
                  to={`/exercise/${ex.id}`}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100"
                >
                  <div className={`w-12 h-12 rounded-2xl ${domain.gradient} flex items-center justify-center text-2xl shadow-md`}>
                    {ex.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm">{ex.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{domain.name} · +{ex.xpReward} XP</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: ex.difficulty }).map((_, j) => (
                      <div key={j} className="w-1.5 h-4 rounded-full" style={{ backgroundColor: domain.color }} />
                    ))}
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-2 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Domain Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            Your Brain Domains
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {domainScores.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link
                  to={`/train?domain=${d.id}`}
                  className="block bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl ${d.gradient} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                    {d.icon}
                  </div>
                  <div className="font-bold text-slate-800 text-sm">{d.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5 mb-2">{d.description.split(',')[0]}</div>
                  {d.avgScore !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${d.avgScore}%`, backgroundColor: d.color }} />
                      </div>
                      <span className="text-xs font-bold" style={{ color: d.color }}>{d.avgScore}%</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Not started yet</span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link to="/leaderboard" className="flex flex-col items-center gap-2 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-4 shadow-lg shadow-amber-200/50 hover:scale-105 transition-transform">
            <Trophy className="w-6 h-6" />
            <span className="font-bold text-sm">Leaderboard</span>
          </Link>
          <Link to="/progress" className="flex flex-col items-center gap-2 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl p-4 shadow-lg shadow-indigo-200/50 hover:scale-105 transition-transform">
            <Brain className="w-6 h-6" />
            <span className="font-bold text-sm">My Progress</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}