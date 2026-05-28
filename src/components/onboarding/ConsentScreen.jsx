import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Check } from 'lucide-react';

const CONSENTS = {
  de: {
    title: 'Deine Daten, dein Training',
    subtitle: 'CogniPulse verarbeitet deine Daten nach DSGVO. Wähle selbst, was du teilen möchtest.',
    items: [
      {
        id: 'training',
        required: true,
        icon: '🎯',
        title: 'Training & Personalisierung',
        desc: 'Notwendig, damit Neuro deinen Plan erstellen und anpassen kann.',
      },
      {
        id: 'research',
        required: false,
        icon: '🔬',
        title: 'Anonyme Forschungsdaten',
        desc: 'Hilft uns, die App wissenschaftlich zu verbessern. Komplett anonym.',
      },
      {
        id: 'marketing',
        required: false,
        icon: '📬',
        title: 'Tipps & Updates per E-Mail',
        desc: 'Erhalte hilfreiche Trainings-Tipps. Jederzeit abbestellbar.',
      },
    ],
    localProcessing: '🔒 Kein Training-Ergebnis verlässt dein Gerät ohne deine Zustimmung.',
    gdprNote: 'Du kannst deine Einwilligungen jederzeit im Profil widerrufen.',
    cta: 'Weiter',
  },
  en: {
    title: 'Your data, your training',
    subtitle: 'CogniPulse processes your data in compliance with GDPR. Choose what you share.',
    items: [
      {
        id: 'training',
        required: true,
        icon: '🎯',
        title: 'Training & Personalization',
        desc: 'Required so Neuro can create and adapt your plan.',
      },
      {
        id: 'research',
        required: false,
        icon: '🔬',
        title: 'Anonymous Research Data',
        desc: 'Helps us improve the app scientifically. Completely anonymous.',
      },
      {
        id: 'marketing',
        required: false,
        icon: '📬',
        title: 'Tips & Updates via Email',
        desc: 'Receive helpful training tips. Unsubscribe anytime.',
      },
    ],
    localProcessing: '🔒 No training result leaves your device without your consent.',
    gdprNote: 'You can revoke your consents at any time in your profile.',
    cta: 'Continue',
  },
};

export default function ConsentScreen({ lang = 'de', onAccept }) {
  const t = CONSENTS[lang] || CONSENTS.de;
  const [consents, setConsents] = useState({ training: true, research: false, marketing: false });

  const toggle = (id, required) => {
    if (required) return;
    setConsents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm space-y-5 py-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Shield className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-2xl font-black text-white">{t.title}</h1>
          <p className="text-white/50 text-sm leading-relaxed">{t.subtitle}</p>
        </div>

        {/* Consent items */}
        <div className="space-y-3">
          {t.items.map(item => {
            const checked = consents[item.id];
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id, item.required)}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  checked
                    ? 'bg-purple-600/15 border-purple-500/40'
                    : 'bg-white/5 border-white/10'
                } ${item.required ? 'cursor-default' : 'cursor-pointer hover:bg-white/8'}`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  checked ? 'bg-purple-600' : 'bg-white/10 border border-white/20'
                }`}>
                  {checked && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-white font-bold text-sm">{item.title}</span>
                    {item.required && (
                      <span className="text-[10px] font-bold bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">Pflicht</span>
                    )}
                  </div>
                  <p className="text-white/45 text-xs mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Local processing note */}
        <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-2xl px-4 py-3">
          <p className="text-emerald-300 text-xs font-semibold leading-relaxed">{t.localProcessing}</p>
        </div>

        {/* GDPR note */}
        <p className="text-white/30 text-xs text-center">{t.gdprNote}</p>

        {/* CTA */}
        <button
          onClick={() => onAccept(consents)}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2"
        >
          {t.cta} <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}