// effects.js
// COMPLETE REPLACEMENT

export class Effects {
  
  constructor(scene, camera) {
    
    this.scene = scene;
    this.camera = camera;
    
    this.flash =
      document.getElementById("flash");
    
    this.combo =
      document.getElementById("combo");
    
    this.subtitle =
      document.getElementById("subtitle");
    
    this.powerup =
      document.getElementById("powerup");
    
    this.message =
      document.getElementById("message");
    
    this.cameraRig = null;
    
  }
  
  setCamera(cameraRig) {
    
    this.cameraRig = cameraRig;
    
  }
  
  update() {}
  
  emitBurst(x, z, power) {
    
    if (this.flash) {
      
      this.flash.classList.remove("show");
      
      void this.flash.offsetWidth;
      
      this.flash.classList.add("show");
      
    }
    
    if (this.cameraRig) {
      
      this.cameraRig.shake(
        
        Math.min(
          0.45,
          power * 0.02
        ),
        
        0.18
        
      );
      
    }
    
  }
  
  showCombo(value) {
    
    if (!this.combo) return;
    
    this.combo.textContent =
      
      value + " HIT COMBO!";
    
    this.combo.classList.remove(
      "show"
    );
    
    void this.combo.offsetWidth;
    
    this.combo.classList.add(
      "show"
    );
    
  }
  
  subtitleText(text, time = 1800) {
    
    if (!this.subtitle) return;
    
    this.subtitle.textContent = text;
    
    this.subtitle.classList.add(
      "show"
    );
    
    clearTimeout(
      this.subtitleTimer
    );
    
    this.subtitleTimer = setTimeout(() => {
      
      this.subtitle.classList.remove(
        "show"
      );
      
    }, time);
    
  }
  
  powerupText(text, time = 1800) {
    
    if (!this.powerup) return;
    
    this.powerup.textContent = text;
    
    this.powerup.classList.add(
      "show"
    );
    
    clearTimeout(
      this.powerTimer
    );
    
    this.powerTimer = setTimeout(() => {
      
      this.powerup.classList.remove(
        "show"
      );
      
    }, time);
    
  }
  
  showWinner() {
    
    if (!this.message) return;
    
    this.message.style.display = "block";
    
    this.message.className = "win";
    
    this.message.textContent =
      
      "🏆 YOU WIN 🏆";
    
  }
  
  showLoser() {
    
    if (!this.message) return;
    
    this.message.style.display = "block";
    
    this.message.className = "lose";
    
    this.message.textContent =
      
      "☠ YOU LOSE ☠";
    
  }
  
  hideMessage() {
    
    if (!this.message) return;
    
    this.message.style.display = "none";
    
    this.message.className = "";
    
  }
  
}