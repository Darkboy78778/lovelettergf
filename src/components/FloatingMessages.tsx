import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

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

interface FallingMsg {
  id: number;
  text: string;
  xPercent: number;
  duration: number;
  startOffset: number; // negative px above viewport
  fontSize: number;
  opacity: number;
}

const POOL_SIZE = 10;
const COLUMNS = 5;

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [messages, setMessages] = useState<FallingMsg[]>([]);
  const nextId = useRef(0);
  const msgIdx = useRef(0);
  const colCursor = useRef(0);

  const pool = useMemo(() => {
    const base = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const extras = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];
    if (specialDate) extras.push(`${specialDate} 📅`);
    return [...base, ...extras];
  }, [theme, senderName, recipientName, specialDate]);

  const makeMsg = useCallback((stagger = 0): FallingMsg => {
    const text = pool[msgIdx.current % pool.length];
    msgIdx.current++;

    // Even column distribution with jitter
    const col = colCursor.current % COLUMNS;
    colCursor.current++;
    const colW = 100 / COLUMNS;
    const jitter = (Math.random() - 0.5) * colW * 0.5;
    const xPercent = Math.max(3, Math.min(97, col * colW + colW / 2 + jitter));

    return {
      id: nextId.current++,
      text,
      xPercent,
      duration: 9 + Math.random() * 3, // 9-12s
      startOffset: -(50 + Math.random() * 100), // -50 to -150px above viewport
      fontSize: 13 + Math.random() * 5,
      opacity: 0.7 + Math.random() * 0.25,
    };
  }, [pool]);

  useEffect(() => {
    // Seed initial messages with staggered animation delays
    const initial: FallingMsg[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const m = makeMsg();
      // Stagger: spread initial messages across the fall so they don't all start at top
      m.duration = 9 + Math.random() * 3;
      initial.push(m);
    }
    setMessages(initial);

    // Respawn: check periodically and replace finished messages
    const interval = setInterval(() => {
      setMessages(prev => {
        // Keep pool size constant - just cycle messages
        if (prev.length < POOL_SIZE) {
          const newMsgs = [...prev];
          while (newMsgs.length < POOL_SIZE) {
            newMsgs.push(makeMsg());
          }
          return newMsgs;
        }
        return prev;
      });
    }, 800);

    const completeTimer = setTimeout(onComplete, 18000);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [makeMsg, onComplete]);

  // When animation ends on a message, replace it
  const handleAnimEnd = useCallback((id: number) => {
    setMessages(prev => prev.map(m => m.id === id ? makeMsg() : m));
  }, [makeMsg]);

  // Stagger initial messages so they appear at different vertical positions
  const staggerDelays = useRef<Map<number, number>>(new Map());
  const getDelay = (msg: FallingMsg, index: number) => {
    if (!staggerDelays.current.has(msg.id)) {
      // First batch gets staggered delays so screen fills naturally
      if (nextId.current <= POOL_SIZE + 5) {
        staggerDelays.current.set(msg.id, index * 0.8 + Math.random() * 0.5);
      } else {
        staggerDelays.current.set(msg.id, 0);
      }
    }
    return staggerDelays.current.get(msg.id) || 0;
  };

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      <style>{`
        @keyframes msg-fall {
          from { transform: translateY(0); }
          to { transform: translateY(calc(100vh + 200px)); }
        }
      `}</style>

      {/* Subtle ambient glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.3), transparent 70%)' }}
      />

      {/* Falling messages */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            onAnimationEnd={() => handleAnimEnd(msg.id)}
            className="absolute whitespace-nowrap font-display font-semibold text-primary"
            style={{
              left: `${msg.xPercent}%`,
              top: `${msg.startOffset}px`,
              fontSize: `${msg.fontSize}px`,
              opacity: msg.opacity,
              transform: 'translateX(-50%)',
              animation: `msg-fall ${msg.duration}s linear ${getDelay(msg, i)}s forwards`,
              willChange: 'transform',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Center focus */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 8, delay: 3, times: [0, 0.1, 0.7, 1] }}
      >
        <div className="text-center px-6">
          <motion.p
            className="font-display text-3xl md:text-4xl font-bold text-primary"
            animate={{ scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {theme === 'birthday' && `Happy Birthday ${recipientName}! 🎉`}
            {theme === 'friendship' && `For My Dearest Friend 💛`}
            {theme === 'romantic' && `I Love You ${recipientName} 💕`}
            {theme === 'love' && `With All My Heart ❤️`}
            {theme === 'surprise' && `A Special Surprise! ✨`}
          </motion.p>
        </div>
      </motion.div>

      {/* Skip */}
      <motion.button
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 font-body text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 5, duration: 1 }}
        onClick={onComplete}
      >
        Tap to continue →
      </motion.button>
    </div>
  );
};

export default FloatingMessages;
