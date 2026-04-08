import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const HEART_COLORS = [
  'hsl(340, 70%, 60%)',
  'hsl(350, 65%, 55%)',
  'hsl(330, 55%, 65%)',
  'hsl(0, 60%, 60%)',
  'hsl(345, 50%, 70%)',
  'hsl(355, 75%, 55%)',
];

const HeartCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes heart-float {
        0% { transform: translate(-50%, 100vh) scale(0.3); opacity: 0; }
        8% { opacity: 1; transform: translate(-50%, 85vh) scale(1); }
        85% { opacity: 0.9; }
        100% { transform: translate(-50%, -120px) scale(0.8); opacity: 0; }
      }
      @keyframes heart-drift {
        0%, 100% { margin-left: 0; }
        30% { margin-left: 8px; }
        70% { margin-left: -8px; }
      }
      @keyframes heart-glow-pulse {
        0%, 100% { filter: drop-shadow(0 0 4px rgba(220,50,80,0.3)); }
        50% { filter: drop-shadow(0 0 12px rgba(220,50,80,0.6)); }
      }
      @keyframes soft-particle {
        0% { transform: scale(0); opacity: 0.6; }
        50% { opacity: 0.3; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `}</style>

    {/* Soft glow particles */}
    {Array.from({ length: 15 }, (_, i) => (
      <div
        key={`particle-${i}`}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${10 + Math.random() * 80}%`,
          top: `${10 + Math.random() * 80}%`,
          width: `${8 + Math.random() * 16}px`,
          height: `${8 + Math.random() * 16}px`,
          background: `radial-gradient(circle, hsl(340, 60%, 70%) 0%, transparent 70%)`,
          animation: `soft-particle ${3 + Math.random() * 4}s ease-out ${Math.random() * 6}s infinite`,
        }}
      />
    ))}

    {messages.map((msg) => {
      const color = HEART_COLORS[msg.variant % HEART_COLORS.length];
      const driftDur = 4 + (msg.variant % 3);

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform',
        animation: `heart-float ${msg.duration}s ease-in-out ${msg.delay}s both`,
      };

      return (
        <div
          key={msg.id}
          style={style}
          onAnimationEnd={() => onAnimationEnd(msg.id)}
        >
          <div
            style={{
              animation: `heart-drift ${driftDur}s ease-in-out infinite, heart-glow-pulse ${2 + msg.variant % 2}s ease-in-out infinite`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Heart SVG */}
            <svg width={msg.size} height={msg.size * 0.9} viewBox="0 0 64 58" fill="none">
              <path
                d="M32 56 C32 56 4 36 4 18 C4 8 12 2 22 2 C28 2 32 8 32 8 C32 8 36 2 42 2 C52 2 60 8 60 18 C60 36 32 56 32 56Z"
                fill={color}
              />
              <path
                d="M32 56 C32 56 4 36 4 18 C4 8 12 2 22 2 C28 2 32 8 32 8 C32 8 36 2 42 2 C52 2 60 8 60 18 C60 36 32 56 32 56Z"
                fill="white"
                opacity="0.12"
              />
              <ellipse cx="20" cy="16" rx="6" ry="7" fill="white" opacity="0.25" transform="rotate(-15 20 16)" />
            </svg>

            {/* Message on the heart */}
            <div
              className="font-display font-semibold text-center"
              style={{
                fontSize: `${Math.max(9, msg.size * 0.19)}px`,
                color: 'white',
                textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                marginTop: `-${msg.size * 0.55}px`,
                maxWidth: `${msg.size * 1.1}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {msg.text}
            </div>
          </div>
        </div>
      );
    })}
  </>
);

export default HeartCarrier;
