import { Camera } from './Camera';
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';
import { degToRad } from '../math/utils';

/**
 * OrthographicCamera class that implements orthographic (parallel) projection.
 * Extends the base Camera with orthographic-specific properties and methods.
 */
export class OrthographicCamera extends Camera {
  /**
   * Creates an OrthographicCamera.
   * @param {number} [left=-1] - Left plane.
   * @param {number} [right=1] - Right plane.
   * @param {number} [top=1] - Top plane.
   * @param {number} [bottom=-1] - Bottom plane.
   * @param {number} [near=0.1] - Near plane.
   * @param {number} [far=2000] - Far plane.
   */
  constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2000) {
    super();
    this.type = 'OrthographicCamera';

    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;

    this.updateProjectionMatrix();
  }
  
  /**
   * Updates the orthographic projection matrix based on current properties.
   */
  updateProjectionMatrix() {
    this.projectionMatrix.makeOrthographic(this.left, this.right, this.top, this.bottom, this.near, this.far);
    this.updateViewProjectionMatrix(); // Update combined matrix
  }
  
  /**
   * Sets the orthographic frustum planes.
   */
  setFrustum(left, right, top, bottom, near, far) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
    return this;
  }
  
  /**
   * Set the orthographic view size
   * @param {number} width - Width of the view
   * @param {number} height - Height of the view
   * @returns {OrthographicCamera} - This camera (for chaining)
   */
  setSize(width, height) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    this.left = -halfWidth;
    this.right = halfWidth;
    this.top = -halfHeight;
    this.bottom = halfHeight;
    this.updateProjectionMatrix();
    return this;
  }

  /**
   * Project a 3D vertex to 2D coordinates using orthographic projection
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
      // Assuming worldMatrix is affine (no perspective)
      const objVector = new Vector3(vertex.x, vertex.y, vertex.z);
      const worldHomogeneous = worldMatrix.applyToVector3(objVector);
      worldVertex = new Vector3(worldHomogeneous.x, worldHomogeneous.y, worldHomogeneous.z);
    } else if (worldMatrix && worldMatrix.worldPosition) {
      // Handle simple offset case
      worldVertex = new Vector3(
        worldMatrix.worldPosition.x + vertex.x, 
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
    // 3. ORTHOGRAPHIC PROJECTION (Clip Space -> NDC)
    // ----------------------
    // For orthographic projection, w should be 1 (or -1 depending on matrix conventions).
    // No perspective division needed. Clip space coordinates map directly to NDC.
    const ndcX = clipSpace.x; // Assuming w=1
    const ndcY = clipSpace.y;
    const ndcZ = clipSpace.z;
    
    // Depth calculation (using NDC Z)
    const depth = -ndcZ;

    // ----------------------
    // 4. CLIPPING (In NDC Space)
    // ----------------------
    // Check frustum (clipping in NDC space: -1 to 1)
    if (ndcX < -1 || ndcX > 1 || ndcY < -1 || ndcY > 1 || ndcZ < -1 || ndcZ > 1) {
        return { x: 0, y: 0, z: depth, visible: false };
    }
    
    // ----------------------
    // 5. NDC TO SVG/SCREEN SPACE
    // ----------------------
    // Map from NDC [-1, 1] to viewport [0, width] and [0, height]
    const viewportWidth = this.viewport.right - this.viewport.left;
    const viewportHeight = this.viewport.bottom - this.viewport.top;
    
    // Note: SVG Y increases downward, so we flip the Y coordinate
    const screenX = (ndcX + 1) * 0.5 * viewportWidth + this.viewport.left;
    const screenY = (-ndcY + 1) * 0.5 * viewportHeight + this.viewport.top; // Flip Y & map
        
    return {
      x: screenX,
      y: screenY,
      z: depth, // Store Z for depth sorting in SVG layers
      visible: true
    };
  }
}