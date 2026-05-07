import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { EXERCISES, DOMAINS } from '@/lib/exercises';
import { Swords, Plus, Trophy, Clock, CheckCircle2, XCircle, ChevronRight, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CreateDuelModal from '@/components/duel/CreateDuelModal';
import DuelCard from '@/components/duel/DuelCard';

export default function Duel() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [myDuels, setMyDuels] = useState([]);
  const [openDuels, setOpenDuels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState('mine'); // 'mine' | 'open'
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const me = await base44.auth.me();
    setUser(me);
    const profiles = await base44.entities.UserProfile.filter({ created_by: me.email });
    setProfile(profiles[0] || null);

    const allDuels = await base44.entities.Duel.list('-created_date', 100);
    const now = new Date();

    // Filter expired
    const active = allDuels.filter(d => !d.expires_at || new Date(d.expires_at) > now || d.status === 'completed');

    setMyDuels(active.filter(d => d.challenger_email === me.email || d.opponent_email === me.email));
    setOpenDuels(active.filter(d => d.status === 'open' && d.challenger_email !== me.email && (!d.opponent_email || d.opponent_email === me.email)));
    setLoading(false);
  };

  const handleAcceptDuel = async (duel) => {
    // Mark as accepted, then navigate to the exercise
    await base44.entities.Duel.update(duel.id, {
      status: 'accepted',
      opponent_email: user.email,
      opponent_name: profile?.display_name || user.full_name,
    });
    navigate(`/exercise/${duel.exercise_id}?duel=${duel.id}&role=opponent`);
  };

  const handlePlayMyDuel = async (duel) => {
    const role = duel.challenger_email === user.email ? 'challenger' : 'opponent';
    navigate(`/exercise/${duel.exercise_id}?duel=${duel.id}&role=${role}`);
  };

  const myPending = myDuels.filter(d => {
    if (d.status === 'completed') return false;
    if (d.challenger_email === user?.email) return d.challenger_score == null;
    return d.opponent_score == null;
  });

  const myCompleted = myDuels.filter(d => d.status === 'completed');

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 px-4 pt-8 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Swords className="w-6 h-6 text-white" />
                <h1 className="text-2xl font-black text-white">Duell-Modus</h1>
              </div>
              <p className="text-white/80 text-sm">Fordere andere Spieler heraus! ⚔️</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2.5 rounded-2xl transition-all"
            >
              <Plus className="w-4 h-4" /> Neues Duell
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-1.5 flex border border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setTab('mine')}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === 'mine' ? 'bg-rose-500 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Meine Duelle {myDuels.length > 0 && `(${myDuels.length})`}
          </button>
          <button
            onClick={() => setTab('open')}
            className={`flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all ${tab === 'open' ? 'bg-rose-500 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
          >
            Offene Herausforderungen {openDuels.length > 0 && `(${openDuels.length})`}
          </button>
        </div>

        {/* Action required */}
        {tab === 'mine' && myPending.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="font-black text-amber-700 dark:text-amber-400 text-sm">Deine Runde! ({myPending.length})</span>
            </div>
            <div className="space-y-2">
              {myPending.map(d => (
                <button key={d.id} onClick={() => handlePlayMyDuel(d)}
                  className="w-full flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-amber-100 dark:border-amber-800 hover:border-amber-300 transition-all text-left"
                >
                  <span className="text-xl">{DOMAINS[d.domain]?.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{d.exercise_name}</div>
                    <div className="text-xs text-slate-500">
                      {d.challenger_email === user?.email ? `vs. ${d.opponent_name || 'Jemanden'}` : `von ${d.challenger_name}`}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-400" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* My duels list */}
        {tab === 'mine' && (
          <div className="space-y-3">
            {myDuels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">⚔️</div>
                <div className="font-black text-slate-600 dark:text-slate-300 text-lg">Noch keine Duelle!</div>
                <p className="text-slate-400 text-sm mt-2">Erstelle ein Duell oder nimm eine Herausforderung an.</p>
                <button onClick={() => setShowCreate(true)} className="mt-4 px-6 py-3 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all">
                  Erstes Duell erstellen
                </button>
              </div>
            ) : (
              myDuels.map(d => (
                <DuelCard key={d.id} duel={d} currentUserEmail={user?.email}
                  onPlay={() => handlePlayMyDuel(d)}
                  onRefresh={loadAll}
                />
              ))
            )}
          </div>
        )}

        {/* Open duels */}
        {tab === 'open' && (
          <div className="space-y-3">
            {openDuels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🏖️</div>
                <div className="font-black text-slate-600 dark:text-slate-300">Keine offenen Herausforderungen</div>
                <p className="text-slate-400 text-sm mt-2">Erstelle eine, damit andere mitspielen können!</p>
              </div>
            ) : (
              openDuels.map(d => (
                <motion.div key={d.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3"
                >
                  <div className={`w-12 h-12 rounded-xl ${DOMAINS[d.domain]?.gradient} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {DOMAINS[d.domain]?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-800 dark:text-slate-100 text-sm">{d.exercise_name}</div>
                    <div className="text-xs text-slate-500">Herausgegeben von <span className="font-bold text-slate-600 dark:text-slate-300">{d.challenger_name || 'Jemanden'}</span></div>
                    <div className="text-xs font-bold mt-0.5" style={{ color: DOMAINS[d.domain]?.color }}>{DOMAINS[d.domain]?.nameDE}</div>
                  </div>
                  <button onClick={() => handleAcceptDuel(d)}
                    className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Swords className="w-3 h-3" /> Annehmen
                  </button>
                </motion.div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button onClick={loadAll} className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Aktualisieren
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCreate && (
          <CreateDuelModal
            user={user}
            profile={profile}
            onClose={() => setShowCreate(false)}
            onCreated={(duelId, exerciseId) => {
              setShowCreate(false);
              loadAll();
              navigate(`/exercise/${exerciseId}?duel=${duelId}&role=challenger`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}