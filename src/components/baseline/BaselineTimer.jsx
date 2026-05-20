import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const MAX_SECONDS = 90;

export default function BaselineTimer({ exerciseIdx, onTimeout }) {
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const timeoutFiredRef = useRef(false);

  // Reset when exercise changes
  useEffect(() => {
    setSecondsLeft(MAX_SECONDS);
    timeoutFiredRef.current = false;
  }, [exerciseIdx]);

  useEffect(() => {
    const ti = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(ti);
          if (!timeoutFiredRef.current) {
            timeoutFiredRef.current = true;
            setTimeout(onTimeout, 100);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(ti);
  }, [exerciseIdx]);

  const pct = (secondsLeft / MAX_SECONDS) * 100;
  const isUrgent = secondsLeft <= 20;

  return (
    <div className="w-full max-w-lg mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${isUrgent ? 'text-red-400' : 'text-white/50'}`}>
          ⏱ {secondsLeft}s
        </span>
        <span className={`text-xs font-semibold ${isUrgent ? 'text-red-400' : 'text-white/30'}`}>
          {isUrgent ? 'Bald weiter →' : 'Max. Zeit'}
        </span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${isUrgent ? 'bg-red-400' : 'bg-gradient-to-r from-purple-400 to-indigo-400'}`}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </div>
    </div>
  );
}