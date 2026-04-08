import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const BALLOON_COLORS = [
  'hsl(340, 72%, 62%)',
  'hsl(200, 72%, 58%)',
  'hsl(48, 88%, 62%)',
  'hsl(145, 52%, 58%)',
  'hsl(278, 62%, 66%)',
  'hsl(15, 82%, 62%)',
  'hsl(350, 68%, 58%)',
];

const BalloonCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes balloon-rise {
        0% {
          transform: translate(-50%, 110vh) scale(0.6);
          opacity: 0;
        }
        4% {
          opacity: 0.95;
          transform: translate(-50%, 92vh) scale(1.02);
        }
        8% {
          transform: translate(-50%, 86vh) scale(1);
        }
        92% {
          opacity: 0.9;
        }
        100% {
          transform: translate(-50%, -160px) scale(0.95);
          opacity: 0;
        }
      }
      @keyframes balloon-sway {
        0%   { transform: translateX(0) rotate(0deg); }
        20%  { transform: translateX(8px) rotate(1.5deg); }
        40%  { transform: translateX(-4px) rotate(-0.8deg); }
        60%  { transform: translateX(10px) rotate(2deg); }
        80%  { transform: translateX(-6px) rotate(-1.2deg); }
        100% { transform: translateX(0) rotate(0deg); }
      }
      @keyframes confetti-fall {
        0% {
          transform: translateY(-10px) rotate(0deg) scale(1);
          opacity: 0;
        }
        10% { opacity: 0.85; }
        50% { transform: translateY(45vh) rotate(200deg) scale(0.8); opacity: 0.6; }
        100% {
          transform: translateY(100vh) rotate(400deg) scale(0.4);
          opacity: 0;
        }
      }
      @keyframes confetti-sway {
        0%, 100% { margin-left: 0; }
        33% { margin-left: 18px; }
        66% { margin-left: -14px; }
      }
    `}</style>

    {/* Confetti */}
    {Array.from({ length: 24 }, (_, i) => {
      const colors = ['#f472b6', '#fbbf24', '#60a5fa', '#34d399', '#c084fc', '#fb923c'];
      const w = 3 + Math.random() * 5;
      const h = Math.random() > 0.5 ? w : w * 2.5;
      return (
        <div
          key={`confetti-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${3 + Math.random() * 94}%`,
            top: '-10px',
            width: `${w}px`,
            height: `${h}px`,
            background: colors[i % colors.length],
            borderRadius: Math.random() > 0.4 ? '50%' : '1px',
            animation: `confetti-fall ${5 + Math.random() * 6}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${Math.random() * 10}s infinite,
                        confetti-sway ${2.5 + Math.random() * 2}s ease-in-out ${Math.random() * 3}s infinite`,
            opacity: 0,
          }}
        />
      );
    })}

    {messages.map((msg) => {
      const color = BALLOON_COLORS[msg.variant % BALLOON_COLORS.length];
      const swayDur = 5 + (msg.variant % 4);

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform, opacity',
        animation: `balloon-rise ${msg.duration}s cubic-bezier(0.22, 0.61, 0.36, 1) ${msg.delay}s both`,
      };

      return (
        <div key={msg.id} style={style} onAnimationEnd={() => onAnimationEnd(msg.id)}>
          <div style={{ animation: `balloon-sway ${swayDur}s ease-in-out infinite`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Balloon */}
            <svg width={msg.size} height={msg.size * 1.35} viewBox="0 0 60 80" fill="none">
              <defs>
                <radialGradient id={`bg${msg.id}`} cx="0.38" cy="0.32" r="0.65">
                  <stop offset="0%" stopColor="white" stopOpacity="0.35" />
                  <stop offset="50%" stopColor={color} stopOpacity="1" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.85" />
                </radialGradient>
                <filter id={`shadow${msg.id}`}><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={color} floodOpacity="0.25" /></filter>
              </defs>
              <ellipse cx="30" cy="30" rx="25" ry="30" fill={`url(#bg${msg.id})`} filter={`url(#shadow${msg.id})`} />
              <ellipse cx="21" cy="20" rx="5" ry="7" fill="white" opacity="0.3" transform="rotate(-18 21 20)" />
              <polygon points="30,60 27,66 33,66" fill={color} opacity="0.8" />
              {/* String – gentle curve */}
              <path d="M30 66 Q28 72 30 80" stroke={color} strokeWidth="1" fill="none" opacity="0.45" />
            </svg>

            {/* Tag */}
            <div
              className="font-display font-semibold text-center"
              style={{
                fontSize: `${Math.max(10, msg.size * 0.22)}px`,
                color: 'hsl(var(--foreground))',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(6px)',
                borderRadius: '10px',
                padding: '4px 10px',
                marginTop: '2px',
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

export default BalloonCarrier;
