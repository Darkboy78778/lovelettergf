import { useCallback, useEffect, useRef, useState } from 'react';

type ThemeType = 'love' | 'birthday' | 'friendship' | 'romantic' | 'surprise';

interface ThemeConfig {
  notes: number[];
  tempo: number;
  waveform: OscillatorType;
  filterFreq: number;
  reverbDecay: number;
  padNotes: number[];
}

// Musical note frequencies (Hz)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
};

const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  love: {
    notes: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.E4, NOTE.A4, NOTE.G4, NOTE.F4, NOTE.E4],
    tempo: 2.8,
    waveform: 'sine',
    filterFreq: 800,
    reverbDecay: 3,
    padNotes: [NOTE.C3, NOTE.E3, NOTE.G3],
  },
  romantic: {
    notes: [NOTE.D4, NOTE.F4, NOTE.A4, NOTE.G4, NOTE.F4, NOTE.E4, NOTE.D4, NOTE.C4],
    tempo: 3.2,
    waveform: 'sine',
    filterFreq: 700,
    reverbDecay: 4,
    padNotes: [NOTE.D3, NOTE.F3, NOTE.A3],
  },
  birthday: {
    notes: [NOTE.C4, NOTE.D4, NOTE.E4, NOTE.G4, NOTE.E4, NOTE.C5, NOTE.G4, NOTE.E4],
    tempo: 2.0,
    waveform: 'triangle',
    filterFreq: 1200,
    reverbDecay: 2,
    padNotes: [NOTE.C3, NOTE.G3, NOTE.E3],
  },
  friendship: {
    notes: [NOTE.G4, NOTE.A4, NOTE.B4, NOTE.D5, NOTE.B4, NOTE.A4, NOTE.G4, NOTE.E4],
    tempo: 2.2,
    waveform: 'sine',
    filterFreq: 1000,
    reverbDecay: 2.5,
    padNotes: [NOTE.G3, NOTE.B3, NOTE.D3],
  },
  surprise: {
    notes: [NOTE.E4, NOTE.G4, NOTE.B4, NOTE.C5, NOTE.E5, NOTE.D5, NOTE.B4, NOTE.G4],
    tempo: 1.8,
    waveform: 'triangle',
    filterFreq: 1400,
    reverbDecay: 2,
    padNotes: [NOTE.E3, NOTE.G3, NOTE.B3],
  },
};

function createReverb(ctx: AudioContext, decay: number): ConvolverNode {
  const length = ctx.sampleRate * decay;
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay * 0.7);
    }
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

export function useBackgroundMusic(theme: ThemeType = 'love') {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const padOscsRef = useRef<OscillatorNode[]>([]);
  const nodesRef = useRef<AudioNode[]>([]);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    padOscsRef.current.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    padOscsRef.current = [];
    nodesRef.current = [];
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
    }
    ctxRef.current = null;
    masterGainRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (masterGainRef.current && ctxRef.current) {
      const now = ctxRef.current.currentTime;
      masterGainRef.current.gain.linearRampToValueAtTime(0, now + 1.5);
      setTimeout(cleanup, 1600);
    } else {
      cleanup();
    }
    setIsPlaying(false);
  }, [cleanup]);

  const play = useCallback(() => {
    cleanup();

    const config = THEME_CONFIGS[theme];
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    // Master gain with fade-in
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 2);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    // Reverb
    const reverb = createReverb(ctx, config.reverbDecay);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.4;
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);
    nodesRef.current.push(reverb, reverbGain);

    // Main filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = config.filterFreq;
    filter.Q.value = 0.5;
    filter.connect(masterGain);
    filter.connect(reverb);
    nodesRef.current.push(filter);

    // Ambient pad (warm background chord)
    const padGain = ctx.createGain();
    padGain.gain.value = 0.06;
    padGain.connect(filter);
    nodesRef.current.push(padGain);

    config.padNotes.forEach(freq => {
      // Two detuned oscillators per note for warmth
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(padGain);
        osc.start();
        padOscsRef.current.push(osc);

        // Slow vibrato via LFO
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 0.15 + Math.random() * 0.1;
        lfoGain.gain.value = 3;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        padOscsRef.current.push(lfo);
      }
    });

    // Melody player
    let noteIndex = 0;
    const playNote = () => {
      if (!ctxRef.current || ctxRef.current.state === 'closed') return;

      const freq = config.notes[noteIndex % config.notes.length];
      const now = ctx.currentTime;
      const duration = config.tempo * 0.8;

      // Main melody note
      const osc = ctx.createOscillator();
      osc.type = config.waveform;
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 4;

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.12, now + 0.15);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(filter);
      osc.start(now);
      osc.stop(now + duration);

      // Soft harmonic (octave above, very quiet)
      const harmOsc = ctx.createOscillator();
      harmOsc.type = 'sine';
      harmOsc.frequency.value = freq * 2;
      const harmGain = ctx.createGain();
      harmGain.gain.setValueAtTime(0, now);
      harmGain.gain.linearRampToValueAtTime(0.03, now + 0.2);
      harmGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);
      harmOsc.connect(harmGain);
      harmGain.connect(filter);
      harmOsc.start(now);
      harmOsc.stop(now + duration * 0.6);

      noteIndex++;
    };

    // Start playing notes
    playNote();
    intervalRef.current = window.setInterval(playNote, config.tempo * 1000);

    setIsPlaying(true);
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
