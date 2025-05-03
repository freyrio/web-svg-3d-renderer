import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4'; // Prototype doesn't explicitly use Matrix4 here, but needed for Vector3 methods potentially
import { Camera } from '../cameras/Camera'; // Base camera type
import { degToRad, radToDeg } from '../math/utils';

/**
 * Controls for orbiting the camera around a target point.
 * Allows rotation, panning, and zooming with mouse input.
 */
export class OrbitController {
  /**
   * Create new OrbitController
   * @param {Camera} camera - The camera to control
   * @param {Vector3} target - The target point to orbit around
   */
  constructor(camera, target = new Vector3()) {
    if (!camera) {
      throw new Error("OrbitController: Camera must be provided.");
    }
    this.camera = camera;
    this.target = target.clone();  // Clone target
    
    // Configuration from prototype
    this.distance = 8;
    this.phi = Math.PI / 2;     // Vertical angle (radians)
    this.theta = 0;             // Horizontal angle (radians)
    this.autoRotate = true;
    this.autoRotateSpeed = 1.5; // Degrees per second
    this.enabled = true;
    this.minDistance = 2;
    this.maxDistance = 20;
    this.minPolarAngle = 0.1;   // Radians (~5 degrees from pole)
    this.maxPolarAngle = Math.PI - 0.1; // Radians (~5 degrees from other pole)
    this.mouseRotationSpeed = 0.005; // Radians per pixel dragged
    this.zoomSpeed = 1.0; // *** ADJUSTED for multiplicative zoom ***

    // State
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.domElement = null; // Reference to the element listeners are attached to

    // Initialize camera position
    this._updateCameraPosition();
    console.log(`[OrbitController Constructor] Initial distance set to: ${this.distance}`); // Log initial distance
  }
  
  /**
   * Updates the camera position based on spherical coordinates and
   * directly sets the view matrix for the camera.
   * @private
   */
  _updateCameraPosition() {
    if (!this.enabled) return;

    // Spherical to Cartesian calculation for camera position
    const sinPhi = Math.sin(this.phi);
    const cosPhi = Math.cos(this.phi);
    const sinTheta = Math.sin(this.theta);
    const cosTheta = Math.cos(this.theta);
    
    // Calculate the new camera position
    const newPosition = new Vector3(
      this.target.x + this.distance * sinPhi * sinTheta,
      this.target.y + this.distance * cosPhi,
      this.target.z + this.distance * sinPhi * cosTheta
    );
    this.camera.position.copy(newPosition); // Update camera position property
    
    // Use the standard makeLookAt method to set the view matrix
    const worldUp = new Vector3(0, 1, 0); // Define world up direction
    this.camera.viewMatrix.makeLookAt(this.camera.position, this.target, worldUp);
    
    // Update dependent matrices
    this.camera.updateViewProjectionMatrix();
    
    // Update camera world matrix (inverse of view matrix)
    this.camera.worldMatrix.copy(this.camera.viewMatrix).invert();
  }
  
  /**
   * Enable mouse controls
   * @param {HTMLElement} element - The DOM element to attach listeners to
   */
  enableMouseControls(element) {
    if (!element) {
      console.error("OrbitController: DOM element not provided for mouse controls.");
      return;
    }
    this.domElement = element;
    
    // Bind event handlers to this instance
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onMouseWheel = this._onMouseWheel.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onContextMenu = (e) => { e.preventDefault(); }; // Prevent context menu
  
    // Add listeners directly to the provided element
    element.addEventListener('mousedown', this._onMouseDown);
    element.addEventListener('wheel', this._onMouseWheel, { passive: false });
    element.addEventListener('contextmenu', this._onContextMenu);
    // Keydown listener on window (for Space key)
    window.addEventListener('keydown', this._onKeyDown);
    
    // Update info text (specific to prototype example)
    const infoElement = document.getElementById('info');
    if (infoElement) {
        infoElement.innerHTML = '3D SVG Renderer - Mouse: Drag to rotate, Wheel to zoom, Space to toggle auto-rotation';
    }
  }

  /**
   * Remove event listeners
   */
  dispose() {
      if (!this.domElement) return;
    this.domElement.removeEventListener('mousedown', this._onMouseDown);
    this.domElement.removeEventListener('wheel', this._onMouseWheel);
    this.domElement.removeEventListener('contextmenu', this._onContextMenu);
      // Remove global listeners added during drag
      window.removeEventListener('mousemove', this._onMouseMove);
      window.removeEventListener('mouseup', this._onMouseUp);
      window.removeEventListener('keydown', this._onKeyDown);
      this.domElement = null; // Clear reference
  }
  
  /**
   * Handle mouse down events
   * @param {MouseEvent} event - The mouse event
   * @private
   */
  _onMouseDown(event) {
    if (!this.enabled || event.button !== 0) return; // Only left mouse button
    this.isDragging = true;
    this.prevMouseX = event.clientX;
    this.prevMouseY = event.clientY;
    this.autoRotate = false; // Stop auto-rotate
      
    // Add global listeners for move/up only during drag
    window.addEventListener('mousemove', this._onMouseMove);
    window.addEventListener('mouseup', this._onMouseUp);
      event.preventDefault();
  }
  
  /**
   * Handle mouse move events
   * @param {MouseEvent} event - The mouse event
   * @private
   */
  _onMouseMove(event) {
    if (!this.enabled || !this.isDragging) return;
    
    const deltaX = event.clientX - this.prevMouseX;
    const deltaY = event.clientY - this.prevMouseY;
    
    // Update angles (theta = horizontal, phi = vertical)
    this.theta -= deltaX * this.mouseRotationSpeed;
    this.phi -= deltaY * this.mouseRotationSpeed; // Y-down screen coords mean drag up = negative deltaY -> increase phi
    
    // Keep theta in [0, 2*PI]
    this.theta %= (2 * Math.PI);
    if (this.theta < 0) this.theta += (2 * Math.PI);
    
    // Clamp phi 
    this.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.phi));
    
    this._updateCameraPosition();
    
    this.prevMouseX = event.clientX;
    this.prevMouseY = event.clientY;
    event.preventDefault();
  }
  
  /**
   * Handle mouse up events
   * @param {MouseEvent} event - The mouse event
   * @private
   */
  _onMouseUp(event) {
    if (!this.enabled || event.button !== 0) return;
    this.isDragging = false;
    // Remove global listeners
    window.removeEventListener('mousemove', this._onMouseMove);
    window.removeEventListener('mouseup', this._onMouseUp);
  }
  
  /**
   * Handle mouse wheel events
   * @param {WheelEvent} event - The wheel event
   * @private
   */
  _onMouseWheel(event) {
    if (!this.enabled) return;
    
    console.log(`[Zoom Debug] Start: distance=${this.distance.toFixed(4)}, deltaY=${event.deltaY}`);
    
    // Calculate zoom factor (multiplicative)
    // Adjust sensitivity as needed
    const zoomFactor = Math.pow(0.95, event.deltaY * this.zoomSpeed * 0.05);
    console.log(`[Zoom Debug] Calculated zoomFactor: ${zoomFactor.toFixed(4)}`);
    
    const distanceBefore = this.distance;
    this.distance *= zoomFactor;
    console.log(`[Zoom Debug] Distance after multiply: ${this.distance.toFixed(4)} (was ${distanceBefore.toFixed(4)})`);
    
    // *** Add Check ***
    if (!Number.isFinite(this.distance)) {
        console.error(`[Zoom Error] Distance became non-finite: ${this.distance}. Resetting.`);
        // Attempt to reset to a sane value? Maybe midpoint?
        this.distance = (this.minDistance + this.maxDistance) / 2; 
    }
    
    // Clamp distance
    const distanceBeforeClamp = this.distance;
    this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance));
    if (this.distance !== distanceBeforeClamp) {
      console.log(`[Zoom Debug] Distance clamped to: ${this.distance.toFixed(4)} (min=${this.minDistance}, max=${this.maxDistance})`);
    }
    
    this._updateCameraPosition();
    event.preventDefault();
  }
  
  /**
   * Handle key down events
   * @param {KeyboardEvent} event - The keyboard event
   * @private
   */
  _onKeyDown(event) {
    if (!this.enabled || event.code !== 'Space') return;
    this.autoRotate = !this.autoRotate;
    event.preventDefault();
  }
  
  /**
   * Handle context menu (right-click) events
   * @param {MouseEvent} event - The mouse event
   * @private
   */
  _onContextMenu(event) {
    // Prevent context menu if right mouse button is used for panning
    if (event.button === 2) {
      event.preventDefault();
    }
  }
  
  /**
   * Update the controller state (e.g., for auto-rotation)
   * @param {number} deltaTime - Time since last frame in seconds
   * @returns {OrbitController} - This instance for chaining
   */
  update(deltaTime = 1/60) {
    if (!this.enabled) return;
    
    if (this.autoRotate && !this.isDragging) {
      const rotateSpeedRad = this.autoRotateSpeed * (Math.PI / 180);
      this.theta += rotateSpeedRad * deltaTime;
      this.theta %= (2 * Math.PI); 
      this._updateCameraPosition();
    }
    
    // No explicit matrix updates needed here, handled by _updateCameraPosition
    return this;
  }
} 