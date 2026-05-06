import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useTheme } from '@/lib/ThemeContext';
import { X, Send, Sparkles } from 'lucide-react';
import NeuroCharacter from './NeuroCharacter';

const FACES = {
  happy:     '🧠',
  excited:   '⚡',
  thinking:  '🤔',
  proud:     '🌟',
  challenge: '💪',
  sad:       '😟',
  sleeping:  '😴',
  party:     '🎉',
};

const QUICK_ACTIONS = [
  { label: '💪 Herausforderung', msg: 'Gib mir eine Übung, die ich heute noch nicht gemacht habe und die mich wirklich fordert.' },
  { label: '🎯 Was jetzt?', msg: 'Was empfiehlst du mir als nächste Übung basierend auf meinem Fortschritt?' },
  { label: '📊 Mein Fortschritt', msg: 'Analysiere meinen Trainingsfortschritt — was läuft gut, was sollte ich verbessern?' },
  { label: '❓ Wie funktionierts?', msg: 'Erkläre mir kurz wie das Gehirntraining hier aufgebaut ist und was die Domains bedeuten.' },
];

export default function NeuroMascot({ lastResult, popupsEnabled = true }) {
  const { applyExternalTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [face, setFace] = useState('happy');
  const [bubble, setBubble] = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const unsubRef = useRef(null);
  // Track last applied theme to avoid re-applying same values
  const lastThemeRef = useRef(null);

  // Auto bubble after training result
  useEffect(() => {
    if (!lastResult || !popupsEnabled) return;
    const score = lastResult.score;
    let msg, newFace;
    if (score >= 90) { msg = `Wow, ${score}%! Absolut fantastisch! 🌟`; newFace = 'proud'; }
    else if (score >= 75) { msg = `Sehr gut! ${score}% — du wirst immer besser! 💪`; newFace = 'excited'; }
    else if (score >= 50) { msg = `${score}% — guter Fortschritt! Bleib dran! 🧠`; newFace = 'happy'; }
    else { msg = `${score}%... Schwierig, oder? Ich helfe dir gerne! 😊`; newFace = 'challenge'; }
    setFace(newFace);
    showBubble(msg);
  }, [lastResult]);

  // Periodic idle motivations
  useEffect(() => {
    if (!popupsEnabled) return;
    const motivations = [
      "Heute noch trainiert? Dein Gehirn wartet! 🧠",
      "5 Minuten reichen für ein echtes Brain-Workout! ⚡",
      "Tipp: Du kannst mich nach allem fragen — auch Einstellungen! ⚙️",
      "Psst... ich kenne ein paar geheime Easter Eggs 🥚",
    ];
    const t = setInterval(() => {
      if (!open) showBubble(motivations[Math.floor(Math.random() * motivations.length)]);
    }, 3 * 60 * 1000);
    return () => clearInterval(t);
  }, [open, popupsEnabled]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const showBubble = (msg, duration = 6000) => {
    setBubble(msg);
    setBubbleVisible(true);
    setTimeout(() => setBubbleVisible(false), duration);
  };

  // After agent responds, sync theme from UserProfile
  const syncThemeFromProfile = async () => {
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (!profiles.length) return;
      const p = profiles[0];
      const themePayload = {};
      if (p.theme_dark_mode !== undefined) themePayload.darkMode = p.theme_dark_mode;
      if (p.theme_accent_color) themePayload.accentColor = p.theme_accent_color;
      if (p.theme_gradient) themePayload.gradient = p.theme_gradient;

      const key = JSON.stringify(themePayload);
      if (key !== lastThemeRef.current && Object.keys(themePayload).length > 0) {
        lastThemeRef.current = key;
        applyExternalTheme(themePayload);
      }
    } catch (e) { /* silent */ }
  };

  // Parse agent message for theme keywords and apply immediately (no backend roundtrip needed)
  const applyThemeFromMessage = (content) => {
    const c = content.toLowerCase();
    const payload = {};
    // Dark mode
    if (c.includes('dark mode') && (c.includes('aktiviert') || c.includes('eingeschaltet') || c.includes('an') || c.includes('ein'))) {
      payload.darkMode = true;
    }
    if ((c.includes('hell') || c.includes('light mode') || c.includes('heller modus')) && (c.includes('aktiviert') || c.includes('eingeschaltet') || c.includes('an') || c.includes('ein') || c.includes('umgestellt'))) {
      payload.darkMode = false;
    }
    // Gradient shortcuts from easter eggs
    if (c.includes('nacht-gradient') || c.includes('nacht-modus') || (c.includes('nacht') && c.includes('gradient'))) {
      payload.gradient = 'night';
      payload.darkMode = true;
    }
    if (c.includes('party') || c.includes('🎉')) {
      payload.gradient = 'rose';
      payload.accentColor = '#ec4899';
    }
    if (c.includes('rainbow') || c.includes('regenbogen')) {
      payload.accentColor = ['#f43f5e','#f59e0b','#10b981','#06b6d4','#8b5cf6'][Math.floor(Math.random()*5)];
    }
    if (c.includes('matrix')) {
      payload.accentColor = '#10b981';
    }
    if (Object.keys(payload).length > 0) {
      applyExternalTheme(payload);
    }
  };

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

        unsubRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
          const msgs = data.messages || [];
          setMessages([...msgs]);
          const last = msgs[msgs.length - 1];
          if (last?.role === 'assistant' && last?.content) {
            setLoading(false);
            const c = last.content.toLowerCase();
            // Detect face
            if (c.includes('party') || c.includes('🎉')) setFace('party');
            else if (c.includes('fantastisch') || c.includes('excellent') || c.includes('🌟')) setFace('proud');
            else if (c.includes('herausforderung') || c.includes('challenge')) setFace('excited');
            else if (c.includes('zzz') || c.includes('schläft') || c.includes('😴')) setFace('sleeping');
            else setFace('happy');
            // Apply theme immediately from message content, then also sync from backend
            applyThemeFromMessage(last.content);
            setTimeout(syncThemeFromProfile, 2000);
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    return () => { unsubRef.current?.(); };
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim() || loading || !conversation) return;
    setInput('');
    setLoading(true);
    setFace('thinking');
    // Optimistic local theme apply for common commands
    const t = text.toLowerCase();
    if (t.includes('dark mode') || t.includes('dunkel') || t.includes('dark lord') || t.includes('sith') || t.includes('nacht')) {
      applyExternalTheme({ darkMode: true });
    } else if (t.includes('hell') || t.includes('light mode') || t.includes('tag modus') || t.includes('heller')) {
      applyExternalTheme({ darkMode: false });
    }
    try {
      await base44.agents.addMessage(conversation, { role: 'user', content: text });
    } catch (e) {
      setLoading(false);
      setFace('happy');
    }
  };

  const handleQuickAction = async (msg) => {
    if (!conversation) {
      await handleOpen();
      setTimeout(() => sendMessage(msg), 800);
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
            className="fixed bottom-28 right-4 md:bottom-24 md:right-6 z-40 max-w-60 cursor-pointer"
            onClick={() => handleOpen()}
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 relative">
              {bubble}
              <div className="absolute -bottom-2 right-5 w-4 h-4 bg-white dark:bg-slate-800 border-r border-b border-slate-100 dark:border-slate-700 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot button — cute cartoon brain SVG */}
      <motion.button
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-xl shadow-purple-400/40"
        style={{ background: 'radial-gradient(circle at 40% 35%, #f0abfc, #a855f7 60%, #7c3aed)' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
      >
        <svg viewBox="0 0 64 56" width="42" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Brain body — bumpy cloud shape */}
          <path d="M10 34 Q6 28 10 22 Q10 14 18 12 Q22 6 30 8 Q34 6 38 8 Q46 6 50 14 Q57 16 57 24 Q60 30 56 36 Q54 44 46 44 Q42 48 36 46 Q32 50 28 46 Q22 48 18 44 Q10 44 10 34Z" fill="#f0abfc" stroke="#7c3aed" strokeWidth="2.2" strokeLinejoin="round"/>
          {/* Brain top bumps */}
          <path d="M22 12 Q22 6 28 8" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <path d="M32 8 Q34 4 38 8" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          {/* Left bumps */}
          <path d="M10 22 Q6 20 8 14 Q12 10 18 12" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <path d="M10 34 Q4 32 6 26 Q8 20 12 20" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          {/* Right bumps */}
          <path d="M54 22 Q58 18 56 14 Q52 10 48 12" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          <path d="M56 34 Q60 30 58 24 Q55 19 52 21" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          {/* Center crease */}
          <path d="M32 12 Q32 22 32 32" stroke="#c084fc" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7"/>
          {/* Left eye */}
          <circle cx="24" cy="28" r="5" fill="white" stroke="#7c3aed" strokeWidth="1.5"/>
          <circle cx="25" cy="28" r="2.5" fill="#6d28d9"/>
          <circle cx="25.8" cy="27" r="0.9" fill="white"/>
          {/* Right eye */}
          <circle cx="40" cy="28" r="5" fill="white" stroke="#7c3aed" strokeWidth="1.5"/>
          <circle cx="41" cy="28" r="2.5" fill="#6d28d9"/>
          <circle cx="41.8" cy="27" r="0.9" fill="white"/>
          {/* Smile */}
          <path d="M27 35 Q32 39 37 35" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
          {/* Tiny tongue/lip hint */}
          <ellipse cx="32" cy="37" rx="2.5" ry="1.2" fill="#f9a8d4" opacity="0.8"/>
        </svg>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-36 right-4 md:bottom-24 md:right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden"
            style={{ maxHeight: '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="-my-1 flex-shrink-0">
                <NeuroCharacter
                  emotion={face === 'happy' ? 'happy' : face === 'excited' ? 'excited' : face === 'proud' ? 'proud' : face === 'thinking' ? 'thinking' : face === 'sad' ? 'sad' : face === 'sleeping' ? 'sleeping' : face === 'party' ? 'excited' : face === 'challenge' ? 'encouraging' : 'happy'}
                  size={44}
                />
              </div>
              <div className="flex-1">
                <div className="font-black text-white text-sm flex items-center gap-1.5">
                  Neuro <Sparkles className="w-3 h-3 text-yellow-300" />
                </div>
                <div className="text-white/70 text-xs">Persönlicher Trainingsbegleiter</div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
              {messages.length === 0 && !loading && (
                <div className="text-center py-2">
                  <div className="flex justify-center mb-3">
                    <NeuroCharacter emotion="happy" size={72} />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    Hey! Ich bin Neuro, dein persönlicher Trainingsbegleiter. Ich analysiere deine Stärken und Schwächen und empfehle dir die richtigen Übungen. 🧠
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map(a => (
                      <button
                        key={a.label}
                        onClick={() => handleQuickAction(a.msg)}
                        className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-slate-600 dark:text-slate-300 rounded-xl px-2 py-2 font-semibold transition-colors text-left"
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
                if (!content) return null;
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

            {/* Quick chips when chat is active */}
            {messages.length > 0 && (
              <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-hide flex-shrink-0">
                {[
                  { label: '🎯 Nächste Übung', msg: 'Was empfiehlst du mir als nächste Übung?' },
                  { label: '📊 Analyse', msg: 'Analysiere meinen Trainingsfortschritt.' },
                  { label: '💪 Challenge', msg: 'Gib mir eine wirklich fordernde Übung für heute!' },
                ].map(c => (
                  <button
                    key={c.label}
                    onClick={() => sendMessage(c.msg)}
                    disabled={loading}
                    className="flex-shrink-0 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-slate-600 dark:text-slate-300 rounded-full px-2.5 py-1 font-semibold transition-colors disabled:opacity-40"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-slate-100 dark:border-slate-700 p-3 flex gap-2 flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                placeholder="Frag mich alles... oder tipps 'party' 🎉"
                className="flex-1 text-xs rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-slate-400"
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