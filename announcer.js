// announcer.js
import { ANNOUNCER_LINES, randomLine } from "./constants.js";

export class Announcer {
  constructor() {
    this.synth = typeof window !== 'undefined' && window.speechSynthesis;
    this.enabled = !!this.synth;
    this.lastLine = 0;
    this.voice = null;

    if (this.enabled) {
      try {
        this.synth.onvoiceschanged = () => { this.pickVoice(); };
        this.pickVoice();
      } catch (e) {
        this.enabled = false;
      }
    }
  }

  pickVoice() {
    if (!this.enabled || !this.synth) return;
    try {
      const voices = this.synth.getVoices();
      const preferred = [
        "Google US English Male",
        "Microsoft David",
        "en-US-Standard-B", 
        "en-GB-Standard-B",
        "Google US English",
        "Male"
      ];
      for (const p of preferred) {
        const v = voices.find(x => x.name.includes(p) || (x.name.includes("Male") && x.lang.startsWith("en")));
        if (v) {
          this.voice = v;
          return;
        }
      }
      this.voice = voices.find(v => v.lang.startsWith("en")) || null;
    } catch (e) {
      this.enabled = false;
    }
  }

  say(text, priority = false) {
    if (!this.enabled || !this.synth) return;
    const now = performance.now();
    if (!priority && now - this.lastLine < 3000) return;
    this.lastLine = now;
    
    setTimeout(() => {
      try {
        this.synth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (this.voice) u.voice = this.voice;
        u.pitch = 0.78; 
        u.rate = 1.05;
        u.volume = 1.0;
        this.synth.speak(u);
      } catch (e) {
        console.error("Speech error:", e);
      }
    }, 0);
  }

  letItRip() { this.say(randomLine(ANNOUNCER_LINES.LET_IT_RIP), true); }
  intro(enemyCount) { 
    this.say(enemyCount === 1 ? "One opponent enters the steel circle!" : `${enemyCount} enemies challenge you!`, true); 
  }
  bigHit() { this.say(randomLine(ANNOUNCER_LINES.BIG_HIT)); }
  playerLow() { this.say(randomLine(ANNOUNCER_LINES.LOW_PLAYER)); }
  enemyLow() { this.say(randomLine(ANNOUNCER_LINES.LOW_ENEMY)); }
  oneEnemyLeft() { this.say(randomLine(ANNOUNCER_LINES.ONE_LEFT)); }
  comeback() { this.say(randomLine(ANNOUNCER_LINES.COMEBACK)); }
  victory() { this.say(randomLine(ANNOUNCER_LINES.VICTORY), true); }
  defeat() { this.say(randomLine(ANNOUNCER_LINES.DEFEAT), true); }
  draw() { this.say("Draw! Mutual destruction!", true); }
}
