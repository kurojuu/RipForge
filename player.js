// player.js
import * as THREE from "./three.module.js";
import { calculateStats } from "./blades.js";

export class PlayerTop {
  constructor(scene, bladeData) {
    this.scene = scene;
    this.blade = bladeData;
    this.equippedParts = { launcher: null, launcherReel: null, attackRing: null, defenseRing: null, gyro: null };
    
    this.stats = calculateStats(this.blade, this.equippedParts);
    this.hp = this.stats.hp;
    this.maxHp = this.stats.hp;
    
    // Visual RPM derived from HP percentage
    this.rpm = 4000;
    this.maxRPM = 4000;
    
    this.mass = 1.0;
    this.position = new THREE.Vector3(0, 0.3, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.radius = 0.6;
    this.moves = this.blade.moves;
    
    this.mesh = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.blade.color || 0x00ff99,
      metalness: 0.9,
      roughness: 0.2
    });
    
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.05, 0.4, 32), bodyMat);
    tip.position.y = -0.2;
    this.mesh.add(tip);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.12, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0 })
    );
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  recalcStats() {
    const oldMax = this.maxHp;
    this.stats = calculateStats(this.blade, this.equippedParts);
    this.maxHp = this.stats.hp;
    // Preserve HP ratio
    this.hp = Math.min(this.hp * (this.maxHp / oldMax), this.maxHp);
    this.syncRPM();
  }

  equipPart(part) {
    this.equippedParts[part.slot] = part;
    this.recalcStats();
  }

  unequipPart(slot) {
    this.equippedParts[slot] = null;
    this.recalcStats();
  }

  syncRPM() {
    this.rpm = (this.hp / this.maxHp) * this.maxRPM;
    if (this.rpm < 0) this.rpm = 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
    this.syncRPM();
  }

  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
    this.syncRPM();
  }

  update(dt) {
    const isLaunching = window.Game?.state?.current === "launch";
    
    if (this.hp <= 0 && !isLaunching) {
      this.hp = 0;
      this.rpm = 0;
      this.vel.set(0, 0, 0);
      return;
    }

    const moveX = window.Game?.input?.tiltX || 0;
    const moveZ = window.Game?.input?.tiltY || 0;
    
    // Agi affects acceleration
    const agiMult = this.stats.agi / 50;
    const accelRate = 22.0 * agiMult;

    this.vel.x += moveX * accelRate * dt;
    this.vel.z += moveZ * accelRate * dt;

    this.vel.multiplyScalar(Math.exp(-2.2 * dt));

    this.position.x += this.vel.x * dt;
    this.position.z += this.vel.z * dt;
    this.position.y = 0.3;

    if (this.mesh) {
      this.mesh.rotation.y += (Math.max(this.rpm, 100) * 0.1) * dt;
    }
  }
}
