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
  duration: number;
}

const FALL_DURATION_SECONDS = 12.4;
const SPAWN_INTERVAL_MS = 600;
const INITIAL_ROWS_PER_COLUMN = 5;
const TOP_START_MIN = 36;
const TOP_START_MAX = 96;
const EXIT_BUFFER_PX = 88;
const VIEWPORT_SIDE_PADDING_PX = 14;
const FALLBACK_TEXT_WIDTH_FACTOR = 0.56;
const FALLBACK_TEXT_BASE_PX = 28;
const COLUMN_ANCHORS = [14, 38, 62, 86] as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getViewportWidth = () => (typeof window === 'undefined' ? 360 : window.innerWidth);

let textMeasureContext: CanvasRenderingContext2D | null = null;

const getTextMeasureContext = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  if (!textMeasureContext) {
    textMeasureContext = document.createElement('canvas').getContext('2d');
  }

  return textMeasureContext;
};

const measureTextWidth = (text: string, fontSize: number) => {
  const viewportWidth = getViewportWidth();

  const context = getTextMeasureContext();

  if (context) {
    context.font = `600 ${fontSize}px ui-serif, Georgia, serif`;

    return Math.min(
      viewportWidth - VIEWPORT_SIDE_PADDING_PX * 2,
      Math.max(96, context.measureText(text).width + 20),
    );
  }

  return Math.min(
    viewportWidth - VIEWPORT_SIDE_PADDING_PX * 2,
    Math.max(96, text.length * fontSize * FALLBACK_TEXT_WIDTH_FACTOR + FALLBACK_TEXT_BASE_PX),
  );
};

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [messages, setMessages] = useState<FallingMessage[]>([]);

  const nextIdRef = useRef(0);
  const messageCursorRef = useRef(0);
  const columnCursorRef = useRef(0);

  const messagesPool = useMemo(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const dynamicMessages = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];

    if (specialDate) {
      dynamicMessages.push(`${specialDate} 📅`);
    }

    return [...themeMessages, ...dynamicMessages];
  }, [theme, senderName, recipientName, specialDate]);

  const getSafeXPosition = useCallback((text: string, fontSize: number, columnIndex: number) => {
    const baseX = COLUMN_ANCHORS[columnIndex] + (Math.random() - 0.5) * 1.8;
    const viewportWidth = getViewportWidth();
    const measuredWidth = measureTextWidth(text, fontSize);
    const safeHalfPercent = ((measuredWidth / 2) + VIEWPORT_SIDE_PADDING_PX) / viewportWidth * 100;

    return clamp(baseX, safeHalfPercent, 100 - safeHalfPercent);
  }, []);

  const createMessage = useCallback((delay: number, forcedColumnIndex?: number) => {
    const text = messagesPool[messageCursorRef.current % messagesPool.length];
    messageCursorRef.current += 1;

    const fontSize = 11.6 + Math.random() * 1.4;
    const columnIndex = forcedColumnIndex ?? (columnCursorRef.current % COLUMN_ANCHORS.length);

    if (forcedColumnIndex === undefined) {
      columnCursorRef.current += 1;
    }

    return {
      id: nextIdRef.current++,
      text,
      xPercent: getSafeXPosition(text, fontSize, columnIndex),
      delay,
      startOffset: TOP_START_MIN + Math.random() * (TOP_START_MAX - TOP_START_MIN),
      fontSize,
      opacity: 0.86 + Math.random() * 0.08,
      duration: FALL_DURATION_SECONDS,
    } satisfies FallingMessage;
  }, [getSafeXPosition, messagesPool]);

  const handleAnimationEnd = useCallback((id: number) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  }, []);

  useEffect(() => {
    nextIdRef.current = 0;
    messageCursorRef.current = 0;
    columnCursorRef.current = 0;

    const columnPhaseSeconds = SPAWN_INTERVAL_MS / 1000;
    const columnGapSeconds = columnPhaseSeconds * COLUMN_ANCHORS.length;

    const seededMessages = COLUMN_ANCHORS.flatMap((_, columnIndex) => (
      Array.from({ length: INITIAL_ROWS_PER_COLUMN }, (_, rowIndex) => {
        const elapsedSeconds = Math.min(
          FALL_DURATION_SECONDS - 0.4,
          rowIndex * columnGapSeconds + columnIndex * columnPhaseSeconds,
        );

        return createMessage(-elapsedSeconds, columnIndex);
      })
    ));

    setMessages(seededMessages);

    const spawnTimer = window.setInterval(() => {
      setMessages((prev) => {
        const nextColumn = columnCursorRef.current % COLUMN_ANCHORS.length;
        columnCursorRef.current += 1;

        return [...prev, createMessage(0, nextColumn)];
      });
    }, SPAWN_INTERVAL_MS);

    const completeTimer = window.setTimeout(onComplete, 18000);

    return () => {
      window.clearInterval(spawnTimer);
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
            lineHeight: 1.1,
            willChange: 'transform',
            animation: `floating-message-fall ${message.duration}s linear ${message.delay}s both`,
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
