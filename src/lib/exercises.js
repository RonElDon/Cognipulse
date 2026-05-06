export const DOMAINS = {
  attention: {
    id: 'attention',
    name: 'Attention',
    nameDE: 'Aufmerksamkeit',
    icon: '🎯',
    color: '#f59e0b',
    gradient: 'gradient-attention',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    description: 'Focus, concentration, and sustained attention',
    descriptionDE: 'Fokus, Konzentration und anhaltende Aufmerksamkeit',
  },
  memory: {
    id: 'memory',
    name: 'Memory',
    nameDE: 'Gedächtnis',
    icon: '🧠',
    color: '#6366f1',
    gradient: 'gradient-memory',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    description: 'Short-term, working, and long-term memory',
    descriptionDE: 'Kurzzeit-, Arbeits- und Langzeitgedächtnis',
  },
  executive: {
    id: 'executive',
    name: 'Executive Functions',
    nameDE: 'Exekutive Funktionen',
    icon: '⚙️',
    color: '#10b981',
    gradient: 'gradient-executive',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    description: 'Planning, flexibility, and cognitive control',
    descriptionDE: 'Planung, Flexibilität und kognitive Kontrolle',
  },
  visuomotor: {
    id: 'visuomotor',
    name: 'Visuomotor Skills',
    nameDE: 'Visuomotorische Fähigkeiten',
    icon: '👁️',
    color: '#f97316',
    gradient: 'gradient-visuomotor',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    description: 'Hand-eye coordination and spatial awareness',
    descriptionDE: 'Hand-Auge-Koordination und räumliches Bewusstsein',
  },
  processing: {
    id: 'processing',
    name: 'Processing Speed',
    nameDE: 'Verarbeitungsgeschwindigkeit',
    icon: '⚡',
    color: '#06b6d4',
    gradient: 'gradient-processing',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    description: 'Mental speed and quick decision making',
    descriptionDE: 'Mentale Geschwindigkeit und schnelle Entscheidungsfindung',
  },
  reasoning: {
    id: 'reasoning',
    name: 'Reasoning & Logic',
    nameDE: 'Schlussfolgerung & Logik',
    icon: '🔮',
    color: '#f43f5e',
    gradient: 'gradient-reasoning',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    description: 'Problem solving, patterns, and logical thinking',
    descriptionDE: 'Problemlösung, Muster und logisches Denken',
  },
};

export const EXERCISES = [
  // ATTENTION
  { id: 'att_1', domain: 'attention', name: 'Spotlight Focus', nameDE: 'Scheinwerfer Fokus', description: 'Track a moving target among distractors', difficulty: 1, xpReward: 20, icon: '🔦' },
  { id: 'att_2', domain: 'attention', name: 'Number Hunt', nameDE: 'Zahlenjagd', description: 'Find specific numbers in a rapidly changing grid', difficulty: 2, xpReward: 30, icon: '🔢' },
  { id: 'att_3', domain: 'attention', name: 'Color Switch', nameDE: 'Farbenwechsel', description: 'Respond only to specific colors, ignore others', difficulty: 2, xpReward: 30, icon: '🎨' },
  { id: 'att_4', domain: 'attention', name: 'Sustained Watch', nameDE: 'Dauerwache', description: 'Detect rare targets in a stream of stimuli', difficulty: 3, xpReward: 40, icon: '👀' },

  // MEMORY
  { id: 'mem_1', domain: 'memory', name: 'Memory Match', nameDE: 'Gedächtnis-Match', description: 'Flip and match pairs of cards', difficulty: 1, xpReward: 20, icon: '🃏' },
  { id: 'mem_2', domain: 'memory', name: 'Sequence Recall', nameDE: 'Sequenz-Erinnerung', description: 'Remember and repeat sequences of items', difficulty: 2, xpReward: 35, icon: '📋' },
  { id: 'mem_3', domain: 'memory', name: 'Word List', nameDE: 'Wortliste', description: 'Memorize and recall a growing list of words', difficulty: 2, xpReward: 30, icon: '📝' },
  { id: 'mem_4', domain: 'memory', name: 'N-Back Challenge', nameDE: 'N-Back Herausforderung', description: 'Remember items from N steps back', difficulty: 3, xpReward: 50, icon: '🔄' },

  // EXECUTIVE
  { id: 'exe_1', domain: 'executive', name: 'Task Switch', nameDE: 'Aufgabenwechsel', description: 'Switch between two tasks fluidly', difficulty: 2, xpReward: 35, icon: '🔀' },
  { id: 'exe_2', domain: 'executive', name: 'Stop Signal', nameDE: 'Stoppsignal', description: 'Inhibit a response when a stop signal appears', difficulty: 2, xpReward: 30, icon: '🛑' },
  { id: 'exe_3', domain: 'executive', name: 'Tower of Logic', nameDE: 'Logikturm', description: 'Move discs to recreate a target configuration', difficulty: 3, xpReward: 50, icon: '🗼' },
  { id: 'exe_4', domain: 'executive', name: 'Stroop Challenge', nameDE: 'Stroop-Herausforderung', description: 'Name the ink color, not the word', difficulty: 2, xpReward: 40, icon: '🌈' },

  // VISUOMOTOR
  { id: 'vis_1', domain: 'visuomotor', name: 'Dot Connect', nameDE: 'Punkte verbinden', description: 'Connect dots in the correct order quickly', difficulty: 1, xpReward: 20, icon: '⭕' },
  { id: 'vis_2', domain: 'visuomotor', name: 'Shape Trace', nameDE: 'Formennachfahren', description: 'Trace complex shapes accurately', difficulty: 2, xpReward: 30, icon: '✏️' },
  { id: 'vis_3', domain: 'visuomotor', name: 'Target Tap', nameDE: 'Ziel antippen', description: 'Tap targets as they appear with speed and precision', difficulty: 2, xpReward: 35, icon: '🎯' },
  { id: 'vis_4', domain: 'visuomotor', name: 'Mirror Draw', nameDE: 'Spiegelzeichnung', description: 'Mirror a pattern on the opposite side', difficulty: 3, xpReward: 45, icon: '🪞' },

  // PROCESSING SPEED
  { id: 'pro_1', domain: 'processing', name: 'Symbol Match', nameDE: 'Symbol-Match', description: 'Match symbols to their codes as fast as possible', difficulty: 1, xpReward: 20, icon: '⚡' },
  { id: 'pro_2', domain: 'processing', name: 'Quick Sort', nameDE: 'Schnellsortierung', description: 'Sort items into categories with speed', difficulty: 2, xpReward: 30, icon: '🗂️' },
  { id: 'pro_3', domain: 'processing', name: 'Reaction Timer', nameDE: 'Reaktionszeitmesser', description: 'React to stimuli as fast as possible', difficulty: 1, xpReward: 25, icon: '⏱️' },
  { id: 'pro_4', domain: 'processing', name: 'Decision Dash', nameDE: 'Entscheidungs-Sprint', description: 'Make rapid correct choices in a stream', difficulty: 3, xpReward: 45, icon: '🏃' },

  // REASONING
  { id: 'rea_1', domain: 'reasoning', name: 'Pattern Master', nameDE: 'Muster-Meister', description: 'Identify and complete visual patterns', difficulty: 2, xpReward: 35, icon: '🔮' },
  { id: 'rea_2', domain: 'reasoning', name: 'Number Sequences', nameDE: 'Zahlenfolgen', description: 'Find the next number in a logical sequence', difficulty: 2, xpReward: 30, icon: '🔢' },
  { id: 'rea_3', domain: 'reasoning', name: 'Logic Puzzles', nameDE: 'Logikrätsel', description: 'Solve deductive reasoning puzzles', difficulty: 3, xpReward: 50, icon: '🧩' },
  { id: 'rea_4', domain: 'reasoning', name: 'Matrix Reasoning', nameDE: 'Matrix-Reasoning', description: 'Find the missing piece in a visual matrix', difficulty: 3, xpReward: 55, icon: '🏁' },
];

export const BADGES = [
  { id: 'first_game', name: 'First Steps', nameDE: 'Erste Schritte', icon: '🌟', description: 'Complete your first exercise', condition: (stats) => stats.totalGames >= 1 },
  { id: 'streak_3', name: '3-Day Streak', nameDE: '3-Tage-Serie', icon: '🔥', description: '3 days in a row', condition: (stats) => stats.streak >= 3 },
  { id: 'streak_7', name: 'Week Warrior', nameDE: 'Wochen-Krieger', icon: '💪', description: '7 days in a row', condition: (stats) => stats.streak >= 7 },
  { id: 'xp_100', name: 'Brain Spark', nameDE: 'Hirnfunke', icon: '⚡', description: 'Earn 100 XP', condition: (stats) => stats.totalXP >= 100 },
  { id: 'xp_500', name: 'Brain Power', nameDE: 'Hirnkraft', icon: '🧠', description: 'Earn 500 XP', condition: (stats) => stats.totalXP >= 500 },
  { id: 'all_domains', name: 'Renaissance Mind', nameDE: 'Renaissance-Geist', icon: '🎭', description: 'Try all 6 domains', condition: (stats) => stats.domainsPlayed >= 6 },
  { id: 'perfect_score', name: 'Perfect!', nameDE: 'Perfekt!', icon: '💯', description: 'Score 100% on any exercise', condition: (stats) => stats.hasPerfect },
  { id: 'speed_demon', name: 'Speed Demon', nameDE: 'Geschwindigkeits-Dämon', icon: '🏎️', description: 'React in under 300ms', condition: (stats) => stats.bestReaction <= 300 },
];

export const XP_LEVELS = [
  { level: 1, minXP: 0, name: 'Beginner', nameDE: 'Anfänger', color: '#94a3b8' },
  { level: 2, minXP: 100, name: 'Apprentice', nameDE: 'Lehrling', color: '#10b981' },
  { level: 3, minXP: 300, name: 'Explorer', nameDE: 'Entdecker', color: '#06b6d4' },
  { level: 4, minXP: 600, name: 'Achiever', nameDE: 'Leistungsträger', color: '#3b82f6' },
  { level: 5, minXP: 1000, name: 'Expert', nameDE: 'Experte', color: '#6366f1' },
  { level: 6, minXP: 1500, name: 'Master', nameDE: 'Meister', color: '#8b5cf6' },
  { level: 7, minXP: 2500, name: 'Champion', nameDE: 'Champion', color: '#f59e0b' },
  { level: 8, minXP: 4000, name: 'Legend', nameDE: 'Legende', color: '#f43f5e' },
];

export function getLevel(xp) {
  let current = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
    else break;
  }
  const nextIdx = XP_LEVELS.indexOf(current) + 1;
  const next = XP_LEVELS[nextIdx] || null;
  return { current, next };
}

export function getDomainLabel(domainId, lang = 'en') {
  const d = DOMAINS[domainId];
  if (!d) return domainId;
  return lang === 'de' ? d.nameDE : d.name;
}