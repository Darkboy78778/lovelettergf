import { motion } from 'framer-motion';

interface GiftBoxProps {
  senderName: string;
  theme: string;
  onOpen: () => void;
}

const GiftBox = ({ senderName, theme, onOpen }: GiftBoxProps) => {
  const themeColors: Record<string, { ribbon: string; box: string; glow: string }> = {
    love: { ribbon: '#e8556d', box: '#f9c4cf', glow: 'rgba(232,85,109,0.4)' },
    birthday: { ribbon: '#f59e42', box: '#ffe4b5', glow: 'rgba(245,158,66,0.4)' },
    friendship: { ribbon: '#6ec6c8', box: '#d4f0f0', glow: 'rgba(110,198,200,0.4)' },
    romantic: { ribbon: '#c46b8a', box: '#f5d0dc', glow: 'rgba(196,107,138,0.4)' },
    surprise: { ribbon: '#a76bf5', box: '#e4d4ff', glow: 'rgba(167,107,245,0.4)' },
  };

  const colors = themeColors[theme] || themeColors.love;

  const themeLabels: Record<string, { emoji: string; title: string; fromEmoji: string }> = {
    love: { emoji: '💌', title: 'A Letter For You', fromEmoji: '❤️' },
    birthday: { emoji: '🎂', title: 'Happy Birthday', fromEmoji: '🎉' },
    friendship: { emoji: '💛', title: 'Happy Friendship Day', fromEmoji: '🤝' },
    romantic: { emoji: '🌹', title: 'A Letter For You', fromEmoji: '❤️' },
    surprise: { emoji: '🎁', title: 'A Surprise For You', fromEmoji: '✨' },
  };

  const themeLabel = themeLabels[theme] || themeLabels.love;

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      onClick={onOpen}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl blur-3xl -z-10"
        style={{ background: colors.glow }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Box container */}
      <div className="relative w-72 h-80 md:w-80 md:h-[22rem]">
        {/* Box body */}
        <motion.div
          className="absolute bottom-0 w-full h-[70%] rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: `linear-gradient(145deg, ${colors.box}, ${colors.box}dd)` }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Box shine */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)`,
            }}
          />

          {/* Vertical ribbon */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-12 h-full"
            style={{ background: `linear-gradient(180deg, ${colors.ribbon}, ${colors.ribbon}cc)` }}
          />
          {/* Horizontal ribbon */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-full h-12"
            style={{ background: `linear-gradient(90deg, ${colors.ribbon}, ${colors.ribbon}cc)` }}
          />

          {/* Text on box */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-4">
            <motion.div
              className="bg-white/60 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg border border-white/40"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <p className="text-2xl mb-1">{themeLabel.emoji}</p>
              <p className="font-display text-lg md:text-xl font-bold text-foreground/90 leading-tight">
                {themeLabel.title}
              </p>
              <p className="font-body text-sm md:text-base mt-1.5" style={{ color: colors.ribbon }}>
                From {senderName} {themeLabel.fromEmoji}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Lid */}
        <motion.div
          className="absolute top-[8%] w-full h-[28%] rounded-xl shadow-xl"
          style={{
            background: `linear-gradient(145deg, ${colors.ribbon}, ${colors.ribbon}dd)`,
          }}
          animate={{ y: [0, -4, 0], rotateX: [0, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {/* Lid shine */}
          <div
            className="absolute inset-0 rounded-xl opacity-20"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.8) 0%, transparent 60%)`,
            }}
          />
          {/* Bow */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-end gap-0">
            <motion.div
              className="w-10 h-10 rounded-full"
              style={{ background: `radial-gradient(circle at 30% 30%, ${colors.ribbon}, ${colors.ribbon}aa)` }}
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="w-10 h-10 rounded-full -ml-3"
              style={{ background: `radial-gradient(circle at 70% 30%, ${colors.ribbon}, ${colors.ribbon}aa)` }}
              animate={{ rotate: [5, -5, 5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

        {/* Tap hint */}
        <motion.div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="font-body text-sm text-muted-foreground flex items-center gap-1.5">
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              👆
            </motion.span>
            Tap to open
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GiftBox;
