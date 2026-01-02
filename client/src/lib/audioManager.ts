// Global audio manager to handle timer sounds
class AudioManager {
  private static instance: AudioManager;
  private activeAudios: Set<HTMLAudioElement> = new Set();
  private activeIntervals: Set<NodeJS.Timeout> = new Set();
  private globalAudioElements: HTMLAudioElement[] = []; // Track all created audio elements
  private isTimerSoundPlaying: boolean = false;
  private currentTimerAudio: HTMLAudioElement | null = null;
  private currentSoundLoop: NodeJS.Timeout | null = null;
  private currentContinuousSound: { stop: () => void } | null = null;
  private audioContext: AudioContext | null = null;

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Create and track audio elements
  createAudio(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    this.globalAudioElements.push(audio);
    this.activeAudios.add(audio);
    console.log(`🔊 AudioManager: Created and registered new audio element. Total tracked: ${this.globalAudioElements.length}`);
    return audio;
  }

  // Special method for continuous timer sounds
  async startContinuousTimerSound(soundGenerator: () => Promise<{ stop: () => void }>): Promise<void> {
    console.log('🔊 AudioManager: Starting CONTINUOUS timer sound (will play until manually stopped)');
    
    // Stop any existing timer sound first
    this.stopTimerSound();
    
    try {
      this.isTimerSoundPlaying = true;
      this.currentContinuousSound = await soundGenerator();
      console.log('🔊 AudioManager: CONTINUOUS timer sound is now playing - will continue until X button clicked');
    } catch (error) {
      console.error('🔊 AudioManager: Error starting continuous timer sound:', error);
      this.isTimerSoundPlaying = false;
      this.currentContinuousSound = null;
    }
  }

  // Special method for timer sounds
  createTimerAudio(src: string): HTMLAudioElement {
    // Stop any existing timer audio first
    this.stopTimerSound();
    
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = 0.7;
    audio.preload = "auto";
    
    this.currentTimerAudio = audio;
    this.globalAudioElements.push(audio);
    this.activeAudios.add(audio);
    
    console.log(`🔊 AudioManager: Created timer audio element`);
    return audio;
  }

  // Start timer sound
  async startTimerSound(audio: HTMLAudioElement): Promise<void> {
    try {
      this.isTimerSoundPlaying = true;
      this.currentTimerAudio = audio;
      
      // Ensure audio is properly configured
      audio.loop = true;
      audio.volume = 0.7;
      audio.currentTime = 0;
      audio.muted = false;
      
      await audio.play();
      console.log(`🔊 AudioManager: Timer sound started and playing`);
    } catch (error) {
      console.error(`🔊 AudioManager: Error starting timer sound:`, error);
      this.isTimerSoundPlaying = false;
      this.currentTimerAudio = null;
    }
  }

  // Stop timer sound specifically
  stopTimerSound(): void {
    console.log(`🔇 AudioManager: STOPPING CONTINUOUS timer sound (X button clicked or manual stop)`);
    
    this.isTimerSoundPlaying = false;
    
    // Stop continuous Web Audio API sound
    if (this.currentContinuousSound) {
      try {
        this.currentContinuousSound.stop();
        console.log(`🔇 AudioManager: Successfully stopped continuous Web Audio API sound`);
      } catch (error) {
        console.error(`🔇 AudioManager: Error stopping continuous sound:`, error);
      }
      this.currentContinuousSound = null;
    }
    
    // Stop Web Audio API loop (legacy)
    if (this.currentSoundLoop) {
      clearTimeout(this.currentSoundLoop);
      this.activeIntervals.delete(this.currentSoundLoop);
      this.currentSoundLoop = null;
      console.log(`🔇 AudioManager: Stopped Web Audio API loop`);
    }
    
    if (this.currentTimerAudio) {
      try {
        this.currentTimerAudio.pause();
        this.currentTimerAudio.currentTime = 0;
        this.currentTimerAudio.loop = false;
        this.currentTimerAudio.volume = 0;
        this.currentTimerAudio.muted = true;
        console.log(`🔇 AudioManager: Current timer audio stopped`);
      } catch (error) {
        console.error(`🔇 AudioManager: Error stopping current timer audio:`, error);
      }
      this.currentTimerAudio = null;
    }
  }

  registerAudio(audio: HTMLAudioElement): void {
    this.activeAudios.add(audio);
    if (!this.globalAudioElements.includes(audio)) {
      this.globalAudioElements.push(audio);
    }
    console.log(`🔊 AudioManager: Registered audio element. Total active: ${this.activeAudios.size}, Total tracked: ${this.globalAudioElements.length}`);
  }

  registerInterval(interval: NodeJS.Timeout): void {
    this.activeIntervals.add(interval);
    console.log(`🔊 AudioManager: Registered interval. Total active: ${this.activeIntervals.size}`);
  }

  unregisterAudio(audio: HTMLAudioElement): void {
    this.activeAudios.delete(audio);
    console.log(`🔊 AudioManager: Unregistered audio element. Total active: ${this.activeAudios.size}`);
  }

  unregisterInterval(interval: NodeJS.Timeout): void {
    this.activeIntervals.delete(interval);
    console.log(`🔊 AudioManager: Unregistered interval. Total active: ${this.activeIntervals.size}`);
  }

  hasActiveSounds(): boolean {
    const hasAudio = this.activeAudios.size > 0;
    const hasIntervals = this.activeIntervals.size > 0;
    const hasTimerSound = this.isTimerSoundPlaying;
    console.log(`🔊 AudioManager: Active sounds check - Audio: ${hasAudio}, Intervals: ${hasIntervals}, Timer: ${hasTimerSound}`);
    return hasAudio || hasIntervals || hasTimerSound;
  }

  stopAllTimerSounds(): void {
    console.log("🔇 AudioManager: Stopping all timer sounds IMMEDIATELY");
    
    // Stop timer sound first
    this.stopTimerSound();
    
  // Stop all tracked audio elements
    console.log(`🔇 AudioManager: Stopping ${this.globalAudioElements.length} tracked audio elements`);
    this.globalAudioElements.forEach((audio) => {
      try {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
          audio.loop = false;
          audio.volume = 0;
          audio.muted = true;
          console.log(`🔇 AudioManager: Stopped tracked audio`);
        }
      } catch (error) {
        console.error(`🔇 AudioManager: Error stopping tracked audio:`, error);
      }
    });

    // Stop registered audio elements
    this.activeAudios.forEach((audio) => {
      try {
        if (audio && !audio.paused) {
          audio.pause();
          audio.currentTime = 0;
          audio.loop = false;
          audio.volume = 0;
          audio.muted = true;
          console.log(`🔇 AudioManager: Stopped registered audio element`);
        }
      } catch (error) {
        console.error("🔇 AudioManager: Error stopping registered audio:", error);
      }
    });

    // Clear registered intervals
    this.activeIntervals.forEach(interval => {
      try {
        clearInterval(interval);
        console.log("🔇 AudioManager: Cleared registered interval");
      } catch (error) {
        console.error("🔇 AudioManager: Error clearing registered interval:", error);
      }
    });

    // NUCLEAR OPTION: Stop ALL audio elements on the page
    const allAudioElements = document.querySelectorAll('audio');
    console.log(`🔇 AudioManager: NUCLEAR - Found ${allAudioElements.length} total audio elements on page`);
    
    allAudioElements.forEach((audio) => {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.loop = false;
        audio.volume = 0;
        audio.muted = true; // Also mute them
        console.log(`🔇 AudioManager: NUCLEAR - Stopped page audio element`);
      } catch (error) {
        console.error(`🔇 AudioManager: NUCLEAR - Error stopping page audio element:`, error);
      }
    });

    // Clear the sets but keep tracked elements for future cleanup
    this.activeAudios.clear();
    this.activeIntervals.clear();
    this.isTimerSoundPlaying = false;
    this.currentTimerAudio = null;
    this.currentSoundLoop = null;
    this.currentContinuousSound = null;

    console.log("🔇 AudioManager: ALL TIMER SOUNDS STOPPED");
  }

  // Emergency stop method that can be called multiple times
  emergencyStopAll(): void {
    console.log("🚨 AudioManager: EMERGENCY STOP ALL AUDIO");
    
    // Stop timer sound immediately
    this.stopTimerSound();
    
    // Stop everything multiple times to be sure
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        // Stop all tracked elements
        this.globalAudioElements.forEach(audio => {
          try {
            if (audio) {
              audio.pause();
              audio.currentTime = 0;
              audio.loop = false;
              audio.volume = 0;
              audio.muted = true;
            }
          } catch (e) {
            // Ignore errors in emergency stop
          }
        });

        // Stop all page audio
        const allAudio = document.querySelectorAll('audio');
        allAudio.forEach(audio => {
          try {
            audio.pause();
            audio.currentTime = 0;
            audio.loop = false;
            audio.volume = 0;
            audio.muted = true;
          } catch (e) {
            // Ignore errors in emergency stop
          }
        });
        console.log(`🚨 Emergency stop attempt ${i + 1} completed - stopped ${allAudio.length} elements`);
      }, i * 25); // Faster intervals
    }
    
    this.isTimerSoundPlaying = false;
    this.currentTimerAudio = null;
    this.currentSoundLoop = null;
    this.currentContinuousSound = null;
  }

  // Complete reset - destroys all tracked audio
  resetAll(): void {
    console.log("🔄 AudioManager: COMPLETE RESET");
    
    // Stop timer sound first
    this.stopTimerSound();
    
    // Stop and remove all tracked audio
    this.globalAudioElements.forEach((audio) => {
      try {
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.loop = false;
          audio.volume = 0;
          audio.muted = true;
          audio.src = '';
          audio.load();
          console.log(`🔄 Reset tracked audio`);
        }
      } catch (error) {
        console.error(`🔄 Error resetting tracked audio:`, error);
      }
    });

    // Clear all tracking
    this.globalAudioElements = [];
    this.activeAudios.clear();
    this.activeIntervals.forEach(interval => clearInterval(interval));
    this.activeIntervals.clear();
    this.isTimerSoundPlaying = false;
    this.currentTimerAudio = null;
    this.currentSoundLoop = null;
    this.currentContinuousSound = null;

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log("🔄 AudioManager: COMPLETE RESET DONE");
  }
}

export const audioManager = AudioManager.getInstance();

// Global function that can be called from anywhere
export const stopAllTimerSounds = () => {
  audioManager.stopAllTimerSounds();
};

// Stop timer sound specifically
export const stopTimerSound = () => {
  audioManager.stopTimerSound();
};

// Emergency stop function for immediate audio stopping
export const emergencyStopAllAudio = () => {
  audioManager.emergencyStopAll();
};

// Complete reset function
export const resetAllAudio = () => {
  audioManager.resetAll();
};