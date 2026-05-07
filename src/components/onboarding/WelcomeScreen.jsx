import { motion } from 'framer-motion';

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm flex flex-col items-center text-center gap-6"
      >
        {/* Logo / Brain */}
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
            Willkommen bei <span className="text-purple-400">CogniPulse</span>
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Dein persönliches kognitives Trainingsprogramm — angepasst auf dich.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="w-full space-y-3"
        >
          {[
            { icon: '🎯', title: 'Personalisiertes Training', desc: 'Übungen die zu deinen Stärken und Zielen passen' },
            { icon: '🤖', title: 'Neuro — dein KI-Begleiter', desc: 'Analysiert deinen Fortschritt und passt das Training an' },
            { icon: '📈', title: 'Messbarer Fortschritt', desc: 'Verfolge deine kognitive Entwicklung täglich' },
          ].map(f => (
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
          onClick={onStart}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
        >
          Los geht's! 🚀
        </motion.button>

        <p className="text-white/30 text-xs">Neuro stellt dir ein paar kurze Fragen zum Einstieg</p>
      </motion.div>
    </div>
  );
}