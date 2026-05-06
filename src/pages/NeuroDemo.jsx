import { useState } from 'react';
import { motion } from 'framer-motion';
import NeuroCharacter from '@/components/mascot/NeuroCharacter';

const EMOTIONS = [
  { id: 'happy',       label: '😊 Fröhlich',      desc: 'Standardmodus — freundlich & offen' },
  { id: 'excited',     label: '🤩 Begeistert',     desc: 'Bei Erfolgen & neuen Rekorden' },
  { id: 'proud',       label: '🌟 Stolz',          desc: 'Nach starken Leistungen' },
  { id: 'encouraging', label: '💪 Motivierend',    desc: 'Wenn du eine Pause gemacht hast' },
  { id: 'thinking',    label: '🤔 Nachdenkend',    desc: 'Während Neuro antwortet' },
  { id: 'focused',     label: '🎯 Konzentriert',   desc: 'Beim Erklären von Trainingsplänen' },
  { id: 'sad',         label: '😟 Besorgt',        desc: 'Bei schlechten Ergebnissen' },
  { id: 'sleeping',    label: '😴 Schlafend',      desc: 'Lange inaktiv' },
];

export default function NeuroDemo() {
  const [selected, setSelected] = useState('happy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/40 p-6 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-800 mb-2">Neuro — Charakter-Design</h1>
          <p className="text-slate-500">Klick auf eine Emotion um Neuro zu sehen</p>
        </div>

        {/* Big preview */}
        <motion.div
          className="flex justify-center mb-10"
          key={selected}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <NeuroCharacter emotion={selected} size={160} />
        </motion.div>

        {/* Emotion selector */}
        <div className="grid grid-cols-2 gap-3">
          {EMOTIONS.map(e => (
            <motion.button
              key={e.id}
              onClick={() => setSelected(e.id)}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all border-2 ${
                selected === e.id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200'
                  : 'bg-white text-slate-700 border-slate-100 hover:border-purple-200 hover:shadow-md'
              }`}
            >
              <NeuroCharacter emotion={e.id} size={48} />
              <div>
                <div className={`font-black text-sm ${selected === e.id ? 'text-white' : 'text-slate-800'}`}>
                  {e.label}
                </div>
                <div className={`text-xs mt-0.5 ${selected === e.id ? 'text-white/80' : 'text-slate-500'}`}>
                  {e.desc}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Alle Animationen laufen in Echtzeit — keine Videos oder GIFs
        </p>
      </div>
    </div>
  );
}