import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Send } from 'lucide-react';

const FACES = {
  happy:     '🧠',
  excited:   '⚡',
  thinking:  '🤔',
  proud:     '🌟',
  challenge: '💪',
  sad:       '😟',
  sleeping:  '😴',
};

const QUICK_ACTIONS = [
  { label: '💪 Challenge mich!', msg: 'Gib mir eine besondere Herausforderung für heute!' },
  { label: '🎯 Was jetzt?', msg: 'Was empfiehlst du mir als nächste Übung?' },
  { label: '📊 Mein Fortschritt', msg: 'Analysiere meinen Fortschritt und wo ich mich verbessern sollte.' },
  { label: '⚙️ Einstellungen', msg: 'Was für Einstellungen kann ich über dich ändern?' },
];

export default function NeuroMascot({ lastResult, popupsEnabled = true }) {
  const [open, setOpen] = useState(false);
  const [face, setFace] = useState('happy');
  const [bubble, setBubble] = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto bubble after training result
  useEffect(() => {
    if (!lastResult || !popupsEnabled) return;
    const score = lastResult.score;
    let msg, newFace;
    if (score >= 90) { msg = `Wow, ${score}%! Absolut fantastisch! 🌟`; newFace = 'proud'; }
    else if (score >= 75) { msg = `Sehr gut! ${score}% — du wirst immer besser! 💪`; newFace = 'excited'; }
    else if (score >= 50) { msg = `${score}% — solider Fortschritt! Bleib dran! 🧠`; newFace = 'happy'; }
    else { msg = `${score}%... Schwierig, oder? Ich helfe dir gerne! 😊`; newFace = 'challenge'; }
    setFace(newFace);
    setBubble(msg);
    setBubbleVisible(true);
    const t = setTimeout(() => setBubbleVisible(false), 6000);
    return () => clearTimeout(t);
  }, [lastResult]);

  // Periodic idle motivations
  useEffect(() => {
    if (!popupsEnabled) return;
    const motivations = [
      "Heute noch trainiert? Dein Gehirn wartet! 🧠",
      "5 Minuten reichen für ein echtes Brain-Workout! ⚡",
      "Du kannst mich auch nach Einstellungen fragen! ⚙️",
    ];
    const t = setInterval(() => {
      if (!open) {
        setBubble(motivations[Math.floor(Math.random() * motivations.length)]);
        setBubbleVisible(true);
        setTimeout(() => setBubbleVisible(false), 5000);
      }
    }, 3 * 60 * 1000);
    return () => clearInterval(t);
  }, [open, popupsEnabled]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initialize conversation on first open
  const handleOpen = async () => {
    setOpen(true);
    setBubbleVisible(false);
    if (!conversation) {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: 'neuro',
          metadata: { name: 'Neuro Chat' },
        });
        setConversation(conv);
        setMessages(conv.messages || []);
        // Subscribe to updates
        base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages([...(data.messages || [])]);
          const last = data.messages?.[data.messages.length - 1];
          if (last?.role === 'assistant') {
            setLoading(false);
            setFace('happy');
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !conversation) return;
    setInput('');
    setLoading(true);
    setFace('thinking');
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch (e) {
      setLoading(false);
      setFace('happy');
    }
  };

  const handleQuickAction = (msg) => {
    if (!conversation) {
      handleOpen().then(() => {
        // slight delay to ensure conv is ready
        setTimeout(() => sendMessage(msg), 600);
      });
    } else {
      sendMessage(msg);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <AnimatePresence>
        {bubbleVisible && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="fixed bottom-28 right-4 md:bottom-24 md:right-6 z-40 max-w-56"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 relative">
              {bubble}
              <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white dark:bg-slate-800 border-r border-b border-slate-100 dark:border-slate-700 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot button */}
      <motion.button
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-200 flex items-center justify-center text-2xl border-2 border-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ y: [0, -4, 0] }}
        transition={{ y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } }}
      >
        {FACES[face]}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden"
            style={{ maxHeight: '480px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="text-2xl">{FACES[face]}</div>
              <div className="flex-1">
                <div className="font-black text-white text-sm">Neuro</div>
                <div className="text-white/70 text-xs">Dein KI-Begleiter · kann Einstellungen ändern</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {messages.length === 0 && !loading && (
                <div className="text-center py-3">
                  <div className="text-3xl mb-2">🧠</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    Hey! Ich bin Neuro. Ich kann dir Tipps geben, deinen Fortschritt analysieren und alle App-Einstellungen für dich ändern!
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map(a => (
                      <button
                        key={a.label}
                        onClick={() => handleQuickAction(a.msg)}
                        className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl px-2 py-2 font-semibold transition-colors text-left"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                const content = m.content || '';
                if (!content && !isUser) return null;
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs font-medium leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}>
                      {content}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 dark:border-slate-700 p-3 flex gap-2 flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Frag Neuro oder ändere Einstellungen..."
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading || !conversation}
                className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}