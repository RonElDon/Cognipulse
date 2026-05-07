import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useProfile } from '@/lib/useProfile';
import { BADGES, DOMAINS, EXERCISES, getLevel } from '@/lib/exercises';
import XPBar from '@/components/ui/XPBar';
import { User, Settings, Globe, Target, LogOut, Check, Edit2, Palette } from 'lucide-react';
import AppearanceSettings from '@/components/profile/AppearanceSettings';
import { toast } from 'sonner';

export default function Profile() {
  const { profile, loading, updateProfile } = useProfile();
  const [user, setUser] = useState(null);
  const [editName, setEditName] = useState(false);
  const [newName, setNewName] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.entities.ExerciseResult.list('-created_date', 100).then(setResults).catch(() => {});
  }, []);

  const xp = profile?.total_xp || 0;
  const { current: lvl } = getLevel(xp);

  // Compute badge unlocks
  const totalGames = results.length;
  const streak = profile?.current_streak || 0;
  const domainsPlayed = new Set(results.map(r => r.domain)).size;
  // Check if user has played ALL exercises in at least one domain
  const playedExerciseIds = new Set(results.map(r => r.exercise_id));
  const hasCompletedAllInDomain = Object.keys(DOMAINS).some(domainId => {
    const domainExercises = EXERCISES.filter(e => e.domain === domainId);
    return domainExercises.length > 0 && domainExercises.every(e => playedExerciseIds.has(e.id));
  });
  const bestReaction = results.reduce((min, r) => r.reaction_time_ms ? Math.min(min, r.reaction_time_ms) : min, Infinity);
  const userBadgeIds = profile?.badges || [];

  const badgeStats = { totalGames, streak, totalXP: xp, domainsPlayed, bestReaction, hasCompletedAllInDomain };
  const earnedBadges = BADGES.filter(b => b.condition(badgeStats));

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    await updateProfile({ display_name: newName.trim() });
    setEditName(false);
    toast.success('Name aktualisiert!');
  };

  const handleLanguageChange = async (lang) => {
    await updateProfile({ preferred_language: lang });
    toast.success(`Sprache geändert zu ${lang === 'en' ? 'Englisch' : 'Deutsch'}`);
  };

  const handleGoalChange = async (daily) => {
    await updateProfile({ goals: { ...profile?.goals, daily_exercises: daily } });
    toast.success('Ziel aktualisiert!');
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleResetOnboarding = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { onboarding_completed: false });
        window.location.reload();
      }
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 pt-8 pb-14">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white mx-auto mb-3 shadow-xl">
            {(profile?.display_name || user?.full_name || '?')[0].toUpperCase()}
          </div>
          {editName ? (
            <div className="flex items-center gap-2 justify-center">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="bg-white/10 text-white text-lg font-black text-center rounded-xl px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-white/20"
                placeholder="Dein Name"
              />
              <button onClick={handleSaveName} className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <h1 className="text-xl font-black text-white">{profile?.display_name || user?.full_name || 'Gehirn-Entdecker'}</h1>
              <button onClick={() => { setNewName(profile?.display_name || ''); setEditName(true); }}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Edit2 className="w-3 h-3 text-white/70" />
              </button>
            </div>
          )}
          <p className="text-white/60 text-sm mt-1">{user?.email}</p>
          <div className="mt-2 inline-block text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: lvl.color + '30', color: lvl.color }}>
            Stufe {lvl.level} · {lvl.name}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4">
        {/* XP */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <XPBar xp={xp} />
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <h2 className="font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">🏅 Abzeichen ({earnedBadges.length}/{BADGES.length})</h2>
          <div className="grid grid-cols-4 gap-3">
            {BADGES.map(badge => {
              const earned = badge.condition(badgeStats);
              return (
                <div key={badge.id} className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${earned ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-slate-50 dark:bg-slate-700/50 opacity-40'}`}>
                  <div className={`text-3xl ${!earned && 'grayscale'}`}>{badge.icon}</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">{badge.name}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Language */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <h2 className="font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" /> Sprache
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[{ code: 'en', label: '🇬🇧 English' }, { code: 'de', label: '🇩🇪 Deutsch' }].map(l => (
              <button
                key={l.code}
                onClick={() => handleLanguageChange(l.code)}
                className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                  profile?.preferred_language === l.code
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Daily Goal */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <h2 className="font-black text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" /> Tagesziel
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Wie viele Übungen pro Tag?</p>
          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map(n => (
              <button
                key={n}
                onClick={() => handleGoalChange(n)}
                className={`py-3 rounded-2xl font-black text-lg transition-all ${
                  (profile?.goals?.daily_exercises || 3) === n
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <h2 className="font-black text-slate-800 dark:text-slate-100 mb-4">📊 Meine Statistiken</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Übungen gesamt', value: totalGames, icon: '🎯' },
              { label: 'Gesamt-XP', value: xp, icon: '⚡' },
              { label: 'Beste Serie', value: `${profile?.longest_streak || 0} Tage`, icon: '🔥' },
              { label: 'Bereiche versucht', value: `${domainsPlayed}/6`, icon: '🧠' },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 dark:bg-slate-700/60 rounded-2xl p-3">
                <div className="text-2xl">{s.icon}</div>
                <div className="font-black text-slate-800 dark:text-slate-100 text-lg mt-1">{s.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
        >
          <h2 className="font-black text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" /> Erscheinungsbild
          </h2>
          <AppearanceSettings />
        </motion.div>

        {/* Reset & Logout */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-3">
          <button
            onClick={handleResetOnboarding}
            className="w-full py-3 rounded-2xl border-2 border-amber-100 dark:border-amber-900/40 text-amber-600 font-bold flex items-center justify-center gap-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors text-sm"
          >
            🔄 Onboarding neu starten
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-2xl border-2 border-red-100 dark:border-red-900/40 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Abmelden
          </button>
        </motion.div>
      </div>
    </div>
  );
}