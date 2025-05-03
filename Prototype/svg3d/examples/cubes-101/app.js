    // ---- MiniMap ----
    class MiniMap {
        constructor(container, scene, cameraManager) {
          this.container = container;
          this.scene = scene;
          this.cameraManager = cameraManager;
          this.svg = null;
          
          // World bounds for displaying in minimap
          this.worldBounds = {
            min: new Vector3(-5, -5, -5),
            max: new Vector3(5, 5, 5)
          };
          
          // Minimap view settings
          this.padding = 10; // Padding inside the minimap
          this.width = container.clientWidth;
          this.height = container.clientHeight;
          
          // Current view mode: 'top', 'front', 'side'
          this.currentView = 'top';
          this.viewCycleOrder = ['top', 'front', 'side'];
          
          this.initialize();
        }
        
        initialize() {
          // Get the SVG element
          this.svg = document.getElementById('minimap-svg');
          this.clear();
          
          // Add click handler to cycle through views
          this.container.addEventListener('click', () => {
            this.cycleView();
          });
          
          // Add view cycle hint
          this.addViewCycleHint();
        }
        
        addViewCycleHint() {
          // Add small hint text that shows how to change view
          const hintText = document.createElement('div');
          hintText.style.position = 'absolute';
          hintText.style.bottom = '2px';
          hintText.style.right = '5px';
          hintText.style.color = 'rgba(255,255,255,0.5)';
          hintText.style.fontSize = '8px';
          hintText.textContent = 'Click to change view';
          this.container.appendChild(hintText);
        }
        
        cycleView() {
          // Get the current index in the cycle order
          const currentIndex = this.viewCycleOrder.indexOf(this.currentView);
          // Move to the next view (or back to the first if at the end)
          const nextIndex = (currentIndex + 1) % this.viewCycleOrder.length;
          this.currentView = this.viewCycleOrder[nextIndex];
          
          // Update the minimap with the new view
          this.update();
        }
        
        clear() {
          // Clear the SVG
          while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
          }
        }
        
        // Map a 3D coordinate to 2D minimap space
        mapCoordinate(point, view) {
          // We'll map coordinates to 2D space based on the view (top, side, front)
          let x, y;
          
          switch(view) {
            case 'top': // Y-up, X-right view (top-down)
              x = this.mapRange(point.x, this.worldBounds.min.x, this.worldBounds.max.x, 
                               this.padding, this.width - this.padding);
              y = this.mapRange(point.z, this.worldBounds.min.z, this.worldBounds.max.z, 
                               this.padding, this.height - this.padding);
              break;
            case 'front': // Y-up, Z-right view (front)
              x = this.mapRange(point.z, this.worldBounds.min.z, this.worldBounds.max.z, 
                               this.padding, this.width - this.padding);
              y = this.mapRange(point.y, this.worldBounds.max.y, this.worldBounds.min.y, 
                               this.padding, this.height - this.padding);
              break;
            case 'side': // Y-up, X-front view (side)
              x = this.mapRange(point.x, this.worldBounds.min.x, this.worldBounds.max.x, 
                               this.padding, this.width - this.padding);
              y = this.mapRange(point.y, this.worldBounds.max.y, this.worldBounds.min.y, 
                               this.padding, this.height - this.padding);
              break;
            default:
              x = 0;
              y = 0;
          }
          
          return { x, y };
        }
        
        // Helper to map values from one range to another
        mapRange(value, inMin, inMax, outMin, outMax) {
          return ((value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
        }
        
        // Create an SVG element
        createSvgElement(type) {
          return document.createElementNS('http://www.w3.org/2000/svg', type);
        }
        
        // Draw world bounds as a rectangle
        drawWorldBounds(view = 'top') {
          const rect = this.createSvgElement('rect');
          
          const min = this.mapCoordinate(this.worldBounds.min, view);
          const max = this.mapCoordinate(this.worldBounds.max, view);
          
          rect.setAttribute('x', min.x);
          rect.setAttribute('y', min.y);
          rect.setAttribute('width', max.x - min.x);
          rect.setAttribute('height', max.y - min.y);
          rect.setAttribute('fill', 'none');
          rect.setAttribute('stroke', '#444');
          rect.setAttribute('stroke-width', '1');
          
          this.svg.appendChild(rect);
        }
        
        // Draw objects in the scene
        drawObjects(view = 'top') {
          // Recursive function to draw all objects
          const drawObject = (object) => {
            if (object instanceof Cube) {
              // Draw a dot for each cube's position
              const pos = this.mapCoordinate(object.position, view);
              
              const circle = this.createSvgElement('circle');
              circle.setAttribute('cx', pos.x);
              circle.setAttribute('cy', pos.y);
              circle.setAttribute('r', '3');
              circle.setAttribute('fill', '#aaa');
              
              this.svg.appendChild(circle);
            }
            
            // Draw child objects
            object.children.forEach(child => {
              drawObject(child);
            });
          };
          
          drawObject(this.scene);
        }
        
        // Draw camera position and look direction
        drawCamera(view = 'top') {
          const camera = this.cameraManager.getActiveCamera();
          const controller = this.cameraManager.getActiveController();
          
          // Draw camera position
          const cameraPos = this.mapCoordinate(camera.position, view);
          
          const cameraCircle = this.createSvgElement('circle');
          cameraCircle.setAttribute('cx', cameraPos.x);
          cameraCircle.setAttribute('cy', cameraPos.y);
          cameraCircle.setAttribute('r', '4');
          cameraCircle.setAttribute('fill', '#ff0');
          
          this.svg.appendChild(cameraCircle);
          
          // Draw camera look direction (target)
          const targetPos = this.mapCoordinate(controller.target, view);
          
          const targetCircle = this.createSvgElement('circle');
          targetCircle.setAttribute('cx', targetPos.x);
          targetCircle.setAttribute('cy', targetPos.y);
          targetCircle.setAttribute('r', '2');
          targetCircle.setAttribute('fill', '#0ff');
          
          this.svg.appendChild(targetCircle);
          
          // Draw line from camera to target
          const line = this.createSvgElement('line');
          line.setAttribute('x1', cameraPos.x);
          line.setAttribute('y1', cameraPos.y);
          line.setAttribute('x2', targetPos.x);
          line.setAttribute('y2', targetPos.y);
          line.setAttribute('stroke', '#0ff');
          line.setAttribute('stroke-width', '1');
          
          this.svg.appendChild(line);
        }
        
        // Add view label
        addViewLabel(view) {
          const text = this.createSvgElement('text');
          text.setAttribute('x', 10);
          text.setAttribute('y', 15);
          text.setAttribute('fill', 'white');
          text.setAttribute('font-size', '10px');
          text.textContent = view.toUpperCase() + ' VIEW';
          
          this.svg.appendChild(text);
        }
        
        // Update the minimap
        update() {
          this.clear();
          
          // Draw world bounds
          this.drawWorldBounds(this.currentView);
          
          // Draw scene objects
          this.drawObjects(this.currentView);
          
          // Draw camera
          this.drawCamera(this.currentView);
          
          // Add view label
          this.addViewLabel(this.currentView);
        }
      }
  
      // ---- Animation Loop ----
      class Animation {
        constructor(renderer, scene, camera, controllers = [], minimap = null) {
          this.renderer = renderer;
          this.scene = scene;
          this.camera = camera;
          this.controllers = controllers;
          this.minimap = minimap; // Add minimap reference
          this.running = false;
          this.lastTime = 0;
          
          // Stats tracking
          this.frameCount = 0;
          this.fps = 0;
          this.fpsUpdateTime = 0;
          this.meshCount = 0;
          this.faceCount = 0;
          
          // Bind the animate method to this instance to prevent context loss
          this.animate = this.animate.bind(this);
        }
        
        start() {
          this.running = true;
          this.lastTime = performance.now();
          requestAnimationFrame(this.animate);
          return this;
        }
        
        stop() {
          this.running = false;
          return this;
        }
        
        updateStats() {
          // Count meshes (cubes) in the scene
          this.meshCount = 0;
          this.faceCount = 0;
          
          // Recursive function to count objects
          const countObjects = (object) => {
            if (object instanceof Cube) {
              this.meshCount++;
              this.faceCount += object.faces.length;
            }
            
            object.children.forEach(child => {
              countObjects(child);
            });
          };
          
          countObjects(this.scene);
          
          // Update stats display
          const statsElement = document.getElementById('stats');
          if (statsElement) {
            statsElement.textContent = `FPS: ${this.fps.toFixed(1)} | Meshes: ${this.meshCount} | Faces: ${this.faceCount}`;
          }
        }
        
        animate(time) {
          if (!this.running) return;
          
          // Calculate delta time with a maximum to prevent large jumps
          const now = performance.now();
          const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1); // Convert to seconds, cap at 0.1s
          this.lastTime = now;
          
          // Update frame counter
          this.frameCount++;
          
          // Update FPS every second
          if (now - this.fpsUpdateTime > 1000) {
            this.fps = this.frameCount * 1000 / (now - this.fpsUpdateTime);
            this.frameCount = 0;
            this.fpsUpdateTime = now;
            
            // Update stats display
            this.updateStats();
          }
          
          // Update orbit controllers and other controllers
          this.controllers.forEach(controller => {
            controller.update(deltaTime);
          });
          
          // Render the scene - we don't need additional matrix updates
          // since the OrbitController already handles that
          this.renderer.render(this.scene, this.camera);
          
          // Update minimap if available
          if (this.minimap) {
            this.minimap.update();
          }
          
          // Request next frame
          requestAnimationFrame(this.animate);
        }
      }
  
      // ---- Main Application ----
      class App {
        constructor(container) {
          this.container = container;
          this.width = container.clientWidth;
          this.height = container.clientHeight;
          
          this.scene = new Scene();
          this.renderer = new SVGRenderer(container, this.width, this.height);
          
          // Create camera manager to handle both cameras
          this.cameraManager = new CameraManager(container);
          
          // Create minimap (after cameraManager and scene are initialized)
          this.minimap = null; // Will be initialized after scene is created
          
          // Reference to demo cube for toggling transparency
          this.demoCube = null;
          
          this.initialize();
        }
        
        createScene() {
          // Create multiple cubes in different positions
          const createCube = (x, y, z, size = 1, opacity = 1.0) => {
            // Create materials with different opacities if specified
            const materials = [];
            const colors = [
              '#FF0000', // Right - Red
              '#00FF00', // Left - Green
              '#0000FF', // Top - Blue
              '#FFFF00', // Bottom - Yellow
              '#FF00FF', // Front - Magenta
              '#00FFFF'  // Back - Cyan
            ];
            
            // Create materials with the specified opacity
            for (let i = 0; i < 6; i++) {
              materials.push(new Material(colors[i], opacity));
            }
            
            const cube = new Cube(size, size, size, materials);
            cube.position.set(x, y, z);
            this.scene.add(cube);
            return cube;
          };
          
          // Create a center cube with full opacity
          createCube(0, 0, 0, 2);
          
          // Create smaller cubes in a pattern with alternating positions to better show depth sorting
          const positions = [
            [-3, 0, 0], [3, 0, 0],    // Left and right
            [0, -3, 0], [0, 3, 0],    // Bottom and top
            [0, 0, -3], [0, 0, 3],    // Back and front
          ];
          
          // Create regular cubes with full opacity
          positions.forEach((pos, index) => {
            createCube(pos[0], pos[1], pos[2], 1, 1.0);
          });
          
          // Create an intersecting transparent cube to demonstrate sorting
          this.demoCube = createCube(1, 1, 1, 1.5, 0.3);
          
          // Create dramatic intersections to better show clipping
          
          // Two cubes intersecting at an angle
          const cube1 = createCube(2.5, 0, 0, 1.2, 0.9);
          cube1.rotation.set(0, Math.PI/4, 0); // Rotate 45 degrees around Y axis
          
          const cube2 = createCube(4, 0, 0, 1.2, 0.9);
          cube2.rotation.set(0, -Math.PI/4, 0); // Rotate -45 degrees around Y axis
          
          // Three cubes intersecting at different angles
          const cube3 = createCube(0, 3, 0, 1.2, 0.9);
          cube3.rotation.set(Math.PI/6, 0, 0); // Rotate around X axis
          
          const cube4 = createCube(0, 3, 0, 1.2, 0.9);
          cube4.rotation.set(0, Math.PI/6, 0); // Rotate around Y axis
          
          const cube5 = createCube(0, 3, 0, 1.2, 0.9);
          cube5.rotation.set(0, 0, Math.PI/6); // Rotate around Z axis
          
          // A series of intersecting cubes forming a chain
          let lastPos = new Vector3(-4, -2, 0);
          for (let i = 0; i < 5; i++) {
            const nextPos = new Vector3(
              lastPos.x + 1.5 * Math.cos(i * Math.PI/6),
              lastPos.y + 0.5,
              lastPos.z + 1.5 * Math.sin(i * Math.PI/6)
            );
            
            const connectingCube = createCube(
              (lastPos.x + nextPos.x) / 2,
              (lastPos.y + nextPos.y) / 2,
              (lastPos.z + nextPos.z) / 2,
              0.8,
              0.9
            );
            
            // Calculate rotation to point from lastPos to nextPos
            const direction = new Vector3(
              nextPos.x - lastPos.x,
              nextPos.y - lastPos.y,
              nextPos.z - lastPos.z
            ).normalize();
            
            // Set rotation based on direction
            // This is a simplified rotation - in a real app you'd use a lookAt matrix
            connectingCube.rotation.set(
              Math.atan2(direction.y, Math.sqrt(direction.x * direction.x + direction.z * direction.z)),
              Math.atan2(direction.z, direction.x),
              0
            );
            
            // Scale the cube to create a link between positions
            const distance = Math.sqrt(
              Math.pow(nextPos.x - lastPos.x, 2) +
              Math.pow(nextPos.y - lastPos.y, 2) +
              Math.pow(nextPos.z - lastPos.z, 2)
            );
            
            connectingCube.scale.set(distance / 0.8, 1, 1);
            
            lastPos = nextPos;
          }
        }
        
        setupRenderModeControls() {
          // Set up event handlers for render mode buttons
          const buttons = {
            'normal': document.getElementById('btn-normal'),
            'depth': document.getElementById('btn-depth'),
            'color-depth': document.getElementById('btn-color-depth'),
            'wireframe': document.getElementById('btn-wireframe'),
            'solid': document.getElementById('btn-solid')
          };
          
          // Function to set the active button
          const setActiveButton = (activeMode) => {
            Object.keys(buttons).forEach(mode => {
              if (mode === activeMode) {
                buttons[mode].classList.add('active');
              } else {
                buttons[mode].classList.remove('active');
              }
            });
          };
          
          // Add click handlers for each button
          Object.keys(buttons).forEach(mode => {
            buttons[mode].addEventListener('click', () => {
              this.renderer.setRenderMode(mode);
              setActiveButton(mode);
            });
          });
          
          // Set up wireframe toggle button
          const wireframeToggleBtn = document.getElementById('btn-toggle-wireframe');
          wireframeToggleBtn.addEventListener('click', () => {
            this.renderer.toggleWireframe();
            const isWireframeOn = this.renderer.getWireframeState();
            
            // Update button text and style
            wireframeToggleBtn.textContent = isWireframeOn ? 'Wireframe: ON' : 'Wireframe: OFF';
            if (isWireframeOn) {
              wireframeToggleBtn.classList.add('active');
            } else {
              wireframeToggleBtn.classList.remove('active');
            }
          });
          
          // Set up intersection handling toggle button
          const intersectionToggleBtn = document.getElementById('btn-toggle-intersection');
          intersectionToggleBtn.addEventListener('click', () => {
            this.renderer.toggleIntersectionHandling();
            const isIntersectionHandlingOn = this.renderer.getIntersectionHandlingState();
            
            // Update button text and style
            intersectionToggleBtn.textContent = isIntersectionHandlingOn ? 
              'Intersection Handling: ON' : 'Intersection Handling: OFF';
            
            if (isIntersectionHandlingOn) {
              intersectionToggleBtn.classList.add('active');
            } else {
              intersectionToggleBtn.classList.remove('active');
            }
          });
          
          // Set up intersection lines toggle button
          const intersectionLinesToggleBtn = document.getElementById('btn-toggle-intersection-lines');
          intersectionLinesToggleBtn.addEventListener('click', () => {
            this.renderer.toggleIntersectionLines();
            const isIntersectionLinesOn = this.renderer.getIntersectionLinesState();
            
            // Update button text and style
            intersectionLinesToggleBtn.textContent = isIntersectionLinesOn ? 
              'Intersection Lines: ON' : 'Intersection Lines: OFF';
            
            if (isIntersectionLinesOn) {
              intersectionLinesToggleBtn.classList.add('active');
            } else {
              intersectionLinesToggleBtn.classList.remove('active');
            }
          });
        }
        
        setupKeyboardControls() {
          // Keyboard controls for toggling demo cube opacity
          window.addEventListener('keydown', (e) => {
            if (e.key === 't' || e.key === 'T') {
              // Toggle transparency on demo cube between 0.3 and 1.0
              if (this.demoCube) {
                const newOpacity = this.demoCube.materials[0].opacity === 1.0 ? 0.3 : 1.0;
                this.demoCube.setOpacity(newOpacity);
                
                // Update info text to show current state
                const infoElement = document.getElementById('info');
                const cameraText = this.cameraManager.cameraType.charAt(0).toUpperCase() + 
                                  this.cameraManager.cameraType.slice(1);
                const transparencyText = newOpacity < 1.0 ? "Transparent" : "Solid";
                infoElement.innerHTML = `3D SVG Renderer - ${cameraText} Camera - Demo cube: ${transparencyText} - Press T to toggle - Mouse: Drag to rotate, Wheel to zoom, Space for auto-rotation, 0 to switch camera`;
              }
            }
          });
        }
        
        initialize() {
          // Create scene with multiple cubes
          this.createScene();
          
          // Create minimap after scene is created
          const minimapContainer = document.getElementById('minimap-container');
          this.minimap = new MiniMap(minimapContainer, this.scene, this.cameraManager);
          
          // Set up render mode controls
          this.setupRenderModeControls();
          
          // Set up keyboard controls
          this.setupKeyboardControls();
          
          // Enable mouse controls on the container element
          this.cameraManager.enableMouseControls(this.container);
          
          // Update initial info text
          const infoElement = document.getElementById('info');
          infoElement.innerHTML = `3D SVG Renderer - Perspective Camera - Demo cube: Transparent - Press T to toggle - Mouse: Drag to rotate, Wheel to zoom, Space for auto-rotation, 0 to switch camera`;
          
          // Set up animation loop with all controllers
          this.animation = new Animation(
            this.renderer, 
            this.scene, 
            this.cameraManager.getActiveCamera(), 
            this.cameraManager.getAllControllers(),
            this.minimap // Pass minimap to animation loop
          );
          
          // Override the animation's render method to always use the active camera
          const originalRender = this.animation.animate;
          this.animation.animate = (time) => {
            if (!this.animation.running) return;
            
            // Use the current active camera
            this.animation.camera = this.cameraManager.getActiveCamera();
            
            // Call the original animate method
            originalRender(time);
          };
          
          // Handle resize
          window.addEventListener('resize', this.onResize.bind(this));
          
          // Start animation
          this.animation.start();
        }
        
        onResize() {
          const width = this.container.clientWidth;
          const height = this.container.clientHeight;
          
          this.renderer.setSize(width, height);
          this.cameraManager.onResize(width, height);
          
          // Update minimap on resize if needed
          if (this.minimap) {
            this.minimap.width = this.minimap.container.clientWidth;
            this.minimap.height = this.minimap.container.clientHeight;
            this.minimap.update();
          }
        }
      }
  
      // Initialize the application when DOM is loaded
      document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('container');
        const app = new App(container);
      });
      
      // Initialize immediately if DOM is already loaded
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        const container = document.getElementById('container');
        const app = new App(container);
      }