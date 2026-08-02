// joystick.js
export class Joystick {
  constructor() {
    this.active = false;
    this.identifier = null;
    
    this.baseRadius = 240;   // 4x larger
    this.knobRadius = 100;   // 4x larger
    this.deadzone = 0.12;
    
    this.centerX = 0;
    this.centerY = 0;
    this.currentX = 0;
    this.currentY = 0;
    
    this.outputX = 0;
    this.outputY = 0;
    
    this.container = null;
    this.base = null;
    this.knob = null;
    
    this._boundTouchStart = this._onTouchStart.bind(this);
    this._boundTouchMove = this._onTouchMove.bind(this);
    this._boundTouchEnd = this._onTouchEnd.bind(this);
    this._boundMouseDown = this._onMouseDown.bind(this);
    this._boundMouseMove = this._onMouseMove.bind(this);
    this._boundMouseUp = this._onMouseUp.bind(this);
    
    this._buildDOM();
    this._attachEvents();
  }
  
  _buildDOM() {
    this.container = document.createElement("div");
    this.container.id = "virtual-joystick";
    this.container.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 30px;
      width: ${this.baseRadius * 2}px;
      height: ${this.baseRadius * 2}px;
      z-index: 99999;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      pointer-events: auto;
    `;
    
    this.base = document.createElement("div");
    this.base.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: 3px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 0 25px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
    `;
    
    this.knob = document.createElement("div");
    this.knob.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      width: ${this.knobRadius * 2}px;
      height: ${this.knobRadius * 2}px;
      margin-left: -${this.knobRadius}px;
      margin-top: -${this.knobRadius}px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      border: 2px solid rgba(255, 255, 255, 0.45);
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
      transition: transform 0.05s ease-out;
      pointer-events: none;
    `;
    
    this.container.appendChild(this.base);
    this.container.appendChild(this.knob);
    document.body.appendChild(this.container);
    
    const rect = this.container.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
  }
  
  _attachEvents() {
    this.container.addEventListener("touchstart", this._boundTouchStart, { passive: false });
    window.addEventListener("touchmove", this._boundTouchMove, { passive: false });
    window.addEventListener("touchend", this._boundTouchEnd, { passive: false });
    window.addEventListener("touchcancel", this._boundTouchEnd, { passive: false });
    
    this.container.addEventListener("mousedown", this._boundMouseDown);
    window.addEventListener("mousemove", this._boundMouseMove);
    window.addEventListener("mouseup", this._boundMouseUp);
  }
  
  _getLocalPos(clientX, clientY) {
    return {
      x: clientX - this.centerX,
      y: clientY - this.centerY
    };
  }
  
  _clampToRadius(x, y, radius) {
    const dist = Math.sqrt(x * x + y * y);
    if (dist <= radius) return { x, y };
    const ratio = radius / dist;
    return { x: x * ratio, y: y * ratio };
  }
  
  _updateKnob(dx, dy) {
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    
    let nx = dx / this.baseRadius;
    let ny = dy / this.baseRadius;
    
    const dist = Math.sqrt(nx * nx + ny * ny);
    if (dist < this.deadzone) {
      nx = 0;
      ny = 0;
    } else {
      const scale = (dist - this.deadzone) / (1 - this.deadzone);
      const ratio = scale / dist;
      nx *= ratio;
      ny *= ratio;
    }
    
    this.outputX = nx;
    this.outputY = ny;
  }
  
  _resetKnob() {
    this.active = false;
    this.identifier = null;
    this.knob.style.transform = `translate(0px, 0px)`;
    this.outputX = 0;
    this.outputY = 0;
  }
  
  _onTouchStart(e) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    this.active = true;
    this.identifier = touch.identifier;
    
    const rect = this.container.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
    
    const local = this._getLocalPos(touch.clientX, touch.clientY);
    const clamped = this._clampToRadius(local.x, local.y, this.baseRadius);
    this._updateKnob(clamped.x, clamped.y);
  }
  
  _onTouchMove(e) {
    if (!this.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === this.identifier) {
        e.preventDefault();
        const local = this._getLocalPos(touch.clientX, touch.clientY);
        const clamped = this._clampToRadius(local.x, local.y, this.baseRadius);
        this._updateKnob(clamped.x, clamped.y);
        break;
      }
    }
  }
  
  _onTouchEnd(e) {
    if (!this.active) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.identifier) {
        e.preventDefault();
        this._resetKnob();
        break;
      }
    }
  }
  
  _onMouseDown(e) {
    e.preventDefault();
    this.active = true;
    this.identifier = "mouse";
    
    const rect = this.container.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
    
    const local = this._getLocalPos(e.clientX, e.clientY);
    const clamped = this._clampToRadius(local.x, local.y, this.baseRadius);
    this._updateKnob(clamped.x, clamped.y);
  }
  
  _onMouseMove(e) {
    if (!this.active || this.identifier !== "mouse") return;
    const local = this._getLocalPos(e.clientX, e.clientY);
    const clamped = this._clampToRadius(local.x, local.y, this.baseRadius);
    this._updateKnob(clamped.x, clamped.y);
  }
  
  _onMouseUp(e) {
    if (!this.active || this.identifier !== "mouse") return;
    this._resetKnob();
  }
  
  getInput() {
    return { x: this.outputX, y: this.outputY };
  }
  
  destroy() {
    this.container.removeEventListener("touchstart", this._boundTouchStart);
    window.removeEventListener("touchmove", this._boundTouchMove);
    window.removeEventListener("touchend", this._boundTouchEnd);
    window.removeEventListener("touchcancel", this._boundTouchEnd);
    this.container.removeEventListener("mousedown", this._boundMouseDown);
    window.removeEventListener("mousemove", this._boundMouseMove);
    window.removeEventListener("mouseup", this._boundMouseUp);
    
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
