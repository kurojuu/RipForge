// ui.js
import { Game } from "./main.js";
import { STARTER_BLADES, PART_SLOTS, getUnlockedParts } from "./blades.js";

export const UI = {
  playerRPMText: null,
  playerBar: null,
  enemyContainer: null,
  messageEl: null,
  endScreenShown: false,

  init(player, enemies) {
    const hud = document.getElementById("hud");
    if (!hud) return;
    hud.innerHTML = `
      <div style="position:absolute;top:20px;left:20px;background:rgba(0,0,0,0.7);padding:15px;border-radius:10px;color:#fff;font-family:sans-serif;min-width:160px;">
        <div style="font-size:12px;font-weight:bold;margin-bottom:5px;letter-spacing:1px;">YOUR HP</div>
        <div style="width:100%;background:#333;height:12px;border-radius:6px;overflow:hidden;margin-bottom:5px;">
          <div id="pBar" style="width:100%;background:#00e676;height:100%;transition:width 0.1s ease;"></div>
        </div>
        <div id="pRPM" style="font-size:16px;font-weight:bold;">0 HP</div>
        <div id="pStats" style="font-size:10px;color:#aaa;margin-top:4px;"></div>
      </div>
      <div id="enemyUi" style="position:absolute;top:20px;right:20px;display:flex;flex-direction:column;gap:10px;background:rgba(0,0,0,0.7);padding:15px;border-radius:10px;color:#fff;font-family:sans-serif;min-width:160px;">
      </div>
    `;

    this.playerRPMText = document.getElementById("pRPM");
    this.playerBar = document.getElementById("pBar");
    this.enemyContainer = document.getElementById("enemyUi");
    this.messageEl = document.getElementById("message");
    this.playerStats = document.getElementById("pStats");

    this.buildEnemyUI(enemies.list);
  },

  buildEnemyUI(enemyList) {
    if (!this.enemyContainer) return;
    this.enemyContainer.innerHTML = "";
    enemyList.forEach((e, idx) => {
      const item = document.createElement("div");
      item.id = `e-box-${idx}`;
      item.innerHTML = `
        <div style="font-size:12px;font-weight:bold;margin-bottom:5px;letter-spacing:1px;">ENEMY ${idx + 1}</div>
        <div style="width:100%;background:#333;height:12px;border-radius:6px;overflow:hidden;margin-bottom:5px;">
          <div id="eBar-${idx}" style="width:100%;background:#ff3d00;height:100%;transition:width 0.1s ease;"></div>
        </div>
        <div id="eRPM-${idx}" style="font-size:14px;font-weight:bold;">0 HP</div>
      `;
      this.enemyContainer.appendChild(item);
    });
  },

  update() {
    if (!Game.player || !this.playerBar || !this.playerRPMText) return;
    
    const pPct = Math.max(0, Game.player.hp / Game.player.maxHp) * 100;
    this.playerBar.style.width = `${pPct}%`;
    this.playerRPMText.innerText = `${Math.floor(Game.player.hp)} / ${Game.player.maxHp} HP`;
    
    // Show stats
    if (this.playerStats && Game.player.stats) {
      const s = Game.player.stats;
      this.playerStats.innerText = `ATT:${s.att} DEF:${s.def} AGI:${s.agi}`;
    }

    if (pPct < 30) this.playerBar.style.background = "#ff3d00";
    else if (pPct < 60) this.playerBar.style.background = "#ffea00";
    else this.playerBar.style.background = "#00e676";

    if (Game.enemies?.list) {
      Game.enemies.list.forEach((e, idx) => {
        const eBar = document.getElementById(`eBar-${idx}`);
        const eRPM = document.getElementById(`eRPM-${idx}`);
        if (eBar && eRPM) {
          const ePct = Math.max(0, e.hp / e.maxHp) * 100;
          eBar.style.width = `${ePct}%`;
          eRPM.innerText = `${Math.floor(e.hp)} HP`;
          if (e.hp <= 0) {
            const box = document.getElementById(`e-box-${idx}`);
            if (box) box.style.opacity = "0.4";
          }
        }
      });
    }
  },

  // Blade Selection Screen
  showBladeSelect(onSelect) {
    if (!this.messageEl) return;
    this.messageEl.style.display = "block";
    this.messageEl.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.92);padding:30px;border-radius:15px;text-align:center;font-family:sans-serif;border:2px solid #00e676;min-width:320px;max-width:90vw;z-index:100000;">
        <h1 style="color:#00e676;font-size:28px;margin:0 0 20px 0;">CHOOSE YOUR BLADE</h1>
        <div id="bladeCards" style="display:flex;flex-direction:column;gap:12px;"></div>
      </div>
    `;

    const container = document.getElementById("bladeCards");
    STARTER_BLADES.forEach(blade => {
      const card = document.createElement("div");
      card.style.cssText = `
        background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);
        border-radius:10px;padding:15px;cursor:pointer;text-align:left;
        transition:all 0.2s;
      `;
      card.innerHTML = `
        <div style="font-size:18px;font-weight:bold;color:#${blade.color.toString(16).padStart(6,'0')};">${blade.name}</div>
        <div style="font-size:11px;color:#aaa;margin:4px 0;">${blade.desc}</div>
        <div style="font-size:12px;color:#fff;">
          ATT: ${blade.baseStats.att} | DEF: ${blade.baseStats.def} | AGI: ${blade.baseStats.agi} | HP: ${blade.baseStats.hp}
        </div>
      `;
      card.onmouseenter = () => card.style.background = "rgba(255,255,255,0.12)";
      card.onmouseleave = () => card.style.background = "rgba(255,255,255,0.05)";
      card.onclick = () => {
        this.messageEl.innerHTML = "";
        this.messageEl.style.display = "none";
        this.endScreenShown = false;
        onSelect(blade);
      };
      container.appendChild(card);
    });
  },

  // Part Customization Screen
  showPartShop(player, battleNumber, onDone) {
    if (!this.messageEl) return;
    const unlocked = getUnlockedParts(battleNumber);
    
    this.messageEl.style.display = "block";
    this.messageEl.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.92);padding:25px;border-radius:15px;text-align:center;font-family:sans-serif;border:2px solid #00a2ff;min-width:340px;max-width:95vw;z-index:100000;max-height:90vh;overflow-y:auto;">
        <h1 style="color:#00a2ff;font-size:24px;margin:0 0 15px 0;">CUSTOMIZE BLADE</h1>
        <div style="font-size:12px;color:#aaa;margin-bottom:15px;">Battle ${battleNumber} — Equip parts to boost stats</div>
        <div id="partSlots" style="display:flex;flex-direction:column;gap:10px;margin-bottom:15px;"></div>
        <div id="partInventory" style="border-top:1px solid rgba(255,255,255,0.2);padding-top:15px;">
          <div style="font-size:14px;font-weight:bold;margin-bottom:10px;">UNLOCKED PARTS</div>
          <div id="partList" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;"></div>
        </div>
        <button id="doneBtn" style="margin-top:15px;padding:12px 30px;font-size:16px;font-weight:bold;background:#00e676;color:#000;border:none;border-radius:8px;cursor:pointer;">DONE</button>
      </div>
    `;

    const renderSlots = () => {
      const slotsDiv = document.getElementById("partSlots");
      slotsDiv.innerHTML = "";
      for (const [slotKey, slotInfo] of Object.entries(PART_SLOTS)) {
        const equipped = player.equippedParts[slotKey];
        const row = document.createElement("div");
        row.style.cssText = "display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.05);padding:10px;border-radius:8px;";
        row.innerHTML = `
          <div style="text-align:left;">
            <div style="font-size:13px;font-weight:bold;">${slotInfo.label}</div>
            <div style="font-size:11px;color:#aaa;">${equipped ? equipped.name + " (+" + equipped.bonus + " " + slotInfo.stat.toUpperCase() + ")" : "Empty"}</div>
          </div>
          ${equipped ? `<button class="unequip-btn" data-slot="${slotKey}" style="padding:4px 12px;font-size:11px;background:#ff3d00;color:#fff;border:none;border-radius:4px;cursor:pointer;">REMOVE</button>` : ""}
        `;
        slotsDiv.appendChild(row);
      }
      
      // Bind unequip buttons
      document.querySelectorAll(".unequip-btn").forEach(btn => {
        btn.onclick = () => {
          player.unequipPart(btn.dataset.slot);
          renderSlots();
          renderInventory();
        };
      });
    };

    const renderInventory = () => {
      const listDiv = document.getElementById("partList");
      listDiv.innerHTML = "";
      unlocked.forEach(part => {
        const isEquipped = Object.values(player.equippedParts).some(p => p && p.id === part.id);
        if (isEquipped) return;
        
        const btn = document.createElement("button");
        btn.style.cssText = "padding:8px 14px;font-size:12px;background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:6px;cursor:pointer;";
        btn.innerText = `${part.name}\n+${part.bonus} ${PART_SLOTS[part.slot].stat.toUpperCase()}`;
        btn.onclick = () => {
          // Unequip current part in that slot first
          player.equipPart(part);
          renderSlots();
          renderInventory();
        };
        listDiv.appendChild(btn);
      });
      
      if (listDiv.innerHTML === "") {
        listDiv.innerHTML = "<div style='color:#666;font-size:12px;'>All parts equipped</div>";
      }
    };

    renderSlots();
    renderInventory();

    document.getElementById("doneBtn").onclick = () => {
      this.messageEl.innerHTML = "";
      this.messageEl.style.display = "none";
      this.endScreenShown = false;
      onDone();
    };
  },

  showEndScreen(text, isVictory, battleNumber, newParts = []) {
    if (this.endScreenShown) return;
    this.endScreenShown = true;

    if (!this.messageEl) return;
    this.messageEl.style.display = "block";
    this.messageEl.className = "";

    const btnText = isVictory ? "NEXT BATTLE" : "REMATCH?";
    const btnColor = isVictory ? "#00e676" : "#ff3d00";
    const borderColor = isVictory ? "#00e676" : "#ff3d00";

    let partsHtml = "";
    if (isVictory && newParts.length > 0) {
      partsHtml = `
        <div style="margin:15px 0;padding:10px;background:rgba(0,162,255,0.15);border-radius:8px;">
          <div style="font-size:14px;color:#00a2ff;font-weight:bold;margin-bottom:8px;">NEW PARTS UNLOCKED!</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;">
            ${newParts.map(p => `<span style="font-size:11px;padding:4px 10px;background:rgba(0,0,0,0.4);border-radius:4px;">${p.name}</span>`).join("")}
          </div>
        </div>
      `;
    }

    this.messageEl.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);padding:35px;border-radius:15px;text-align:center;font-family:sans-serif;border:2px solid ${borderColor};box-shadow:0 0 20px rgba(0,0,0,0.5);min-width:300px;z-index:100000;">
        <h1 style="color:${borderColor};font-size:38px;margin:0 0 10px 0;letter-spacing:2px;text-transform:uppercase;">${text}</h1>
        <p style="color:#aaa;font-size:14px;margin:0 0 20px 0;">Battle ${battleNumber} Complete</p>
        ${partsHtml}
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button id="actionBtn" style="padding:14px 36px;font-size:18px;font-weight:bold;background:${btnColor};color:#000;border:none;border-radius:8px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">
            ${btnText}
          </button>
          ${isVictory ? `<button id="customizeBtn" style="padding:10px 24px;font-size:14px;font-weight:bold;background:#00a2ff;color:#fff;border:none;border-radius:8px;cursor:pointer;">CUSTOMIZE BLADE</button>` : ""}
        </div>
      </div>
    `;

    document.getElementById("actionBtn").onclick = () => {
      this.messageEl.innerHTML = "";
      if (window.Game) {
        if (isVictory) {
          window.Game.nextBattle();
        } else {
          window.Game.rematch();
        }
      }
    };

    if (isVictory) {
      document.getElementById("customizeBtn").onclick = () => {
        this.showPartShop(window.Game.player, battleNumber, () => {
          // Return to end screen after customizing
          this.endScreenShown = false;
          this.showEndScreen(text, isVictory, battleNumber, []);
        });
      };
    }
  }
};
