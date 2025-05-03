// ---- Orbit Controller ----
class OrbitController {
  constructor(camera, target = new Vector3()) {
    this.camera = camera;
    this.target = target.clone();  // Clone to avoid reference issues
    this.distance = 8;
    this.phi = Math.PI / 2;     // Vertical angle (0-PI)
    this.theta = 0;             // Horizontal angle (0-2PI)
    this.autoRotate = true;
    this.autoRotateSpeed = 1.5; // Degrees per second
    this.enabled = true;
    this.minDistance = 2;
    this.maxDistance = 20;
    
    // Mouse control properties
    this.isDragging = false;
    this.prevMouseX = 0;
    this.prevMouseY = 0;
    this.mouseRotationSpeed = 0.005; // Sensitivity of mouse movement
    this.zoomSpeed = 0.1; // Speed of zoom with mouse wheel
    
    // Check if camera is a ViewCamera and register for view changes
    if (this.camera.registerViewChangeCallback) {
      this.camera.registerViewChangeCallback(this.handleViewChange.bind(this));
    }
    
    // Initialize camera position
    this._updateCameraPosition();
  }
  
  // Handle view change events from camera
  handleViewChange(viewName, viewData) {
    // Set the angles from the view
    this.phi = viewData.phi;
    this.theta = viewData.theta;
    
    // Immediately update camera position
    this._updateCameraPosition();
    
    // Disable auto-rotation when explicitly choosing a view
    this.autoRotate = false;
  }
  
  // Save current view as user view
  saveCurrentViewAsUser() {
    if (this.camera.saveUserView) {
      this.camera.saveUserView(this.phi, this.theta);
    }
    return this;
  }
  
  _updateCameraPosition() {
    // Convert spherical coordinates to Cartesian coordinates
    const sinPhi = Math.sin(this.phi);
    const cosPhi = Math.cos(this.phi);
    const sinTheta = Math.sin(this.theta);
    const cosTheta = Math.cos(this.theta);
    
    // Calculate position in spherical coordinates relative to target
    // Use the same distance for both camera types - we'll handle scaling in projection
    const distance = this.distance;
    
    this.camera.position.x = this.target.x + distance * sinPhi * sinTheta;
    this.camera.position.y = this.target.y + distance * cosPhi;
    this.camera.position.z = this.target.z + distance * sinPhi * cosTheta;
    
    // Use the camera's lookAt method instead of manually calculating the view matrix
    this.camera.lookAt(this.target);
  }
  
  enableMouseControls(element) {
    // Mouse down event - start tracking drag
    element.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        this.isDragging = true;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
        this.autoRotate = false; // Disable auto-rotation when user interacts
        e.preventDefault();
      }
    });
    
    // Mouse move event - update camera position if dragging
    element.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.prevMouseX;
      const deltaY = e.clientY - this.prevMouseY;
      
      // Update theta (horizontal) and phi (vertical) angles
      this.theta -= deltaX * this.mouseRotationSpeed;
      this.phi += deltaY * this.mouseRotationSpeed;
      
      // Keep theta between 0 and 2*PI
      this.theta %= (2 * Math.PI);
      if (this.theta < 0) this.theta += 2 * Math.PI;
      
      // Constrain phi to avoid the camera flipping
      this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi));
      
      this._updateCameraPosition();
      
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      e.preventDefault();
    });
    
    // Mouse up event - stop tracking drag
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) { // Left mouse button
        this.isDragging = false;
      }
    });
    
    // Mouse wheel event - zoom in/out
    element.addEventListener('wheel', (e) => {
      const zoomDelta = e.deltaY * 0.001;
      
      // Get the active camera mode type
      const isOrtho = this.camera.activeMode && this.camera.activeMode.type === 'orthographic';
      
      if (isOrtho) {
        // For orthographic camera, adjust zoom property
        this.camera.orthographic.zoom = Math.max(0.1, Math.min(4, this.camera.orthographic.zoom * (1 - zoomDelta)));
        this.camera.updateProjectionMatrix();
      } else {
        // For perspective camera, adjust distance
        this.distance = Math.max(this.minDistance, Math.min(this.maxDistance, this.distance * (1 + zoomDelta)));
        this._updateCameraPosition();
      }
      
      e.preventDefault();
    }, { passive: false });
    
    // Add handler to toggle auto-rotation with spacebar
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        this.autoRotate = !this.autoRotate;
        e.preventDefault();
      }
      
      // Add view keyboard shortcuts if camera supports views
      if (this.camera.setView) {
        switch(e.key) {
          case '1': this.camera.setView('front'); break;
          case '2': this.camera.setView('back'); break; 
          case '3': this.camera.setView('top'); break;
          case '4': this.camera.setView('bottom'); break;
          case '5': this.camera.setView('left'); break;
          case '6': this.camera.setView('right'); break;
          case '7': this.camera.setView('user'); break;
          case '8': this.saveCurrentViewAsUser(); break;
        }
      }
    });
    
    // Add info text about controls - CHECK IF ELEMENT EXISTS FIRST
    const infoElement = document.getElementById('info');
    if (infoElement) {
      // Only update innerHTML if the element exists
      const cameraMode = this.camera.activeMode ? this.camera.activeMode.type : (this.camera.isOrthographic ? 'orthographic' : 'perspective');
      const cameraType = cameraMode.charAt(0).toUpperCase() + cameraMode.slice(1);
      let infoText = `3D SVG Renderer - ${cameraType} Camera - Mouse: Drag to rotate, Wheel to zoom, Space to toggle auto-rotation, 0 to switch camera`;
      
      // Add view controls info if available
      if (this.camera.setView) {
        infoText += `, 1-7 for views (1=Front, 2=Back, 3=Top, 4=Bottom, 5=Left, 6=Right, 7=User), 8 to save view`;
      }
      
      infoElement.innerHTML = infoText;
    }
  }
  
  update(deltaTime = 1/60) {
    if (!this.enabled) return;
    
    if (this.autoRotate && !this.isDragging) {
      // Convert rotation speed from degrees to radians
      this.theta += (this.autoRotateSpeed * Math.PI / 180) * deltaTime;
      
      // Keep theta between 0 and 2*PI
      this.theta %= (2 * Math.PI);
      
      // Update camera position
      this._updateCameraPosition();
    }
    
    return this;
  }
}