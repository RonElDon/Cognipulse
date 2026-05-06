import { motion } from 'framer-motion';

/**
 * Neuro — animated SVG brain character with emotions.
 * Emotions: happy | excited | thinking | proud | sad | sleeping | focused | encouraging
 */

const EMOTION_CONFIGS = {
  happy: {
    bodyColor: '#8b5cf6',
    bodyColorDark: '#6d28d9',
    cheekColor: '#f9a8d4',
    eyeScale: 1,
    eyeSquint: false,
    pupilOffset: { x: 0, y: 0 },
    mouthPath: 'M 34 58 Q 50 72 66 58',
    mouthOpen: false,
    blinkInterval: 3500,
    floatAmplitude: 8,
    swayAmplitude: 4,
    sparkles: false,
    sweat: false,
    zzz: false,
  },
  excited: {
    bodyColor: '#f59e0b',
    bodyColorDark: '#d97706',
    cheekColor: '#fca5a5',
    eyeScale: 1.15,
    eyeSquint: false,
    pupilOffset: { x: 0, y: -2 },
    mouthPath: 'M 32 56 Q 50 74 68 56',
    mouthOpen: true,
    blinkInterval: 2000,
    floatAmplitude: 14,
    swayAmplitude: 6,
    sparkles: true,
    sweat: false,
    zzz: false,
  },
  proud: {
    bodyColor: '#10b981',
    bodyColorDark: '#059669',
    cheekColor: '#6ee7b7',
    eyeScale: 1,
    eyeSquint: true,
    pupilOffset: { x: 0, y: 0 },
    mouthPath: 'M 34 57 Q 50 74 66 57',
    mouthOpen: false,
    blinkInterval: 4000,
    floatAmplitude: 6,
    swayAmplitude: 3,
    sparkles: true,
    sweat: false,
    zzz: false,
  },
  thinking: {
    bodyColor: '#6366f1',
    bodyColorDark: '#4338ca',
    cheekColor: 'transparent',
    eyeScale: 0.9,
    eyeSquint: false,
    pupilOffset: { x: 4, y: -3 },
    mouthPath: 'M 38 62 Q 50 60 62 64',
    mouthOpen: false,
    blinkInterval: 5000,
    floatAmplitude: 4,
    swayAmplitude: 2,
    sparkles: false,
    sweat: false,
    zzz: false,
  },
  sad: {
    bodyColor: '#64748b',
    bodyColorDark: '#475569',
    cheekColor: '#93c5fd',
    eyeScale: 0.85,
    eyeSquint: false,
    pupilOffset: { x: 0, y: 3 },
    mouthPath: 'M 36 66 Q 50 56 64 66',
    mouthOpen: false,
    blinkInterval: 6000,
    floatAmplitude: 3,
    swayAmplitude: 1,
    sparkles: false,
    sweat: false,
    zzz: false,
  },
  encouraging: {
    bodyColor: '#f97316',
    bodyColorDark: '#ea580c',
    cheekColor: '#fca5a5',
    eyeScale: 1.05,
    eyeSquint: false,
    pupilOffset: { x: 0, y: 0 },
    mouthPath: 'M 34 58 Q 50 72 66 58',
    mouthOpen: false,
    blinkInterval: 3000,
    floatAmplitude: 10,
    swayAmplitude: 5,
    sparkles: false,
    sweat: false,
    zzz: false,
  },
  sleeping: {
    bodyColor: '#a78bfa',
    bodyColorDark: '#7c3aed',
    cheekColor: '#fde68a',
    eyeScale: 0.3,
    eyeSquint: true,
    pupilOffset: { x: 0, y: 0 },
    mouthPath: 'M 42 62 Q 50 66 58 62',
    mouthOpen: false,
    blinkInterval: 99999,
    floatAmplitude: 3,
    swayAmplitude: 1,
    sparkles: false,
    sweat: false,
    zzz: true,
  },
  focused: {
    bodyColor: '#06b6d4',
    bodyColorDark: '#0891b2',
    cheekColor: 'transparent',
    eyeScale: 1,
    eyeSquint: false,
    pupilOffset: { x: -3, y: 0 },
    mouthPath: 'M 40 62 Q 50 62 60 62',
    mouthOpen: false,
    blinkInterval: 7000,
    floatAmplitude: 2,
    swayAmplitude: 1,
    sparkles: false,
    sweat: false,
    zzz: false,
  },
};

function NeuroEye({ cx, cy, scale, squint, pupilOffset, blinkInterval }) {
  const eyeW = 13 * scale;
  const eyeH = squint ? 4 * scale : 13 * scale;

  return (
    <motion.g>
      {/* Eye white */}
      <motion.ellipse
        cx={cx} cy={cy}
        rx={eyeW} ry={eyeH}
        fill="white"
        animate={{ ry: [eyeH, eyeH, 1, eyeH, eyeH] }}
        transition={{
          duration: 0.35,
          repeat: Infinity,
          repeatDelay: blinkInterval / 1000,
          ease: 'easeInOut',
          times: [0, 0.4, 0.5, 0.6, 1],
        }}
      />
      {/* Pupil */}
      {!squint && (
        <motion.circle
          cx={cx + pupilOffset.x}
          cy={cy + pupilOffset.y}
          r={5 * scale}
          fill="#1e1b4b"
          animate={{ ry: [5 * scale, 5 * scale, 0.5, 5 * scale, 5 * scale] }}
          transition={{
            duration: 0.35,
            repeat: Infinity,
            repeatDelay: blinkInterval / 1000,
            ease: 'easeInOut',
            times: [0, 0.4, 0.5, 0.6, 1],
          }}
        />
      )}
      {/* Shine */}
      {!squint && (
        <circle cx={cx + pupilOffset.x + 3} cy={cy + pupilOffset.y - 3} r={2} fill="white" opacity={0.7} />
      )}
    </motion.g>
  );
}

export default function NeuroCharacter({ emotion = 'happy', size = 100, className = '' }) {
  const cfg = EMOTION_CONFIGS[emotion] || EMOTION_CONFIGS.happy;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -cfg.floatAmplitude, 0],
        rotate: [-cfg.swayAmplitude / 2, cfg.swayAmplitude / 2, -cfg.swayAmplitude / 2],
      }}
      transition={{
        y: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' },
        rotate: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' },
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`bodyGrad-${emotion}`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor={cfg.bodyColor} />
            <stop offset="100%" stopColor={cfg.bodyColorDark} />
          </radialGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={cfg.bodyColorDark} floodOpacity="0.35" />
          </filter>
        </defs>

        {/* BODY — rounded brain-blob shape */}
        <motion.g filter="url(#shadow)">
          {/* Main circle */}
          <circle cx="50" cy="50" r="38" fill={`url(#bodyGrad-${emotion})`} />

          {/* Brain bumps on top */}
          <motion.circle
            cx="28" cy="22" r="14"
            fill={`url(#bodyGrad-${emotion})`}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            style={{ transformOrigin: '28px 22px' }}
          />
          <motion.circle
            cx="50" cy="16" r="13"
            fill={`url(#bodyGrad-${emotion})`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', delay: 0.3 }}
            style={{ transformOrigin: '50px 16px' }}
          />
          <motion.circle
            cx="72" cy="22" r="13"
            fill={`url(#bodyGrad-${emotion})`}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: 0.6 }}
            style={{ transformOrigin: '72px 22px' }}
          />

          {/* Brain crease lines */}
          <path d="M 50 28 Q 55 38 50 48" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.3" />
          <path d="M 38 32 Q 42 40 40 50" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.2" />
          <path d="M 62 32 Q 58 40 60 50" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.2" />
        </motion.g>

        {/* CHEEKS */}
        {cfg.cheekColor !== 'transparent' && (
          <>
            <ellipse cx="28" cy="63" rx="9" ry="6" fill={cfg.cheekColor} opacity="0.55" />
            <ellipse cx="72" cy="63" rx="9" ry="6" fill={cfg.cheekColor} opacity="0.55" />
          </>
        )}

        {/* EYES */}
        <NeuroEye
          cx={38} cy={52}
          scale={cfg.eyeScale}
          squint={cfg.eyeSquint}
          pupilOffset={cfg.pupilOffset}
          blinkInterval={cfg.blinkInterval}
        />
        <NeuroEye
          cx={62} cy={52}
          scale={cfg.eyeScale}
          squint={cfg.eyeSquint}
          pupilOffset={cfg.pupilOffset}
          blinkInterval={cfg.blinkInterval}
        />

        {/* MOUTH */}
        <motion.path
          d={cfg.mouthPath}
          stroke="white"
          strokeWidth={cfg.mouthOpen ? 2.5 : 2.5}
          strokeLinecap="round"
          fill={cfg.mouthOpen ? 'rgba(30,27,75,0.6)' : 'none'}
          animate={emotion === 'excited' ? { d: [cfg.mouthPath, 'M 32 56 Q 50 78 68 56', cfg.mouthPath] } : {}}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        />

        {/* THINKING bubble */}
        {emotion === 'thinking' && (
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ transformOrigin: '75px 15px' }}
          >
            <circle cx="68" cy="28" r="3" fill="white" opacity="0.7" />
            <circle cx="74" cy="20" r="4.5" fill="white" opacity="0.7" />
            <circle cx="82" cy="13" r="6" fill="white" opacity="0.7" />
            <circle cx="88" cy="7" r="5" fill="white" opacity="0.6" />
            <text x="84" y="10" fontSize="6" textAnchor="middle" fill={cfg.bodyColorDark} fontWeight="bold">?</text>
          </motion.g>
        )}

        {/* ZZZ for sleeping */}
        {cfg.zzz && (
          <>
            {[0, 1, 2].map(i => (
              <motion.text
                key={i}
                x={70 + i * 6}
                y={20 - i * 8}
                fontSize={6 + i * 2}
                fill="white"
                fontWeight="bold"
                opacity="0"
                animate={{ opacity: [0, 0.8, 0], y: [20 - i * 8, 12 - i * 8] }}
                transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.7, ease: 'easeInOut' }}
              >
                z
              </motion.text>
            ))}
          </>
        )}

        {/* SPARKLES for excited/proud */}
        {cfg.sparkles && (
          <>
            {[
              { x: 8, y: 18, delay: 0 },
              { x: 88, y: 15, delay: 0.4 },
              { x: 14, y: 72, delay: 0.8 },
              { x: 86, y: 70, delay: 1.2 },
            ].map((s, i) => (
              <motion.g key={i} style={{ transformOrigin: `${s.x}px ${s.y}px` }}>
                <motion.text
                  x={s.x} y={s.y}
                  fontSize="10"
                  textAnchor="middle"
                  animate={{
                    scale: [0, 1.2, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180],
                  }}
                  transition={{ repeat: Infinity, duration: 1.8, delay: s.delay, ease: 'easeInOut' }}
                  style={{ transformOrigin: `${s.x}px ${s.y}px` }}
                >
                  ✦
                </motion.text>
              </motion.g>
            ))}
          </>
        )}

        {/* ENCOURAGING — small fist/heart */}
        {emotion === 'encouraging' && (
          <motion.text
            x="78" y="82"
            fontSize="14"
            animate={{ scale: [1, 1.3, 1], rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            style={{ transformOrigin: '78px 82px' }}
          >
            💪
          </motion.text>
        )}

        {/* PROUD — small star */}
        {emotion === 'proud' && (
          <motion.text
            x="78" y="82"
            fontSize="13"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            style={{ transformOrigin: '78px 82px' }}
          >
            ⭐
          </motion.text>
        )}
      </svg>
    </motion.div>
  );
}