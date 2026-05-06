import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DOMAINS, EXERCISES } from '@/lib/exercises';
import { Search, Filter } from 'lucide-react';

export default function Train() {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const domainParam = urlParams.get('domain');

  useEffect(() => {
    if (domainParam && DOMAINS[domainParam]) {
      setSelectedDomain(domainParam);
    }
  }, [domainParam]);

  const filtered = EXERCISES.filter(ex => {
    const matchesDomain = selectedDomain === 'all' || ex.domain === selectedDomain;
    const matchesSearch = !searchQuery || ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 pt-6 pb-4 sticky top-0 md:top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-black text-slate-900 mb-4">🧠 Trainingsbibliothek</h1>
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Übungen suchen..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
          {/* Domain filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                selectedDomain === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle
            </button>
            {Object.values(DOMAINS).map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${
                  selectedDomain === d.id
                    ? 'text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={selectedDomain === d.id ? { backgroundColor: d.color } : {}}
              >
                {d.icon} {d.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {selectedDomain !== 'all' && DOMAINS[selectedDomain] && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl p-5 text-white ${DOMAINS[selectedDomain].gradient} shadow-lg`}
          >
            <div className="text-3xl mb-2">{DOMAINS[selectedDomain].icon}</div>
            <h2 className="text-xl font-black">{DOMAINS[selectedDomain].name}</h2>
            <p className="text-white/90 text-sm mt-1">{DOMAINS[selectedDomain].description}</p>
          </motion.div>
        )}

        <div className="grid gap-3">
          <AnimatePresence>
            {filtered.map((ex, i) => {
              const domain = DOMAINS[ex.domain];
              return (
                <motion.div
                  key={ex.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={`/exercise/${ex.id}`}
                    className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${domain.gradient} flex items-center justify-center text-2xl shadow-md flex-shrink-0`}>
                      {ex.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-black text-slate-800">{ex.name}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{ex.description}</div>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-sm font-black" style={{ color: domain.color }}>+{ex.xpReward} XP</div>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${domain.bgLight} ${domain.textColor}`}>
                          {domain.icon} {domain.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div
                              key={j}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: j < ex.difficulty ? domain.color : '#e2e8f0' }}
                            />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">
                            {ex.difficulty === 1 ? 'Leicht' : ex.difficulty === 2 ? 'Mittel' : 'Schwer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-semibold">Keine Übungen gefunden</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}