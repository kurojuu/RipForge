// gamestate.js
import { UI } from "./ui.js";

export class GameState {
  constructor(player, enemies, effects, audio, announcer) {
    this.player = player;
    this.enemies = enemies;
    this.effects = effects;
    this.audio = audio;
    this.announcer = announcer;
    
    this.current = "launch";
    this.finished = false;

    try {
      if (this.announcer) {
        this.announcer.intro(this.enemies?.list?.length || 0);
      }
    } catch (e) {
      console.warn("Announcer intro failed:", e);
    }
  }

  start() {
    this.current = "battle";
    try {
      if (this.announcer) this.announcer.letItRip();
    } catch (e) {
      console.warn("Announcer letItRip failed:", e);
    }
  }

  isFinished() {
    return this.finished;
  }

  cleanup() {
    try { this.audio?.stopMotor?.(); } catch (e) {}
    // REMOVED: effects.hideMessage() — it hides the #message element that UI.showEndScreen needs
    if (this.player) this.player.rpm = 0;
  }

  forceDefeat() {
    console.error("[GameState] forceDefeat() called");
    this.cleanup();
    this.finished = true;
    this.current = "defeat";
    
    try {
      if (this.announcer) this.announcer.defeat();
    } catch (e) {}
    
    try {
      UI.showEndScreen("DEFEAT", false);
    } catch (e) {
      console.error("[GameState] UI.showEndScreen failed:", e);
    }
  }

  update() {
    if (this.current !== "battle" || this.finished) return;

    if (this.player.rpm <= 1) {
      console.log("[GameState] DEFEAT detected — player.rpm:", this.player.rpm);
      this.forceDefeat();
      return;
    }

    let activeEnemies = 0;
    if (this.enemies?.list) {
      for (const e of this.enemies.list) {
        if (e.rpm > 1) activeEnemies++;
      }
    }

    if (activeEnemies === 0) {
      console.log("[GameState] VICTORY detected");
      this.cleanup();
      this.finished = true;
      this.current = "victory";
      
      try {
        if (this.announcer) this.announcer.victory();
      } catch (e) {}
      
      try {
        UI.showEndScreen("VICTORY", true);
      } catch (e) {
        console.error("[GameState] UI.showEndScreen failed:", e);
      }
    }
  }
}