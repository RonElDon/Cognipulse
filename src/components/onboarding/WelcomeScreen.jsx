import { useState } from 'react';
import { motion } from 'framer-motion';

export default function WelcomeScreen({ onStart }) {
  const [lang, setLang] = useState('de');

  const text = {
    de: {
      title: 'Willkommen bei',
      subtitle: 'Dein persönliches kognitives Trainingsprogramm — angepasst auf dich.',
      features: [
        { icon: '🎯', title: 'Personalisiertes Training', desc: 'Übungen die zu deinen Stärken und Zielen passen' },
        { icon: '🤖', title: 'Neuro — dein KI-Begleiter', desc: 'Analysiert deinen Fortschritt und passt das Training an' },
        { icon: '📈', title: 'Messbarer Fortschritt', desc: 'Verfolge deine kognitive Entwicklung täglich' },
      ],
      cta: "Los geht's! 🚀",
      hint: 'Neuro stellt dir ein paar kurze Fragen zum Einstieg',
    },
    en: {
      title: 'Welcome to',
      subtitle: 'Your personal cognitive training program — tailored just for you.',
      features: [
        { icon: '🎯', title: 'Personalized Training', desc: 'Exercises matched to your strengths and goals' },
        { icon: '🤖', title: 'Neuro — your AI coach', desc: 'Analyzes your progress and adapts your training' },
        { icon: '📈', title: 'Measurable Progress', desc: 'Track your cognitive development every day' },
      ],
      cta: "Let's go! 🚀",
      hint: 'Neuro will ask you a few quick questions to get started',
    },
  };

  const t = text[lang];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm flex flex-col items-center text-center gap-5"
      >
        {/* Language picker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1"
        >
          {[{ code: 'de', label: '🇩🇪 Deutsch' }, { code: 'en', label: '🇬🇧 English' }].map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                lang === l.code
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {l.label}
            </button>
          ))}
        </motion.div>

        {/* Brain logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl"
          style={{ background: 'radial-gradient(circle at 38% 32%, #f5d0fe, #a855f7 55%, #6d28d9)', boxShadow: '0 0 60px rgba(139,92,246,0.5)' }}
        >
          🧠
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <h1 className="text-3xl font-black text-white mb-1">
            {t.title} <span className="text-purple-400">CogniPulse</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">{t.subtitle}</p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full space-y-2"
        >
          {t.features.map(f => (
            <div key={f.title} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-left">
              <span className="text-2xl flex-shrink-0">{f.icon}</span>
              <div>
                <div className="text-white font-bold text-sm">{f.title}</div>
                <div className="text-white/50 text-xs">{f.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onStart(lang)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          {t.cta}
        </motion.button>

        <p className="text-white/30 text-xs">{t.hint}</p>
      </motion.div>
    </div>
  );
}