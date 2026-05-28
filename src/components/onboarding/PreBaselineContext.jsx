import { useState } from 'react';
import { motion } from 'framer-motion';

const QUESTIONS = [
  {
    id: 'sleep',
    icon: '😴',
    label: 'Wie hast du letzte Nacht geschlafen?',
    options: [
      { value: 'gut', label: 'Gut (7+ Std.)' },
      { value: 'mittel', label: 'Okay (5–7 Std.)' },
      { value: 'schlecht', label: 'Schlecht (<5 Std.)' },
    ],
  },
  {
    id: 'caffeine',
    icon: '☕',
    label: 'Koffein heute?',
    options: [
      { value: 'keins', label: 'Nein' },
      { value: 'wenig', label: '1–2 Tassen' },
      { value: 'viel', label: '3+ Tassen' },
    ],
  },
  {
    id: 'distraction',
    icon: '🔇',
    label: 'Wie ruhig ist deine Umgebung gerade?',
    options: [
      { value: 'ruhig', label: 'Ruhig' },
      { value: 'mittel', label: 'Etwas Lärm' },
      { value: 'laut', label: 'Viel Ablenkung' },
    ],
  },
];

export default function PreBaselineContext({ onDone }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = QUESTIONS[step];

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1);
    } else {
      onDone(newAnswers);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        className="w-full max-w-sm text-center space-y-6"
      >
        {/* Progress */}
        <div className="flex justify-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-purple-400' : i < step ? 'w-4 bg-emerald-500' : 'w-4 bg-white/15'}`} />
          ))}
        </div>

        <div className="text-xs text-white/30 font-semibold uppercase tracking-widest">Kurze Vorbereitung</div>

        <div className="text-5xl">{current.icon}</div>

        <h2 className="text-xl font-black text-white">{current.label}</h2>

        <div className="space-y-2">
          {current.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="w-full py-3.5 px-5 rounded-2xl bg-white/5 border border-white/15 text-white font-bold hover:bg-white/10 hover:border-purple-500/50 transition-all text-sm"
            >
              {opt.label}
            </button>
          ))}
        </div>

        <p className="text-white/25 text-xs">Diese Angaben helfen Neuro, deine Ergebnisse besser einzuordnen.</p>
      </motion.div>
    </div>
  );
}