import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const BUBBLE_COLORS = [
  { bg: 'hsla(45, 85%, 68%, 0.3)', border: 'hsla(45, 85%, 75%, 0.5)' },
  { bg: 'hsla(200, 75%, 68%, 0.3)', border: 'hsla(200, 75%, 78%, 0.5)' },
  { bg: 'hsla(140, 58%, 62%, 0.3)', border: 'hsla(140, 58%, 72%, 0.5)' },
  { bg: 'hsla(30, 75%, 62%, 0.3)', border: 'hsla(30, 75%, 72%, 0.5)' },
  { bg: 'hsla(280, 55%, 68%, 0.3)', border: 'hsla(280, 55%, 78%, 0.5)' },
  { bg: 'hsla(170, 62%, 58%, 0.3)', border: 'hsla(170, 62%, 68%, 0.5)' },
];

const BubbleCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes bubble-rise {
        0% {
          transform: translate(-50%, 110vh) scale(0.3);
          opacity: 0;
        }
        5% {
          opacity: 1;
          transform: translate(-50%, 92vh) scale(1.05);
        }
        10% {
          transform: translate(-50%, 85vh) scale(1);
        }
        90% {
          opacity: 0.8;
        }
        100% {
          transform: translate(-50%, -140px) scale(0.85);
          opacity: 0;
        }
      }
      @keyframes bubble-wobble {
        0%   { transform: translateX(0) scale(1); }
        20%  { transform: translateX(7px) scale(1.02); }
        40%  { transform: translateX(-5px) scale(0.99); }
        60%  { transform: translateX(9px) scale(1.01); }
        80%  { transform: translateX(-3px) scale(0.985); }
        100% { transform: translateX(0) scale(1); }
      }
      @keyframes bubble-shimmer {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.65; }
      }
    `}</style>

    {messages.map((msg) => {
      const palette = BUBBLE_COLORS[msg.variant % BUBBLE_COLORS.length];
      const wobbleDur = 5.5 + (msg.variant % 4);
      const bubbleSize = msg.size * 1.7;

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform, opacity',
        animation: `bubble-rise ${msg.duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${msg.delay}s both`,
      };

      return (
        <div key={msg.id} style={style} onAnimationEnd={() => onAnimationEnd(msg.id)}>
          <div style={{
            animation: `bubble-wobble ${wobbleDur}s ease-in-out infinite`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div
              style={{
                width: `${bubbleSize}px`,
                height: `${bubbleSize}px`,
                borderRadius: '50%',
                background: `radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.55) 0%, ${palette.bg} 45%, transparent 100%)`,
                border: `1.5px solid ${palette.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 6px 24px rgba(0,0,0,0.05), inset 0 -6px 16px rgba(255,255,255,0.25), inset 0 2px 8px rgba(255,255,255,0.3)`,
                position: 'relative',
                backdropFilter: 'blur(2px)',
              }}
            >
              {/* Primary shine */}
              <div style={{
                position: 'absolute', top: '12%', left: '18%',
                width: '32%', height: '22%', borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
                transform: 'rotate(-28deg)',
                animation: `bubble-shimmer ${3 + msg.variant % 2}s ease-in-out infinite`,
              }} />
              {/* Secondary shine */}
              <div style={{
                position: 'absolute', bottom: '20%', right: '15%',
                width: '12%', height: '8%', borderRadius: '50%',
                background: 'rgba(255,255,255,0.3)',
              }} />

              <div
                className="font-display font-semibold text-center"
                style={{
                  fontSize: `${Math.max(9, msg.size * 0.2)}px`,
                  color: 'hsl(var(--foreground))',
                  maxWidth: `${msg.size * 1.25}px`,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.3,
                  position: 'relative',
                  zIndex: 1,
                  textShadow: '0 0 12px rgba(255,255,255,0.5)',
                  letterSpacing: '-0.01em',
                }}
              >
                {msg.text}
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </>
);

export default BubbleCarrier;
