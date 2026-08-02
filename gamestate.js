// gamestate.js
import { UI } from "./ui.js";
import { getPartsByTier } from "./blades.js";

export class GameState {
  constructor(player, enemies, effects, audio, announcer) {
    this.player = player;
    this.enemies = enemies;
    this.effects = effects;
    this.audio = audio;
    this.announcer = announcer;
    this.current = "launch";
    this.finished = false;
    this.battleNumber = 1;
    this.unlockedTiers = new Set();
    
    try {
      if (this.announcer) this.announcer.intro(this.enemies?.list?.length || 0);
    } catch (e) {}
  }

  setBattleNumber(n) {
    this.battleNumber = n;
  }

  start() {
    this.current = "battle";
    try {
      if (this.announcer) this.announcer.letItRip();
    } catch (e) {}
  }

  isFinished() {
    return this.finished;
  }

  cleanup() {
    try { this.audio?.stopMotor?.(); } catch (e) {}
    if (this.player) this.player.rpm = 0;
  }

  forceDefeat() {
    this.cleanup();
    this.finished = true;
    this.current = "defeat";
    try { if (this.announcer) this.announcer.defeat(); } catch (e) {}
    UI.showEndScreen("DEFEAT", false, this.battleNumber);
  }

  update() {
    if (this.current !== "battle" || this.finished) return;

    if (this.player.hp <= 0) {
      this.forceDefeat();
      return;
    }

    let activeEnemies = 0;
    if (this.enemies?.list) {
      for (const e of this.enemies.list) {
        if (e.hp > 0) activeEnemies++;
      }
    }

    if (activeEnemies === 0) {
      this.cleanup();
      this.finished = true;
      this.current = "victory";
      
      let rewardTier = 1;
      if (this.battleNumber >= 5) rewardTier = 3;
      else if (this.battleNumber >= 3) rewardTier = 2;
      
      const isNewTier = !this.unlockedTiers.has(rewardTier);
      this.unlockedTiers.add(rewardTier);
      
      const availableRewards = getPartsByTier(rewardTier);
      const shuffled = [...availableRewards].sort(() => Math.random() - 0.5);
      const choices = shuffled.slice(0, 3);
      
      try { if (this.announcer) this.announcer.victory(); } catch (e) {}
      UI.showRewardChoice(choices, rewardTier, () => {
        UI.showEndScreen("VICTORY", true, this.battleNumber, [], isNewTier);
      });
    }
  }
}
