import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DOMAINS, getLevel } from '@/lib/exercises';
import { Trophy, Medal, Zap, Share2, Swords } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { ShareAchievementModal } from '@/components/social/SocialShareWidget';

export default function Leaderboard() {
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [filterDomain, setFilterDomain] = useState('overall');
  const [showShareModal, setShowShareModal] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([
      base44.entities.UserProfile.list('-total_xp', 50),
      base44.auth.me().catch(() => null),
    ]).then(([profiles, user]) => {
      setAllProfiles(profiles);
      setCurrentUser(user);
    }).finally(() => setLoading(false));
  }, []);

  const ranked = allProfiles.map((p, i) => ({ ...p, rank: i + 1 }));
  const myRank = ranked.find(p => p.created_by === currentUser?.email);

  const RankIcon = ({ rank }) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-black text-slate-500 dark:text-slate-400">{rank}</span>;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <Trophy className="w-10 h-10 text-white mx-auto mb-3" />
          <h1 className="text-3xl font-black text-white">{t('leaderboard.title2')}</h1>
          <p className="text-white/80 text-sm mt-1">{t('leaderboard.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {/* Top 3 podium */}
        {ranked.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-end justify-center gap-3">
              {/* 2nd */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="text-2xl">🥈</div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-2xl shadow-md">
                  {(ranked[1]?.display_name || '?')[0].toUpperCase()}
                </div>
                <div className="text-xs font-black text-slate-700 dark:text-slate-200 text-center truncate w-full">{ranked[1]?.display_name || 'Player'}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{ranked[1]?.total_xp || 0} XP</div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-t-lg" style={{ height: '60px' }} />
              </div>
              {/* 1st */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="text-3xl">🥇</div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-3xl shadow-lg border-4 border-amber-300">
                  {(ranked[0]?.display_name || '?')[0].toUpperCase()}
                </div>
                <div className="text-sm font-black text-slate-800 dark:text-slate-100 text-center truncate w-full">{ranked[0]?.display_name || 'Player'}</div>
                <div className="text-xs font-bold text-amber-600">{ranked[0]?.total_xp || 0} XP</div>
                <div className="w-full bg-amber-200 rounded-t-lg" style={{ height: '80px' }} />
              </div>
              {/* 3rd */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="text-2xl">🥉</div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 flex items-center justify-center text-2xl shadow-md">
                  {(ranked[2]?.display_name || '?')[0].toUpperCase()}
                </div>
                <div className="text-xs font-black text-slate-700 dark:text-slate-200 text-center truncate w-full">{ranked[2]?.display_name || 'Player'}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{ranked[2]?.total_xp || 0} XP</div>
                <div className="w-full bg-orange-200 dark:bg-orange-900/40 rounded-t-lg" style={{ height: '40px' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* My rank highlight + share */}
        {myRank && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl font-black">#{myRank.rank}</div>
              <div className="flex-1">
                <div className="font-black">{t('leaderboard.you')} · {myRank.display_name || 'Champion'}</div>
                <div className="text-white/80 text-sm">{myRank.total_xp || 0} XP</div>
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                <Share2 className="w-3.5 h-3.5" /> {t('leaderboard.share')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Full list */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-black text-slate-800 dark:text-slate-100">{t('leaderboard.allPlayers')}</h2>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-700">
            {ranked.map((p, i) => {
              const isMe = p.created_by === currentUser?.email;
              const { current: lvl } = getLevel(p.total_xp || 0);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'} transition-colors`}
                >
                  <div className="w-8 flex-shrink-0 flex justify-center">
                    <RankIcon rank={p.rank} />
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black shadow-sm flex-shrink-0 ${
                    p.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' :
                    p.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400' :
                    p.rank === 3 ? 'bg-gradient-to-br from-orange-300 to-amber-400' :
                    'bg-gradient-to-br from-indigo-100 to-purple-100'
                  } text-slate-700`}>
                    {(p.display_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-black text-sm ${isMe ? 'text-purple-700 dark:text-purple-400' : 'text-slate-800 dark:text-slate-100'} truncate`}>
                      {p.display_name || t('leaderboard.defaultName')} {isMe && `(${t('leaderboard.you')})`}
                    </div>
                    <div className="text-xs font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5" style={{ backgroundColor: lvl.color + '20', color: lvl.color }}>
                      Lv.{lvl.level} {lvl.name}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-sm text-amber-600 dark:text-amber-400">{p.total_xp || 0}</div>
                    <div className="text-xs text-slate-400">XP</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {ranked.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">🏆</div>
              <div className="font-semibold">{t('leaderboard.beFirst')}</div>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <ShareAchievementModal
            profile={myRank}
            rank={myRank?.rank}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}