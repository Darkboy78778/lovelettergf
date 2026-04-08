import { motion } from 'framer-motion';

const BALLOONS = [
  { color: '#FF6B8A', x: -20, y: -60, rotate: -12, delay: 0 },
  { color: '#FFD93D', x: 30, y: -75, rotate: 5, delay: 0.3 },
  { color: '#6BCB77', x: -40, y: -50, rotate: -8, delay: 0.6 },
  { color: '#4D96FF', x: 50, y: -65, rotate: 10, delay: 0.2 },
  { color: '#FF8FFB', x: -10, y: -80, rotate: -3, delay: 0.5 },
  { color: '#FF9F45', x: 45, y: -55, rotate: 7, delay: 0.4 },
];

const POSITIONS: Array<{ top: string; left?: string; right?: string }> = [
  { top: '-10px', left: '-18px' },
  { top: '-20px', right: '-14px' },
  { top: '-5px', left: '20%' },
  { top: '-15px', right: '18%' },
  { top: '-25px', left: '45%' },
  { top: '-8px', right: '-8px' },
];

const BirthdayBalloons = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20" aria-hidden>
      {BALLOONS.map((b, i) => {
        const pos = POSITIONS[i];
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{ ...pos }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + b.delay, duration: 0.8, ease: 'easeOut' }}
          >
            {/* String */}
            <motion.div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: 38, width: 1.5, height: 40, background: 'hsl(var(--muted-foreground) / 0.35)', borderRadius: 1 }}
              animate={{ rotate: [b.rotate - 2, b.rotate + 2, b.rotate - 2] }}
              transition={{ duration: 3 + b.delay, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Balloon */}
            <motion.div
              animate={{
                x: [b.x - 3, b.x + 3, b.x - 3],
                y: [b.y, b.y - 4, b.y],
                rotate: [b.rotate - 4, b.rotate + 4, b.rotate - 4],
              }}
              transition={{
                duration: 3.5 + b.delay * 0.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ filter: `drop-shadow(0 4px 8px ${b.color}44)` }}
            >
              <svg width="36" height="44" viewBox="0 0 36 44" fill="none">
                <ellipse cx="18" cy="17" rx="15" ry="17" fill={b.color} />
                <ellipse cx="18" cy="17" rx="15" ry="17" fill="url(#shine)" opacity="0.35" />
                <polygon points="14,33 18,38 22,33" fill={b.color} opacity="0.85" />
                <defs>
                  <radialGradient id="shine" cx="0.35" cy="0.3" r="0.6">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BirthdayBalloons;
