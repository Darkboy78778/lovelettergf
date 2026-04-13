import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

type ThemeType = 'love' | 'birthday' | 'friendship' | 'romantic' | 'surprise';

const THEME_MUSIC: Record<ThemeType, string> = {
  love: '/audio/love.mp3',
  romantic: '/audio/romantic.mp3',
  birthday: '/audio/birthday.mp3',
  friendship: '/audio/friendship.mp3',
  surprise: '/audio/surprise.mp3',
};

export function useBackgroundMusic(theme: ThemeType = 'love') {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadedRef = useRef(false);

  // Preload audio on mount so it's ready instantly
  useEffect(() => {
    const audio = new Audio();
    audio.src = THEME_MUSIC[theme];
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    audioRef.current = audio;
    preloadedRef.current = true;

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [theme]);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.volume = 0;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      // Quick fade out
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          clearInterval(fadeOut);
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0;
        }
      }, 50);
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset and play immediately — audio is already preloaded
    audio.volume = 0;
    audio.play().then(() => {
      // Fade in
      const fadeIn = setInterval(() => {
        if (audio.volume < 0.35) {
          audio.volume = Math.min(0.4, audio.volume + 0.03);
        } else {
          clearInterval(fadeIn);
        }
      }, 60);
      setIsPlaying(true);
    }).catch(() => {
      setIsPlaying(false);
    });
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  return { isPlaying, toggle, play, stop };
}
