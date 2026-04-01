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
  startY: number;
  fontSize: number;
  opacity: number;
}

const ACTIVE_POOL_SIZE = 12;
const FALL_DURATION_SECONDS = 12.8;
const EXIT_BUFFER_PX = 180;
const SEED_BAND_OFFSETS = [90, 250];
const RESPAWN_START_MIN = 60;
const RESPAWN_START_MAX = 140;
const ZONE_LANES = [
  [10, 25],
  [42, 58],
  [75, 90],
] as const;
const TOTAL_LANES = ZONE_LANES.reduce((count, zone) => count + zone.length, 0);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [messages, setMessages] = useState<FallingMessage[]>([]);

  const nextIdRef = useRef(0);
  const messageCursorRef = useRef(0);
  const zoneCursorRef = useRef(0);
  const laneCursorRef = useRef([0, 0, 0]);
  const seedCursorRef = useRef(0);

  const messagesPool = useMemo(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const dynamicMessages = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];

    if (specialDate) dynamicMessages.push(`${specialDate} 📅`);

    return [...themeMessages, ...dynamicMessages];
  }, [theme, senderName, recipientName, specialDate]);

  const getLanePosition = useCallback(() => {
    const zoneIndex = zoneCursorRef.current % ZONE_LANES.length;
    zoneCursorRef.current += 1;

    const laneIndex = laneCursorRef.current[zoneIndex] % ZONE_LANES[zoneIndex].length;
    laneCursorRef.current[zoneIndex] += 1;

    const baseX = ZONE_LANES[zoneIndex][laneIndex];
    const jitter = (Math.random() - 0.5) * 3;

    return clamp(baseX + jitter, 6, 94);
  }, []);

  const createMessage = useCallback((mode: 'seed' | 'respawn' = 'respawn'): FallingMessage => {
    const text = messagesPool[messageCursorRef.current % messagesPool.length];
    messageCursorRef.current += 1;

    const xPercent = getLanePosition();

    let startY = -(RESPAWN_START_MIN + Math.random() * (RESPAWN_START_MAX - RESPAWN_START_MIN));

    if (mode === 'seed') {
      const bandIndex = Math.floor(seedCursorRef.current / TOTAL_LANES) % SEED_BAND_OFFSETS.length;
      seedCursorRef.current += 1;
      startY = -(SEED_BAND_OFFSETS[bandIndex] + Math.random() * 60);
    }

    return {
      id: nextIdRef.current++,
      text,
      xPercent,
      startY,
      fontSize: 13 + Math.random() * 3,
      opacity: 0.78 + Math.random() * 0.14,
    };
  }, [getLanePosition, messagesPool]);

  const handleAnimationEnd = useCallback((id: number) => {
    setMessages((prev) => prev.map((message) => (
      message.id === id ? createMessage('respawn') : message
    )));
  }, [createMessage]);

  useEffect(() => {
    nextIdRef.current = 0;
    messageCursorRef.current = 0;
    zoneCursorRef.current = 0;
    laneCursorRef.current = [0, 0, 0];
    seedCursorRef.current = 0;

    const seededMessages = Array.from({ length: ACTIVE_POOL_SIZE }, () => createMessage('seed'));
    setMessages(seededMessages);

    const completeTimer = window.setTimeout(onComplete, 18000);

    return () => {
      window.clearTimeout(completeTimer);
    };
  }, [createMessage, onComplete]);

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      <style>
        {`
          @keyframes floating-message-fall {
            from {
              transform: translate3d(-50%, var(--msg-start-y), 0);
            }
            to {
              transform: translate3d(-50%, calc(100vh + var(--msg-exit-buffer)), 0);
            }
          }
        `}
      </style>

      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.22), transparent 72%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {messages.map((message) => {
          const messageStyle = {
            left: `${message.xPercent}%`,
            top: 0,
            fontSize: `${message.fontSize}px`,
            opacity: message.opacity,
            willChange: 'transform',
            animation: `floating-message-fall ${FALL_DURATION_SECONDS}s linear forwards`,
            ['--msg-start-y' as const]: `${message.startY}px`,
            ['--msg-exit-buffer' as const]: `${EXIT_BUFFER_PX}px`,
          } as CSSProperties;

          return (
            <div
              key={message.id}
              className="absolute whitespace-nowrap font-display font-semibold text-primary"
              style={messageStyle}
              onAnimationEnd={() => handleAnimationEnd(message.id)}
            >
              {message.text}
            </div>
          );
        })}
      </div>

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
