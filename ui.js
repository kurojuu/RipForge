// ui.js
import { Game } from "./main.js";

export const UI = {
  playerRPMText: null,
  playerBar: null,
  enemyContainer: null,
  messageEl: null,
  endScreenShown: false,

  init(player, enemies) {
    const hud = document.getElementById("hud");
    if (!hud) {
      console.error("[UI] hud element not found!");
      return;
    }
    
    hud.innerHTML = `
      <div style="position:absolute;top:20px;left:20px;background:rgba(0,0,0,0.7);padding:15px;border-radius:10px;color:#fff;font-family:sans-serif;min-width:160px;">
        <div style="font-size:12px;font-weight:bold;margin-bottom:5px;letter-spacing:1px;">YOUR RPM</div>
        <div style="width:100%;background:#333;height:12px;border-radius:6px;overflow:hidden;margin-bottom:5px;">
          <div id="pBar" style="width:100%;background:#00e676;height:100%;transition:width 0.1s ease;"></div>
        </div>
        <div id="pRPM" style="font-size:16px;font-weight:bold;">0 RPM</div>
      </div>
      <div id="enemyUi" style="position:absolute;top:20px;right:20px;display:flex;flex-direction:column;gap:10px;background:rgba(0,0,0,0.7);padding:15px;border-radius:10px;color:#fff;font-family:sans-serif;min-width:160px;">
      </div>
    `;

    this.playerRPMText = document.getElementById("pRPM");
    this.playerBar = document.getElementById("pBar");
    this.enemyContainer = document.getElementById("enemyUi");
    this.messageEl = document.getElementById("message");

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
        <div id="eRPM-${idx}" style="font-size:14px;font-weight:bold;">0 RPM</div>
      `;
      this.enemyContainer.appendChild(item);
    });
  },

  update() {
    if (!Game.player || !this.playerBar || !this.playerRPMText) return;
    
    const pPct = Math.max(0, Game.player.rpm / Game.player.maxRPM) * 100;
    this.playerBar.style.width = `${pPct}%`;
    this.playerRPMText.innerText = `${Math.floor(Game.player.rpm)} RPM`;

    if (pPct < 30) {
      this.playerBar.style.background = "#ff3d00";
    } else if (pPct < 60) {
      this.playerBar.style.background = "#ffea00";
    } else {
      this.playerBar.style.background = "#00e676";
    }

    if (Game.enemies?.list) {
      Game.enemies.list.forEach((e, idx) => {
        const eBar = document.getElementById(`eBar-${idx}`);
        const eRPM = document.getElementById(`eRPM-${idx}`);
        if (eBar && eRPM) {
          const ePct = Math.max(0, e.rpm / e.maxRPM) * 100;
          eBar.style.width = `${ePct}%`;
          eRPM.innerText = `${Math.floor(e.rpm)} RPM`;
          if (e.rpm <= 0) {
            const box = document.getElementById(`e-box-${idx}`);
            if (box) box.style.opacity = "0.4";
          }
        }
      });
    }
  },

  showEndScreen(text, isVictory) {
    console.log("[UI] showEndScreen called:", text, isVictory);
    
    if (this.endScreenShown) {
      console.log("[UI] end screen already shown, skipping");
      return;
    }
    this.endScreenShown = true;

    if (!this.messageEl) {
      console.error("[UI] Cannot show end screen — messageEl is null");
      return;
    }

    // CRITICAL FIX: effects.hideMessage() may have set display:none.
    // Force the container visible before injecting HTML.
    this.messageEl.style.display = "block";
    this.messageEl.className = "";

    this.messageEl.innerHTML = `
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.9);padding:40px;border-radius:15px;text-align:center;font-family:sans-serif;border:2px solid ${isVictory ? '#00e676' : '#ff3d00'};box-shadow:0 0 20px rgba(0,0,0,0.5);min-width:280px;z-index:100000;">
        <h1 style="color:${isVictory ? '#00e676' : '#ff3d00'};font-size:38px;margin:0 0 10px 0;letter-spacing:2px;text-transform:uppercase;">${text}</h1>
        <p style="color:#aaa;font-size:14px;margin:0 0 25px 0;">Battle Finished</p>
        <button id="retryBtn" style="padding:14px 36px;font-size:18px;font-weight:bold;background:${isVictory ? '#00e676' : '#ff3d00'};color:#000;border:none;border-radius:8px;cursor:pointer;text-transform:uppercase;letter-spacing:1px;box-shadow:0 4px 10px rgba(0,0,0,0.3);transition:transform 0.1s;">
          Retry Battle
        </button>
      </div>
    `;

    const retryBtn = document.getElementById("retryBtn");
    if (retryBtn) {
      retryBtn.onclick = () => {
        this.messageEl.innerHTML = "";
        location.reload();
      };
    }
    
    console.log("[UI] End screen rendered successfully");
  }
};