import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';

interface RomanticQRCodeProps {
  value: string;
  size?: number;
}

const RomanticQRCode = ({ value, size = 200 }: RomanticQRCodeProps) => {
  return (
    <div className="relative inline-block">
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-6 rounded-3xl opacity-40 blur-2xl"
        style={{
          background: 'radial-gradient(circle, hsl(340 70% 60% / 0.5), hsl(350 60% 70% / 0.2), transparent)',
        }}
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Heart-shaped clip container */}
      <div className="relative">
        {/* Decorative flowers around the QR */}
        <motion.span
          className="absolute -top-4 -left-4 text-2xl z-10"
          animate={{ rotate: [-10, 10, -10], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🌸
        </motion.span>
        <motion.span
          className="absolute -top-3 -right-4 text-2xl z-10"
          animate={{ rotate: [10, -10, 10], scale: [1, 1.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          🌺
        </motion.span>
        <motion.span
          className="absolute -bottom-4 -left-3 text-xl z-10"
          animate={{ rotate: [-5, 15, -5], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🌷
        </motion.span>
        <motion.span
          className="absolute -bottom-3 -right-4 text-xl z-10"
          animate={{ rotate: [5, -15, 5], scale: [1, 1.12, 1] }}
          transition={{ duration: 3.2, repeat: Infinity }}
        >
          🌹
        </motion.span>
        <motion.span
          className="absolute top-1/2 -left-6 text-lg z-10 -translate-y-1/2"
          animate={{ x: [-2, 2, -2], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          💕
        </motion.span>
        <motion.span
          className="absolute top-1/2 -right-6 text-lg z-10 -translate-y-1/2"
          animate={{ x: [2, -2, 2], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        >
          💗
        </motion.span>

        {/* Heart-shaped border */}
        <div
          className="relative p-1 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, hsl(340 70% 55%), hsl(350 60% 65%), hsl(0 70% 60%))',
          }}
        >
          <div
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, hsl(350 80% 96%), hsl(340 60% 94%), hsl(20 50% 97%))',
            }}
          >
            {/* Inner glow overlay */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 30% 30%, hsl(340 70% 80% / 0.5), transparent 60%)',
              }}
            />

            {/* Heart watermark behind QR */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none text-8xl">
              ❤️
            </div>

            <QRCodeSVG
              id="qr-code"
              value={value}
              size={size}
              fgColor="hsl(340, 70%, 40%)"
              bgColor="transparent"
              level="H"
              includeMargin={false}
              imageSettings={{
                src: 'data:image/svg+xml,' + encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(340,70%,50%)"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
                ),
                height: 28,
                width: 28,
                excavate: true,
              }}
            />
          </div>
        </div>

        {/* Bottom heart decoration */}
        <motion.div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl z-10"
          animate={{ scale: [1, 1.2, 1], y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ❤️
        </motion.div>
      </div>
    </div>
  );
};

export default RomanticQRCode;
