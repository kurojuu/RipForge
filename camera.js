// camera.js
import * as THREE from "./three.module.js";

export class GameCamera {
  constructor(camera, target) {
    this.camera = camera;
    this.target = target;
    
    this.camera.fov = 65;
    this.camera.near = 0.1;
    this.camera.far = 1000.0;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.distance = 12.5; 
    this.heightOffset = 10.0;
    this.minZoom = 6.0;
    this.maxZoom = 20.0;
    this.lerpFactor = 0.1;
  }

  update(dt) {
    // If target position vectors aren't fully deployed yet, point cleanly at field origin center
    let tx = 0, ty = 0, tz = 0;
    if (this.target && this.target.position) {
      tx = this.target.position.x;
      ty = this.target.position.y;
      tz = this.target.position.z;
    }

    const desiredX = tx;
    const desiredY = ty + this.heightOffset;
    const desiredZ = tz + this.distance;

    // Linear interpolation tracking loop
    this.camera.position.x += (desiredX - this.camera.position.x) * this.lerpFactor;
    this.camera.position.y += (desiredY - this.camera.position.y) * this.lerpFactor;
    this.camera.position.z += (desiredZ - this.camera.position.z) * this.lerpFactor;

    // Focus camera directly down onto targeted top positioning center parameters
    this.camera.lookAt(tx, ty, tz);
  }
}