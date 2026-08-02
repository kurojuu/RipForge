// sfx.js
export class SFX {
  constructor() {
    this.ctx = null;
    this.masterVolume = null;
    
    // Asset storage
    this.grindBuffer = null;
    this.bgmBuffers = [];
    
    this.grindSource = null;
    this.grindGain = null;
    this.bgmSource = null;
    this.bgmGain = null;
    
    this.isGrinding = false;
    this.initialized = false;
    this.currentBgmIndex = 0;
  }

  async start() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.masterVolume.connect(this.ctx.destination);

    // Load everything from root as you defined
    const paths = ['./grind_sfx.mp3', './bgm1.mp3', './bgm2.mp3', './bgm3.mp3'];
    const buffers = await Promise.all(paths.map(path => 
      fetch(path).then(res => res.arrayBuffer()).then(data => this.ctx.decodeAudioData(data))
    ));

    this.grindBuffer = buffers[0];
    this.bgmBuffers = [buffers[1], buffers[2], buffers[3]];
    this.initialized = true;

    // Start BGM immediately
    this.playBGM();
  }

  playBGM() {
    if (!this.initialized || this.bgmBuffers.length === 0) return;
    if (this.bgmSource) try { this.bgmSource.stop(); } catch (e) {}

    this.bgmSource = this.ctx.createBufferSource();
    this.bgmSource.buffer = this.bgmBuffers[this.currentBgmIndex];
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    this.bgmSource.connect(this.bgmGain);
    this.bgmGain.connect(this.masterVolume);
    this.bgmSource.start(0);

    this.bgmSource.onended = () => {
      this.currentBgmIndex = (this.currentBgmIndex + 1) % this.bgmBuffers.length;
      this.playBGM();
    };
  }

  startGrind() {
    if (this.isGrinding || !this.grindBuffer) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.isGrinding = true;
    this.grindSource = this.ctx.createBufferSource();
    this.grindSource.buffer = this.grindBuffer;
    this.grindSource.loop = true;
    this.grindGain = this.ctx.createGain();
    this.grindGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

    this.grindSource.connect(this.grindGain);
    this.grindGain.connect(this.masterVolume);
    this.grindSource.start(0);
  }

  stopGrind() {
    if (!this.isGrinding) return;
    this.isGrinding = false;
    if (this.grindSource) {
      try { this.grindSource.stop(); } catch (e) {}
      this.grindSource = null;
    }
  }

  playHit(isWall = false) {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.grindBuffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.grindBuffer;
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, this.ctx.currentTime);
    source.connect(gainNode);
    gainNode.connect(this.masterVolume);
    source.start(0);
  }
}
