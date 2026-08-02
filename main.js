import * as THREE from "./three.module.js";
import { createArena } from "./arena.js";
import { PlayerTop } from "./player.js";
import { EnemyManager } from "./enemy.js";
import { Physics } from "./physics.js";
import { UI } from "./ui.js";
import { GameCamera } from "./camera.js";
import { Effects } from "./effects.js";
import { ParticleSystem } from "./particles.js";
import { SFX } from "./sfx.js";
import { Announcer } from "./announcer.js";
import { GameState } from "./gamestate.js";
import { Input } from "./input.js";
import { Launcher } from "./launch.js";
import { PowerUpManager } from "./powerups.js";
import { Replay } from "./replay.js";
import { Joystick } from "./joystick.js";

function timeLog(label, fn) {
    const t0 = performance.now();
    const result = fn();
    const t1 = performance.now();
    if (t1 - t0 > 16) console.warn(`[SLOW] ${label} took ${(t1 - t0).toFixed(1)}ms`);
    return result;
}

export const Game = {
    scene: null, camera: null, renderer: null, clock: new THREE.Clock(),
    player: null, enemies: null, physics: null, cameraRig: null,
    effects: null, particles: null, audio: null, announcer: null,
    input: null, launcher: null, powerups: null, replay: null,
    state: null, isRoundStarted: false, joystick: null,

    async init() {
        window.Game = this;
        const canvas = document.getElementById("game");
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 10, 12.5);

        const hemi = new THREE.HemisphereLight(0xbbdffff, 0x444466, 0.6);
        this.scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 0.8);
        dir.position.set(10, 20, 15);
        this.scene.add(dir);

        this.audio = new SFX();
        await this.audio.start();

        createArena(this.scene);
        this.player = new PlayerTop(this.scene);
        this.enemies = new EnemyManager(this.scene, this.player);

        this.announcer = new Announcer();
        this.effects = new Effects(this.scene, this.camera);
        this.particles = new ParticleSystem(this.scene);
        this.cameraRig = new GameCamera(this.camera, this.player);
        this.powerups = new PowerUpManager(this.scene, this.player, this.enemies);
        this.replay = new Replay();
        this.launcher = new Launcher();
        this.physics = new Physics(this.player, this.enemies);

        this.physics.setManagers({ 
            particles: this.particles, 
            audio: this.audio, 
            announcer: this.announcer, 
            replay: this.replay 
        });

        this.state = new GameState(this.player, this.enemies, this.effects, this.audio, this.announcer);

        this.launcher.onLaunch = (rpm) => {
            this.player.maxRPM = Math.max(3000, rpm);
            this.player.rpm = this.player.maxRPM;
            this.isRoundStarted = true;
            this.state.start();
        };

        this.launcher.start();
        UI.init(this.player, this.enemies);
        this.input = new Input();
	this.joystick = new Joystick();
        await this.input.requestPermission();

        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        this.loop();
    },

    loop() {
        requestAnimationFrame(() => this.loop());
        const frameT0 = performance.now();
        const dt = Math.min(this.clock.getDelta(), 0.033);

        if (this.launcher?.running) {
            timeLog("launcher.update", () => this.launcher.update(dt));
        }
        
        if (this.replay?.playing) {
            this.replay.update(this.player, this.enemies);
            this.renderer.render(this.scene, this.camera);
            return;
        }

        // Visual sync
        if (this.player?.mesh && this.player?.position) {
            this.player.mesh.position.copy(this.player.position);
        }
        if (this.enemies?.list) {
            for (let i = 0; i < this.enemies.list.length; i++) {
                const e = this.enemies.list[i];
                if (e?.mesh && e?.position) e.mesh.position.copy(e.position);
            }
        }
        timeLog("cameraRig.update", () => this.cameraRig?.update(dt));

	// Merge joystick input into Game.input
	if (this.joystick && this.joystick.active) {
	    const j = this.joystick.getInput();
	    // Invert Y because screen Y is down but game Z is forward
	    this.input.tiltX = j.x;
	    this.input.tiltY = j.y;
	}

        // Game logic
        if (this.isRoundStarted && this.state && !this.state.isFinished()) {
            timeLog("player.update", () => this.player?.update(dt));
            timeLog("enemies.update", () => this.enemies?.update(dt));
            timeLog("physics.update", () => this.physics?.update(dt));

            if (this.player?.rpm > 1) {
                timeLog("emitTrail+Audio", () => {
                    this.particles?.emitTrail(this.player, this.particles.trailForRPM(this.player.rpm));
                    this.audio?.updateMotorRPM?.(this.player.rpm, this.player.maxRPM);
                });
            }

            if (this.enemies?.list) {
                for (let i = 0; i < this.enemies.list.length; i++) {
                    const e = this.enemies.list[i];
                    if (e?.rpm > 1) {
                        this.particles?.emitTrail(e, this.particles.trailForRPM(e.rpm));
                    }
                }
            }

            timeLog("particles.update", () => this.particles?.update(dt));
            timeLog("powerups.update", () => this.powerups?.update(dt));
            timeLog("effects.update", () => this.effects?.update(dt));
            timeLog("replay.record", () => this.replay?.record(this.player, this.enemies));
            timeLog("state.update", () => this.state?.update());
        }

        // Kill-switch
        if (this.isRoundStarted && this.state && !this.state.isFinished() && this.player && this.player.rpm <= 1) {
            console.error("[KILL-SWITCH] Forcing defeat");
            this.state.forceDefeat();
        }

        timeLog("UI.update", () => UI.update());
        timeLog("renderer.render", () => this.renderer.render(this.scene, this.camera));

        const frameTotal = performance.now() - frameT0;
        if (frameTotal > 50) console.error(`[FRAME TOTAL] ${frameTotal.toFixed(1)}ms — SLOW FRAME`);
    }
};

const btn = document.getElementById("startBtn");
if (btn) btn.onclick = async () => { btn.remove(); await Game.init(); };
