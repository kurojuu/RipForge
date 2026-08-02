// launch.js
export class Launcher {
  constructor() {
    this.duration = 2.0;
    this.elapsed = 0;
    this.running = false;
    this.onLaunch = null;
    this.shakeCount = 0;
    
    this.lastX = null;
    this.lastY = null;
    this.lastZ = null;
    this.threshold = 15;
  }

  start() {
    this.running = true;
    this.elapsed = 0;
    this.shakeCount = 0;
    
    // Add runtime listener to track physical launch velocity
    window.addEventListener("devicemotion", this.handleMotion.bind(this));
    
    // Injected display overlay indicator for countdown visibility
    const indicator = document.createElement("div");
    indicator.id = "launchCountdownOverlay";
    indicator.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:sans-serif;font-size:48px;font-weight:bold;color:#ffea00;z-index:99999;text-shadow:0 0 10px rgba(0,0,0,0.8);pointer-events:none;";
    indicator.innerText = "READY...";
    document.body.appendChild(indicator);
  }

  handleMotion(e) {
    if (!this.running) return;
    const acc = e.acceleration || e.accelerationIncludingGravity;
    if (!acc) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    if (this.lastX !== null) {
      const deltaX = Math.abs(x - this.lastX);
      const deltaY = Math.abs(y - this.lastY);
      const deltaZ = Math.abs(z - this.lastZ);

      if (deltaX + deltaY + deltaZ > this.threshold) {
        this.shakeCount++;
      }
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
  }

  update(dt) {
    if (!this.running) return;

    this.elapsed += dt;
    const remaining = Math.ceil(this.duration - this.elapsed);
    
    const overlay = document.getElementById("launchCountdownOverlay");
    if (overlay) {
      overlay.innerText = remaining > 0 ? remaining : "LET IT RIP!";
    }

    if (this.elapsed >= this.duration) {
      this.running = false;
      window.removeEventListener("devicemotion", this.handleMotion.bind(this));
      
      if (overlay) overlay.remove();

      // Calculate final input RPM baseline based on movement tracking metrics
      const calculatedRPM = 3000 + Math.min(this.shakeCount * 45, 1500);
      
      if (this.onLaunch) {
        this.onLaunch(calculatedRPM);
      }
    }
  }
}