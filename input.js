// input.js
export class Input {
  constructor() {
    this.tiltX = 0;
    this.tiltY = 0;
    this.shakeDetected = false;
    this.zoomDelta = 0;
    
    this.calibrated = false;
    this.biasX = 0;
    this.biasY = 0;

    // Scale mapping sensitivity value - amplifies movements cleanly across full viewport span
    this.sensitivityScale = 1.85;

    window.addEventListener("wheel", (e) => { this.zoomDelta += e.deltaY * 0.005; });
  }

  async requestPermission() {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", (e) => this.handleOrientation(e));
        }
      } catch (err) {
        console.error("Orientation access denied:", err);
      }
    } else {
      window.addEventListener("deviceorientation", (e) => this.handleOrientation(e));
    }
  }

  handleOrientation(e) {
    let rawX = e.gamma || 0; // [-90, 90] Tilt Left/Right
    let rawY = e.beta || 0;  // [-180, 180] Tilt Front/Back

    // Auto-calibrate center frame on first incoming stream signature
    if (!this.calibrated) {
      this.biasX = rawX;
      this.biasY = rawY;
      this.calibrated = true;
    }

    // Apply relative orientation centering matrix offsets
    let centeredX = rawX - this.biasX;
    let centeredY = rawY - this.biasY;

    // Clamp input ranges safely inside operational boundaries
    centeredX = Math.max(-30, Math.min(30, centeredX));
    centeredY = Math.max(-30, Math.min(30, centeredY));

    // Map normalize ranges [-1, 1] scaled fully across total display width and length span
    this.tiltX = (centeredX / 30) * this.sensitivityScale;
    this.tiltY = (centeredY / 30) * this.sensitivityScale;
  }

  consumeShake() {
    if (this.shakeDetected) {
      this.shakeDetected = false;
      return true;
    }
    return false;
  }

  consumeZoom() {
    const z = this.zoomDelta;
    this.zoomDelta = 0;
    return z;
  }
}