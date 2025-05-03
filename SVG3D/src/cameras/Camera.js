import { Object3D } from '../core/Object3D';
import { Matrix4 } from '../math/Matrix4';

/**
 * Base Camera class that defines common properties and methods for all cameras.
 * Extends Object3D to leverage the transformation hierarchy.
 */
export class Camera extends Object3D {
  constructor(name = 'Camera') {
    super(name);
    
    this.name = name;
    this.type = 'Camera';
    
    // Camera properties
    this.near = 0.1;      // Near clipping plane
    this.far = 2000;      // Far clipping plane
    this.zoom = 1.0;      // Zoom factor
    
    // Camera viewport
    this.viewport = {
      left: -400,
      right: 400,
      top: -300,
      bottom: 300
    };
    
    // View and Projection Matrices
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.viewProjectionMatrix = new Matrix4();
  }
  
  /**
   * Set the near and far clipping planes
   * @param {number} near - Near clipping plane distance
   * @param {number} far - Far clipping plane distance
   * @returns {Camera} - This camera (for chaining)
   */
  setClippingPlanes(near, far) {
    this.near = near;
    this.far = far;
    // Recompute projection matrix when clipping planes change
    this.updateProjectionMatrix();
    return this;
  }
  
  /**
   * Set the camera zoom factor
   * @param {number} zoom - Zoom factor (1.0 = no zoom)
   * @returns {Camera} - This camera (for chaining)
   */
  setZoom(zoom) {
    this.zoom = Math.max(0.1, zoom); // Prevent negative or zero zoom
    return this;
  }
  
  /**
   * Set the camera viewport dimensions
   * @param {number} left - Left boundary
   * @param {number} right - Right boundary
   * @param {number} top - Top boundary
   * @param {number} bottom - Bottom boundary
   * @returns {Camera} - This camera (for chaining)
   */
  setViewport(left, right, top, bottom) {
    this.viewport.left = left;
    this.viewport.right = right;
    this.viewport.top = top;
    this.viewport.bottom = bottom;
    return this;
  }
  
  /**
   * Abstract method to update the projection matrix.
   * Should be implemented by subclasses (Perspective, Orthographic).
   */
  updateProjectionMatrix() {
    throw new Error('updateProjectionMatrix() must be implemented by subclasses');
  }
  
  /**
   * Updates the view-projection matrix by combining the view and projection matrices.
   * This should be called after either the view matrix or projection matrix is updated.
   * @returns {Camera} This camera instance for chaining.
   */
  updateViewProjectionMatrix() {
    this.viewProjectionMatrix.multiplyMatrices(this.projectionMatrix, this.viewMatrix);
    return this;
  }
  
  /**
   * Project a 3D point to 2D coordinates
   * This is an abstract method that should be implemented by subclasses
   * @param {Object} vertex - The 3D vertex to project {x, y, z}
   * @param {Matrix4} worldMatrix - World matrix to transform the vertex
   * @returns {Object} - The projected 2D point {x, y} and depth z
   */
  projectVertex(vertex, worldMatrix) {
    throw new Error('projectVertex() must be implemented by subclasses');
  }

  // Method to update world matrix (inverse of view matrix)
  // Usually called after view matrix is set (e.g., by controls)
  updateWorldMatrix(force) {
    // Update the camera's local matrix first if needed (position/rotation)
    super.updateMatrix(); 
    // Camera's world is the inverse of the view
    this.worldMatrix.copy(this.viewMatrix).invert();

    // Update children (if any are attached to the camera)
    const children = this.children;
    for ( let i = 0, l = children.length; i < l; i ++ ) {
        children[ i ].updateWorldMatrix( force );
    }
  }
} 