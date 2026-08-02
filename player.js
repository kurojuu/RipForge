// player.js
import * as THREE from "./three.module.js";

export class PlayerTop {
  constructor(scene) {
    this.scene = scene;
    
    this.rpm = 0;
    this.maxRPM = 4000;
    this.mass = 1.0;
    this.frictionModifier = 1.0;
    
    this.position = new THREE.Vector3(0, 0.3, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.radius = 0.6;

    this.mesh = new THREE.Group();
    
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x00ff99,
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
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 1.0 })
    );
    ring.rotation.x = Math.PI / 2;
    this.mesh.add(ring);

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  update(dt) {
    const isLaunching = window.Game?.state?.current === "launch";
    
    if (this.rpm <= 0 && !isLaunching) {
      this.rpm = 0;
      this.vel.set(0, 0, 0);
      return;
    }

    if (!isLaunching) {
      const baseDecay = 12.0 * this.frictionModifier;
      this.rpm = Math.max(0, this.rpm - baseDecay * dt);
    }

    const moveX = window.Game?.input?.tiltX || 0;
    const moveZ = window.Game?.input?.tiltY || 0;

    const accelRate = 22.0;
    this.vel.x += moveX * accelRate * dt;
    this.vel.z += moveZ * accelRate * dt;

    this.vel.multiplyScalar(Math.exp(-2.2 * dt));

    this.position.x += this.vel.x * dt;
    this.position.z += this.vel.z * dt;
    this.position.y = 0.3; 

    if (this.mesh) {
      this.mesh.rotation.y += (Math.max(this.rpm, 1000) * 0.1) * dt;
    }
  }
}