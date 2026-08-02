// blade_select.js
import { STARTER_BLADES } from "./blade.js";
import { STAT_NAMES } from "./parts.js";

export class BladeSelect {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.container = null;
    this._build();
  }
  
  _build() {
    this.container = document.createElement("div");
    this.container.id = "bladeSelect";
    this.container.style.cssText = `
      position: fixed; inset: 0; z-index: 100001;
      background: rgba(5, 5, 10, 0.95);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-family: sans-serif; color: #fff;
    `;
    
    const title = document.createElement("h1");
    title.textContent = "CHOOSE YOUR BLADE";
    title.style.cssText = "font-size: 32px; margin-bottom: 10px; letter-spacing: 3px; text-transform: uppercase;";
    this.container.appendChild(title);
    
    const subtitle = document.createElement("p");
    subtitle.textContent = "Each blade has two base moves and one finisher";
    subtitle.style.cssText = "color: #888; margin-bottom: 30px; font-size: 14px;";
    this.container.appendChild(subtitle);
    
    const grid = document.createElement("div");
    grid.style.cssText = `
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px; max-width: 960px; width: 90%; padding: 0 20px;
    `;
    
    STARTER_BLADES.forEach((blade, idx) => {
      const card = this._createCard(blade, idx);
      grid.appendChild(card);
    });
    
    this.container.appendChild(grid);
    document.body.appendChild(this.container);
  }
  
  _createCard(blade, idx) {
    const card = document.createElement("div");
    card.className = "blade-card";
    card.style.cssText = `
      background: rgba(255,255,255,0.05);
      border: 2px solid rgba(255,255,255,0.15);
      border-radius: 12px; padding: 20px;
      cursor: pointer; transition: all 0.2s;
      text-align: center;
    `;
    
    const colorHex = '#' + blade.color.toString(16).padStart(6, '0');
    card.style.borderColor = colorHex + '40';
    
    card.innerHTML = `
      <h3 style="margin: 0 0 8px 0; font-size: 20px; color: ${colorHex};">${blade.name}</h3>
      <p style="margin: 0 0 16px 0; font-size: 12px; color: #aaa; min-height: 32px;">${blade.description}</p>
      <div style="margin-bottom: 12px;">
        ${this._statBar('Att', blade.baseStats.att, 10, colorHex)}
        ${this._statBar('Def', blade.baseStats.def, 10, colorHex)}
        ${this._statBar('Agi', blade.baseStats.agi, 10, colorHex)}
        ${this._statBar('HP', blade.baseStats.hp, 10, colorHex)}
      </div>
      <div style="font-size: 11px; color: #666; margin-bottom: 8px;">MOVES</div>
      <div style="font-size: 12px; color: #ccc; line-height: 1.6;">
        <div>⚔ ${blade.moves[0].name} <span style="color:#ffaa00">[${blade.moves[0].specialStats.join('+').toUpperCase()}]</span></div>
        <div>⚔ ${blade.moves[1].name} <span style="color:#ffaa00">[${blade.moves[1].specialStats.join('+').toUpperCase()}]</span></div>
        <div style="margin-top:4px; color:${colorHex}; font-weight:bold;">★ ${blade.moves[2].name}</div>
      </div>
    `;
    
    card.addEventListener("mouseenter", () => {
      card.style.background = 'rgba(255,255,255,0.1)';
      card.style.transform = 'scale(1.03)';
    });
    card.addEventListener("mouseleave", () => {
      card.style.background = 'rgba(255,255,255,0.05)';
      card.style.transform = 'scale(1)';
    });
    card.addEventListener("click", () => this._select(blade, card));
    
    return card;
  }
  
  _statBar(label, value, max, color) {
    const pct = (value / max) * 100;
    return `
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px; font-size: 11px;">
        <span style="width: 28px; text-align: right; color: #888;">${label}</span>
        <div style="flex: 1; height: 6px; background: #333; border-radius: 3px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
        </div>
        <span style="width: 20px; color: #ccc;">${value}</span>
      </div>
    `;
  }
  
  _select(blade, cardEl) {
    // Visual feedback
    document.querySelectorAll('.blade-card').forEach(c => {
      c.style.opacity = '0.4';
      c.style.pointerEvents = 'none';
    });
    cardEl.style.opacity = '1';
    cardEl.style.borderColor = '#' + blade.color.toString(16).padStart(6, '0');
    
    setTimeout(() => {
      this.container.style.opacity = '0';
      this.container.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        this.container.remove();
        if (this.onSelect) this.onSelect(blade);
      }, 300);
    }, 200);
  }
  
  destroy() {
    if (this.container) this.container.remove();
  }
}
