import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send } from 'lucide-react';

export default function OnboardingFlow({ onComplete }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const chatEndRef = useRef(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    initConversation();
    return () => unsubRef.current?.();
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
        if (last?.role === 'assistant') {
          setLoading(false);
          // Check if onboarding is done by polling profile
          checkOnboardingComplete();
        }
      });

      // Trigger Neuro to start the onboarding
      setLoading(true);
      await base44.agents.addMessage(conv, {
        role: 'user',
        content: '__onboarding_start__',
      });
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
        setTimeout(() => onComplete?.(), 1500);
      }
    } catch (_) {}
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !conversation) return;
    setInput('');
    setLoading(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
        style={{ height: '85vh', maxHeight: '680px' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">
            🧠
          </div>
          <div>
            <div className="text-white font-black text-lg">Neuro</div>
            <div className="text-white/50 text-xs font-medium">Persönlicher Trainingsbegleiter</div>
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
            {messages
              .filter(m => m.content && m.content !== '__onboarding_start__')
              .map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-medium ${
                        isUser
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white/10 text-white/90'
                      }`}
                    >
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
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
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
      </motion.div>
    </div>
  );
}