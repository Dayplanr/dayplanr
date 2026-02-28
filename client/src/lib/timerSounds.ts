export interface TimerSound {
  name: string;
  value: string;
  url?: string;
  description: string;
}

// Helper to reliably stop nodes
const stopNodes = (nodes: { osc: OscillatorNode, gain: GainNode }[], audioContext: AudioContext) => {
  const now = audioContext.currentTime;
  nodes.forEach(({ osc, gain }) => {
    try {
      gain.gain.cancelScheduledValues(now);
      // Fast fade out to avoid clicks
      gain.gain.setValueAtTime(gain.gain.value || 0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.stop(now + 0.1);
    } catch (error) {
      console.error('Error stopping node', error);
    }
  });
};

const createContinuousZenSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    const activeNodes: { osc: OscillatorNode, gain: GainNode }[] = [];
    let isPlaying = true;

    const playBowl = () => {
      if (!isPlaying) return;
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.5); // Slow attack
      gain.gain.exponentialRampToValueAtTime(0.01, now + 3.9); // Long release

      osc.start(now);
      activeNodes.push({ osc, gain });

      setTimeout(() => {
        const idx = activeNodes.findIndex(n => n.osc === osc);
        if (idx > -1) activeNodes.splice(idx, 1);
      }, 4000);

      setTimeout(playBowl, 4000);
    };

    playBowl();

    return {
      stop: () => {
        isPlaying = false;
        stopNodes(activeNodes, audioContext);
      }
    };
  } catch (e) {
    return { stop: () => { } };
  }
};

const createContinuousBreezeSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    const activeNodes: { osc: OscillatorNode, gain: GainNode }[] = [];
    let isPlaying = true;
    const freqs = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];

    const playChime = () => {
      if (!isPlaying) return;
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = 'sine';
      const freq = freqs[Math.floor(Math.random() * freqs.length)];
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

      osc.start(now);
      activeNodes.push({ osc, gain });

      setTimeout(() => {
        const idx = activeNodes.findIndex(n => n.osc === osc);
        if (idx > -1) activeNodes.splice(idx, 1);
      }, 2100);

      setTimeout(playChime, 500 + Math.random() * 1500);
    };

    playChime();
    setTimeout(playChime, 300);

    return {
      stop: () => {
        isPlaying = false;
        stopNodes(activeNodes, audioContext);
      }
    };
  } catch (e) {
    return { stop: () => { } };
  }
};

const createContinuousRippleSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    const activeNodes: { osc: OscillatorNode, gain: GainNode }[] = [];
    let isPlaying = true;

    const playRipple = () => {
      if (!isPlaying) return;
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.start(now);
      activeNodes.push({ osc, gain });

      setTimeout(() => {
        const idx = activeNodes.findIndex(n => n.osc === osc);
        if (idx > -1) activeNodes.splice(idx, 1);
      }, 900);

      setTimeout(playRipple, 2000);
    };

    playRipple();

    return {
      stop: () => {
        isPlaying = false;
        stopNodes(activeNodes, audioContext);
      }
    };
  } catch (e) {
    return { stop: () => { } };
  }
};

const createContinuousAuraSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    const activeNodes: { osc: OscillatorNode, gain: GainNode }[] = [];
    let isPlaying = true;

    const playChord = () => {
      if (!isPlaying) return;
      const now = audioContext.currentTime;

      const freqs = [261.63, 329.63, 392.00, 493.88]; // Cmaj7
      const duration = 3.5;

      freqs.forEach(freq => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 1.5);
        gain.gain.linearRampToValueAtTime(0.08, now + 2.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        activeNodes.push({ osc, gain });

        setTimeout(() => {
          const idx = activeNodes.findIndex(n => n.osc === osc);
          if (idx > -1) activeNodes.splice(idx, 1);
        }, (duration + 0.5) * 1000);
      });

      setTimeout(playChord, 4000);
    };

    playChord();

    return {
      stop: () => {
        isPlaying = false;
        stopNodes(activeNodes, audioContext);
      }
    };
  } catch (e) {
    return { stop: () => { } };
  }
};

const createContinuousSilkSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') await audioContext.resume();

    const notes = [
      { freq: 523.25, vol: 0.15 },
      { freq: 659.25, vol: 0.12 },
      { freq: 783.99, vol: 0.10 },
      { freq: 1046.5, vol: 0.08 }
    ];

    const activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
    let isPlaying = true;

    notes.forEach(({ freq, vol }, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      osc.type = 'sine';

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 1.2, audioContext.currentTime);
      filter.Q.setValueAtTime(0.3, audioContext.currentTime);

      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.3 + (index * 0.1));

      osc.start(audioContext.currentTime);
      activeNodes.push({ osc, gain });
    });

    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          stopNodes(activeNodes, audioContext);
        }
      }
    };
  } catch (e) {
    return { stop: () => { } };
  }
};

export const timerSounds: TimerSound[] = [
  { name: "Zen", value: "zen", description: "Deep, resonant singing bowl" },
  { name: "Breeze", value: "breeze", description: "Gentle wind chimes in the breeze" },
  { name: "Ripple", value: "ripple", description: "Soft, echoing water plucks" },
  { name: "Silk", value: "silk", description: "Smooth, flowing harmonic tones" },
  { name: "Aura", value: "aura", description: "Warm, ambient chord swells" }
];

export const getTimerSoundUrl = (soundValue: string): string => `data:audio/wav;base64,${soundValue}`;

export const getTimerSoundName = (soundValue: string): string => {
  const sound = timerSounds.find(s => s.value === soundValue);
  return sound?.name || timerSounds[0].name;
};

export const playTimerSound = async (soundValue: string): Promise<void> => {
  console.warn('playTimerSound is deprecated, use startContinuousTimerSound for continuous sounds');
  const continuousSound = await startContinuousTimerSound(soundValue);
  setTimeout(() => continuousSound.stop(), 2000);
};

export const startContinuousTimerSound = async (soundValue: string): Promise<{ stop: () => void }> => {
  try {
    let continuousSound: { stop: () => void };

    // Map old fallback names to new soft names as well
    if (['radar', 'low-beep'].includes(soundValue)) soundValue = 'zen';
    if (['alarm', 'beep', 'high-beep'].includes(soundValue)) soundValue = 'breeze';
    if (['signal', 'chime-digital'].includes(soundValue)) soundValue = 'ripple';
    if (['apex'].includes(soundValue)) soundValue = 'aura';
    if (['bell', 'chime', 'chime-gentle', 'zen-bell'].includes(soundValue)) soundValue = 'silk';

    switch (soundValue) {
      case 'zen': continuousSound = await createContinuousZenSound(); break;
      case 'breeze': continuousSound = await createContinuousBreezeSound(); break;
      case 'ripple': continuousSound = await createContinuousRippleSound(); break;
      case 'silk': continuousSound = await createContinuousSilkSound(); break;
      case 'aura': continuousSound = await createContinuousAuraSound(); break;
      default: continuousSound = await createContinuousZenSound();
    }
    return continuousSound;
  } catch (error) {
    return await createContinuousZenSound();
  }
};