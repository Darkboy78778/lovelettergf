import { motion } from 'framer-motion';
import FloatingHearts from './FloatingHearts';
import SparkleParticles from './SparkleParticles';

interface TransitionScreenProps {
  recipientName: string;
  theme: string;
  onNext: () => void;
}

const themeEmoji: Record<string, string> = {
  love: '💕',
  birthday: '🎂',
  friendship: '💛',
  romantic: '🌹',
  surprise: '🎁',
};

const TransitionScreen = ({ recipientName, theme, onNext }: TransitionScreenProps) => {
  return (
    <div className="min-h-screen gradient-romantic relative overflow-hidden flex items-center justify-center">
      <FloatingHearts count={10} />
      <SparkleParticles count={20} />

      {/* Ambient glow */}
      <motion.div
        className="absolute w-72 h-72 rounded-full blur-3xl opacity-20"
        style={{ background: 'hsl(var(--primary))' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 text-center px-6 max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
          className="text-6xl mb-6"
        >
          {themeEmoji[theme] || '💕'}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display text-2xl md:text-3xl font-bold mb-3"
        >
          Hey {recipientName}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="font-body text-muted-foreground mb-10"
        >
          Someone has prepared something truly special for you...
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNext}
          className="relative group"
        >
          {/* Button glow */}
          <motion.div
            className="absolute -inset-2 rounded-full blur-lg opacity-40"
            style={{ background: 'hsl(var(--primary))' }}
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="relative bg-primary text-primary-foreground font-body font-medium text-lg px-10 py-4 rounded-full shadow-lg flex items-center gap-3">
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ✨
            </motion.span>
            Open Your Surprise
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              →
            </motion.span>
          </div>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default TransitionScreen;
