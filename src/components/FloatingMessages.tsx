import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback, useRef } from 'react';

interface FloatingMessagesProps {
  theme: string;
  senderName: string;
  recipientName: string;
  specialDate?: string;
  onComplete: () => void;
}

const THEME_MESSAGES: Record<string, string[]> = {
  love: [
    'I Love You 😘',
    'You Mean Everything ❤️',
    'Forever Yours 💕',
    'My Heart Is Yours 💗',
    'You Are My World 🌍',
    'Love You Always 💖',
    'My Soulmate ✨',
    'Endlessly In Love 🥰',
  ],
  birthday: [
    'Happy Birthday 🎉',
    'Make A Wish 🎂',
    'Your Special Day 🥳',
    'Celebrate You 🎈',
    'Born To Shine ⭐',
    'Party Time 🎊',
    'Another Amazing Year 💫',
    'Birthday Magic ✨',
  ],
  friendship: [
    'Happy Friendship Day 💛',
    'Best Friends Forever 🤝',
    'True Friendship 💫',
    'You Are Amazing 🌟',
    'Grateful For You 🙏',
    'Friends Like Family 💕',
    'Together Always 🌈',
    'Cherished Friend ✨',
  ],
  romantic: [
    'You Are Beautiful 🌹',
    'My Everything 💋',
    'Together Forever 💍',
    'Lost In You 😍',
    'My Dream Come True 🦋',
    'Eternally Yours 💝',
    'You Complete Me 🌸',
    'My Love Story 📖',
  ],
  surprise: [
    'Surprise! 🎉',
    'Just For You ✨',
    'You Deserve This 🎁',
    'Magic Moment 🪄',
    'Special Delivery 💌',
    'Unwrap The Joy 🎊',
    'A Gift Of Love 💝',
    'Made With Love 💕',
  ],
};

interface FloatingMsg {
  id: number;
  text: string;
  x: number;
  duration: number;
  size: number;
  opacity: number;
}

const COLUMNS = 5;
const MAX_VISIBLE = 8;
const SPAWN_INTERVAL = 1800;
const FALL_DURATION_MIN = 9;
const FALL_DURATION_MAX = 13;

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [activeMessages, setActiveMessages] = useState<FloatingMsg[]>([]);
  const nextIdRef = useRef(0);
  const columnIndexRef = useRef(0);

  const allMessages = useCallback(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const msgs = [
      ...themeMessages,
      `For ${recipientName} 💖`,
      `From ${senderName} ❤️`,
    ];
    if (specialDate) msgs.push(specialDate);
    return msgs;
  }, [theme, senderName, recipientName, specialDate]);

  const spawnMessage = useCallback(() => {
    const msgs = allMessages();
    const col = columnIndexRef.current % COLUMNS;
    columnIndexRef.current++;

    // Even distribution across columns with small jitter
    const colWidth = 80 / COLUMNS;
    const baseX = 10 + col * colWidth + colWidth / 2;
    const jitter = (Math.random() - 0.5) * (colWidth * 0.6);

    const msg: FloatingMsg = {
      id: nextIdRef.current++,
      text: msgs[nextIdRef.current % msgs.length],
      x: Math.max(8, Math.min(92, baseX + jitter)),
      duration: FALL_DURATION_MIN + Math.random() * (FALL_DURATION_MAX - FALL_DURATION_MIN),
      size: 13 + Math.random() * 5,
      opacity: 0.55 + Math.random() * 0.35,
    };
    return msg;
  }, [allMessages]);

  // Continuous spawning
  useEffect(() => {
    // Seed initial messages staggered
    const initial: FloatingMsg[] = [];
    for (let i = 0; i < 5; i++) {
      initial.push(spawnMessage());
    }
    setActiveMessages(initial);

    const interval = setInterval(() => {
      setActiveMessages(prev => {
        if (prev.length >= MAX_VISIBLE) return prev;
        return [...prev, spawnMessage()];
      });
    }, SPAWN_INTERVAL);

    const timer = setTimeout(onComplete, 16000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [spawnMessage, onComplete]);

  const handleAnimationComplete = useCallback((id: number) => {
    setActiveMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.3), transparent 70%)',
        }}
      />

      {/* Floating messages with continuous flow */}
      <AnimatePresence>
        {activeMessages.map((msg) => (
          <motion.div
            key={msg.id}
            className="absolute font-display font-semibold text-primary whitespace-nowrap pointer-events-none will-change-transform"
            style={{
              left: `${msg.x}%`,
              transform: 'translateX(-50%)',
              fontSize: `${msg.size}px`,
              textShadow: '0 0 16px hsl(var(--primary) / 0.3), 0 2px 10px hsl(var(--background) / 0.6)',
            }}
            initial={{ top: '-8%', opacity: 0, scale: 0.85 }}
            animate={{
              top: '108%',
              opacity: [0, msg.opacity * 0.7, msg.opacity, msg.opacity, msg.opacity * 0.5, 0],
              scale: [0.85, 1, 1, 1, 0.95, 0.9],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: msg.duration,
              ease: 'linear',
              opacity: { times: [0, 0.08, 0.15, 0.75, 0.9, 1] },
              scale: { times: [0, 0.1, 0.2, 0.8, 0.9, 1] },
            }}
            onAnimationComplete={() => handleAnimationComplete(msg.id)}
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center focus message */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 8, delay: 3, times: [0, 0.1, 0.7, 1] }}
      >
        <div className="text-center px-6">
          <motion.p
            className="font-display text-3xl md:text-4xl font-bold text-primary"
            style={{ textShadow: '0 4px 24px hsl(var(--primary) / 0.35)' }}
            animate={{ scale: [0.95, 1.03, 0.95] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {theme === 'birthday' && `Happy Birthday ${recipientName}! 🎉`}
            {theme === 'friendship' && `For My Dearest Friend 💛`}
            {theme === 'romantic' && `I Love You ${recipientName} 💕`}
            {theme === 'love' && `With All My Heart ❤️`}
            {theme === 'surprise' && `A Special Surprise! ✨`}
          </motion.p>
        </div>
      </motion.div>

      {/* Skip/tap hint */}
      <motion.button
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 font-body text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0.7] }}
        transition={{ delay: 6, duration: 1 }}
        onClick={onComplete}
      >
        Tap to continue →
      </motion.button>
    </div>
  );
};

export default FloatingMessages;
