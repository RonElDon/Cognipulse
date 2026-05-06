import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { EXERCISES, DOMAINS } from '@/lib/exercises';
import { ArrowLeft, Trophy, Zap, RefreshCw, Home } from 'lucide-react';

// ============ Mini-games ============

function AttentionGame({ onComplete, level }) {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [reactions, setReactions] = useState([]);
  const gameRef = useRef(null);
  const intervalRef = useRef(null);

  const spawnTarget = useCallback(() => {
    const id = Date.now();
    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    setTargets(t => [...t, { id, x, y }]);
    setTimeout(() => {
      setTargets(t => {
        const exists = t.find(tt => tt.id === id);
        if (exists) { setMissed(m => m + 1); }
        return t.filter(tt => tt.id !== id);
      });
    }, Math.max(1500 - level * 200, 800));
  }, [level]);

  useEffect(() => {
    const spawnInterval = setInterval(spawnTarget, Math.max(1200 - level * 100, 600));
    const timer = setInterval(() => setTimeLeft(t => {
      if (t <= 1) {
        clearInterval(spawnInterval);
        clearInterval(timer);
        const total = score + missed;
        const acc = total > 0 ? Math.round((score / total) * 100) : 0;
        const avgReaction = reactions.length > 0 ? Math.round(reactions.reduce((a, b) => a + b) / reactions.length) : 999;
        setTimeout(() => onComplete({ score: acc, accuracy: acc, reaction_time_ms: avgReaction }), 300);
        return 0;
      }
      return t - 1;
    }), 1000);
    return () => { clearInterval(spawnInterval); clearInterval(timer); };
  }, [spawnTarget, score, missed, reactions]);

  const handleTap = (id, spawnTime) => {
    const rt = Date.now() - spawnTime;
    setReactions(r => [...r, rt]);
    setScore(s => s + 1);
    setTargets(t => t.filter(tt => tt.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-bold text-slate-600">⏱ {timeLeft}s</div>
        <div className="text-sm font-bold text-amber-600">✓ {score} hits</div>
        <div className="text-sm font-bold text-red-400">✗ {missed} missed</div>
      </div>
      <div ref={gameRef} className="relative bg-slate-100 rounded-2xl overflow-hidden" style={{ height: '350px' }}>
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-semibold">
          Kreise antippen!
        </div>
        {targets.map(t => (
          <button
            key={t.id}
            onClick={() => handleTap(t.id, t.id)}
            className="absolute w-14 h-14 rounded-full bg-amber-400 border-4 border-amber-500 shadow-lg hover:scale-110 transition-transform pop-in flex items-center justify-center text-xl"
            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            🎯
          </button>
        ))}
      </div>
    </div>
  );
}

function MemoryGame({ onComplete, level }) {
  const gridSize = 4 + level;
  const totalCards = gridSize;
  const pairs = Math.floor(totalCards / 2);
  const emojis = ['🍎','🌟','🎸','🐬','🌈','🎯','🦁','🌸','🎲','🚀','🍕','🎭','🦋','🌙','🔮','⚡'];
  const [cards, setCards] = useState(() => {
    const selected = emojis.slice(0, pairs);
    const deck = [...selected, ...selected].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
    return deck;
  });
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [startTime] = useState(Date.now());

  const handleFlip = (card) => {
    if (flipped.length === 2 || card.flipped || card.matched) return;
    const newFlipped = [...flipped, card.id];
    setCards(c => c.map(cc => cc.id === card.id ? { ...cc, flipped: true } : cc));
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id));
      if (a.emoji === b.emoji) {
        setCards(c => c.map(cc => newFlipped.includes(cc.id) ? { ...cc, matched: true } : cc));
        setMatchCount(m => {
          const newM = m + 1;
          if (newM === pairs) {
            const elapsed = (Date.now() - startTime) / 1000;
            const acc = Math.max(0, Math.round(100 - (moves / pairs) * 10));
            setTimeout(() => onComplete({ score: acc, accuracy: acc, reaction_time_ms: Math.round(elapsed * 1000 / pairs) }), 500);
          }
          return newM;
        });
        setFlipped([]);
      } else {
        setTimeout(() => {
          setCards(c => c.map(cc => newFlipped.includes(cc.id) ? { ...cc, flipped: false } : cc));
          setFlipped([]);
        }, 800);
      }
    } else {
      setFlipped(newFlipped);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-bold text-slate-600">
      <span>🎯 {matchCount}/{pairs} gefunden</span>
      <span>🔄 {moves} Züge</span>
      </div>
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(totalCards))}, 1fr)` }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleFlip(card)}
            className={`aspect-square rounded-xl text-2xl flex items-center justify-center font-bold transition-all duration-300 ${
              card.matched ? 'bg-emerald-100 border-2 border-emerald-400 scale-95' :
              card.flipped ? 'bg-indigo-100 border-2 border-indigo-400' :
              'bg-indigo-500 hover:bg-indigo-600 text-transparent shadow-md hover:scale-105'
            }`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReactionGame({ onComplete, level }) {
  const [phase, setPhase] = useState('waiting'); // waiting, ready, go, result
  const [reactions, setReactions] = useState([]);
  const [round, setRound] = useState(0);
  const totalRounds = 5;
  const startRef = useRef(null);
  const timerRef = useRef(null);

  const startRound = useCallback(() => {
    setPhase('waiting');
    const delay = 1500 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      setPhase('go');
      startRef.current = Date.now();
    }, delay);
  }, []);

  useEffect(() => { startRound(); return () => clearTimeout(timerRef.current); }, []);

  const handleTap = () => {
    if (phase === 'waiting') {
      clearTimeout(timerRef.current);
      setPhase('tooEarly');
      setTimeout(() => startRound(), 1500);
      return;
    }
    if (phase === 'go') {
      const rt = Date.now() - startRef.current;
      const newReactions = [...reactions, rt];
      setReactions(newReactions);
      const newRound = round + 1;
      setRound(newRound);
      if (newRound >= totalRounds) {
        const avg = Math.round(newReactions.reduce((a, b) => a + b) / newReactions.length);
        const score = Math.max(0, Math.round(100 - (avg - 200) / 5));
        setPhase('result');
        setTimeout(() => onComplete({ score: Math.min(100, score), accuracy: 100, reaction_time_ms: avg }), 800);
      } else {
        setPhase('hit');
        setTimeout(() => startRound(), 800);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm font-bold text-slate-600">Runde {Math.min(round + 1, totalRounds)} von {totalRounds}</div>
      {reactions.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {reactions.map((r, i) => (
            <span key={i} className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full font-bold">{r}ms</span>
          ))}
        </div>
      )}
      <button
        onClick={handleTap}
        className={`w-full rounded-3xl flex flex-col items-center justify-center gap-3 transition-all duration-200 active:scale-95 ${
          phase === 'go' ? 'bg-emerald-400 h-56 shadow-xl shadow-emerald-200' :
          phase === 'waiting' ? 'bg-slate-200 h-56' :
          phase === 'tooEarly' ? 'bg-red-200 h-56' :
          phase === 'hit' ? 'bg-cyan-200 h-56' :
          'bg-slate-200 h-56'
        }`}
      >
        <div className="text-5xl">
          {phase === 'go' ? '⚡' : phase === 'waiting' ? '⏳' : phase === 'tooEarly' ? '❌' : phase === 'hit' ? '✅' : '🏁'}
        </div>
        <div className="text-xl font-black text-slate-700">
          {phase === 'go' ? 'JETZT TIPPEN!' : phase === 'waiting' ? 'Warten...' : phase === 'tooEarly' ? 'Zu früh!' : phase === 'hit' ? 'Super!' : 'Fertig!'}
        </div>
      </button>
    </div>
  );
}

function PatternGame({ onComplete, level }) {
  const patternLength = 3 + level;
  const options = ['🔴','🔵','🟡','🟢'];
  const [pattern] = useState(() => Array.from({ length: patternLength }, () => options[Math.floor(Math.random() * options.length)]));
  const [userInput, setUserInput] = useState([]);
  const [showPattern, setShowPattern] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const t = setTimeout(() => setShowPattern(false), 2000 + level * 500);
    return () => clearTimeout(t);
  }, []);

  const handleInput = (emoji) => {
    const newInput = [...userInput, emoji];
    setUserInput(newInput);
    if (newInput.length === pattern.length) {
      const correct = newInput.filter((e, i) => e === pattern[i]).length;
      const acc = Math.round((correct / pattern.length) * 100);
      const elapsed = Date.now() - startTime;
      setTimeout(() => onComplete({ score: acc, accuracy: acc, reaction_time_ms: elapsed }), 300);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-2xl p-5 min-h-24">
        {showPattern ? (
          <div>
            <p className="text-sm font-bold text-slate-500 mb-3 text-center">Muster einprägen:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {pattern.map((e, i) => <span key={i} className="text-3xl">{e}</span>)}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-bold text-slate-500 mb-3 text-center">Muster wiederholen ({userInput.length}/{pattern.length}):</p>
            <div className="flex gap-2 justify-center flex-wrap min-h-10">
              {userInput.map((e, i) => <span key={i} className="text-3xl">{e}</span>)}
              {Array.from({ length: pattern.length - userInput.length }).map((_, i) => (
                <span key={i} className="text-3xl opacity-30">⬜</span>
              ))}
            </div>
          </div>
        )}
      </div>
      {!showPattern && (
        <div className="grid grid-cols-2 gap-3">
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => handleInput(opt)}
              className="text-4xl py-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const GAME_COMPONENTS = {
  att_1: AttentionGame, att_2: AttentionGame, att_3: AttentionGame, att_4: AttentionGame,
  mem_1: MemoryGame, mem_2: PatternGame, mem_3: PatternGame, mem_4: PatternGame,
  exe_1: ReactionGame, exe_2: ReactionGame, exe_3: PatternGame, exe_4: ReactionGame,
  vis_1: AttentionGame, vis_2: AttentionGame, vis_3: AttentionGame, vis_4: AttentionGame,
  pro_1: ReactionGame, pro_2: ReactionGame, pro_3: ReactionGame, pro_4: ReactionGame,
  rea_1: PatternGame, rea_2: PatternGame, rea_3: PatternGame, rea_4: PatternGame,
};

export default function Exercise() {
  const { id } = useParams();
  const navigate = useNavigate();
  const exercise = EXERCISES.find(e => e.id === id);
  const [phase, setPhase] = useState('intro'); // intro, playing, result
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [level, setLevel] = useState(exercise?.difficulty || 1);

  if (!exercise) return <div className="p-8 text-center text-slate-500">Übung nicht gefunden</div>;

  const domain = DOMAINS[exercise.domain];
  const GameComponent = GAME_COMPONENTS[id];

  const handleComplete = async (gameResult) => {
    setResult(gameResult);
    setPhase('result');
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.ExerciseResult.create({
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        domain: exercise.domain,
        score: gameResult.score,
        accuracy: gameResult.accuracy,
        reaction_time_ms: gameResult.reaction_time_ms,
        level,
        xp_earned: Math.round(exercise.xpReward * (gameResult.score / 100)),
        duration_seconds: 30,
        completed: true,
      });
      // Update profile XP
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        const p = profiles[0];
        await base44.entities.UserProfile.update(p.id, {
          total_xp: (p.total_xp || 0) + Math.round(exercise.xpReward * (gameResult.score / 100)),
        });
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className={`${domain.gradient} px-4 pt-6 pb-8`}>
        <div className="max-w-lg mx-auto">
          <button onClick={() => navigate('/train')} className="flex items-center gap-2 text-white/80 hover:text-white mb-4 font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
              {exercise.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{exercise.name}</h1>
              <p className="text-white/80 text-sm">{exercise.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-white/90 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">{domain.name}</span>
                <span className="text-white/90 text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">+{exercise.xpReward} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100">
          <AnimatePresence mode="wait">
            {phase === 'intro' && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4 space-y-5">
                <div className="text-6xl">{exercise.icon}</div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">{exercise.name}</h2>
                  <p className="text-slate-500 mt-2">{exercise.description}</p>
                </div>
                <div className="flex justify-center gap-3">
                  {[1, 2, 3].map(l => (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                        level === l ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600'
                      }`}
                      style={level === l ? { backgroundColor: domain.color } : {}}
                    >
                      {l === 1 ? '😊 Leicht' : l === 2 ? '😤 Mittel' : '🔥 Schwer'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPhase('playing')}
                  className={`w-full py-4 rounded-2xl text-white font-black text-lg shadow-lg transition-transform hover:scale-105 active:scale-95 ${domain.gradient}`}
                >
                  Übung starten! 🚀
                </button>
              </motion.div>
            )}

            {phase === 'playing' && GameComponent && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GameComponent onComplete={handleComplete} level={level} />
              </motion.div>
            )}

            {phase === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-5">
                <div className="text-6xl">
                  {result.score >= 80 ? '🏆' : result.score >= 60 ? '🌟' : result.score >= 40 ? '👍' : '💪'}
                </div>
                <div>
                  <div className="text-4xl font-black" style={{ color: domain.color }}>{result.score}%</div>
                  <div className="text-slate-500 text-sm font-semibold mt-1">
                    {result.score >= 80 ? 'Ausgezeichnet!' : result.score >= 60 ? 'Gute Arbeit!' : result.score >= 40 ? 'Weiter so!' : 'Übung macht den Meister!'}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Ergebnis', value: `${result.score}%`, icon: '🎯' },
                    { label: 'Genauigkeit', value: `${result.accuracy}%`, icon: '✅' },
                    { label: 'XP erhalten', value: `+${Math.round(exercise.xpReward * result.score / 100)}`, icon: '⚡' },
                  ].map(s => (
                    <div key={s.label} className="bg-slate-50 rounded-2xl p-3">
                      <div className="text-lg">{s.icon}</div>
                      <div className="font-black text-slate-800 text-sm">{s.value}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
                {saving && <div className="text-xs text-slate-400 font-medium">Ergebnisse werden gespeichert...</div>}
                <div className="flex gap-3">
                  <button
                    onClick={() => { setPhase('intro'); setResult(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> Nochmal
                  </button>
                  <button
                    onClick={() => navigate('/train')}
                    className={`flex-1 py-3 rounded-2xl text-white font-bold ${domain.gradient} shadow-md`}
                  >
                    Nächste Übung →
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}