import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { X, Send, Zap, MessageCircle } from 'lucide-react';

// Neuro face states
const FACES = {
  happy:     '🧠',
  excited:   '⚡',
  thinking:  '🤔',
  proud:     '🌟',
  challenge: '💪',
  sad:       '😟',
  sleeping:  '😴',
};

const SYSTEM_PROMPT = `Du bist "Neuro", ein freundliches, motivierendes KI-Maskottchen für die BrainBoost Gehirntraining-App. 
Du begleitest Nutzer auf ihrer Trainingsreise, analysierst ihre Leistungen und gibst personalisiertes Feedback.
- Antworte immer auf Deutsch, kurz und prägnant (1-3 Sätze)
- Sei motivierend, positiv aber ehrlich
- Bei guten Ergebnissen (>80%): lobe ausdrücklich
- Bei mittleren (50-79%): ermutige und gib konkrete Tipps
- Bei schwachen (<50%): sei empathisch, mache es leichter/einfacher
- Du kannst auch Challenges vorschlagen oder Übungen empfehlen
- Nutze manchmal Emojis aber nicht übertreiben`;

export default function NeuroMascot({ lastResult, popupsEnabled = true }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [face, setFace] = useState('happy');
  const [bubble, setBubble] = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const chatEndRef = useRef(null);

  // Show automatic bubble after training result
  useEffect(() => {
    if (!lastResult || !popupsEnabled) return;
    const score = lastResult.score;
    let msg, newFace;
    if (score >= 90) { msg = `Wow, ${score}%! Das war absolut fantastisch! 🌟`; newFace = 'proud'; }
    else if (score >= 75) { msg = `Sehr gut! ${score}% — du wirst immer besser! 💪`; newFace = 'excited'; }
    else if (score >= 50) { msg = `${score}% — solider Fortschritt! Bleib dran, du schaffst mehr! 🧠`; newFace = 'happy'; }
    else { msg = `${score}%... Das war schwierig, oder? Soll ich es leichter machen? 😊`; newFace = 'challenge'; }
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
      "Du warst zuletzt gut bei Gedächtnis — versuch mal Aufmerksamkeit! 🎯",
    ];
    const t = setInterval(() => {
      if (!open) {
        setBubble(motivations[Math.floor(Math.random() * motivations.length)]);
        setBubbleVisible(true);
        setTimeout(() => setBubbleVisible(false), 5000);
      }
    }, 3 * 60 * 1000); // every 3 minutes
    return () => clearInterval(t);
  }, [open, popupsEnabled]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setFace('thinking');

    try {
      const history = newMessages.slice(-6).map(m => `${m.role === 'user' ? 'Nutzer' : 'Neuro'}: ${m.content}`).join('\n');
      const contextPart = lastResult
        ? `\nLetztes Training: ${lastResult.exercise_name}, Score: ${lastResult.score}%, Domain: ${lastResult.domain}`
        : '';
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}${contextPart}\n\nGespräch:\n${history}\n\nNeuro:`,
      });
      const aiText = typeof response === 'string' ? response : response?.text || '...';
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
      const s = lastResult?.score;
      setFace(s >= 80 ? 'proud' : s >= 50 ? 'happy' : 'challenge');
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hmm, ich konnte gerade nicht antworten. Versuch es nochmal! 🔄' }]);
    }
    setLoading(false);
  };

  const quickActions = [
    { label: '💪 Challenge mich!', msg: 'Gib mir eine besondere Herausforderung für heute!' },
    { label: '😊 Leichter bitte', msg: 'Welche Übung ist am leichtesten für Anfänger?' },
    { label: '📊 Mein Fortschritt', msg: 'Wie entwickle ich mich? Wo soll ich mich verbessern?' },
    { label: '🎯 Was jetzt?', msg: 'Was empfiehlst du mir als nächste Übung?' },
  ];

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
        onClick={() => { setOpen(v => !v); setBubbleVisible(false); }}
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
            style={{ maxHeight: '420px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center gap-3">
              <div className="text-2xl">{FACES[face]}</div>
              <div className="flex-1">
                <div className="font-black text-white text-sm">Neuro</div>
                <div className="text-white/70 text-xs">Dein KI-Trainingsbegleiter</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {messages.length === 0 && (
                <div className="text-center py-4">
                  <div className="text-3xl mb-2">🧠</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hey! Ich bin Neuro, dein Trainingsbegleiter. Wie kann ich helfen?</div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {quickActions.map(a => (
                      <button
                        key={a.label}
                        onClick={() => sendMessage(a.msg)}
                        className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl px-2 py-2 font-semibold transition-colors text-left"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs font-medium ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl px-3 py-2">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 dark:border-slate-700 p-3 flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Frag Neuro..."
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
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