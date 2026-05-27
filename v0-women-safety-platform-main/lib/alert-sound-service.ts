/**
 * Alert Sound Service
 * Plays emergency siren and notification sounds
 */

export class AlertSoundService {
  private audioContext: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];

  /**
   * Initialize audio context
   */
  private initAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Play emergency siren sound (2-3 seconds)
   */
  playEmergencySiren(): void {
    this.initAudioContext();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const duration = 3; // 3 seconds

    // Create siren effect with frequency modulation
    for (let i = 0; i < 2; i++) {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + i * 200, now);
      
      // Frequency modulation for siren effect
      osc.frequency.exponentialRampToValueAtTime(
        1200 + i * 200,
        now + 0.5
      );
      osc.frequency.exponentialRampToValueAtTime(
        600 + i * 200,
        now + 1
      );
      osc.frequency.exponentialRampToValueAtTime(
        800 + i * 200,
        now + 1.5
      );

      // Volume envelope
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      osc.start(now);
      osc.stop(now + duration);

      this.oscillators.push(osc);
      this.gainNodes.push(gain);
    }

    // Cleanup after sound finishes
    setTimeout(() => {
      this.stop();
    }, duration * 1000);
  }

  /**
   * Play alert notification sound (short beep)
   */
  playNotificationSound(): void {
    this.initAudioContext();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const duration = 0.3;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);

    this.oscillators.push(osc);
    this.gainNodes.push(gain);
  }

  /**
   * Play warning sound (ascending tone)
   */
  playWarningSound(): void {
    this.initAudioContext();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const duration = 0.5;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(1200, now + duration);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);

    this.oscillators.push(osc);
    this.gainNodes.push(gain);
  }

  /**
   * Play success sound (ascending double beep)
   */
  playSuccessSound(): void {
    this.initAudioContext();
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;

    // First beep
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(800, now);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.linearRampToValueAtTime(0, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(this.audioContext.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second beep (higher frequency)
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1200, now + 0.2);
    gain2.gain.setValueAtTime(0.2, now + 0.2);
    gain2.gain.linearRampToValueAtTime(0, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.audioContext.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.35);

    this.oscillators.push(osc1, osc2);
    this.gainNodes.push(gain1, gain2);
  }

  /**
   * Stop all sounds
   */
  stop(): void {
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators = [];
    this.gainNodes = [];
  }

  /**
   * Enable vibration alert (for mobile devices)
   */
  static vibrate(pattern: number | number[] = [200, 100, 200]): void {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Trigger complete emergency alert (sound + vibration)
   */
  triggerEmergencyAlert(): void {
    AlertSoundService.vibrate([300, 100, 300, 100, 300]);
    this.playEmergencySiren();
  }
}

export default AlertSoundService;
