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
    'I Love You 😘', 'You Mean Everything ❤️', 'Forever Yours 💕',
    'My Heart Is Yours 💗', 'You Are My World 🌍', 'Love You Always 💖',
    'My Soulmate ✨', 'Endlessly In Love 🥰', 'You Complete Me 💞',
    'Always & Forever 🌹', 'Crazy About You 😍', 'My One & Only 💝',
  ],
  birthday: [
    'Happy Birthday 🎉', 'Make A Wish 🎂', 'Your Special Day 🥳',
    'Celebrate You 🎈', 'Born To Shine ⭐', 'Party Time 🎊',
    'Another Amazing Year 💫', 'Birthday Magic ✨', 'Cheers To You 🥂',
    'You Are A Gift 🎁', 'Blow The Candles 🕯️', 'Hip Hip Hooray 🎶',
  ],
  friendship: [
    'Happy Friendship Day 💛', 'Best Friends Forever 🤝', 'True Friendship 💫',
    'You Are Amazing 🌟', 'Grateful For You 🙏', 'Friends Like Family 💕',
    'Together Always 🌈', 'Cherished Friend ✨', 'You Rock 🤘',
    'My Bestie 💜', 'Soul Sister 👯', 'Ride Or Die 🚀',
  ],
  romantic: [
    'You Are Beautiful 🌹', 'My Everything 💋', 'Together Forever 💍',
    'Lost In You 😍', 'My Dream Come True 🦋', 'Eternally Yours 💝',
    'You Complete Me 🌸', 'My Love Story 📖', 'Stolen My Heart 💘',
    'My Paradise 🏝️', 'Butterflies 🦋', 'Kiss Me 💋',
  ],
  surprise: [
    'Surprise! 🎉', 'Just For You ✨', 'You Deserve This 🎁',
    'Magic Moment 🪄', 'Special Delivery 💌', 'Unwrap The Joy 🎊',
    'A Gift Of Love 💝', 'Made With Love 💕', 'Ta-Da! 🎭',
    'Open Me 📦', 'Something Special 🌟', 'Just Because 💫',
  ],
};

interface FloatingMsg {
  id: number;
  text: string;
  x: number;
  startY: number;
  duration: number;
  size: number;
  opacity: number;
  delay: number;
}

const MAX_VISIBLE = 12;
const SPAWN_INTERVAL = 800;

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [activeMessages, setActiveMessages] = useState<FloatingMsg[]>([]);
  const nextIdRef = useRef(0);
  const msgIndexRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setInterval>>();

  const allMessages = useCallback(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const msgs = [
      ...themeMessages,
      `For ${recipientName} 💖`,
      `From ${senderName} ❤️`,
    ];
    if (specialDate) msgs.push(`${specialDate} 📅`);
    return msgs;
  }, [theme, senderName, recipientName, specialDate]);

  const spawnMessage = useCallback((initialOffset = false): FloatingMsg => {
    const msgs = allMessages();
    const text = msgs[msgIndexRef.current % msgs.length];
    msgIndexRef.current++;

    // Distribute across screen width using zones
    const zones = 7;
    const zone = nextIdRef.current % zones;
    const zoneWidth = 100 / zones;
    const baseX = zone * zoneWidth + zoneWidth / 2;
    const jitter = (Math.random() - 0.5) * (zoneWidth * 0.7);
    const x = Math.max(5, Math.min(95, baseX + jitter));

    const id = nextIdRef.current++;

    return {
      id,
      text,
      x,
      startY: initialOffset ? -(Math.random() * 80 + 10) : -10,
      duration: 7 + Math.random() * 4,
      size: 14 + Math.random() * 6,
      opacity: 0.6 + Math.random() * 0.35,
      delay: initialOffset ? Math.random() * 2 : 0,
    };
  }, [allMessages]);

  const removeMessage = useCallback((id: number) => {
    setActiveMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  useEffect(() => {
    // Seed initial batch spread across screen
    const initial: FloatingMsg[] = [];
    for (let i = 0; i < 8; i++) {
      initial.push(spawnMessage(true));
    }
    setActiveMessages(initial);

    // Continuously spawn new messages
    spawnTimerRef.current = setInterval(() => {
      setActiveMessages(prev => {
        if (prev.length >= MAX_VISIBLE) return prev;
        return [...prev, spawnMessage(false)];
      });
    }, SPAWN_INTERVAL);

    const completeTimer = setTimeout(onComplete, 18000);

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      clearTimeout(completeTimer);
    };
  }, [spawnMessage, onComplete]);

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.35), transparent 70%)',
        }}
      />

      {/* Floating messages */}
      <AnimatePresence>
        {activeMessages.map((msg) => (
          <motion.div
            key={msg.id}
            className="absolute font-display font-semibold text-primary whitespace-nowrap pointer-events-none"
            style={{
              left: `${msg.x}%`,
              fontSize: `${msg.size}px`,
              textShadow: '0 0 20px hsl(var(--primary) / 0.4), 0 2px 8px hsl(var(--background) / 0.7)',
              x: '-50%',
            }}
            initial={{
              y: `${msg.startY}vh`,
              opacity: 0,
              scale: 0.8,
            }}
            animate={{
              y: '110vh',
              opacity: [0, msg.opacity, msg.opacity, msg.opacity, 0],
              scale: [0.8, 1, 1, 1, 0.9],
            }}
            transition={{
              y: { duration: msg.duration, ease: 'linear', delay: msg.delay },
              opacity: { duration: msg.duration, times: [0, 0.08, 0.4, 0.85, 1], delay: msg.delay },
              scale: { duration: msg.duration, times: [0, 0.1, 0.4, 0.85, 1], delay: msg.delay },
            }}
            onAnimationComplete={() => removeMessage(msg.id)}
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

      {/* Skip hint */}
      <motion.button
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 font-body text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7] }}
        transition={{ delay: 5, duration: 1 }}
        onClick={onComplete}
      >
        Tap to continue →
      </motion.button>
    </div>
  );
};

export default FloatingMessages;
