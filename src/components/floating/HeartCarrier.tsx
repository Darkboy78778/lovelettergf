import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const HEART_COLORS = [
  'hsl(340, 72%, 62%)',
  'hsl(350, 68%, 58%)',
  'hsl(330, 58%, 66%)',
  'hsl(0, 62%, 62%)',
  'hsl(345, 55%, 72%)',
  'hsl(355, 78%, 58%)',
];

const HeartCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes heart-float {
        0% {
          transform: translate(-50%, 110vh) scale(0.2);
          opacity: 0;
        }
        5% {
          opacity: 1;
          transform: translate(-50%, 90vh) scale(1.08);
        }
        10% {
          transform: translate(-50%, 84vh) scale(1);
        }
        88% {
          opacity: 0.85;
        }
        100% {
          transform: translate(-50%, -140px) scale(0.75);
          opacity: 0;
        }
      }
      @keyframes heart-drift {
        0%   { transform: translateX(0) rotate(0deg); }
        25%  { transform: translateX(6px) rotate(3deg); }
        50%  { transform: translateX(-3px) rotate(-1.5deg); }
        75%  { transform: translateX(8px) rotate(2deg); }
        100% { transform: translateX(0) rotate(0deg); }
      }
      @keyframes heart-glow {
        0%, 100% {
          filter: drop-shadow(0 0 6px rgba(220,50,80,0.2));
        }
        50% {
          filter: drop-shadow(0 0 18px rgba(220,50,80,0.5)) drop-shadow(0 0 40px rgba(220,50,80,0.15));
        }
      }
      @keyframes particle-bloom {
        0% { transform: scale(0) translate(0, 0); opacity: 0.5; }
        40% { opacity: 0.25; }
        100% { transform: scale(3) translate(var(--px), var(--py)); opacity: 0; }
      }
    `}</style>

    {/* Ambient glow particles */}
    {Array.from({ length: 18 }, (_, i) => (
      <div
        key={`p-${i}`}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${8 + Math.random() * 84}%`,
          top: `${5 + Math.random() * 90}%`,
          width: `${6 + Math.random() * 14}px`,
          height: `${6 + Math.random() * 14}px`,
          background: `radial-gradient(circle, hsla(340, 65%, 72%, 0.5) 0%, transparent 70%)`,
          ['--px' as string]: `${(Math.random() - 0.5) * 30}px`,
          ['--py' as string]: `${(Math.random() - 0.5) * 30}px`,
          animation: `particle-bloom ${4 + Math.random() * 5}s ease-out ${Math.random() * 8}s infinite`,
        }}
      />
    ))}

    {messages.map((msg) => {
      const color = HEART_COLORS[msg.variant % HEART_COLORS.length];
      const driftDur = 6 + (msg.variant % 4);
      const glowDur = 3 + (msg.variant % 3);

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform, opacity',
        animation: `heart-float ${msg.duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${msg.delay}s both`,
      };

      return (
        <div key={msg.id} style={style} onAnimationEnd={() => onAnimationEnd(msg.id)}>
          <div style={{
            animation: `heart-drift ${driftDur}s ease-in-out infinite, heart-glow ${glowDur}s ease-in-out infinite`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            {/* Heart SVG with gradient */}
            <svg width={msg.size} height={msg.size * 0.92} viewBox="0 0 64 60" fill="none">
              <defs>
                <radialGradient id={`hg${msg.id}`} cx="0.4" cy="0.35" r="0.7">
                  <stop offset="0%" stopColor="white" stopOpacity="0.3" />
                  <stop offset="40%" stopColor={color} />
                  <stop offset="100%" stopColor={color} stopOpacity="0.8" />
                </radialGradient>
              </defs>
              <path
                d="M32 56 C32 56 4 36 4 18 C4 8 12 2 22 2 C28 2 32 8 32 8 C32 8 36 2 42 2 C52 2 60 8 60 18 C60 36 32 56 32 56Z"
                fill={`url(#hg${msg.id})`}
              />
              <ellipse cx="20" cy="16" rx="5.5" ry="7" fill="white" opacity="0.28" transform="rotate(-15 20 16)" />
            </svg>

            {/* Message overlaid on heart */}
            <div
              className="font-display font-bold text-center"
              style={{
                fontSize: `${Math.max(9, msg.size * 0.18)}px`,
                color: 'white',
                textShadow: '0 1px 6px rgba(0,0,0,0.25), 0 0 20px rgba(220,50,80,0.3)',
                marginTop: `-${msg.size * 0.52}px`,
                maxWidth: `${msg.size * 1.05}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
                position: 'relative',
                zIndex: 1,
                letterSpacing: '-0.01em',
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
