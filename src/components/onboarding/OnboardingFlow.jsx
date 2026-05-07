import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WelcomeScreen from './WelcomeScreen';

const GLOBE_EMOTIONS = {
  happy:    { bg: 'radial-gradient(circle at 38% 32%, #f5d0fe, #a855f7 55%, #6d28d9)', glow: '#a855f7', ringColor: 'rgba(168,85,247,0.4)', y: [-6, 6], dur: 2.6 },
  thinking: { bg: 'radial-gradient(circle at 38% 32%, #bfdbfe, #6366f1 55%, #4338ca)', glow: '#6366f1', ringColor: 'rgba(99,102,241,0.4)', y: [-3, 3], dur: 3.8 },
  excited:  { bg: 'radial-gradient(circle at 38% 32%, #fde68a, #f59e0b 55%, #d97706)', glow: '#f59e0b', ringColor: 'rgba(245,158,11,0.5)', y: [-10, 10], dur: 1.4 },
  proud:    { bg: 'radial-gradient(circle at 38% 32%, #a7f3d0, #10b981 55%, #059669)', glow: '#10b981', ringColor: 'rgba(16,185,129,0.4)', y: [-6, 4], dur: 2.0 },
  waiting:  { bg: 'radial-gradient(circle at 38% 32%, #ede9fe, #a78bfa 55%, #7c3aed)', glow: '#a78bfa', ringColor: 'rgba(167,139,250,0.3)', y: [-3, 3], dur: 4.5 },
};

function BrainSVG({ w, h }) {
  return (
    <svg viewBox="0 0 64 56" width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 34 Q6 28 10 22 Q10 14 18 12 Q22 6 30 8 Q34 6 38 8 Q46 6 50 14 Q57 16 57 24 Q60 30 56 36 Q54 44 46 44 Q42 48 36 46 Q32 50 28 46 Q22 48 18 44 Q10 44 10 34Z" fill="#f0abfc" stroke="#7c3aed" strokeWidth="2.2" strokeLinejoin="round"/>
      <path d="M22 12 Q22 6 28 8" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M32 8 Q34 4 38 8" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M10 22 Q6 20 8 14 Q12 10 18 12" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M10 34 Q4 32 6 26 Q8 20 12 20" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M54 22 Q58 18 56 14 Q52 10 48 12" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M56 34 Q60 30 58 24 Q55 19 52 21" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M32 12 Q32 22 32 32" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <circle cx="24" cy="28" r="5" fill="white" stroke="#7c3aed" strokeWidth="1.5"/>
      <circle cx="25" cy="28" r="2.5" fill="#6d28d9"/>
      <circle cx="25.8" cy="27" r="0.9" fill="white"/>
      <circle cx="40" cy="28" r="5" fill="white" stroke="#7c3aed" strokeWidth="1.5"/>
      <circle cx="41" cy="28" r="2.5" fill="#6d28d9"/>
      <circle cx="41.8" cy="27" r="0.9" fill="white"/>
      <path d="M27 35 Q32 39 37 35" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <ellipse cx="32" cy="37" rx="2.5" ry="1.2" fill="#f9a8d4" opacity="0.8"/>
    </svg>
  );
}

function NeuroGlobe({ size = 100, emotion = 'happy', isThinking = false }) {
  const cfg = GLOBE_EMOTIONS[emotion] || GLOBE_EMOTIONS.happy;
  const svgW = Math.round(size * 0.68);
  const svgH = Math.round(size * 0.60);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 40, height: size + 40 }}>
      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${cfg.glow}55 0%, transparent 70%)` }}
      />
      {/* Second ring */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
        className="absolute rounded-full border"
        style={{ width: size + 20, height: size + 20, borderColor: cfg.ringColor }}
      />

      {/* Main globe */}
      <motion.div
        key={emotion}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, y: cfg.y }}
        transition={{
          scale: { duration: 0.4, type: 'spring' },
          opacity: { duration: 0.3 },
          y: { repeat: Infinity, duration: cfg.dur, ease: 'easeInOut', repeatType: 'mirror' },
        }}
        className="rounded-full flex items-center justify-center relative overflow-hidden"
        style={{
          width: size,
          height: size,
          background: cfg.bg,
          boxShadow: `0 0 0 3px rgba(255,255,255,0.15) inset, 0 8px 40px ${cfg.glow}88, 0 0 80px ${cfg.glow}44`,
        }}
      >
        <div style={{ position: 'absolute', width: '38%', height: '24%', top: '11%', left: '15%', background: 'rgba(255,255,255,0.35)', borderRadius: '50%', filter: 'blur(3px)' }} />
        <BrainSVG w={svgW} h={svgH} />

        {/* Thinking dots overlay */}
        {isThinking && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 gap-1">
            {[0,1,2].map(i => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/70"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function isBaselinePrompt(text = '') {
  const lower = text.toLowerCase();
  return (
    (lower.includes('einschätzungstest') || lower.includes('baseline') || lower.includes('assessment') || lower.includes('einschätzen')) &&
    (lower.includes('starten') || lower.includes('möchtest') || lower.includes('bereit') || lower.includes('beginnen'))
  );
}

export default function OnboardingFlow({ onComplete }) {
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [emotion, setEmotion] = useState('happy');
  const [phase, setPhase] = useState('welcome');
  const chatEndRef = useRef(null);
  const unsubRef = useRef(null);
  const pollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    return () => { unsubRef.current?.(); clearInterval(pollRef.current); };
  }, []);

  const handleWelcomeDone = () => {
    setPhase('chat');
    initConversation();
  };

  const initConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({ agent_name: 'neuro', metadata: { name: 'Onboarding' } });
      setConversation(conv);
      setMessages(conv.messages || []);

      unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
        const msgs = data.messages || [];
        setMessages([...msgs]);
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant' && last?.content) {
          setLoading(false);
          const c = last.content.toLowerCase();
          if (c.includes('fantastisch') || c.includes('perfekt') || c.includes('toll')) setEmotion('proud');
          else if (c.includes('herausforderung') || c.includes('starten') || c.includes('super')) setEmotion('excited');
          else setEmotion('happy');
          if (isBaselinePrompt(last.content)) setPhase('baseline_prompt');
          setTimeout(() => checkOnboardingComplete(), 0);
        } else if (last?.role === 'user') {
          setLoading(true);
        }
      });

      setLoading(true);
      setEmotion('thinking');
      await base44.agents.addMessage(conv, {
        role: 'user',
        content: 'Starte das Onboarding. Begrüße mich kurz (1 Satz) und frage sofort nach meinem Namen.',
      });
      setInitialized(true);
    } catch (e) { console.error(e); }
  };

  const checkOnboardingComplete = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      const profile = profiles[0];

      setPhase(currentPhase => {
        if (currentPhase === 'baseline_waiting' && profile?.baseline_assessment_completed) {
          clearInterval(pollRef.current);
          setConversation(conv => {
            if (conv) {
              setLoading(true);
              setEmotion('thinking');
              base44.agents.addMessage(conv, { role: 'user', content: 'Ich habe den Einschätzungstest abgeschlossen.' });
            }
            return conv;
          });
          return 'baseline_done';
        }
        return currentPhase;
      });

      if (profile?.onboarding_completed && profile?.baseline_assessment_completed) {
        clearInterval(pollRef.current);
        setTimeout(() => onComplete?.(), 1500);
      }
    } catch (_) {}
  };

  const startBaselinePolling = () => { pollRef.current = setInterval(checkOnboardingComplete, 3000); };

  const handleStartBaseline = () => {
    setPhase('baseline_waiting');
    setEmotion('waiting');
    startBaselinePolling();
    navigate('/baseline');
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !conversation) return;
    setInput('');
    setLoading(true);
    setEmotion('thinking');
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
  };

  const visibleMessages = messages.filter(m => m.role !== 'user' || !m.content.startsWith('Starte das Onboarding'));

  if (phase === 'welcome') return <WelcomeScreen onStart={handleWelcomeDone} />;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #4c1d95 0%, #1e1b4b 40%, #0f0a1e 100%)' }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#a855f7' : i % 3 === 1 ? '#6366f1' : '#c084fc',
              opacity: 0.4,
            }}
            animate={{ y: [-20, 20], opacity: [0.2, 0.6, 0.2] }}
            transition={{ repeat: Infinity, duration: 3 + i * 0.4, delay: i * 0.3, repeatType: 'mirror' }}
          />
        ))}
      </div>

      {/* TOP: Neuro globe — large, centered, floating */}
      <div className="flex flex-col items-center pt-10 pb-2 flex-shrink-0 relative z-10">
        <NeuroGlobe size={110} emotion={loading ? 'thinking' : emotion} isThinking={loading} />
        <motion.div
          key={phase + emotion}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-center"
        >
          <div className="text-white font-black text-xl tracking-tight">Neuro</div>
          <div className="text-white/40 text-xs font-medium mt-0.5">
            {loading ? 'denkt nach...' : phase === 'baseline_waiting' ? '⏳ Wartet auf deinen Test' : 'Persönlicher Trainingsbegleiter'}
          </div>
        </motion.div>
      </div>

      {/* MIDDLE: Chat messages — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0 relative z-10">
        {!initialized && (
          <div className="flex items-center justify-center gap-2 text-white/30 text-sm py-6">
            <div className="w-4 h-4 border-2 border-white/20 border-t-white/50 rounded-full animate-spin" />
            Neuro startet...
          </div>
        )}

        <AnimatePresence initial={false}>
          {visibleMessages.map((m, i) => {
            const isUser = m.role === 'user';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-sm"
                    style={{ background: 'radial-gradient(circle at 38% 32%, #f5d0fe, #a855f7 55%, #6d28d9)' }}>
                    🧠
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-medium ${
                  isUser
                    ? 'bg-indigo-600/90 text-white rounded-br-sm'
                    : 'bg-white/10 backdrop-blur-sm text-white/95 border border-white/10 rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm"
              style={{ background: 'radial-gradient(circle at 38% 32%, #f5d0fe, #a855f7 55%, #6d28d9)' }}>
              🧠
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-300"
                  animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.15 }} />
              ))}
            </div>
          </div>
        )}

        {/* Baseline prompt card */}
        {phase === 'baseline_prompt' && !loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-purple-500/20 border border-purple-400/30 backdrop-blur-sm rounded-2xl p-4 space-y-3"
          >
            <div className="text-white/90 text-sm font-black">🧪 Einschätzungstest starten</div>
            <p className="text-white/60 text-xs leading-relaxed">
              Mache ein paar kurze Übungen aus verschiedenen Bereichen. Danach analysiere ich deine Stärken und passe das Training an dich an.
            </p>
            <button onClick={handleStartBaseline}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg"
            >
              <ExternalLink className="w-4 h-4" /> Zum Einschätzungstest
            </button>
            <button onClick={() => onComplete?.()} className="w-full py-2 text-white/30 text-xs hover:text-white/50 transition-colors">
              Jetzt überspringen
            </button>
          </motion.div>
        )}

        {phase === 'baseline_waiting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-5 h-5 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin flex-shrink-0" />
            <p className="text-white/60 text-xs">Sobald du fertig bist, komme hier zurück — ich warte auf dich!</p>
          </motion.div>
        )}

        {phase === 'baseline_done' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-xs font-semibold">Test abgeschlossen! Neuro analysiert deine Ergebnisse...</p>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* BOTTOM: Input */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-6 pt-2">
        {phase !== 'baseline_waiting' ? (
          <div className="flex gap-2 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Antworte Neuro..."
              className="flex-1 text-sm bg-transparent text-white px-3 py-2 focus:outline-none placeholder:text-white/25 font-medium"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || !conversation}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 flex items-center justify-center transition-all flex-shrink-0 shadow-lg"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button onClick={() => onComplete?.()}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 font-bold text-sm transition-colors border border-white/10"
          >
            Ich bin fertig — App starten
          </button>
        )}
      </div>
    </div>
  );
}