import { getLevel } from '@/lib/exercises';

export default function XPBar({ xp, compact = false }) {
  const { current, next } = getLevel(xp);
  const progress = next ?
  (xp - current.minXP) / (next.minXP - current.minXP) * 100 :
  100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: current.color }}>
          Lv.{current.level}
        </span>
        <div className="flex-1 bg-slate-200 rounded-full h-1.5 min-w-16">
          <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: current.color }} />
        </div>
        <span className="text-xs font-medium text-gray-50 bg-gray-600">{xp} XP</span>
      </div>);

  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold px-3 py-1 rounded-full text-white shadow-sm" style={{ backgroundColor: current.color }}>
            Level {current.level} · {current.name}
          </span>
        </div>
        <span className="text-sm font-bold text-slate-600">{xp} XP</span>
      </div>
      <div className="bg-slate-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${current.color}, ${next?.color || current.color})` }} />
        
      </div>
      {next &&
      <div className="text-xs text-slate-500 text-right">{next.minXP - xp} XP bis {next.name}</div>
      }
    </div>);

}