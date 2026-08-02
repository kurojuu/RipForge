// ui.js
import { Game } from "./main.js";
import { STARTER_BLADES, PART_SLOTS, calculateStats } from "./blades.js";

export const UI = {
  playerRPMText: null,
  playerBar: null,
  enemyContainer: null,
  messageEl: null,
  endScreenShown: false,

  _getMessageEl() {
    return this.messageEl || document.getElementById("message");
  },

  init(player, enemies) {
    const hud = document.getElementById("hud");
    if (!hud) {
      console.error("[UI] hud element not found!");
      return;
    }
    
    hud.innerHTML = `
      <div style="position:absolute;top:20px;left:20px;background:rgba(0,0,0,0.7);padding:15px;border-radius:10px;color:#fff;font-family:sans-serif;min-width:160px;">
        <div style="font-size:12px;font-weight:bold;margin-bottom:5px;letter-spacing:1px;">YOUR HP</div>
        <div style="width:100%;background:#333;height:12px;border-radius:6px;overflow:hidden;margin-bottom:5px;">
          <div id="pBar" style="width:100%;background:#00e676;height:100%;transition:width 0.1s ease;"></div>
        </div>
        <div id="pRPM" style="font-size:16px;font-weight:bold;">0 / 0 HP</div>
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

    if (!this.messageEl) {
      console.error("[UI] message element not found!");
    }

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
        <div id="eRPM-${idx}" style="font-size:14px;font-weight:bold;">0 / 0 HP</div>
      `;
      this.enemyContainer.appendChild(item);
    });
  },

  update() {
    if (!Game.player || !this.playerBar || !this.playerRPMText) return;
    
    const pPct = Math.max(0, Game.player.hp / Game.player.maxHp) * 100;
    this.playerBar.style.width = `${pPct}%`;
    this.playerRPMText.innerText = `${Math.floor(Game.player.hp)} / ${Game.player.maxHp} HP`;
    
    if (this.playerStats && Game.player.stats) {
      const s = Game.player.stats;
      this.playerStats.innerText = `ATT:${s.att} DEF:${s.def} AGI:${s.agi} HP:${s.hp}`;
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
          eRPM.innerText = `${Math.floor(e.hp)} / ${e.maxHp} HP`;
          if (e.hp <= 0) {
            const box = document.getElementById(`e-box-${idx}`);
            if (box) box.style.opacity = "0.4";
          }
        }
      });
    }
  },

  showBladeSelect(onSelect) {
    const msg = this._getMessageEl();
    if (!msg) {
      console.error("[UI] Cannot show blade select — no message element");
      return;
    }
    msg.style.display = "block";
    msg.innerHTML = `
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
      const hexColor = "#" + blade.color.toString(16).padStart(6, '0');
      card.innerHTML = `
        <div style="font-size:18px;font-weight:bold;color:${hexColor};">${blade.name}</div>
        <div style="font-size:11px;color:#aaa;margin:4px 0;">${blade.desc}</div>
        <div style="font-size:12px;color:#fff;">
          ATT: ${blade.baseStats.att} | DEF: ${blade.baseStats.def} | AGI: ${blade.baseStats.agi} | HP: ${blade.baseStats.hp}
        </div>
      `;
      card.onmouseenter = () => card.style.background = "rgba(255,255,255,0.12)";
      card.onmouseleave = () => card.style.background = "rgba(255,255,255,0.05)";
      card.onclick = () => {
        msg.innerHTML = "";
        msg.style.display = "none";
        this.endScreenShown = false;
        onSelect(blade);
      };
      container.appendChild(card);
    });
  },

  showRewardChoice(choices, tier, onDone) {
    const msg = this._getMessageEl();
    if (!msg) { onDone(); return; }
    msg.style.display = "block";
    msg.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.92);padding:30px;border-radius:15px;text-align:center;font-family:sans-serif;border:2px solid #ffd600;min-width:340px;max-width:95vw;z-index:100000;">
        <h1 style="color:#ffd600;font-size:26px;margin:0 0 10px 0;">VICTORY REWARD</h1>
        <p style="color:#aaa;font-size:13px;margin:0 0 20px 0;">Choose one part to add to your workshop</p>
        <div id="rewardCards" style="display:flex;flex-direction:column;gap:12px;"></div>
      </div>
    `;
    
    const container = document.getElementById("rewardCards");
    choices.forEach(part => {
      const slotInfo = PART_SLOTS[part.slot];
      const card = document.createElement("div");
      card.style.cssText = "background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.2);border-radius:10px;padding:15px;cursor:pointer;text-align:left;transition:all 0.2s;display:flex;align-items:center;gap:15px;";
      
      const hexColor = "#" + part.color.toString(16).padStart(6, '0');
      
      card.innerHTML = `
        <div style="width:50px;height:50px;border-radius:50%;background:${hexColor};border:2px solid rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;font-size:20px;">${slotInfo.icon}</div>
        <div style="flex:1;">
          <div style="font-size:16px;font-weight:bold;color:#fff;">${part.name}</div>
          <div style="font-size:11px;color:#aaa;">${slotInfo.label} — Tier ${part.tier}</div>
          <div style="font-size:13px;color:#00e676;margin-top:4px;">+${part.bonus} ${slotInfo.stat.toUpperCase()}</div>
        </div>
      `;
      card.onmouseenter = () => card.style.background = "rgba(255,255,255,0.12)";
      card.onmouseleave = () => card.style.background = "rgba(255,255,255,0.05)";
      card.onclick = () => {
        if (window.Game?.player) {
          window.Game.player.addToInventory(part);
        }
        msg.innerHTML = "";
        msg.style.display = "none";
        onDone();
      };
      container.appendChild(card);
    });
  },

  showPartShop(player, battleNumber, onDone) {
    const msg = this._getMessageEl();
    if (!msg) return;
    
    msg.style.display = "block";
    msg.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);padding:20px;border-radius:15px;text-align:center;font-family:sans-serif;border:2px solid #00a2ff;min-width:360px;max-width:98vw;z-index:100000;max-height:95vh;overflow-y:auto;">
        <h1 style="color:#00a2ff;font-size:22px;margin:0 0 10px 0;">WORKSHOP</h1>
        
        <div id="totalStats" style="background:rgba(0,162,255,0.1);border-radius:8px;padding:10px;margin-bottom:15px;font-size:13px;color:#fff;"></div>
        
        <div style="font-size:14px;font-weight:bold;margin-bottom:8px;color:#aaa;">EQUIPPED</div>
        <div id="equipSlots" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:15px;"></div>
        
        <div style="font-size:14px;font-weight:bold;margin-bottom:8px;color:#aaa;">INVENTORY (${player.inventory.length})</div>
        <div id="inventoryGrid" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;min-height:60px;padding:10px;background:rgba(255,255,255,0.03);border-radius:8px;border:1px dashed rgba(255,255,255,0.2);margin-bottom:15px;"></div>
        
        <button id="doneBtn" style="padding:12px 30px;font-size:16px;font-weight:bold;background:#00e676;color:#000;border:none;border-radius:8px;cursor:pointer;">DONE</button>
      </div>
    `;

    const renderStats = () => {
      const stats = calculateStats(player.blade, player.equippedParts);
      const div = document.getElementById("totalStats");
      if (!div) return;
      div.innerHTML = `
        <span style="color:#ff4444;">ATT: ${stats.att}</span> &nbsp;|&nbsp;
        <span style="color:#44ff44;">DEF: ${stats.def}</span> &nbsp;|&nbsp;
        <span style="color:#4488ff;">AGI: ${stats.agi}</span> &nbsp;|&nbsp;
        <span style="color:#ffaa00;">HP: ${stats.hp}</span>
      `;
    };

    const createPartEl = (part, draggable = true) => {
      const slotInfo = PART_SLOTS[part.slot];
      const hexColor = "#" + part.color.toString(16).padStart(6, '0');
      const el = document.createElement("div");
      el.draggable = draggable;
      el.dataset.partId = part.id;
      el.style.cssText = `
        width: 70px; height: 70px; border-radius: 10px;
        background: ${hexColor}22; border: 2px solid ${hexColor}88;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        cursor: ${draggable ? 'grab' : 'default'}; font-size: 11px; color: #fff;
        transition: all 0.15s; user-select: none; position: relative;
      `;
      el.innerHTML = `
        <div style="font-size:18px;">${slotInfo.icon}</div>
        <div style="font-size:9px;max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${part.name}</div>
        <div style="font-size:10px;color:#00e676;">+${part.bonus}</div>
      `;
      
      if (draggable) {
        el.ondragstart = (e) => {
          e.dataTransfer.setData("partId", part.id);
          e.dataTransfer.effectAllowed = "move";
          el.style.opacity = "0.5";
        };
        el.ondragend = () => { el.style.opacity = "1"; };
      }
      return el;
    };

    const renderEquipped = () => {
      const container = document.getElementById("equipSlots");
      container.innerHTML = "";
      for (const [slotKey, slotInfo] of Object.entries(PART_SLOTS)) {
        const equipped = player.equippedParts[slotKey];
        const slotEl = document.createElement("div");
        slotEl.dataset.slot = slotKey;
        slotEl.style.cssText = `
          width: 80px; height: 80px; border-radius: 10px;
          background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.3);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          transition: all 0.2s;
        `;
        
        slotEl.ondragover = (e) => { e.preventDefault(); slotEl.style.borderColor = "#00e676"; slotEl.style.background = "rgba(0,230,118,0.1)"; };
        slotEl.ondragleave = () => { slotEl.style.borderColor = "rgba(255,255,255,0.3)"; slotEl.style.background = "rgba(255,255,255,0.05)"; };
        slotEl.ondrop = (e) => {
          e.preventDefault();
          slotEl.style.borderColor = "rgba(255,255,255,0.3)";
          slotEl.style.background = "rgba(255,255,255,0.05)";
          const partId = e.dataTransfer.getData("partId");
          const part = player.inventory.find(p => p.id === partId);
          if (part && part.slot === slotKey) {
            player.equipPart(part);
            renderAll();
          }
        };
        
        if (equipped) {
          slotEl.style.border = "2px solid #" + equipped.color.toString(16).padStart(6,'0') + "88";
          slotEl.innerHTML = `
            <div style="font-size:20px;">${slotInfo.icon}</div>
            <div style="font-size:9px;max-width:70px;overflow:hidden;text-overflow:ellipsis;">${equipped.name}</div>
            <div style="font-size:10px;color:#00e676;">+${equipped.bonus}</div>
          `;
          slotEl.onclick = () => {
            player.unequipPart(slotKey);
            renderAll();
          };
        } else {
          slotEl.innerHTML = `<div style="font-size:24px;color:#555;">${slotInfo.icon}</div><div style="font-size:9px;color:#666;">${slotInfo.label}</div>`;
        }
        
        container.appendChild(slotEl);
      }
    };

    const renderInventory = () => {
      const container = document.getElementById("inventoryGrid");
      container.innerHTML = "";
      if (player.inventory.length === 0) {
        container.innerHTML = "<div style='color:#555;font-size:12px;'>No parts in inventory</div>";
        return;
      }
      player.inventory.forEach(part => {
        container.appendChild(createPartEl(part, true));
      });
    };

    const renderAll = () => {
      renderStats();
      renderEquipped();
      renderInventory();
    };

    renderAll();

    document.getElementById("doneBtn").onclick = () => {
      msg.innerHTML = "";
      msg.style.display = "none";
      this.endScreenShown = false;
      onDone();
    };
  },

  showEndScreen(text, isVictory, battleNumber, newParts = [], isNewTier = false) {
    if (this.endScreenShown) return;
    this.endScreenShown = true;

    const msg = this._getMessageEl();
    if (!msg) return;
    msg.style.display = "block";
    msg.className = "";

    const btnText = isVictory ? "NEXT BATTLE" : "REMATCH?";
    const btnColor = isVictory ? "#00e676" : "#ff3d00";
    const borderColor = isVictory ? "#00e676" : "#ff3d00";

    let tierHtml = "";
    if (isVictory && isNewTier) {
      tierHtml = `<div style="margin:10px 0;padding:8px;background:rgba(255,214,0,0.15);border-radius:6px;color:#ffd600;font-size:13px;">New part tier unlocked!</div>`;
    }

    msg.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);padding:35px;border-radius:15px;text-align:center;font-family:sans-serif;border:2px solid ${borderColor};box-shadow:0 0 20px rgba(0,0,0,0.5);min-width:300px;z-index:100000;">
        <h1 style="color:${borderColor};font-size:38px;margin:0 0 10px 0;letter-spacing:2px;text-transform:uppercase;">${text}</h1>
        <p style="color:#aaa;font-size:14px;margin:0 0 15px 0;">Battle ${battleNumber} Complete</p>
        ${tierHtml}
        <div style="display:flex;flex-direction:column;gap:10px;">
          <button id="actionBtn" style="padding:14px 36px;font-size:18px;font-weight:bold;background:${btnColor};color:#000;border:none;border-radius:8px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 10px rgba(0,0,0,0.3);">${btnText}</button>
          ${isVictory ? `<button id="customizeBtn" style="padding:10px 24px;font-size:14px;font-weight:bold;background:#00a2ff;color:#fff;border:none;border-radius:8px;cursor:pointer;">WORKSHOP</button>` : ""}
        </div>
      </div>
    `;

    document.getElementById("actionBtn").onclick = () => {
      msg.innerHTML = "";
      if (window.Game) {
        if (isVictory) window.Game.nextBattle();
        else window.Game.rematch();
      }
    };

    if (isVictory) {
      document.getElementById("customizeBtn").onclick = () => {
        this.showPartShop(window.Game.player, battleNumber, () => {
          this.endScreenShown = false;
          this.showEndScreen(text, isVictory, battleNumber, [], false);
        });
      };
    }
  }
};
