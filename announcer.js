// announcer.js
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
    
    // Non-blocking: defer speech to next tick so it never stalls the game loop
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

  letItRip() { this.say("LET IT RIP!", true); }
  intro(enemyCount) { this.say(enemyCount === 1 ? "One opponent enters the steel circle!" : `${enemyCount} enemies challenge you!`, true); }
  bigHit() {
    const lines = ["BOOM! Brutal hit!", "Crushing collision!", "Massive strike!"];
    this.say(lines[Math.floor(Math.random() * lines.length)]);
  }
  playerLow() { this.say("Danger! Your spin power is critical!"); }
  enemyLow() { this.say("The enemy is staggering!"); }
  oneEnemyLeft() { this.say("Final showdown! One enemy remains!"); }
  comeback() { this.say("Unbelievable surge!"); }
  victory() { this.say("VICTORY! YOU DOMINATED THE ARENA!", true); }
  defeat() { this.say("DEFEAT! Break down and rebuild!", true); }
  draw() { this.say("Draw! Mutual destruction!", true); }
}
