import { Matrix4 } from '../math/Matrix4';
import { Vector3 } from '../math/Vector3';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera';
import { Mesh } from '../objects/Mesh'; // Renamed from Cube
// Face should be implicitly available if Geometry.js holds it, or import explicitly if needed
// import { Face } from '../geometries/Geometry'; 
import { Scene } from './Scene'; // Need Scene for instanceof check maybe?

// ---- SVGRenderer (Extracted from Prototype) ----
export class Renderer { // Renamed from SVGRenderer to match file name
  constructor(options = {}) {
    this.width = options.width || 800;
    this.height = options.height || 600;
    this.container = options.container || document.body; // Default to body if no container
    
    this.svg = null;
    this.sceneGroup = null;
    this.camera = null; // Store camera used in last render
    
    this.initialize();
  }
  
  initialize() {
    if (!this.container) {
        console.error("SVGRenderer: Container element not found or provided.");
        return;
    }
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', this.width);
    this.svg.setAttribute('height', this.height);
    this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    this.svg.style.backgroundColor = '#111'; // Default from prototype
    
    this.sceneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.svg.appendChild(this.sceneGroup);
    
    this.container.appendChild(this.svg);
  }
  
  setSize(width, height) {
    this.width = width;
    this.height = height;
    
    if (this.svg) {
        this.svg.setAttribute('width', width);
        this.svg.setAttribute('height', height);
        this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    
    // Update camera's viewport AND aspect/projection matrix if camera exists
    if (this.camera) {
        // Update viewport settings to match renderer dimensions
        this.camera.setViewport(0, width, 0, height); // Top=0, Bottom=height for SVG
        
        // Update perspective camera aspect ratio
        if (this.camera.type === 'PerspectiveCamera') {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        } else if (this.camera.type === 'OrthographicCamera') {
            // Orthographic camera might need frustum update based on new viewport/aspect
            // Re-calculate left/right/top/bottom based on new size, maintaining some scale?
            // Or simply call setSize if that method exists and is appropriate
            // Let's try updating frustum to match new size directly (simplest approach)
            // this.camera.setSize(width, height); // Assuming OrthoCamera has this method
            // Re-applying the logic from index.html onResize but for the camera directly:
            const aspect = width / height;
            // Maintain vertical size based on previous top/bottom or a default zoom?
            // Using a fixed height for simplicity, assuming zoom=1
            const camOriginalHeight = 2; // Default initial ortho height? Needs check
            const camHeight = this.camera.zoom * (this.camera.top - this.camera.bottom); // Use base camera zoom
            const camWidth = camHeight * aspect;
            this.camera.left = -camWidth / 2;
            this.camera.right = camWidth / 2;
            this.camera.top = camHeight / 2; 
            this.camera.bottom = -camHeight / 2;
            this.camera.updateProjectionMatrix();
        }
    }
    
    return this;
  }
  
  // Render method from prototype
  render(scene, camera) {
    this.camera = camera; // Store current camera
    
    // Clear previous rendering
    while (this.sceneGroup.firstChild) {
      this.sceneGroup.removeChild(this.sceneGroup.firstChild);
    }
    
    // Update scene graph matrices recursively (important!)
    scene.updateWorldMatrix(true); // Force update from the root

    // Camera matrices (view, projection, vp) should be up-to-date 
    // via controller updates or initial setup.
    // No need to call camera.updateViewProjectionMatrix() here again.
    
    // Process the scene graph starting from the scene object
    this.processObject(scene, camera);
  }
  
  // Process object recursively (from prototype)
  processObject(object, camera) {
    if (!object.visible) return;
    
    // Note: World matrices should already be updated by scene.updateWorldMatrix()
    // object.updateMatrix(); // Only needed if local matrix changed since last update
    // object.updateWorldMatrix(); // Already done recursively from scene root
    
    // If it's a Mesh (originally Cube in prototype), render it
    if (object instanceof Mesh) {
      this.renderMesh(object, camera); // Renamed from renderCube
    }
    
    // Process children
    const children = object.children;
    for (let i = 0, l = children.length; i < l; i++) {
        this.processObject(children[i], camera);
    }
  }
  
  // Project vertex using the Camera's projectVertex method
  projectVertex(vertex, objectWorldMatrix, camera) {
    // 1. Transform vertex from Object Space to World Space
    // Use applyMatrix4AsPoint for correct M * v point transformation
    const worldVertex = vertex.clone().applyMatrix4AsPoint(objectWorldMatrix);
    
    // 2. Project World Space vertex using the Camera's projection logic
    // The camera's projectVertex method handles ViewProjection transform, clipping, 
    // perspective division (if applicable), and NDC to screen conversion.
    const screenPoint = camera.projectVertex(worldVertex); // Pass only worldVertex
    
    // screenPoint should contain { x, y, z (depth), visible }
    // Return this structure, adding worldPos if needed elsewhere (though less common now)
    return {
        x: screenPoint.x,
        y: screenPoint.y,
        z: screenPoint.z, // Use depth calculated by camera projection
        visible: screenPoint.visible, // Use visibility calculated by camera projection
        // worldPos: worldVertex // Can remove if not used later
    };
  }
  
  // Render Mesh (adapted from prototype renderCube)
  renderMesh(mesh, camera) {
    // Project all vertices of the mesh
    const projectedVertices = [];
    for (let i = 0; i < mesh.vertices.length; i++) {
      // Pass mesh world matrix and camera
      projectedVertices.push(this.projectVertex(mesh.vertices[i], mesh.worldMatrix, camera));
    }
    
    // Process faces for rendering
    const renderableFaces = [];
    for (let i = 0; i < mesh.faces.length; i++) {
      const face = mesh.faces[i];
      const va = projectedVertices[face.a];
      const vb = projectedVertices[face.b];
      const vc = projectedVertices[face.c];
      
      // Check if any vertex is invisible (clipped by camera frustum)
      if (!va || !vb || !vc || !va.visible || !vb.visible || !vc.visible) {
          continue; // Skip this face if any vertex is clipped or missing
      }
      
      // Basic Backface Culling (using cross product in screen space)
      // Calculate edge vectors in screen space
      const edge1x = vb.x - va.x;
      const edge1y = vb.y - va.y;
      const edge2x = vc.x - va.x;
      const edge2y = vc.y - va.y;
      // 2D cross product z-component: edge1x * edge2y - edge1y * edge2x
      const crossZ = edge1x * edge2y - edge1y * edge2x;

      // If crossZ > 0, face winding order is CCW in screen space (visible)
      if (crossZ > 0) { 
        // Get material (prototype assigns per-face)
        const material = face.material || mesh.materials[0] || new Material(); // Fallback
        
        // Calculate depth using view Z stored during projection
        const depth = (va.z + vb.z + vc.z) / 3;
        
        renderableFaces.push({
          points: [va, vb, vc],
          depth: depth,
          material: material
        });
      }
    }
    
    // Sort faces by depth (furthest first) - Painter's algorithm
    renderableFaces.sort((a, b) => b.depth - a.depth);
    
    // Render faces back-to-front
    renderableFaces.forEach(faceData => {
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const pointsAttr = faceData.points.map(p => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(' '); // Use toFixed for cleaner SVG output
      polygon.setAttribute('points', pointsAttr);
      
      // Apply material properties
      const mat = faceData.material;
      polygon.setAttribute('fill', mat.color);
      polygon.setAttribute('fill-opacity', mat.opacity.toString());
      
      // Optional: Add stroke for wireframe effect or edges
      // if (mat.wireframe) { ... } else { ... }
      polygon.setAttribute('stroke', '#000'); // Default edge stroke from prototype
      polygon.setAttribute('stroke-width', '1'); 
      
      this.sceneGroup.appendChild(polygon);
    });
  }
} 