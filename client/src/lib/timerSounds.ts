export interface TimerSound {
  name: string;
  value: string;
  url?: string;
  description: string;
}

// Web Audio API sound generators for reliable timer sounds
const createContinuousBeepSound = async (frequency: number = 800): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended (required by some browsers)
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Start with volume fade-in for smoother sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    
    let isPlaying = true;
    console.log(`🔊 Continuous beep sound created at ${frequency}Hz - will play until stopped`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          try {
            // Fade out before stopping for smoother end
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
            console.log(`🔇 Continuous beep sound stopped`);
          } catch (error) {
            console.error('Error stopping continuous beep:', error);
          }
        }
      }
    };
  } catch (error) {
    console.error('Error creating continuous beep sound:', error);
    return { stop: () => {} };
  }
};

const createContinuousBellSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Create multiple oscillators for a rich bell sound
    const frequencies = [800, 1000, 1200, 1600];
    const oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
    
    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      osc.type = 'sine';
      
      // Different volumes for harmonic richness
      const volume = 0.15 / (index + 1); // Decreasing volume for higher frequencies
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      
      osc.start(audioContext.currentTime);
      oscillators.push({ osc, gain });
    });
    
    let isPlaying = true;
    console.log(`🔊 Continuous bell sound created - will play until stopped`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          oscillators.forEach(({ osc, gain }) => {
            try {
              gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
              osc.stop(audioContext.currentTime + 0.1);
            } catch (error) {
              console.error('Error stopping bell oscillator:', error);
            }
          });
          console.log(`🔇 Continuous bell sound stopped`);
        }
      }
    };
  } catch (error) {
    console.error('Error creating continuous bell sound:', error);
    return { stop: () => {} };
  }
};

const createContinuousChimeSound = async (): Promise<{ stop: () => void }> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
    // Create a pleasant chord for continuous chime
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const oscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
    
    notes.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      osc.type = 'sine';
      
      const volume = 0.12 / (index + 1);
      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.1);
      
      osc.start(audioContext.currentTime);
      oscillators.push({ osc, gain });
    });
    
    let isPlaying = true;
    console.log(`🔊 Continuous chime sound created - will play until stopped`);
    
    return {
      stop: () => {
        if (isPlaying) {
          isPlaying = false;
          oscillators.forEach(({ osc, gain }) => {
            try {
              gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
              osc.stop(audioContext.currentTime + 0.1);
            } catch (error) {
              console.error('Error stopping chime oscillator:', error);
            }
          });
          console.log(`🔇 Continuous chime sound stopped`);
        }
      }
    };
  } catch (error) {
    console.error('Error creating continuous chime sound:', error);
    return { stop: () => {} };
  }
};

// Legacy functions for backward compatibility (now return continuous sounds)
const createBeepSound = async (frequency: number = 800, duration: number = 1000): Promise<void> => {
  const continuousSound = await createContinuousBeepSound(frequency);
  // For legacy compatibility, stop after duration
  setTimeout(() => continuousSound.stop(), duration);
};

const createBellSound = async (): Promise<void> => {
  const continuousSound = await createContinuousBellSound();
  // For legacy compatibility, stop after 2 seconds
  setTimeout(() => continuousSound.stop(), 2000);
};

const createChimeSound = async (): Promise<void> => {
  const continuousSound = await createContinuousChimeSound();
  // For legacy compatibility, stop after 1.5 seconds
  setTimeout(() => continuousSound.stop(), 1500);
};

export const timerSounds: TimerSound[] = [
  { 
    name: "Soft Bell", 
    value: "bell", 
    description: "Gentle continuous bell sound"
  },
  { 
    name: "Digital Beep", 
    value: "beep", 
    description: "Classic continuous beep"
  },
  { 
    name: "High Beep", 
    value: "high-beep", 
    description: "Higher pitched continuous beep"
  },
  { 
    name: "Low Beep", 
    value: "low-beep", 
    description: "Lower pitched continuous beep"
  },
  { 
    name: "Chime", 
    value: "chime", 
    description: "Pleasant continuous chime"
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
      case 'bell':
        continuousSound = await createContinuousBellSound();
        break;
      case 'beep':
        continuousSound = await createContinuousBeepSound(800);
        break;
      case 'high-beep':
        continuousSound = await createContinuousBeepSound(1200);
        break;
      case 'low-beep':
        continuousSound = await createContinuousBeepSound(400);
        break;
      case 'chime':
        continuousSound = await createContinuousChimeSound();
        break;
      default:
        continuousSound = await createContinuousBeepSound(800);
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
    // Fallback to simple continuous beep
    const fallbackSound = await createContinuousBeepSound(800);
    console.log('🔊 Fallback continuous beep started');
    return fallbackSound;
  }
};