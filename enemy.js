// enemy.js
import * as THREE from "./three.module.js";

export class EnemyTop {
  constructor(scene, startX, startZ) {
    this.scene = scene;
    this.rpm = 3500;
    this.maxRPM = 3500;
    this.mass = 1.1;
    this.radius = 0.6;
    
    this.position = new THREE.Vector3(startX, 0.3, startZ);
    this.vel = new THREE.Vector3((Math.random() - 0.5) * 5, 0, (Math.random() - 0.5) * 5);
    
    this.mesh = new THREE.Group();
    
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff3d00, 
      metalness: 0.9,
      roughness: 0.2
    });
    
    const tip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.05, 0.4, 32),
      bodyMat
    );
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

  update(dt) {
    if (this.rpm <= 0) {
      this.rpm = 0;
      this.vel.set(0, 0, 0);
      if (this.mesh) {
        this.mesh.rotation.z = Math.PI / 7;
      }
      return;
    }

    this.rpm = Math.max(0, this.rpm - 14.0 * dt);

    if (window.Game && window.Game.player && window.Game.player.rpm > 0) {
      const pPos = window.Game.player.position;
      const dx = pPos.x - this.position.x;
      const dz = pPos.z - this.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist > 0.1) {
        this.vel.x += (dx / dist) * 8.5 * dt;
        this.vel.z += (dz / dist) * 8.5 * dt;
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
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.list = [];
    
    this.list.push(new EnemyTop(this.scene, 6.0, -6.0));
  }

  update(dt) {
    this.list.forEach(enemy => {
      if (enemy) enemy.update(dt);
    });
  }
}