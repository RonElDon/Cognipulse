import { motion } from 'framer-motion';
import { DOMAINS } from '@/lib/exercises';
import { Swords, Trophy, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

const STATUS_CONFIG = {
  open: { label: 'Warte auf Gegner', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20', icon: Clock },
  accepted: { label: 'Läuft', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', icon: Swords },
  completed: { label: 'Beendet', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', icon: CheckCircle2 },
  expired: { label: 'Abgelaufen', color: 'text-slate-400', bg: 'bg-slate-50 dark:bg-slate-800', icon: XCircle },
};

export default function DuelCard({ duel, currentUserEmail, onPlay, onRefresh }) {
  const domain = DOMAINS[duel.domain];
  const status = STATUS_CONFIG[duel.status] || STATUS_CONFIG.open;
  const StatusIcon = status.icon;

  const isChallenger = duel.challenger_email === currentUserEmail;
  const myScore = isChallenger ? duel.challenger_score : duel.opponent_score;
  const theirScore = isChallenger ? duel.opponent_score : duel.challenger_score;
  const theirName = isChallenger ? (duel.opponent_name || 'Jemanden') : duel.challenger_name;

  const iWon = duel.status === 'completed' && duel.winner_email === currentUserEmail;
  const iLost = duel.status === 'completed' && duel.winner_email && duel.winner_email !== currentUserEmail;
  const isDraw = duel.status === 'completed' && !duel.winner_email;

  const myTurnPending = duel.status !== 'completed' && myScore == null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden shadow-sm ${
        iWon ? 'border-green-200 dark:border-green-800' :
        iLost ? 'border-red-200 dark:border-red-800' :
        'border-slate-100 dark:border-slate-700'
      } bg-white dark:bg-slate-800`}
    >
      {/* Domain bar */}
      <div className={`${domain?.gradient} px-4 py-2 flex items-center gap-2`}>
        <span className="text-lg">{domain?.icon}</span>
        <span className="text-white font-black text-sm">{duel.exercise_name}</span>
        <div className={`ml-auto flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-black/20 text-white`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
      </div>

      <div className="p-4">
        {/* Scores */}
        <div className="flex items-center gap-3 mb-3">
          {/* Me */}
          <div className="flex-1 text-center">
            <div className="text-xs font-bold text-slate-500 mb-1">Du</div>
            <div className={`text-3xl font-black ${myScore != null ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300'}`}>
              {myScore != null ? `${myScore}%` : '—'}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <Swords className="w-5 h-5 text-rose-400" />
            {duel.status === 'completed' && (
              <div className="text-xs font-black mt-1">
                {iWon ? '🏆 Gewonnen!' : iLost ? '😤 Verloren' : '🤝 Unentschieden'}
              </div>
            )}
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div className="text-xs font-bold text-slate-500 mb-1 truncate">{theirName}</div>
            <div className={`text-3xl font-black ${theirScore != null ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300'}`}>
              {theirScore != null ? `${theirScore}%` : '—'}
            </div>
          </div>
        </div>

        {/* Action */}
        {myTurnPending && (
          <button
            onClick={onPlay}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Swords className="w-4 h-4" />
            {isChallenger ? 'Score spielen' : 'Herausforderung annehmen & spielen!'}
          </button>
        )}

        {duel.status === 'open' && myScore != null && (
          <div className="text-center text-xs text-slate-400 font-semibold py-1">
            ⏳ Warte auf Gegner...
          </div>
        )}
      </div>
    </motion.div>
  );
}