import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Send } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';

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
    { id: 'name', question: 'Lass mich dich kennenlernen — wie heißt du? 😊', placeholder: 'Dein Name...', type: 'text' },
    { id: 'age', question: 'Und wie viele Jahre Gehirn-Power hast du bereits? 🧠', placeholder: 'Alter...', type: 'number' },
    { id: 'gender', question: 'Was ist dein Geschlecht? ⚧️', options: ['männlich', 'weiblich', 'divers', 'keine Angabe'], type: 'select' },
    { id: 'goal', question: 'Was treibt dich an? Was möchtest du mit deinem Gehirn erreichen? 🎯', placeholder: 'z.B. Gedächtnis verbessern, fokussierter werden...', type: 'text' },
    { id: 'dailyExercises', question: 'Wie viel Zeit hast du pro Tag für dein Brain-Workout?', options: ['1', '3', '5', '10'], type: 'select' },
  ],
  en: [
    { id: 'name', question: 'Let me get to know you — what\'s your name? 😊', placeholder: 'Your name...', type: 'text' },
    { id: 'age', question: 'How many years of brain power do you have? 🧠', placeholder: 'Your age...', type: 'number' },
    { id: 'gender', question: 'How would you like to be addressed?', options: ['male', 'female', 'diverse', 'prefer not to say'], type: 'select' },
    { id: 'goal', question: 'What drives you? What do you want to achieve with your brain? 💪', placeholder: 'e.g. improve memory, better focus...', type: 'text' },
    { id: 'dailyExercises', question: 'How much time do you have for your daily brain training?', options: ['1', '3', '5', '10'], type: 'select' },
  ],
};

export default function OnboardingFlow({ onComplete }) {
  const [phase, setPhase] = useState('welcome');
  const [language, setLanguage] = useState('de');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [emotion, setEmotion] = useState('happy');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const questions = QUESTIONS[language];
  const currentQuestion = questions[currentStep];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleWelcomeDone = (lang) => {
    setLanguage(lang);
    setPhase('chat');
    // Start with welcome message and first question
    const welcome = lang === 'de'
      ? 'Hey, willkommen bei mir! 🎉 Ich bin Neuro, dein persönlicher Trainingsbegleiter, und ich freue mich riesig, dich kennenzulernen! Lass mich einfach ein paar schnelle Fragen stellen, dann personalisiere ich dein gesamtes Training speziell für dich. Los geht\'s!'
      : 'Hey there, welcome! 🎉 I\'m Neuro, your personal training coach, and I\'m excited to get to know you! Let me ask you a few quick questions so I can personalize your entire training just for you. Let\'s go!';
    setMessages([
      { role: 'assistant', content: welcome },
      { role: 'assistant', content: QUESTIONS[lang][0].question }
    ]);
  };

  const handleAnswer = async (value) => {
    if (!value && value !== 0) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    setInput('');
    
    // Add user message with emoji
    const displayValue = currentQuestion.type === 'select' ? `${getEmojiForAnswer(value)} ${value}` : String(value);
    setMessages(prev => [...prev, { role: 'user', content: displayValue }]);
    setEmotion('thinking');

    // Move to next question or finish
    setTimeout(async () => {
      if (currentStep < questions.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        setMessages(prev => [...prev, { role: 'assistant', content: QUESTIONS[language][nextStep].question }]);
        setEmotion('happy');
      } else {
        // Save all data
        setSaving(true);
        try {
          const user = await base44.auth.me();
          const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
          
          if (profiles.length > 0) {
            const profileId = profiles[0].id;
            await base44.entities.UserProfile.update(profileId, {
              display_name: answers.name || user.full_name,
              age: parseInt(answers.age) || null,
              gender: answers.gender || null,
              preferred_language: language,
              goals: {
                daily_exercises: parseInt(answers.dailyExercises) || 3,
                focus_domains: []
              },
              onboarding_completed: true,
            });
          }
        } catch (e) {
          console.error('Onboarding save error:', e);
        }
        setSaving(false);
        setMessages(prev => [...prev, { role: 'assistant', content: language === 'de' ? 'Perfekt! Viel Erfolg beim Training! 🚀' : 'Perfect! Have fun training! 🚀' }]);
        setEmotion('excited');
        setTimeout(() => onComplete?.(), 1500);
      }
    }, 600);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    handleAnswer(input);
  };

  const handleKeyDown = (e) => {
    if (currentQuestion.type === 'select') {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedOptionIdx(Math.max(0, selectedOptionIdx - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedOptionIdx(Math.min(currentQuestion.options.length - 1, selectedOptionIdx + 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleAnswer(currentQuestion.options[selectedOptionIdx]);
      }
    } else if (e.key === 'Enter') {
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #4c1d95 0%, #1e1b4b 40%, #0f0a1e 100%)' }}
    >
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
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 flex-shrink-0 px-4 pb-6 pt-2">
        {currentQuestion.type === 'text' || currentQuestion.type === 'number' ? (
          <div className="flex gap-2 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-2">
            <input
              ref={inputRef}
              autoFocus
              type={currentQuestion.type === 'number' ? 'number' : 'text'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentQuestion.placeholder}
              className="flex-1 text-sm bg-transparent text-white px-3 py-2 focus:outline-none placeholder:text-white/25 font-medium"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || saving}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 flex items-center justify-center transition-all flex-shrink-0 shadow-lg"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                onKeyDown={(e) => {
                  const cols = 2;
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setSelectedOptionIdx((prev) => prev % cols === 0 ? prev + 1 : prev - 1);
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setSelectedOptionIdx((prev) => prev % cols === 0 ? prev + 1 : prev - 1);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedOptionIdx((prev) => (prev - cols + currentQuestion.options.length) % currentQuestion.options.length);
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedOptionIdx((prev) => (prev + cols) % currentQuestion.options.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAnswer(opt);
                  }
                }}
                tabIndex={selectedOptionIdx === idx ? 0 : -1}
                autoFocus={idx === 0}
                disabled={saving}
                className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all disabled:opacity-50 text-white border ${
                  selectedOptionIdx === idx
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 shadow-lg'
                    : 'bg-white/10 hover:bg-white/20 border-white/15'
                }`}
              >
                {getEmojiForAnswer(opt)} {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}