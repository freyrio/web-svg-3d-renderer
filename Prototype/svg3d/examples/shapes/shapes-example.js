// Example of using the SVG3D library with method chaining and shape factory

// Get the container for our scene
const container = document.getElementById('container');

// Create a scene
const scene = new Scene();

// Create a renderer
const renderer = new SVGRenderer(container, window.innerWidth, window.innerHeight);

// Create a camera manager
const cameraManager = new CameraManager(container);
const camera = cameraManager.getActiveCamera();

// Set a better initial camera position to see all objects
cameraManager.controller.distance = 15;
cameraManager.controller._updateCameraPosition();

// Enable mouse controls
cameraManager.enableMouseControls(container);

// Create a few shapes using the Shapes factory and method chaining
// 1. Create a cube at the center
const cube = Shapes.createCube(2, 2, 2)
  .setPosition(0, 0, 0)
  .setRotation(Math.PI/6, Math.PI/6, 0);

// Override materials with brighter colors
cube.materials[0].setColor('#FF5555'); // Right - Red
cube.materials[1].setColor('#55FF55'); // Left - Green  
cube.materials[2].setColor('#5555FF'); // Top - Blue
cube.materials[3].setColor('#FFFF55'); // Bottom - Yellow
cube.materials[4].setColor('#FF55FF'); // Front - Magenta
cube.materials[5].setColor('#55FFFF'); // Back - Cyan

scene.add(cube);

// 2. Create a sphere to the right
const sphere = Shapes.createSphere(1.5, 24, new Material('#FF6600'))
  .setPosition(5, 0, 0)
  .setScale(1, 1.5, 1);  // Make it slightly elliptical
scene.add(sphere);

// 3. Create a plane below everything
const plane = Shapes.createPlane(15, 15, 10, 10, new Material('#AACCFF'))
  .setPosition(0, -3, 0)
  .setRotation(-Math.PI/2, 0, 0);  // Rotate to be horizontal (XZ plane)
scene.add(plane);

// 4. Create a semi-transparent box
const glassBox = Shapes.createBox(1.5)
  .setPosition(-5, 0, 0);

// Get the default materials and make them semi-transparent
glassBox.materials.forEach(material => {
  material.setColor('#88AAFF');
  material.setOpacity(0.4);
});

scene.add(glassBox);

// 5. Create a wireframe grid for reference
const grid = Shapes.createGrid(20, 20, '#666666')
  .setPosition(0, -3.01, 0)  // Slightly below the plane to avoid z-fighting
  .setRotation(-Math.PI/2, 0, 0);
scene.add(grid);

// Initialize the toolbar
const toolbar = new Toolbar({
  parent: document.body,
  position: 'left',
  theme: 'dark',
  tools: ['select', 'add'],
  onToolChange: (tool) => {
    console.log(`Tool changed to ${tool}`);
    // Update cursor based on tool
    if (tool === 'select') {
      container.style.cursor = 'default';
    } else if (tool === 'add') {
      container.style.cursor = 'crosshair';
    }
  },
  onShapeAdd: (shapeType, x, y) => {
    console.log(`Adding ${shapeType} at (${x}, ${y})`);
    
    // Convert screen coordinates to world coordinates
    // This is a simplified version since we don't have real raycasting yet
    
    // Get normalized device coordinates (-1 to 1)
    const rect = container.getBoundingClientRect();
    const ndcX = ((x - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((y - rect.top) / rect.height) * 2 + 1; // Y is flipped
    
    // Create a simple placement function that puts objects in view
    // This is temporary until we implement proper raycasting
    const depth = 10; // Fixed depth for now
    const fov = camera.perspective.fov * (Math.PI / 180);
    const aspectRatio = camera.perspective.aspect;
    
    // Calculate world position based on camera and normalized coordinates
    const worldX = ndcX * depth * Math.tan(fov / 2) * aspectRatio;
    const worldY = ndcY * depth * Math.tan(fov / 2);
    const worldZ = -depth; // Negative Z goes into the screen (in view space)
    
    // Create the appropriate shape based on type
    let shape;
    
    if (shapeType === 'cube') {
      shape = Shapes.createCube(2, 2, 2);
      
      // Randomize colors
      const hue = Math.floor(Math.random() * 360);
      shape.materials.forEach((material, index) => {
        material.setColor(`hsl(${(hue + index * 30) % 360}, 70%, 60%)`);
      });
    } 
    else if (shapeType === 'sphere') {
      const hue = Math.floor(Math.random() * 360);
      const material = new Material(`hsl(${hue}, 70%, 60%)`);
      shape = Shapes.createSphere(1.5, 24, material);
    }
    else if (shapeType === 'plane') {
      const hue = Math.floor(Math.random() * 360);
      const material = new Material(`hsl(${hue}, 70%, 60%)`);
      shape = Shapes.createPlane(4, 4, 2, 2, material);
    }
    
    // Apply a random rotation
    shape.setRotation(
      Math.random() * Math.PI / 4,
      Math.random() * Math.PI / 4,
      Math.random() * Math.PI / 4
    );
    
    // Position the shape in world space
    // Convert from view space to world space
    // This is simplified and doesn't take the camera's rotation into account properly
    const viewPos = new Vector3(worldX, worldY, worldZ);
    
    // Adjust position to be relative to camera
    shape.setPosition(
      camera.position.x + viewPos.x,
      camera.position.y + viewPos.y,
      camera.position.z + viewPos.z
    );
    
    // Add to scene
    scene.add(shape);
    
    // Update UI
    updateSceneInfo();
    
    // Update minimap to show the new object
    minimap.update();
  }
});

// Initialize the minimap
const minimap = new MiniMap({
  parent: document.body,
  position: 'bottom-right',
  theme: 'dark',
  size: 160,
  scene: scene,
  camera: camera,
  showGrid: true,
  showAxes: true,
  autoRotate: false,
  boundaryPadding: 5
});

// Helper function to update scene information
function updateSceneInfo() {
  const exampleInfoElement = document.getElementById('example-info');
  if (exampleInfoElement) {
    const shapeCount = countShapes(scene);
    
    exampleInfoElement.innerHTML = `
      <h2>SVG3D Shapes Example</h2>
      <p>Using Blender-style toolbar to add shapes.</p>
      <ul>
        <li>Select tool: Default cursor</li>
        <li>Add tool: Click to add the selected shape</li>
        <li>Shapes in scene: ${shapeCount}</li>
      </ul>
    `;
  }
}

// Helper function to count shapes in the scene
function countShapes(object) {
  let count = 0;
  
  if (object instanceof Cube || object instanceof Sphere || object instanceof Plane) {
    count++;
  }
  
  // Recursively count children
  object.children.forEach(child => {
    count += countShapes(child);
  });
  
  return count;
}

// Set up animation loop
const renderLoop = new RenderLoop(
  renderer,
  scene,
  camera,
  cameraManager.getAllControllers(),
  minimap // Pass minimap to render loop for automatic updates
);

// Handle window resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  cameraManager.onResize(window.innerWidth, window.innerHeight);
});

// Add stats updates to the stats info area
const statsElement = document.getElementById('stats');
if (statsElement) {
  // Override the updateStats method to update our stats element
  renderLoop.updateStats = function() {
    // Count meshes (cubes) in the scene
    this.meshCount = 0;
    this.faceCount = 0;
    
    // Recursive function to count objects
    const countObjects = (object) => {
      if (object instanceof Cube || object instanceof Sphere || object instanceof Plane) {
        this.meshCount++;
        if (object.faces) {
          this.faceCount += object.faces.length;
        }
      }
      
      object.children.forEach(child => {
        countObjects(child);
      });
    };
    
    countObjects(this.scene);
    
    // Update stats display
    if (statsElement) {
      statsElement.textContent = `FPS: ${this.fps.toFixed(1)} | Meshes: ${this.meshCount} | Faces: ${this.faceCount}`;
    }
    
    // Update minimap if available
    if (this.minimap) {
      this.minimap.update();
    }
  };
}

// Initialize scene info
updateSceneInfo();

// Start animation
renderLoop.start(); 