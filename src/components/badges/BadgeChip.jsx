import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGE_TIERS } from '@/lib/badges';

// Hexagon SVG path
const HEX_PATH = "M50 5 L93 27.5 L93 72.5 L50 95 L7 72.5 L7 27.5 Z";

function NeuralPattern({ color }) {
  return (
    <g opacity="0.18">
      <circle cx="50" cy="50" r="18" stroke={color} strokeWidth="1.2" fill="none" />
      <circle cx="50" cy="50" r="30" stroke={color} strokeWidth="0.7" fill="none" />
      <line x1="50" y1="5" x2="50" y2="95" stroke={color} strokeWidth="0.6" />
      <line x1="7" y1="27.5" x2="93" y2="72.5" stroke={color} strokeWidth="0.6" />
      <line x1="93" y1="27.5" x2="7" y2="72.5" stroke={color} strokeWidth="0.6" />
      <circle cx="50" cy="5"  r="2.5" fill={color} />
      <circle cx="93" cy="27.5" r="2.5" fill={color} />
      <circle cx="93" cy="72.5" r="2.5" fill={color} />
      <circle cx="50" cy="95" r="2.5" fill={color} />
      <circle cx="7"  cy="72.5" r="2.5" fill={color} />
      <circle cx="7"  cy="27.5" r="2.5" fill={color} />
    </g>
  );
}

const RAINBOW_KEYFRAMES = `
@keyframes rainbowBorder {
  0%   { border-color: #FF6B6B; box-shadow: 0 0 18px #FF6B6B88; }
  16%  { border-color: #FFD700; box-shadow: 0 0 18px #FFD70088; }
  33%  { border-color: #4ADE80; box-shadow: 0 0 18px #4ADE8088; }
  50%  { border-color: #8FE9FF; box-shadow: 0 0 18px #8FE9FF88; }
  66%  { border-color: #B388FF; box-shadow: 0 0 18px #B388FF88; }
  83%  { border-color: #FF6B6B; box-shadow: 0 0 18px #FF6B6B88; }
  100% { border-color: #FF6B6B; box-shadow: 0 0 18px #FF6B6B88; }
}
@keyframes rainbowGlow {
  0%,100% { opacity: 0.4; }
  50%      { opacity: 0.9; }
}
`;

export default function BadgeChip({ badge, earned = false, size = 80, showFlip = true }) {
  const [flipped, setFlipped] = useState(false);
  const tier = BADGE_TIERS[badge.tier];
  const isLegend = badge.tier === 'legend';
  const color = isLegend ? '#FFD700' : (tier?.color || '#888');
  const glow  = isLegend ? '#FFD70055' : (tier?.glow  || '#88888833');

  const front = (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      {/* SVG hexagon */}
      <svg viewBox="0 0 100 100" style={{ width: size, height: size, position: 'absolute', top: 0, left: 0 }}>
        <defs>
          <filter id={`glow-${badge.id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Outer hex fill */}
        <path d={HEX_PATH} fill={earned ? `${color}22` : '#1e293b'} />

        {/* Neural pattern */}
        <NeuralPattern color={earned ? color : '#475569'} />

        {/* Border ring */}
        <path
          d={HEX_PATH}
          fill="none"
          stroke={earned ? color : '#334155'}
          strokeWidth={earned ? 3.5 : 2}
          filter={earned ? `url(#glow-${badge.id})` : undefined}
          style={isLegend && earned ? { animation: 'rainbowBorder 3s linear infinite' } : {}}
        />

        {/* Inner highlight */}
        {earned && (
          <path d="M50 12 L85 31 L85 69 L50 88 L15 69 L15 31 Z"
            fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        )}
      </svg>

      {/* Icon */}
      <div className="relative z-10 flex flex-col items-center" style={{ marginTop: -4 }}>
        <span style={{ fontSize: size * 0.3, filter: earned ? 'none' : 'grayscale(1) brightness(0.4)', lineHeight: 1 }}>
          {badge.icon}
        </span>
      </div>
    </div>
  );

  const back = (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center"
      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
      <div className="text-xs font-black leading-tight" style={{ color: earned ? color : '#64748b', fontSize: size * 0.11 }}>
        {badge.title}
      </div>
      {earned && (
        <div className="mt-1 text-center" style={{ fontSize: size * 0.095, color: '#94a3b8', lineHeight: 1.3 }}>
          {badge.neuro}
        </div>
      )}
      {!earned && (
        <div className="mt-1 text-slate-600" style={{ fontSize: size * 0.1 }}>
          🔒
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{RAINBOW_KEYFRAMES}</style>
      <div
        className="relative cursor-pointer select-none"
        style={{ width: size, height: size, perspective: 600 }}
        onClick={() => showFlip && setFlipped(f => !f)}
        title={badge.title}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d', position: 'relative', width: size, height: size }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        >
          {/* Front */}
          <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
            {front}
          </div>

          {/* Back */}
          <div className="absolute inset-0 rounded-xl" 
            style={{ 
              backfaceVisibility: 'hidden', 
              transform: 'rotateY(180deg)',
              background: earned ? `${color}18` : '#1e293b',
              border: `1.5px solid ${earned ? color : '#334155'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: 6,
            }}>
            <div className="font-black text-center leading-tight" style={{ color: earned ? color : '#64748b', fontSize: Math.max(size * 0.11, 9) }}>
              {badge.title}
            </div>
            {earned && (
              <div className="text-center mt-1" style={{ color: '#94a3b8', fontSize: Math.max(size * 0.095, 8), lineHeight: 1.3 }}>
                {badge.neuro}
              </div>
            )}
            {!earned && <div className="text-slate-600 mt-1 text-lg">🔒</div>}
          </div>
        </motion.div>

        {/* Glow ring for earned */}
        {earned && (
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ boxShadow: `0 0 ${size * 0.18}px ${glow}`, borderRadius: '50%' }} />
        )}

        {/* Legend pulse */}
        {earned && isLegend && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.95, 1.08, 0.95] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, transparent 70%)', borderRadius: '50%' }}
          />
        )}
      </div>
    </>
  );
}