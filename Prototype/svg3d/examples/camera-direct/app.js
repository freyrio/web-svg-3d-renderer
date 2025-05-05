// Get the container element
const container = document.getElementById('container');

// Create a scene
const scene = new Scene();
scene.background = '#111';

// Create a renderer
const renderer = new SVGRenderer(container, window.innerWidth, window.innerHeight);

// Create a camera directly without using CameraManager or OrbitController
const camera = new Camera('perspective');

// Configure camera for the current viewport with a single call
camera.setupForViewport(
  window.innerWidth,
  window.innerHeight,
  45,    // fov
  0.1,   // near
  100,   // far
  0.5    // zoom (for orthographic mode)
);

// Set up scene with some cubes
function createCubes() {
  // Create a grid of colorful cubes
  const colors = [
    '#ff4444', '#44ff44', '#4444ff', 
    '#ffff44', '#ff44ff', '#44ffff'
  ];
  
  let cubeIndex = 0;
  for (let x = -2; x <= 2; x += 2) {
    for (let z = -2; z <= 2; z += 2) {
      const colorIndex = (x + 2) / 2 + ((z + 2) / 2) * 3;
      const color = colors[colorIndex % colors.length];
      
      // Create a cube with a single material
      const material = new Material(color);
      const cube = Mesh.createBox(1, 1, 1, material);
      cube.position.set(x, 0, z);
      // Add a name property for identification
      cube.setName(`Cube ${++cubeIndex} (${x},0,${z})`);
      scene.add(cube);
    }
  }
  
  // Add a larger central cube with textured material
  // First create a texture
  const texturePath = '../../assets/textures/Wood_Crate_001_basecolor.jpg';
  
  // Try to preload the image directly to verify it loads
  const preloadImg = new Image();
  preloadImg.onload = () => {
    console.log('Image preloaded successfully:', preloadImg.src);
    console.log('Image dimensions:', preloadImg.width, 'x', preloadImg.height);
  };
  preloadImg.onerror = (err) => {
    console.error('Failed to preload image:', preloadImg.src, err);
  };
  preloadImg.src = texturePath;
  
  // Now create the texture for the renderer
  const crateTexture = Texture.fromURL(texturePath, 
    // On load callback
    (texture) => {
      console.log('Crate texture loaded successfully', texture);
      console.log('Image dimensions:', texture.image.width, 'x', texture.image.height);
      console.log('Loaded state:', texture.loaded);
      console.log('Texture object details:', 
        'URL:', texture.url, 
        'Image loaded:', !!texture.image,
        'Image complete:', texture.image ? texture.image.complete : false
      );
      
      // Force a complete re-render when texture loads
      setTimeout(() => {
        console.log('Forcing re-render after texture load');
        renderer.render(scene, camera);
      }, 100);
    },
    // On error callback
    (err) => {
      console.error('Failed to load crate texture:', err);
    }
  );
  
  // Create a material using the texture we just created
  const centerMaterial = new Material({
    color: '#FF0000', // Use a bright red color as fallback to make it obvious if texture isn't applied
    opacity: 1.0,     // Use full opacity
    shading: 'flat'   // Use flat shading instead of phong to simplify rendering
  });
  
  // Set the texture map on the material and log additional details
  centerMaterial.setMap(crateTexture);
  console.log('Material with texture:', centerMaterial);
  
  // Create cube with explicit textures on each face
  const geometry = Geometry.createBox(0.8, 0.8, 0.8);
  
  // Create 6 identical materials with the texture for each face
  const materials = [];
  for (let i = 0; i < 6; i++) {
    const faceMaterial = new Material({
      color: '#FF0000',
      opacity: 1.0,
      shading: 'flat'
    });
    faceMaterial.setMap(crateTexture);
    materials.push(faceMaterial);
  }
  
  // Create a textured cube with the materials array
  const centerCube = new Mesh(geometry, materials);
  centerCube.position.set(0, 1.5, 0);
  centerCube.setName('Textured Crate (0,1.5,0)');
  
  // Ensure all faces have materials by updating face materials
  centerCube.updateFaceMaterials();
  
  scene.add(centerCube);
  
  // Populate target selector dropdown
  populateTargetSelector();
}

// Find objects in scene by traversing the scene graph
function findNamedObjectsInScene(root) {
  const objects = [];
  
  function traverse(object) {
    // If the object has a name, add it to the list
    if (object.name) {
      objects.push({
        name: object.name,
        object: object,
        position: object.position
      });
    }
    
    // Recursively traverse children
    if (object.children && object.children.length > 0) {
      for (const child of object.children) {
        traverse(child);
      }
    }
  }
  
  traverse(root);
  return objects;
}

// Initial camera position
const sceneCenter = new Vector3(0, 0, 0);
let target = sceneCenter;
let distance = 10;
let phi = Math.PI / 2;    // 90 degrees - equator
let theta = 0;            // 0 degrees - front view
let isDragging = false;   // For mouse controls

// Set up the camera using our new orbit method
camera.orbit(target, distance, phi, theta);

// Force a complete update of all camera matrices
camera.updateAll();

// Create animation loop
const renderLoop = new RenderLoop(renderer, scene, camera);

// UI Controls - Camera Panel
let targetSelect, distanceSlider, distanceValue, phiSlider, phiValue, thetaSlider, thetaValue, modeSelect;
let btnFront, btnTop, btnRight, btnCustom;

// UI Controls - Rendering Panel
let renderModeSelect, wireframeToggle, intersectionToggle, intersectionLinesToggle, backfaceCullingToggle;
let depthThresholdSlider, depthThresholdValue;

// Scene outliner elements
let outlinerContent, focusSelectedBtn, refreshOutlinerBtn;

// Advanced Stats Elements
let statsFps, statsObjects, statsFaces, statsCulled, statsIntersections, statsRenderTime;

// Track currently selected object in outliner
let selectedOutlinerItem = null;

// Track rendering statistics
let renderStats = {
  fps: 0,
  meshCount: 0,
  faceCount: 0,
  culledFaces: 0,
  intersections: 0,
  renderTime: 0
};

// Initialize rendering controls
function initRenderingControls() {
  // Check if DOM elements are loaded
  if (!renderModeSelect || !wireframeToggle) {
    console.error('DOM elements not initialized for rendering controls');
    return;
  }
  
  // Set initial state based on renderer's settings
  renderModeSelect.value = renderer.renderMode;
  wireframeToggle.checked = renderer.showWireframe;
  intersectionToggle.checked = renderer.handleIntersections;
  intersectionLinesToggle.checked = renderer.showIntersectionLines;
  
  // Set initial values for new controls
  backfaceCullingToggle.checked = true; // Assuming default is true
  depthThresholdSlider.value = renderer.intersectionThreshold || 0.05;
  depthThresholdValue.textContent = depthThresholdSlider.value;
  
  // Add event listeners
  renderModeSelect.addEventListener('change', () => {
    renderer.setRenderMode(renderModeSelect.value);
  });
  
  wireframeToggle.addEventListener('change', () => {
    renderer.showWireframe = wireframeToggle.checked;
  });
  
  intersectionToggle.addEventListener('change', () => {
    renderer.handleIntersections = intersectionToggle.checked;
  });
  
  intersectionLinesToggle.addEventListener('change', () => {
    renderer.showIntersectionLines = intersectionLinesToggle.checked;
  });
  
  // Add event listeners for new controls
  backfaceCullingToggle.addEventListener('change', () => {
    // Use the proper renderer method to toggle backface culling
    renderer.setBackfaceCulling(backfaceCullingToggle.checked);
  });
  
  depthThresholdSlider.addEventListener('input', () => {
    const value = parseFloat(depthThresholdSlider.value);
    depthThresholdValue.textContent = value.toFixed(2);
    renderer.intersectionThreshold = value;
  });
}

// Populate target selector with objects from the scene graph
function populateTargetSelector() {
  // Clear existing options (except Scene Center)
  while (targetSelect.options.length > 1) {
    targetSelect.remove(1);
  }
  
  // Find all named objects in the scene
  const sceneObjects = findNamedObjectsInScene(scene);
  
  // Add objects to the dropdown
  sceneObjects.forEach(obj => {
    const option = document.createElement('option');
    option.value = obj.name;
    option.textContent = obj.name;
    targetSelect.appendChild(option);
  });
}

// Update camera position based on controls
function updateCamera() {
  // Get values from sliders
  const newDistance = parseFloat(distanceSlider.value);
  const newPhi = parseFloat(phiSlider.value);
  const newTheta = parseFloat(thetaSlider.value);
  
  // Update display values
  distanceValue.textContent = newDistance.toFixed(1);
  phiValue.textContent = `${Math.round(newPhi * 180 / Math.PI)}°`;
  thetaValue.textContent = `${Math.round(newTheta * 180 / Math.PI)}°`;
  
  // Update global variables
  distance = newDistance;
  phi = newPhi;
  theta = newTheta;
  
  // Use the orbit method to position and point the camera
  camera.orbit(target, distance, phi, theta);
}

// Make sure we add all camera-related event listeners only after DOM elements are loaded
function initCameraControls() {
  // Check if DOM elements are loaded
  if (!distanceSlider || !phiSlider || !thetaSlider) {
    console.error('DOM elements not initialized for camera controls');
    return;
  }
  
  // Set up event listeners
  distanceSlider.addEventListener('input', updateCamera);
  phiSlider.addEventListener('input', updateCamera);
  thetaSlider.addEventListener('input', updateCamera);

  // Target selection
  targetSelect.addEventListener('change', () => {
    const selectedValue = targetSelect.value;
    
    if (selectedValue === 'scene-center') {
      target = sceneCenter;
    } else {
      // Find the object in the scene
      const objects = findNamedObjectsInScene(scene);
      const selectedObj = objects.find(obj => obj.name === selectedValue);
      
      if (selectedObj) {
        // Use the object's position as target
        target = selectedObj.position;
      }
    }
    
    // Update camera to look at new target
    updateCamera();
  });

  // Preset view buttons
  btnFront.addEventListener('click', () => {
    phiSlider.value = Math.PI / 2;   // 90 degrees
    thetaSlider.value = 0;           // 0 degrees
    updateCamera();
  });

  btnTop.addEventListener('click', () => {
    phiSlider.value = 0.1;           // Almost 0 (can't be exactly 0)
    thetaSlider.value = 0;           // 0 degrees
    updateCamera();
  });

  btnRight.addEventListener('click', () => {
    phiSlider.value = Math.PI / 2;   // 90 degrees
    thetaSlider.value = Math.PI / 2; // 90 degrees
    updateCamera();
  });

  btnCustom.addEventListener('click', () => {
    phiSlider.value = Math.PI / 4;   // 45 degrees
    thetaSlider.value = Math.PI / 4; // 45 degrees
    updateCamera();
  });

  // Projection mode toggle
  modeSelect.addEventListener('change', () => {
    camera.setProjectionMode(modeSelect.value);
  });
  
  // Initialize mouse controls
  initMouseControls();
}

// Setup mouse controls
function initMouseControls() {
  // Mouse control variables
  let previousMouseX = 0;
  let previousMouseY = 0;
  const mouseRotationSpeed = 0.005;

  // Mouse event listeners for orbit control
  container.addEventListener('mousedown', (e) => {
    // Check for middle mouse button (button code 1)
    if (e.button === 1) {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
      e.preventDefault();
    }
  });

  container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - previousMouseX;
    const deltaY = e.clientY - previousMouseY;
    
    // Update theta (horizontal) and phi (vertical) angles
    theta -= deltaX * mouseRotationSpeed;
    phi += deltaY * mouseRotationSpeed;
    
    // Keep theta between 0 and 2*PI
    theta %= (2 * Math.PI);
    if (theta < 0) theta += 2 * Math.PI;
    
    // Constrain phi to avoid the camera flipping
    phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
    
    // Update the sliders to match
    thetaSlider.value = theta;
    phiSlider.value = phi;
    
    // Update the camera
    updateCamera();
    
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 1) {
      isDragging = false;
    }
  });

  // Mouse wheel zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // Get the active camera mode type
    const isOrtho = camera.getProjectionMode() === 'orthographic';
    
    if (isOrtho) {
      // For orthographic camera, adjust zoom property
      const zoomDelta = e.deltaY * 0.001;
      const currentZoom = camera.getParameters().zoom;
      camera.setZoom(Math.max(0.1, Math.min(4, currentZoom * (1 - zoomDelta))));
    } else {
      // For perspective camera, adjust distance
      const zoomDelta = e.deltaY * 0.1;
      distance = Math.max(2, Math.min(20, distance + zoomDelta * 0.1));
      
      // Update the slider to match
      distanceSlider.value = distance;
      
      // Update the camera
      updateCamera();
    }
  }, { passive: false });

  // Handle window resize
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Update renderer size
    renderer.setSize(width, height);
    
    // Update camera for the new viewport size with a single call
    camera.setupForViewport(width, height);
  });
}

// FPS counter and stats display
const statsElement = document.getElementById('stats');
let frameCount = 0;
let lastTime = performance.now();
let lastRenderTime = 0;

function updateStats() {
  frameCount++;
  const now = performance.now();
  
  // Update once per second
  if (now - lastTime >= 1000) {
    const fps = Math.round((frameCount * 1000) / (now - lastTime));
    
    // Count meshes and faces
    let meshCount = 0;
    let faceCount = 0;
    
    function countObjects(object) {
      if (object.type === 'Mesh' && object.geometry && object.geometry.faces) {
        meshCount++;
        faceCount += object.geometry.faces.length;
      }
      
      if (object.children) {
        object.children.forEach(child => {
          countObjects(child);
        });
      }
    }
    
    countObjects(scene);
    
    // Update stats display
    statsElement.textContent = `FPS: ${fps} | Meshes: ${meshCount} | Faces: ${faceCount}`;
    
    // Update rendering statistics
    renderStats.fps = fps;
    renderStats.meshCount = meshCount;
    renderStats.faceCount = faceCount;
    renderStats.renderTime = lastRenderTime;
    
    // Estimate culled faces and intersections (these would normally come from the renderer)
    renderStats.culledFaces = Math.round(faceCount * 0.3); // Example estimate
    renderStats.intersections = renderer.intersectionMarkers ? 
      renderer.intersectionMarkers.length : 0;
    
    // Update the advanced stats display
    updateAdvancedStats();
    
    // Reset counters
    frameCount = 0;
    lastTime = now;
  }
  
  requestAnimationFrame(updateStats);
}

// Override the render method to measure render time
const originalRender = renderer.render;
renderer.render = function(scene, camera) {
  const startTime = performance.now();
  originalRender.call(this, scene, camera);
  lastRenderTime = performance.now() - startTime;
};

// Init DOM elements function to be called when DOM is ready
function initDOMElements() {
  // Camera Panel
  targetSelect = document.getElementById('target-select');
  distanceSlider = document.getElementById('distance-slider');
  distanceValue = document.getElementById('distance-value');
  phiSlider = document.getElementById('phi-slider');
  phiValue = document.getElementById('phi-value');
  thetaSlider = document.getElementById('theta-slider');
  thetaValue = document.getElementById('theta-value');
  modeSelect = document.getElementById('mode-select');
  
  btnFront = document.getElementById('btn-front');
  btnTop = document.getElementById('btn-top');
  btnRight = document.getElementById('btn-right');
  btnCustom = document.getElementById('btn-custom');
  
  // Rendering Panel
  renderModeSelect = document.getElementById('render-mode');
  wireframeToggle = document.getElementById('wireframe-toggle');
  intersectionToggle = document.getElementById('intersection-toggle');
  intersectionLinesToggle = document.getElementById('intersection-lines-toggle');
  backfaceCullingToggle = document.getElementById('backface-culling');
  depthThresholdSlider = document.getElementById('depth-threshold');
  depthThresholdValue = document.getElementById('depth-threshold-value');
  
  // Scene outliner
  outlinerContent = document.getElementById('outliner-content');
  focusSelectedBtn = document.getElementById('focus-selected');
  refreshOutlinerBtn = document.getElementById('refresh-outliner');
  
  // Stats Elements
  statsFps = document.getElementById('stats-fps');
  statsObjects = document.getElementById('stats-objects');
  statsFaces = document.getElementById('stats-faces');
  statsCulled = document.getElementById('stats-culled');
  statsIntersections = document.getElementById('stats-intersections');
  statsRenderTime = document.getElementById('stats-render-time');
}

// Add to the initialization code
function initUI() {
  // DOM is loaded, so initialize all UI components
  initRenderingControls();
  initCameraControls(); 
  initSceneOutliner();
}

// Make sure we only run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize DOM elements
  initDOMElements();
  
  // Initialize scene with objects
  createCubes();

  // Initialize all UI components
  initUI();

  // Start the render loop and stats update
  renderLoop.start();
  updateStats();
  
  // Start the auto-rotation
  autoRotate();
  
  // Test SVG patterns directly
  testSVGPatterns();
});

// To avoid having to manually animate in this example, let's add a simple automatic rotation
// This creates a gentle automatic rotation around the scene
function autoRotate() {
  // Skip if user is interacting with controls
  if (document.activeElement === phiSlider || 
      document.activeElement === thetaSlider ||
      document.activeElement === distanceSlider ||
      isDragging) {
    requestAnimationFrame(autoRotate);
    return;
  }
  
  // Very slowly increase theta for a gentle rotation
  theta += 0.001;
  if (theta > Math.PI * 2) theta -= Math.PI * 2;
  
  // Update the slider to match
  thetaSlider.value = theta;
  
  // Update the camera
  camera.orbit(target, distance, phi, theta);
  
  // Update the display value
  thetaValue.textContent = `${Math.round(theta * 180 / Math.PI)}°`;
  
  requestAnimationFrame(autoRotate);
}

// Update the advanced stats display
function updateAdvancedStats() {
  statsFps.textContent = `${renderStats.fps} FPS`;
  statsObjects.textContent = `${renderStats.meshCount} meshes`;
  statsFaces.textContent = `${renderStats.faceCount} triangles`;
  statsCulled.textContent = renderStats.culledFaces || '0';
  statsIntersections.textContent = renderStats.intersections || '0';
  statsRenderTime.textContent = `${renderStats.renderTime.toFixed(2)} ms`;
}

// Initialize the scene outliner
function initSceneOutliner() {
  // Check if required elements exist
  if (!outlinerContent) {
    console.error('outlinerContent not found, scene outliner cannot be initialized');
    return;
  }

  // First clear the outliner container
  outlinerContent.innerHTML = '';
  
  // Start with the scene as the root
  const rootNode = createOutlinerNode('Scene', 'Root', true, scene);
  outlinerContent.appendChild(rootNode);
  
  // Expand the root node by default
  rootNode.classList.remove('collapsed');
  const toggleIcon = rootNode.querySelector('.toggle-icon');
  if (toggleIcon) {
    toggleIcon.textContent = '▼';
  }
  
  // Build the scene tree recursively
  buildSceneTree(scene, rootNode);
  
  // Add event listeners for outliner functions
  if (focusSelectedBtn) {
    focusSelectedBtn.addEventListener('click', focusSelectedObject);
  }
  
  if (refreshOutlinerBtn) {
    refreshOutlinerBtn.addEventListener('click', refreshOutliner);
  }
}

// Create an outliner node element
function createOutlinerNode(type, name, isVisible, object = null) {
  const treeItem = document.createElement('div');
  treeItem.className = 'tree-item collapsed';  // Start collapsed
  
  // Store a reference to the 3D object if provided
  if (object) {
    treeItem.dataset.objectId = object.id;
  }
  
  const itemContent = document.createElement('div');
  itemContent.className = 'tree-item-content';
  
  // Add toggle icon (for expanding/collapsing)
  const toggleIcon = document.createElement('span');
  toggleIcon.className = 'toggle-icon';
  toggleIcon.textContent = '▶';
  itemContent.appendChild(toggleIcon);
  
  // Add type label
  const typeLabel = document.createElement('span');
  typeLabel.className = 'item-type';
  typeLabel.textContent = type;
  itemContent.appendChild(typeLabel);
  
  // Add name label
  const nameLabel = document.createElement('span');
  nameLabel.className = 'item-name';
  nameLabel.textContent = name;
  itemContent.appendChild(nameLabel);
  
  // Add visibility icon
  const visibilityIcon = document.createElement('span');
  visibilityIcon.className = 'item-visibility';
  visibilityIcon.textContent = isVisible ? '👁️' : '👁️‍🗨️';
  visibilityIcon.style.opacity = isVisible ? '1' : '0.3';
  itemContent.appendChild(visibilityIcon);
  
  // Add children container
  const childrenContainer = document.createElement('div');
  childrenContainer.className = 'tree-children';
  
  // Add event listeners
  itemContent.addEventListener('click', (e) => {
    // Prevent event bubbling
    e.stopPropagation();
    
    // Select this item
    selectOutlinerItem(treeItem);
    
    // Toggle expand/collapse when clicking on items with children
    if (treeItem.querySelector('.tree-children').childNodes.length > 0) {
      toggleOutlinerNode(treeItem);
    }
  });
  
  // Toggle expand/collapse when clicking the toggle icon
  toggleIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleOutlinerNode(treeItem);
  });
  
  // Toggle visibility when clicking the visibility icon
  visibilityIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleObjectVisibility(treeItem, visibilityIcon);
  });
  
  // Add elements to tree item
  treeItem.appendChild(itemContent);
  treeItem.appendChild(childrenContainer);
  
  return treeItem;
}

// Build the scene tree recursively
function buildSceneTree(sceneNode, parentElement) {
  // Find all children of this node
  const childrenContainer = parentElement.querySelector('.tree-children');
  
  // Process all children in the scene node
  if (sceneNode.children && sceneNode.children.length > 0) {
    // Show the toggle icon for nodes with children
    const toggleIcon = parentElement.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.style.visibility = 'visible';
    }
    
    // Process each child
    sceneNode.children.forEach(child => {
      // Skip invisible objects by default
      if (child.visible === false) {
        return;
      }
      
      // Determine the type of the object based on its type property
      let type = child.type || 'Object';
      
      // For meshes, use a more specific label based on geometry
      if (child.type === 'Mesh' && child.geometry) {
        if (child.geometry.boundingBox) {
          const bbox = child.geometry.boundingBox;
          const w = bbox.max.x - bbox.min.x;
          const h = bbox.max.y - bbox.min.y;
          const d = bbox.max.z - bbox.min.z;
          
          if (Math.abs(w - h) < 0.01 && Math.abs(w - d) < 0.01) {
            type = 'Box';
          } else if (Math.abs(d) < 0.01) {
            type = 'Plane';
          } else if (child.geometry.vertices.length > 20) {
            type = 'Sphere'; // Rough heuristic for spheres
          }
        }
      }
      
      // Get the name (use the object's name property if available, otherwise use a generic name)
      const name = child.name || `${type}_${child.id}`;
      
      // Create a node for this child
      const childNode = createOutlinerNode(type, name, child.visible !== false, child);
      childrenContainer.appendChild(childNode);
      
      // Recursively process its children
      buildSceneTree(child, childNode);
    });
  } else {
    // Hide toggle icon for leaf nodes
    const toggleIcon = parentElement.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.style.visibility = 'hidden';
    }
  }
}

// Toggle node expand/collapse
function toggleOutlinerNode(node) {
  node.classList.toggle('collapsed');
  
  // Update toggle icon
  const toggleIcon = node.querySelector('.toggle-icon');
  if (toggleIcon) {
    toggleIcon.textContent = node.classList.contains('collapsed') ? '▶' : '▼';
  }
}

// Select an outliner item
function selectOutlinerItem(item) {
  // Deselect previous item
  if (selectedOutlinerItem) {
    selectedOutlinerItem.classList.remove('selected');
  }
  
  // Select new item
  item.classList.add('selected');
  selectedOutlinerItem = item;
}

// Toggle object visibility
function toggleObjectVisibility(treeItem, visibilityIcon) {
  // Get the object ID from the tree item's data attribute
  const objectId = treeItem.dataset.objectId;
  
  // If no object ID, this might be a parent node (like Scene)
  if (!objectId) return;
  
  // Find the object in the scene
  let foundObject = null;
  
  // Helper function to search for the object by ID
  function findObjectById(object) {
    if (object.id == objectId) {
      foundObject = object;
      return;
    }
    
    if (object.children) {
      object.children.forEach(findObjectById);
    }
  }
  
  findObjectById(scene);
  
  // Toggle the object's visibility
  if (foundObject) {
    foundObject.visible = !foundObject.visible;
    
    // Update the visibility icon
    visibilityIcon.textContent = foundObject.visible ? '👁️' : '👁️‍🗨️';
    visibilityIcon.style.opacity = foundObject.visible ? '1' : '0.3';
  }
}

// Focus the camera on the selected object
function focusSelectedObject() {
  if (!selectedOutlinerItem || !selectedOutlinerItem.dataset.objectId) {
    return;
  }
  
  // Get the object ID from the selected item
  const objectId = selectedOutlinerItem.dataset.objectId;
  
  // Find the object in the scene
  let foundObject = null;
  
  function findObjectById(object) {
    if (object.id == objectId) {
      foundObject = object;
      return;
    }
    
    if (object.children) {
      object.children.forEach(findObjectById);
    }
  }
  
  findObjectById(scene);
  
  // If object found, focus on it
  if (foundObject) {
    // Update the target to the object's position
    target = foundObject.position;
    
    // Update the camera
    updateCamera();
    
    // Update the target select dropdown to match the new target
    if (foundObject.name) {
      const options = Array.from(targetSelect.options);
      const option = options.find(opt => opt.textContent === foundObject.name);
      if (option) {
        targetSelect.value = option.value;
      }
    }
  }
}

// Refresh the outliner
function refreshOutliner() {
  initSceneOutliner();
}

// Function to test if SVG patterns work at all
function testSVGPatterns() {
  console.log('Running direct SVG pattern test');
  
  // Create a test SVG
  const testSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  testSvg.setAttribute('width', '200');
  testSvg.setAttribute('height', '200');
  testSvg.style.position = 'absolute';
  testSvg.style.bottom = '10px';
  testSvg.style.right = '10px';
  testSvg.style.border = '1px solid white';
  testSvg.style.zIndex = '1000';
  
  // Create defs and pattern
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
  pattern.setAttribute('id', 'test-pattern');
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  pattern.setAttribute('width', '50');
  pattern.setAttribute('height', '50');
  
  // Create a simple pattern with a red rectangle
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', '25');
  rect.setAttribute('height', '25');
  rect.setAttribute('fill', 'red');
  
  // Create another rectangle for the pattern
  const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect2.setAttribute('x', '25');
  rect2.setAttribute('y', '25');
  rect2.setAttribute('width', '25');
  rect2.setAttribute('height', '25');
  rect2.setAttribute('fill', 'blue');
  
  // Add items to pattern
  pattern.appendChild(rect);
  pattern.appendChild(rect2);
  defs.appendChild(pattern);
  testSvg.appendChild(defs);
  
  // Create a rectangle that uses the pattern
  const testRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  testRect.setAttribute('x', '10');
  testRect.setAttribute('y', '10');
  testRect.setAttribute('width', '180');
  testRect.setAttribute('height', '180');
  testRect.setAttribute('fill', 'url(#test-pattern)');
  testSvg.appendChild(testRect);
  
  // Add the test SVG to the document
  document.body.appendChild(testSvg);
  
  // Now try creating a test pattern using the texture image
  setTimeout(() => {
    const texturePath = '../../assets/textures/Wood_Crate_001_basecolor.jpg';
    const testImg = new Image();
    testImg.onload = () => {
      console.log('Creating image pattern test');
      
      // Create a new test SVG
      const imgTestSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      imgTestSvg.setAttribute('width', '200');
      imgTestSvg.setAttribute('height', '200');
      imgTestSvg.style.position = 'absolute';
      imgTestSvg.style.bottom = '10px';
      imgTestSvg.style.left = '10px';
      imgTestSvg.style.border = '1px solid white';
      imgTestSvg.style.zIndex = '1000';
      
      // Create defs and pattern
      const imgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const imgPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
      imgPattern.setAttribute('id', 'test-img-pattern');
      imgPattern.setAttribute('patternUnits', 'userSpaceOnUse');
      imgPattern.setAttribute('width', testImg.width);
      imgPattern.setAttribute('height', testImg.height);
      
      // Create an image element for the pattern
      const svgImg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      svgImg.setAttribute('href', texturePath);
      svgImg.setAttribute('x', '0');
      svgImg.setAttribute('y', '0');
      svgImg.setAttribute('width', testImg.width);
      svgImg.setAttribute('height', testImg.height);
      
      // Add items to pattern
      imgPattern.appendChild(svgImg);
      imgDefs.appendChild(imgPattern);
      imgTestSvg.appendChild(imgDefs);
      
      // Create a rectangle that uses the pattern
      const imgTestRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      imgTestRect.setAttribute('x', '10');
      imgTestRect.setAttribute('y', '10');
      imgTestRect.setAttribute('width', '180');
      imgTestRect.setAttribute('height', '180');
      imgTestRect.setAttribute('fill', 'url(#test-img-pattern)');
      imgTestSvg.appendChild(imgTestRect);
      
      // Add the test SVG to the document
      document.body.appendChild(imgTestSvg);
    };
    testImg.src = texturePath;
  }, 1000);
} 