import { Vector3 } from '../math/Vector3';
import { Geometry } from './Geometry';

/**
 * A simple triangle geometry for testing basic rendering.
 */
export class TriangleGeometry extends Geometry {
  /**
   * Creates a single triangle geometry
   * @param {number} size - The size of the triangle
   */
  constructor(size = 1) {
    super();
    
    const halfSize = size / 2;
    
    // Add vertices for an equilateral triangle facing the camera
    this.addVertex(new Vector3(0, -halfSize, 0));        // Top
    this.addVertex(new Vector3(-halfSize, halfSize, 0)); // Bottom left
    this.addVertex(new Vector3(halfSize, halfSize, 0));  // Bottom right
    
    // Add a single face using the 3 vertices
    this.addFace([0, 1, 2]);
    
    // Compute normals
    this.computeFaceNormals();
    
    this.name = 'TriangleGeometry';
  }
} 