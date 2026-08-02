// stats.js
// NEW FILE
// Beyblade types, stats and progression.

export const TYPES={

ATTACK:{
name:"Attack",
speed:1.2,
damage:1.35,
defense:.8,
stamina:.9,
color:0xff3030
},

DEFENSE:{
name:"Defense",
speed:.85,
damage:.95,
defense:1.45,
stamina:1.15,
color:0x1e88ff
},

STAMINA:{
name:"Stamina",
speed:.95,
damage:.9,
defense:1,
stamina:1.55,
color:0x00e676
},

BALANCE:{
name:"Balance",
speed:1.05,
damage:1.05,
defense:1.05,
stamina:1.05,
color:0xffd600
}

};

const KEYS=Object.keys(TYPES);

export function randomType(){

return TYPES[
KEYS[
Math.floor(Math.random()*KEYS.length)
]
];

}

export function applyStats(top,type){

top.type=type;

top.maxRPM=Math.floor(
3500*type.stamina
);

top.rpm=top.maxRPM;

top.maxSpeed*=type.speed;

top.attackMultiplier=type.damage;

top.defenseMultiplier=type.defense;

if(
top.mesh&&
top.mesh.userData&&
top.mesh.userData.metal
){

top.mesh.userData.metal.material.color.setHex(
type.color
);

top.mesh.userData.metal.material.emissive.setHex(
type.color
);

}

}

export function rpmPercent(top){

return Math.max(
0,
top.rpm/top.maxRPM
);

}

export function hitDamage(
attacker,
defender,
base
){

return(
base*
attacker.attackMultiplier/
defender.defenseMultiplier
);

}

export function topName(type,index){

return`${type.name} Top ${index}`;

}