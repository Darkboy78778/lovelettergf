import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

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
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  drift: number;
  expiresAt: number;
}

const COLUMNS = 9;
const SPAWN_INTERVAL_MS = 700;
const MIN_VISIBLE = 8;
const HARD_LIMIT = 16;
const DURATION_MIN = 10;
const DURATION_MAX = 13;
const SEED_COUNT = 5;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [activeMessages, setActiveMessages] = useState<FloatingMsg[]>([]);

  const nextIdRef = useRef(0);
  const msgIndexRef = useRef(0);
  const columnCursorRef = useRef(0);

  const messagesPool = useMemo(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const dynamicMessages = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];

    if (specialDate) dynamicMessages.push(`${specialDate} 📅`);

    return [...themeMessages, ...dynamicMessages];
  }, [theme, senderName, recipientName, specialDate]);

  const createMessage = (seeded = false, now = performance.now(), seedIndex = 0): FloatingMsg => {
    const text = messagesPool[msgIndexRef.current % messagesPool.length];
    msgIndexRef.current += 1;

    const col = columnCursorRef.current % COLUMNS;
    columnCursorRef.current += 1;

    const colWidth = 100 / COLUMNS;
    const baseLeft = col * colWidth + colWidth / 2;
    const jitter = (Math.random() - 0.5) * (colWidth * 0.45);
    const left = clamp(baseLeft + jitter, 4, 96);

    const duration = DURATION_MIN + Math.random() * (DURATION_MAX - DURATION_MIN);
    const delay = seeded ? seedIndex * 0.6 : 0;

    return {
      id: nextIdRef.current++,
      text,
      left,
      duration,
      delay,
      size: 14 + Math.random() * 6,
      opacity: 0.68 + Math.random() * 0.28,
      drift: 0,
      expiresAt: now + (duration + delay) * 1000 + 200,
    };
  };

  useEffect(() => {
    // Seed enough messages so the screen never starts sparse.
    const now = performance.now();
    const seeded: FloatingMsg[] = Array.from({ length: MIN_VISIBLE }, () => createMessage(true, now));
    setActiveMessages(seeded);

    const spawnTimer = window.setInterval(() => {
      const tickNow = performance.now();

      setActiveMessages((prev) => {
        const alive = prev.filter((msg) => msg.expiresAt > tickNow);
        const next = [...alive];

        if (next.length < MIN_VISIBLE) {
          const needed = MIN_VISIBLE - next.length;
          for (let i = 0; i < needed; i += 1) {
            next.push(createMessage(false, tickNow));
          }
        } else {
          next.push(createMessage(false, tickNow));
        }

        if (next.length > HARD_LIMIT) {
          return next.slice(next.length - HARD_LIMIT);
        }

        return next;
      });
    }, SPAWN_INTERVAL_MS);

    const completeTimer = window.setTimeout(onComplete, 18000);

    return () => {
      window.clearInterval(spawnTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete, messagesPool]);

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      <style>
        {`
          @keyframes floating-message-fall {
            0% {
              transform: translate3d(-50%, -12vh, 0);
              opacity: 0;
            }
            10% {
              opacity: var(--msg-opacity, 0.85);
            }
            88% {
              opacity: var(--msg-opacity, 0.85);
            }
            100% {
              transform: translate3d(-50%, 112vh, 0);
              opacity: 0;
            }
          }
        `}
      </style>

      {/* Ambient glow */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.35), transparent 70%)',
        }}
      />

      {/* Floating messages */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeMessages.map((msg) => {
          const messageStyle = {
            left: `${msg.left}%`,
            fontSize: `${msg.size}px`,
            textShadow: '0 0 18px hsl(var(--primary) / 0.38), 0 2px 10px hsl(var(--background) / 0.72)',
            willChange: 'transform, opacity',
            animation: `floating-message-fall ${msg.duration}s linear ${msg.delay}s forwards`,
            ['--msg-drift' as const]: `${msg.drift}px`,
            ['--msg-opacity' as const]: String(msg.opacity),
          } as CSSProperties;

          return (
            <div
              key={msg.id}
              className="absolute top-0 font-display font-semibold text-primary whitespace-nowrap"
              style={messageStyle}
            >
              {msg.text}
            </div>
          );
        })}
      </div>

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
