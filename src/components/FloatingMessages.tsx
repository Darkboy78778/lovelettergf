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
  delay: number;
  startOffset: number;
  fontSize: number;
  opacity: number;
}

const ACTIVE_POOL_SIZE = 18;
const FALL_DURATION_SECONDS = 13.5;
const ENTRY_STAGGER_SECONDS = 0.42;
const TOP_START_MIN = 90;
const TOP_START_MAX = 150;
const EXIT_BUFFER_PX = 88;
const VIEWPORT_SIDE_PADDING_PX = 14;
const ESTIMATED_TEXT_WIDTH_FACTOR = 0.72;
const ESTIMATED_TEXT_BASE_PX = 42;
const ZONE_LANES = [
  [12, 20, 28],
  [40, 50, 60],
  [72, 80, 88],
] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getViewportWidth = () => (typeof window === 'undefined' ? 360 : window.innerWidth);

const estimateTextWidth = (text: string, fontSize: number) => {
  const viewportWidth = getViewportWidth();
  return Math.min(
    viewportWidth - VIEWPORT_SIDE_PADDING_PX * 2,
    Math.max(92, text.length * fontSize * ESTIMATED_TEXT_WIDTH_FACTOR + ESTIMATED_TEXT_BASE_PX),
  );
};

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [messages, setMessages] = useState<FallingMessage[]>([]);

  const nextIdRef = useRef(0);
  const messageCursorRef = useRef(0);
  const zoneCursorRef = useRef(0);
  const laneCursorRef = useRef([0, 0, 0]);

  const messagesPool = useMemo(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const dynamicMessages = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];

    if (specialDate) {
      dynamicMessages.push(`${specialDate} 📅`);
    }

    return [...themeMessages, ...dynamicMessages];
  }, [theme, senderName, recipientName, specialDate]);

  const getBalancedXPosition = useCallback((text: string, fontSize: number) => {
    const zoneIndex = zoneCursorRef.current % ZONE_LANES.length;
    zoneCursorRef.current += 1;

    const laneIndex = laneCursorRef.current[zoneIndex] % ZONE_LANES[zoneIndex].length;
    laneCursorRef.current[zoneIndex] += 1;

    const baseX = ZONE_LANES[zoneIndex][laneIndex] + (Math.random() - 0.5) * 2.5;
    const viewportWidth = getViewportWidth();
    const estimatedWidth = estimateTextWidth(text, fontSize);
    const safeHalfPercent = ((estimatedWidth / 2) + VIEWPORT_SIDE_PADDING_PX) / viewportWidth * 100;

    return clamp(baseX, safeHalfPercent, 100 - safeHalfPercent);
  }, []);

  const createMessage = useCallback((delay: number) => {
    const text = messagesPool[messageCursorRef.current % messagesPool.length];
    messageCursorRef.current += 1;

    const fontSize = 12.5 + Math.random() * 2.3;

    return {
      id: nextIdRef.current++,
      text,
      xPercent: getBalancedXPosition(text, fontSize),
      delay,
      startOffset: TOP_START_MIN + Math.random() * (TOP_START_MAX - TOP_START_MIN),
      fontSize,
      opacity: 0.8 + Math.random() * 0.12,
    } satisfies FallingMessage;
  }, [getBalancedXPosition, messagesPool]);

  const handleAnimationEnd = useCallback((id: number) => {
    setMessages((prev) => prev.map((message) => (
      message.id === id ? createMessage(0) : message
    )));
  }, [createMessage]);

  useEffect(() => {
    nextIdRef.current = 0;
    messageCursorRef.current = 0;
    zoneCursorRef.current = 0;
    laneCursorRef.current = [0, 0, 0];

    const seededMessages = Array.from({ length: ACTIVE_POOL_SIZE }, (_, index) => (
      createMessage(index * ENTRY_STAGGER_SECONDS + Math.random() * 0.12)
    ));

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
              transform: translate3d(-50%, calc(var(--msg-start-offset) * -1px), 0);
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
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.2), transparent 72%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {messages.map((message) => {
          const messageStyle = {
            left: `${message.xPercent}%`,
            top: 0,
            fontSize: `${message.fontSize}px`,
            opacity: message.opacity,
            whiteSpace: 'nowrap',
            willChange: 'transform',
            animation: `floating-message-fall ${FALL_DURATION_SECONDS}s linear ${message.delay}s both`,
            ['--msg-start-offset' as const]: String(message.startOffset),
            ['--msg-exit-buffer' as const]: `${EXIT_BUFFER_PX}px`,
          } as CSSProperties;

          return (
            <div
              key={message.id}
              className="absolute font-display font-semibold text-primary"
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
