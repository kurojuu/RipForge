// physics.js
import * as THREE from "./three.module.js";
import { applyMoveEffects } from "./moves.js";

export class Physics {
  constructor(player, enemies) {
    this.player = player;
    this.enemies = enemies;
    this.arenaRadius = 14.0;
    this.reboundElasticity = 0.75;
    this.particles = null;
    this.audio = null;
    this.announcer = null;
    this.replay = null;
  }

  setManagers(managers) {
    this.particles = managers.particles;
    this.audio = managers.audio;
    this.announcer = managers.announcer;
    this.replay = managers.replay;
  }

  resolveCollision(attacker, defender, nx, nz, velAlongNormal) {
    const impulse = -(1 + 0.85) * velAlongNormal / (1 / attacker.mass + 1 / defender.mass);
    attacker.vel.x -= (impulse / attacker.mass) * nx;
    attacker.vel.z -= (impulse / attacker.mass) * nz;
    defender.vel.x += (impulse / defender.mass) * nx;
    defender.vel.z += (impulse / defender.mass) * nz;

    // INCREASED base damage for faster fights
    const baseDamage = Math.abs(velAlongNormal) * 45 + 55;
    
    const attMult = attacker.stats.att / 50;
    const defMult = 50 / (50 + defender.stats.def);
    let rawDamage = baseDamage * attMult * defMult;
    
    // Charge multiplier
    const chargeSpeed = Math.max(0, attacker.vel.x * nx + attacker.vel.z * nz);
    const chargeMult = 1 + (chargeSpeed * 0.05);
    rawDamage *= chargeMult;
    
    const result = applyMoveEffects(attacker, defender, rawDamage);
    const finalDamage = result.damage;
    
    if (result.effects.length > 0) {
      console.log(`[MOVE] ${result.moveName}: ${result.effects.join(", ")}`);
    }
    
    defender.takeDamage(finalDamage);
    attacker.takeDamage(finalDamage * 0.35); // Slightly higher recoil

    if (this.audio) this.audio.playHit(false);
    
    if (this.particles && attacker.hp > 0 && defender.hp > 0) {
      const midPoint = new THREE.Vector3(
        (attacker.position.x + defender.position.x) * 0.5,
        0.3,
        (attacker.position.z + defender.position.z) * 0.5
      );
      this.particles.emitSparks(midPoint);
    }
    
    if (this.announcer) this.announcer.bigHit();
  }

  update(dt) {
    if (!this.player || !this.player.position) return;

    let isPlayerGrinding = false;
    this.player.position.y = 0.3;
    
    const pDist = Math.sqrt(this.player.position.x ** 2 + this.player.position.z ** 2);
    const pEffRadius = this.arenaRadius - this.player.radius;

    if (pDist > pEffRadius) {
      isPlayerGrinding = true;
      const nx = this.player.position.x / (pDist || 1);
      const nz = this.player.position.z / (pDist || 1);
      this.player.position.x = nx * pEffRadius;
      this.player.position.z = nz * pEffRadius;

      const dot = this.player.vel.x * nx + this.player.vel.z * nz;
      if (dot > 0) {
        this.player.vel.x -= (1 + this.reboundElasticity) * dot * nx;
        this.player.vel.z -= (1 + this.reboundElasticity) * dot * nz;
        if (this.audio) this.audio.playHit(true);
      }

      const speed = Math.sqrt(this.player.vel.x**2 + this.player.vel.z**2);
      const isCharging = speed > 4;
      const baseWallDmg = isCharging ? (30 + speed * 5) : 12;
      const wallDamage = baseWallDmg * dt * (50 / (50 + this.player.stats.def));
      
      this.player.takeDamage(wallDamage);

      if (this.audio && this.player.hp > 0) this.audio.startGrind();
      if (this.particles && this.player.hp > 0) {
        this.particles.emitSparks(new THREE.Vector3(this.player.position.x, 0.3, this.player.position.z));
      }
    }

    if (!isPlayerGrinding || this.player.hp <= 0) {
      if (this.audio) this.audio.stopGrind();
    }

    if (this.enemies?.list) {
      for (let i = 0; i < this.enemies.list.length; i++) {
        const enemy = this.enemies.list[i];
        if (!enemy || !enemy.position || enemy.hp <= 0) continue;

        enemy.position.y = 0.3;
        const eDist = Math.sqrt(enemy.position.x ** 2 + enemy.position.z ** 2);
        const eEffRadius = this.arenaRadius - enemy.radius;

        // ENEMY WALL AVOIDANCE: steer away from walls when close
        const wallProximity = eDist / eEffRadius;
        if (wallProximity > 0.75) {
          const awayX = -enemy.position.x / (eDist || 1);
          const awayZ = -enemy.position.z / (eDist || 1);
          enemy.vel.x += awayX * 25 * dt;
          enemy.vel.z += awayZ * 25 * dt;
        }

        if (eDist > eEffRadius) {
          const enx = enemy.position.x / (eDist || 1);
          const enz = enemy.position.z / (eDist || 1);
          enemy.position.x = enx * eEffRadius;
          enemy.position.z = enz * eEffRadius;

          const edot = enemy.vel.x * enx + enemy.vel.z * enz;
          if (edot > 0) {
            enemy.vel.x -= (1 + this.reboundElasticity) * edot * enx;
            enemy.vel.z -= (1 + this.reboundElasticity) * edot * enz;
            if (this.audio) this.audio.playHit(true);
          }

          // Enemies take MUCH less wall damage so they don't suicide
          const wallDamage = 3 * dt * (50 / (50 + enemy.stats.def));
          enemy.takeDamage(wallDamage);

          if (this.particles && enemy.hp > 0) {
            this.particles.emitSparks(new THREE.Vector3(enemy.position.x, 0.3, enemy.position.z));
          }
        }

        if (this.player.hp > 0 && enemy.hp > 0) {
          const dx = enemy.position.x - this.player.position.x;
          const dz = enemy.position.z - this.player.position.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          const minDist = this.player.radius + enemy.radius;

          if (dist < minDist) {
            const nx = dx / (dist || 1);
            const nz = dz / (dist || 1);
            const overlap = minDist - dist;
            
            this.player.position.x -= nx * overlap * 0.5;
            this.player.position.z -= nz * overlap * 0.5;
            enemy.position.x += nx * overlap * 0.5;
            enemy.position.z += nz * overlap * 0.5;

            const rvx = enemy.vel.x - this.player.vel.x;
            const rvz = enemy.vel.z - this.player.vel.z;
            const velAlongNormal = rvx * nx + rvz * nz;

            if (velAlongNormal < 0) {
              this.resolveCollision(this.player, enemy, nx, nz, velAlongNormal);
            }
          }
        }
      }
    }
  }
}
