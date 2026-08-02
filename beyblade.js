// beyblade.js
import * as THREE from "./three.module.js";

const COLORS = [
  0x1e88ff,
  0xff3030,
  0xffd000,
  0x00d26a,
  0xaa44ff,
  0x00d7ff,
  0xff6a00,
  0xffffff
];

function rand() {
  return COLORS[
    Math.floor(Math.random() * COLORS.length)
  ];
}

export function createBeyblade(color) {
  const c = color || rand();
  const group = new THREE.Group();
  
  const metal = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.58,
      0.42,
      0.12,
      40
    ),
    new THREE.MeshStandardMaterial({
      color: c,
      metalness: .95,
      roughness: .15,
      emissive: c,
      emissiveIntensity: .18
    })
  );
  group.add(metal);

  const attack = new THREE.Mesh(
    new THREE.TorusGeometry(
      .47,
      .09,
      18,
      40
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: .6,
      roughness: .4
    })
  );
  attack.rotation.x = Math.PI / 2;
  group.add(attack);

  for (let i = 0; i < 6; i++) {
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(
        .18,
        .08,
        .07
      ),
      new THREE.MeshStandardMaterial({
        color: c,
        metalness: .8,
        roughness: .25
      })
    );
    const a = i * Math.PI / 3;
    wing.position.set(
      Math.cos(a) * .46,
      0,
      Math.sin(a) * .46
    );
    wing.rotation.y = -a;
    group.add(wing);
  }

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(
      .22,
      .22,
      .18,
      32
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: .7,
      roughness: .2,
      emissive: 0xffffff,
      emissiveIntensity: .35
    })
  );
  core.position.y = .06;
  group.add(core);

  const gem = new THREE.Mesh(
    new THREE.SphereGeometry(
      .12,
      20,
      20
    ),
    new THREE.MeshStandardMaterial({
      color: 0x66ffff,
      emissive: 0x66ffff,
      emissiveIntensity: .9,
      metalness: .2
    })
  );
  gem.position.y = .18;
  group.add(gem);

  const lower = new THREE.Mesh(
    new THREE.CylinderGeometry(
      .38,
      .2,
      .15,
      24
    ),
    new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: .9,
      roughness: .25
    })
  );
  lower.position.y = -.13;
  group.add(lower);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(
      .07,
      .22,
      20
    ),
    new THREE.MeshStandardMaterial({
      color: 0xffdd55,
      metalness: 1,
      roughness: .1
    })
  );
  tip.position.y = -.31;
  group.add(tip);

  group.userData = {
    metal,
    core,
    gem
  };

  return group;
}

export function updateAppearance(top) {
  if (!top.mesh.userData || !top.mesh.userData.gem) return;
  
  const rpm = Math.max(0, top.rpm);
  const t = rpm / top.maxRPM;
  
  top.mesh.userData.gem.material.emissiveIntensity =
    0.15 + t * 1.3;
    
  top.mesh.userData.core.material.emissiveIntensity =
    0.05 + t * .55;
    
  top.mesh.userData.metal.rotation.y +=
    0.02 + t * .08;
    
  top.mesh.scale.setScalar(
    0.98 + t * .02
  );
}