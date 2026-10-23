/**
 * Web Audio API Sound Synthesizer for FlipQuiz
 * Zero external audio files, works reliably on all devices and browsers.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio playback safety
    }
  }

  public playUrgentTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio playback safety
    }
  }

  public playCorrect() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);
        gain.gain.setValueAtTime(0, now + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.25);
      });
    } catch {
      // Audio playback safety
    }
  }

  public playWrong() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.28);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio playback safety
    }
  }

  public playFastFinger() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } catch {
      // Audio playback safety
    }
  }

  public playStar() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio playback safety
    }
  }

  public playFanfare() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 523.25, d: 0.12 },
        { f: 659.25, d: 0.35 },
        { f: 587.33, d: 0.15 },
        { f: 659.25, d: 0.4 }
      ];
      let offset = 0;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + offset);
        gain.gain.setValueAtTime(0.1, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + note.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + note.d);
        offset += note.d * 0.8;
      });
    } catch {
      // Audio playback safety
    }
  }

  // --- BACKGROUND MUSIC SYNTHESIZER ---
  private musicInterval: any = null;
  private musicVolumeNode: GainNode | null = null;
  private currentMusicTheme: string = 'gameshow';
  private musicVolume: number = 0.25;
  private isMusicActive: boolean = false;

  public getMusicTheme(): string {
    return this.currentMusicTheme;
  }

  public setMusicTheme(theme: string) {
    this.currentMusicTheme = theme;
    if (this.isMusicActive) {
      this.stopBackgroundMusic();
      this.startBackgroundMusic(theme, this.musicVolume);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicVolumeNode && this.ctx) {
      this.musicVolumeNode.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public isPlayingMusic(): boolean {
    return this.isMusicActive;
  }

  public stopBackgroundMusic() {
    this.isMusicActive = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public startBackgroundMusic(theme?: string, volume?: number) {
    if (theme) this.currentMusicTheme = theme;
    if (volume !== undefined) this.musicVolume = volume;
    if (this.currentMusicTheme === 'none' || !this.enabled) {
      this.stopBackgroundMusic();
      return;
    }

    this.stopBackgroundMusic();
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMusicActive = true;
    this.musicVolumeNode = ctx.createGain();
    this.musicVolumeNode.gain.setValueAtTime(this.musicVolume, ctx.currentTime);
    this.musicVolumeNode.connect(ctx.destination);

    let step = 0;
    const bpm = this.currentMusicTheme === 'arcade' ? 140 : this.currentMusicTheme === 'epic' ? 128 : 120;
    const stepIntervalMs = (60 / bpm / 2) * 1000; // Eighth notes

    // Melody and Bass patterns based on theme
    const patterns: Record<string, { bass: (number | null)[]; lead: (number | null)[] }> = {
      arcade: {
        bass: [130.81, 130.81, 164.81, 164.81, 196.0, 196.0, 220.0, 196.0],
        lead: [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 587.33, 659.25]
      },
      gameshow: {
        bass: [110.0, 110.0, 123.47, 130.81, 146.83, 130.81, 123.47, 110.0],
        lead: [440.0, null, 523.25, null, 659.25, 587.33, null, 440.0]
      },
      lofi: {
        bass: [146.83, null, 174.61, null, 220.0, null, 196.0, null],
        lead: [293.66, 349.23, 440.0, 523.25, 440.0, 349.23, 329.63, 293.66]
      },
      epic: {
        bass: [110.0, 110.0, 146.83, 146.83, 164.81, 164.81, 220.0, 196.0],
        lead: [440.0, 554.37, 659.25, 880.0, 659.25, 554.37, 659.25, 880.0]
      }
    };

    const currentPattern = patterns[this.currentMusicTheme] || patterns.gameshow;

    this.musicInterval = setInterval(() => {
      if (!this.isMusicActive || !this.enabled) return;
      try {
        const now = ctx.currentTime;
        const patLen = currentPattern.bass.length;
        const curBassFreq = currentPattern.bass[step % patLen];
        const curLeadFreq = currentPattern.lead[step % currentPattern.lead.length];

        // 1. Bass voice
        if (curBassFreq) {
          const oscB = ctx.createOscillator();
          const gainB = ctx.createGain();
          oscB.type = this.currentMusicTheme === 'arcade' ? 'square' : 'triangle';
          oscB.frequency.setValueAtTime(curBassFreq, now);
          gainB.gain.setValueAtTime(0.08, now);
          gainB.gain.exponentialRampToValueAtTime(0.001, now + stepIntervalMs / 1000 * 0.9);
          oscB.connect(gainB);
          gainB.connect(this.musicVolumeNode!);
          oscB.start(now);
          oscB.stop(now + stepIntervalMs / 1000 * 0.9);
        }

        // 2. Lead voice
        if (curLeadFreq) {
          const oscL = ctx.createOscillator();
          const gainL = ctx.createGain();
          oscL.type = this.currentMusicTheme === 'arcade' ? 'sawtooth' : 'sine';
          oscL.frequency.setValueAtTime(curLeadFreq, now);
          gainL.gain.setValueAtTime(0.05, now);
          gainL.gain.exponentialRampToValueAtTime(0.001, now + stepIntervalMs / 1000 * 0.85);
          oscL.connect(gainL);
          gainL.connect(this.musicVolumeNode!);
          oscL.start(now);
          oscL.stop(now + stepIntervalMs / 1000 * 0.85);
        }

        step++;
      } catch {
        // Safe audio
      }
    }, stepIntervalMs);
  }
}

export const sound = new SoundController();
