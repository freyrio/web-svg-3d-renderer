/**
 * SVG3D MiniMap
 * A 3D minimap component that shows camera position and objects in the scene
 */

class MiniMap {
  constructor(options = {}) {
    this.options = Object.assign({
      parent: document.body,         // Parent element to attach minimap
      position: 'bottom-right',      // Position: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
      size: 160,                     // Size of minimap in pixels (width and height)
      theme: 'dark',                 // Theme: 'dark', 'light'
      scene: null,                   // Scene to visualize
      camera: null,                  // Camera to visualize
      showGrid: true,                // Whether to show grid
      showAxes: true,                // Whether to show XYZ axes
      autoRotate: false,             // Whether to auto-rotate the minimap view
      boundaryPadding: 5,            // Padding around scene boundary
      onViewportClick: null          // Callback when minimap is clicked
    }, options);

    this.element = null;
    this.svg = null;
    this.viewAngleX = Math.PI / 4;   // 45 degrees
    this.viewAngleY = -Math.PI / 6;  // -30 degrees
    this.sceneCenter = new Vector3(0, 0, 0);
    this.sceneBounds = {
      min: new Vector3(-10, -10, -10),
      max: new Vector3(10, 10, 10)
    };
    this.initialized = false;
    this.lastUpdateTime = 0;
    
    // Initialize the component
    this.init();
  }
  
  init() {
    // Create main container
    this.element = document.createElement('div');
    this.element.className = `svg3d-minimap svg3d-theme-${this.options.theme}`;
    
    // Position according to options
    this.updatePosition();
    
    // Create SVG element
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.setAttribute("width", this.options.size);
    this.svg.setAttribute("height", this.options.size);
    this.svg.setAttribute("viewBox", "0 0 100 100");
    this.svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    this.element.appendChild(this.svg);
    
    // Add to DOM
    this.options.parent.appendChild(this.element);
    
    // Add transparent overlay for mouse events
    const overlay = document.createElement('div');
    overlay.className = 'svg3d-minimap-overlay';
    this.element.appendChild(overlay);
    
    // Add title label
    const title = document.createElement('div');
    title.className = 'svg3d-minimap-title';
    title.textContent = 'Scene View';
    this.element.appendChild(title);
    
    // Add event listeners
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    
    // Add styles
    this.addStyles();
    
    this.initialized = true;
    
    // Initial update
    this.update();
  }
  
  updatePosition() {
    // Position the minimap
    const size = this.options.size;
    const margin = 20;
    
    this.element.style.width = `${size}px`;
    this.element.style.height = `${size}px`;
    
    switch (this.options.position) {
      case 'bottom-right':
        this.element.style.bottom = `${margin}px`;
        this.element.style.right = `${margin}px`;
        break;
      case 'bottom-left':
        this.element.style.bottom = `${margin}px`;
        this.element.style.left = `${margin}px`;
        break;
      case 'top-right':
        this.element.style.top = `${margin}px`;
        this.element.style.right = `${margin}px`;
        break;
      case 'top-left':
        this.element.style.top = `${margin}px`;
        this.element.style.left = `${margin}px`;
        break;
    }
  }
  
  handleMouseDown(e) {
    // Track the starting position
    const startX = e.clientX;
    const startY = e.clientY;
    const startViewAngleX = this.viewAngleX;
    const startViewAngleY = this.viewAngleY;
    
    // Create move and up handlers
    const handleMouseMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      // Update view angles based on mouse movement
      this.viewAngleX = startViewAngleX + dx * 0.01;
      this.viewAngleY = startViewAngleY + dy * 0.01;
      
      // Limit vertical angle to prevent flipping
      this.viewAngleY = Math.max(Math.min(this.viewAngleY, Math.PI / 2 - 0.1), -Math.PI / 2 + 0.1);
      
      // Update the view
      this.update();
    };
    
    const handleMouseUp = () => {
      // Remove event listeners when done
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Add event listeners for dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    e.preventDefault();
  }
  
  calculateSceneBounds() {
    // If no scene, use default bounds
    if (!this.options.scene) {
      return;
    }
    
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);
    const padding = this.options.boundaryPadding;
    
    // Function to recursively process objects and expand bounds
    const processBounds = (object) => {
      // If it's a shape with position, expand bounds
      if (object.position) {
        // Get world position
        const pos = object.getPosition();
        
        // For cubes and spheres, estimate their boundaries
        let size = new Vector3(1, 1, 1);
        
        if (object instanceof Cube) {
          // Use cube dimensions
          size.x = object.width * object.scale.x;
          size.y = object.height * object.scale.y;
          size.z = object.depth * object.scale.z;
        } else if (object instanceof Sphere) {
          // Use sphere radius * 2 for all dimensions
          const radius = object.radius * Math.max(object.scale.x, object.scale.y, object.scale.z);
          size.x = size.y = size.z = radius * 2;
        }
        
        // Expand bounds by position and half-size
        min.x = Math.min(min.x, pos.x - size.x/2);
        min.y = Math.min(min.y, pos.y - size.y/2);
        min.z = Math.min(min.z, pos.z - size.z/2);
        
        max.x = Math.max(max.x, pos.x + size.x/2);
        max.y = Math.max(max.y, pos.y + size.y/2);
        max.z = Math.max(max.z, pos.z + size.z/2);
      }
      
      // Process children recursively
      if (object.children && object.children.length > 0) {
        object.children.forEach(child => processBounds(child));
      }
    };
    
    processBounds(this.options.scene);
    
    // If we found valid bounds, store them with padding
    if (min.x !== Infinity && max.x !== -Infinity) {
      // Add padding
      min.x -= padding;
      min.y -= padding;
      min.z -= padding;
      
      max.x += padding;
      max.y += padding;
      max.z += padding;
      
      this.sceneBounds.min = min;
      this.sceneBounds.max = max;
      
      // Calculate scene center
      this.sceneCenter = new Vector3(
        (min.x + max.x) / 2,
        (min.y + max.y) / 2,
        (min.z + max.z) / 2
      );
    }
  }
  
  update() {
    if (!this.initialized) return;
    
    // Recalculate scene bounds if needed
    this.calculateSceneBounds();
    
    // Clear SVG content
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    
    // Draw boundary cube
    this.drawBoundary();
    
    // Draw axes if enabled
    if (this.options.showAxes) {
      this.drawAxes();
    }
    
    // Draw grid if enabled
    if (this.options.showGrid) {
      this.drawGrid();
    }
    
    // Draw objects if scene is provided
    if (this.options.scene) {
      this.drawObjects();
    }
    
    // Draw camera if provided
    if (this.options.camera) {
      this.drawCamera();
    }
    
    // Auto-rotate if enabled
    if (this.options.autoRotate) {
      const now = Date.now();
      const dt = now - this.lastUpdateTime;
      this.lastUpdateTime = now;
      
      if (dt > 0) {
        this.viewAngleX += dt * 0.0005;
        requestAnimationFrame(() => this.update());
      }
    }
  }
  
  drawBoundary() {
    // Get dimensions for boundary cube
    const min = this.sceneBounds.min;
    const max = this.sceneBounds.max;
    
    // Create all 8 corners of the bounding cube
    const corners = [
      new Vector3(min.x, min.y, min.z), // 0: bottom-left-back
      new Vector3(max.x, min.y, min.z), // 1: bottom-right-back
      new Vector3(max.x, max.y, min.z), // 2: top-right-back
      new Vector3(min.x, max.y, min.z), // 3: top-left-back
      new Vector3(min.x, min.y, max.z), // 4: bottom-left-front
      new Vector3(max.x, min.y, max.z), // 5: bottom-right-front
      new Vector3(max.x, max.y, max.z), // 6: top-right-front
      new Vector3(min.x, max.y, max.z)  // 7: top-left-front
    ];
    
    // Define the 12 edges of the cube
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
    ];
    
    // Project and draw each edge
    edges.forEach(([i, j]) => {
      const p1 = this.projectPoint(corners[i]);
      const p2 = this.projectPoint(corners[j]);
      
      // Only draw if points are valid
      if (p1 && p2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "svg3d-minimap-boundary");
        this.svg.appendChild(line);
      }
    });
  }
  
  drawAxes() {
    // Draw axes from center
    const center = this.sceneCenter;
    const size = Math.max(
      this.sceneBounds.max.x - this.sceneBounds.min.x,
      this.sceneBounds.max.y - this.sceneBounds.min.y,
      this.sceneBounds.max.z - this.sceneBounds.min.z
    ) * 0.5;
    
    // Create axis endpoints
    const points = [
      new Vector3(center.x, center.y, center.z),               // Origin
      new Vector3(center.x + size, center.y, center.z),        // X-axis
      new Vector3(center.x, center.y + size, center.z),        // Y-axis
      new Vector3(center.x, center.y, center.z + size)         // Z-axis
    ];
    
    // Define the axes
    const axes = [
      { start: 0, end: 1, class: 'svg3d-minimap-axis-x' },
      { start: 0, end: 2, class: 'svg3d-minimap-axis-y' },
      { start: 0, end: 3, class: 'svg3d-minimap-axis-z' }
    ];
    
    // Project and draw each axis
    axes.forEach(axis => {
      const p1 = this.projectPoint(points[axis.start]);
      const p2 = this.projectPoint(points[axis.end]);
      
      if (p1 && p2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", axis.class);
        this.svg.appendChild(line);
        
        // Add axis label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", p2.x);
        label.setAttribute("y", p2.y);
        label.setAttribute("class", `${axis.class}-label`);
        label.textContent = axis.class.slice(-1).toUpperCase();
        this.svg.appendChild(label);
      }
    });
  }
  
  drawGrid() {
    // Draw grid on XZ plane
    const min = this.sceneBounds.min;
    const max = this.sceneBounds.max;
    const center = this.sceneCenter;
    
    // Use floor of min and ceiling of max for nice grid boundaries
    const gridMin = {
      x: Math.floor(min.x),
      z: Math.floor(min.z)
    };
    
    const gridMax = {
      x: Math.ceil(max.x),
      z: Math.ceil(max.z)
    };
    
    // Calculate step size based on bounds
    const gridSize = Math.max(gridMax.x - gridMin.x, gridMax.z - gridMin.z);
    const step = Math.max(1, Math.floor(gridSize / 10)); // Ensure at least 10 grid lines
    
    // Draw grid lines along X-axis
    for (let z = gridMin.z; z <= gridMax.z; z += step) {
      const p1 = this.projectPoint(new Vector3(gridMin.x, center.y, z));
      const p2 = this.projectPoint(new Vector3(gridMax.x, center.y, z));
      
      if (p1 && p2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", z === 0 ? "svg3d-minimap-grid-zero" : "svg3d-minimap-grid");
        this.svg.appendChild(line);
      }
    }
    
    // Draw grid lines along Z-axis
    for (let x = gridMin.x; x <= gridMax.x; x += step) {
      const p1 = this.projectPoint(new Vector3(x, center.y, gridMin.z));
      const p2 = this.projectPoint(new Vector3(x, center.y, gridMax.z));
      
      if (p1 && p2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", x === 0 ? "svg3d-minimap-grid-zero" : "svg3d-minimap-grid");
        this.svg.appendChild(line);
      }
    }
  }
  
  drawObjects() {
    if (!this.options.scene) return;
    
    // Function to recursively draw objects
    const drawObject = (object) => {
      if (!object.isVisible()) return;
      
      // Draw object based on type
      if (object instanceof Cube) {
        this.drawCube(object);
      } else if (object instanceof Sphere) {
        this.drawSphere(object);
      } else if (object instanceof Plane) {
        this.drawPlane(object);
      }
      
      // Process children
      if (object.children && object.children.length > 0) {
        object.children.forEach(child => drawObject(child));
      }
    };
    
    // Start from the scene
    drawObject(this.options.scene);
  }
  
  drawCube(cube) {
    const pos = cube.getPosition();
    const scale = cube.getScale();
    
    // Create cube vertices
    const halfWidth = (cube.width * scale.x) / 2;
    const halfHeight = (cube.height * scale.y) / 2;
    const halfDepth = (cube.depth * scale.z) / 2;
    
    // Define the 8 vertices of the cube
    const vertices = [
      new Vector3(pos.x - halfWidth, pos.y - halfHeight, pos.z - halfDepth),
      new Vector3(pos.x + halfWidth, pos.y - halfHeight, pos.z - halfDepth),
      new Vector3(pos.x + halfWidth, pos.y + halfHeight, pos.z - halfDepth),
      new Vector3(pos.x - halfWidth, pos.y + halfHeight, pos.z - halfDepth),
      new Vector3(pos.x - halfWidth, pos.y - halfHeight, pos.z + halfDepth),
      new Vector3(pos.x + halfWidth, pos.y - halfHeight, pos.z + halfDepth),
      new Vector3(pos.x + halfWidth, pos.y + halfHeight, pos.z + halfDepth),
      new Vector3(pos.x - halfWidth, pos.y + halfHeight, pos.z + halfDepth)
    ];
    
    // Define the 12 edges of the cube
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7]  // connecting edges
    ];
    
    // Project and draw each edge
    edges.forEach(([i, j]) => {
      const p1 = this.projectPoint(vertices[i]);
      const p2 = this.projectPoint(vertices[j]);
      
      if (p1 && p2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "svg3d-minimap-object");
        this.svg.appendChild(line);
      }
    });
  }
  
  drawSphere(sphere) {
    const pos = sphere.getPosition();
    const scale = sphere.getScale();
    const radius = sphere.radius * Math.max(scale.x, scale.y, scale.z);
    
    // Project center point
    const center = this.projectPoint(pos);
    if (!center) return;
    
    // Calculate approximate projected radius
    // We'll create a point at (pos.x + radius, pos.y, pos.z)
    // and calculate the distance from the center to get a reasonable projected radius
    const edgePoint = this.projectPoint(new Vector3(pos.x + radius, pos.y, pos.z));
    if (!edgePoint) return;
    
    // Calculate distance
    const dx = center.x - edgePoint.x;
    const dy = center.y - edgePoint.y;
    const projectedRadius = Math.sqrt(dx * dx + dy * dy);
    
    // Draw circle for sphere
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", center.x);
    circle.setAttribute("cy", center.y);
    circle.setAttribute("r", projectedRadius);
    circle.setAttribute("class", "svg3d-minimap-object");
    this.svg.appendChild(circle);
  }
  
  drawPlane(plane) {
    const pos = plane.getPosition();
    const scale = plane.getScale();
    
    // Create plane vertices
    const halfWidth = (plane.width * scale.x) / 2;
    const halfHeight = (plane.height * scale.z) / 2; // Use Z for height since planes are usually XZ
    
    // Get rotation to properly orient the plane
    const rot = plane.getRotation();
    
    // Define the 4 vertices of the plane in local space
    const localVertices = [
      new Vector3(-halfWidth, 0, -halfHeight),
      new Vector3(halfWidth, 0, -halfHeight),
      new Vector3(halfWidth, 0, halfHeight),
      new Vector3(-halfWidth, 0, halfHeight)
    ];
    
    // Transform vertices to world space
    // This is simplified - in a real app we would use the full transformation matrix
    const vertices = localVertices.map(v => {
      // Apply rotation (simplified, assumes rotations are aligned with axes)
      let vx = v.x;
      let vy = v.y;
      let vz = v.z;
      
      // Note: This is a simplified version - ideally we'd use a proper rotation matrix
      const cosx = Math.cos(rot.x);
      const sinx = Math.sin(rot.x);
      const cosy = Math.cos(rot.y);
      const siny = Math.sin(rot.y);
      const cosz = Math.cos(rot.z);
      const sinz = Math.sin(rot.z);
      
      // Apply rotations (simplified, not using full matrix multiplication)
      // Rotate around x-axis
      const ty = vy;
      const tz = vz;
      vy = ty * cosx - tz * sinx;
      vz = ty * sinx + tz * cosx;
      
      // Rotate around y-axis
      const tx = vx;
      vx = tx * cosy + vz * siny;
      vz = -tx * siny + vz * cosy;
      
      // Apply translation
      return new Vector3(
        vx + pos.x,
        vy + pos.y,
        vz + pos.z
      );
    });
    
    // Define the 4 edges of the plane
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0]
    ];
    
    // Project and draw each edge
    edges.forEach(([i, j]) => {
      const p1 = this.projectPoint(vertices[i]);
      const p2 = this.projectPoint(vertices[j]);
      
      if (p1 && p2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "svg3d-minimap-object");
        this.svg.appendChild(line);
      }
    });
  }
  
  drawCamera() {
    if (!this.options.camera) return;
    
    const camera = this.options.camera;
    const pos = camera.getPosition();
    
    // Project camera position
    const cameraPos = this.projectPoint(pos);
    if (!cameraPos) return;
    
    // Draw camera icon
    const cameraIcon = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cameraIcon.setAttribute("cx", cameraPos.x);
    cameraIcon.setAttribute("cy", cameraPos.y);
    cameraIcon.setAttribute("r", 3);
    cameraIcon.setAttribute("class", "svg3d-minimap-camera");
    this.svg.appendChild(cameraIcon);
    
    // Create a direction vector for camera's look direction
    // This is simplified - in a full app we would use the camera's viewing matrix
    // Just draw an arrow pointing in -Z direction from camera position
    
    // Calculate target position (simplified, just points in -Z direction)
    // Scale the direction vector by a fixed amount
    const directionScale = 3;
    const target = new Vector3(
      pos.x,
      pos.y,
      pos.z - directionScale // -Z is forward in our camera system
    );
    
    // Project target position
    const targetPos = this.projectPoint(target);
    if (!targetPos) return;
    
    // Draw line from camera to target
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", cameraPos.x);
    line.setAttribute("y1", cameraPos.y);
    line.setAttribute("x2", targetPos.x);
    line.setAttribute("y2", targetPos.y);
    line.setAttribute("class", "svg3d-minimap-camera-dir");
    this.svg.appendChild(line);
    
    // Draw camera frustum
    this.drawCameraFrustum(camera, pos, targetPos);
  }
  
  drawCameraFrustum(camera, pos, targetPos) {
    // Only draw frustum for perspective cameras
    if (camera.activeMode && camera.activeMode.type === 'orthographic') return;
    
    // Get camera properties
    const fov = camera.perspective ? camera.perspective.fov : 45;
    const aspect = camera.perspective ? camera.perspective.aspect : camera.aspect || 1;
    const near = Math.max(0.5, camera.perspective ? camera.perspective.near : 0.1);
    const far = Math.min(camera.perspective ? camera.perspective.far : 100, 10); // Limit far plane to a reasonable value for visualization
    
    // Calculate frustum corners
    const nearHeight = 2 * Math.tan(fov * Math.PI / 180 / 2) * near;
    const nearWidth = nearHeight * aspect;
    const farHeight = 2 * Math.tan(fov * Math.PI / 180 / 2) * far;
    const farWidth = farHeight * aspect;
    
    // Create local coordinate system for frustum
    // We'll simplify and assume the camera looks in the -Z direction
    const forward = new Vector3(0, 0, -1);
    const up = new Vector3(0, 1, 0);
    const right = new Vector3(1, 0, 0);
    
    // Calculate frustum corners in camera space
    const nearCorners = [
      new Vector3(-nearWidth/2, -nearHeight/2, -near),
      new Vector3(nearWidth/2, -nearHeight/2, -near),
      new Vector3(nearWidth/2, nearHeight/2, -near),
      new Vector3(-nearWidth/2, nearHeight/2, -near)
    ];
    
    const farCorners = [
      new Vector3(-farWidth/2, -farHeight/2, -far),
      new Vector3(farWidth/2, -farHeight/2, -far),
      new Vector3(farWidth/2, farHeight/2, -far),
      new Vector3(-farWidth/2, farHeight/2, -far)
    ];
    
    // Convert to world space
    const worldCorners = [...nearCorners, ...farCorners].map(corner => {
      return new Vector3(
        pos.x + corner.x,
        pos.y + corner.y,
        pos.z + corner.z
      );
    });
    
    // Define frustum edges
    const frustumEdges = [
      // Near plane
      [0, 1], [1, 2], [2, 3], [3, 0],
      // Far plane
      [4, 5], [5, 6], [6, 7], [7, 4],
      // Connecting edges
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];
    
    // Project and draw each edge
    frustumEdges.forEach(([i, j]) => {
      const p1 = this.projectPoint(worldCorners[i]);
      const p2 = this.projectPoint(worldCorners[j]);
      
      if (p1 && p2) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", p1.x);
        line.setAttribute("y1", p1.y);
        line.setAttribute("x2", p2.x);
        line.setAttribute("y2", p2.y);
        line.setAttribute("class", "svg3d-minimap-frustum");
        this.svg.appendChild(line);
      }
    });
  }
  
  projectPoint(point) {
    // Apply isometric-style projection
    // Convert point to be relative to scene center
    const x = point.x - this.sceneCenter.x;
    const y = point.y - this.sceneCenter.y;
    const z = point.z - this.sceneCenter.z;
    
    // Apply rotation around Y axis first
    const cosY = Math.cos(this.viewAngleX);
    const sinY = Math.sin(this.viewAngleX);
    
    const rotY_x = x * cosY - z * sinY;
    const rotY_z = x * sinY + z * cosY;
    
    // Then apply rotation around X axis
    const cosX = Math.cos(this.viewAngleY);
    const sinX = Math.sin(this.viewAngleY);
    
    const rotX_y = y * cosX - rotY_z * sinX;
    const rotX_z = y * sinX + rotY_z * cosX;
    
    // Apply scaling and centering
    // The factor 100 refers to the viewBox size (0-100)
    const scale = 40; // adjusted to fit in viewBox
    const centerX = 50;
    const centerY = 50;
    
    // Swapping Y and Z for isometric view
    const projX = centerX + rotY_x * scale;
    const projY = centerY + rotX_y * scale;
    
    // Clip points outside of view
    if (projX < 0 || projX > 100 || projY < 0 || projY > 100) {
      return null;
    }
    
    return { x: projX, y: projY };
  }
  
  addStyles() {
    // Only add styles once
    if (document.getElementById('svg3d-minimap-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'svg3d-minimap-styles';
    styleElement.textContent = `
      .svg3d-minimap {
        position: fixed;
        background-color: rgba(40, 40, 40, 0.8);
        border-radius: 6px;
        overflow: hidden;
        z-index: 999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        cursor: grab;
      }
      
      .svg3d-minimap:active {
        cursor: grabbing;
      }
      
      .svg3d-minimap svg {
        display: block;
      }
      
      .svg3d-minimap-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 2;
      }
      
      .svg3d-minimap-title {
        position: absolute;
        top: 5px;
        left: 5px;
        font-size: 10px;
        color: rgba(255, 255, 255, 0.7);
        pointer-events: none;
      }
      
      .svg3d-theme-light {
        background-color: rgba(224, 224, 224, 0.8);
      }
      
      .svg3d-theme-light .svg3d-minimap-title {
        color: rgba(0, 0, 0, 0.7);
      }
      
      /* Minimap elements */
      .svg3d-minimap-boundary {
        stroke: rgba(255, 255, 255, 0.3);
        stroke-width: 0.5;
        fill: none;
      }
      
      .svg3d-minimap-grid {
        stroke: rgba(255, 255, 255, 0.1);
        stroke-width: 0.25;
      }
      
      .svg3d-minimap-grid-zero {
        stroke: rgba(255, 255, 255, 0.3);
        stroke-width: 0.5;
      }
      
      .svg3d-minimap-axis-x {
        stroke: rgba(255, 80, 80, 0.8);
        stroke-width: 1;
      }
      
      .svg3d-minimap-axis-y {
        stroke: rgba(80, 255, 80, 0.8);
        stroke-width: 1;
      }
      
      .svg3d-minimap-axis-z {
        stroke: rgba(80, 80, 255, 0.8);
        stroke-width: 1;
      }
      
      .svg3d-minimap-axis-x-label,
      .svg3d-minimap-axis-y-label,
      .svg3d-minimap-axis-z-label {
        font-size: 8px;
        fill: white;
        text-anchor: middle;
      }
      
      .svg3d-minimap-axis-x-label {
        fill: rgba(255, 80, 80, 0.8);
      }
      
      .svg3d-minimap-axis-y-label {
        fill: rgba(80, 255, 80, 0.8);
      }
      
      .svg3d-minimap-axis-z-label {
        fill: rgba(80, 80, 255, 0.8);
      }
      
      .svg3d-minimap-object {
        stroke: rgba(255, 255, 255, 0.8);
        stroke-width: 0.75;
        fill: none;
      }
      
      .svg3d-minimap-camera {
        fill: rgba(255, 200, 40, 0.9);
        stroke: rgba(255, 200, 40, 0.6);
        stroke-width: 1;
      }
      
      .svg3d-minimap-camera-dir {
        stroke: rgba(255, 200, 40, 0.8);
        stroke-width: 0.75;
      }
      
      .svg3d-minimap-frustum {
        stroke: rgba(255, 200, 40, 0.4);
        stroke-width: 0.5;
        stroke-dasharray: 2,1;
      }
      
      /* Light theme modifications */
      .svg3d-theme-light .svg3d-minimap-boundary {
        stroke: rgba(0, 0, 0, 0.3);
      }
      
      .svg3d-theme-light .svg3d-minimap-grid {
        stroke: rgba(0, 0, 0, 0.1);
      }
      
      .svg3d-theme-light .svg3d-minimap-grid-zero {
        stroke: rgba(0, 0, 0, 0.3);
      }
      
      .svg3d-theme-light .svg3d-minimap-axis-x-label,
      .svg3d-theme-light .svg3d-minimap-axis-y-label,
      .svg3d-theme-light .svg3d-minimap-axis-z-label {
        fill: black;
      }
      
      .svg3d-theme-light .svg3d-minimap-object {
        stroke: rgba(0, 0, 0, 0.8);
      }
    `;
    
    document.head.appendChild(styleElement);
  }
} 