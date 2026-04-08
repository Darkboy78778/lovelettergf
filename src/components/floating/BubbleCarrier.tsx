import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const BUBBLE_COLORS = [
  'hsla(45, 80%, 65%, 0.35)',
  'hsla(200, 70%, 65%, 0.35)',
  'hsla(140, 55%, 60%, 0.35)',
  'hsla(30, 70%, 60%, 0.35)',
  'hsla(280, 50%, 65%, 0.35)',
  'hsla(170, 60%, 55%, 0.35)',
];

const BubbleCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes bubble-rise {
        0% { transform: translate(-50%, 100vh) scale(0.4); opacity: 0; }
        8% { opacity: 1; transform: translate(-50%, 85vh) scale(1); }
        88% { opacity: 0.85; }
        100% { transform: translate(-50%, -130px) scale(0.9); opacity: 0; }
      }
      @keyframes bubble-wobble {
        0%, 100% { margin-left: 0; transform: scale(1); }
        25% { margin-left: 10px; transform: scale(1.02); }
        75% { margin-left: -10px; transform: scale(0.98); }
      }
    `}</style>

    {messages.map((msg) => {
      const bgColor = BUBBLE_COLORS[msg.variant % BUBBLE_COLORS.length];
      const wobbleDur = 3.5 + (msg.variant % 3);

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform',
        animation: `bubble-rise ${msg.duration}s ease-in-out ${msg.delay}s both`,
      };

      return (
        <div
          key={msg.id}
          style={style}
          onAnimationEnd={() => onAnimationEnd(msg.id)}
        >
          <div
            style={{
              animation: `bubble-wobble ${wobbleDur}s ease-in-out infinite`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Bubble */}
            <div
              style={{
                width: `${msg.size * 1.6}px`,
                height: `${msg.size * 1.6}px`,
                borderRadius: '50%',
                background: `radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.5) 0%, ${bgColor} 50%, transparent 100%)`,
                border: '1.5px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 -4px 12px rgba(255,255,255,0.3)',
                position: 'relative',
              }}
            >
              {/* Shine */}
              <div
                style={{
                  position: 'absolute',
                  top: '15%',
                  left: '20%',
                  width: '30%',
                  height: '20%',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.5)',
                  transform: 'rotate(-30deg)',
                }}
              />

              {/* Message */}
              <div
                className="font-display font-semibold text-center"
                style={{
                  fontSize: `${Math.max(9, msg.size * 0.2)}px`,
                  color: 'hsl(340, 20%, 25%)',
                  maxWidth: `${msg.size * 1.2}px`,
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
        </div>
      );
    })}
  </>
);

export default BubbleCarrier;
