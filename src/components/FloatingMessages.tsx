import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CarrierMessage } from './floating/types';
import BalloonCarrier from './floating/BalloonCarrier';
import HeartCarrier from './floating/HeartCarrier';
import BubbleCarrier from './floating/BubbleCarrier';
import GiftBoxCarrier from './floating/GiftBoxCarrier';

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

const SPAWN_INTERVAL_MS = 1200;
const POOL_SIZE = 14;
const LANE_COUNT = 7;

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [messages, setMessages] = useState<CarrierMessage[]>([]);
  const nextIdRef = useRef(0);
  const msgCursorRef = useRef(0);
  const laneCursorRef = useRef(0);

  const pool = useMemo(() => {
    const base = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const dynamic = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];
    if (specialDate) dynamic.push(`${specialDate} 📅`);
    return [...base, ...dynamic];
  }, [theme, senderName, recipientName, specialDate]);

  const createMsg = useCallback((delay: number, laneOverride?: number): CarrierMessage => {
    const text = pool[msgCursorRef.current % pool.length];
    msgCursorRef.current += 1;

    const lane = laneOverride ?? (laneCursorRef.current % LANE_COUNT);
    if (laneOverride === undefined) laneCursorRef.current += 1;

    const laneWidth = 80 / LANE_COUNT;
    const baseX = 10 + lane * laneWidth + laneWidth / 2;
    const jitter = (Math.random() - 0.5) * (laneWidth * 0.5);
    const xPercent = Math.max(8, Math.min(92, baseX + jitter));

    return {
      id: nextIdRef.current++,
      text,
      xPercent,
      delay,
      duration: 11 + Math.random() * 3,
      size: 42 + Math.random() * 14,
      variant: Math.floor(Math.random() * 7),
    };
  }, [pool]);

  const handleAnimationEnd = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  useEffect(() => {
    nextIdRef.current = 0;
    msgCursorRef.current = 0;
    laneCursorRef.current = 0;

    // Seed initial messages staggered
    const initial: CarrierMessage[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const lane = i % LANE_COUNT;
      const stagger = i * (SPAWN_INTERVAL_MS / 1000) * 0.7;
      // Negative delay to pre-advance some messages
      const negDelay = i < 6 ? -(11 - stagger) * Math.random() * 0.5 : stagger;
      initial.push(createMsg(negDelay < 0 ? negDelay : stagger, lane));
    }
    setMessages(initial);

    const timer = window.setInterval(() => {
      setMessages((prev) => {
        const lane = laneCursorRef.current % LANE_COUNT;
        laneCursorRef.current += 1;
        return [...prev, createMsg(0, lane)];
      });
    }, SPAWN_INTERVAL_MS);

    const completeTimer = window.setTimeout(onComplete, 18000);

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(completeTimer);
    };
  }, [createMsg, onComplete]);

  const CarrierComponent = useMemo(() => {
    switch (theme) {
      case 'birthday': return BalloonCarrier;
      case 'romantic':
      case 'love': return HeartCarrier;
      case 'friendship': return BubbleCarrier;
      case 'surprise': return GiftBoxCarrier;
      default: return HeartCarrier;
    }
  }, [theme]);

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.2), transparent 72%)',
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <CarrierComponent messages={messages} onAnimationEnd={handleAnimationEnd} />
      </div>

      {/* Center message */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 8, delay: 3, times: [0, 0.1, 0.7, 1] }}
      >
        <div className="text-center px-6">
          <motion.p
            className="font-display text-3xl md:text-4xl font-bold text-primary"
            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.1)' }}
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
