import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Wand2, Zap, RotateCcw } from 'lucide-react';
import { useProfile } from '@/lib/useProfile';
import { useLanguage } from '@/lib/LanguageContext';
import { ALL_BADGES } from '@/lib/badges';
import { toast } from 'sonner';

export default function DeveloperModeOverlay({ isOpen, onClose }) {
  const { profile, loading } = useProfile();
  const { t } = useLanguage();
  const [loadingAction, setLoadingAction] = useState(false);
  const allBadgeIds = ALL_BADGES.map(b => b.id);
  const currentBadges = profile?.badges || [];
  const unlockedBadges = allBadgeIds.filter(id => currentBadges.includes(id));
  const nextBadgeIdx = unlockedBadges.length < allBadgeIds.length ? unlockedBadges.length : -1;

  const handleUnlockNextBadge = async () => {
    if (nextBadgeIdx === -1) {
      toast.error(t('devMode.unlockAllBadges'));
      return;
    }
    setLoadingAction(true);
    try {
      const nextBadgeId = allBadgeIds[nextBadgeIdx];
      await base44.entities.UserProfile.update(profile.id, {
        badges: [...currentBadges, nextBadgeId]
      });
      toast.success(t('devMode.unlockSuccess', { id: nextBadgeId }));
    } catch (err) {
      toast.error(t('devMode.unlockError'));
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLockLastBadge = async () => {
    if (unlockedBadges.length === 0) {
      toast.error(t('devMode.noLockBadges'));
      return;
    }
    setLoadingAction(true);
    try {
      const lastBadgeId = unlockedBadges[unlockedBadges.length - 1];
      const updatedBadges = currentBadges.filter(id => id !== lastBadgeId);
      await base44.entities.UserProfile.update(profile.id, {
        badges: updatedBadges
      });
      toast.success(t('devMode.lockSuccess', { id: lastBadgeId }));
    } catch (err) {
      toast.error(t('devMode.lockError'));
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleGrantUnlimitedRewards = async () => {
    setLoadingAction(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        current_coins: 999999,
        total_xp: 99999
      });
      toast.success(`∞ ${t('devMode.grantResources')}`);
    } catch (err) {
      toast.error(t('devMode.grantError'));
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetOnboarding = async () => {
    setLoadingAction(true);
    try {
      await base44.entities.UserProfile.update(profile.id, {
        onboarding_completed: false
      });
      toast.success(t('devMode.resetOnboarding'));
      // Redirect nach kurzer Verzögerung
      setTimeout(() => {
        window.location.href = '/';
      }, 800);
    } catch (err) {
      toast.error(t('devMode.resetError'));
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-purple-200 dark:border-purple-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                🔧 {t('devMode.onboardingTitle')}
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Badges Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                  <Wand2 className="w-4 h-4 text-purple-600" />
                  {t('devMode.wizardBadge')}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  {t('devMode.unlockedCount')}: {unlockedBadges.length}/{allBadgeIds.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUnlockNextBadge}
                    disabled={loadingAction || nextBadgeIdx === -1}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all"
                  >
                    {t('devMode.unlockBtn')}
                  </button>
                  <button
                    onClick={handleLockLastBadge}
                    disabled={loadingAction || unlockedBadges.length === 0}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all"
                  >
                    {t('devMode.lockBtn')}
                  </button>
                </div>
              </div>

              {/* XP & Coins Section */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  {t('devMode.unlimitedResources')}
                </div>
                <button
                  onClick={handleGrantUnlimitedRewards}
                  disabled={loadingAction}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all"
                >
                  {t('devMode.grantResources')}
                </button>
              </div>

              {/* Onboarding Section */}
              <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  {t('devMode.onboardingTitle')}
                </div>
                <button
                  onClick={handleResetOnboarding}
                  disabled={loadingAction}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-xl text-sm transition-all"
                >
                  {t('devMode.resetOnboarding')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}