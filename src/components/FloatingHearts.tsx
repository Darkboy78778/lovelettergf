import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

const FloatingHearts = ({ count = 15 }: { count?: number }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
        size: 12 + Math.random() * 20,
      }))
    );
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bottom-0"
          style={{ left: `${p.x}%` }}
          initial={{ y: 0, opacity: 0.7 }}
          animate={{ y: '-100vh', opacity: 0 }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          <Heart
            size={p.size}
            className="text-primary fill-primary opacity-30"
          />
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingHearts;
