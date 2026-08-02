// physics.js
import * as THREE from "./three.module.js";

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

  update(dt) {
    // Structural Guard: Exit if player instance is broken or already dead
    

    if (!this.player || !this.player.position) {
    return;
  }

    let isPlayerGrinding = false;

    // 1. Player Boundary Resolution Loop
    this.player.position.y = 0.3;
    const pDist = Math.sqrt(this.player.position.x * this.player.position.x + this.player.position.z * this.player.position.z);
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
        
        if (this.audio && typeof this.audio.playHit === 'function') {
          this.audio.playHit(true);
        }
      }

      this.player.rpm = Math.max(0, this.player.rpm - 180 * dt);

      if (this.audio && typeof this.audio.startGrind === 'function' && this.player.rpm > 0) {
        this.audio.startGrind();
      }
      if (this.particles && this.player.rpm > 0) {
        const wallContact = new THREE.Vector3(this.player.position.x, 0.3, this.player.position.z);
        this.particles.emitSparks(wallContact);
      }
    }

    if (!isPlayerGrinding || this.player.rpm <= 0) {
      if (this.audio && typeof this.audio.stopGrind === 'function') {
        this.audio.stopGrind();
      }
    }

    // 2. Enemy Processing Loop
    if (this.enemies && this.enemies.list) {
      for (let i = 0; i < this.enemies.list.length; i++) {
        const enemy = this.enemies.list[i];
        
        // Skip dead or missing enemies immediately
        if (!enemy || !enemy.position || typeof enemy.rpm === 'undefined' || enemy.rpm <= 0) continue;

        enemy.position.y = 0.3;

        const eDist = Math.sqrt(enemy.position.x * enemy.position.x + enemy.position.z * enemy.position.z);
        const eEffRadius = this.arenaRadius - enemy.radius;

        if (eDist > eEffRadius) {
          const enx = enemy.position.x / (eDist || 1);
          const enz = enemy.position.z / (eDist || 1);

          enemy.position.x = enx * eEffRadius;
          enemy.position.z = enz * eEffRadius;

          const edot = enemy.vel.x * enx + enemy.vel.z * enz;
          if (edot > 0) {
            enemy.vel.x -= (1 + this.reboundElasticity) * edot * enx;
            enemy.vel.z -= (1 + this.reboundElasticity) * edot * enz;
            
            if (this.audio && typeof this.audio.playHit === 'function') {
              this.audio.playHit(true);
            }
          }

          enemy.rpm = Math.max(0, enemy.rpm - 180 * dt);

          if (this.particles && enemy.rpm > 0) {
            const eWallContact = new THREE.Vector3(enemy.position.x, 0.3, enemy.position.z);
            this.particles.emitSparks(eWallContact);
          }
        }

        // 3. Blade-on-Blade Inter-Top Collision
        if (this.player.rpm > 0 && enemy.rpm > 0) {
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
              const impulse = -(1 + 0.85) * velAlongNormal / (1 / this.player.mass + 1 / enemy.mass);

              this.player.vel.x -= (impulse / this.player.mass) * nx;
              this.player.vel.z -= (impulse / this.player.mass) * nz;
              enemy.vel.x += (impulse / enemy.mass) * nx;
              enemy.vel.z += (impulse / enemy.mass) * nz;

              const baseDamage = Math.abs(velAlongNormal) * 140 + 250;
              this.player.rpm = Math.max(0, this.player.rpm - baseDamage);
              enemy.rpm = Math.max(0, enemy.rpm - baseDamage);

              if (this.audio && typeof this.audio.playHit === 'function') {
                this.audio.playHit(false);
              }
              if (this.particles && this.player.rpm > 0 && enemy.rpm > 0) {
                const midPoint = new THREE.Vector3(
                  (this.player.position.x + enemy.position.x) * 0.5,
                  0.3,
                  (this.player.position.z + enemy.position.z) * 0.5
                );
                this.particles.emitSparks(midPoint);
              }
              if (this.announcer) this.announcer.bigHit();
            }
          }
        }
      }
    }
  }
}
