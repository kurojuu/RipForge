// blade.js
export const MOVE_TYPES = {
  BASE: 'base',
  FINISHER: 'finisher'
};

export const SPECIAL_STATS = {
  CRIT: 'crit',
  IGNORE_DEF: 'ignore_def',
  BOUNCE: 'bounce'
};

export class Move {
  constructor(name, type, description, specialStats = []) {
    this.name = name;
    this.type = type;
    this.description = description;
    this.specialStats = specialStats;
  }
  
  hasStat(stat) {
    return this.specialStats.includes(stat);
  }
}

export class Blade {
  constructor(id, name, description, baseStats, moves, color) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.baseStats = { ...baseStats };
    this.moves = moves;
    this.color = color;
    this.parts = {
      launcher: null,
      reel: null,
      attRing: null,
      defRing: null,
      gyro: null
    };
  }
  
  equipPart(slot, part) {
    this.parts[slot] = part;
  }
  
  unequipPart(slot) {
    this.parts[slot] = null;
  }
  
  getTotalStats() {
    const stats = { ...this.baseStats };
    for (const slot in this.parts) {
      const part = this.parts[slot];
      if (part) {
        stats[part.stat] += part.value;
      }
    }
    return stats;
  }
  
  getDamageMultiplier() {
    const stats = this.getTotalStats();
    return 1 + stats.att * 0.08;
  }
  
  getDamageReduction() {
    const stats = this.getTotalStats();
    return 1 + stats.def * 0.12;
  }
  
  getSpeedMultiplier() {
    const stats = this.getTotalStats();
    return 1 + stats.agi * 0.06;
  }
  
  getMaxRPM() {
    const stats = this.getTotalStats();
    return 3200 + stats.hp * 250;
  }
  
  getProcChance() {
    const stats = this.getTotalStats();
    return Math.min(0.45, 0.2 + stats.agi * 0.025);
  }
  
  getBaseMove1() { return this.moves[0]; }
  getBaseMove2() { return this.moves[1]; }
  getFinisher() { return this.moves[2]; }
  
  toJSON() {
    return {
      id: this.id,
      parts: Object.fromEntries(
        Object.entries(this.parts).map(([k, v]) => [k, v ? v.id : null])
      )
    };
  }
  
  static fromJSON(json, allParts) {
    const blade = STARTER_BLADES.find(b => b.id === json.id);
    if (!blade) return null;
    const clone = new Blade(blade.id, blade.name, blade.description, blade.baseStats, blade.moves, blade.color);
    if (json.parts) {
      for (const [slot, partId] of Object.entries(json.parts)) {
        if (partId && allParts[partId]) {
          clone.equipPart(slot, allParts[partId]);
        }
      }
    }
    return clone;
  }
}

export const STARTER_BLADES = [
  new Blade('berserker', 'Berserker', 'Heavy attack blade. Devastating power, fragile frame.', 
    { att: 8, def: 3, agi: 4, hp: 5 },
    [
      new Move('Heavy Slam', MOVE_TYPES.BASE, 'A crushing blow with high crit chance.', [SPECIAL_STATS.CRIT]),
      new Move('Power Rush', MOVE_TYPES.BASE, 'Charge forward with devastating force.', [SPECIAL_STATS.CRIT]),
      new Move('Obliterate', MOVE_TYPES.FINISHER, 'Ultimate crushing attack that ignores defenses.', [SPECIAL_STATS.CRIT, SPECIAL_STATS.IGNORE_DEF])
    ],
    0xff3030
  ),
  new Blade('fortress', 'Fortress', 'Tank blade. High defense and HP, slow but unbreakable.',
    { att: 3, def: 8, agi: 3, hp: 7 },
    [
      new Move('Shield Bash', MOVE_TYPES.BASE, 'Knock enemies back with your bulk.', [SPECIAL_STATS.BOUNCE]),
      new Move('Iron Wall', MOVE_TYPES.BASE, 'Deflect attacks and send foes flying.', [SPECIAL_STATS.BOUNCE]),
      new Move('Unbreakable', MOVE_TYPES.FINISHER, 'Become an immovable force.', [SPECIAL_STATS.IGNORE_DEF, SPECIAL_STATS.BOUNCE])
    ],
    0x1e88ff
  ),
  new Blade('swift', 'Swift', 'Agile blade. Fast strikes and rapid movement.',
    { att: 5, def: 4, agi: 8, hp: 4 },
    [
      new Move('Swift Strike', MOVE_TYPES.BASE, 'A rapid attack with precision.', [SPECIAL_STATS.CRIT]),
      new Move('Dash Attack', MOVE_TYPES.BASE, 'Strike while moving at high speed.', [SPECIAL_STATS.BOUNCE]),
      new Move('Tempest', MOVE_TYPES.FINISHER, 'A flurry of crits and bounces.', [SPECIAL_STATS.CRIT, SPECIAL_STATS.BOUNCE])
    ],
    0x00e676
  ),
  new Blade('vanguard', 'Vanguard', 'Balanced blade. Average in all stats, adaptable.',
    { att: 5, def: 5, agi: 5, hp: 5 },
    [
      new Move('Standard Blow', MOVE_TYPES.BASE, 'A reliable strike with crit potential.', [SPECIAL_STATS.CRIT]),
      new Move('Counter', MOVE_TYPES.BASE, 'Turn enemy momentum against them.', [SPECIAL_STATS.BOUNCE]),
      new Move('All-Round', MOVE_TYPES.FINISHER, 'A versatile finisher.', [SPECIAL_STATS.CRIT, SPECIAL_STATS.IGNORE_DEF])
    ],
    0xffd600
  )
];
