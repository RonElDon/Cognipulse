import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send, ArrowLeft } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';
import DeviceCheckScreen from './DeviceCheckScreen';
import { useTheme } from '@/lib/ThemeContext';

const GLOBE_EMOTIONS = {
  happy:    { bg: 'radial-gradient(circle at 38% 32%, #f5d0fe, #a855f7 55%, #6d28d9)', glow: '#a855f7', y: [-6, 6], dur: 2.6 },
  thinking: { bg: 'radial-gradient(circle at 38% 32%, #bfdbfe, #6366f1 55%, #4338ca)', glow: '#6366f1', y: [-3, 3], dur: 3.8 },
  excited:  { bg: 'radial-gradient(circle at 38% 32%, #fde68a, #f59e0b 55%, #d97706)', glow: '#f59e0b', y: [-10, 10], dur: 1.4 },
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

function NeuroGlobe({ size = 100, emotion = 'happy' }) {
  const cfg = GLOBE_EMOTIONS[emotion] || GLOBE_EMOTIONS.happy;
  const svgW = Math.round(size * 0.68);
  const svgH = Math.round(size * 0.60);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size + 40, height: size + 40 }}>
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, ${cfg.glow}55 0%, transparent 70%)` }}
      />
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
        className="absolute rounded-full border"
        style={{ width: size + 20, height: size + 20, borderColor: cfg.glow + '66' }}
      />
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
      </motion.div>
    </div>
  );
}

const QUESTIONS = {
  de: [
    { id: 'name', question: 'Lass mich dich kennenlernen — wie heißt du? (optional) 😊', placeholder: 'Dein Name oder Spitzname...', type: 'text', optional: true },
    { id: 'age', question: 'Und wie viele Jahre Gehirn-Power hast du bereits? 🧠', placeholder: 'Alter...', type: 'age' },
    { id: 'gender', question: 'Geschlecht? (freiwillig) ⚧️', options: [{ label: 'Männlich', value: 'männlich' }, { label: 'Weiblich', value: 'weiblich' }, { label: 'Divers', value: 'divers' }, { label: 'Keine Angabe', value: 'keine Angabe' }], type: 'select', defaultIdx: 3 },
    { id: 'goal', question: 'Was treibt dich an? Was möchtest du mit deinem Gehirn erreichen? 🎯', placeholder: 'z.B. Gedächtnis verbessern, fokussierter werden...', type: 'text' },
    { id: 'dailyExercises', question: 'Wie viel Zeit hast du pro Tag für dein Brain-Workout? ⏱️', options: [
      { label: 'Starter (5 Min.)', value: '3' },
      { label: 'Advanced (15 Min.)', value: '8' },
      { label: 'Pro (30 Min.)', value: '15' },
      { label: 'Elite (45 Min.)', value: '22' },
      { label: 'Over 9000 (60 Min.)', value: '30' },
    ], type: 'select' },
  ],
  en: [
    { id: 'name', question: 'Let me get to know you — what\'s your name? (optional) 😊', placeholder: 'Your name or nickname...', type: 'text', optional: true },
    { id: 'age', question: 'How many years of brain power do you have? 🧠', placeholder: 'Your age...', type: 'age' },
    { id: 'gender', question: 'Gender? (optional) ⚧️', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }, { label: 'Diverse', value: 'diverse' }, { label: 'Prefer not to say', value: 'prefer not to say' }], type: 'select', defaultIdx: 3 },
    { id: 'goal', question: 'What drives you? What do you want to achieve with your brain? 💪', placeholder: 'e.g. improve memory, better focus...', type: 'text' },
    { id: 'dailyExercises', question: 'How much time do you have for your daily brain training? ⏱️', options: [
      { label: 'Starter (5 min)', value: '3' },
      { label: 'Advanced (15 min)', value: '8' },
      { label: 'Pro (30 min)', value: '15' },
      { label: 'Elite (45 min)', value: '22' },
      { label: 'Over 9000 (60 min)', value: '30' },
    ], type: 'select' },
  ],
};

export default function OnboardingFlow({ onComplete }) {
  const navigate = useNavigate();
  const { accentColor } = useTheme();
  const [phase, setPhase] = useState('welcome'); // welcome | devicecheck | chat
  const [language, setLanguage] = useState('de');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [emotion, setEmotion] = useState('happy');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(null);
  const [ageSlider, setAgeSlider] = useState(25);
  const [dateInput, setDateInput] = useState({ day: '', month: '', year: '' });
  const [dateFocus, setDateFocus] = useState('day');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const selectContainerRef = useRef(null);
  const sliderRef = useRef(null);
  const answeringRef = useRef(false);

  const questions = QUESTIONS[language];
  const currentQuestion = questions[currentStep];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && currentQuestion.type === 'date') {
      inputRef.current.focus();
    }
  }, [dateFocus, currentQuestion.type]);

  useEffect(() => {
    if (currentQuestion.type === 'select' && selectContainerRef.current) {
      selectContainerRef.current.focus();
    }
    if (currentQuestion.type === 'age' && sliderRef.current) {
      sliderRef.current.focus();
    }
  }, [currentStep, currentQuestion.type]);

  // Single ref that always holds current state — avoids stale closures in keydown handler
  const stateRef = useRef({});

  // Global keydown — reads everything from stateRef to avoid stale closures
  useEffect(() => {
    const handler = (e) => {
      const { currentQuestion: q, currentStep: step, handleAnswer: answer, handleBack: back } = stateRef.current;

      // Backspace/Delete → go back (only when not typing in a text input)
      if ((e.key === 'Backspace' || e.key === 'Delete') && step > 0) {
        const tag = document.activeElement?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          back();
          return;
        }
      }

      if (q.type === 'age') {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          e.preventDefault();
          setAgeSlider(v => Math.max(13, v - 1));
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          e.preventDefault();
          setAgeSlider(v => Math.min(99, v + 1));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          setAgeSlider(v => { answer(String(v)); return v; });
        }
      } else if (q.type === 'select') {
        const opts = q.options;
        const len = opts.length;
        const cols = len >= 5 ? 1 : 2;

        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setSelectedOptionIdx(prev => {
            const cur = prev ?? 0;
            return cur % cols === 0 ? cur : cur - 1;
          });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setSelectedOptionIdx(prev => {
            if (prev === null) return 0;
            return (prev % cols === cols - 1 || prev === len - 1) ? prev : prev + 1;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedOptionIdx(prev => {
            const cur = prev ?? cols;
            return cur >= cols ? cur - cols : cur;
          });
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedOptionIdx(prev => {
            if (prev === null) return 0;
            return prev + cols < len ? prev + cols : prev;
          });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          setSelectedOptionIdx(prev => {
            const idx = prev ?? 0;
            const opt = opts[idx];
            if (opt) answer(opt.value || opt);
            return prev;
          });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // mount once — no stale closures thanks to stateRef

  const handleWelcomeDone = (lang, consents) => {
    setLanguage(lang);
    window._cogniConsents = consents;
    setPhase('devicecheck');
  };

  const handleAnswer = async (value) => {
    if (!value && value !== 0) return;
    if (answeringRef.current) return;
    answeringRef.current = true;
    setTimeout(() => { answeringRef.current = false; }, 800);
    
    const newAnswers = { ...answers, [currentQuestion.id]: String(value) };
    setAnswers(newAnswers);
    setInput('');
    setDateInput({ day: '', month: '', year: '' });
    setSelectedOptionIdx(null);
    
    // Add user message with emoji
    let displayValue = String(value);
    if (currentQuestion.type === 'select') {
      const opt = currentQuestion.options.find(o => o.value === value || o === value);
      const label = opt?.label || opt;
      displayValue = `${getEmojiForAnswer(label || value)} ${label || value}`;
    }
    setMessages(prev => [...prev, { role: 'user', content: displayValue }]);
    setEmotion('thinking');

    // Move to next question or finish
    setTimeout(async () => {
      if (currentStep < questions.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);

        // Upsell message after dailyExercises selection for high tiers
        if (currentQuestion.id === 'dailyExercises') {
          const highTiers = ['15', '22', '30'];
          if (highTiers.includes(String(value))) {
            const upsell = language === 'de'
              ? 'Großartige Wahl! 🔥 Für so intensive Sessions empfehle ich dir unseren Premium-Plan oder werbefreies Training mit Coins — damit bleibt nichts dein Trainingsfluss unterbrochen!'
              : 'Great choice! 🔥 For such intensive sessions, I recommend our Premium Plan or ad-free training with coins — so nothing interrupts your training flow!';
            setMessages(prev => [...prev, { role: 'assistant', content: upsell }]);
            setEmotion('excited');
            await new Promise(r => setTimeout(r, 1200));
          }
        }

        setMessages(prev => [...prev, { role: 'assistant', content: QUESTIONS[language][nextStep].question }]);
        setEmotion('happy');
      } else {
        // Save all data — use newAnswers (has current answer included)
        setSaving(true);
        try {
          const user = await base44.auth.me();
          const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
          
          if (profiles.length > 0) {
            const profileId = profiles[0].id;
            await base44.entities.UserProfile.update(profileId, {
              display_name: newAnswers.name || user.full_name,
              age: parseInt(newAnswers.age) || null,
              gender: newAnswers.gender || null,
              preferred_language: language,
              goals: {
                daily_exercises: parseInt(newAnswers.dailyExercises, 10) || 3,
                focus_domains: []
              },
            });
          }
        } catch (e) {
          console.error('Onboarding save error:', e);
        }
        setSaving(false);
        setMessages(prev => [...prev, { role: 'assistant', content: language === 'de' ? 'Perfekt! Jetzt ein kurzer Test, damit ich sehe wo du stehst. Los geht\'s! 🚀' : 'Perfect! Now a quick assessment so I can see where you\'re at. Let\'s go! 🚀' }]);
        setEmotion('excited');
        setTimeout(() => {
          onComplete?.();
          navigate('/baseline');
        }, 1500);
      }
    }, 600);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setSelectedOptionIdx(null);
      setInput('');
      setDateInput({ day: '', month: '', year: '' });
      const answerKey = questions[currentStep].id;
      setAnswers(prev => {
        const newAnswers = { ...prev };
        delete newAnswers[answerKey];
        return newAnswers;
      });
      // Remove last 2 messages (user answer + next question), show previous question again
      setMessages(prev => {
        const newMsgs = prev.slice(0, -2);
        return [...newMsgs, { role: 'assistant', content: QUESTIONS[language][prevStep].question }];
      });
      setEmotion('happy');
    }
  };

  // Update stateRef after all functions are defined — no TDZ issues
  stateRef.current = { currentQuestion, currentStep, handleAnswer, handleBack };

  // Extract just the name from phrases like "mein Name ist Aaron" / "my name is Aaron"
  const extractName = (text) => {
    const patterns = [
      /(?:mein name ist|ich bin|ich heiße|ich heisse|nennt mich|name:?)\s+([a-züäöÜÄÖß][a-züäöÜÄÖß\-' ]{0,30})/i,
      /(?:my name is|i am|i'm|call me|name:?)\s+([a-z][a-z\-' ]{0,30})/i,
    ];
    for (const pat of patterns) {
      const match = text.match(pat);
      if (match) return match[1].trim();
    }
    return text.trim();
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    const value = currentQuestion.id === 'name' ? extractName(input) : input;
    handleAnswer(value);
  };

  const getDaysInMonth = (month, year) => {
    if (!month || !year) return 31;
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const validateDay = (val) => val;
  const validateMonth = (val) => val;
  const validateYear = (val) => val;

  const padInput = (val, len) => {
    const str = String(val);
    return str.length === len ? str : str.padStart(len, '0');
  };

  const handleDateKeyDown = (e) => {
    if (e.key === 'Delete') {
      e.preventDefault();
      handleBack();
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (dateFocus === 'day') {
        setDateInput(p => ({ ...p, day: p.day.slice(0, -1) }));
      } else if (dateFocus === 'month') {
        if (dateInput.month) {
          setDateInput(p => ({ ...p, month: p.month.slice(0, -1) }));
        } else {
          setDateFocus('day');
          setDateInput(p => ({ ...p, day: p.day.slice(0, -1) }));
        }
      } else if (dateFocus === 'year') {
        if (dateInput.year) {
          setDateInput(p => ({ ...p, year: p.year.slice(0, -1) }));
        } else {
          setDateFocus('month');
          setDateInput(p => ({ ...p, month: p.month.slice(0, -1) }));
        }
      }
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (dateFocus === 'month') setDateFocus('day');
      else if (dateFocus === 'year') setDateFocus('month');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (dateFocus === 'day') setDateFocus('month');
      else if (dateFocus === 'month') setDateFocus('year');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (dateInput.day && dateInput.month && dateInput.year) {
        const age = new Date().getFullYear() - parseInt(dateInput.year);
        handleAnswer(String(age));
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getEmojiForAnswer = (value) => {
    if (!value) return '🧠';
    const lower = String(value).toLowerCase();
    if (lower.includes('männlich') || lower.includes('male')) return '👨';
    if (lower.includes('weiblich') || lower.includes('female')) return '👩';
    if (lower.includes('divers') || lower.includes('diverse')) return '🌈';
    if (lower.includes('angabe') || lower.includes('not')) return '🤐';
    return '🧠';
  };

  if (phase === 'welcome') {
    return <WelcomeScreen onStart={handleWelcomeDone} />;
  }

  if (phase === 'devicecheck') {
    return <DeviceCheckScreen onDone={() => {
      setPhase('chat');
      const lang = language;
      const welcome = lang === 'de'
        ? 'Hey, willkommen bei mir! 🎉 Ich bin Neuro, dein persönlicher Trainingsbegleiter, und ich freue mich riesig, dich kennenzulernen! Lass mich einfach ein paar schnelle Fragen stellen, dann personalisiere ich dein gesamtes Training speziell für dich. Los geht\'s!'
        : 'Hey there, welcome! 🎉 I\'m Neuro, your personal training coach, and I\'m excited to get to know you! Let me ask you a few quick questions so I can personalize your entire training just for you. Let\'s go!';
      setMessages([
        { role: 'assistant', content: welcome },
        { role: 'assistant', content: QUESTIONS[lang][0].question }
      ]);
    }} />;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #4c1d95 0%, #1e1b4b 40%, #0f0a1e 100%)' }}
    >
      {/* Progress bar — top, full width */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-30">
        <motion.div
          className="h-full rounded-r-full"
          style={{ background: 'linear-gradient(to right, #a855f7, #6366f1)' }}
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots — centered below progress bar */}
      <div className="absolute top-3 left-0 right-0 flex justify-center gap-1.5 z-30">
        {questions.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: i === currentStep ? 1.3 : 1, opacity: i <= currentStep ? 1 : 0.3 }}
            className="rounded-full"
            style={{
              width: i === currentStep ? 8 : 6,
              height: i === currentStep ? 8 : 6,
              background: i <= currentStep ? '#a855f7' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>

      {/* Back button — top left */}
      {currentStep > 0 && (
        <button
          onClick={handleBack}
          disabled={saving}
          className="absolute top-3 left-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all text-xs font-bold disabled:opacity-30"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {language === 'de' ? 'Zurück' : 'Back'}
        </button>
      )}

      {/* Background particles */}
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

      {/* Neuro globe */}
      <div className="flex flex-col items-center pt-10 pb-2 flex-shrink-0 relative z-10">
        <NeuroGlobe size={110} emotion={emotion} />
        <motion.div key={emotion} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-1 text-center">
          <div className="text-white font-black text-xl tracking-tight">Neuro</div>
          <div className="text-white/40 text-xs font-medium mt-0.5">Persönlicher Trainingsbegleiter</div>
        </motion.div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 min-h-0 relative z-10">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
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
                <div
                  style={isUser ? { background: accentColor } : {}}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed font-medium ${
                    isUser
                      ? 'text-white rounded-br-sm'
                      : 'bg-white/10 backdrop-blur-sm text-white/95 border border-white/10 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-6 pt-2">
        {currentQuestion.type === 'text' ? (
          <div className="space-y-2">
            <div className="flex gap-2 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-2">
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentQuestion.placeholder}
                className="flex-1 text-sm bg-transparent text-white px-3 py-2 focus:outline-none placeholder:text-white/25 font-medium"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || saving}
                style={{ background: accentColor }}
                className="w-10 h-10 rounded-xl disabled:opacity-30 flex items-center justify-center transition-all flex-shrink-0 shadow-lg hover:opacity-90"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            {currentQuestion.optional && (
              <button
                onClick={() => handleAnswer('—')}
                className="w-full text-center text-white/30 hover:text-white/50 text-xs font-semibold transition-colors py-1"
              >
                {language === 'de' ? 'Überspringen' : 'Skip'}
              </button>
            )}
          </div>
        ) : currentQuestion.type === 'age' ? (
          <div className="space-y-5">
            {/* Direct number input + slider together */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setAgeSlider(v => Math.max(13, v - 1))} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-black transition-all flex items-center justify-center">−</button>
              <input
                type="number"
                min={13}
                max={99}
                value={ageSlider}
                onChange={e => {
                  const v = Math.min(99, Math.max(13, parseInt(e.target.value) || 13));
                  setAgeSlider(v);
                }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); stateRef.current.handleAnswer(String(ageSlider)); } }}
                className="w-24 text-center text-white font-black text-5xl bg-transparent border-b-2 border-white/40 focus:border-white focus:outline-none"
                style={{ appearance: 'textfield', MozAppearance: 'textfield' }}
              />
              <button onClick={() => setAgeSlider(v => Math.min(99, v + 1))} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-black transition-all flex items-center justify-center">+</button>
            </div>
            <div className="text-white/40 text-sm font-semibold text-center">Jahre</div>
            <div className="px-2">
              <input
                ref={sliderRef}
                type="range"
                min={13}
                max={99}
                value={ageSlider}
                onChange={e => setAgeSlider(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${accentColor} ${((ageSlider - 13) / 86) * 100}%, rgba(255,255,255,0.15) ${((ageSlider - 13) / 86) * 100}%)`,
                  accentColor: accentColor,
                }}
              />
              <div className="flex justify-between text-white/30 text-xs mt-2 font-semibold">
                <span>13</span>
                <span>99</span>
              </div>
            </div>
            <button
              onClick={() => handleAnswer(String(ageSlider))}
              disabled={saving}
              style={{ background: accentColor }}
              className="w-full py-4 rounded-2xl disabled:opacity-30 text-white font-black text-base transition-all shadow-lg hover:opacity-90"
            >
              Bestätigen ✓
            </button>
          </div>
        ) : currentQuestion.type === 'date' ? (
          <div className="space-y-2">
            <div className="text-white/50 text-xs font-semibold mb-2">Geburtsdatum (TT/MM/YYYY)</div>
            <div className="grid grid-cols-3 gap-2">
              <input
                key="day-input"
                autoFocus
                ref={dateFocus === 'day' ? inputRef : null}
                type="text"
                inputMode="numeric"
                placeholder="TT"
                value={dateFocus === 'day' ? dateInput.day : padInput(dateInput.day, 2)}
                onChange={e => {
                   let val = e.target.value.replace(/\D/g, '').slice(-2);
                   const num = parseInt(val) || 0;
                   if (num > 31) val = val.slice(0, -1);
                   setDateInput(p => ({ ...p, day: val }));
                   if (val.length === 2 && num > 0 && num <= 31) {
                     setDateFocus('month');
                   }
                }}
                onKeyDown={handleDateKeyDown}
                onFocus={() => setDateFocus('day')}
                className={`py-3 px-3 rounded-2xl text-center font-bold text-white text-lg transition-all border outline-none focus:outline-none ${
                  dateFocus === 'day'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400'
                    : 'bg-white/10 border-white/15 hover:bg-white/20'
                }`}
              />
              <input
                key="month-input"
                ref={dateFocus === 'month' ? inputRef : null}
                type="text"
                inputMode="numeric"
                placeholder="MM"
                value={dateFocus === 'month' ? dateInput.month : padInput(dateInput.month, 2)}
                onChange={e => {
                   let val = e.target.value.replace(/\D/g, '').slice(-2);
                   const num = parseInt(val) || 0;
                   if (num > 12) val = val.slice(0, -1);
                   setDateInput(p => ({ ...p, month: val }));
                   if (val.length === 2 && num > 0 && num <= 12) {
                     setDateFocus('year');
                   }
                }}
                onKeyDown={handleDateKeyDown}
                onFocus={() => setDateFocus('month')}
                className={`py-3 px-3 rounded-2xl text-center font-bold text-white text-lg transition-all border outline-none focus:outline-none ${
                  dateFocus === 'month'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400'
                    : 'bg-white/10 border-white/15 hover:bg-white/20'
                }`}
              />
              <input
                key="year-input"
                ref={dateFocus === 'year' ? inputRef : null}
                type="text"
                inputMode="numeric"
                placeholder="YYYY"
                value={dateFocus === 'year' ? dateInput.year : padInput(dateInput.year, 4)}
                onChange={e => {
                   let val = e.target.value.replace(/\D/g, '').slice(-4);
                   const num = parseInt(val) || 0;
                   if (val.length === 4 && (num < 1900 || num > new Date().getFullYear())) {
                     val = val.slice(0, -1);
                   }
                   setDateInput(p => ({ ...p, year: val }));
                }}
                onKeyDown={handleDateKeyDown}
                onFocus={() => setDateFocus('year')}
                className={`py-3 px-3 rounded-2xl text-center font-bold text-white text-lg transition-all border outline-none focus:outline-none ${
                  dateFocus === 'year'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400'
                    : 'bg-white/10 border-white/15 hover:bg-white/20'
                }`}
              />
            </div>
            <button
              onClick={() => {
                if (dateInput.day && dateInput.month && dateInput.year) {
                  const age = new Date().getFullYear() - parseInt(dateInput.year);
                  handleAnswer(String(age));
                }
              }}
              disabled={!dateInput.day || !dateInput.month || !dateInput.year || saving}
              className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 text-white font-bold transition-all shadow-lg"
            >
              Bestätigen
            </button>
          </div>
        ) : (
          <div
            ref={selectContainerRef}
            className={`grid gap-2 ${currentQuestion.options.length >= 5 ? 'grid-cols-1' : 'grid-cols-2'}`}
            tabIndex={0}
            style={{ outline: 'none' }}
          >
            {currentQuestion.options.map((opt, idx) => {
              const value = opt.value || opt;
              const label = opt.label || opt;
              return (
                <button
                  key={value}
                  onClick={() => handleAnswer(value)}
                  disabled={saving}
                  style={selectedOptionIdx === idx ? { background: accentColor } : {}}
                  className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 text-white border outline-none focus:outline-none cursor-pointer ${
                    selectedOptionIdx === idx
                      ? 'border-transparent shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 border-white/15'
                  }`}
                >
                  {getEmojiForAnswer(label)} {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}