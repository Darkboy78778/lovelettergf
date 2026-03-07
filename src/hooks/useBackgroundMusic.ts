import { useCallback, useEffect, useRef, useState } from 'react';

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

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      // Fade out
      const audio = audioRef.current;
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          clearInterval(fadeOut);
          audio.pause();
          audio.volume = 0.4;
        }
      }, 80);
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    cleanup();

    const audio = new Audio(THEME_MUSIC[theme]);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    // Fade in
    audio.play().then(() => {
      const fadeIn = setInterval(() => {
        if (audio.volume < 0.35) {
          audio.volume = Math.min(0.4, audio.volume + 0.03);
        } else {
          clearInterval(fadeIn);
        }
      }, 100);
      setIsPlaying(true);
    }).catch(() => {
      // Autoplay blocked by browser - will need user interaction
      setIsPlaying(false);
    });
  }, [theme, cleanup]);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { isPlaying, toggle, play, stop };
}
