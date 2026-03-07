import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicToggleProps {
  isPlaying: boolean;
  onToggle: () => void;
}

const MusicToggle = ({ isPlaying, onToggle }: MusicToggleProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      onClick={onToggle}
      className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-lg flex items-center justify-center text-primary hover:bg-card transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={isPlaying ? 'Mute music' : 'Play music'}
    >
      {isPlaying ? (
        <motion.div
          key="playing"
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
        >
          <Volume2 size={20} />
          {/* Animated sound waves */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="muted"
          initial={{ rotate: 90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
        >
          <VolumeX size={20} />
        </motion.div>
      )}
    </motion.button>
  );
};

export default MusicToggle;
