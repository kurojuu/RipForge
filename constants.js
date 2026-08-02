// constants.js
// NEW FILE
// Shared gameplay constants.
// constants.js
export const PROJECT_NAME = "RipForge";
export const GAME={

ARENA_RADIUS:7.2,

PLAYER_START_RPM:3500,

ENEMY_MIN_RPM:2800,
ENEMY_MAX_RPM:3600,

TOP_RADIUS:.45,

PLAYER_MAX_SPEED:7,
ENEMY_MAX_SPEED:6,

PLAYER_ACCEL:8,
ENEMY_ACCEL:7,

WALL_BOUNCE:.85,

FRICTION:.985,

BASE_RPM_DRAIN:5,

WALL_RPM_DAMAGE:40,

COLLISION_IMPULSE:1.7,

COLLISION_DAMAGE:28,

HEAVY_HIT:12,

CAMERA_HEIGHT:13,

CAMERA_DISTANCE:8,

CAMERA_MIN_ZOOM:5,

CAMERA_MAX_ZOOM:18,

SPARK_COUNT:180,

MAX_COLLISION_PARTICLES:35,

COMMENTARY_INTERVAL:3500,

SHAKE_DECAY:.88,

SHAKE_LIMIT:.3

};

export const COLORS=[

0x1E88FF,
0xFF2A2A,
0xFFD400,
0x00E676,
0x9C27B0,
0x00E5FF,
0xFF6D00,
0xFFFFFF

];

export const ANNOUNCER_LINES={

LET_IT_RIP:[
"LET IT RIP!"
],

BIG_HIT:[

"Massive collision!",

"What an impact!",

"That was unbelievable!",

"Direct hit!",

"The stadium is shaking!"

],

LOW_PLAYER:[

"Your Beyblade is losing power!",

"Careful! RPM is dropping!",

"Hold your ground!"

],

LOW_ENEMY:[

"One enemy is almost finished!",

"They're losing RPM!",

"Finish them!"

],

ONE_LEFT:[

"Only one opponent remains!",

"One more to go!",

"The final opponent stands!"

],

COMEBACK:[

"Incredible comeback!",

"The battle has turned around!",

"This match isn't over yet!"

],

VICTORY:[

"Victory!",

"Outstanding performance!",

"You are the champion!"

],

DEFEAT:[

"Defeat!",

"Fight again and improve!",

"Better luck next battle!"

]

};

export function randomColor(){

return COLORS[
Math.floor(Math.random()*COLORS.length)
];

}

export function randomLine(group){

return group[
Math.floor(Math.random()*group.length)
];

}
