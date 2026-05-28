// ============================================================
//  NEURO BADGE SYSTEM – vollständige Definition
// ============================================================

export const BADGE_TIERS = {
  bronze:  { id: 'bronze',  label: 'Bronze',  color: '#CD7F32', glow: '#CD7F3244', ring: '#CD7F32' },
  silver:  { id: 'silver',  label: 'Silber',   color: '#C0C0C0', glow: '#C0C0C044', ring: '#C0C0C0' },
  gold:    { id: 'gold',    label: 'Gold',     color: '#FFD700', glow: '#FFD70044', ring: '#FFD700' },
  platin:  { id: 'platin',  label: 'Platin',   color: '#8FE9FF', glow: '#8FE9FF44', ring: '#8FE9FF' },
  diamond: { id: 'diamond', label: 'Diamant',  color: '#B388FF', glow: '#B388FF55', ring: '#B388FF' },
  master:  { id: 'master',  label: 'Meister',  color: '#FF6B6B', glow: '#FF6B6B55', ring: '#FF6B6B' },
  legend:  { id: 'legend',  label: 'Legende',  color: 'rainbow', glow: '#ffffff33', ring: 'rainbow' },
};

// ── 1. XP Meilensteine ──────────────────────────────────────
export const XP_BADGES = [
  { id: 'xp_50',    tier: 'bronze',  title: 'Funke',        icon: '✨', threshold: 50,    neuro: 'Erster Funke, dein Netz erwacht.',        category: 'xp', visual: 'spark' },
  { id: 'xp_250',   tier: 'silver',  title: 'Impuls',       icon: '⚡', threshold: 250,   neuro: 'Impuls gesetzt, Verbindung wächst.',       category: 'xp', visual: 'impulse' },
  { id: 'xp_1000',  tier: 'gold',    title: 'Strom',        icon: '🌩️', threshold: 1000,  neuro: 'Dein Strom fließt, 1.000 XP stark.',      category: 'xp', visual: 'current' },
  { id: 'xp_2500',  tier: 'platin',  title: 'Blitz',        icon: '⚡', threshold: 2500,  neuro: 'Blitzschnell, dein Gehirn lädt auf.',      category: 'xp', visual: 'bolt' },
  { id: 'xp_5000',  tier: 'diamond', title: 'Supernova',    icon: '💫', threshold: 5000,  neuro: 'Supernova, du strahlst hell.',             category: 'xp', visual: 'supernova' },
  { id: 'xp_10000', tier: 'master',  title: 'Neuro-Meister',icon: '👑', threshold: 10000, neuro: 'Meisterhaft, du führst dein Denken.',      category: 'xp', visual: 'master' },
  { id: 'xp_20000', tier: 'legend',  title: 'Legende',      icon: '🌈', threshold: 20000, neuro: 'Legende, du schreibst Geschichte.',        category: 'xp', visual: 'legend' },
];

// ── 2. Übungs-Meilensteine ───────────────────────────────────
export const EXERCISE_BADGES = [
  { id: 'ex_5',    tier: 'bronze',  title: 'Starter',      icon: '🌱', threshold: 5,    neuro: 'Start geschafft, weiter so.',              category: 'exercises' },
  { id: 'ex_25',   tier: 'silver',  title: 'Lernender',    icon: '📚', threshold: 25,   neuro: '25 Mal dran, Routine entsteht.',            category: 'exercises' },
  { id: 'ex_100',  tier: 'gold',    title: 'Routinier',    icon: '🎯', threshold: 100,  neuro: 'Hundert geschafft, du bleibst dran.',       category: 'exercises' },
  { id: 'ex_250',  tier: 'platin',  title: 'Athlet',       icon: '🏋️', threshold: 250,  neuro: '250, dein mentales Training zahlt sich aus.',category: 'exercises' },
  { id: 'ex_500',  tier: 'diamond', title: 'Veteran',      icon: '🎖️', threshold: 500,  neuro: 'Veteran, 500 Übungen gemeistert.',          category: 'exercises' },
  { id: 'ex_1000', tier: 'master',  title: 'Champion',     icon: '🏆', threshold: 1000, neuro: 'Tausend, Champion des Fokus.',              category: 'exercises' },
  { id: 'ex_2500', tier: 'legend',  title: 'Unermüdlich',  icon: '♾️', threshold: 2500, neuro: 'Unermüdlich, 2.500 Mal besser.',            category: 'exercises' },
];

// ── 3. Serien-Meilensteine ───────────────────────────────────
export const STREAK_BADGES = [
  { id: 'str_3',   tier: 'bronze',  title: 'Rhythmus',     icon: '🎵', threshold: 3,   neuro: 'Drei Tage, Rhythmus gefunden.',             category: 'streak' },
  { id: 'str_7',   tier: 'silver',  title: 'Gewohnheit',   icon: '📅', threshold: 7,   neuro: 'Eine Woche, Gewohnheit gebaut.',            category: 'streak' },
  { id: 'str_14',  tier: 'gold',    title: 'Disziplin',    icon: '💪', threshold: 14,  neuro: 'Zwei Wochen, Disziplin gewinnt.',           category: 'streak' },
  { id: 'str_30',  tier: 'platin',  title: 'Eisenwille',   icon: '🔩', threshold: 30,  neuro: '30 Tage, Eisenwille bewiesen.',             category: 'streak' },
  { id: 'str_60',  tier: 'diamond', title: 'Unbeirrbar',   icon: '🧊', threshold: 60,  neuro: '60 Tage, nichts hält dich auf.',            category: 'streak' },
  { id: 'str_100', tier: 'master',  title: 'Zenit',        icon: '🌟', threshold: 100, neuro: 'Hundert am Stück, Zenit erreicht.',         category: 'streak' },
  { id: 'str_365', tier: 'legend',  title: 'Jahreskreis',  icon: '🌀', threshold: 365, neuro: 'Ein Jahr, du bist der Kreis.',              category: 'streak' },
];

// ── 4. Bereichs-Meilensteine ─────────────────────────────────
const DOMAIN_BADGE_CONFIGS = [
  { domainId: 'attention',  name: 'Fokus-Linse',       icon: '🔭', color: '#f59e0b' },
  { domainId: 'memory',     name: 'Gedächtnispalast',  icon: '🏛️', color: '#6366f1' },
  { domainId: 'executive',  name: 'Dirigent',          icon: '🎼', color: '#10b981' },
  { domainId: 'visuomotor', name: 'Präzisionshand',    icon: '🤚', color: '#f97316' },
  { domainId: 'processing', name: 'Turbo',             icon: '🚀', color: '#06b6d4' },
  { domainId: 'reasoning',  name: 'Logiker',           icon: '🧩', color: '#f43f5e' },
];

const DOMAIN_TIER_DATA = [
  { tier: 'bronze',  xp: 25,   neuros: {
    attention:  'Erster Fokus, Linse geschärft.',
    memory:     'Erster Raum gebaut.',
    executive:  'Taktstock gehoben, Kontrolle beginnt.',
    visuomotor: 'Erste Treffer, Hand und Auge eins.',
    processing: 'Turbo zündet, Tempo steigt.',
    reasoning:  'Erster Schluss, Logik erwacht.',
  }},
  { tier: 'silver',  xp: 100,  neuros: {
    attention:  'Klarer Blick, Ablenkung verblasst.',
    memory:     'Palast wächst, Erinnerungen bleiben.',
    executive:  'Zweiter Satz, du planst voraus.',
    visuomotor: 'Silber-präzise, Bewegungen fließen.',
    processing: 'Silber-Speed, Denken beschleunigt.',
    reasoning:  'Silber-klar, Muster erkannt.',
  }},
  { tier: 'gold',    xp: 300,  neuros: {
    attention:  'Goldener Fokus, du bleibst dran.',
    memory:     'Goldene Hallen, du merkst dir mehr.',
    executive:  'Goldener Dirigent, Impulse gezähmt.',
    visuomotor: 'Goldene Koordination, schnell und sicher.',
    processing: 'Gold-Turbo, Informationen rauschen.',
    reasoning:  'Goldener Logiker, Probleme zerlegt.',
  }},
  { tier: 'platin',  xp: 750,  neuros: {
    attention:  'Platin-Blick, Details springen hervor.',
    memory:     'Platin-Archiv, Abruf in Sekunden.',
    executive:  'Platin-Orchester, Multitasking gemeistert.',
    visuomotor: 'Platin-Hand, Reaktion ohne Zögern.',
    processing: 'Platin-Boost, du verarbeitest schneller.',
    reasoning:  'Platin-Denker, komplex gelöst.',
  }},
  { tier: 'diamond', xp: 1500, neuros: {
    attention:  'Diamant-scharf, nichts entgeht dir.',
    memory:     'Diamant-Gedächtnis, unvergesslich stark.',
    executive:  'Diamant-Leitung, Entscheidungen klar.',
    visuomotor: 'Diamant-Präzision, pixelgenau getroffen.',
    processing: 'Diamant-Geschwindigkeit, fast Licht.',
    reasoning:  'Diamant-Logik, unfehlbar kombiniert.',
  }},
  { tier: 'master',  xp: 3000, neuros: {
    attention:  'Meister der Aufmerksamkeit, laserpräzise.',
    memory:     'Meister des Palastes, alles griffbereit.',
    executive:  'Meister-Dirigent, dein Gehirn folgt dir.',
    visuomotor: 'Meisterhand, du triffst blind.',
    processing: 'Meister-Turbo, dein Kopf fliegt.',
    reasoning:  'Meister-Logiker, du siehst das System.',
  }},
];

export const DOMAIN_BADGES = DOMAIN_BADGE_CONFIGS.flatMap(cfg =>
  DOMAIN_TIER_DATA.map(td => ({
    id: `dom_${cfg.domainId}_${td.tier}`,
    tier: td.tier,
    title: `${cfg.name}`,
    tierLabel: BADGE_TIERS[td.tier]?.label,
    icon: cfg.icon,
    domainId: cfg.domainId,
    domainColor: cfg.color,
    threshold: td.xp,
    neuro: td.neuros[cfg.domainId],
    category: 'domain',
  }))
);

// ── 5. Besondere Abzeichen ───────────────────────────────────
export const SPECIAL_BADGES = [
  {
    id: 'sp_perfectionist', tier: 'gold',    icon: '💯', title: 'Perfektionist',
    neuro: 'Fünf perfekt, null Fehler, Respekt.', category: 'special',
    condition: (stats) => stats.perfectStreak >= 5,
  },
  {
    id: 'sp_speed_demon',   tier: 'diamond', icon: '🏎️', title: 'Speed-Dämon',
    neuro: 'Unter 180 ms, du bist Blitz.', category: 'special',
    condition: (stats) => stats.subSecondCount >= 3,
  },
  {
    id: 'sp_comeback',      tier: 'silver',  icon: '🔄', title: 'Comeback',
    neuro: 'Zurück nach Pause, stärker als vorher.', category: 'special',
    condition: (stats) => stats.comeback === true,
  },
  {
    id: 'sp_night_owl',     tier: 'silver',  icon: '🦉', title: 'Nachteule',
    neuro: 'Zehn Nächte trainiert, Eule erwacht.', category: 'special',
    condition: (stats) => stats.lateNightSessions >= 10,
  },
  {
    id: 'sp_early_bird',    tier: 'silver',  icon: '🌅', title: 'Frühaufsteher',
    neuro: 'Vor sieben aktiv, Kopf zuerst.', category: 'special',
    condition: (stats) => stats.earlyMorningSessions >= 10,
  },
  {
    id: 'sp_duel_king',     tier: 'gold',    icon: '⚔️', title: 'Duell-König',
    neuro: 'Zehn Duelle gewonnen, Krone verdient.', category: 'special',
    condition: (stats) => stats.duelsWon >= 10,
  },
  {
    id: 'sp_fair_play',     tier: 'silver',  icon: '🤝', title: 'Fair-Play',
    neuro: '50 Duelle fair, Charakter zählt.', category: 'special',
    condition: (stats) => stats.duelsCompleted >= 50,
  },
  {
    id: 'sp_balance',       tier: 'master',  icon: '⚖️', title: 'Balance-Meister',
    neuro: 'Alle Domänen Gold, Balance perfektioniert.', category: 'special',
    condition: (stats) => stats.allDomainsGold === true,
  },
  {
    id: 'sp_pause_pro',     tier: 'bronze',  icon: '🧘', title: 'Pause-Profi',
    neuro: 'Zehn Pausen angenommen, klug trainiert.', category: 'special',
    condition: (stats) => stats.pausesAccepted >= 10,
  },
];

// ── Alle Badges zusammen ─────────────────────────────────────
export const ALL_BADGES = [
  ...XP_BADGES,
  ...EXERCISE_BADGES,
  ...STREAK_BADGES,
  ...DOMAIN_BADGES,
  ...SPECIAL_BADGES,
];

// ── Berechnung welche Badges earned sind ────────────────────
export function computeEarnedBadges(results, profile, duels = []) {
  const totalXP = profile?.total_xp || 0;
  const totalExercises = results.length;
  const streak = profile?.longest_streak || 0;

  // Domain XP: sum xp_earned per domain
  const domainXP = {};
  for (const r of results) {
    domainXP[r.domain] = (domainXP[r.domain] || 0) + (r.xp_earned || 0);
  }

  // Check if all 6 main domains have gold (≥ 300 domain XP)
  const mainDomains = ['attention', 'memory', 'executive', 'visuomotor', 'processing', 'reasoning'];
  const allDomainsGold = mainDomains.every(d => (domainXP[d] || 0) >= 300);

  // Speed demon: reaction < 180ms in 3 results
  const subSecondCount = results.filter(r => r.reaction_time_ms && r.reaction_time_ms < 180).length;

  // Perfectionist: 5 consecutive 100% accuracy results
  let perfectStreak = 0;
  let maxPerfectStreak = 0;
  for (const r of results) {
    if (r.accuracy === 100 || r.score === 100) {
      perfectStreak++;
      maxPerfectStreak = Math.max(maxPerfectStreak, perfectStreak);
    } else {
      perfectStreak = 0;
    }
  }

  // Duels
  const duelsWon = duels.filter(d => d.winner_email !== undefined && d.challenger_score !== undefined).length;
  const duelsCompleted = duels.filter(d => d.status === 'completed').length;

  const stats = {
    totalXP,
    totalExercises,
    streak,
    domainXP,
    allDomainsGold,
    subSecondCount,
    perfectStreak: maxPerfectStreak,
    duelsWon,
    duelsCompleted,
    comeback: false,
    lateNightSessions: 0,
    earlyMorningSessions: 0,
    pausesAccepted: 0,
  };

  const earned = new Set();

  // XP badges
  for (const b of XP_BADGES) {
    if (totalXP >= b.threshold) earned.add(b.id);
  }

  // Exercise badges
  for (const b of EXERCISE_BADGES) {
    if (totalExercises >= b.threshold) earned.add(b.id);
  }

  // Streak badges
  for (const b of STREAK_BADGES) {
    if (streak >= b.threshold) earned.add(b.id);
  }

  // Domain badges
  for (const b of DOMAIN_BADGES) {
    if ((domainXP[b.domainId] || 0) >= b.threshold) earned.add(b.id);
  }

  // Special badges
  for (const b of SPECIAL_BADGES) {
    if (b.condition(stats)) earned.add(b.id);
  }

  return earned;
}

export const CATEGORY_LABELS = {
  xp: { label: 'Synapsen-Reise', icon: '⚡', desc: 'XP-Meilensteine' },
  exercises: { label: 'Wiederholungs-Kraft', icon: '💪', desc: 'Übungs-Meilensteine' },
  streak: { label: 'Rhythmus', icon: '🔥', desc: 'Serien-Meilensteine' },
  domain: { label: 'Bereiche', icon: '🧠', desc: 'Domänen-Meisterschaft' },
  special: { label: 'Besondere', icon: '🌟', desc: 'Spezielle Erfolge' },
};