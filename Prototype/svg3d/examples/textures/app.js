// Textures Example - SVG 3D Renderer
// This example demonstrates texture mapping with UV visualization

// Global variables
let renderer, scene, camera, cube;
let stats = { fps: 0, faces: 0 };
let lastTime = 0;
let frameCount = 0;
let fpsUpdateInterval = 500; // Update FPS every 500ms
let lastFpsUpdate = 0;
let selectedFace = null;
let uvRenderer;
let showAllUVs = false;

// Camera orbit parameters
let target = new Vector3(0, 0, 0);
let distance = 8; // Increased from 5 to match camera-direct
let phi = Math.PI / 3;    // Changed from PI/2 to PI/3 (60 degrees from top)
let theta = Math.PI / 4;  // Changed from 0 to PI/4 (45 degrees horizontal rotation)
let isDragging = false;   // For mouse controls

// Texture properties
const textureSettings = {
  url: '../../assets/textures/Wood_Crate_001_basecolor.jpg',
  repeatX: 1,
  repeatY: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  flipY: true
};

// Initialize the application
function init() {
  initRenderer();
  initUVVisualization();
  initScene();
  initControls();
  initEventListeners();
  
  // Force an initial render to ensure visibility
  console.log("Forcing initial render");
  renderer.render(scene, camera);
  
  // Start the render loop
  requestAnimationFrame(animate);
}

// Initialize the 3D renderer
function initRenderer() {
  const container = document.getElementById('view3d-content');
  renderer = new SVGRenderer(container, container.clientWidth, container.clientHeight);
  renderer.initialize();
  
  // Set background color to make it obvious if renderer is working
  if (renderer.svgElement) {
    renderer.svgElement.style.backgroundColor = '#333';
  }
  
  // Enable backface culling
  renderer.setBackfaceCulling(true);
  
  console.log("Renderer initialized:", renderer);
}

// Initialize the scene with camera and geometry
function initScene() {
  scene = new Scene();
  
  // Create a regular Camera instead of ViewCamera to match the camera-direct example
  camera = new Camera('perspective');
  camera.setupForViewport(
    document.getElementById('view3d-content').clientWidth,
    document.getElementById('view3d-content').clientHeight,
    45, 0.1, 100, 1
  );
  
  // Apply the orbit
  camera.orbit(target, distance, phi, theta);
  
  // Force a complete update of all camera matrices - CRITICAL ADDITION
  camera.updateAll();
  
  console.log("Camera initialized:", camera);
  console.log("Camera position:", camera.position);
  
  // Create a textured cube
  createCube();
  
  // Force an initial render to make sure something appears
  setTimeout(() => {
    console.log("Forcing initial render");
    console.log("Scene:", scene);
    console.log("Cube:", cube);
    
    // Render the scene
    renderer.render(scene, camera);
  }, 100);
}

// Create a textured cube
function createCube() {
  console.log("Creating cube...");
  
  // Create a simpler material initially to ensure visibility
  const material = Material.basic('#ff0000', 1.0);
  
  // Create a larger cube to ensure visibility
  cube = Mesh.createBox(4, 4, 4, material);
  cube.setPosition(0, 0, 0);
  scene.add(cube);
  
  console.log("Cube created:", cube);
  
  // Update the face counter
  updateStats();
  
  // Set a wireframe to make cube more visible
  renderer.showWireframe = true;
  
  // Directly render after creating cube to verify it appears
  renderer.render(scene, camera);
  
  // Load the texture separately after initialization
  Texture.fromURL(textureSettings.url, (texture) => {
    console.log("Texture loaded:", texture);
    
    // Only update after we know initialization is complete
    setTimeout(() => {
      // Apply texture to existing material
      cube.material.setMap(texture);
      updateTexture(texture);
      renderer.render(scene, camera);
      
      console.log("Texture applied to cube");
    }, 100);
  });
}

// Initialize orbit controls for the 3D view
function initControls() {
  const container = document.getElementById('view3d-content');
  
  // Position the camera using orbit
  camera.orbit(target, distance, phi, theta);
  // Force update all camera matrices
  camera.updateAll();
  
  // Mouse control variables
  let previousMouseX = 0;
  let previousMouseY = 0;
  const mouseRotationSpeed = 0.005;

  // Mouse event listeners for orbit control
  container.addEventListener('mousedown', (e) => {
    // Check for middle mouse button (button code 1) or left mouse button with Alt key
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
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
    
    // Update the camera orbit
    camera.orbit(target, distance, phi, theta);
    // Force update all camera matrices after orbit change
    camera.updateAll();
    
    // Render with updated camera
    renderer.render(scene, camera);
    updateUVVisualization();
    
    previousMouseX = e.clientX;
    previousMouseY = e.clientY;
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      isDragging = false;
    }
  });

  // Mouse wheel zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    // Adjust distance based on wheel direction
    const zoomDelta = e.deltaY * 0.01;
    distance = Math.max(2, Math.min(20, distance + zoomDelta));
    
    // Update the camera
    camera.orbit(target, distance, phi, theta);
    // Force update all camera matrices
    camera.updateAll();
    
    // Render with updated camera
    renderer.render(scene, camera);
    updateUVVisualization();
  }, { passive: false });
}

// Initialize the UV visualization
function initUVVisualization() {
  const uvContainer = document.getElementById('uv-content');
  const uvSvg = document.getElementById('uv-svg');
  
  // Create a group for UV visualization
  const uvGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  uvGroup.id = 'uv-visualization';
  uvSvg.appendChild(uvGroup);
  
  // Display the texture image
  updateTextureDisplay();
}

// Update the texture display in the UV panel
function updateTextureDisplay() {
  const textureDisplay = document.getElementById('texture-display');
  textureDisplay.src = textureSettings.url;
  textureDisplay.style.transform = `
    rotate(${textureSettings.rotation}deg)
    scale(${textureSettings.repeatX}, ${textureSettings.repeatY})
    translate(${textureSettings.offsetX * 100}%, ${textureSettings.offsetY * 100}%)
    ${textureSettings.flipY ? 'scaleY(-1)' : ''}
  `;
}

// Update the UV visualization
function updateUVVisualization() {
  const uvGroup = document.getElementById('uv-visualization');
  
  // If UV group doesn't exist yet, return early
  if (!uvGroup) return;
  
  // Clear previous visualization
  while (uvGroup.firstChild) {
    uvGroup.removeChild(uvGroup.firstChild);
  }
  
  if (!cube) return;
  
  // Access the cube geometry
  const geometry = cube.geometry;
  const faces = geometry.faces;
  
  // Draw UV coordinates for each face or just the selected face
  for (let i = 0; i < faces.length; i++) {
    if (showAllUVs || selectedFace === i) {
      drawFaceUVs(faces[i], i, uvGroup);
    }
  }
}

// Draw UV coordinates for a face
function drawFaceUVs(face, faceIndex, uvGroup) {
  if (!face.uv || face.uv.length < 3) return;
  
  // Get UV coordinates
  const uv1 = face.uv[0];
  const uv2 = face.uv[1];
  const uv3 = face.uv[2];
  
  // Create polygon for the UV face
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  
  // Set polygon points from UV coordinates
  const points = `${uv1.x},${1-uv1.y} ${uv2.x},${1-uv2.y} ${uv3.x},${1-uv3.y}`;
  polygon.setAttribute('points', points);
  
  // Style based on whether this is the selected face
  const isSelected = selectedFace === faceIndex;
  polygon.setAttribute('fill', isSelected ? 'rgba(255,255,0,0.3)' : 'rgba(128,128,255,0.2)');
  polygon.setAttribute('stroke', isSelected ? '#ff0' : '#88f');
  polygon.setAttribute('stroke-width', isSelected ? '0.01' : '0.005');
  polygon.setAttribute('data-face', faceIndex);
  
  // Add click handler
  polygon.addEventListener('click', () => {
    selectFace(faceIndex);
  });
  
  uvGroup.appendChild(polygon);
  
  // Add UV point markers
  addUVMarker(uv1.x, 1-uv1.y, 'A', uvGroup, isSelected);
  addUVMarker(uv2.x, 1-uv2.y, 'B', uvGroup, isSelected);
  addUVMarker(uv3.x, 1-uv3.y, 'C', uvGroup, isSelected);
}

// Add a marker for a UV point
function addUVMarker(x, y, label, parent, isSelected) {
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  marker.setAttribute('cx', x);
  marker.setAttribute('cy', y);
  marker.setAttribute('r', '0.01');
  marker.setAttribute('fill', isSelected ? '#ff0' : '#88f');
  parent.appendChild(marker);
  
  // Add label
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', x + 0.02);
  text.setAttribute('y', y + 0.02);
  text.setAttribute('font-size', '0.03');
  text.setAttribute('fill', isSelected ? '#ff0' : '#88f');
  text.textContent = label;
  parent.appendChild(text);
}

// Select a face for highlighting
function selectFace(faceIndex) {
  selectedFace = faceIndex;
  updateUVVisualization();
  updateDebugInfo();
  
  // Highlight the face in the 3D view
  if (cube && cube.geometry && cube.geometry.faces) {
    // Restore all face materials
    cube.updateFaceMaterials();
    
    // Set highlight material for selected face
    if (faceIndex !== null) {
      const highlightMaterial = Material.basic('#ffff00', 0.7);
      highlightMaterial.setWireframe(true);
      const originalMaterial = cube.material;
      
      // Create a new material that combines original texture with wireframe
      const faces = cube.geometry.faces;
      
      // Apply highlight
      if (document.getElementById('highlight-face').classList.contains('active')) {
        faces[faceIndex].material = highlightMaterial;
      }
    }
    
    // Render the scene
    renderer.render(scene, camera);
  }
}

// Update the debug information panel
function updateDebugInfo() {
  const debugInfo = document.getElementById('face-info');
  
  if (selectedFace === null) {
    debugInfo.textContent = 'Select a face to see UV info';
    return;
  }
  
  const face = cube.geometry.faces[selectedFace];
  const vertices = cube.geometry.vertices;
  const uvs = face.uv;
  
  // Create debug info text
  let info = `Face: ${selectedFace}\n`;
  
  // Add vertex positions
  info += `\nVertices:\n`;
  info += `A: ${vertices[face.a].x.toFixed(2)}, ${vertices[face.a].y.toFixed(2)}, ${vertices[face.a].z.toFixed(2)}\n`;
  info += `B: ${vertices[face.b].x.toFixed(2)}, ${vertices[face.b].y.toFixed(2)}, ${vertices[face.b].z.toFixed(2)}\n`;
  info += `C: ${vertices[face.c].x.toFixed(2)}, ${vertices[face.c].y.toFixed(2)}, ${vertices[face.c].z.toFixed(2)}\n`;
  
  // Add UV coordinates
  info += `\nUV Coordinates:\n`;
  if (uvs && uvs.length >= 3) {
    info += `A: ${uvs[0].x.toFixed(3)}, ${uvs[0].y.toFixed(3)}\n`;
    info += `B: ${uvs[1].x.toFixed(3)}, ${uvs[1].y.toFixed(3)}\n`;
    info += `C: ${uvs[2].x.toFixed(3)}, ${uvs[2].y.toFixed(3)}\n`;
  } else {
    info += `No UV coordinates found.`;
  }
  
  // Add normal
  info += `\nNormal: ${face.normal.x.toFixed(2)}, ${face.normal.y.toFixed(2)}, ${face.normal.z.toFixed(2)}`;
  
  debugInfo.textContent = info;
}

// Set up event listeners for controls
function initEventListeners() {
  // Texture selection
  document.getElementById('texture-select').addEventListener('change', (e) => {
    textureSettings.url = e.target.value;
    updateTexture();
  });
  
  // Repeat X control
  document.getElementById('repeat-x').addEventListener('input', (e) => {
    textureSettings.repeatX = parseFloat(e.target.value);
    document.getElementById('repeat-x-value').textContent = textureSettings.repeatX.toFixed(1);
    updateTexture();
  });
  
  // Repeat Y control
  document.getElementById('repeat-y').addEventListener('input', (e) => {
    textureSettings.repeatY = parseFloat(e.target.value);
    document.getElementById('repeat-y-value').textContent = textureSettings.repeatY.toFixed(1);
    updateTexture();
  });
  
  // Offset X control
  document.getElementById('offset-x').addEventListener('input', (e) => {
    textureSettings.offsetX = parseFloat(e.target.value);
    document.getElementById('offset-x-value').textContent = textureSettings.offsetX.toFixed(1);
    updateTexture();
  });
  
  // Offset Y control
  document.getElementById('offset-y').addEventListener('input', (e) => {
    textureSettings.offsetY = parseFloat(e.target.value);
    document.getElementById('offset-y-value').textContent = textureSettings.offsetY.toFixed(1);
    updateTexture();
  });
  
  // Rotation control
  document.getElementById('rotation').addEventListener('input', (e) => {
    textureSettings.rotation = parseInt(e.target.value);
    document.getElementById('rotation-value').textContent = `${textureSettings.rotation}°`;
    updateTexture();
  });
  
  // Flip Y control
  document.getElementById('flip-y').addEventListener('change', (e) => {
    textureSettings.flipY = e.target.checked;
    updateTexture();
  });
  
  // Debug controls
  document.getElementById('show-uvs').addEventListener('click', () => {
    showAllUVs = !showAllUVs;
    document.getElementById('show-uvs').classList.toggle('active', showAllUVs);
    updateUVVisualization();
  });
  
  document.getElementById('highlight-face').addEventListener('click', () => {
    const button = document.getElementById('highlight-face');
    button.classList.toggle('active');
    if (selectedFace !== null) {
      selectFace(selectedFace);
    }
  });
  
  document.getElementById('toggle-wireframe').addEventListener('click', () => {
    const button = document.getElementById('toggle-wireframe');
    button.classList.toggle('active');
    renderer.toggleWireframe();
    renderer.render(scene, camera);
  });
  
  // Window resize handler
  window.addEventListener('resize', onWindowResize);
}

// Update the texture with current settings
function updateTexture(texture) {
  if (!cube || !cube.material) return;
  
  // Update the texture image in the UV panel
  updateTextureDisplay();
  
  // Update the texture on the cube
  if (cube.material.map) {
    cube.material.map.setRepeat(textureSettings.repeatX, textureSettings.repeatY);
    cube.material.map.setOffset(textureSettings.offsetX, textureSettings.offsetY);
    cube.material.map.setRotation(textureSettings.rotation * Math.PI / 180);
    cube.material.map.setFlipY(textureSettings.flipY);
  } else if (texture) {
    // Set texture properties
    texture.setRepeat(textureSettings.repeatX, textureSettings.repeatY);
    texture.setOffset(textureSettings.offsetX, textureSettings.offsetY);
    texture.setRotation(textureSettings.rotation * Math.PI / 180);
    texture.setFlipY(textureSettings.flipY);
    cube.material.setMap(texture);
  } else {
    // Create a new texture if one doesn't exist
    const newTexture = Texture.fromURL(textureSettings.url, (tex) => {
      tex.setRepeat(textureSettings.repeatX, textureSettings.repeatY);
      tex.setOffset(textureSettings.offsetX, textureSettings.offsetY);
      tex.setRotation(textureSettings.rotation * Math.PI / 180);
      tex.setFlipY(textureSettings.flipY);
      cube.material.setMap(tex);
      renderer.render(scene, camera);
    });
  }
  
  // Update the UV visualization and render
  updateUVVisualization();
  renderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
  const view3dContent = document.getElementById('view3d-content');
  
  // Update camera aspect ratio
  camera.setAspect(view3dContent.clientWidth / view3dContent.clientHeight);
  camera.updateProjectionMatrix();
  
  // Update renderer size
  renderer.setSize(view3dContent.clientWidth, view3dContent.clientHeight);
  
  // Re-render the scene
  renderer.render(scene, camera);
  updateUVVisualization();
}

// Update statistics
function updateStats() {
  if (scene) {
    // Count faces
    let faceCount = 0;
    scene.traverse((object) => {
      if (object.geometry && object.geometry.faces) {
        faceCount += object.geometry.faces.length;
      }
    });
    stats.faces = faceCount;
    document.getElementById('face-counter').textContent = stats.faces;
  }
}

// Animation loop
function animate(time) {
  requestAnimationFrame(animate);
  
  // Calculate FPS
  frameCount++;
  if (time - lastFpsUpdate > fpsUpdateInterval) {
    stats.fps = Math.round((frameCount * 1000) / (time - lastFpsUpdate));
    document.getElementById('fps-counter').textContent = stats.fps;
    lastFpsUpdate = time;
    frameCount = 0;
    
    // Debug render on FPS update to ensure we're trying to render
    if (!window.renderedOnce) {
      console.log("Trying to render scene in animation loop");
      console.log("Camera position:", camera.position);
      console.log("Cube position:", cube ? cube.position : "no cube");
      window.renderedOnce = true;
    }
  }
  
  // Always render the scene to ensure visibility
  renderer.render(scene, camera);
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 