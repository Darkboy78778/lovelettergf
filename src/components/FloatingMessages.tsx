import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

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

interface FallingMessage {
  id: number;
  text: string;
  xPercent: number;
  delay: number;      // seconds before animation starts
  duration: number;    // fall duration in seconds
  fontSize: number;
  opacity: number;
}

// 14 messages total, staggered so ~1 new message enters every ~1s
const POOL_SIZE = 14;
const FALL_DURATION_MIN = 10;
const FALL_DURATION_MAX = 14;
// 7 fixed X lanes so messages spread evenly
const X_LANES = [8, 22, 36, 50, 64, 78, 92];

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [messages, setMessages] = useState<FallingMessage[]>([]);
  const nextIdRef = useRef(0);
  const msgCursorRef = useRef(0);
  const laneCursorRef = useRef(0);

  const pool = useMemo(() => {
    const base = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const extras = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];
    if (specialDate) extras.push(`${specialDate} 📅`);
    return [...base, ...extras];
  }, [theme, senderName, recipientName, specialDate]);

  const pickLane = useCallback(() => {
    const lane = X_LANES[laneCursorRef.current % X_LANES.length];
    laneCursorRef.current++;
    const jitter = (Math.random() - 0.5) * 4;
    return Math.max(4, Math.min(96, lane + jitter));
  }, []);

  const createMessage = useCallback((delay: number): FallingMessage => {
    const text = pool[msgCursorRef.current % pool.length];
    msgCursorRef.current++;
    return {
      id: nextIdRef.current++,
      text,
      xPercent: pickLane(),
      delay,
      duration: FALL_DURATION_MIN + Math.random() * (FALL_DURATION_MAX - FALL_DURATION_MIN),
      fontSize: 13 + Math.random() * 3,
      opacity: 0.75 + Math.random() * 0.2,
    };
  }, [pickLane, pool]);

  const handleAnimEnd = useCallback((id: number) => {
    // Replace finished message with a new one that starts immediately
    setMessages(prev => prev.map(m => m.id === id ? createMessage(0) : m));
  }, [createMessage]);

  useEffect(() => {
    // Stagger initial batch: each message enters ~1.1s apart
    const initial = Array.from({ length: POOL_SIZE }, (_, i) =>
      createMessage(i * 1.1 + Math.random() * 0.4)
    );
    setMessages(initial);

    const completeTimer = setTimeout(onComplete, 18000);
    return () => clearTimeout(completeTimer);
  }, [createMessage, onComplete]);

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      <style>{`
        @keyframes msg-fall {
          from { transform: translate3d(-50%, -60px, 0); }
          to   { transform: translate3d(-50%, calc(100vh + 80px), 0); }
        }
      `}</style>

      {/* Subtle glow */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.2), transparent 70%)' }}
      />

      {/* Falling messages */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="absolute top-0 whitespace-nowrap font-display font-semibold text-primary"
            style={{
              left: `${msg.xPercent}%`,
              fontSize: `${msg.fontSize}px`,
              opacity: msg.opacity,
              willChange: 'transform',
              animation: `msg-fall ${msg.duration}s linear ${msg.delay}s both`,
            } as CSSProperties}
            onAnimationEnd={() => handleAnimEnd(msg.id)}
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
            animate={{ scale: [0.985, 1.015, 0.985] }}
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
