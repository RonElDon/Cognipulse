import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DOMAINS } from '@/lib/exercises';

const DOMAIN_EXPLANATIONS = {
  attention: {
    short: 'Aufmerksamkeit ist deine Fähigkeit, dich auf Wichtiges zu konzentrieren und Ablenkungen auszublenden.',
    example: '→ Hilfreich z.B. beim Lesen oder in Meetings mit vielen Gesprächen.',
  },
  memory: {
    short: 'Arbeitsgedächtnis hält Informationen kurz im Kopf, während du sie verarbeitest.',
    example: '→ Hilfreich z.B. wenn du eine Telefonnummer im Kopf behältst oder Anweisungen folgst.',
  },
  executive: {
    short: 'Exekutive Funktionen steuern Planung, Impulskontrolle und flexibles Umdenken.',
    example: '→ Hilfreich z.B. beim Wechsel zwischen Aufgaben oder beim Unterdrücken von Ablenkungen.',
  },
  visuomotor: {
    short: 'Visuomotorik verbindet das, was du siehst, mit schnellen, präzisen Bewegungen.',
    example: '→ Hilfreich z.B. beim Tippen, beim Sport oder beim Autofahren.',
  },
  processing: {
    short: 'Verarbeitungsgeschwindigkeit ist, wie schnell dein Gehirn Informationen aufnimmt und reagiert.',
    example: '→ Hilfreich z.B. im Gespräch, beim Lesen oder beim schnellen Entscheiden.',
  },
  reasoning: {
    short: 'Logisches Denken hilft dir, Muster zu erkennen, Probleme zu lösen und Schlüsse zu ziehen.',
    example: '→ Hilfreich z.B. beim Planen, Strategiespiele oder beim Lösen komplexer Aufgaben.',
  },
};

// Estimate percentile rank — simple approximation based on score
function estimatePercentile(score, domain) {
  // Rough bell-curve approximation: mean ~65, sd ~15
  const z = (score - 65) / 15;
  const percentile = Math.min(99, Math.max(1, Math.round(50 + z * 34)));
  return percentile;
}

function getPercentileLabel(p) {
  if (p >= 90) return { label: 'Top 10%', color: 'text-emerald-400', bg: 'bg-emerald-900/30 border-emerald-500/30' };
  if (p >= 75) return { label: 'Top 25%', color: 'text-cyan-400', bg: 'bg-cyan-900/30 border-cyan-500/30' };
  if (p >= 50) return { label: 'Überdurchschnitt', color: 'text-blue-400', bg: 'bg-blue-900/30 border-blue-500/30' };
  if (p >= 25) return { label: 'Durchschnitt', color: 'text-amber-400', bg: 'bg-amber-900/30 border-amber-500/30' };
  return { label: 'Verbesserungspotenzial', color: 'text-rose-400', bg: 'bg-rose-900/30 border-rose-500/30' };
}

function getNeuroFeedback(results) {
  const scores = results.map(r => r.score);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const best = results.sort((a, b) => b.score - a.score)[0];
  const weakest = results.sort((a, b) => a.score - b.score)[0];
  const bestDomainName = DOMAINS[best?.domain]?.nameDE || best?.domain;
  const weakDomainName = DOMAINS[weakest?.domain]?.nameDE || weakest?.domain;

  if (avg >= 80) {
    return `Wow, das war beeindruckend! 🌟 Dein Durchschnittsscore von ${avg}% zeigt, dass dein Gehirn in Topform ist — besonders in ${bestDomainName}. Ich werde dir ein anspruchsvolles Training zusammenstellen, das dich weiter fordert.`;
  } else if (avg >= 60) {
    return `Sehr solide Leistung! 🧠 Dein Durchschnitt liegt bei ${avg}%. Deine Stärke ist klar ${bestDomainName}. In ${weakDomainName} sehe ich das größte Wachstumspotenzial — genau dort werden wir ansetzen.`;
  } else {
    return `Guter Start! 💪 Mit ${avg}% Durchschnitt habe ich ein klares Bild, wo ich dir am besten helfen kann. ${weakDomainName} wird unser erster Fokus sein — du wirst schnell Fortschritte sehen.`;
  }
}

export default function PostAssessmentNeuro({ results }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('neuro'); // neuro | results | plan
  const [loading, setLoading] = useState(false);
  const [expandedDomain, setExpandedDomain] = useState(null);

  const neuroMessage = getNeuroFeedback([...results]);

  const getUserDomainScores = () => {
    const scores = {};
    results.forEach(r => { scores[r.domain] = r.score; });
    return scores;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, {
          baseline_assessment_completed: true,
          onboarding_completed: true,
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    navigate('/');
  };

  // ── NEURO FEEDBACK PHASE ───────────────────────────────────
  if (phase === 'neuro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="text-7xl"
          >
            🧠
          </motion.div>

          <div>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Neuro sagt</div>
            <div className="bg-white/8 border border-white/10 rounded-2xl p-5 text-left">
              <p className="text-white/90 text-sm leading-relaxed font-medium">{neuroMessage}</p>
            </div>
          </div>

          <button
            onClick={() => setPhase('results')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Meine Ergebnisse ansehen 📊
          </button>
        </motion.div>
      </div>
    );
  }

  // ── RESULTS PHASE ──────────────────────────────────────────
  if (phase === 'results') {
    const userScores = getUserDomainScores();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 p-6 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm mx-auto space-y-4 py-6"
        >
          <div className="text-center mb-2">
            <h1 className="text-2xl font-black text-white mb-1">Deine kognitive Baseline</h1>
            <p className="text-white/40 text-xs">Alter-adjustierte Einordnung</p>
          </div>

          {results.map((r) => {
            const domain = DOMAINS[r.domain];
            const percentile = estimatePercentile(r.score, r.domain);
            const pLabel = getPercentileLabel(percentile);
            const explanation = DOMAIN_EXPLANATIONS[r.domain];
            const isExpanded = expandedDomain === r.domain;

            return (
              <motion.div key={r.domain} layout className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedDomain(isExpanded ? null : r.domain)}
                  className="w-full p-4 text-left flex items-center gap-3"
                >
                  <span className="text-2xl flex-shrink-0">{domain?.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-white font-bold text-sm">{domain?.nameDE || domain?.name}</span>
                      <span className="text-white font-black text-base">{r.score}%</span>
                    </div>
                    {/* Score bar */}
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: domain?.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${r.score}%` }}
                        transition={{ duration: 0.7 }}
                      />
                    </div>
                    <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${pLabel.bg} ${pLabel.color}`}>
                      {pLabel.label} · {percentile}. Perzentile
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && explanation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 pb-4 border-t border-white/8"
                    >
                      <p className="text-white/70 text-xs leading-relaxed mt-3">{explanation.short}</p>
                      <p className="text-white/40 text-xs leading-relaxed mt-1.5 italic">{explanation.example}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          <p className="text-white/25 text-xs text-center pt-1">Tippe auf einen Bereich für mehr Infos</p>

          <button
            onClick={() => setPhase('plan')}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-base shadow-xl hover:from-emerald-500 hover:to-teal-500 transition-all"
          >
            Meinen Plan erstellen 🎯
          </button>
        </motion.div>
      </div>
    );
  }

  // ── PLAN PHASE ─────────────────────────────────────────────
  if (phase === 'plan') {
    const userScores = getUserDomainScores();
    const sortedDomains = Object.entries(userScores).sort(([, a], [, b]) => a - b);
    const weakestDomain = sortedDomains[0];
    const bestDomain = sortedDomains[sortedDomains.length - 1];
    const focusDomains = sortedDomains.slice(0, 3).map(([d]) => d);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-5"
        >
          <div className="text-5xl">🎯</div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Dein persönlicher Trainingsplan</h1>
            <p className="text-white/50 text-sm">Basierend auf deiner Baseline startet Neuro mit diesen 3 Fokus-Bereichen:</p>
          </div>

          <div className="space-y-2">
            {focusDomains.map((d, i) => {
              const domain = DOMAINS[d];
              return (
                <div key={d} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-left">
                  <span className="text-xl">{domain?.icon}</span>
                  <div className="flex-1">
                    <div className="text-white font-bold text-sm">{domain?.nameDE || domain?.name}</div>
                    <div className="text-white/40 text-xs">{userScores[d]}% Baseline-Score</div>
                  </div>
                  <div className="text-white/30 text-xs font-bold">#{i + 1} Priorität</div>
                </div>
              );
            })}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">Deine Stärke</span>
              <span className="text-white font-bold text-sm">{DOMAINS[bestDomain?.[0]]?.icon} {DOMAINS[bestDomain?.[0]]?.nameDE} ({bestDomain?.[1]}%)</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">Fokus-Bereich</span>
              <span className="text-white font-bold text-sm">{DOMAINS[weakestDomain?.[0]]?.icon} {DOMAINS[weakestDomain?.[0]]?.nameDE} ({weakestDomain?.[1]}%)</span>
            </div>
          </div>

          <button
            onClick={handleFinish}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 transition-all"
          >
            {loading ? 'Einen Moment...' : 'Training starten 🚀'}
          </button>
        </motion.div>
      </div>
    );
  }
}