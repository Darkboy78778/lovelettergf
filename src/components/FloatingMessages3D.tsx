import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';

/* ── Theme messages ─────────────────────────────────────── */
const THEME_MESSAGES: Record<string, string[]> = {
  love: [
    'I Love You 😘', 'You Mean Everything ❤️', 'Forever Yours 💕',
    'My Heart Is Yours 💗', 'You Are My World 🌍', 'Love You Always 💖',
    'My Soulmate ✨', 'Endlessly In Love 🥰', 'You Complete Me 💞',
    'Always & Forever 🌹', 'Crazy About You 😍', 'My One & Only 💝',
  ],
  birthday: [
    'Happy Birthday 🎉', 'Make A Wish 🎂', 'Your Special Day 🥳',
    'Celebrate You 🎈', 'Born To Shine ⭐', 'Party Time 🎊',
    'Another Amazing Year 💫', 'Birthday Magic ✨', 'Cheers To You 🥂',
    'You Are A Gift 🎁', 'Blow The Candles 🕯️', 'Hip Hip Hooray 🎶',
  ],
  friendship: [
    'Happy Friendship Day 💛', 'Best Friends Forever 🤝', 'True Friendship 💫',
    'You Are Amazing 🌟', 'Grateful For You 🙏', 'Friends Like Family 💕',
    'Together Always 🌈', 'Cherished Friend ✨', 'You Rock 🤘',
    'My Bestie 💜', 'Soul Sister 👯', 'Ride Or Die 🚀',
  ],
  romantic: [
    'You Are Beautiful 🌹', 'My Everything 💋', 'Together Forever 💍',
    'Lost In You 😍', 'My Dream Come True 🦋', 'Eternally Yours 💝',
    'You Complete Me 🌸', 'My Love Story 📖', 'Stolen My Heart 💘',
    'My Paradise 🏝️', 'Butterflies 🦋', 'Kiss Me 💋',
  ],
  surprise: [
    'Surprise! 🎉', 'Just For You ✨', 'You Deserve This 🎁',
    'Magic Moment 🪄', 'Special Delivery 💌', 'Unwrap The Joy 🎊',
    'A Gift Of Love 💝', 'Made With Love 💕', 'Ta-Da! 🎭',
    'Open Me 📦', 'Something Special 🌟', 'Just Because 💫',
  ],
};

/* ── Constants ──────────────────────────────────────────── */
const MSG_COUNT = 28;
const X_SPREAD = 7;
const Z_NEAR = 0;
const Z_FAR = -12;
const FALL_SPEED_MIN = 0.6;
const FALL_SPEED_MAX = 1.1;
const Y_SPAWN_TOP = 9;
const Y_DESPAWN_BOTTOM = -9;

/* ── Types ──────────────────────────────────────────────── */
interface MsgInstance {
  text: string;
  position: THREE.Vector3;
  speed: number;
  zDepth: number;
  fontSize: number;
  opacity: number;
  driftX: number;
  glowIntensity: number;
}

/* ── Helper: create one message ─────────────────────────── */
let msgCursor = 0;

function spawnMessage(pool: string[], yOverride?: number): MsgInstance {
  const text = pool[msgCursor % pool.length];
  msgCursor++;

  const z = Z_NEAR + Math.random() * (Z_FAR - Z_NEAR);
  const depthRatio = (z - Z_NEAR) / (Z_FAR - Z_NEAR); // 0 = near, 1 = far

  const x = (Math.random() - 0.5) * X_SPREAD * 2;
  const y = yOverride ?? Y_SPAWN_TOP + Math.random() * 4;

  const speed = FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN);
  const fontSize = THREE.MathUtils.lerp(0.32, 0.16, depthRatio);
  const opacity = THREE.MathUtils.lerp(0.95, 0.35, depthRatio);
  const driftX = (Math.random() - 0.5) * 0.08;
  const glowIntensity = THREE.MathUtils.lerp(1.0, 0.3, depthRatio);

  return {
    text,
    position: new THREE.Vector3(x, y, z),
    speed,
    zDepth: z,
    fontSize,
    opacity,
    driftX,
    glowIntensity,
  };
}

/* ── Single falling message ─────────────────────────────── */
function FallingMessage({ msg, pool, onRespawn }: {
  msg: MsgInstance;
  pool: string[];
  onRespawn: (newMsg: MsgInstance) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const dataRef = useRef(msg);
  dataRef.current = msg;

  useFrame((_, delta) => {
    if (!ref.current) return;
    const d = dataRef.current;
    d.position.y -= d.speed * delta;
    d.position.x += d.driftX * delta;
    ref.current.position.copy(d.position);

    if (d.position.y < Y_DESPAWN_BOTTOM) {
      const newMsg = spawnMessage(pool);
      dataRef.current = newMsg;
      onRespawn(newMsg);
    }
  });

  const color = new THREE.Color().setHSL(
    0.94 + msg.glowIntensity * 0.04,
    0.3 + msg.glowIntensity * 0.4,
    0.75 + msg.glowIntensity * 0.2,
  );

  return (
    <group ref={ref} position={[msg.position.x, msg.position.y, msg.position.z]}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={msg.fontSize}
          color={color}
          anchorX="center"
          anchorY="middle"
          maxWidth={4}
          fillOpacity={msg.opacity}
          font="/fonts/Inter-SemiBold.woff"
          outlineWidth={msg.glowIntensity * 0.02}
          outlineColor={new THREE.Color(1, 0.7, 0.85)}
          outlineOpacity={msg.opacity * 0.5}
        >
          {msg.text}
        </Text>
      </Billboard>
    </group>
  );
}

/* ── Heart particle ─────────────────────────────────────── */
function HeartParticle({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const data = useRef({
    x: (Math.random() - 0.5) * X_SPREAD * 2.5,
    y: Math.random() * 18 - 9,
    z: Z_NEAR + Math.random() * (Z_FAR - Z_NEAR) * 0.7,
    speed: 0.3 + Math.random() * 0.5,
    wobble: Math.random() * Math.PI * 2,
    scale: 0.06 + Math.random() * 0.08,
  });

  useFrame((state, delta) => {
    if (!ref.current) return;
    const d = data.current;
    d.y -= d.speed * delta;
    d.wobble += delta * 1.5;
    if (d.y < Y_DESPAWN_BOTTOM) {
      d.y = Y_SPAWN_TOP + Math.random() * 3;
      d.x = (Math.random() - 0.5) * X_SPREAD * 2.5;
    }
    ref.current.position.set(
      d.x + Math.sin(d.wobble) * 0.15,
      d.y,
      d.z,
    );
  });

  return (
    <mesh ref={ref} scale={data.current.scale}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={new THREE.Color(1, 0.4, 0.6)} transparent opacity={0.5} />
    </mesh>
  );
}

/* ── Scene (inside Canvas) ──────────────────────────────── */
function Scene({ pool }: { pool: string[] }) {
  const [msgs, setMsgs] = useState<MsgInstance[]>([]);

  useEffect(() => {
    msgCursor = 0;
    const initial: MsgInstance[] = [];
    for (let i = 0; i < MSG_COUNT; i++) {
      const ySpread = Y_SPAWN_TOP - (i / MSG_COUNT) * (Y_SPAWN_TOP - Y_DESPAWN_BOTTOM);
      initial.push(spawnMessage(pool, ySpread));
    }
    setMsgs(initial);
  }, [pool]);

  const handleRespawn = useCallback((index: number) => (newMsg: MsgInstance) => {
    setMsgs(prev => {
      const next = [...prev];
      next[index] = newMsg;
      return next;
    });
  }, []);

  return (
    <>
      {/* Ambient soft light */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 5]} intensity={0.6} color="#ff88aa" />

      {/* Falling messages */}
      {msgs.map((msg, i) => (
        <FallingMessage
          key={i}
          msg={msg}
          pool={pool}
          onRespawn={handleRespawn(i)}
        />
      ))}

      {/* Heart particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <HeartParticle key={`heart-${i}`} index={i} />
      ))}

      {/* Background fog plane for depth */}
      <mesh position={[0, 0, Z_FAR - 2]} scale={[40, 40, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#1a0a14" transparent opacity={0.3} />
      </mesh>
    </>
  );
}

/* ── Main component ─────────────────────────────────────── */
interface FloatingMessages3DProps {
  theme: string;
  senderName: string;
  recipientName: string;
  specialDate?: string;
  onComplete: () => void;
}

const FloatingMessages3D = ({ theme, senderName, recipientName, specialDate, onComplete }: FloatingMessages3DProps) => {
  const pool = useMemo(() => {
    const themeMessages = THEME_MESSAGES[theme] || THEME_MESSAGES.love;
    const dynamic = [`For ${recipientName} 💖`, `From ${senderName} ❤️`];
    if (specialDate) dynamic.push(`${specialDate} 📅`);
    return [...themeMessages, ...dynamic];
  }, [theme, senderName, recipientName, specialDate]);

  useEffect(() => {
    const timer = setTimeout(onComplete, 18000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const centerMsg = useMemo(() => {
    if (theme === 'birthday') return `Happy Birthday ${recipientName}! 🎉`;
    if (theme === 'friendship') return `For My Dearest Friend 💛`;
    if (theme === 'romantic') return `I Love You ${recipientName} 💕`;
    if (theme === 'love') return `With All My Heart ❤️`;
    return `A Special Surprise! ✨`;
  }, [theme, recipientName]);

  const [showCenter, setShowCenter] = useState(false);
  const [hideCenter, setHideCenter] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowCenter(true), 3000);
    const t2 = setTimeout(() => setHideCenter(true), 12000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #1a0a14 0%, #2d1025 30%, #1a0a14 100%)' }}>
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 60, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <fog attach="fog" args={['#1a0a14', 8, 18]} />
          <Scene pool={pool} />
        </Canvas>
      </div>

      {/* Radial glow overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255,100,150,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Center message overlay */}
      {showCenter && !hideCenter && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{
            animation: 'center-msg-fade 9s ease-in-out forwards',
          }}
        >
          <p
            className="font-display text-2xl md:text-4xl font-bold text-center px-6"
            style={{
              color: '#ffb3cc',
              textShadow: '0 0 20px rgba(255,150,180,0.6), 0 0 40px rgba(255,100,150,0.3)',
            }}
          >
            {centerMsg}
          </p>
        </div>
      )}

      {/* Continue button */}
      <button
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 font-body text-sm"
        style={{
          color: 'rgba(255,180,200,0.7)',
          animation: 'fade-in 1s ease-out 5s both',
        }}
        onClick={onComplete}
      >
        Tap to continue →
      </button>

      <style>{`
        @keyframes center-msg-fade {
          0% { opacity: 0; transform: scale(0.95); }
          10% { opacity: 1; transform: scale(1); }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default FloatingMessages3D;
