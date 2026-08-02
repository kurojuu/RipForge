import * as THREE from "./three.module.js";

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.sparkCount = 300;
        this.sparkGeometry = new THREE.BufferGeometry();
        this.sparkGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.sparkCount * 3), 3));
        this.sparkVelocities = new Float32Array(this.sparkCount * 3);
        this.sparkLifetimes = new Float32Array(this.sparkCount).fill(0);
        this.sparkMaterial = new THREE.PointsMaterial({ color: 0xffaa00, size: 0.15, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
        this.sparkPoints = new THREE.Points(this.sparkGeometry, this.sparkMaterial);
        this.scene.add(this.sparkPoints);
        this.activeSparksIndex = 0;
    }

    emitSparks(position) {
        const posAttr = this.sparkGeometry.attributes.position;
        for (let i = 0; i < 15; i++) {
            const idx = (this.activeSparksIndex + i) % this.sparkCount;
            posAttr.array[idx * 3] = position.x;
            posAttr.array[idx * 3 + 1] = position.y;
            posAttr.array[idx * 3 + 2] = position.z;
            this.sparkVelocities[idx * 3] = (Math.random() - 0.5) * 6;
            this.sparkVelocities[idx * 3 + 1] = Math.random() * 4 + 2;
            this.sparkVelocities[idx * 3 + 2] = (Math.random() - 0.5) * 6;
            this.sparkLifetimes[idx] = 0.5;
        }
        this.activeSparksIndex = (this.activeSparksIndex + 15) % this.sparkCount;
        posAttr.needsUpdate = true;
    }

    emitTrail(topInstance, trailType) {
        // SAFETY: Don't emit for dead or nearly-dead tops
        if (!topInstance?.rpm || topInstance.rpm <= 1 || !topInstance.position) return;
        
        if (typeof topInstance.addTrailNode === 'function') {
            topInstance.addTrailNode(topInstance.position, trailType);
        }
    }

    trailForRPM(rpm) {
        if (!rpm || rpm <= 1) return null;
        return rpm > 2500 ? 'spark_heavy' : (rpm > 1200 ? 'spark_medium' : 'spark_light');
    }

    update(dt) {
        const posAttr = this.sparkGeometry.attributes.position;
        let dirty = false;
        for (let i = 0; i < this.sparkCount; i++) {
            if (this.sparkLifetimes[i] > 0) {
                this.sparkLifetimes[i] -= dt;
                posAttr.array[i * 3] += this.sparkVelocities[i * 3] * dt;
                posAttr.array[i * 3 + 1] += this.sparkVelocities[i * 3 + 1] * dt;
                posAttr.array[i * 3 + 2] += this.sparkVelocities[i * 3 + 2] * dt;
                this.sparkVelocities[i * 3 + 1] -= 9.8 * dt;
                dirty = true;
            }
        }
        if (dirty) posAttr.needsUpdate = true;
    }

    cleanup() {
        // Clear all active sparks immediately
        this.sparkLifetimes.fill(0);
        const posAttr = this.sparkGeometry.attributes.position;
        posAttr.array.fill(0);
        posAttr.needsUpdate = true;
    }
}