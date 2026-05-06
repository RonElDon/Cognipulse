import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DOMAINS, EXERCISES, getLevel } from '@/lib/exercises';
import { useProfile } from '@/lib/useProfile';
import XPBar from '@/components/ui/XPBar';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Calendar, Zap, Brain, Award } from 'lucide-react';

export default function Progress() {
  const { profile, loading } = useProfile();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);

  useEffect(() => {
    base44.entities.ExerciseResult.list('-created_date', 100)
      .then(setResults)
      .finally(() => setLoadingResults(false));
  }, []);

  const xp = profile?.total_xp || 0;
  const { current: lvl } = getLevel(xp);

  // Domain averages for radar chart
  const radarData = Object.values(DOMAINS).map(d => {
    const domainResults = results.filter(r => r.domain === d.id);
    const avg = domainResults.length > 0
      ? Math.round(domainResults.reduce((s, r) => s + (r.score || 0), 0) / domainResults.length)
      : 0;
    return { domain: d.icon + ' ' + d.name.split(' ')[0], score: avg, fullMark: 100 };
  });

  // Last 7 days activity
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayResults = results.filter(r => r.created_date?.startsWith(dateStr));
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      exercises: dayResults.length,
      avgScore: dayResults.length > 0 ? Math.round(dayResults.reduce((s, r) => s + r.score, 0) / dayResults.length) : 0,
    };
  });

  // Domain breakdown
  const domainStats = Object.values(DOMAINS).map(d => {
    const domainResults = results.filter(r => r.domain === d.id);
    const avg = domainResults.length > 0
      ? Math.round(domainResults.reduce((s, r) => s + r.score, 0) / domainResults.length)
      : null;
    return { ...d, count: domainResults.length, avgScore: avg };
  });

  const totalExercises = results.length;
  const bestDomain = domainStats.filter(d => d.avgScore !== null).sort((a, b) => b.avgScore - a.avgScore)[0];

  if (loading || loadingResults) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 pt-8 pb-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" /> My Progress
          </h1>
          <p className="text-white/80 text-sm">Track your cognitive development over time</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 space-y-5">
        {/* XP Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="font-black text-slate-800">XP & Level</h2>
          </div>
          <XPBar xp={xp} />
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Exercises', value: totalExercises, icon: '🎯', color: 'bg-purple-50 text-purple-700' },
            { label: 'Day Streak', value: `${profile?.current_streak || 0}🔥`, icon: '🔥', color: 'bg-orange-50 text-orange-700' },
            { label: 'Best Domain', value: bestDomain ? bestDomain.icon : '—', icon: '🏆', color: 'bg-amber-50 text-amber-700' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-2xl p-3 text-center`}>
              <div className="text-2xl font-black">{s.value}</div>
              <div className="text-xs font-semibold opacity-80 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Radar Chart */}
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-slate-800">Brain Map</h2>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fontWeight: 600 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Weekly Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="font-black text-slate-800">This Week</h2>
          </div>
          <div className="flex items-end justify-between gap-1 h-24">
            {last7Days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-lg transition-all duration-500 bg-gradient-to-t from-indigo-500 to-purple-400"
                  style={{ height: `${Math.max(d.exercises * 20, d.exercises > 0 ? 8 : 2)}px`, opacity: d.exercises > 0 ? 1 : 0.2 }}
                />
                <span className="text-xs font-semibold text-slate-500">{d.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Domain Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-slate-800">Domain Performance</h2>
          </div>
          <div className="space-y-3">
            {domainStats.map(d => (
              <div key={d.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${d.gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                  {d.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-700">{d.name}</span>
                    <span className="text-xs font-bold text-slate-500">{d.count} plays</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${d.avgScore || 0}%`, backgroundColor: d.color }}
                    />
                  </div>
                </div>
                <span className="text-sm font-black w-10 text-right" style={{ color: d.color }}>
                  {d.avgScore !== null ? `${d.avgScore}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Sessions */}
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100"
          >
            <h2 className="font-black text-slate-800 mb-4">Recent Sessions</h2>
            <div className="space-y-2">
              {results.slice(0, 10).map(r => {
                const d = DOMAINS[r.domain];
                return (
                  <div key={r.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                    <div className={`w-8 h-8 rounded-lg ${d?.gradient} flex items-center justify-center text-sm flex-shrink-0`}>
                      {d?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 truncate">{r.exercise_name}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(r.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black" style={{ color: d?.color }}>{r.score}%</div>
                      <div className="text-xs text-yellow-500 font-bold">+{r.xp_earned}xp</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {results.length === 0 && !loadingResults && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🧠</div>
            <div className="font-black text-slate-600 text-lg">No exercises yet!</div>
            <p className="text-slate-400 mt-2">Start training to see your progress here.</p>
          </div>
        )}
      </div>
    </div>
  );
}