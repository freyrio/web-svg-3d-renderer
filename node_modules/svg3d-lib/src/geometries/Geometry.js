import { Vector3 } from '../math/Vector3';

/**
 * Base class for all geometries.
 * Manages vertices, faces, and normals.
 */
export class Geometry {
  constructor() {
    this.vertices = []; // Array of Vector3 objects
    this.faces = [];    // Array of arrays containing vertex indices, e.g. [[0,1,2], [1,2,3], ...]
    this.normals = [];  // Array of Vector3 objects, one per face
    this.name = '';
    
    // Bounding box info (updated when computing bounds)
    this.boundingBox = {
      min: new Vector3(Infinity, Infinity, Infinity),
      max: new Vector3(-Infinity, -Infinity, -Infinity),
      center: new Vector3(),
      size: new Vector3()
    };
  }
  
  /**
   * Adds a vertex to the geometry
   * @param {Vector3|Object} v - Vector3 or {x,y,z} object
   * @returns {number} Index of the added vertex
   */
  addVertex(v) {
    let vertex;
    
    if (v instanceof Vector3) {
      vertex = v.clone();
    } else {
      vertex = new Vector3(v.x, v.y, v.z);
    }
    
    this.vertices.push(vertex);
    return this.vertices.length - 1;
  }
  
  /**
   * Adds a face to the geometry (assumes vertices already exist)
   * @param {number[]} indices - Array of vertex indices (usually 3 for triangles)
   * @returns {number} Index of the added face
   */
  addFace(indices) {
    // Validate indices
    for (const index of indices) {
      if (index < 0 || index >= this.vertices.length) {
        console.error(`Geometry.addFace: Invalid vertex index ${index}`);
        return -1;
      }
    }
    
    this.faces.push([...indices]);
    return this.faces.length - 1;
  }
  
  /**
   * Computes normals for all faces in the geometry
   * @returns {Geometry} This geometry (for chaining)
   */
  computeFaceNormals() {
    this.normals = [];
    
    for (const face of this.faces) {
      if (face.length < 3) {
        this.normals.push(new Vector3(0, 0, 1)); // Default for degenerate faces
        continue;
      }
      
      const v0 = this.vertices[face[0]];
      const v1 = this.vertices[face[1]];
      const v2 = this.vertices[face[2]];
      
      // Calculate two edges of the triangle
      const edge1 = new Vector3(
        v1.x - v0.x,
        v1.y - v0.y,
        v1.z - v0.z
      );
      
      const edge2 = new Vector3(
        v2.x - v0.x,
        v2.y - v0.y,
        v2.z - v0.z
      );
      
      // Cross product of the edges gives the normal
      const normal = new Vector3();
      normal.x = edge1.y * edge2.z - edge1.z * edge2.y;
      normal.y = edge1.z * edge2.x - edge1.x * edge2.z;
      normal.z = edge1.x * edge2.y - edge1.y * edge2.x;
      normal.normalize();
      
      this.normals.push(normal);
    }
    
    return this;
  }
  
  /**
   * Computes the bounding box of the geometry
   * @returns {Geometry} This geometry (for chaining)
   */
  computeBoundingBox() {
    if (this.vertices.length === 0) {
      return this;
    }
    
    const min = this.boundingBox.min.set(Infinity, Infinity, Infinity);
    const max = this.boundingBox.max.set(-Infinity, -Infinity, -Infinity);
    
    for (const vertex of this.vertices) {
      // Update min values
      min.x = Math.min(min.x, vertex.x);
      min.y = Math.min(min.y, vertex.y);
      min.z = Math.min(min.z, vertex.z);
      
      // Update max values
      max.x = Math.max(max.x, vertex.x);
      max.y = Math.max(max.y, vertex.y);
      max.z = Math.max(max.z, vertex.z);
    }
    
    // Calculate center and size
    this.boundingBox.center.set(
      (min.x + max.x) / 2,
      (min.y + max.y) / 2,
      (min.z + max.z) / 2
    );
    
    this.boundingBox.size.set(
      max.x - min.x,
      max.y - min.y,
      max.z - min.z
    );
    
    return this;
  }
  
  /**
   * Centers the geometry at the origin based on its bounding box
   * @returns {Geometry} This geometry (for chaining)
   */
  center() {
    this.computeBoundingBox();
    const offset = new Vector3(
      -this.boundingBox.center.x,
      -this.boundingBox.center.y,
      -this.boundingBox.center.z
    );
    
    // Translate all vertices
    for (const vertex of this.vertices) {
      vertex.x += offset.x;
      vertex.y += offset.y;
      vertex.z += offset.z;
    }
    
    // Update bounding box
    this.computeBoundingBox();
    
    return this;
  }
  
  /**
   * Creates a clone of this geometry
   * @returns {Geometry} A new geometry with the same data
   */
  clone() {
    const geometry = new Geometry();
    
    // Clone vertices
    geometry.vertices = this.vertices.map(v => v.clone());
    
    // Clone faces (arrays of indices)
    geometry.faces = this.faces.map(f => [...f]);
    
    // Clone normals
    geometry.normals = this.normals.map(n => n.clone());
    
    return geometry;
  }
}

// ---- Geometry (Using Prototype's Face class as base) ----
export class Face {
  constructor(a, b, c, normal = new Vector3(), material = null) {
    this.a = a; // Index of vertex A
    this.b = b; // Index of vertex B
    this.c = c; // Index of vertex C
    this.normal = normal; // Face normal (optional, can be calculated)
    this.material = material; // Material assigned to this face (optional)
    this.depth = 0; // Used for depth sorting (calculated during rendering)
  }
  
  // Prototype method to calculate depth (for sorting)
  // Note: Vertices here are assumed to be already transformed to view or screen space
  calculateDepth(vertices) {
    if (!vertices || !vertices[this.a] || !vertices[this.b] || !vertices[this.c]) {
        console.error("Cannot calculate depth: Invalid vertices provided.");
        this.depth = 0;
        return this;
    }
    const za = vertices[this.a].z;
    const zb = vertices[this.b].z;
    const zc = vertices[this.c].z;
    // Depth for painter's algorithm sorting (average Z)
    this.depth = (za + zb + zc) / 3;
    return this;
  }
}

// Placeholder for a base Geometry class if needed later
// export class Geometry {
//   constructor() {
//     this.vertices = [];
//     this.faces = [];
//     // Other properties like normals, uvs, etc.
//   }
// } 