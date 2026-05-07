import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DOMAINS } from '@/lib/exercises';

export default function PostAssessmentNeuro({ results }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('offer'); // offer | comparing | plan
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phase === 'comparing') {
      fetchAllProfiles();
    }
  }, [phase]);

  const fetchAllProfiles = async () => {
    setLoading(true);
    try {
      const profiles = await base44.entities.UserProfile.list('', 100);
      setAllProfiles(profiles);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const calculateAverages = () => {
    if (!allProfiles.length) return {};
    const avgByDomain = {};
    Object.keys(DOMAINS).forEach(domain => {
      const domainProfiles = allProfiles.filter(p => p.baseline_results?.domain_scores?.[domain]);
      const scores = domainProfiles.map(p => p.baseline_results.domain_scores[domain]);
      avgByDomain[domain] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    });
    return avgByDomain;
  };

  const getUserDomainScores = () => {
    const scores = {};
    results.forEach(r => {
      scores[r.domain] = r.score;
    });
    return scores;
  };

  const handleCreatePlan = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        // Mark that user needs to purchase plan
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

  // OFFER PHASE
  if (phase === 'offer') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-5xl">🧠</div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Großartig abgeschlossen!</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Du hast dein Baseline-Assessment erfolgreich gemacht. Jetzt die wichtige Frage:
            </p>
          </div>
          <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-white font-semibold">Möchtest du sehen, wie du im Vergleich zu anderen Nutzern abschneidest?</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => setPhase('comparing')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-base shadow-xl hover:from-blue-500 hover:to-cyan-500 transition-all"
            >
              Ja, zeig mir den Vergleich 📊
            </button>
            <button
              onClick={() => setPhase('plan')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
            >
              Nein, mein persönlicher Plan 🎯
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // COMPARING PHASE
  if (phase === 'comparing') {
    const communityAvg = calculateAverages();
    const userScores = getUserDomainScores();

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-5xl">📊</div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Deine Leistung vs. Community</h1>
            <p className="text-white/60 text-xs">Basierend auf {allProfiles.length} Nutzern</p>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(DOMAINS).map(([domain, domainMeta]) => {
              const yourScore = userScores[domain] || 0;
              const communityScore = communityAvg[domain] || 0;
              const isAbove = yourScore >= communityScore;
              return (
                <div key={domain} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-sm flex items-center gap-2">
                      <span className="text-lg">{domainMeta.icon}</span>
                      {domainMeta.name}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isAbove ? 'bg-emerald-900/50 text-emerald-300' : 'bg-amber-900/50 text-amber-300'}`}>
                      {isAbove ? '↑ Über' : '↓ Unter'} Durchschnitt
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-left flex-1">
                      <div className="text-white/60 text-xs">Dein Score</div>
                      <div className="text-white font-black text-lg">{yourScore}%</div>
                    </div>
                    <div className="text-right flex-1">
                      <div className="text-white/60 text-xs">Community</div>
                      <div className="text-white/80 font-black text-lg">{communityScore}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleCreatePlan()}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-black text-base shadow-xl hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-40 transition-all"
          >
            Weiter zum Training 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  // PLAN PHASE
  if (phase === 'plan') {
    const userScores = getUserDomainScores();
    const weakestDomain = Object.entries(userScores).sort(([, a], [, b]) => a - b)[0];
    const bestDomain = Object.entries(userScores).sort(([, a], [, b]) => b - a)[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm text-center space-y-6"
        >
          <div className="text-5xl">🎯</div>
          <div>
            <h1 className="text-2xl font-black text-white mb-2">Dein persönliches Trainingsprofil</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Basierend auf deinen Ergebnissen habe ich einen maßgeschneiderten Plan erstellt.
            </p>
          </div>

          <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-5 text-left">
            <div>
              <span className="text-white/60 text-xs font-semibold">Deine Stärke:</span>
              <div className="text-white font-black mt-1 flex items-center gap-2">
                <span className="text-2xl">{DOMAINS[bestDomain?.[0]]?.icon}</span>
                {DOMAINS[bestDomain?.[0]]?.name} ({bestDomain?.[1]}%)
              </div>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <span className="text-white/60 text-xs font-semibold">Verbesserungspotenzial:</span>
              <div className="text-white font-black mt-1 flex items-center gap-2">
                <span className="text-2xl">{DOMAINS[weakestDomain?.[0]]?.icon}</span>
                {DOMAINS[weakestDomain?.[0]]?.name} ({weakestDomain?.[1]}%)
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-5">
            <div className="text-white/80 text-sm font-semibold mb-2">Dein Premium-Plan beinhaltet:</div>
            <ul className="text-white/60 text-xs space-y-1 text-left">
              <li>✓ Adaptive Übungen für deine Schwachstellen</li>
              <li>✓ Fokus auf {DOMAINS[weakestDomain?.[0]]?.name}</li>
              <li>✓ Tägliche personalisierte Trainingspläne</li>
              <li>✓ Fortschritts-Analysen & Empfehlungen</li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleCreatePlan()}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-base shadow-xl hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 transition-all"
            >
              Premium-Plan freischalten 💎
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
            >
              Später ansehen
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
}