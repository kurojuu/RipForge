// audio.js
// NEW FILE
// Dynamic Beyblade audio manager.

export class AudioManager{

  constructor(){

    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this.master = this.ctx.createGain();
    this.master.gain.value = .18;
    this.master.connect(this.ctx.destination);

    this.spinOsc = null;
    this.spinGain = null;

    this.started = false;

  }

  resume(){

    if(this.started) return;

    this.started = true;

    this.ctx.resume();

    this.spinOsc = this.ctx.createOscillator();
    this.spinGain = this.ctx.createGain();

    this.spinOsc.type = "sawtooth";
    this.spinOsc.frequency.value = 180;

    this.spinGain.gain.value = .02;

    this.spinOsc.connect(this.spinGain);
    this.spinGain.connect(this.master);

    this.spinOsc.start();

  }

  update(player){

    if(!this.spinOsc) return;

    const rpm = Math.max(0, player.rpm);

    const t = rpm / player.maxRPM;

    const nextTime = this.ctx.currentTime + .03;

    this.spinOsc.frequency.linearRampToValueAtTime(
      120 + t * 520,
      nextTime
    );

    this.spinGain.gain.linearRampToValueAtTime(
      0.01 + t * .06,
      nextTime
    );

  }

  collision(power){
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";

    osc.frequency.value = 300 + Math.random() * 500 + power * 35;

    gain.gain.value = Math.min(.18, .03 + power * .01);

    osc.connect(gain);
    gain.connect(this.master);

    osc.start();

    const stopTime = this.ctx.currentTime + .18;
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      stopTime
    );

    osc.stop(stopTime);
  }

  wallHit(){
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.value = 160;

    gain.gain.value = .08;

    osc.connect(gain);
    gain.connect(this.master);

    osc.start();

    const stopTime = this.ctx.currentTime + .22;
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      stopTime
    );

    osc.stop(stopTime);
  }

  stop(){
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.value = 420;

    gain.gain.value = .12;

    osc.connect(gain);
    gain.connect(this.master);

    osc.start();

    const stopTime = this.ctx.currentTime + .9;
    osc.frequency.exponentialRampToValueAtTime(
      40,
      stopTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      stopTime
    );

    osc.stop(stopTime);
  }

  victory(){
    const notes = [660, 880, 990];

    notes.forEach((f, i) => {

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.value = f;

      gain.gain.value = .08;

      osc.connect(gain);
      gain.connect(this.master);

      const startTime = this.ctx.currentTime + i * .12;
      osc.start(startTime);

      const stopTime = startTime + .35;
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        stopTime
      );

      osc.stop(stopTime);

    });

  }

  defeat(){
    const notes = [320, 220, 140];

    notes.forEach((f, i) => {

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.value = f;

      gain.gain.value = .08;

      osc.connect(gain);
      gain.connect(this.master);

      const startTime = this.ctx.currentTime + i * .15;
      osc.start(startTime);

      const stopTime = startTime + .4;
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        stopTime
      );

      osc.stop(stopTime);

    });

  }

}