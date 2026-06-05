import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Wand2, Zap, RotateCcw, Minus, Sparkles, Lock, GripVertical, SkipForward } from 'lucide-react';
import { useProfile } from '@/lib/useProfile';
import { useLanguage } from '@/lib/LanguageContext';
import { useWand } from '@/lib/WandContext';
import { useDeveloperMode } from '@/lib/DeveloperModeContext';
import { ALL_BADGES } from '@/lib/badges';
import { toast } from 'sonner';

export default function DraggableDeveloperMenu() {
  const { isDeveloperModeActive, isMenuOpen, openMenu, closeMenu, deactivateDeveloperMode, menuPosition, setMenuPosition } = useDeveloperMode();
  const { profile, loading } = useProfile();
  const { t } = useLanguage();
  const { wandActive, setWandActive } = useWand();
  const [loadingAction, setLoadingAction] = useState(false);

  const allBadgeIds = ALL_BADGES.map(b => b.id);
  const currentBadges = profile?.badges || [];
  const unlockedBadges = allBadgeIds.filter(id => currentBadges.includes(id));
  const nextBadgeIdx = unlockedBadges.length < allBadgeIds.length ? unlockedBadges.length : -1;

  const handleUnlockNextBadge = async () => {
    if (nextBadgeIdx === -1) { toast.error(t('devMode.unlockAllBadges')); return; }
    setLoadingAction(true);
    try {
      const nextBadgeId = allBadgeIds[nextBadgeIdx];
      await base44.entities.UserProfile.update(profile.id, { badges: [...currentBadges, nextBadgeId] });
      toast.success(t('devMode.unlockSuccess', { id: nextBadgeId }));
    } catch (err) {
      toast.error(t('devMode.unlockError'));
      console.error(err);
    } finally { setLoadingAction(false); }
  };

  const handleLockLastBadge = async () => {
    if (unlockedBadges.length === 0) { toast.error(t('devMode.noLockBadges')); return; }
    setLoadingAction(true);
    try {
      const lastBadgeId = unlockedBadges[unlockedBadges.length - 1];
      await base44.entities.UserProfile.update(profile.id, { badges: currentBadges.filter(id => id !== lastBadgeId) });
      toast.success(t('devMode.lockSuccess', { id: lastBadgeId }));
    } catch (err) {
      toast.error(t('devMode.lockError'));
      console.error(err);
    } finally { setLoadingAction(false); }
  };

  const handleGrantUnlimitedRewards = async () => {
    setLoadingAction(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { current_coins: 999999, total_xp: 99999 });
      toast.success(`∞ ${t('devMode.grantResources')}`);
    } catch (err) {
      toast.error(t('devMode.grantError'));
      console.error(err);
    } finally { setLoadingAction(false); }
  };

  const handleSkipOnboarding = async () => {
    setLoadingAction(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { onboarding_completed: true });
      toast.success(t('devMode.skipOnboarding'));
      setTimeout(() => { window.location.href = '/'; }, 800);
    } catch (err) {
      toast.error(t('devMode.resetError'));
      console.error(err);
    } finally { setLoadingAction(false); }
  };

  const handleResetOnboarding = async () => {
    setLoadingAction(true);
    try {
      await base44.entities.UserProfile.update(profile.id, { onboarding_completed: false });
      toast.success(t('devMode.resetOnboarding'));
      setTimeout(() => { window.location.href = '/'; }, 800);
    } catch (err) {
      toast.error(t('devMode.resetError'));
      console.error(err);
    } finally { setLoadingAction(false); }
  };

  const handleToggleWand = () => {
    const next = !wandActive;
    setWandActive(next);
    if (next) toast.success(t('devMode.wandActivated'), { duration: 3000 });
    else toast.info(t('devMode.wandDeactivated'), { duration: 2000 });
  };

  // When the wand is active and the menu is minimized, tapping the chip turns the wand OFF
  // so the user can always exit wand mode. Otherwise it just opens the menu.
  const handleChipClick = () => {
    if (wandActive) {
      setWandActive(false);
      toast.info(t('devMode.wandDeactivated'), { duration: 2000 });
    } else {
      openMenu();
    }
  };

  const handleClose = () => {
    setWandActive(false);
    deactivateDeveloperMode();
  };

  if (!isDeveloperModeActive || loading || !profile) return null;

  // Minimized floating chip
  if (!isMenuOpen) {
    return (
      <motion.button
        drag
        dragMomentum={false}
        initial={{ scale: 0.8, opacity: 0, x: menuPosition.x, y: menuPosition.y }}
        animate={{ scale: 1, opacity: 1, x: menuPosition.x, y: menuPosition.y }}
        onDragEnd={(_, info) => setMenuPosition({ x: menuPosition.x + info.offset.x, y: menuPosition.y + info.offset.y })}
        onClick={handleChipClick}
        className={`fixed bottom-28 left-4 z-[9998] flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl font-black text-white text-sm cursor-grab active:cursor-grabbing ${
          wandActive ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 wand-target' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
        }`}
      >
        {wandActive ? <X className="w-4 h-4" /> : <span>🔧</span>}
        {wandActive ? t('devMode.wandExit') : t('devMode.expand')}
      </motion.button>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ scale: 0.9, opacity: 0, x: menuPosition.x, y: menuPosition.y }}
      animate={{ scale: 1, opacity: 1, x: menuPosition.x, y: menuPosition.y }}
      onDragEnd={(_, info) => setMenuPosition({ x: menuPosition.x + info.offset.x, y: menuPosition.y + info.offset.y })}
      className="fixed bottom-28 left-4 z-[9998] w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-800 overflow-hidden"
    >
      {/* Header — drag handle */}
      <div
        className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
      >
        <h2 className="text-base font-black text-white flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-white/70" />
          🔧 {t('devMode.onboardingTitle')}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={closeMenu} className="text-white/80 hover:text-white transition-colors p-1" title={t('devMode.minimize')}>
            <Minus className="w-5 h-5" />
          </button>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Fortschritts-Zauberstab */}
        <div className="space-y-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-3 border border-emerald-200 dark:border-emerald-900">
          <div className="flex items-center gap-2 text-sm font-black text-emerald-700 dark:text-emerald-300">
            <Sparkles className="w-4 h-4" />
            {t('devMode.progressWand')}
          </div>
          <button
            onClick={handleToggleWand}
            className={`w-full font-bold py-2.5 px-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 text-white ${
              wandActive ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {wandActive ? t('devMode.wandOn') : t('devMode.wandOff')}
          </button>
          <button
            onClick={handleUnlockNextBadge}
            disabled={loadingAction || nextBadgeIdx === -1}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" /> {t('devMode.unlockBtn')}
          </button>
          <button
            onClick={handleGrantUnlimitedRewards}
            disabled={loadingAction}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> {t('devMode.grantResources')}
          </button>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t('devMode.unlockedCount')}: {unlockedBadges.length}/{allBadgeIds.length}
          </div>
        </div>

        {/* Reset-Zauberstab */}
        <div className="space-y-2 bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-3 border border-rose-200 dark:border-rose-900">
          <div className="flex items-center gap-2 text-sm font-black text-rose-700 dark:text-rose-300">
            <RotateCcw className="w-4 h-4" />
            {t('devMode.resetWand')}
          </div>
          <button
            onClick={handleLockLastBadge}
            disabled={loadingAction || unlockedBadges.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" /> {t('devMode.lockBtn')}
          </button>
          <button
            onClick={handleSkipOnboarding}
            disabled={loadingAction}
            className="w-full bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <SkipForward className="w-4 h-4" /> {t('devMode.skipOnboarding')}
          </button>
          <button
            onClick={handleResetOnboarding}
            disabled={loadingAction}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> {t('devMode.resetOnboarding')}
          </button>
        </div>
      </div>
    </motion.div>
  );
}