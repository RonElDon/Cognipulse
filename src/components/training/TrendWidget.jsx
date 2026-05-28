import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '@/lib/ThemeContext';

function buildDailyData(results, days) {
  const today = new Date();
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayResults = results.filter(r => r.created_date?.startsWith(dateStr));
    const avg = dayResults.length > 0
      ? Math.round(dayResults.reduce((s, r) => s + (r.score || 0), 0) / dayResults.length)
      : null;
    data.push({
      date: dateStr,
      label: i === 0 ? 'Heute' : d.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' }),
      avg,
    });
  }
  return data;
}

function getTrend(data) {
  const filled = data.filter(d => d.avg !== null);
  if (filled.length < 2) return 'neutral';
  const last = filled[filled.length - 1].avg;
  const prev = filled[filled.length - 2].avg;
  if (last > prev + 2) return 'up';
  if (last < prev - 2) return 'down';
  return 'neutral';
}

export default function TrendWidget() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);
  const { accentColor } = useTheme();

  useEffect(() => {
    base44.entities.ExerciseResult.list('-created_date', 200)
      .then(setResults)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const data = buildDailyData(results, range);
  const trend = getTrend(data);
  const latestScore = data.filter(d => d.avg !== null).pop()?.avg;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';
  const trendLabel = trend === 'up' ? 'Verbesserung' : trend === 'down' ? 'Leichter Rückgang' : 'Stabil';

  if (loading) return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-xl">
      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mb-4" />
      <div className="h-28 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendIcon className={`w-5 h-5 ${trendColor}`} />
          <h2 className="font-black text-slate-800 dark:text-slate-100 text-sm">Performance-Trend</h2>
          {latestScore && (
            <span className="text-xs font-bold text-slate-400">Ø {latestScore}%</span>
          )}
        </div>
        {/* Range toggle */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
          {[7, 30].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                range === r
                  ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {r}T
            </button>
          ))}
        </div>
      </div>

      {/* Trend badge */}
      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${
        trend === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' :
        trend === 'down' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' :
        'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
      }`}>
        <TrendIcon className="w-3 h-3" /> {trendLabel}
      </div>

      {/* Chart */}
      {data.some(d => d.avg !== null) ? (
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={data} margin={{ top: 2, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: 'rgba(148,163,184,0.7)' }}
              interval={range === 7 ? 1 : 6}
              axisLine={false}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'rgba(148,163,184,0.7)' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, fontSize: 11, color: '#e2e8f0' }}
              formatter={(v) => v !== null ? [`${v}%`, 'Ø Score'] : ['-', 'Kein Training']}
              labelStyle={{ color: '#94a3b8', marginBottom: 2 }}
            />
            <Line
              type="monotone"
              dataKey="avg"
              stroke={accentColor}
              strokeWidth={2.5}
              dot={{ r: 3, fill: accentColor, strokeWidth: 0 }}
              connectNulls={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
          Noch keine Trainingsdaten
        </div>
      )}
    </motion.div>
  );
}