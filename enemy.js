// enemy.js
import * as THREE from "./three.module.js";

export class EnemyTop {
  constructor(scene, startX, startZ, battleNumber = 1, playerTotalStats = null) {
    this.scene = scene;
    this.mass = 1.1;
    this.radius = 0.6;
    
    // Scale based on battle AND player power
    const battleScale = 1 + (battleNumber - 1) * 0.25;
    const playerScale = playerTotalStats ? 
      (playerTotalStats.att + playerTotalStats.def + playerTotalStats.agi + playerTotalStats.hp) / 1200 : 1;
    const finalScale = battleScale * Math.max(1.0, playerScale);
    
    this.stats = {
      att: Math.floor(50 * finalScale),
      def: Math.floor(45 * finalScale),
      agi: Math.floor(55 * finalScale),
      hp: Math.floor(480 * finalScale)
    };
    
    this.hp = this.stats.hp;
    this.maxHp = this.stats.hp;
    this.rpm = 4000;
    this.maxRPM = 4000;
    
    this.position = new THREE.Vector3(startX, 0.3, startZ);
    this.vel = new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5);
    
    this.mesh = this._buildMesh();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  _buildMesh() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff3d00, metalness: 0.9, roughness: 0.2
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x331100, metalness: 0.8 });
    
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 16), darkMat);
    tip.position.y = -0.35;
    group.add(tip);
    
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 32), bodyMat);
    disc.position.y = -0.15;
    group.add(disc);
    
    const energy = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.58, 0.16, 12), bodyMat);
    energy.position.y = 0.05;
    group.add(energy);
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.12, 0.1), darkMat);
      tooth.position.set(Math.cos(angle) * 0.6, 0.05, Math.sin(angle) * 0.6);
      tooth.rotation.y = -angle;
      group.add(tooth);
    }
    
    const face = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 32),
      new THREE.MeshStandardMaterial({ color: 0xff6600, metalness: 0.5 })
    );
    face.position.y = 0.16;
    group.add(face);
    
    return group;
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
        this.vel.x += (dx / dist) * 12 * agiMult * dt;
        this.vel.z += (dz / dist) * 10 * agiMult * dt;
      }
      
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
      this.mesh.rotation.y += (this.rpm * 0.15) * dt;
    }
  }
}

export class EnemyManager {
  constructor(scene, player, battleNumber = 1) {
    this.scene = scene;
    this.player = player;
    this.list = [];
    this.battleNumber = battleNumber;
    
    const playerStats = player ? {
      att: player.stats.att,
      def: player.stats.def,
      agi: player.stats.agi,
      hp: player.stats.hp
    } : null;
    
    const count = 1 + Math.floor((battleNumber - 1) / 3);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const r = 6;
      this.list.push(new EnemyTop(this.scene, Math.cos(angle) * r, Math.sin(angle) * r, battleNumber, playerStats));
    }
  }

  update(dt) {
    this.list.forEach(enemy => {
      if (enemy) enemy.update(dt);
    });
  }
}
