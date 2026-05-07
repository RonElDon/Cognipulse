import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useTheme } from '@/lib/ThemeContext';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function ProgressWidget() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { accentColor } = useTheme();

  useEffect(() => {
    base44.entities.ExerciseResult.list('-created_date', 50)
      .then(results => {
        // Group by date and compute daily average score
        const byDate = {};
        results.forEach(r => {
          const date = r.created_date?.slice(0, 10);
          if (!date) return;
          if (!byDate[date]) byDate[date] = { total: 0, count: 0 };
          byDate[date].total += r.score || 0;
          byDate[date].count += 1;
        });

        const data = Object.entries(byDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-14) // last 14 days
          .map(([date, { total, count }]) => ({
            date: new Date(date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
            score: Math.round(total / count),
          }));

        setChartData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-5 border border-slate-100 dark:border-slate-700">
        <div className="h-4 w-40 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mb-4" />
        <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (chartData.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-5 border border-slate-100 dark:border-slate-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Leistungsverlauf
        </h2>
        <Link to="/progress" className="text-xs text-purple-600 font-bold flex items-center gap-1 hover:text-purple-700">
          Details <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: 'none',
              borderRadius: '12px',
              color: '#f1f5f9',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
            formatter={(v) => [`${v}%`, 'Ø Score']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={accentColor}
            strokeWidth={2.5}
            dot={{ fill: accentColor, r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}