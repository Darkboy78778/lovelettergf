import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OpeningAnimationProps {
  theme: string;
  onComplete: () => void;
}

const OpeningAnimation = ({ theme, onComplete }: OpeningAnimationProps) => {
  const [phase, setPhase] = useState<'lift' | 'open' | 'burst'>('lift');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('open'), 600);
    const t2 = setTimeout(() => setPhase('burst'), 1400);
    const t3 = setTimeout(() => onComplete(), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  const burstEmojis = ['💕', '✨', '💗', '🌟', '💌', '🦋', '💝', '🌸', '⭐', '💖'];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background flash */}
      <motion.div
        className="absolute inset-0 bg-primary/10"
        animate={{ opacity: phase === 'burst' ? [0, 0.3, 0] : 0 }}
        transition={{ duration: 0.8 }}
      />

      {/* Box lifting and opening */}
      <motion.div
        className="relative text-[120px] md:text-[160px]"
        animate={
          phase === 'lift'
            ? { y: -20, scale: 1.1 }
            : phase === 'open'
            ? { y: -40, scale: 1.2, rotateX: 10 }
            : { y: -60, scale: 0.8, opacity: 0 }
        }
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {phase !== 'burst' ? '🎁' : '📨'}

        {/* Glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 60px 20px rgba(232,85,109,0.3)' }}
          animate={{ opacity: phase === 'open' ? [0.5, 1, 0.5] : 0 }}
          transition={{ duration: 0.5, repeat: 2 }}
        />
      </motion.div>

      {/* Burst particles */}
      {phase === 'burst' &&
        burstEmojis.map((emoji, i) => {
          const angle = (i / burstEmojis.length) * Math.PI * 2;
          const distance = 150 + Math.random() * 100;
          return (
            <motion.div
              key={i}
              className="absolute text-3xl md:text-4xl pointer-events-none"
              style={{ left: '50%', top: '50%' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
              animate={{
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance - 50,
                opacity: 0,
                scale: [0, 1.5, 0.5],
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.05 }}
            >
              {emoji}
            </motion.div>
          );
        })}

      {/* Rising letter */}
      {phase === 'burst' && (
        <motion.div
          className="absolute text-8xl md:text-9xl"
          initial={{ y: 50, opacity: 0, scale: 0.5 }}
          animate={{ y: -20, opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        >
          💌
        </motion.div>
      )}
    </div>
  );
};

export default OpeningAnimation;
