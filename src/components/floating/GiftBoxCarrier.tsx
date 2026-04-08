import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const BOX_COLORS = [
  { box: 'hsl(340, 68%, 62%)', ribbon: 'hsl(48, 85%, 68%)' },
  { box: 'hsl(200, 62%, 58%)', ribbon: 'hsl(0, 72%, 62%)' },
  { box: 'hsl(278, 58%, 62%)', ribbon: 'hsl(48, 88%, 62%)' },
  { box: 'hsl(145, 52%, 52%)', ribbon: 'hsl(350, 68%, 62%)' },
  { box: 'hsl(30, 72%, 58%)', ribbon: 'hsl(200, 62%, 58%)' },
];

const GiftBoxCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes giftbox-float {
        0% {
          transform: translate(-50%, 110vh) rotate(-3deg) scale(0.5);
          opacity: 0;
        }
        5% {
          opacity: 1;
          transform: translate(-50%, 90vh) rotate(1deg) scale(1.04);
        }
        10% {
          transform: translate(-50%, 84vh) rotate(0deg) scale(1);
        }
        50% {
          transform: translate(-50%, 45vh) rotate(2deg) scale(1);
        }
        90% {
          opacity: 0.85;
        }
        100% {
          transform: translate(-50%, -150px) rotate(-1deg) scale(0.9);
          opacity: 0;
        }
      }
      @keyframes giftbox-sway {
        0%   { transform: translateX(0) rotate(0deg); }
        25%  { transform: translateX(5px) rotate(1.5deg); }
        50%  { transform: translateX(-3px) rotate(-1deg); }
        75%  { transform: translateX(6px) rotate(1deg); }
        100% { transform: translateX(0) rotate(0deg); }
      }
      @keyframes sparkle-twinkle {
        0%   { transform: scale(0) rotate(0deg); opacity: 0; }
        30%  { transform: scale(1.2) rotate(90deg); opacity: 1; }
        50%  { transform: scale(1) rotate(180deg); opacity: 0.8; }
        70%  { transform: scale(1.1) rotate(270deg); opacity: 0.9; }
        100% { transform: scale(0) rotate(360deg); opacity: 0; }
      }
    `}</style>

    {/* Sparkles */}
    {Array.from({ length: 16 }, (_, i) => (
      <div
        key={`sparkle-${i}`}
        className="absolute pointer-events-none"
        style={{
          left: `${6 + Math.random() * 88}%`,
          top: `${5 + Math.random() * 90}%`,
          fontSize: `${10 + Math.random() * 12}px`,
          animation: `sparkle-twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 6}s infinite`,
          opacity: 0,
        }}
      >
        ✨
      </div>
    ))}

    {messages.map((msg) => {
      const palette = BOX_COLORS[msg.variant % BOX_COLORS.length];
      const swayDur = 5.5 + (msg.variant % 4);
      const boxSize = msg.size * 1.15;

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform, opacity',
        animation: `giftbox-float ${msg.duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${msg.delay}s both`,
      };

      return (
        <div key={msg.id} style={style} onAnimationEnd={() => onAnimationEnd(msg.id)}>
          <div style={{
            animation: `giftbox-sway ${swayDur}s ease-in-out infinite`,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <svg width={boxSize} height={boxSize} viewBox="0 0 60 62" fill="none">
              <defs>
                <linearGradient id={`bx${msg.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={palette.box} stopOpacity="1" />
                  <stop offset="100%" stopColor={palette.box} stopOpacity="0.8" />
                </linearGradient>
                <filter id={`bs${msg.id}`}><feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={palette.box} floodOpacity="0.2" /></filter>
              </defs>
              {/* Body */}
              <rect x="6" y="26" width="48" height="30" rx="4" fill={`url(#bx${msg.id})`} filter={`url(#bs${msg.id})`} />
              <rect x="6" y="44" width="48" height="12" rx="0" fill="black" opacity="0.04" />
              {/* Lid */}
              <rect x="3" y="18" width="54" height="11" rx="4" fill={palette.box} />
              <rect x="3" y="18" width="54" height="5" rx="2" fill="white" opacity="0.12" />
              {/* Ribbons */}
              <rect x="27" y="18" width="6" height="38" fill={palette.ribbon} rx="1" />
              <rect x="3" y="22" width="54" height="4.5" fill={palette.ribbon} rx="1" />
              {/* Bow */}
              <ellipse cx="23" cy="16" rx="8" ry="5.5" fill={palette.ribbon} />
              <ellipse cx="37" cy="16" rx="8" ry="5.5" fill={palette.ribbon} />
              <circle cx="30" cy="17" r="3.5" fill={palette.ribbon} />
              <circle cx="30" cy="17" r="3.5" fill="white" opacity="0.3" />
              <ellipse cx="23" cy="14" rx="3" ry="2" fill="white" opacity="0.2" />
            </svg>

            <div
              className="font-display font-semibold text-center"
              style={{
                fontSize: `${Math.max(9, msg.size * 0.2)}px`,
                color: 'hsl(var(--foreground))',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(6px)',
                borderRadius: '10px',
                padding: '4px 10px',
                marginTop: '4px',
                maxWidth: `${msg.size * 2}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                lineHeight: 1.35,
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

export default GiftBoxCarrier;
