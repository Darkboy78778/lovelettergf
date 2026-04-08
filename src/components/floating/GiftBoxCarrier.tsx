import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const BOX_COLORS = [
  { box: 'hsl(340, 65%, 60%)', ribbon: 'hsl(45, 80%, 65%)' },
  { box: 'hsl(200, 60%, 55%)', ribbon: 'hsl(0, 70%, 60%)' },
  { box: 'hsl(280, 55%, 60%)', ribbon: 'hsl(45, 85%, 60%)' },
  { box: 'hsl(140, 50%, 50%)', ribbon: 'hsl(350, 65%, 60%)' },
  { box: 'hsl(30, 70%, 55%)', ribbon: 'hsl(200, 60%, 55%)' },
];

const GiftBoxCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes giftbox-float {
        0% { transform: translate(-50%, 100vh) rotate(-5deg); opacity: 0; }
        6% { opacity: 1; }
        50% { transform: translate(-50%, 45vh) rotate(3deg); }
        88% { opacity: 0.9; }
        100% { transform: translate(-50%, -130px) rotate(-2deg); opacity: 0; }
      }
      @keyframes giftbox-sway {
        0%, 100% { margin-left: 0; }
        30% { margin-left: 6px; }
        70% { margin-left: -6px; }
      }
      @keyframes sparkle-pop {
        0%, 100% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1); opacity: 1; }
      }
    `}</style>

    {/* Sparkles */}
    {Array.from({ length: 12 }, (_, i) => (
      <div
        key={`sparkle-${i}`}
        className="absolute pointer-events-none"
        style={{
          left: `${8 + Math.random() * 84}%`,
          top: `${8 + Math.random() * 84}%`,
          fontSize: `${10 + Math.random() * 10}px`,
          animation: `sparkle-pop ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 5}s infinite`,
        }}
      >
        ✨
      </div>
    ))}

    {messages.map((msg) => {
      const palette = BOX_COLORS[msg.variant % BOX_COLORS.length];
      const swayDur = 3.5 + (msg.variant % 3);

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform',
        animation: `giftbox-float ${msg.duration}s ease-in-out ${msg.delay}s both`,
      };

      return (
        <div
          key={msg.id}
          style={style}
          onAnimationEnd={() => onAnimationEnd(msg.id)}
        >
          <div
            style={{
              animation: `giftbox-sway ${swayDur}s ease-in-out infinite`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Gift box SVG */}
            <svg width={msg.size * 1.1} height={msg.size * 1.1} viewBox="0 0 60 60" fill="none">
              {/* Box body */}
              <rect x="6" y="24" width="48" height="32" rx="3" fill={palette.box} />
              <rect x="6" y="24" width="48" height="32" rx="3" fill="black" opacity="0.06" />
              {/* Box lid */}
              <rect x="3" y="18" width="54" height="10" rx="3" fill={palette.box} />
              <rect x="3" y="18" width="54" height="10" rx="3" fill="white" opacity="0.15" />
              {/* Vertical ribbon */}
              <rect x="26" y="18" width="8" height="38" fill={palette.ribbon} />
              {/* Horizontal ribbon */}
              <rect x="3" y="21" width="54" height="5" fill={palette.ribbon} />
              {/* Bow */}
              <ellipse cx="24" cy="16" rx="8" ry="6" fill={palette.ribbon} />
              <ellipse cx="36" cy="16" rx="8" ry="6" fill={palette.ribbon} />
              <circle cx="30" cy="17" r="3" fill={palette.ribbon} />
              <circle cx="30" cy="17" r="3" fill="white" opacity="0.3" />
            </svg>

            {/* Message tag */}
            <div
              className="font-display font-semibold text-center"
              style={{
                fontSize: `${Math.max(9, msg.size * 0.2)}px`,
                color: 'hsl(340, 20%, 20%)',
                background: 'rgba(255,255,255,0.88)',
                borderRadius: '8px',
                padding: '3px 8px',
                marginTop: '4px',
                maxWidth: `${msg.size * 1.8}px`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                lineHeight: 1.3,
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
