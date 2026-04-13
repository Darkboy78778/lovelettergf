import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface MediaRevealProps {
  photos: string[];
  videoUrl?: string;
  delay?: number;
  onVideoStart?: () => void;
  onVideoComplete?: () => void;
}

const MediaReveal = ({ photos, videoUrl, delay = 1.8, onVideoStart, onVideoComplete }: MediaRevealProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  // Auto-play video when it appears
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play().catch(() => {});
      }, (delay + 0.5) * 1000);
      return () => clearTimeout(timer);
    }
  }, [videoUrl, delay]);

  // Photo slideshow
  useEffect(() => {
    if (photos.length <= 1 || videoUrl) return;
    const interval = setInterval(() => {
      setCurrentPhoto(prev => (prev + 1) % photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [photos.length, videoUrl]);

  if (!videoUrl && photos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 1, type: 'spring', stiffness: 80, damping: 15 }}
      className="mb-8"
    >
      <div
        className="relative rounded-2xl overflow-hidden mx-auto max-w-sm"
        style={{
          boxShadow: '0 0 30px hsl(var(--primary) / 0.2), 0 0 60px hsl(var(--primary) / 0.1)',
        }}
      >
        {/* Romantic glowing border */}
        <div
          className="absolute -inset-[2px] rounded-2xl z-0"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.6), hsl(var(--accent) / 0.4), hsl(var(--primary) / 0.6))',
          }}
        />

        <div className="relative z-10 rounded-2xl overflow-hidden bg-background m-[2px]">
          {videoUrl ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.8 }}
            >
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                playsInline
                autoPlay
                loop
                className="w-full rounded-2xl"
                style={{ maxHeight: '360px', objectFit: 'cover' }}
                onPlay={() => onVideoStart?.()}
                onTimeUpdate={(e) => {
                  const v = e.currentTarget;
                  if (v.duration && v.currentTime / v.duration >= 0.8) onVideoComplete?.();
                }}
              />
            </motion.div>
          ) : photos.length === 1 ? (
            <motion.img
              src={photos[0]}
              alt="Memory"
              className="w-full rounded-2xl"
              style={{ maxHeight: '360px', objectFit: 'cover' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.3, duration: 0.8 }}
            />
          ) : (
            <div className="relative" style={{ minHeight: '240px' }}>
              {photos.map((photo, i) => (
                <motion.img
                  key={i}
                  src={photo}
                  alt={`Memory ${i + 1}`}
                  className="w-full rounded-2xl absolute inset-0"
                  style={{ maxHeight: '360px', objectFit: 'cover' }}
                  initial={false}
                  animate={{ opacity: currentPhoto === i ? 1 : 0 }}
                  transition={{ duration: 0.8 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating sparkle decoration */}
        <motion.div
          className="absolute -top-2 -right-2 text-2xl z-20"
          animate={{ y: [-3, 3, -3], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.div
          className="absolute -bottom-2 -left-2 text-2xl z-20"
          animate={{ y: [3, -3, 3], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          💕
        </motion.div>
      </div>

      {/* Photo indicator dots */}
      {!videoUrl && photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {photos.map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: currentPhoto === i
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted-foreground) / 0.3)',
              }}
              animate={{ scale: currentPhoto === i ? 1.3 : 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MediaReveal;
