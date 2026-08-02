// parts_ui.js
import { PART_SLOTS, STAT_NAMES } from "./parts.js";

export class PartsUI {
  constructor(blade, inventory, onDone) {
    this.blade = blade;
    this.inventory = inventory;
    this.onDone = onDone;
    this.container = null;
    this._build();
  }
  
  _build() {
    this.container = document.createElement("div");
    this.container.id = "partsUI";
    this.container.style.cssText = `
      position: fixed; inset: 0; z-index: 100001;
      background: rgba(5, 5, 10, 0.95);
      display: flex; flex-direction: column;
      align-items: center; justify-content: flex-start;
      font-family: sans-serif; color: #fff;
      padding: 40px 20px; overflow-y: auto;
    `;
    
    const title = document.createElement("h1");
    title.textContent = "CUSTOMIZE BLADE";
    title.style.cssText = "font-size: 28px; margin-bottom: 8px; letter-spacing: 2px;";
    this.container.appendChild(title);
    
    const bladeName = document.createElement("p");
    bladeName.textContent = this.blade.name;
    bladeName.style.cssText = "color: #888; margin-bottom: 24px; font-size: 16px;";
    this.container.appendChild(bladeName);
    
    // Stats display
    const statsDiv = document.createElement("div");
    statsDiv.style.cssText = "display: flex; gap: 24px; margin-bottom: 30px; flex-wrap: wrap; justify-content: center;";
    this._renderStats(statsDiv);
    this.container.appendChild(statsDiv);
    
    // Slots grid
    const slotsGrid = document.createElement("div");
    slotsGrid.style.cssText = `
      display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px; max-width: 900px; width: 100%; margin-bottom: 30px;
    `;
    
    Object.entries(PART_SLOTS).forEach(([slotKey, slotLabel]) => {
      const slotCard = this._createSlotCard(slotKey, slotLabel);
      slotsGrid.appendChild(slotCard);
    });
    
    this.container.appendChild(slotsGrid);
    
    // Inventory
    const invTitle = document.createElement("h3");
    invTitle.textContent = "UNLOCKED PARTS";
    invTitle.style.cssText = "font-size: 16px; color: #888; margin-bottom: 12px;";
    this.container.appendChild(invTitle);
    
    const invGrid = document.createElement("div");
    invGrid.id = "partsInventory";
    invGrid.style.cssText = `
      display: flex; flex-wrap: wrap; gap: 10px;
      max-width: 900px; justify-content: center; margin-bottom: 30px;
    `;
    this._renderInventory(invGrid);
    this.container.appendChild(invGrid);
    
    // Buttons
    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display: flex; gap: 16px;";
    
    const doneBtn = document.createElement("button");
    doneBtn.textContent = "ENTER BATTLE";
    doneBtn.style.cssText = `
      padding: 14px 40px; font-size: 18px; font-weight: bold;
      background: #00e676; color: #000; border: none; border-radius: 8px;
      cursor: pointer; text-transform: uppercase; letter-spacing: 1px;
    `;
    doneBtn.onclick = () => this._done();
    
    const resetBtn = document.createElement("button");
    resetBtn.textContent = "UNEQUIP ALL";
    resetBtn.style.cssText = `
      padding: 14px 30px; font-size: 16px;
      background: transparent; color: #ff3d00; border: 2px solid #ff3d00;
      border-radius: 8px; cursor: pointer;
    `;
    resetBtn.onclick = () => {
      Object.keys(this.blade.parts).forEach(k => this.blade.unequipPart(k));
      this._refresh();
    };
    
    btnRow.appendChild(resetBtn);
    btnRow.appendChild(doneBtn);
    this.container.appendChild(btnRow);
    
    document.body.appendChild(this.container);
  }
  
  _renderStats(container) {
    container.innerHTML = '';
    const stats = this.blade.getTotalStats();
    const base = this.blade.baseStats;
    const colorHex = '#' + this.blade.color.toString(16).padStart(6, '0');
    
    Object.entries(stats).forEach(([stat, val]) => {
      const diff = val - base[stat];
      const diffStr = diff > 0 ? ` (+${diff})` : '';
      const div = document.createElement("div");
      div.style.cssText = "text-align: center; min-width: 60px;";
      div.innerHTML = `
        <div style="font-size: 24px; font-weight: bold; color: ${colorHex};">${val}</div>
        <div style="font-size: 11px; color: #888;">${STAT_NAMES[stat]}${diffStr}</div>
      `;
      container.appendChild(div);
    });
  }
  
  _createSlotCard(slotKey, slotLabel) {
    const card = document.createElement("div");
    card.style.cssText = `
      background: rgba(255,255,255,0.05); border: 2px dashed rgba(255,255,255,0.2);
      border-radius: 10px; padding: 16px; text-align: center; min-height: 100px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
    `;
    
    const equipped = this.blade.parts[slotKey];
    
    if (equipped) {
      const rarityColor = equipped.rarity?.color || '#aaa';
      card.style.border = `2px solid ${rarityColor}`;
      card.innerHTML = `
        <div style="font-size: 11px; color: #888; margin-bottom: 4px;">${slotLabel}</div>
        <div style="font-size: 14px; font-weight: bold; color: ${rarityColor}; margin-bottom: 4px;">${equipped.name}</div>
        <div style="font-size: 12px; color: #ccc;">+${equipped.value} ${STAT_NAMES[equipped.stat]}</div>
        <button style="margin-top: 8px; padding: 4px 12px; font-size: 11px; background: #ff3d00; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Remove</button>
      `;
      card.querySelector("button").onclick = (e) => {
        e.stopPropagation();
        this.blade.unequipPart(slotKey);
        this._refresh();
      };
    } else {
      card.innerHTML = `
        <div style="font-size: 11px; color: #888; margin-bottom: 4px;">${slotLabel}</div>
        <div style="font-size: 13px; color: #555;">Empty</div>
      `;
    }
    
    return card;
  }
  
  _renderInventory(container) {
    container.innerHTML = '';
    const allParts = this.inventory.getAll();
    
    if (allParts.length === 0) {
      container.innerHTML = '<div style="color: #555; font-size: 13px;">No parts unlocked yet. Win battles to unlock parts!</div>';
      return;
    }
    
    allParts.forEach(part => {
      const isEquipped = Object.values(this.blade.parts).some(p => p && p.id === part.id);
      const rarityColor = part.rarity?.color || '#aaa';
      
      const chip = document.createElement("div");
      chip.style.cssText = `
        padding: 8px 14px; border-radius: 20px; font-size: 12px;
        border: 2px solid ${isEquipped ? rarityColor : 'rgba(255,255,255,0.15)'};
        background: ${isEquipped ? rarityColor + '20' : 'rgba(255,255,255,0.05)'};
        color: ${isEquipped ? '#fff' : '#aaa'};
        cursor: ${isEquipped ? 'default' : 'pointer'};
        transition: all 0.15s;
      `;
      chip.textContent = `${part.name} +${part.value} ${STAT_NAMES[part.stat]}`;
      
      if (!isEquipped) {
        chip.onmouseenter = () => chip.style.background = 'rgba(255,255,255,0.1)';
        chip.onmouseleave = () => chip.style.background = 'rgba(255,255,255,0.05)';
        chip.onclick = () => {
          this.blade.equipPart(part.slot, part);
          this._refresh();
        };
      }
      
      container.appendChild(chip);
    });
  }
  
  _refresh() {
    const statsDiv = this.container.querySelector('div:nth-child(3)');
    this._renderStats(statsDiv);
    
    const slotsGrid = this.container.querySelector('div:nth-child(4)');
    slotsGrid.innerHTML = '';
    Object.entries(PART_SLOTS).forEach(([slotKey, slotLabel]) => {
      slotsGrid.appendChild(this._createSlotCard(slotKey, slotLabel));
    });
    
    const invGrid = document.getElementById("partsInventory");
    this._renderInventory(invGrid);
  }
  
  _done() {
    this.container.style.opacity = '0';
    this.container.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      this.container.remove();
      if (this.onDone) this.onDone(this.blade);
    }, 300);
  }
  
  destroy() {
    if (this.container) this.container.remove();
  }
}
