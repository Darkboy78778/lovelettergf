import { motion } from 'framer-motion';

const ChibiDecorations = () => {
  return (
    <>
      {/* Left chibi character */}
      <motion.div
        className="absolute bottom-[12%] left-[5%] md:left-[15%] text-5xl md:text-6xl pointer-events-none select-none"
        animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        🧸
      </motion.div>

      {/* Right chibi character */}
      <motion.div
        className="absolute bottom-[10%] right-[5%] md:right-[15%] text-5xl md:text-6xl pointer-events-none select-none"
        animate={{ y: [0, -10, 0], rotate: [3, -3, 3] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        🐰
      </motion.div>

      {/* Top left decoration */}
      <motion.div
        className="absolute top-[8%] left-[8%] text-3xl md:text-4xl pointer-events-none select-none"
        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        🌸
      </motion.div>

      {/* Top right decoration */}
      <motion.div
        className="absolute top-[12%] right-[10%] text-3xl md:text-4xl pointer-events-none select-none"
        animate={{ scale: [1, 1.15, 1], rotate: [0, -15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      >
        💝
      </motion.div>

      {/* Floating love stickers */}
      {['💕', '✨', '🦋', '💗', '🌟', '💌'].map((emoji, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none select-none text-2xl md:text-3xl"
          style={{
            left: `${15 + (i * 13) % 70}%`,
            top: `${20 + (i * 17) % 50}%`,
          }}
          animate={{
            y: [0, -15 - i * 3, 0],
            x: [0, (i % 2 === 0 ? 8 : -8), 0],
            opacity: [0.6, 1, 0.6],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.4,
          }}
        >
          {emoji}
        </motion.div>
      ))}
    </>
  );
};

export default ChibiDecorations;
