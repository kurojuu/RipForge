// blades.js
export const PROJECT_NAME = "RipForge";

export const STARTER_BLADES = [
  {
    id: "berserker",
    name: "Berserker",
    desc: "Heavy attack power. Crushes opponents with brute force.",
    baseStats: { att: 85, def: 30, agi: 55, hp: 600 },
    color: 0xff3030,
    accent: 0xffaa00,
    moves: { base1: "crushing_blow", base2: "ricochet_strike", finisher: "omega_crash" }
  },
  {
    id: "fortress",
    name: "Fortress",
    desc: "Slow but unbreakable. Wears enemies down with chip damage.",
    baseStats: { att: 35, def: 85, agi: 25, hp: 950 },
    color: 0x1e88ff,
    accent: 0x00ffff,
    moves: { base1: "shield_bash", base2: "fortress_grind", finisher: "iron_wall" }
  },
  {
    id: "phantom",
    name: "Phantom",
    desc: "Agile and elusive. Strikes fast before vanishing.",
    baseStats: { att: 55, def: 25, agi: 90, hp: 500 },
    color: 0x00e676,
    accent: 0xccff00,
    moves: { base1: "phantom_slash", base2: "shadow_dance", finisher: "mirage_strike" }
  },
  {
    id: "balanced",
    name: "Equinox",
    desc: "Average in all stats. Adapts to any situation.",
    baseStats: { att: 60, def: 60, agi: 60, hp: 700 },
    color: 0xffd600,
    accent: 0xff6600,
    moves: { base1: "balanced_strike", base2: "adapt_defense", finisher: "harmonic_blast" }
  }
];

export const PART_SLOTS = {
  launcher:     { label: "Launcher", stat: "att", icon: "⚡" },
  launcherReel: { label: "Reel", stat: "agi", icon: "🌀" },
  attackRing:   { label: "Attack Ring", stat: "att", icon: "🔺" },
  defenseRing:  { label: "Defense Ring", stat: "def", icon: "🛡️" },
  gyro:         { label: "Gyro", stat: "hp", icon: "⚙️" }
};

export const PARTS_DB = [
  // Tier 1 (Battle 1)
  { id: "p_launcher_1", slot: "launcher", name: "Steel Launcher", bonus: 12, tier: 1, color: 0x888888 },
  { id: "p_reel_1", slot: "launcherReel", name: "Quick Reel", bonus: 10, tier: 1, color: 0x4488ff },
  { id: "p_attRing_1", slot: "attackRing", name: "Spike Ring", bonus: 14, tier: 1, color: 0xff4444 },
  { id: "p_defRing_1", slot: "defenseRing", name: "Plate Ring", bonus: 16, tier: 1, color: 0x44ff44 },
  { id: "p_gyro_1", slot: "gyro", name: "Heavy Gyro", bonus: 80, tier: 1, color: 0xffaa00 },
  
  // Tier 2 (Battle 3)
  { id: "p_launcher_2", slot: "launcher", name: "Titan Launcher", bonus: 22, tier: 2, color: 0xaaaaaa },
  { id: "p_reel_2", slot: "launcherReel", name: "Turbo Reel", bonus: 18, tier: 2, color: 0x2266dd },
  { id: "p_attRing_2", slot: "attackRing", name: "Saw Ring", bonus: 24, tier: 2, color: 0xdd2222 },
  { id: "p_defRing_2", slot: "defenseRing", name: "Titanium Ring", bonus: 26, tier: 2, color: 0x22dd22 },
  { id: "p_gyro_2", slot: "gyro", name: "Diamond Gyro", bonus: 140, tier: 2, color: 0xdddd00 },
  
  // Tier 3 (Battle 5)
  { id: "p_launcher_3", slot: "launcher", name: "Omega Launcher", bonus: 38, tier: 3, color: 0xcccccc },
  { id: "p_reel_3", slot: "launcherReel", name: "Phantom Reel", bonus: 32, tier: 3, color: 0x1144aa },
  { id: "p_attRing_3", slot: "attackRing", name: "Void Ring", bonus: 40, tier: 3, color: 0xaa1111 },
  { id: "p_defRing_3", slot: "defenseRing", name: "Aegis Ring", bonus: 42, tier: 3, color: 0x11aa11 },
  { id: "p_gyro_3", slot: "gyro", name: "Core Gyro", bonus: 220, tier: 3, color: 0xffff00 }
];

export function getPartsByTier(tier) {
  return PARTS_DB.filter(p => p.tier === tier);
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

export function getTotalStats(player) {
  return calculateStats(player.blade, player.equippedParts);
}

export function getStatDiff(blade, currentParts, slot, newPart) {
  const current = calculateStats(blade, currentParts);
  const testParts = { ...currentParts, [slot]: newPart };
  const next = calculateStats(blade, testParts);
  const diff = {};
  for (const k of Object.keys(current)) {
    diff[k] = next[k] - current[k];
  }
  return diff;
}
