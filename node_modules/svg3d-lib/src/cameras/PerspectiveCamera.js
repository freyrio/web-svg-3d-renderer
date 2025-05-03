import { Camera } from './Camera';
import { Matrix4 } from '../math/Matrix4';
// Note: Prototype doesn't use Vector3 here, but it's good practice
import { Vector3 } from '../math/Vector3'; 
import { degToRad } from '../math/utils';

/**
 * PerspectiveCamera class that implements perspective projection.
 * Extends the base Camera with perspective-specific properties and methods.
 */
export class PerspectiveCamera extends Camera {
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();
    this.fov = fov;         // Field of view in degrees
    this.aspect = aspect;   // Aspect ratio (width / height)
    this.near = near;       // Near clipping plane
    this.far = far;         // Far clipping plane
    this.type = 'PerspectiveCamera';

    this.updateProjectionMatrix(); // Initial update
  }
  
  /**
   * Set the camera's field of view
   * @param {number} fov - Field of view in degrees
   * @returns {PerspectiveCamera} - This camera (for chaining)
   */
  setFov(fov) {
    this.fov = fov;
    this.updateProjectionMatrix();
    return this;
  }
  
  /**
   * Set the camera's aspect ratio
   * @param {number} aspect - Aspect ratio (width/height)
   * @returns {PerspectiveCamera} - This camera (for chaining)
   */
  setAspect(aspect) {
    this.aspect = aspect;
    this.updateProjectionMatrix();
    return this;
  }
  
  /**
   * Set the camera's near clipping plane
   * @param {number} near - Near clipping plane
   * @returns {PerspectiveCamera} - This camera (for chaining)
   */
  setNear(near) {
    this.near = near;
    this.updateProjectionMatrix();
    return this;
  }
  
  /**
   * Set the camera's far clipping plane
   * @param {number} far - Far clipping plane
   * @returns {PerspectiveCamera} - This camera (for chaining)
   */
  setFar(far) {
    this.far = far;
    this.updateProjectionMatrix();
    return this;
  }
  
  /**
   * Calculate the distance to the specified Z value, useful for determining clipping
   * @param {number} z - Z position
   * @returns {number} - Distance to the point
   */
  distanceToZ(z) {
    return this.position.z - z;
  }
  
  /**
   * Updates the perspective projection matrix based on current properties.
   */
  updateProjectionMatrix() {
    // Prototype uses degrees for fov in constructor, converts here
    const fovRad = this.fov * (Math.PI / 180);
    
    // Call the prototype's makePerspective (assumes row-major)
    this.projectionMatrix.makePerspective(fovRad, this.aspect, this.near, this.far);
    
    // Update the combined view-projection matrix whenever projection changes
    this.updateViewProjectionMatrix();
    
    return this;
  }
  
  /**
   * Project a 3D vertex to 2D coordinates using perspective projection
   * Relies on the pre-calculated viewProjectionMatrix.
   * @param {Vector3} vertex - The 3D vertex
   * @param {Matrix4} worldMatrix - World matrix to transform the vertex
   * @returns {Object} - Projected 2D point {x, y, z} where z is the depth
   */
  projectVertex(vertex, worldMatrix = null) {
    // ----------------------
    // 1. OBJECT SPACE TO WORLD SPACE
    // ----------------------
    let worldVertex;
    if (worldMatrix && worldMatrix.elements) {
      // Transform object vertex to world space
      // Note: Using applyToVector3 here might return homogeneous coords
      // but for world transform, w should remain 1 if worldMatrix is affine.
      // We only need the x, y, z for the next step.
      // A dedicated method like matrix.transformAffinePoint(vec) might be safer.
      // For now, assuming worldMatrix doesn't introduce perspective, we can create a new Vector3.
      const objVector = new Vector3(vertex.x, vertex.y, vertex.z);
      const worldHomogeneous = worldMatrix.applyToVector3(objVector);
      // Assuming w=1 after world transform
      worldVertex = new Vector3(worldHomogeneous.x, worldHomogeneous.y, worldHomogeneous.z); 
    } else if (worldMatrix && worldMatrix.worldPosition) {
      // Handle cases where only world position is needed (e.g., for simple points)
      // This branch seems less common for standard mesh vertices.
      worldVertex = new Vector3(
        worldMatrix.worldPosition.x + vertex.x, // Assuming vertex is offset from worldPos
        worldMatrix.worldPosition.y + vertex.y, 
        worldMatrix.worldPosition.z + vertex.z
      );
    } else {
      // Vertex is already in world space
      worldVertex = new Vector3(vertex.x, vertex.y, vertex.z);
    }
        
    // ----------------------
    // 2. WORLD SPACE TO CLIP SPACE (Homogeneous Coordinates)
    // ----------------------
    // Apply combined view-projection matrix
    const clipSpace = this.viewProjectionMatrix.applyToVector3(worldVertex);
    
    // ----------------------
    // 3. PERSPECTIVE DIVISION (Clip Space -> NDC)
    // ----------------------
    // Check for division by zero or near-zero W
    if (Math.abs(clipSpace.w) < 1e-6) {
        // Point is at or very close to the camera's viewpoint, handle appropriately
        // Returning invisible is a common strategy
        return { x: 0, y: 0, z: 0, visible: false }; 
    }
    
    const invW = 1.0 / clipSpace.w; // Calculate inverse W
    const ndcX = clipSpace.x * invW;
    const ndcY = clipSpace.y * invW;
    const ndcZ = clipSpace.z * invW;

    // Depth can be calculated from various points (clip Z, NDC Z, world Z)
    // Using NDC Z is common for depth buffering. Negative because NDC Z maps far to -1, near to +1.
    const depth = -ndcZ; 

    // ----------------------
    // 4. CLIPPING (In NDC Space)
    // ----------------------
    // Check if the point is outside the normalized device coordinates cube [-1, 1]
    if (ndcX < -1 || ndcX > 1 || ndcY < -1 || ndcY > 1 || ndcZ < -1 || ndcZ > 1) {
        // Return invisible but include depth in case partial visibility/clipping is handled later
        return { x: 0, y: 0, z: depth, visible: false }; 
    }
    
    // ----------------------
    // 5. NDC TO SVG/SCREEN SPACE
    // ----------------------
    // Map from NDC [-1, 1] to viewport [0, width] and [0, height]
    const viewportWidth = this.viewport.right - this.viewport.left;
    const viewportHeight = this.viewport.bottom - this.viewport.top;
    
    // Note: SVG Y increases downward, so we flip the Y coordinate
    // Map X: [-1, 1] -> [0, 1] -> [0, viewportWidth]
    const screenX = (ndcX + 1) * 0.5 * viewportWidth + this.viewport.left;
    // Map Y: [-1, 1] -> [1, -1] -> [0, 1] -> [0, viewportHeight]
    const screenY = (-ndcY + 1) * 0.5 * viewportHeight + this.viewport.top; // Flip Y & map
        
    return {
      x: screenX,
      y: screenY,
      z: depth, // Store depth for sorting in SVG layers
      visible: true
    };
  }
} 