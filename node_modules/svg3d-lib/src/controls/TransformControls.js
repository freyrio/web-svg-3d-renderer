import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Matrix4 } from '../math/Matrix4';
import { degToRad, radToDeg } from '../math/utils';
import { Object3D } from '../core/Object3D';

/**
 * Controls for transforming objects in the scene.
 * Allows translation, rotation, and scaling with mouse input.
 */
export class TransformControls {
  /**
   * Create new TransformControls
   * @param {Camera} camera - The camera to use for transformation
   * @param {HTMLElement} domElement - The DOM element to attach listeners to
   */
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement || document;
    
    // Target object to transform
    this.object = null;
    
    // Transform mode
    this.mode = 'translate'; // 'translate', 'rotate', 'scale'
    
    // Enable states
    this.enabled = true;
    this.axis = null; // current axis being transformed ('x', 'y', 'z', null)
    
    // Visual helpers (to be implemented when we have SVG helpers)
    this.helpers = {
      translate: null,
      rotate: null,
      scale: null
    };
    
    // Internal state
    this.state = {
      dragging: false
    };
    
    // Mouse positions
    this.mousePosition = { x: 0, y: 0 };
    this.prevMousePosition = { x: 0, y: 0 };
    
    // Debug
    this.debug = false;
    
    // Bind event handlers
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onContextMenu = this._onContextMenu.bind(this);
    
    // Initialize
    this._addEventListeners();
  }
  
  /**
   * Add event listeners to the DOM element
   * @private
   */
  _addEventListeners() {
    this.domElement.addEventListener('mousedown', this._onMouseDown, false);
    this.domElement.addEventListener('contextmenu', this._onContextMenu, false);
    
    // Debug log
    if (this.debug) {
      console.log('TransformControls: Event listeners added to', this.domElement);
    }
  }
  
  /**
   * Remove event listeners from the DOM element
   * @private
   */
  _removeEventListeners() {
    this.domElement.removeEventListener('mousedown', this._onMouseDown);
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    this.domElement.removeEventListener('contextmenu', this._onContextMenu);
  }
  
  /**
   * Handle mouse down events
   * @param {MouseEvent} event - The mouse event
   * @private
   */
  _onMouseDown(event) {
    if (!this.enabled || !this.object) return;
    
    // Get mouse position relative to the element
    const rect = this.domElement.getBoundingClientRect();
    
    // Store initial mouse position
    this.mousePosition.x = event.clientX - rect.left;
    this.mousePosition.y = event.clientY - rect.top;
    this.prevMousePosition.x = this.mousePosition.x;
    this.prevMousePosition.y = this.mousePosition.y;
    
    // Determine which axis is being manipulated (simplified for now)
    // In a real implementation, this would check intersection with control handles
    this.axis = this._getSelectedAxis(this.mousePosition);
    
    if (this.axis) {
      // Start dragging
      this.state.dragging = true;
      
      // Add document-level event listeners
      document.addEventListener('mousemove', this._onMouseMove, false);
      document.addEventListener('mouseup', this._onMouseUp, false);
      
      // Debug log
      if (this.debug) {
        console.log(`TransformControls: Mouse down - Mode: ${this.mode}, Axis: ${this.axis}`);
      }
      
      // Prevent default behavior
      event.preventDefault();
    }
  }
  
  /**
   * Handle mouse move events
   * @param {MouseEvent} event - The mouse event
   * @private
   */
  _onMouseMove(event) {
    if (!this.enabled || !this.object || !this.state.dragging) return;
    
    // Get mouse position relative to the element
    const rect = this.domElement.getBoundingClientRect();
    
    // Store current mouse position
    this.mousePosition.x = event.clientX - rect.left;
    this.mousePosition.y = event.clientY - rect.top;
    
    // Calculate delta from last position
    const deltaX = this.mousePosition.x - this.prevMousePosition.x;
    const deltaY = this.mousePosition.y - this.prevMousePosition.y;
    
    // Only process if there's actual movement
    if (deltaX !== 0 || deltaY !== 0) {
      // Handle transform based on current mode
      switch (this.mode) {
        case 'translate':
          this._handleTranslate(deltaX, deltaY);
          break;
        case 'rotate':
          this._handleRotate(deltaX, deltaY);
          break;
        case 'scale':
          this._handleScale(deltaX, deltaY);
          break;
      }
      
      // Debug log
      if (this.debug) {
        console.log(`TransformControls: Mouse move - Delta: (${deltaX}, ${deltaY}), Object Position: (${this.object.position.x.toFixed(2)}, ${this.object.position.y.toFixed(2)}, ${this.object.position.z.toFixed(2)})`);
      }
    }
    
    // Update previous position
    this.prevMousePosition.x = this.mousePosition.x;
    this.prevMousePosition.y = this.mousePosition.y;
    
    // Prevent default behavior
    event.preventDefault();
  }
  
  /**
   * Handle mouse up events
   * @private
   */
  _onMouseUp(event) {
    if (!this.enabled) return;
    
    // Remove document-level event listeners
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    
    // Reset state
    this.state.dragging = false;
    this.axis = null;
    
    // Debug log
    if (this.debug) {
      console.log('TransformControls: Mouse up - Transform ended');
    }
    
    // Prevent default behavior
    if (event) event.preventDefault();
  }
  
  /**
   * Handle context menu (right-click) events
   * @param {MouseEvent} event - The mouse event
   * @private
   */
  _onContextMenu(event) {
    if (this.enabled) {
      event.preventDefault();
    }
  }
  
  /**
   * Determine which axis is selected based on mouse position
   * This is a simplified placeholder - in a real implementation, this would
   * perform hit testing against visual control handles
   * @param {Object} mousePos - Mouse position
   * @returns {string|null} - Selected axis ('x', 'y', 'z', or null)
   * @private
   */
  _getSelectedAxis(mousePos) {
    // Simplified implementation - would normally do raycasting against control handles
    // For now, just return 'x' axis for left third, 'y' for middle third, 'z' for right third
    const width = this.domElement.clientWidth;
    const third = width / 3;
    
    if (mousePos.x < third) {
      return 'x';
    } else if (mousePos.x < third * 2) {
      return 'y';
    } else {
      return 'z';
    }
  }
  
  /**
   * Convert screen delta to world space delta based on camera orientation
   * @param {number} deltaX - Delta in screen X
   * @param {number} deltaY - Delta in screen Y
   * @returns {Vector3} - World space delta
   * @private
   */
  _screenToWorldDelta(deltaX, deltaY) {
    // Calculate scaling factor based on distance to camera and field of view
    // This is a simplified calculation
    const distanceToCamera = this._distanceToCamera();
    const scaleFactor = distanceToCamera * 0.001;
    
    // Get camera right and up vectors
    const cameraForward = this._getCameraForwardVector();
    const cameraRight = this._getCameraRightVector();
    const cameraUp = this._getCameraUpVector();
    
    // Combine into world delta
    const worldDelta = new Vector3(0, 0, 0);
    
    switch (this.axis) {
      case 'x':
        worldDelta.x = deltaX * scaleFactor;
        break;
      case 'y':
        worldDelta.y = -deltaY * scaleFactor;  // Invert Y for screen space
        break;
      case 'z':
        // For Z, use a combination of X and Y screen movement
        // This is a simplification - a proper implementation would project onto the Z axis
        worldDelta.z = (deltaX + deltaY) * scaleFactor * 0.5;  
        break;
    }
    
    return worldDelta;
  }
  
  /**
   * Calculate distance from camera to object
   * @returns {number} - Distance
   * @private
   */
  _distanceToCamera() {
    if (!this.object) return 1;
    
    const dx = this.camera.position.x - this.object.position.x;
    const dy = this.camera.position.y - this.object.position.y;
    const dz = this.camera.position.z - this.object.position.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  /**
   * Get camera forward vector
   * @returns {Vector3} - Normalized forward vector
   * @private
   */
  _getCameraForwardVector() {
    // Simple implementation - would normally use camera's view matrix
    const forward = new Vector3(
      0, 0, -1  // Default forward is -Z
    );
    
    // In a proper implementation, this would be transformed by camera orientation
    return forward;
  }
  
  /**
   * Get camera right vector
   * @returns {Vector3} - Normalized right vector
   * @private
   */
  _getCameraRightVector() {
    // Simple implementation - would normally use camera's view matrix
    const right = new Vector3(
      1, 0, 0  // Default right is +X
    );
    
    // In a proper implementation, this would be transformed by camera orientation
    return right;
  }
  
  /**
   * Get camera up vector
   * @returns {Vector3} - Normalized up vector
   * @private
   */
  _getCameraUpVector() {
    // Simple implementation - would normally use camera's view matrix
    const up = new Vector3(
      0, 1, 0  // Default up is +Y
    );
    
    // In a proper implementation, this would be transformed by camera orientation
    return up;
  }
  
  /**
   * Handle translation transformation
   * @param {number} deltaX - Delta in screen X
   * @param {number} deltaY - Delta in screen Y
   * @private
   */
  _handleTranslate(deltaX, deltaY) {
    if (!this.object) return;
    
    // Convert screen delta to world delta
    const worldDelta = this._screenToWorldDelta(deltaX, deltaY);
    
    // Apply translation based on current axis
    this.object.position.x += worldDelta.x;
    this.object.position.y += worldDelta.y;
    this.object.position.z += worldDelta.z;
    
    // Mark object for update
    this.object.matrixNeedsUpdate = true;
  }
  
  /**
   * Handle rotation transformation
   * @param {number} deltaX - Delta in screen X
   * @param {number} deltaY - Delta in screen Y
   * @private
   */
  _handleRotate(deltaX, deltaY) {
    if (!this.object) return;
    
    // Combined delta for rotation amount (degrees)
    const delta = (Math.abs(deltaX) > Math.abs(deltaY)) ? deltaX : deltaY;
    const rotationAmount = delta * 0.5;  // Convert to degrees
    
    // Create rotation axis based on selected axis
    const rotationAxis = new Vector3(0, 0, 0);
    switch (this.axis) {
      case 'x': rotationAxis.x = 1; break;
      case 'y': rotationAxis.y = 1; break;
      case 'z': rotationAxis.z = 1; break;
    }
    
    // Create quaternion for rotation
    const rotation = new Quaternion().setFromAxisAngle(rotationAxis, rotationAmount);
    
    // Apply rotation based on current object's rotation method
    if (this.object.useQuaternion) {
      const currentQ = this.object.quaternion.clone();
      this.object.quaternion.multiplyQuaternions(rotation, currentQ);
    } else {
      // For Euler angles, convert to the appropriate axis
      switch (this.axis) {
        case 'x': this.object.rotation.x += rotationAmount; break;
        case 'y': this.object.rotation.y += rotationAmount; break;
        case 'z': this.object.rotation.z += rotationAmount; break;
      }
    }
    
    // Mark object for update
    this.object.matrixNeedsUpdate = true;
  }
  
  /**
   * Handle scale transformation
   * @param {number} deltaX - Delta in screen X
   * @param {number} deltaY - Delta in screen Y
   * @private
   */
  _handleScale(deltaX, deltaY) {
    if (!this.object) return;
    
    // Combined delta for scale factor
    const delta = (Math.abs(deltaX) > Math.abs(deltaY)) ? deltaX : deltaY;
    const scaleFactor = 1 + delta * 0.01;  // Scale factor (1.0 = no change)
    
    // Apply scale based on current axis
    switch (this.axis) {
      case 'x': this.object.scale.x *= scaleFactor; break;
      case 'y': this.object.scale.y *= scaleFactor; break;
      case 'z': this.object.scale.z *= scaleFactor; break;
    }
    
    // Mark object for update
    this.object.matrixNeedsUpdate = true;
  }
  
  /**
   * Attach to an object
   * @param {Object3D} object - The object to control
   * @returns {TransformControls} - This instance for chaining
   */
  attach(object) {
    this.object = object;
    
    // TODO: Create visual helpers for the attached object
    
    return this;
  }
  
  /**
   * Detach from current object
   * @returns {TransformControls} - This instance for chaining
   */
  detach() {
    this.object = null;
    
    // TODO: Remove visual helpers
    
    return this;
  }
  
  /**
   * Set transform mode
   * @param {string} mode - Mode: 'translate', 'rotate', 'scale'
   * @returns {TransformControls} - This instance for chaining
   */
  setMode(mode) {
    if (['translate', 'rotate', 'scale'].includes(mode)) {
      this.mode = mode;
      
      // TODO: Update visual helpers
      
      if (this.debug) {
        console.log(`TransformControls: Mode set to ${mode}`);
      }
    }
    
    return this;
  }
  
  /**
   * Set the axis to transform (or null for all axes)
   * @param {string|null} axis - Axis: 'x', 'y', 'z', or null
   * @returns {TransformControls} - This instance for chaining
   */
  setAxis(axis) {
    if (axis === null || ['x', 'y', 'z'].includes(axis)) {
      this.axis = axis;
      
      // TODO: Update visual helpers
      
      if (this.debug) {
        console.log(`TransformControls: Axis set to ${axis}`);
      }
    }
    
    return this;
  }
  
  /**
   * Enable or disable the controls
   * @param {boolean} enabled - Whether the controls should be enabled
   * @returns {TransformControls} - This instance for chaining
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    
    // TODO: Update visual helpers
    
    if (this.debug) {
      console.log(`TransformControls: ${enabled ? 'Enabled' : 'Disabled'}`);
    }
    
    return this;
  }
  
  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether debugging should be enabled
   * @returns {TransformControls} - This instance for chaining
   */
  setDebug(enabled) {
    this.debug = enabled;
    return this;
  }
  
  /**
   * Update controls (call in animation loop)
   * @returns {TransformControls} - This instance for chaining
   */
  update() {
    // Update visual helpers if needed
    return this;
  }
  
  /**
   * Dispose of all event listeners
   */
  dispose() {
    this._removeEventListeners();
    this.object = null;
  }
} 