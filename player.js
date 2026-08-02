// player.js
import * as THREE from "./three.module.js";
import { calculateStats } from "./blades.js";

function createMetalTexture(colorHex, pattern = "brushed") {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  
  // Base metal
  const r = (colorHex >> 16) & 0xff;
  const g = (colorHex >> 8) & 0xff;
  const b = colorHex & 0xff;
  
  const grad = ctx.createLinearGradient(0, 0, 256, 256);
  grad.addColorStop(0, `rgb(${r+30},${g+30},${b+30})`);
  grad.addColorStop(0.5, `rgb(${r},${g},${b})`);
  grad.addColorStop(1, `rgb(${r-20},${g-20},${b-20})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  
  // Brushed lines
  ctx.globalAlpha = 0.15;
  for (let i = 0; i < 256; i += 4) {
    ctx.fillStyle = (i % 8 === 0) ? "#fff" : "#000";
    ctx.fillRect(0, i, 256, 1);
  }
  
  // Energy ring pattern
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = `rgb(${255-r},${255-g},${255-b})`;
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(angle) * 120, 128 + Math.sin(angle) * 120);
    ctx.stroke();
  }
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createFaceBoltTexture(letter, color, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  
  // Background
  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(64, 64, 62, 0, Math.PI * 2);
  ctx.fill();
  
  // Ring
  ctx.strokeStyle = "#" + accent.toString(16).padStart(6, '0');
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.stroke();
  
  // Letter
  ctx.fillStyle = "#" + color.toString(16).padStart(6, '0');
  ctx.font = "bold 60px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, 64, 64);
  
  return new THREE.CanvasTexture(canvas);
}

export class PlayerTop {
  constructor(scene, bladeData) {
    this.scene = scene;
    this.blade = bladeData;
    this.equippedParts = { launcher: null, launcherReel: null, attackRing: null, defenseRing: null, gyro: null };
    this.inventory = [];
    
    this.stats = calculateStats(this.blade, this.equippedParts);
    this.hp = this.stats.hp;
    this.maxHp = this.stats.hp;
    this.rpm = 4000;
    this.maxRPM = 4000;
    this.mass = 1.0;
    this.position = new THREE.Vector3(0, 0.3, 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    this.radius = 0.6;
    this.moves = this.blade.moves;
    
    this.mesh = this._buildDetailedMesh();
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
    
    this.spinSpeed = 0;
  }

  _buildDetailedMesh() {
    const group = new THREE.Group();
    const mainColor = this.blade.color;
    const accent = this.blade.accent || 0xffffff;
    
    const metalTex = createMetalTexture(mainColor);
    const metalMat = new THREE.MeshStandardMaterial({ 
      map: metalTex, metalness: 0.95, roughness: 0.15 
    });
    const accentMat = new THREE.MeshStandardMaterial({ 
      color: accent, metalness: 0.8, roughness: 0.2, emissive: accent, emissiveIntensity: 0.1
    });
    const darkMat = new THREE.MeshStandardMaterial({ 
      color: 0x222222, metalness: 0.9, roughness: 0.3 
    });
    
    // 1. Performance Tip (bottom cone)
    const tipGeo = new THREE.ConeGeometry(0.15, 0.3, 16);
    const tip = new THREE.Mesh(tipGeo, darkMat);
    tip.position.y = -0.35;
    group.add(tip);
    
    // 2. Forge Disc (middle weighted ring)
    const discGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.12, 32);
    const disc = new THREE.Mesh(discGeo, metalMat);
    disc.position.y = -0.15;
    group.add(disc);
    
    // Disc detail rings
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(0.4 + i * 0.07, 0.015, 8, 32);
      const ring = new THREE.Mesh(ringGeo, accentMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.15;
      group.add(ring);
    }
    
    // 3. Energy Layer (main attack ring with teeth)
    const energyGeo = new THREE.CylinderGeometry(0.65, 0.6, 0.18, 16);
    const energy = new THREE.Mesh(energyGeo, metalMat);
    energy.position.y = 0.05;
    group.add(energy);
    
    // Teeth on energy layer
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const toothGeo = new THREE.BoxGeometry(0.08, 0.15, 0.12);
      const tooth = new THREE.Mesh(toothGeo, accentMat);
      tooth.position.set(
        Math.cos(angle) * 0.62,
        0.05,
        Math.sin(angle) * 0.62
      );
      tooth.rotation.y = -angle;
      group.add(tooth);
    }
    
    // 4. Clear Wheel (transparent ring)
    const clearGeo = new THREE.TorusGeometry(0.5, 0.06, 12, 32);
    const clearMat = new THREE.MeshPhysicalMaterial({
      color: accent, metalness: 0.1, roughness: 0.1, 
      transmission: 0.4, transparent: true, opacity: 0.6
    });
    const clearWheel = new THREE.Mesh(clearGeo, clearMat);
    clearWheel.rotation.x = Math.PI / 2;
    clearWheel.position.y = 0.14;
    group.add(clearWheel);
    
    // 5. Face Bolt (top cap with letter)
    const faceGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 32);
    const faceTex = createFaceBoltTexture(this.blade.name[0], mainColor, accent);
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.5, roughness: 0.3 });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.y = 0.18;
    group.add(face);
    
    // Spin indicator - small glowing ring that shows rotation
    const spinGeo = new THREE.RingGeometry(0.68, 0.72, 32);
    const spinMat = new THREE.MeshBasicMaterial({ 
      color: accent, transparent: true, opacity: 0.4, side: THREE.DoubleSide 
    });
    this.spinIndicator = new THREE.Mesh(spinGeo, spinMat);
    this.spinIndicator.rotation.x = Math.PI / 2;
    this.spinIndicator.position.y = 0.16;
    group.add(this.spinIndicator);
    
    return group;
  }

  recalcStats() {
    const oldMax = this.maxHp;
    this.stats = calculateStats(this.blade, this.equippedParts);
    this.maxHp = this.stats.hp;
    this.hp = Math.min(this.hp * (this.maxHp / oldMax), this.maxHp);
    this.syncRPM();
  }

  equipPart(part) {
    // Return old part to inventory if exists
    const old = this.equippedParts[part.slot];
    if (old) this.inventory.push(old);
    this.equippedParts[part.slot] = part;
    // Remove from inventory
    this.inventory = this.inventory.filter(p => p.id !== part.id);
    this.recalcStats();
  }

  unequipPart(slot) {
    const old = this.equippedParts[slot];
    if (old) {
      this.inventory.push(old);
      this.equippedParts[slot] = null;
      this.recalcStats();
    }
  }

  addToInventory(part) {
    this.inventory.push(part);
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
    
    const agiMult = this.stats.agi / 50;
    const accelRate = 22.0 * agiMult;

    this.vel.x += moveX * accelRate * dt;
    this.vel.z += moveZ * accelRate * dt;

    this.vel.multiplyScalar(Math.exp(-2.2 * dt));

    this.position.x += this.vel.x * dt;
    this.position.z += this.vel.z * dt;
    this.position.y = 0.3;

    // Visible spinning
    const spinRate = Math.max(this.rpm, 100) * 0.15;
    this.mesh.rotation.y += spinRate * dt;
    
    // Spin indicator pulses
    if (this.spinIndicator) {
      this.spinIndicator.rotation.z += spinRate * dt * 2;
      const pulse = 0.3 + 0.2 * Math.sin(performance.now() * 0.01);
      this.spinIndicator.material.opacity = pulse;
    }
  }
}
