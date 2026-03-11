import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

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
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

const FloatingMessages = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessagesProps) => {
  const [messages, setMessages] = useState<FloatingMsg[]>([]);

  const generateMessages = useCallback(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const allMessages = [
      ...themeMessages,
      `For ${recipientName} 💖`,
      `From ${senderName} ❤️`,
    ];
    if (specialDate) {
      allMessages.push(specialDate);
    }

    const generated: FloatingMsg[] = [];
    const columns = 5;
    const columnWidth = 80 / columns;
    const count = 15;
    for (let i = 0; i < count; i++) {
      const col = i % columns;
      const baseX = 10 + col * columnWidth;
      generated.push({
        id: i,
        text: allMessages[i % allMessages.length],
        x: baseX + (Math.random() - 0.5) * (columnWidth * 0.6),
        delay: (i * 0.6) + Math.random() * 0.4,
        duration: 7 + Math.random() * 3,
        size: 14 + Math.random() * 6,
        opacity: 0.6 + Math.random() * 0.35,
      });
    }
    return generated;
  }, [theme, senderName, recipientName, specialDate]);

  useEffect(() => {
    setMessages(generateMessages());
    const timer = setTimeout(onComplete, 14000);
    return () => clearTimeout(timer);
  }, [generateMessages, onComplete]);

  return (
    <div className="min-h-screen relative overflow-hidden gradient-romantic">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.3), transparent 70%)',
        }}
      />

      {/* Floating messages */}
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          className="absolute font-display font-semibold text-primary whitespace-nowrap pointer-events-none will-change-transform"
          style={{
            left: `${msg.x}%`,
            fontSize: `${msg.size}px`,
            textShadow: '0 0 12px hsl(var(--primary) / 0.25), 0 2px 8px hsl(var(--background) / 0.5)',
          }}
          initial={{ y: '-10%', opacity: 0, scale: 0.8 }}
          animate={{
            y: '110vh',
            opacity: [0, msg.opacity, msg.opacity, 0],
            scale: [0.8, 1, 1, 0.9],
          }}
          transition={{
            duration: msg.duration,
            delay: msg.delay,
            ease: 'linear',
          }}
        >
          {msg.text}
        </motion.div>
      ))}

      {/* Center focus message */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4, delay: 2, times: [0, 0.1, 0.7, 1] }}
      >
        <div className="text-center px-6">
          <motion.p
            className="font-display text-3xl md:text-4xl font-bold text-primary"
            style={{ textShadow: '0 4px 20px hsl(var(--primary) / 0.3)' }}
            animate={{ scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3, repeat: Infinity }}
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
        transition={{ delay: 3, duration: 1 }}
        onClick={onComplete}
      >
        Tap to continue →
      </motion.button>
    </div>
  );
};

export default FloatingMessages;
