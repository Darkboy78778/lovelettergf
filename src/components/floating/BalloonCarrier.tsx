import { type CSSProperties } from 'react';
import type { ThemeCarrierProps } from './types';

const BALLOON_COLORS = [
  'hsl(340, 70%, 60%)',   // pink
  'hsl(200, 70%, 55%)',   // blue
  'hsl(45, 85%, 60%)',    // gold
  'hsl(140, 50%, 55%)',   // green
  'hsl(280, 60%, 65%)',   // purple
  'hsl(15, 80%, 60%)',    // orange
  'hsl(350, 65%, 55%)',   // red
];

const BalloonCarrier = ({ messages, onAnimationEnd }: ThemeCarrierProps) => (
  <>
    <style>{`
      @keyframes balloon-rise {
        0% { transform: translate(-50%, 100vh); opacity: 0; }
        5% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translate(-50%, -140px); opacity: 0; }
      }
      @keyframes balloon-sway {
        0%, 100% { margin-left: 0; }
        25% { margin-left: 12px; }
        75% { margin-left: -12px; }
      }
      @keyframes confetti-burst {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(120px) rotate(360deg); opacity: 0; }
      }
    `}</style>

    {/* Confetti background */}
    {Array.from({ length: 20 }, (_, i) => {
      const colors = ['#f472b6', '#facc15', '#60a5fa', '#34d399', '#c084fc'];
      return (
        <div
          key={`confetti-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: `${5 + Math.random() * 90}%`,
            top: `${Math.random() * 60}%`,
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            background: colors[i % colors.length],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-burst ${2 + Math.random() * 3}s ease-out ${Math.random() * 8}s infinite`,
            opacity: 0.7,
          }}
        />
      );
    })}

    {messages.map((msg) => {
      const color = BALLOON_COLORS[msg.variant % BALLOON_COLORS.length];
      const swayDur = 3 + (msg.variant % 3);

      const style: CSSProperties = {
        position: 'absolute',
        left: `${msg.xPercent}%`,
        top: 0,
        willChange: 'transform',
        animation: `balloon-rise ${msg.duration}s ease-in-out ${msg.delay}s both`,
      };

      return (
        <div
          key={msg.id}
          style={style}
          onAnimationEnd={() => onAnimationEnd(msg.id)}
        >
          <div
            style={{
              animation: `balloon-sway ${swayDur}s ease-in-out infinite`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Balloon SVG */}
            <svg width={msg.size} height={msg.size * 1.2} viewBox="0 0 60 72" fill="none">
              <ellipse cx="30" cy="28" rx="26" ry="28" fill={color} />
              <ellipse cx="30" cy="28" rx="26" ry="28" fill="white" opacity="0.15" />
              <ellipse cx="20" cy="18" rx="6" ry="8" fill="white" opacity="0.25" transform="rotate(-20 20 18)" />
              <polygon points="30,56 26,62 34,62" fill={color} />
              <line x1="30" y1="62" x2="30" y2="72" stroke={color} strokeWidth="1.5" opacity="0.6" />
            </svg>

            {/* Message tag */}
            <div
              className="font-display font-semibold text-center"
              style={{
                fontSize: `${Math.max(10, msg.size * 0.22)}px`,
                color: 'hsl(340, 20%, 20%)',
                background: 'rgba(255,255,255,0.85)',
                borderRadius: '8px',
                padding: '3px 8px',
                marginTop: '2px',
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

export default BalloonCarrier;
