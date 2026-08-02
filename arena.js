// arena.js
import * as THREE from "./three.module.js";

export function createArena(scene) {
  const arenaGroup = new THREE.Group();

  // 1. Floor Base Tier (Top surface sits exactly at y = 0.00)
  const floorGeo = new THREE.CylinderGeometry(14.0, 13.5, 0.4, 128);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x1c1e24, 
    roughness: 0.6,  
    metalness: 0.2   
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.2; 
  arenaGroup.add(floor);

  // 2. Intermediate Pit Slope Tier (Top surface sits exactly at y = 0.08)
  const pitGeo = new THREE.CylinderGeometry(10.0, 11.5, 0.3, 128);
  const pitMat = new THREE.MeshStandardMaterial({
    color: 0x14161d,
    roughness: 0.6,
    metalness: 0.2
  });
  const pit = new THREE.Mesh(pitGeo, pitMat);
  pit.position.y = -0.07; // -0.07 base + 0.15 half-height = 0.08
  arenaGroup.add(pit);

  // 3. Central Deck Platform (Top surface sits exactly at y = 0.15)
  // This clears the pit tier by 0.07 units to prevent depth buffer overlap.
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base background layer matching the dark deck metal
  ctx.fillStyle = '#0c0d12';
  ctx.fillRect(0, 0, 512, 512);
  
  // BLUE LIGHT VORTEX CORE - Painted directly onto the canvas mapping (Radius 1.8 unit equivalent)
  ctx.fillStyle = '#00d2ff';
  ctx.beginPath();
  ctx.arc(256, 256, 92, 0, Math.PI * 2);
  ctx.fill();
  
  // Concentric Blue Lane Markings - Painted on the same texture space (Radius 3.5 unit equivalent)
  ctx.strokeStyle = '#00a2ff';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(256, 256, 180, 0, Math.PI * 2);
  ctx.stroke();

  const coreTex = new THREE.CanvasTexture(canvas);
  
  const sideMat = new THREE.MeshStandardMaterial({ color: 0x0c0d12, roughness: 0.5, metalness: 0.3 });
  const topMat = new THREE.MeshBasicMaterial({ map: coreTex }); // MeshBasic keeps the blue texture unlit and fully vibrant
  
  const centerDeckGeo = new THREE.CylinderGeometry(5.0, 6.0, 0.2, 128);
  // Array mapping: [Sides, Top Cap, Bottom Cap]
  const centerDeck = new THREE.Mesh(centerDeckGeo, [sideMat, topMat, sideMat]);
  centerDeck.position.y = 0.05; // 0.05 base + 0.10 half-height = 0.15
  arenaGroup.add(centerDeck);

  // 4. True 14.0 Outer Boundary Rail Frame
  const wallGeo = new THREE.TorusGeometry(14.0, 0.15, 16, 128);
  const wallMat = new THREE.MeshBasicMaterial({
    color: 0x00a2ff, 
    transparent: true,
    opacity: 0.7
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.rotation.x = Math.PI / 2;
  wall.position.y = 0.05;
  arenaGroup.add(wall);

  scene.add(arenaGroup);

  // 5. Quad Spotlight Rig (Glare-free setting)
  const spotPositions = [
    { x: 12, z: 12 },
    { x: -12, z: 12 },
    { x: 12, z: -12 },
    { x: -12, z: -12 }
  ];

  spotPositions.forEach((pos) => {
    const spotLight = new THREE.SpotLight(0xffffff, 4.5);
    spotLight.position.set(pos.x, 15, pos.z);
    spotLight.angle = Math.PI / 3.5;
    spotLight.penumbra = 0.8;
    spotLight.decay = 1.0;
    spotLight.distance = 35;
    spotLight.target = centerDeck;
    scene.add(spotLight);
  });

  console.log("环境 ✅ Arena structural height maps completely isolated. Texture layers consolidated.");
}