import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const GRADIENT_PRESETS = [
  { id: 'auto', label: 'Auto', style: null },
  { id: 'purple', label: 'Lila',   style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', accent: '#764ba2' },
  { id: 'rose',   label: 'Rose',   style: 'linear-gradient(135deg, #f43f5e 0%, #f97316 100%)', accent: '#f43f5e' },
  { id: 'cyan',   label: 'Cyan',   style: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)', accent: '#06b6d4' },
  { id: 'emerald',label: 'Grün',   style: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', accent: '#10b981' },
  { id: 'amber',  label: 'Gold',   style: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', accent: '#f59e0b' },
  { id: 'night',  label: 'Nacht',  style: 'linear-gradient(135deg, #0f172a 0%, #312e81 100%)', accent: '#6366f1' },
];

export { GRADIENT_PRESETS };

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('dark_mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [autoDark, setAutoDark] = useState(() => localStorage.getItem('auto_dark') !== 'false');

  const [selectedGradient, setSelectedGradient] = useState(() => localStorage.getItem('hero_gradient') || 'auto');
  const [customColor, setCustomColor] = useState(() => localStorage.getItem('hero_custom_color') || '#6366f1');

  // Auto dark mode listener
  useEffect(() => {
    if (!autoDark) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      setDarkMode(e.matches);
      localStorage.setItem('dark_mode', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [autoDark]);

  // Apply dark class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    setAutoDark(false);
    localStorage.setItem('dark_mode', next);
    localStorage.setItem('auto_dark', 'false');
  };

  const enableAutoDark = () => {
    setAutoDark(true);
    localStorage.setItem('auto_dark', 'true');
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(sys);
    localStorage.setItem('dark_mode', sys);
  };

  const selectGradient = (id) => {
    setSelectedGradient(id);
    localStorage.setItem('hero_gradient', id);
  };

  const setCustomColorValue = (color) => {
    setCustomColor(color);
    localStorage.setItem('hero_custom_color', color);
    selectGradient('custom');
  };

  // Compute accent color from current gradient
  const accentColor = (() => {
    if (selectedGradient === 'custom') return customColor;
    const preset = GRADIENT_PRESETS.find(p => p.id === selectedGradient);
    return preset?.accent || '#764ba2';
  })();

  const heroStyle = selectedGradient === 'auto'
    ? {}
    : selectedGradient === 'custom'
      ? { background: `linear-gradient(135deg, ${customColor} 0%, ${customColor}99 100%)` }
      : { background: GRADIENT_PRESETS.find(p => p.id === selectedGradient)?.style };

  const heroClass = selectedGradient === 'auto' ? 'hero-gradient' : '';

  return (
    <ThemeContext.Provider value={{
      darkMode, toggleDark, autoDark, enableAutoDark,
      selectedGradient, selectGradient,
      customColor, setCustomColorValue,
      accentColor, heroStyle, heroClass,
      GRADIENT_PRESETS,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}