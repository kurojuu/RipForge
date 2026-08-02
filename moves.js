// moves.js
export const MOVES = {
  // Base moves (one special stat each)
  crushing_blow:   { name: "Crushing Blow", type: "base", special: ["crit_att"] },
  ricochet_strike: { name: "Ricochet Strike", type: "base", special: ["bounce_att"] },
  shield_bash:     { name: "Shield Bash", type: "base", special: ["bounce_att"] },
  fortress_grind:  { name: "Fortress Grind", type: "base", special: ["crit_att"] },
  phantom_slash:   { name: "Phantom Slash", type: "base", special: ["crit_att"] },
  shadow_dance:    { name: "Shadow Dance", type: "base", special: ["bounce_att"] },
  balanced_strike: { name: "Balanced Strike", type: "base", special: ["crit_att"] },
  adapt_defense:   { name: "Adapt Defense", type: "base", special: ["bounce_att"] },
  
  // Finishers (two special stats each)
  omega_crash:     { name: "Omega Crash", type: "finisher", special: ["crit_att", "ignore_def"] },
  iron_wall:       { name: "Iron Wall", type: "finisher", special: ["ignore_def", "bounce_att"] },
  mirage_strike:   { name: "Mirage Strike", type: "finisher", special: ["crit_att", "bounce_att"] },
  harmonic_blast:  { name: "Harmonic Blast", type: "finisher", special: ["crit_att", "ignore_def"] }
};

export function applyMoveEffects(attacker, defender, baseDamage, isFinisher = false) {
  let damage = baseDamage;
  let effects = [];
  const moves = attacker.moves || {};
  
  // Determine which move applies
  let move = null;
  if (isFinisher && moves.finisher) {
    move = MOVES[moves.finisher];
  } else if (moves.base1 || moves.base2) {
    // Randomly pick base move for variety
    move = MOVES[Math.random() < 0.5 ? moves.base1 : moves.base2];
  }
  
  if (!move) return { damage, effects };
  
  const specials = move.special || [];
  
  // Crit Attack: 25% chance for 2x damage
  if (specials.includes("crit_att")) {
    if (Math.random() < 0.25) {
      damage *= 2;
      effects.push("CRIT!");
    }
  }
  
  // Ignore Def: Bypass 50% of defender's defense
  if (specials.includes("ignore_def")) {
    damage *= 1.5;
    effects.push("PIERCING!");
  }
  
  // Bouncing Attack: Extra knockback
  if (specials.includes("bounce_att")) {
    effects.push("BOUNCE!");
  }
  
  return { damage, effects, moveName: move.name };
}
