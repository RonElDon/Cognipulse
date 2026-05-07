import { useTheme, GRADIENT_PRESETS } from '@/lib/ThemeContext';
import { base44 } from '@/api/base44Client';
import { Palette, Type } from 'lucide-react';
import { toast } from 'sonner';

const ACCENT_COLORS = [
  { label: 'Lila', color: '#8b5cf6' },
  { label: 'Indigo', color: '#6366f1' },
  { label: 'Rose', color: '#f43f5e' },
  { label: 'Orange', color: '#f97316' },
  { label: 'Cyan', color: '#06b6d4' },
  { label: 'Grün', color: '#10b981' },
  { label: 'Amber', color: '#f59e0b' },
  { label: 'Pink', color: '#ec4899' },
];

const FONTS = [
  { id: 'nunito',  label: 'Nunito',  style: { fontFamily: 'Nunito, sans-serif' } },
  { id: 'inter',   label: 'Inter',   style: { fontFamily: 'Inter, sans-serif' } },
  { id: 'poppins', label: 'Poppins', style: { fontFamily: 'Poppins, sans-serif' } },
  { id: 'lexend',  label: 'Lexend',  style: { fontFamily: 'Lexend, sans-serif' } },
];

export default function AppearanceSettings() {
  const {
    selectedGradient, selectGradient,
    accentColor, setCustomColorValue,
    customColor,
    GRADIENT_PRESETS,
    darkMode, toggleDark,
  } = useTheme();

  const currentFont = localStorage.getItem('app_font') || 'nunito';

  const handleAccentColor = async (color) => {
    setCustomColorValue(color);
    try {
      await base44.functions.invoke('applyThemeSetting', { accentColor: color, gradient: `custom:${color}` });
    } catch (_) {}
    toast.success('Akzentfarbe gespeichert');
  };

  const handleGradient = async (id) => {
    selectGradient(id);
    try {
      await base44.functions.invoke('applyThemeSetting', { gradient: id });
    } catch (_) {}
  };

  const handleFont = (fontId) => {
    localStorage.setItem('app_font', fontId);
    const font = FONTS.find(f => f.id === fontId);
    document.body.style.fontFamily = font?.style?.fontFamily || '';
    toast.success(`Schriftart: ${font?.label}`);
  };

  return (
    <div className="space-y-6">
      {/* Accent Color */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Akzentfarbe</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ACCENT_COLORS.map(c => (
            <button
              key={c.color}
              onClick={() => handleAccentColor(c.color)}
              title={c.label}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-10 h-10 rounded-xl transition-all ${accentColor === c.color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c.color }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{c.label}</span>
            </button>
          ))}
        </div>
        {/* Custom color picker */}
        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Eigene Farbe:</label>
          <input
            type="color"
            value={customColor}
            onChange={e => handleAccentColor(e.target.value)}
            className="w-10 h-8 rounded-lg border border-slate-200 cursor-pointer bg-transparent"
          />
          <span className="text-xs text-slate-400 font-mono">{customColor}</span>
        </div>
      </div>

      {/* Hero Gradient */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-slate-500 text-sm">🌈</span>
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Hero-Gradient</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {GRADIENT_PRESETS.filter(p => p.id !== 'auto').map(p => (
            <button
              key={p.id}
              onClick={() => handleGradient(p.id)}
              className={`h-10 rounded-xl transition-all ${selectedGradient === p.id ? 'ring-2 ring-offset-2 ring-slate-400 scale-105' : 'hover:scale-105'}`}
              style={{ background: p.style }}
              title={p.label}
            />
          ))}
          <button
            onClick={() => handleGradient('auto')}
            className={`h-10 rounded-xl transition-all text-xs font-bold ${selectedGradient === 'auto' ? 'ring-2 ring-offset-2 ring-slate-400 bg-slate-200 dark:bg-slate-600' : 'bg-slate-100 dark:bg-slate-700 hover:scale-105'} text-slate-600 dark:text-slate-300`}
          >
            Auto
          </button>
        </div>
      </div>

      {/* Font */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">Schriftart</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map(f => (
            <button
              key={f.id}
              onClick={() => handleFont(f.id)}
              className={`py-2.5 px-3 rounded-xl border-2 text-sm font-bold transition-all text-left ${
                currentFont === f.id
                  ? 'border-current text-white'
                  : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300'
              }`}
              style={{
                ...f.style,
                ...(currentFont === f.id ? { backgroundColor: accentColor, borderColor: accentColor } : {}),
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}