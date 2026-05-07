import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, X, Swords } from 'lucide-react';
import { EXERCISES } from '@/lib/exercises';

const SHARE_PLATFORMS = [
  {
    id: 'twitter',
    label: 'X / Twitter',
    icon: '𝕏',
    color: 'bg-black text-white',
    getUrl: (text) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: '💬',
    color: 'bg-green-500 text-white',
    getUrl: (text) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    icon: '✈️',
    color: 'bg-sky-500 text-white',
    getUrl: (text) => `https://t.me/share/url?url=https://brainboost.app&text=${encodeURIComponent(text)}`,
  },
];

export function ShareAchievementModal({ profile, rank, onClose }) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('share'); // 'share' | 'challenge'
  const [selectedExercise, setSelectedExercise] = useState(EXERCISES[0]?.id || '');
  const [challengeCopied, setChallengeCopied] = useState(false);

  const xp = profile?.total_xp || 0;
  const name = profile?.display_name || 'Ich';

  const shareText = rank
    ? `🧠 Ich bin auf Platz #${rank} bei BrainBoost mit ${xp} XP! Kannst du mich schlagen? 💪 #BrainBoost #Gehirntraining`
    : `🧠 Ich habe ${xp} XP bei BrainBoost gesammelt! Trainiere deinen Geist mit mir! 💪 #BrainBoost`;

  const challengedExercise = EXERCISES.find(e => e.id === selectedExercise);
  const challengeText = `💪 ${name} fordert dich heraus: Versuche "${challengedExercise?.name}" bei BrainBoost und schlag meinen Score! 🧠 #BrainBoost #Challenge`;

  const handleCopy = async (text, setter) => {
    await navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 md:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-5 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-5 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1">
          <button
            onClick={() => setMode('share')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'share' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-slate-100' : 'text-slate-500'}`}
          >
            <Share2 className="w-3.5 h-3.5" /> Teilen
          </button>
          <button
            onClick={() => setMode('challenge')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-bold transition-all ${mode === 'challenge' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-slate-100' : 'text-slate-500'}`}
          >
            <Swords className="w-3.5 h-3.5" /> Herausfordern
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'share' ? (
            <motion.div key="share" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
              <div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200 mb-1">Dein Erfolg</div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 border border-purple-100 dark:border-slate-600">
                  <div className="text-2xl mb-1">🧠</div>
                  <div className="font-black text-slate-800 dark:text-slate-100">{name}</div>
                  {rank && <div className="text-sm text-purple-600 font-bold">Platz #{rank} · {xp} XP</div>}
                </div>
              </div>

              <div className="space-y-2">
                {SHARE_PLATFORMS.map(p => (
                  <a
                    key={p.id}
                    href={p.getUrl(shareText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 ${p.color}`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    {p.label}
                  </a>
                ))}
                <button
                  onClick={() => handleCopy(shareText, setCopied)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Kopiert!' : 'Text kopieren'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="challenge" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200 mb-2">Übung wählen</div>
                <select
                  value={selectedExercise}
                  onChange={e => setSelectedExercise(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {EXERCISES.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.icon} {ex.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3 text-xs font-semibold text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800">
                💪 {challengeText}
              </div>

              <div className="space-y-2">
                {SHARE_PLATFORMS.map(p => (
                  <a
                    key={p.id}
                    href={p.getUrl(challengeText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 ${p.color}`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    Via {p.label} herausfordern
                  </a>
                ))}
                <button
                  onClick={() => handleCopy(challengeText, setChallengeCopied)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                >
                  {challengeCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {challengeCopied ? 'Kopiert!' : 'Link kopieren'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}