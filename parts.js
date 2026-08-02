// parts.js
export const PART_SLOTS = {
  launcher: 'Launcher',
  reel: 'Launcher Reel',
  attRing: 'Attack Ring',
  defRing: 'Defense Ring',
  gyro: 'Gyro'
};

export const STAT_NAMES = {
  att: 'Attack',
  def: 'Defense',
  agi: 'Agility',
  hp: 'HP'
};

export class Part {
  constructor(id, name, slot, stat, value, rarity) {
    this.id = id;
    this.name = name;
    this.slot = slot;
    this.stat = stat;
    this.value = value;
    this.rarity = rarity;
  }
}

const PART_NAMES = {
  launcher: ['Strike Launcher', 'Turbo Launcher', 'Heavy Launcher', 'Precision Launcher'],
  reel: ['Speed Reel', 'Light Reel', 'Tuned Reel', 'Rapid Reel'],
  attRing: ['Spiked Ring', 'Serrated Ring', 'Sharp Ring', 'Diamond Ring'],
  defRing: ['Iron Ring', 'Titanium Ring', 'Guard Ring', 'Aegis Ring'],
  gyro: ['Heavy Gyro', 'Stable Gyro', 'Core Gyro', 'Balance Gyro']
};

const RARITY_TIERS = [
  { name: 'Common', value: 1, color: '#aaaaaa' },
  { name: 'Rare', value: 2, color: '#4488ff' },
  { name: 'Epic', value: 3, color: '#aa44ff' }
];

const SLOT_STAT_MAP = {
  launcher: 'att',
  reel: 'agi',
  attRing: 'att',
  defRing: 'def',
  gyro: 'hp'
};

let partIdCounter = 0;

export function generateRandomPart(slot) {
  const names = PART_NAMES[slot];
  const name = names[Math.floor(Math.random() * names.length)];
  const rarity = RARITY_TIERS[Math.floor(Math.random() * RARITY_TIERS.length)];
  const stat = SLOT_STAT_MAP[slot];
  const id = `part_${partIdCounter++}_${Date.now()}`;
  return new Part(id, name, slot, stat, rarity.value, rarity);
}

export function generateStarterParts(count = 3) {
  const parts = [];
  const slots = Object.keys(PART_SLOTS);
  for (let i = 0; i < count; i++) {
    const slot = slots[Math.floor(Math.random() * slots.length)];
    parts.push(generateRandomPart(slot));
  }
  return parts;
}

export class Inventory {
  constructor() {
    this.unlocked = [];
    this.load();
  }
  
  unlock(parts) {
    this.unlocked.push(...parts);
    this.save();
  }
  
  getBySlot(slot) {
    return this.unlocked.filter(p => p.slot === slot);
  }
  
  getAll() {
    return this.unlocked;
  }
  
  toJSON() {
    return this.unlocked.map(p => ({
      id: p.id, name: p.name, slot: p.slot, stat: p.stat, value: p.value,
      rarity: p.rarity
    }));
  }
  
  static fromJSON(data) {
    const inv = new Inventory();
    inv.unlocked = data.map(d => new Part(d.id, d.name, d.slot, d.stat, d.value, d.rarity));
    return inv;
  }
  
  save() {
    localStorage.setItem('ripforge_inventory', JSON.stringify(this.toJSON()));
  }
  
  load() {
    const raw = localStorage.getItem('ripforge_inventory');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.unlocked = data.map(d => new Part(d.id, d.name, d.slot, d.stat, d.value, d.rarity));
      } catch (e) {
        this.unlocked = [];
      }
    }
  }
}

export class Progress {
  constructor() {
    this.wins = 0;
    this.firstWinComplete = false;
    this.selectedBladeId = null;
    this.equippedParts = {};
    this.load();
  }
  
  recordWin() {
    this.wins++;
    if (!this.firstWinComplete) this.firstWinComplete = true;
    this.save();
  }
  
  selectBlade(id) {
    this.selectedBladeId = id;
    this.save();
  }
  
  setEquippedParts(parts) {
    this.equippedParts = parts;
    this.save();
  }
  
  toJSON() {
    return {
      wins: this.wins,
      firstWinComplete: this.firstWinComplete,
      selectedBladeId: this.selectedBladeId,
      equippedParts: this.equippedParts
    };
  }
  
  save() {
    localStorage.setItem('ripforge_progress', JSON.stringify(this.toJSON()));
  }
  
  load() {
    const raw = localStorage.getItem('ripforge_progress');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        this.wins = data.wins || 0;
        this.firstWinComplete = data.firstWinComplete || false;
        this.selectedBladeId = data.selectedBladeId || null;
        this.equippedParts = data.equippedParts || {};
      } catch (e) {}
    }
  }
  
  static clear() {
    localStorage.removeItem('ripforge_progress');
    localStorage.removeItem('ripforge_inventory');
  }
}
