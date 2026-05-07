import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { DOMAINS, EXERCISES } from '@/lib/exercises';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend
} from 'recharts';
import { Calendar, TrendingUp, Filter, ChevronDown, BarChart2 } from 'lucide-react';

const RANGE_OPTIONS = [
  { id: '7', label: '7 Tage' },
  { id: '14', label: '14 Tage' },
  { id: '30', label: '30 Tage' },
  { id: '90', label: '3 Monate' },
  { id: 'all', label: 'Alle' },
];

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

export default function History() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');
  const [selectedDomains, setSelectedDomains] = useState(Object.keys(DOMAINS));
  const [groupBy, setGroupBy] = useState('day'); // 'day' | 'exercise'
  const [domainDropdown, setDomainDropdown] = useState(false);

  useEffect(() => {
    base44.entities.ExerciseResult.list('-created_date', 500)
      .then(setResults)
      .finally(() => setLoading(false));
  }, []);

  // Filter by date range
  const filteredResults = useMemo(() => {
    if (range === 'all') return results;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - parseInt(range));
    return results.filter(r => new Date(r.created_date) >= cutoff);
  }, [results, range]);

  // Build daily aggregate line chart data
  const lineChartData = useMemo(() => {
    const days = parseInt(range) || 90;
    const n = range === 'all' ? 90 : days;
    const map = {};
    filteredResults.forEach(r => {
      const day = toDateStr(new Date(r.created_date));
      if (!map[day]) map[day] = { date: day };
      if (!map[day][r.domain]) map[day][r.domain] = { sum: 0, count: 0 };
      map[day][r.domain].sum += r.score;
      map[day][r.domain].count += 1;
    });
    // fill every day in range
    const result = [];
    const today = new Date();
    const startDay = new Date();
    startDay.setDate(today.getDate() - (range === 'all' ? 89 : days - 1));
    for (let d = new Date(startDay); d <= today; d.setDate(d.getDate() + 1)) {
      const key = toDateStr(d);
      const entry = { date: key, label: formatDate(key) };
      Object.keys(DOMAINS).forEach(domId => {
        entry[domId] = map[key]?.[domId]
          ? Math.round(map[key][domId].sum / map[key][domId].count)
          : null;
      });
      result.push(entry);
    }
    return result;
  }, [filteredResults, range]);

  // Session list (filtered, sorted)
  const sessionList = useMemo(() => {
    return [...filteredResults].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [filteredResults]);

  // Per-domain stats summary
  const domainSummary = useMemo(() => {
    return Object.values(DOMAINS).map(d => {
      const dr = filteredResults.filter(r => r.domain === d.id);
      if (dr.length === 0) return { ...d, avg: null, best: null, count: 0, trend: null };
      const avg = Math.round(dr.reduce((s, r) => s + r.score, 0) / dr.length);
      const best = Math.max(...dr.map(r => r.score));
      // trend: compare first half vs second half
      const half = Math.floor(dr.length / 2);
      let trend = null;
      if (half > 0) {
        const older = dr.slice(half);
        const newer = dr.slice(0, half);
        const avgOld = older.reduce((s, r) => s + r.score, 0) / older.length;
        const avgNew = newer.reduce((s, r) => s + r.score, 0) / newer.length;
        trend = Math.round(avgNew - avgOld);
      }
      return { ...d, avg, best, count: dr.length, trend };
    });
  }, [filteredResults]);

  const toggleDomain = (id) => {
    setSelectedDomains(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-3 min-w-32">
        <div className="text-xs font-black text-slate-600 dark:text-slate-300 mb-2">{label}</div>
        {payload.map(p => p.value !== null && (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs font-bold">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-600 dark:text-slate-300">{DOMAINS[p.dataKey]?.nameDE || p.dataKey}:</span>
            <span style={{ color: p.color }}>{p.value}%</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-4 pt-8 pb-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
            <BarChart2 className="w-6 h-6" /> Trainings-Historie
          </h1>
          <p className="text-white/80 text-sm">Detaillierte Auswertung deiner Fortschritte</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-5">

        {/* Filter Bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-4 border border-slate-100 dark:border-slate-700"
        >
          <div className="flex flex-wrap gap-3 items-center">
            {/* Date Range */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-black text-slate-500 dark:text-slate-400">Zeitraum:</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {RANGE_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setRange(opt.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    range === opt.id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Domain filter */}
            <div className="relative ml-auto">
              <button
                onClick={() => setDomainDropdown(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                <Filter className="w-3.5 h-3.5" />
                Bereiche ({selectedDomains.length})
                <ChevronDown className="w-3 h-3" />
              </button>
              {domainDropdown && (
                <div className="absolute right-0 top-9 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-3 z-20 w-52">
                  {Object.values(DOMAINS).map(d => (
                    <label key={d.id} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg px-2">
                      <input
                        type="checkbox"
                        checked={selectedDomains.includes(d.id)}
                        onChange={() => toggleDomain(d.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{d.icon}</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{d.nameDE}</span>
                    </label>
                  ))}
                  <button
                    onClick={() => { setSelectedDomains(Object.keys(DOMAINS)); setDomainDropdown(false); }}
                    className="mt-2 w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                  >
                    Alle auswählen
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Domain Summary Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3"
        >
          {domainSummary.filter(d => selectedDomains.includes(d.id)).map(d => (
            <div key={d.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl ${d.gradient} flex items-center justify-center text-lg`}>{d.icon}</div>
                {d.trend !== null && (
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full ${d.trend >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'}`}>
                    {d.trend >= 0 ? '+' : ''}{d.trend}%
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{d.nameDE}</div>
              <div className="text-xl font-black mt-0.5" style={{ color: d.avg !== null ? d.color : '#94a3b8' }}>
                {d.avg !== null ? `${d.avg}%` : '—'}
              </div>
              <div className="text-xs text-slate-400">{d.count} Spiele · Beste: {d.best ?? '—'}%</div>
            </div>
          ))}
        </motion.div>

        {/* Line Chart */}
        {filteredResults.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 border border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-slate-800 dark:text-slate-100">Verlauf (∅ Score pro Tag)</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  interval={Math.floor(lineChartData.length / 6)}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-xs font-bold">{DOMAINS[value]?.icon} {DOMAINS[value]?.nameDE}</span>}
                />
                {selectedDomains.map(domId => (
                  <Line
                    key={domId}
                    type="monotone"
                    dataKey={domId}
                    stroke={DOMAINS[domId].color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📈</div>
            <div className="font-black text-slate-600 text-lg">Keine Daten im gewählten Zeitraum</div>
            <p className="text-slate-400 mt-2">Trainiere mehr, um Verlaufsdaten zu sehen.</p>
          </div>
        )}

        {/* Session List */}
        {sessionList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-black text-slate-800 dark:text-slate-100">Alle Sitzungen ({sessionList.length})</h2>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {sessionList.map(r => {
                const d = DOMAINS[r.domain];
                return (
                  <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl ${d?.gradient} flex items-center justify-center text-sm flex-shrink-0`}>
                      {d?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{r.exercise_name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span>{new Date(r.created_date).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                        <span>·</span>
                        <span>{d?.nameDE}</span>
                        <span>·</span>
                        <span>Level {r.level}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-black" style={{ color: d?.color }}>{r.score}%</div>
                      <div className="text-xs text-yellow-500 font-bold">+{r.xp_earned ?? 0} XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}