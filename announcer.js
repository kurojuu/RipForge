// announcer.js
export class Announcer {
  constructor() {
    this.synth = typeof window !== 'undefined' && window.speechSynthesis;
    this.enabled = false; // DISABLED FOR TESTING
    this.lastLine = 0;
    this.voice = null;
    console.log("[Announcer] Speech synthesis disabled for performance test");
  }

  pickVoice() {}
  
  say(text, priority = false) {
    // Log to console only — no speech synthesis
    console.log("[Announcer]", text);
  }

  letItRip() { this.say("LET IT RIP!", true); }
  intro(enemyCount) { this.say(enemyCount === 1 ? "One opponent enters!" : `${enemyCount} enemies!`, true); }
  bigHit() { this.say("BOOM!"); }
  playerLow() { this.say("Danger! Low spin!"); }
  enemyLow() { this.say("Enemy staggering!"); }
  oneEnemyLeft() { this.say("Final showdown!"); }
  comeback() { this.say("Unbelievable surge!"); }
  victory() { this.say("VICTORY!", true); }
  defeat() { this.say("DEFEAT!", true); }
  draw() { this.say("Draw!", true); }
}