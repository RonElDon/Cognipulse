import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BadgeChip from './BadgeChip';
import { ALL_BADGES, BADGE_TIERS } from '@/lib/badges';
import { DOMAINS } from '@/lib/exercises';
import { useLanguage } from '@/lib/LanguageContext';

const TIER_ORDER = ['bronze', 'silver', 'gold', 'platin', 'diamond', 'master', 'legend'];

export default function BadgeCollection({ earnedIds = new Set(), results = [] }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');
  const [filterTier, setFilterTier] = useState('all');

  const TABS = [
    { id: 'all',       label: t('progress.badgeAll'),       icon: '🏅' },
    { id: 'xp',        label: t('progress.badgeSynapses'),  icon: '⚡' },
    { id: 'exercises', label: t('progress.badgeDiligence'), icon: '💪' },
    { id: 'streak',    label: t('progress.badgeRhythm'),    icon: '🔥' },
    { id: 'domain',    label: t('progress.badgeDomains'),   icon: '🧠' },
    { id: 'special',   label: t('progress.badgeSpecial'),   icon: '🌟' },
  ];

  const totalCount = ALL_BADGES.length;
  const earnedCount = ALL_BADGES.filter(b => earnedIds.has(b.id)).length;
  const pct = Math.round((earnedCount / totalCount) * 100);

  const filtered = useMemo(() => {
    let list = ALL_BADGES;
    if (activeTab !== 'all') list = list.filter(b => b.category === activeTab);
    if (filterTier !== 'all') list = list.filter(b => b.tier === filterTier);
    // Sort: earned first, then by tier
    return [...list].sort((a, b) => {
      const ae = earnedIds.has(a.id) ? 0 : 1;
      const be = earnedIds.has(b.id) ? 0 : 1;
      if (ae !== be) return ae - be;
      return TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier);
    });
  }, [activeTab, filterTier, earnedIds]);

  // Domain sub-tabs for the domain tab
  const domainKeys = ['attention', 'memory', 'executive', 'visuomotor', 'processing', 'reasoning'];
  const [activeDomain, setActiveDomain] = useState('all');

  const displayList = useMemo(() => {
    if (activeTab === 'domain' && activeDomain !== 'all') {
      return filtered.filter(b => b.domainId === activeDomain);
    }
    return filtered;
  }, [filtered, activeTab, activeDomain]);

  return (
    <div className="space-y-5">
      {/* Collection Ring */}
      <div className="flex items-center gap-5 bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-xl">
        {/* SVG ring */}
        <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
          <svg viewBox="0 0 80 80" width="80" height="80" className="rotate-[-90deg]">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="url(#ringGrad)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%"   stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-black text-slate-800 dark:text-slate-100 leading-none">{pct}%</span>
          </div>
        </div>
        <div>
          <div className="text-xl font-black text-slate-800 dark:text-slate-100">
            {t('progress.badgeCollection')} <span className="text-purple-600 dark:text-purple-400">{earnedCount}</span>
            <span className="text-slate-400"> / {totalCount}</span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('progress.badgeUnlocked')}</div>
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {TIER_ORDER.filter(tier => tier !== 'legend').map(tier => {
              const cnt = ALL_BADGES.filter(b => b.tier === tier && earnedIds.has(b.id)).length;
              if (cnt === 0) return null;
              return (
                <span key={tier} className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: BADGE_TIERS[tier]?.color + '25', color: BADGE_TIERS[tier]?.color }}>
                  {cnt} {BADGE_TIERS[tier]?.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setActiveDomain('all'); }}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200 dark:shadow-purple-900'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Domain sub-filter */}
      {activeTab === 'domain' && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveDomain('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeDomain === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >{t('progress.badgeAll')}</button>
          {domainKeys.map(dk => {
            const d = DOMAINS[dk];
            return (
              <button key={dk} onClick={() => setActiveDomain(dk)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeDomain === dk ? 'text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
                style={activeDomain === dk ? { backgroundColor: d.color } : {}}>
                {d.icon} {d.nameDE || d.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Tier filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setFilterTier('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            filterTier === 'all' ? 'bg-slate-700 text-white border-transparent' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
          }`}
        >{t('progress.badgeAllLevels')}</button>
        {TIER_ORDER.map(tier => (
          <button
            key={tier}
            onClick={() => setFilterTier(tier === filterTier ? 'all' : tier)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all"
            style={{
              borderColor: filterTier === tier ? BADGE_TIERS[tier]?.color : 'transparent',
              background: filterTier === tier ? BADGE_TIERS[tier]?.color + '22' : undefined,
              color: BADGE_TIERS[tier]?.color,
              ...(filterTier !== tier ? { background: '#1e293b44' } : {}),
            }}
          >
            {BADGE_TIERS[tier]?.label}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
        <AnimatePresence mode="popLayout">
          {displayList.map((badge, i) => {
            const isEarned = earnedIds.has(badge.id);
            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25, delay: i * 0.015 }}
                className="flex flex-col items-center gap-1"
              >
                <BadgeChip badge={badge} earned={isEarned} size={64} />
                <div className="text-center leading-tight" style={{ width: 64 }}>
                  <div className="text-xs font-bold truncate"
                    style={{ color: isEarned ? BADGE_TIERS[badge.tier]?.color : '#64748b', fontSize: 9 }}>
                    {badge.title}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {displayList.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm">
          {t('progress.badgeNone')}
        </div>
      )}
    </div>
  );
}