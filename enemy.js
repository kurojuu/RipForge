// enemy.js
import * as THREE from "./three.module.js";

export class EnemyTop {
  constructor(scene, startX, startZ, battleNumber = 1) {
    this.scene = scene;
    this.mass = 1.1;
    this.radius = 0.6;
    
    const scale = 1 + (battleNumber - 1) * 0.15;
    this.stats = {
      att: Math.floor(50 * scale),
      def: Math.floor(45 * scale),
      agi: Math.floor(55 * scale),
      hp: Math.floor(500 * scale)
    };
    
    this.hp = this.stats.hp;
    this.maxHp = this.stats.hp;
    this.rpm = 4000;
    this.maxRPM = 4000;
    
    this.position = new THREE.Vector3(startX, 0.3, startZ);
    this.vel = new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5);
    
    this.mesh = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff3d00, metalness: 0.9, roughness: 0.2
    });
    
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.05, 0.4, 32), bodyMat);
    tip.position.y = -0.2;
    this.mesh.add(tip);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.12, 16, 48),
      new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 1.0 })
    );
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  syncRPM() {
    this.rpm = (this.hp / this.maxHp) * this.maxRPM;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp < 0) this.hp = 0;
    this.syncRPM();
  }

  update(dt) {
    if (this.hp <= 0) {
      this.hp = 0;
      this.rpm = 0;
      this.vel.set(0, 0, 0);
      if (this.mesh) this.mesh.rotation.z = Math.PI / 7;
      return;
    }

    if (window.Game && window.Game.player && window.Game.player.hp > 0) {
      const pPos = window.Game.player.position;
      const dx = pPos.x - this.position.x;
      const dz = pPos.z - this.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      const agiMult = this.stats.agi / 50;
      
      if (dist > 0.1) {
        // Chase player
        this.vel.x += (dx / dist) * 10 * agiMult * dt;
        this.vel.z += (dz / dist) * 10 * agiMult * dt;
      }
      
      // If close, try to circle around for better angle (harder to dodge)
      if (dist < 3 && dist > 0.1) {
        this.vel.x += (-dz / dist) * 4 * agiMult * dt;
        this.vel.z += (dx / dist) * 4 * agiMult * dt;
      }
    }

    this.vel.multiplyScalar(Math.exp(-1.8 * dt));

    this.position.x += this.vel.x * dt;
    this.position.z += this.vel.z * dt;
    this.position.y = 0.3;

    if (this.mesh) {
      this.mesh.rotation.y += (this.rpm * 0.1) * dt;
    }
  }
}

export class EnemyManager {
  constructor(scene, player, battleNumber = 1) {
    this.scene = scene;
    this.player = player;
    this.list = [];
    this.battleNumber = battleNumber;
    
    const count = 1 + Math.floor((battleNumber - 1) / 3);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const r = 6;
      this.list.push(new EnemyTop(this.scene, Math.cos(angle) * r, Math.sin(angle) * r, battleNumber));
    }
  }

  update(dt) {
    this.list.forEach(enemy => {
      if (enemy) enemy.update(dt);
    });
  }
}
