import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Home, Brain, Trophy, BarChart2, User, Menu, X, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home', labelDE: 'Startseite' },
  { path: '/train', icon: Brain, label: 'Train', labelDE: 'Trainieren' },
  { path: '/progress', icon: BarChart2, label: 'Progress', labelDE: 'Fortschritt' },
  { path: '/leaderboard', icon: Trophy, label: 'Leaderboard', labelDE: 'Rangliste' },
  { path: '/profile', icon: User, label: 'Profile', labelDE: 'Profil' },
];

export default function AppLayout({ lang = 'en' }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-40">
        <div className="p-6 border-b border-slate-700">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white">Brain</span>
              <span className="text-xl font-black text-purple-400">Boost</span>
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
                  active
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {lang === 'de' ? item.labelDE : item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <div className="text-xs text-slate-500 text-center">BrainBoost v1.0</div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-black"><span className="text-white">Brain</span><span className="text-purple-400">Boost</span></span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-slate-900/95 pt-16 px-4">
          <nav className="space-y-2">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl font-semibold text-lg ${
                  location.pathname === item.path ? 'bg-purple-600 text-white' : 'text-slate-300'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {lang === 'de' ? item.labelDE : item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-semibold transition-colors ${
                active ? 'text-purple-600' : 'text-slate-400'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
              {lang === 'de' ? item.labelDE : item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}