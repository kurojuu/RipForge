// powerups.js
// NEW FILE
// Random temporary power-ups that spawn in the stadium.

import * as THREE from "./three.module.js";

export class PowerUpManager{

constructor(scene,player,enemies){

this.scene=scene;
this.player=player;
this.enemies=enemies;

this.items=[];

this.timer=8;

this.types=[
"BOOST",
"HEAL",
"SHIELD",
"BERSERK"
];

}

update(dt){

this.timer-=dt;

if(this.timer<=0){

this.spawn();

this.timer=10+Math.random()*8;

}

for(let i=this.items.length-1;i>=0;i--){

const p=this.items[i];

p.life-=dt;

p.mesh.rotation.y+=4*dt;
p.mesh.rotation.x+=2*dt;

p.mesh.position.y=
0.45+
Math.sin(performance.now()*0.003+p.seed)*0.08;

if(p.life<=0){

this.scene.remove(p.mesh);
this.items.splice(i,1);

continue;

}

this.checkPickup(
this.player,
p
);

for(const e of this.enemies.list){

this.checkPickup(e,p);

}

}

}

spawn(){

const type=
this.types[
Math.floor(Math.random()*this.types.length)
];

const mesh=this.createMesh(type);

const a=Math.random()*Math.PI*2;
const r=1+Math.random()*5.5;

mesh.position.set(

Math.cos(a)*r,
0.45,
Math.sin(a)*r

);

this.scene.add(mesh);

this.items.push({

type,
mesh,
life:12,
seed:Math.random()*1000

});

}

createMesh(type){

const colors={

BOOST:0x00ff66,
HEAL:0x00ccff,
SHIELD:0xffdd00,
BERSERK:0xff3333

};

const g=new THREE.Group();

const ring=new THREE.Mesh(

new THREE.TorusGeometry(
0.22,
0.05,
10,
24
),

new THREE.MeshBasicMaterial({

color:colors[type]

})

);

ring.rotation.x=Math.PI/2;

g.add(ring);

const orb=new THREE.Mesh(

new THREE.SphereGeometry(
0.11,
16,
16
),

new THREE.MeshBasicMaterial({

color:colors[type]

})

);

g.add(orb);

g.userData.type=type;

return g;

}

checkPickup(top,item){

if(!item.mesh.visible)return;

const dx=
top.position.x-
item.mesh.position.x;

const dz=
top.position.z-
item.mesh.position.z;

const d=Math.sqrt(
dx*dx+dz*dz
);

if(d>.6)return;

item.mesh.visible=false;

this.apply(
top,
item.type
);

}

apply(top,type){

switch(type){

case"BOOST":

top.vel.multiplyScalar(1.8);
break;

case"HEAL":

top.rpm=Math.min(
top.maxRPM,
top.rpm+600
);
break;

case"SHIELD":

top.defenseMultiplier=
(top.defenseMultiplier||1)*1.4;

setTimeout(()=>{

top.defenseMultiplier/=1.4;

},6000);

break;

case"BERSERK":

top.attackMultiplier=
(top.attackMultiplier||1)*1.6;

setTimeout(()=>{

top.attackMultiplier/=1.6;

},6000);

break;

}

}

}