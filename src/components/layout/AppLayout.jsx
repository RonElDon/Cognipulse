import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Home, Brain, Trophy, BarChart2, User, Menu, X, Zap, Moon, Sun, Monitor, ChevronLeft, ChevronRight, Swords } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { base44 } from '@/api/base44Client';
import NeuroMascot from '@/components/mascot/NeuroMascot';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home', labelDE: 'Startseite' },
  { path: '/train', icon: Brain, label: 'Train', labelDE: 'Trainieren' },
  { path: '/duel', icon: Swords, label: 'Duel', labelDE: 'Duell' },
  { path: '/progress', icon: BarChart2, label: 'Progress', labelDE: 'Fortschritt' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', labelDE: 'Rangliste' },
  { path: '/profile', icon: User, label: 'Profile', labelDE: 'Profil' },
];

export default function AppLayout({ lang = 'de' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { darkMode, toggleDark, autoDark, enableAutoDark, accentColor } = useTheme();

  const handleDebugBack = () => {
    navigate('/');
  };

  const DarkToggle = () => (
    <div className="flex items-center gap-1 bg-slate-800 dark:bg-slate-700 rounded-xl p-1">
      <button
        onClick={enableAutoDark}
        title="Automatisch"
        className={`p-1.5 rounded-lg transition-all ${autoDark ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => { if (darkMode) toggleDark(); }}
        title="Hell"
        className={`p-1.5 rounded-lg transition-all ${!darkMode && !autoDark ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => { if (!darkMode) toggleDark(); }}
        title="Dunkel"
        className={`p-1.5 rounded-lg transition-all ${darkMode && !autoDark ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex relative">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-white fixed h-full z-40 transition-all duration-300 border-r border-slate-200 dark:border-slate-800 ${!sidebarOpen ? '-translate-x-full' : ''}`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white">Cogni</span>
              <span className="text-xl font-black" style={{ color: accentColor }}>Pulse</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  active ? 'text-white shadow-lg dark:shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={active ? { backgroundColor: accentColor, boxShadow: `0 4px 15px ${accentColor}55` } : {}}
              >
                <item.icon className="w-5 h-5" />
                {lang === 'de' ? item.labelDE : item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <DarkToggle />
          <div className="text-xs text-slate-400 dark:text-slate-500 text-center">CogniPulse v1.0</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black">
            <span className="text-white">Cogni</span>
            <span style={{ color: accentColor }}>Pulse</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={toggleDark} className="p-2 text-slate-300 hover:text-white">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 pt-16 px-4">
          <nav className="space-y-2">
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-lg ${active ? 'text-white' : 'text-slate-300'}`}
                  style={active ? { backgroundColor: accentColor } : {}}
                >
                  <item.icon className="w-6 h-6" />
                  {lang === 'de' ? item.labelDE : item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 flex justify-center">
            <DarkToggle />
          </div>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`hidden md:flex fixed top-6 z-50 w-9 h-12 items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-800 dark:text-white hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all duration-300 rounded-r-xl ${sidebarOpen ? 'left-64' : 'left-0'}`}
        title={sidebarOpen ? "Menü schließen" : "Menü öffnen"}
      >
        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {/* Main Content */}
      <main className={`flex-1 pt-16 md:pt-0 min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-semibold transition-colors`}
              style={{ color: active ? accentColor : undefined }}
            >
              <item.icon className="w-5 h-5" style={{ color: active ? accentColor : undefined }} />
              {lang === 'de' ? item.labelDE : item.label}
            </Link>
          );
        })}
      </div>

      {/* Debug Back Button */}
      <button
        onClick={handleDebugBack}
        className="fixed top-6 right-6 z-40 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-lg transition-colors"
        title="Debug: Ein Schritt zurück"
      >
        ← BACK
      </button>

      {/* Neuro Mascot — global */}
      <NeuroMascot popupsEnabled={true} />
    </div>
  );
}