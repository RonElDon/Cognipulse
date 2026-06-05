import { motion } from 'framer-motion';
import { Check, Pencil } from 'lucide-react';

export default function NameConfirm({ name, accentColor, language, onConfirm, onReject }) {
  const text = language === 'de'
    ? { q: `Also, dein Name ist „${name}"? 😊`, yes: 'Ja, das bin ich! ✓', no: 'Nein, ändern' }
    : { q: `So, your name is "${name}"? 😊`, yes: "Yes, that's me! ✓", no: 'No, change it' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="text-center text-white/80 text-sm font-semibold px-2">{text.q}</div>
      <button
        onClick={onConfirm}
        style={{ background: accentColor }}
        className="w-full py-4 rounded-2xl text-white font-black text-base transition-all shadow-lg hover:opacity-90 flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" /> {text.yes}
      </button>
      <button
        onClick={onReject}
        className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/15"
      >
        <Pencil className="w-4 h-4" /> {text.no}
      </button>
    </motion.div>
  );
}