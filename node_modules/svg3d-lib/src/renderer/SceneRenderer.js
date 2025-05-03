import { ModelNode } from '../scene/ModelNode';
import { adjustColorBrightness } from '../math/utils';

/**
 * SceneRenderer class to render a scene graph with multiple models
 * using the active camera's projection.
 */
export class SceneRenderer {
  constructor() {
    // Rendering settings
    this.settings = {
      maxVisibleFaces: 5000,    // Maximum number of faces to render
      wireframeColor: '#000000', // Default wireframe color
      depthSort: true,          // Whether to sort faces by depth
      cullBackfaces: true,      // Whether to cull backfaces
      renderMode: 'solid',      // 'solid', 'wireframe', or 'solid-wireframe'
      shadingMode: 'gradient',  // 'flat' or 'gradient'
      ambientLight: 0.2,        // Ambient light (0-1)
    };
    
    // Light direction (normalized vector)
    this.lightDirection = { x: 0, y: 0, z: -1 }; // Default: from camera
    
    // Keep track of rendering statistics
    this.stats = {
      visibleModels: 0,
      renderedFaces: 0,
      culledFaces: 0,
      frameTime: 0,
    };
  }
  
  /**
   * Set the renderer settings
   * @param {Object} newSettings - Object containing settings to update
   * @returns {SceneRenderer} - This renderer (for chaining)
   */
  setSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this;
  }
  
  /**
   * Set the light direction
   * @param {string} direction - Direction: 'front', 'top', 'side', or vector {x,y,z}
   * @returns {SceneRenderer} - This renderer (for chaining)
   */
  setLightDirection(direction) {
    if (typeof direction === 'string') {
      switch (direction.toLowerCase()) {
        case 'front':
          this.lightDirection = { x: 0, y: 0, z: -1 };
          break;
        case 'top':
          this.lightDirection = { x: 0, y: -1, z: 0 };
          break;
        case 'side':
          this.lightDirection = { x: -1, y: 0, z: 0 };
          break;
        default:
          console.warn(`Unknown light direction: ${direction}, using 'front'`);
          this.lightDirection = { x: 0, y: 0, z: -1 };
      }
    } else if (typeof direction === 'object' && 'x' in direction && 'y' in direction && 'z' in direction) {
      // Normalize the vector
      const length = Math.sqrt(
        direction.x * direction.x + 
        direction.y * direction.y + 
        direction.z * direction.z
      );
      
      if (length > 0) {
        this.lightDirection = {
          x: direction.x / length,
          y: direction.y / length,
          z: direction.z / length
        };
      }
    }
    
    return this;
  }
  
  /**
   * Render the scene using the provided camera
   * @param {Scene} scene - The scene to render
   * @param {Camera} camera - The camera to use for projection
   * @returns {Array} - Array of SVG polygon elements
   */
  renderScene(scene, camera) {
    const startTime = performance.now();
    
    // Reset stats
    this.stats.visibleModels = 0;
    this.stats.renderedFaces = 0;
    this.stats.culledFaces = 0;
    
    // Final array of polygon data to render
    const polygons = [];
    
    // Debug: Log scene object
    console.log('Rendering scene:', scene);
    
    // 1. Collect all visible models
    const visibleModels = [];
    scene.traverse(node => {
      if (node instanceof ModelNode && node.visible) {
        visibleModels.push(node);
        this.stats.visibleModels++;
        console.debug(`Found visible model: ${node.name}, vertices: ${node.vertices?.length || 0}, faces: ${node.faces?.length || 0}`);
      }
    });
    
    console.log(`Found ${visibleModels.length} visible models to render`);
    
    // 2. Process each model
    for (const model of visibleModels) {
      // Skip models with no geometry
      if (!model.vertices || !model.faces || model.vertices.length === 0 || model.faces.length === 0) {
        console.warn(`Model ${model.name} has no geometry, skipping`);
        continue;
      }
      
      // Get the model's world transform
      const transform = model.getWorldTransform();
      console.debug(`Model ${model.name} transform:`, transform);
      
      // 3. Project all vertices for this model
      const projectedVertices = model.vertices.map(vertex => 
        camera.projectVertex(vertex, transform)
      );
      
      // Debug: Check if vertices are projected correctly
      const visibleVertices = projectedVertices.filter(v => v.visible).length;
      console.debug(`Model ${model.name}: ${visibleVertices}/${projectedVertices.length} vertices visible after projection`);
      
      // 4. Process each face
      let visibleFaces = 0;
      for (const face of model.faces) {
        // Skip faces with invalid indices
        if (!face || face.length < 3) {
          console.warn(`Invalid face in model ${model.name}, skipping`);
          continue;
        }
        
        // Get the projected vertices for this face
        const faceVertices = face.map(index => projectedVertices[index]);
        
        // Skip if any vertex is not visible
        if (faceVertices.some(v => !v.visible)) {
          this.stats.culledFaces++;
          continue;
        }
        
        // Calculate face normal (simplified)
        const normal = this.calculateFaceNormal(
          model.vertices[face[0]],
          model.vertices[face[1]],
          model.vertices[face[2]]
        );
        
        // Backface culling
        if (this.settings.cullBackfaces) {
          // Simple backface test: dot product with view direction
          // In our coordinate system, -Z is toward the camera
          const viewDirection = { x: 0, y: 0, z: -1 }; 
          
          // If the dot product is positive, the face is facing away from the camera
          // (normal and view direction are pointing in opposite hemispheres)
          const dot = normal.x * viewDirection.x + normal.y * viewDirection.y + normal.z * viewDirection.z;
          
          if (dot > 0) { // Changed from < 0 to > 0 to match our coordinate system
            this.stats.culledFaces++;
            continue;
          }
        }
        
        // Calculate face center and depth
        let centerX = 0, centerY = 0, centerZ = 0;
        for (const vertex of faceVertices) {
          centerX += vertex.x;
          centerY += vertex.y;
          centerZ += vertex.z;
        }
        const vertexCount = faceVertices.length;
        centerX /= vertexCount;
        centerY /= vertexCount;
        centerZ /= vertexCount;
        
        // Create polygon data
        const polygon = {
          points: faceVertices.map(v => `${v.x},${v.y}`).join(' '),
          model: model,
          depth: centerZ,
          normal: normal,
          center: { x: centerX, y: centerY, z: centerZ },
          color: model.color,
        };
        
        polygons.push(polygon);
        this.stats.renderedFaces++;
        visibleFaces++;
      }
      
      console.debug(`Model ${model.name}: ${visibleFaces}/${model.faces.length} faces visible after culling`);
    }
    
    console.log(`Generated ${polygons.length} polygons for rendering`);
    
    // 5. Sort polygons by depth (if enabled)
    if (this.settings.depthSort) {
      polygons.sort((a, b) => b.depth - a.depth); // Back-to-front
    }
    
    // 6. Limit the number of polygons
    const maxFaces = this.settings.maxVisibleFaces;
    const renderedPolygons = polygons.slice(0, maxFaces);
    
    // 7. Generate final SVG polygons
    const svgPolygons = renderedPolygons.map(polygon => {
      const renderMode = polygon.model.wireframe ? 'wireframe' : this.settings.renderMode;
      const fill = this.calculateFaceColor(polygon);
      
      return {
        points: polygon.points,
        fill: renderMode === 'wireframe' ? 'none' : fill,
        stroke: (renderMode === 'wireframe' || renderMode === 'solid-wireframe') ? 
                this.settings.wireframeColor : 'none',
        strokeWidth: renderMode === 'wireframe' ? 1 : 0.5,
        opacity: polygon.model.transparent ? polygon.model.opacity : 1.0,
        model: polygon.model.id, // Store model ID for interactivity
      };
    });
    
    console.log(`Final SVG polygons for rendering: ${svgPolygons.length}`);
    
    // Update stats
    this.stats.frameTime = performance.now() - startTime;
    
    return svgPolygons;
  }
  
  /**
   * Calculate the face normal
   * @private
   * @param {Object} v0 - First vertex {x,y,z}
   * @param {Object} v1 - Second vertex {x,y,z}
   * @param {Object} v2 - Third vertex {x,y,z}
   * @returns {Object} - Normal vector {x,y,z}
   */
  calculateFaceNormal(v0, v1, v2) {
    // Create vectors from vertices
    const ax = v1.x - v0.x;
    const ay = v1.y - v0.y;
    const az = v1.z - v0.z;
    
    const bx = v2.x - v0.x;
    const by = v2.y - v0.y;
    const bz = v2.z - v0.z;
    
    // Cross product
    const nx = ay * bz - az * by;
    const ny = az * bx - ax * bz;
    const nz = ax * by - ay * bx;
    
    // Normalize
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (length === 0) return { x: 0, y: 0, z: 1 }; // Default if degenerate
    
    return {
      x: nx / length,
      y: ny / length,
      z: nz / length
    };
  }
  
  /**
   * Calculate the face color based on lighting
   * @private
   * @param {Object} polygon - Polygon data
   * @returns {string} - Color as hex string
   */
  calculateFaceColor(polygon) {
    const { normal, depth, color } = polygon;
    const { shadingMode, ambientLight } = this.settings;
    
    // Start with the model's base color
    let finalColor = color;
    
    if (shadingMode === 'flat') {
      // Simple diffuse lighting based on normal and light direction
      // For diffuse lighting, we want surfaces facing the light (opposite direction) to be brighter
      // In our coordinate system where -Z is toward the camera, a light at -Z would have direction (0,0,1)
      const lightDotProduct = -(
        normal.x * this.lightDirection.x + 
        normal.y * this.lightDirection.y + 
        normal.z * this.lightDirection.z
      );
      
      // Calculate lighting intensity (brightest when normal is facing the light)
      const lightIntensity = Math.max(ambientLight, lightDotProduct);
      
      finalColor = adjustColorBrightness(color, lightIntensity);
    } else if (shadingMode === 'gradient') {
      // Depth-based shading
      // Map depth to a brightness factor
      const minDepth = this.near || 0.1;
      const maxDepth = this.far || 1000;
      const minBrightness = 0.5;
      const maxBrightness = 1.5;
      
      // Normalize depth between min and max
      const t = Math.max(0, Math.min(1, (depth - minDepth) / (maxDepth - minDepth)));
      const brightness = minBrightness + t * (maxBrightness - minBrightness);
      
      finalColor = adjustColorBrightness(color, brightness);
    }
    
    return finalColor;
  }
  
  /**
   * Get the rendering statistics from the last render
   * @returns {Object} - Object containing rendering statistics
   */
  getStats() {
    return { ...this.stats };
  }
} 