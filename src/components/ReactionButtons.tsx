import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { sendReaction, ReactionType } from '@/lib/giftTracking';

const REACTIONS: ReactionType[] = ['❤️', '🥺', '😍', '🎉'];

interface ReactionButtonsProps {
  giftId: string;
}

const ReactionButtons = ({ giftId }: ReactionButtonsProps) => {
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; x: number }[]>([]);
  let counter = 0;

  const handleReaction = async (reaction: ReactionType) => {
    const id = counter++;
    const x = Math.random() * 60 - 30;
    setFloatingEmojis(prev => [...prev, { id, emoji: reaction, x }]);
    setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 1500);
    await sendReaction(giftId, reaction);
  };

  return (
    <div className="relative">
      {/* Floating reaction animations */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 pointer-events-none w-40 h-16">
        <AnimatePresence>
          {floatingEmojis.map(({ id, emoji, x }) => (
            <motion.span
              key={id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              animate={{ opacity: 0, y: -60, x, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute left-1/2 bottom-0 text-2xl"
            >
              {emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        className="flex justify-center gap-3"
      >
        {REACTIONS.map((reaction) => (
          <motion.button
            key={reaction}
            whileTap={{ scale: 1.4 }}
            whileHover={{ scale: 1.15 }}
            onClick={() => handleReaction(reaction)}
            className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            {reaction}
          </motion.button>
        ))}
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.3 }}
        className="text-center text-xs text-muted-foreground font-body mt-2"
      >
        Tap to send a reaction 💫
      </motion.p>
    </div>
  );
};

export default ReactionButtons;
