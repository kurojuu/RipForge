// replay.js
// Slow-motion replay recorder for big collisions.

import * as THREE from "./three.module.js";

export class Replay {
  constructor() {
    this.frames = [];
    this.maxFrames = 300;
    this.recording = true;
    this.playing = false;
    this.index = 0;
    this.speed = 0.35;
  }

  record(player, enemies) {
    if (!this.recording) return;

    const frame = {
      player: {
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
        r: player.mesh.rotation.y,
        rpm: player.rpm
      },
      enemies: []
    };

    for (const e of enemies.list) {
      frame.enemies.push({
        x: e.position.x,
        y: e.position.y,
        z: e.position.z,
        r: e.mesh.rotation.y,
        rpm: e.rpm
      });
    }

    this.frames.push(frame);
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }
  }

  trigger() {
    if (this.frames.length < 60) return;
    this.playing = true;
    this.recording = false;
    this.index = 0;
  }

  update(player, enemies) {
    if (!this.playing) return false;

    const f = this.frames[this.index];
    if (!f) {
      this.playing = false;
      this.recording = true;
      this.frames.length = 0;
      return false;
    }

    player.position.set(f.player.x, f.player.y, f.player.z);
    player.mesh.rotation.y = f.player.r;

    // FIXED: Proper enemy restore loop
    for (let i = 0; i < enemies.list.length && i < f.enemies.length; i++) {
      const ef = f.enemies[i];
      const e = enemies.list[i];
      if (ef && e) {
        e.position.set(ef.x, ef.y, ef.z);
        e.mesh.rotation.y = ef.r;
      }
    }

    this.index++;

    if (this.index >= this.frames.length) {
      this.playing = false;
      this.recording = true;
      this.frames.length = 0;
    }

    return true;
  }

  clear() {
    this.frames.length = 0;
    this.playing = false;
    this.recording = true;
    this.index = 0;
  }
}
