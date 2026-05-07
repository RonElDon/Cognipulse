import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Emotion config for the animated brain globe
const GLOBE_EMOTIONS = {
  happy:    { bg: 'radial-gradient(circle at 38% 32%, #f5d0fe, #a855f7 55%, #6d28d9)', glow: 'rgba(139,92,246,0.5)', y: [-4, 4], dur: 2.6 },
  thinking: { bg: 'radial-gradient(circle at 38% 32%, #bfdbfe, #6366f1 55%, #4338ca)', glow: 'rgba(99,102,241,0.5)', y: [-2, 2], dur: 3.8 },
  excited:  { bg: 'radial-gradient(circle at 38% 32%, #fde68a, #f59e0b 55%, #d97706)', glow: 'rgba(245,158,11,0.6)', y: [-7, 7], dur: 1.5 },
  proud:    { bg: 'radial-gradient(circle at 38% 32%, #a7f3d0, #10b981 55%, #059669)', glow: 'rgba(16,185,129,0.5)', y: [-4, 3], dur: 2.0 },
  waiting:  { bg: 'radial-gradient(circle at 38% 32%, #ede9fe, #a78bfa 55%, #7c3aed)', glow: 'rgba(167,139,250,0.4)', y: [-2, 2], dur: 4.5 },
};

function BrainSVG({ w, h }) {
  return (
    <svg viewBox="0 0 64 56" width={w} height={h} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
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

function NeuroGlobe({ size = 72, emotion = 'happy' }) {
  const cfg = GLOBE_EMOTIONS[emotion] || GLOBE_EMOTIONS.happy;
  const svgW = Math.round(size * 0.68);
  const svgH = Math.round(size * 0.60);
  return (
    <motion.div
      key={emotion}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, y: cfg.y }}
      transition={{
        scale: { duration: 0.3 },
        opacity: { duration: 0.3 },
        y: { repeat: Infinity, duration: cfg.dur, ease: 'easeInOut', repeatType: 'mirror' },
      }}
      className="rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0"
      style={{
        width: size, height: size,
        background: cfg.bg,
        boxShadow: `0 0 0 2px rgba(255,255,255,0.2) inset, 0 6px 28px ${cfg.glow}`,
      }}
    >
      <div style={{ position: 'absolute', width: '38%', height: '24%', top: '11%', left: '15%', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', filter: 'blur(2px)' }} />
      <BrainSVG w={svgW} h={svgH} />
    </motion.div>
  );
}

// Detect if the last Neuro message is asking for the baseline assessment
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
  const [phase, setPhase] = useState('chat'); // 'chat' | 'baseline_prompt' | 'baseline_waiting' | 'baseline_done'
  const chatEndRef = useRef(null);
  const unsubRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    initConversation();
    return () => {
      unsubRef.current?.();
      clearInterval(pollRef.current);
    };
  }, []);

  const initConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: 'neuro',
        metadata: { name: 'Onboarding' },
      });
      setConversation(conv);
      setMessages(conv.messages || []);

      unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
        const msgs = data.messages || [];
        setMessages([...msgs]);
        const last = msgs[msgs.length - 1];
        if (last?.role === 'assistant' && last?.content) {
          setLoading(false);
          const c = last.content.toLowerCase();
          // Detect emotion
          if (c.includes('fantastisch') || c.includes('perfekt') || c.includes('toll')) setEmotion('proud');
          else if (c.includes('herausforderung') || c.includes('starten')) setEmotion('excited');
          else setEmotion('happy');
          // Detect baseline prompt
          if (isBaselinePrompt(last.content)) {
            setPhase('baseline_prompt');
          }
          checkOnboardingComplete();
        }
      });

      setLoading(true);
      setEmotion('thinking');
      await base44.agents.addMessage(conv, { role: 'user', content: '__onboarding_start__' });
      setInitialized(true);
    } catch (e) {
      console.error(e);
    }
  };

  const checkOnboardingComplete = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles[0]?.onboarding_completed) {
        clearInterval(pollRef.current);
        setTimeout(() => onComplete?.(), 1500);
      }
      // Check if baseline was just completed while waiting
      if (phase === 'baseline_waiting' && profiles[0]?.baseline_assessment_completed) {
        setPhase('baseline_done');
        clearInterval(pollRef.current);
        // Tell Neuro the baseline is done so it can continue
        if (conversation) {
          setLoading(true);
          setEmotion('thinking');
          await base44.agents.addMessage(conversation, {
            role: 'user',
            content: 'Ich habe den Einschätzungstest abgeschlossen.',
          });
        }
      }
    } catch (_) {}
  };

  // Poll while waiting for baseline
  const startBaselinePolling = () => {
    pollRef.current = setInterval(checkOnboardingComplete, 3000);
  };

  const handleStartBaseline = () => {
    setPhase('baseline_waiting');
    setEmotion('waiting');
    startBaselinePolling();
    navigate('/train');
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !conversation) return;
    setInput('');
    setLoading(true);
    setEmotion('thinking');
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
  };

  const visibleMessages = messages.filter(m => m.content && m.content !== '__onboarding_start__');

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
        style={{ height: '88vh', maxHeight: '700px' }}
      >
        {/* Header with animated Neuro globe */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-4 flex-shrink-0">
          <NeuroGlobe size={52} emotion={loading ? 'thinking' : emotion} />
          <div>
            <div className="text-white font-black text-base">Neuro</div>
            <div className="text-white/50 text-xs font-medium">
              {phase === 'baseline_waiting' ? '⏳ Warte auf deinen Test...' : 'Persönlicher Trainingsbegleiter'}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {!initialized && (
            <div className="flex items-center gap-2 text-white/40 text-sm py-8 justify-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              Neuro wird gestartet...
            </div>
          )}

          <AnimatePresence initial={false}>
            {visibleMessages.map((m, i) => {
              const isUser = m.role === 'user';
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-medium ${
                    isUser ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/90'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl px-4 py-3 flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Baseline prompt card */}
          {phase === 'baseline_prompt' && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-500/20 border border-purple-400/30 rounded-2xl p-4 space-y-3"
            >
              <div className="text-white/90 text-sm font-semibold">🧪 Einschätzungstest starten</div>
              <p className="text-white/60 text-xs leading-relaxed">
                Mache ein paar kurze Übungen aus verschiedenen Bereichen. Danach analysiere ich deine Stärken und passe das Training an dich an.
              </p>
              <button
                onClick={handleStartBaseline}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg"
              >
                <ExternalLink className="w-4 h-4" />
                Zum Einschätzungstest
              </button>
            </motion.div>
          )}

          {/* Waiting for baseline */}
          {phase === 'baseline_waiting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-6 h-6 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin flex-shrink-0" />
              <p className="text-white/60 text-xs">Sobald du fertig bist, komme hier zurück — ich warte auf dich!</p>
            </motion.div>
          )}

          {/* Baseline done confirmation */}
          {phase === 'baseline_done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4 flex items-center gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-300 text-xs font-semibold">Test abgeschlossen! Neuro analysiert deine Ergebnisse...</p>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input — hidden while waiting for baseline */}
        {phase !== 'baseline_waiting' && (
          <div className="border-t border-white/10 p-4 flex gap-3 flex-shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder="Antworte Neuro..."
              className="flex-1 text-sm rounded-xl border border-white/20 bg-white/10 text-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-white/30 font-medium"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || !conversation}
              className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Return button while waiting */}
        {phase === 'baseline_waiting' && (
          <div className="border-t border-white/10 p-4 flex-shrink-0">
            <button
              onClick={() => { setPhase('baseline_done'); checkOnboardingComplete(); }}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-bold text-sm transition-colors"
            >
              Ich bin fertig — zurück zu Neuro
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}