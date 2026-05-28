import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DOMAINS, EXERCISES, getLevel } from '@/lib/exercises';
import { useProfile } from '@/lib/useProfile';
import XPBar from '@/components/ui/XPBar';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, Zap, Brain, Award, History, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { computeEarnedBadges } from '@/lib/badges';
import BadgeCollection from '@/components/badges/BadgeCollection';

const PAGE_TABS = [
  { id: 'stats',   label: 'Statistik', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'badges',  label: 'Abzeichen', icon: <Medal className="w-4 h-4" /> },
];

export default function Progress() {
  const { profile, loading } = useProfile();
  const [results, setResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [activePageTab, setActivePageTab] = useState('stats');
  const { t } = useLanguage();

  useEffect(() => {
    base44.entities.ExerciseResult.list('-created_date', 200)
      .then(setResults)
      .finally(() => setLoadingResults(false));
  }, []);

  const earnedIds = computeEarnedBadges(results, profile);

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
      day: d.toLocaleDateString('de-DE', { weekday: 'short' }),
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" /> {t('progress.title')}
              </h1>
              <p className="text-white/80 text-sm">{t('progress.subtitle')}</p>
            </div>
            <Link to="/history" className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-full transition-all">
              <History className="w-3.5 h-3.5" /> {t('progress.history')}
            </Link>
          </div>
        </div>
      </div>

      {/* Page tab switcher */}
      <div className="max-w-2xl mx-auto px-4 -mt-5 mb-0 relative z-10">
        <div className="flex gap-2 bg-white dark:bg-slate-800 rounded-2xl p-1.5 shadow-lg border border-slate-100 dark:border-slate-700 w-fit mx-auto">
          {PAGE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePageTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activePageTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 space-y-5">

      {/* ── BADGES TAB ── */}
      {activePageTab === 'badges' && (
        <BadgeCollection earnedIds={earnedIds} results={results} />
      )}

      {/* ── STATS TAB ── */}
      {activePageTab === 'stats' && (<>
        {/* XP Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="font-black text-slate-800 dark:text-slate-100">{t('progress.xpLevel')}</h2>
          </div>
          <XPBar xp={xp} />
        </motion.div>

        {/* Stats Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: t('progress.exercises'), value: totalExercises, icon: '🎯', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
            { label: t('progress.currentStreak'), value: `${profile?.current_streak || 0}🔥`, icon: '🔥', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
            { label: t('progress.bestDomain'), value: bestDomain ? bestDomain.icon : '—', icon: '🏆', color: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
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
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-slate-800 dark:text-slate-100">{t('progress.brainMap')}</h2>
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
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <h2 className="font-black text-slate-800 dark:text-slate-100">{t('progress.thisWeek')}</h2>
          </div>
          <div className="flex items-end justify-between gap-1 h-28">
            {(() => {
              const maxEx = Math.max(...last7Days.map(d => d.exercises), 1);
              return last7Days.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-slate-400" style={{ minHeight: 16 }}>
                    {d.exercises > 0 ? d.exercises : ''}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <motion.div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-purple-400"
                      style={{ opacity: d.exercises > 0 ? 1 : 0.15 }}
                      initial={{ height: 0 }}
                      animate={{ height: d.exercises > 0 ? `${Math.round((d.exercises / maxEx) * 72)}px` : '4px' }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{d.day}</span>
                </div>
              ));
            })()}
          </div>
        </motion.div>

        {/* Domain Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-black text-slate-800 dark:text-slate-100">{t('progress.domainPerformance')}</h2>
          </div>
          <div className="space-y-4">
            {domainStats.map(d => {
              const clampedScore = Math.min(d.avgScore ?? 0, 100);
              const mastery = d.count === 0 ? null : d.count >= 50 ? t('progress.expert') : d.count >= 20 ? t('progress.advanced') : d.count >= 5 ? t('progress.learning') : t('progress.beginner');
              return (
                <div key={d.id} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${d.gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                    {d.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{d.nameDE || d.name}</span>
                        {mastery && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
                            {mastery}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-400 flex-shrink-0 ml-2">{d.count}×</span>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="h-2.5 rounded-full"
                        style={{ backgroundColor: d.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${clampedScore}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-black w-10 text-right flex-shrink-0" style={{ color: d.avgScore !== null ? d.color : '#94a3b8' }}>
                    {d.avgScore !== null ? `${Math.min(d.avgScore, 100)}%` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Sessions */}
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
          >
            <h2 className="font-black text-slate-800 dark:text-slate-100 mb-4">{t('progress.recentActivity')}</h2>
            <div className="space-y-2">
              {results.slice(0, 10).map(r => {
                const d = DOMAINS[r.domain];
                return (
                  <div key={r.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <div className={`w-8 h-8 rounded-lg ${d?.gradient} flex items-center justify-center text-sm flex-shrink-0`}>
                      {d?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{r.exercise_name}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(r.created_date).toLocaleDateString('de-DE', { month: 'short', day: 'numeric' })}
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
            <div className="font-black text-slate-600 text-lg">{t('progress.noDataTitle')}</div>
            <p className="text-slate-400 mt-2">{t('progress.noDataSub')}</p>
          </div>
        )}
      </>)}
      </div>
    </div>
  );
}