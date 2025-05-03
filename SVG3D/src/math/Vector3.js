/**
 * Class representing a 3D vector.
 */
export class Vector3 {
  /**
   * Create a Vector3.
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   */
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Set the vector components.
   * @param {number} x - The x component.
   * @param {number} y - The y component.
   * @param {number} z - The z component.
   * @returns {Vector3} This vector for chaining.
   */
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * Copy the components of a vector to this vector.
   * @param {Vector3} v - The vector to copy.
   * @returns {Vector3} This vector for chaining.
   */
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  /**
   * Clone this vector.
   * @returns {Vector3} A new vector with the same components.
   */
  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Add a vector to this vector.
   * @param {Vector3} v - The vector to add.
   * @returns {Vector3} This vector for chaining.
   */
  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  /**
   * Subtract a vector from this vector.
   * @param {Vector3} v - The vector to subtract.
   * @returns {Vector3} This vector for chaining.
   */
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  /**
   * Subtract two vectors and store the result in this vector.
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @returns {Vector3} This vector for chaining.
   */
  subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }

  /**
   * Calculate the cross product of two vectors and store the result in this vector.
   * @param {Vector3} a - The first vector.
   * @param {Vector3} b - The second vector.
   * @returns {Vector3} This vector for chaining.
   */
  crossVectors(a, b) {
    const ax = a.x, ay = a.y, az = a.z;
    const bx = b.x, by = b.y, bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  /**
   * Multiply this vector by a scalar.
   * @param {number} s - The scalar to multiply by.
   * @returns {Vector3} This vector for chaining.
   */
  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }

  /**
   * Divide this vector by a scalar.
   * @param {number} s - The scalar to divide by.
   * @returns {Vector3} This vector for chaining.
   */
  divideScalar(s) {
    return this.multiplyScalar(1 / s);
  }

  /**
   * Calculate the squared length of this vector.
   * @returns {number} The squared length.
   */
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Calculate the length of this vector.
   * @returns {number} The length.
   */
  length() {
    return Math.sqrt(this.lengthSq());
  }

  /**
   * Normalize this vector (make it unit length).
   * @returns {Vector3} This vector for chaining.
   */
  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  /**
   * Calculate the cross product with another vector.
   * @param {Vector3} v - The other vector.
   * @returns {Vector3} This vector for chaining.
   */
  cross(v) {
    return this.crossVectors(this, v);
  }

  /**
   * Calculate the dot product with another vector.
   * @param {Vector3} v - The other vector.
   * @returns {number} The dot product.
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /**
   * Applies a Matrix4 transformation to this vector.
   * Treats the vector as a point (w=1) and applies perspective division.
   * @param {Matrix4} m - The Matrix4 to apply.
   * @returns {Vector3} This vector for chaining.
   */
  applyMatrix4(m) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;

    // Calculate homogeneous coordinates using Column-Major M * v
    const rx = e[0] * x + e[4] * y + e[8] * z + e[12];
    const ry = e[1] * x + e[5] * y + e[9] * z + e[13];
    const rz = e[2] * x + e[6] * y + e[10] * z + e[14];
    const rw = e[3] * x + e[7] * y + e[11] * z + e[15];

    if (Math.abs(rw) < 1e-10) { // Check for near-zero w
      console.warn("Vector3.applyMatrix4: w component is near zero.");
      this.x = 0;
      this.y = 0;
      this.z = 0;
    } else {
      const invW = 1.0 / rw; // Calculate inverse W
      this.x = rx * invW;
      this.y = ry * invW;
      this.z = rz * invW;
    }

    return this;
  }

  /**
   * Sets this vector to the position elements (translation) of a transformation matrix.
   * Assumes the matrix is stored in Column-Major format.
   * @param {Matrix4} m - The Matrix4 to extract position from.
   * @returns {Vector3} This vector.
   */
  setFromMatrixPosition(m) {
    const e = m.elements;
    // Column-Major: Translation is in elements 12, 13, 14 (4th column)
    this.x = e[12];
    this.y = e[13];
    this.z = e[14];
    return this;
  }

  /**
   * Transforms the direction of this vector by a matrix (assumes matrix has no translation).
   * Multiplies by the upper 3x3 part assuming Column-Major format.
   * Excludes perspective division. Useful for transforming normals or directions.
   * @param {Matrix4} m - The Matrix4 to apply.
   * @returns {Vector3} This vector.
   */
  transformDirection(m) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;

    // Multiply by upper 3x3 part of Column-Major matrix
    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize(); // Re-normalize the direction vector
  }

  /**
   * Applies a Matrix4 transformation to this vector, treating it as a point (w=1).
   * Does NOT apply perspective division. Uses Column-Major format.
   * Use for changing coordinate systems without applying perspective.
   * @param {Matrix4} m - The Matrix4 to apply.
   * @returns {Vector3} This vector for chaining.
   */
  applyMatrix4AsPoint(m) {
    const x = this.x, y = this.y, z = this.z;
    const e = m.elements;
    
    // Calculate transformed point using Column-Major M * v (w=1)
    this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
    
    // const w = e[3] * x + e[7] * y + e[11] * z + e[15]; // w calculation removed
    // Normalization based on w removed as per method description
    
    return this;
  }
}