
class AudioManager {
  private ctx: AudioContext | null = null;
  private bgGain: GainNode | null = null;
  private isMusicPlaying = false;
  private sequenceInterval: number | null = null;
  private currentStep = 0;
  
  // A simple cheerful pentatonic melody sequence
  private melody = [261.63, 329.63, 392.00, 440.00, 392.00, 329.63]; // C4, E4, G4, A4, G4, E4

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.bgGain = this.ctx.createGain();
      this.bgGain.connect(this.ctx.destination);
      this.bgGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public toggleBackgroundMusic(enabled: boolean) {
    this.init();
    if (!this.ctx || !this.bgGain) return;

    if (enabled && !this.isMusicPlaying) {
      this.isMusicPlaying = true;
      this.bgGain.gain.setTargetAtTime(0.03, this.ctx.currentTime, 0.5);
      this.startMelodyLoop();
    } else if (!enabled && this.isMusicPlaying) {
      this.isMusicPlaying = false;
      this.bgGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
      this.stopMelodyLoop();
    }
  }

  private startMelodyLoop() {
    if (this.sequenceInterval) return;
    
    const playStep = () => {
      if (!this.ctx || !this.bgGain || !this.isMusicPlaying) return;
      
      const osc = this.ctx.createOscillator();
      const stepGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(this.melody[this.currentStep], this.ctx.currentTime);
      
      stepGain.gain.setValueAtTime(0, this.ctx.currentTime);
      stepGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
      stepGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      
      osc.connect(stepGain);
      stepGain.connect(this.bgGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
      
      this.currentStep = (this.currentStep + 1) % this.melody.length;
    };

    this.sequenceInterval = window.setInterval(playStep, 600);
    playStep();
  }

  private stopMelodyLoop() {
    if (this.sequenceInterval) {
      clearInterval(this.sequenceInterval);
      this.sequenceInterval = null;
    }
  }

  public playSuccess() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playFail() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  public playClick() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playClear() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playSubmit() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playCountdownBeep(isLast: boolean = false) {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isLast ? 1200 : 800, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

export const audioManager = new AudioManager();
