export interface TimerSound {
  name: string;
  value: string;
  url?: string;
  description: string;
}

// Create iPhone-inspired sound generators
const createContinuousRadarSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Radar sound - sweeping frequency with echo effect
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const delay = audioContext.createDelay(0.3);
    const delayGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    // Connect nodes for echo effect
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(audioContext.destination);
    
    // Configure filter for radar-like sweep
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(10, audioContext.currentTime);
    
    // Configure delay for echo
    delay.delayTime.setValueAtTime(0.15, audioContext.currentTime);
    delayGain.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioContext.currentTime);
    
    // Create sweeping effect
    let isPlaying = true;
    const sweep = () => {
      if (!isPlaying) return;
      
      const now = audioContext.currentTime;
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.8);
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.8);
      
      setTimeout(sweep, 1000);
    };
    
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.1);
    
    osc.start(audioContext.currentTime);
    sweep();
    
    console.log(`🔊 Radar sound created`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          try {
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
            osc.stop(audioContext.currentTime + 0.3);
            console.log(`🔇 Radar sound stopped`);
          } catch (error) {
            console.error('Error stopping radar sound:', error);
          }
        }
      }
    };
  } catch (error) {
    console.error('Error creating radar sound:', error);
    return { stop: () => {} };
  }
};

const createContinuousAlarmSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Classic alarm sound - urgent but not harsh
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    const masterGain = audioContext.createGain();
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(masterGain);
    gain2.connect(masterGain);
    masterGain.connect(audioContext.destination);
    
    // Two-tone alarm pattern
    osc1.frequency.setValueAtTime(800, audioContext.currentTime);
    osc2.frequency.setValueAtTime(1000, audioContext.currentTime);
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.1);
    
    osc1.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime);
    
    let isPlaying = true;
    
    // Alternating pattern
    const alternate = () => {
      if (!isPlaying) return;
      
      const now = audioContext.currentTime;
      // First tone
      gain1.gain.setValueAtTime(1, now);
      gain2.gain.setValueAtTime(0, now);
      gain1.gain.setValueAtTime(0, now + 0.4);
      gain2.gain.setValueAtTime(1, now + 0.4);
      
      setTimeout(alternate, 800);
    };
    
    alternate();
    console.log(`🔊 Alarm sound created`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          try {
            masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
            osc1.stop(audioContext.currentTime + 0.2);
            osc2.stop(audioContext.currentTime + 0.2);
            console.log(`🔇 Alarm sound stopped`);
          } catch (error) {
            console.error('Error stopping alarm sound:', error);
          }
        }
      }
    };
  } catch (error) {
    console.error('Error creating alarm sound:', error);
    return { stop: () => {} };
  }
};

const createContinuousSilkSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Silk sound - smooth, flowing, gentle
    const notes = [
      { freq: 523.25, vol: 0.15 }, // C5
      { freq: 659.25, vol: 0.12 }, // E5
      { freq: 783.99, vol: 0.10 }, // G5
      { freq: 1046.5, vol: 0.08 }  // C6
    ];
    
    const oscillators: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }[] = [];
    
    notes.forEach(({ freq, vol }, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      osc.type = 'sine';
      
      // Silk-like smooth filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 1.2, audioContext.currentTime);
      filter.Q.setValueAtTime(0.3, audioContext.currentTime);
      
      // Very smooth fade-in with slight delay for each note
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.3 + (index * 0.1));
      
      osc.start(audioContext.currentTime);
      oscillators.push({ osc, gain, filter });
    });
    
    let isPlaying = true;
    console.log(`🔊 Silk sound created`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          oscillators.forEach(({ osc, gain }) => {
            try {
              gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);
              osc.stop(audioContext.currentTime + 0.8);
            } catch (error) {
              console.error('Error stopping silk oscillator:', error);
            }
          });
          console.log(`🔇 Silk sound stopped`);
        }
      }
    };
  } catch (error) {
    console.error('Error creating silk sound:', error);
    return { stop: () => {} };
  }
};

const createContinuousSignalSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Signal sound - clean, digital, precise
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.setValueAtTime(1000, audioContext.currentTime);
    osc.type = 'triangle'; // Clean digital sound
    
    // Precise filter for signal clarity
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);
    filter.Q.setValueAtTime(5, audioContext.currentTime);
    
    let isPlaying = true;
    
    // Signal pattern - short pulses
    const pulse = () => {
      if (!isPlaying) return;
      
      const now = audioContext.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      gain.gain.setValueAtTime(0, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.4);
      gain.gain.linearRampToValueAtTime(0, now + 0.6);
      
      setTimeout(pulse, 1000);
    };
    
    osc.start(audioContext.currentTime);
    pulse();
    
    console.log(`🔊 Signal sound created`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          try {
            gain.gain.setValueAtTime(0, audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.1);
            console.log(`🔇 Signal sound stopped`);
          } catch (error) {
            console.error('Error stopping signal sound:', error);
          }
        }
      }
    };
  } catch (error) {
    console.error('Error creating signal sound:', error);
    return { stop: () => {} };
  }
};

const createContinuousApexSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Apex sound - rising, powerful, attention-getting
    const fundamental = 440; // A4
    const harmonics = [
      { mult: 1, vol: 0.20 },    // Fundamental
      { mult: 1.5, vol: 0.15 },  // Perfect fifth
      { mult: 2, vol: 0.12 },    // Octave
      { mult: 3, vol: 0.08 },    // Perfect fifth (higher)
      { mult: 4, vol: 0.05 }     // Double octave
    ];
    
    const oscillators: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }[] = [];
    
    harmonics.forEach(({ mult, vol }) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(fundamental * mult, audioContext.currentTime);
      osc.type = 'sine';
      
      // Apex-like filter - bright and clear
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(200, audioContext.currentTime);
      filter.Q.setValueAtTime(0.7, audioContext.currentTime);
      
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(vol, audioContext.currentTime + 0.2);
      
      osc.start(audioContext.currentTime);
      oscillators.push({ osc, gain, filter });
    });
    
    let isPlaying = true;
    
    // Rising effect
    const rise = () => {
      if (!isPlaying) return;
      
      const now = audioContext.currentTime;
      oscillators.forEach(({ osc, filter }, index) => {
        const baseFreq = fundamental * harmonics[index].mult;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + 1.5);
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.linearRampToValueAtTime(400, now + 1.5);
      });
      
      setTimeout(rise, 2000);
    };
    
    rise();
    console.log(`🔊 Apex sound created`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          oscillators.forEach(({ osc, gain }) => {
            try {
              gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
              osc.stop(audioContext.currentTime + 0.5);
            } catch (error) {
              console.error('Error stopping apex oscillator:', error);
            }
          });
          console.log(`🔇 Apex sound stopped`);
        }
      }
    };
  } catch (error) {
    console.error('Error creating apex sound:', error);
    return { stop: () => {} };
  }
};

// Legacy functions for backward compatibility (now return continuous sounds)
const createBeepSound = async (frequency: number = 800, duration: number = 1000): Promise<void> => {
  const continuousSound = await createContinuousSignalSound();
  // For legacy compatibility, stop after duration
  setTimeout(() => continuousSound.stop(), duration);
};

const createBellSound = async (): Promise<void> => {
  const continuousSound = await createContinuousSilkSound();
  // For legacy compatibility, stop after 2 seconds
  setTimeout(() => continuousSound.stop(), 2000);
};

const createChimeSound = async (): Promise<void> => {
  const continuousSound = await createContinuousSilkSound();
  // For legacy compatibility, stop after 1.5 seconds
  setTimeout(() => continuousSound.stop(), 1500);
};

export const timerSounds: TimerSound[] = [
  { 
    name: "Radar", 
    value: "radar", 
    description: "Sweeping radar sound with echo effect"
  },
  { 
    name: "Alarm", 
    value: "alarm", 
    description: "Classic two-tone alarm pattern"
  },
  { 
    name: "Silk", 
    value: "silk", 
    description: "Smooth, flowing harmonic tones"
  },
  { 
    name: "Signal", 
    value: "signal", 
    description: "Clean digital signal pulses"
  },
  { 
    name: "Apex", 
    value: "apex", 
    description: "Rising powerful harmonic progression"
  }
];

export const getTimerSoundUrl = (soundValue: string): string => {
  // Return a data URL for Web Audio API sounds
  return `data:audio/wav;base64,${soundValue}`;
};

export const getTimerSoundName = (soundValue: string): string => {
  const sound = timerSounds.find(s => s.value === soundValue);
  return sound?.name || timerSounds[0].name;
};

export const playTimerSound = async (soundValue: string): Promise<void> => {
  // This function is for legacy compatibility only
  // For continuous sounds, use startContinuousTimerSound instead
  console.warn('playTimerSound is deprecated, use startContinuousTimerSound for continuous sounds');
  
  // Create a short version for legacy compatibility
  const continuousSound = await startContinuousTimerSound(soundValue);
  setTimeout(() => continuousSound.stop(), 1000); // Stop after 1 second for legacy use
};

// New function for continuous timer sounds
export const startContinuousTimerSound = async (soundValue: string): Promise<{ stop: () => void }> => {
  console.log(`🔊 Starting TRULY CONTINUOUS timer sound: ${soundValue}`);
  
  try {
    let continuousSound: { stop: () => void };
    
    switch (soundValue) {
      case 'radar':
        continuousSound = await createContinuousRadarSound();
        break;
      case 'alarm':
        continuousSound = await createContinuousAlarmSound();
        break;
      case 'silk':
        continuousSound = await createContinuousSilkSound();
        break;
      case 'signal':
        continuousSound = await createContinuousSignalSound();
        break;
      case 'apex':
        continuousSound = await createContinuousApexSound();
        break;
      // Legacy support for old sound names (fallback to new sounds)
      case 'beep':
        continuousSound = await createContinuousSignalSound(); // Map beep to signal
        break;
      case 'bell':
        continuousSound = await createContinuousSilkSound(); // Map bell to silk
        break;
      case 'chime-gentle':
        continuousSound = await createContinuousSilkSound(); // Map gentle chime to silk
        break;
      case 'chime-digital':
        continuousSound = await createContinuousSignalSound(); // Map digital chime to signal
        break;
      case 'zen-bell':
        continuousSound = await createContinuousSilkSound(); // Map zen bell to silk
        break;
      case 'high-beep':
        continuousSound = await createContinuousSignalSound(); // Map high beep to signal
        break;
      case 'low-beep':
        continuousSound = await createContinuousRadarSound(); // Map low beep to radar
        break;
      case 'chime':
        continuousSound = await createContinuousSilkSound(); // Map old chime to silk
        break;
      default:
        console.warn(`Unknown sound value: ${soundValue}, falling back to radar`);
        continuousSound = await createContinuousRadarSound();
    }
    
    console.log(`🔊 CONTINUOUS sound started for ${soundValue} - will play until manually stopped`);
    
    return {
      stop: () => {
        console.log(`🔇 STOPPING continuous sound for ${soundValue}`);
        continuousSound.stop();
      }
    };
  } catch (error) {
    console.error('Error starting continuous timer sound:', error);
    // Fallback to radar sound
    const fallbackSound = await createContinuousRadarSound();
    console.log('🔊 Fallback continuous radar started');
    return fallbackSound;
  }
};