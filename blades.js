// blades.js
export const STARTER_BLADES = [
  {
    id: "berserker",
    name: "Berserker",
    desc: "Heavy attack power. Crushes opponents with brute force.",
    baseStats: { att: 85, def: 30, agi: 55, hp: 600 },
    color: 0xff3030,
    moves: { base1: "crushing_blow", base2: "ricochet_strike", finisher: "omega_crash" }
  },
  {
    id: "fortress",
    name: "Fortress",
    desc: "Slow but unbreakable. Wears enemies down with chip damage.",
    baseStats: { att: 35, def: 85, agi: 25, hp: 950 },
    color: 0x1e88ff,
    moves: { base1: "shield_bash", base2: "fortress_grind", finisher: "iron_wall" }
  },
  {
    id: "phantom",
    name: "Phantom",
    desc: "Agile and elusive. Strikes fast before vanishing.",
    baseStats: { att: 55, def: 25, agi: 90, hp: 500 },
    color: 0x00e676,
    moves: { base1: "phantom_slash", base2: "shadow_dance", finisher: "mirage_strike" }
  },
  {
    id: "balanced",
    name: "Equinox",
    desc: "Average in all stats. Adapts to any situation.",
    baseStats: { att: 60, def: 60, agi: 60, hp: 700 },
    color: 0xffd600,
    moves: { base1: "balanced_strike", base2: "adapt_defense", finisher: "harmonic_blast" }
  }
];

export const PART_SLOTS = {
  launcher:     { label: "Launcher", stat: "att" },
  launcherReel: { label: "Launcher Reel", stat: "agi" },
  attackRing:   { label: "Attack Ring", stat: "att" },
  defenseRing:  { label: "Defense Ring", stat: "def" },
  gyro:         { label: "Gyro", stat: "hp" }
};

export const PARTS_DB = [
  { id: "p_launcher_1", slot: "launcher", name: "Steel Launcher", bonus: 8, unlockBattle: 1 },
  { id: "p_reel_1", slot: "launcherReel", name: "Quick Reel", bonus: 8, unlockBattle: 1 },
  { id: "p_attRing_1", slot: "attackRing", name: "Spike Ring", bonus: 8, unlockBattle: 1 },
  { id: "p_defRing_1", slot: "defenseRing", name: "Plate Ring", bonus: 8, unlockBattle: 1 },
  { id: "p_gyro_1", slot: "gyro", name: "Heavy Gyro", bonus: 60, unlockBattle: 1 },
  
  { id: "p_launcher_2", slot: "launcher", name: "Titan Launcher", bonus: 15, unlockBattle: 3 },
  { id: "p_reel_2", slot: "launcherReel", name: "Turbo Reel", bonus: 15, unlockBattle: 3 },
  { id: "p_attRing_2", slot: "attackRing", name: "Saw Ring", bonus: 15, unlockBattle: 3 },
  { id: "p_defRing_2", slot: "defenseRing", name: "Titanium Ring", bonus: 15, unlockBattle: 3 },
  { id: "p_gyro_2", slot: "gyro", name: "Diamond Gyro", bonus: 100, unlockBattle: 3 },
  
  { id: "p_launcher_3", slot: "launcher", name: "Omega Launcher", bonus: 25, unlockBattle: 5 },
  { id: "p_reel_3", slot: "launcherReel", name: "Phantom Reel", bonus: 25, unlockBattle: 5 },
  { id: "p_attRing_3", slot: "attackRing", name: "Void Ring", bonus: 25, unlockBattle: 5 },
  { id: "p_defRing_3", slot: "defenseRing", name: "Aegis Ring", bonus: 25, unlockBattle: 5 },
  { id: "p_gyro_3", slot: "gyro", name: "Core Gyro", bonus: 150, unlockBattle: 5 }
];

export function getUnlockedParts(battleNumber) {
  return PARTS_DB.filter(p => p.unlockBattle <= battleNumber);
}

export function calculateStats(blade, equippedParts) {
  const stats = { ...blade.baseStats };
  for (const part of Object.values(equippedParts)) {
    if (part && part.bonus) {
      stats[PART_SLOTS[part.slot].stat] += part.bonus;
    }
  }
  return stats;
}
