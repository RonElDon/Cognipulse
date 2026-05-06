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
  language: {
    id: 'language',
    name: 'Language & Verbal',
    nameDE: 'Sprache & Wortschatz',
    icon: '💬',
    color: '#8b5cf6',
    gradient: 'gradient-memory',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    description: 'Verbal fluency, word retrieval, and language processing',
    descriptionDE: 'Wortflüssigkeit, Wortfindung und Sprachverarbeitung',
  },
  math: {
    id: 'math',
    name: 'Math & Numbers',
    nameDE: 'Mathematik & Zahlen',
    icon: '🔢',
    color: '#ec4899',
    gradient: 'gradient-reasoning',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    description: 'Arithmetic, number sense, and mental calculation',
    descriptionDE: 'Rechnen, Zahlensinn und mentales Rechnen',
  },
};

export const EXERCISES = [
  // ATTENTION (8 exercises)
  { id: 'att_1', domain: 'attention', name: 'Spotlight Focus', nameDE: 'Scheinwerfer Fokus', description: 'Tippe auf auftauchende Ziele so schnell wie möglich', difficulty: 1, xpReward: 20, icon: '🔦' },
  { id: 'att_2', domain: 'attention', name: 'Number Hunt', nameDE: 'Zahlenjagd', description: 'Finde bestimmte Zahlen in einem sich ändernden Raster', difficulty: 2, xpReward: 30, icon: '🔢' },
  { id: 'att_3', domain: 'attention', name: 'Color Switch', nameDE: 'Farbenwechsel', description: 'Reagiere nur auf bestimmte Farben, ignoriere andere', difficulty: 2, xpReward: 30, icon: '🎨' },
  { id: 'att_4', domain: 'attention', name: 'Sustained Watch', nameDE: 'Dauerwache', description: 'Erkenne seltene Ziele in einem Reizstrom', difficulty: 3, xpReward: 40, icon: '👀' },
  { id: 'att_5', domain: 'attention', name: 'Divided Attention', nameDE: 'Geteilte Aufmerksamkeit', description: 'Verfolge mehrere Ziele gleichzeitig', difficulty: 3, xpReward: 45, icon: '🌀' },
  { id: 'att_6', domain: 'attention', name: 'Distractor Shield', nameDE: 'Ablenkungsschutz', description: 'Konzentriere dich trotz visueller Störungen', difficulty: 2, xpReward: 35, icon: '🛡️' },
  { id: 'att_7', domain: 'attention', name: 'Flash Detect', nameDE: 'Blitz-Erkennung', description: 'Erkenne kurze Blitze zwischen Störreizen', difficulty: 2, xpReward: 30, icon: '⚡' },
  { id: 'att_8', domain: 'attention', name: 'Focus Marathon', nameDE: 'Fokus-Marathon', description: '2-Minuten Daueraufmerksamkeit ohne Fehler', difficulty: 3, xpReward: 50, icon: '🏃' },

  // MEMORY (8 exercises)
  { id: 'mem_1', domain: 'memory', name: 'Memory Match', nameDE: 'Gedächtnis-Match', description: 'Finde Kartenpaare durch Aufdecken', difficulty: 1, xpReward: 20, icon: '🃏' },
  { id: 'mem_2', domain: 'memory', name: 'Sequence Recall', nameDE: 'Sequenz-Erinnerung', description: 'Merke und wiederhole Sequenzen', difficulty: 2, xpReward: 35, icon: '📋' },
  { id: 'mem_3', domain: 'memory', name: 'Word List', nameDE: 'Wortliste', description: 'Merke eine wachsende Liste von Wörtern', difficulty: 2, xpReward: 30, icon: '📝' },
  { id: 'mem_4', domain: 'memory', name: 'N-Back Challenge', nameDE: 'N-Back Herausforderung', description: 'Erinnere Elemente von N Schritten zuvor', difficulty: 3, xpReward: 50, icon: '🔄' },
  { id: 'mem_5', domain: 'memory', name: 'Position Memory', nameDE: 'Positionsgedächtnis', description: 'Merke die Positionen von Objekten auf dem Spielfeld', difficulty: 2, xpReward: 30, icon: '📍' },
  { id: 'mem_6', domain: 'memory', name: 'Color Sequence', nameDE: 'Farbreihenfolge', description: 'Wiederhole die gezeigte Farbreihenfolge exakt', difficulty: 1, xpReward: 25, icon: '🌈' },
  { id: 'mem_7', domain: 'memory', name: 'Story Recall', nameDE: 'Geschichten-Erinnerung', description: 'Merke Details einer kurzen Geschichte', difficulty: 2, xpReward: 35, icon: '📖' },
  { id: 'mem_8', domain: 'memory', name: 'Face & Name', nameDE: 'Gesicht & Name', description: 'Verbinde Gesichter mit den richtigen Namen', difficulty: 3, xpReward: 45, icon: '🧑' },

  // EXECUTIVE FUNCTIONS (8 exercises)
  { id: 'exe_1', domain: 'executive', name: 'Task Switch', nameDE: 'Aufgabenwechsel', description: 'Wechsle fließend zwischen zwei Aufgaben', difficulty: 2, xpReward: 35, icon: '🔀' },
  { id: 'exe_2', domain: 'executive', name: 'Stop Signal', nameDE: 'Stoppsignal', description: 'Unterdrücke eine Reaktion beim Stoppsignal', difficulty: 2, xpReward: 30, icon: '🛑' },
  { id: 'exe_3', domain: 'executive', name: 'Tower of Logic', nameDE: 'Logikturm', description: 'Bewege Scheiben zur Zielkonfiguration', difficulty: 3, xpReward: 50, icon: '🗼' },
  { id: 'exe_4', domain: 'executive', name: 'Stroop Challenge', nameDE: 'Stroop-Herausforderung', description: 'Nenne die Tintenfarbe, nicht das Wort', difficulty: 2, xpReward: 40, icon: '🌈' },
  { id: 'exe_5', domain: 'executive', name: 'Planning Maze', nameDE: 'Planungs-Labyrinth', description: 'Plane den kürzesten Weg durch das Labyrinth', difficulty: 3, xpReward: 45, icon: '🗺️' },
  { id: 'exe_6', domain: 'executive', name: 'Rule Shift', nameDE: 'Regelwechsel', description: 'Passe dich schnell an wechselnde Regeln an', difficulty: 3, xpReward: 50, icon: '📐' },
  { id: 'exe_7', domain: 'executive', name: 'Dual Task', nameDE: 'Doppelaufgabe', description: 'Löse zwei Aufgaben gleichzeitig', difficulty: 3, xpReward: 55, icon: '🎭' },
  { id: 'exe_8', domain: 'executive', name: 'Inhibition Race', nameDE: 'Hemmungs-Rennen', description: 'Drücke NICHT auf rote Ziele, nur auf blaue', difficulty: 2, xpReward: 35, icon: '🚦' },

  // VISUOMOTOR (8 exercises)
  { id: 'vis_1', domain: 'visuomotor', name: 'Dot Connect', nameDE: 'Punkte verbinden', description: 'Verbinde Punkte in der richtigen Reihenfolge schnell', difficulty: 1, xpReward: 20, icon: '⭕' },
  { id: 'vis_2', domain: 'visuomotor', name: 'Shape Trace', nameDE: 'Formennachfahren', description: 'Zeichne komplexe Formen präzise nach', difficulty: 2, xpReward: 30, icon: '✏️' },
  { id: 'vis_3', domain: 'visuomotor', name: 'Target Tap', nameDE: 'Ziel antippen', description: 'Tippe Ziele mit Geschwindigkeit und Präzision', difficulty: 2, xpReward: 35, icon: '🎯' },
  { id: 'vis_4', domain: 'visuomotor', name: 'Mirror Draw', nameDE: 'Spiegelzeichnung', description: 'Spiegele ein Muster auf die andere Seite', difficulty: 3, xpReward: 45, icon: '🪞' },
  { id: 'vis_5', domain: 'visuomotor', name: 'Moving Target', nameDE: 'Bewegtes Ziel', description: 'Tippe auf sich bewegende Ziele', difficulty: 2, xpReward: 35, icon: '🏹' },
  { id: 'vis_6', domain: 'visuomotor', name: 'Spatial Rotation', nameDE: 'Raumrotation', description: 'Erkenne gedrehte Figuren korrekt', difficulty: 3, xpReward: 45, icon: '🔄' },
  { id: 'vis_7', domain: 'visuomotor', name: 'Grid Navigator', nameDE: 'Raster-Navigator', description: 'Bewege die Figur durch ein wachsendes Raster', difficulty: 2, xpReward: 30, icon: '🗺️' },
  { id: 'vis_8', domain: 'visuomotor', name: 'Speed Tap', nameDE: 'Tempo-Tippen', description: 'Tippe Muster so schnell wie möglich nach', difficulty: 3, xpReward: 50, icon: '⌨️' },

  // PROCESSING SPEED (8 exercises)
  { id: 'pro_1', domain: 'processing', name: 'Symbol Match', nameDE: 'Symbol-Match', description: 'Ordne Symbole so schnell wie möglich ihren Codes zu', difficulty: 1, xpReward: 20, icon: '⚡' },
  { id: 'pro_2', domain: 'processing', name: 'Quick Sort', nameDE: 'Schnellsortierung', description: 'Sortiere Elemente mit Tempo in Kategorien', difficulty: 2, xpReward: 30, icon: '🗂️' },
  { id: 'pro_3', domain: 'processing', name: 'Reaction Timer', nameDE: 'Reaktionszeitmesser', description: 'Reagiere so schnell wie möglich auf Reize', difficulty: 1, xpReward: 25, icon: '⏱️' },
  { id: 'pro_4', domain: 'processing', name: 'Decision Dash', nameDE: 'Entscheidungs-Sprint', description: 'Triff schnelle korrekte Entscheidungen im Strom', difficulty: 3, xpReward: 45, icon: '🏃' },
  { id: 'pro_5', domain: 'processing', name: 'Number Compare', nameDE: 'Zahlenvergleich', description: 'Welche Zahl ist größer? So schnell wie möglich!', difficulty: 1, xpReward: 20, icon: '🔢' },
  { id: 'pro_6', domain: 'processing', name: 'True/False Blitz', nameDE: 'Wahr/Falsch-Blitz', description: 'Bewerte Aussagen blitzschnell als wahr oder falsch', difficulty: 2, xpReward: 35, icon: '✅' },
  { id: 'pro_7', domain: 'processing', name: 'Color Word Speed', nameDE: 'Farb-Wort-Tempo', description: 'Reagiere auf Farben, nicht auf Wörter', difficulty: 2, xpReward: 35, icon: '🎨' },
  { id: 'pro_8', domain: 'processing', name: 'Scanning Speed', nameDE: 'Scan-Geschwindigkeit', description: 'Finde Ziele in einem großen Feld so schnell wie möglich', difficulty: 3, xpReward: 45, icon: '🔍' },

  // REASONING (8 exercises)
  { id: 'rea_1', domain: 'reasoning', name: 'Pattern Master', nameDE: 'Muster-Meister', description: 'Identifiziere und vervollständige visuelle Muster', difficulty: 2, xpReward: 35, icon: '🔮' },
  { id: 'rea_2', domain: 'reasoning', name: 'Number Sequences', nameDE: 'Zahlenfolgen', description: 'Finde die nächste Zahl in einer logischen Reihe', difficulty: 2, xpReward: 30, icon: '🔢' },
  { id: 'rea_3', domain: 'reasoning', name: 'Logic Puzzles', nameDE: 'Logikrätsel', description: 'Löse deduktive Denksportaufgaben', difficulty: 3, xpReward: 50, icon: '🧩' },
  { id: 'rea_4', domain: 'reasoning', name: 'Matrix Reasoning', nameDE: 'Matrix-Reasoning', description: 'Finde das fehlende Teil in einer visuellen Matrix', difficulty: 3, xpReward: 55, icon: '🏁' },
  { id: 'rea_5', domain: 'reasoning', name: 'Analogy Train', nameDE: 'Analogie-Training', description: 'Vervollständige Wortanalogien logisch', difficulty: 2, xpReward: 35, icon: '🔗' },
  { id: 'rea_6', domain: 'reasoning', name: 'Category Sort', nameDE: 'Kategorie-Sortierung', description: 'Sortiere Begriffe in die richtigen Kategorien', difficulty: 1, xpReward: 25, icon: '📦' },
  { id: 'rea_7', domain: 'reasoning', name: 'Deduction Game', nameDE: 'Deduktionsspiel', description: 'Schließe auf die Lösung durch Ausschlussprinzip', difficulty: 3, xpReward: 50, icon: '🕵️' },
  { id: 'rea_8', domain: 'reasoning', name: 'Syllogism Sprint', nameDE: 'Syllogismus-Sprint', description: 'Bewerte logische Schlussfolgerungen schnell', difficulty: 3, xpReward: 45, icon: '⚖️' },

  // LANGUAGE & VERBAL (8 exercises)
  { id: 'lan_1', domain: 'language', name: 'Word Fluency', nameDE: 'Wortflüssigkeit', description: 'Finde so viele Wörter wie möglich zu einem Buchstaben', difficulty: 1, xpReward: 20, icon: '🔤' },
  { id: 'lan_2', domain: 'language', name: 'Synonym Find', nameDE: 'Synonym-Suche', description: 'Finde Synonyme zu gegebenen Wörtern', difficulty: 2, xpReward: 30, icon: '💬' },
  { id: 'lan_3', domain: 'language', name: 'Anagram Solver', nameDE: 'Anagramm-Löser', description: 'Bilde Wörter aus gemischten Buchstaben', difficulty: 2, xpReward: 35, icon: '🔀' },
  { id: 'lan_4', domain: 'language', name: 'Word Chain', nameDE: 'Wortkette', description: 'Verbinde Wörter in einer logischen Kette', difficulty: 2, xpReward: 30, icon: '🔗' },
  { id: 'lan_5', domain: 'language', name: 'Sentence Complete', nameDE: 'Satz-Vervollständigung', description: 'Ergänze Sätze sinnvoll', difficulty: 1, xpReward: 25, icon: '✍️' },
  { id: 'lan_6', domain: 'language', name: 'Odd Word Out', nameDE: 'Das andere Wort', description: 'Welches Wort passt nicht in die Gruppe?', difficulty: 2, xpReward: 30, icon: '🎯' },
  { id: 'lan_7', domain: 'language', name: 'Definition Match', nameDE: 'Definitions-Match', description: 'Ordne Wörter ihren Definitionen zu', difficulty: 2, xpReward: 35, icon: '📚' },
  { id: 'lan_8', domain: 'language', name: 'Verbal Memory', nameDE: 'Verbales Gedächtnis', description: 'Merke und erkenne gehörte Wörter wieder', difficulty: 3, xpReward: 45, icon: '👂' },

  // MATH & NUMBERS (8 exercises)
  { id: 'mat_1', domain: 'math', name: 'Mental Math', nameDE: 'Kopfrechnen', description: 'Löse Rechenaufgaben ohne Hilfsmittel', difficulty: 1, xpReward: 20, icon: '➕' },
  { id: 'mat_2', domain: 'math', name: 'Number Memory', nameDE: 'Zahlen-Gedächtnis', description: 'Merke und wiederhole Zahlenfolgen', difficulty: 2, xpReward: 30, icon: '🔢' },
  { id: 'mat_3', domain: 'math', name: 'Estimation Game', nameDE: 'Schätz-Spiel', description: 'Schätze Mengen und Größen präzise', difficulty: 1, xpReward: 25, icon: '📏' },
  { id: 'mat_4', domain: 'math', name: 'Math Blitz', nameDE: 'Mathe-Blitz', description: 'Löse Rechenaufgaben in schneller Folge', difficulty: 2, xpReward: 35, icon: '⚡' },
  { id: 'mat_5', domain: 'math', name: 'Missing Number', nameDE: 'Die fehlende Zahl', description: 'Finde die fehlende Zahl in Gleichungen', difficulty: 2, xpReward: 35, icon: '❓' },
  { id: 'mat_6', domain: 'math', name: 'Fraction Fight', nameDE: 'Bruch-Kampf', description: 'Vergleiche Brüche und Dezimalzahlen', difficulty: 3, xpReward: 45, icon: '½' },
  { id: 'mat_7', domain: 'math', name: 'Math Patterns', nameDE: 'Mathe-Muster', description: 'Erkenne numerische Muster und Regeln', difficulty: 3, xpReward: 50, icon: '📐' },
  { id: 'mat_8', domain: 'math', name: 'Speed Arithmetic', nameDE: 'Tempo-Arithmetik', description: 'Zeige deine schnellsten Rechenkünste', difficulty: 3, xpReward: 55, icon: '🏆' },
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
  { id: 'explorer', name: 'Explorer', nameDE: 'Entdecker', icon: '🗺️', description: '20 exercises done', condition: (stats) => stats.totalGames >= 20 },
  { id: 'centurion', name: 'Centurion', nameDE: 'Zenturio', icon: '💯', description: '100 exercises done', condition: (stats) => stats.totalGames >= 100 },
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