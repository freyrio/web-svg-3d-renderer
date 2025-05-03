import { Vector3 } from './Vector3';
import { degToRad } from './utils';

/**
 * Class representing a 4x4 matrix for 3D transformations.
 * Uses Column-Major element order.
 *   Elements:
 *   [ m00, m10, m20, m30,  // Col 1
 *     m01, m11, m21, m31,  // Col 2
 *     m02, m12, m22, m32,  // Col 3
 *     m03, m13, m23, m33 ] // Col 4 (Translation)
 */
export class Matrix4 {
  /**
   * Create a Matrix4, initialized as a column-major identity matrix.
   */
  constructor() {
    // Initialize Column-Major Identity
    this.elements = [
      1, 0, 0, 0,  // Col 1
      0, 1, 0, 0,  // Col 2
      0, 0, 1, 0,  // Col 3
      0, 0, 0, 1   // Col 4
    ];
  }

  /**
   * Set the elements of this matrix from column-major arguments.
   * @param {number} n11 - Element m00 (col 1, row 1)
   * @param {number} n21 - Element m10 (col 1, row 2)
   * @param {number} n31 - Element m20 (col 1, row 3)
   * @param {number} n41 - Element m30 (col 1, row 4)
   * @param {number} n12 - Element m01 (col 2, row 1)
   * @param {number} n22 - Element m11 (col 2, row 2)
   * @param {number} n32 - Element m21 (col 2, row 3)
   * @param {number} n42 - Element m31 (col 2, row 4)
   * @param {number} n13 - Element m02 (col 3, row 1)
   * @param {number} n23 - Element m12 (col 3, row 2)
   * @param {number} n33 - Element m22 (col 3, row 3)
   * @param {number} n43 - Element m32 (col 3, row 4)
   * @param {number} n14 - Element m03 (col 4, row 1, tx)
   * @param {number} n24 - Element m13 (col 4, row 2, ty)
   * @param {number} n34 - Element m23 (col 4, row 3, tz)
   * @param {number} n44 - Element m33 (col 4, row 4)
   * @returns {Matrix4} This matrix for chaining.
   */
  set(n11, n21, n31, n41, n12, n22, n32, n42, n13, n23, n33, n43, n14, n24, n34, n44) {
    const te = this.elements;
    // Column 1
    te[0] = n11; te[1] = n21; te[2] = n31; te[3] = n41;
    // Column 2
    te[4] = n12; te[5] = n22; te[6] = n32; te[7] = n42;
    // Column 3
    te[8] = n13; te[9] = n23; te[10] = n33; te[11] = n43;
    // Column 4
    te[12] = n14; te[13] = n24; te[14] = n34; te[15] = n44;
    return this;
  }

  /**
   * Set this matrix to the column-major identity matrix.
   * @returns {Matrix4} This matrix for chaining.
   */
  identity() {
    this.set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    return this;
  }

  /**
   * Copy the elements from another matrix into this one.
   * @param {Matrix4} m - The matrix to copy from.
   * @returns {Matrix4} This matrix for chaining.
   */
  copy(m) {
    const te = this.elements;
    const me = m.elements;
    for (let i = 0; i < 16; i++) {
      te[i] = me[i];
    }
    return this;
  }

  /**
   * Multiply this matrix by another matrix (this = this * m).
   * Uses post-multiplication suitable for column vectors (v' = M * v).
   * @param {Matrix4} m - The matrix to multiply by.
   * @returns {Matrix4} This matrix for chaining.
   */
  multiply(m) {
    return this.multiplyMatrices(this, m);
  }

  /**
   * Multiply this matrix by another matrix (this = m * this).
   * Uses pre-multiplication.
   * @param {Matrix4} m - The matrix to pre-multiply by.
   * @returns {Matrix4} This matrix for chaining.
   */
  premultiply(m) {
    return this.multiplyMatrices(m, this);
  }

  /**
   * Sets this matrix to the multiplication of two matrices (this = a * b).
   * Assumes column-major matrices.
   * @param {Matrix4} a - The first matrix.
   * @param {Matrix4} b - The second matrix.
   * @returns {Matrix4} This matrix for chaining.
   */
  multiplyMatrices(a, b) {
    const ae = a.elements;
    const be = b.elements;
    const te = this.elements;
    
    const a11 = ae[0], a12 = ae[1], a13 = ae[2], a14 = ae[3];
    const a21 = ae[4], a22 = ae[5], a23 = ae[6], a24 = ae[7];
    const a31 = ae[8], a32 = ae[9], a33 = ae[10], a34 = ae[11];
    const a41 = ae[12], a42 = ae[13], a43 = ae[14], a44 = ae[15];

    const b11 = be[0], b12 = be[1], b13 = be[2], b14 = be[3];
    const b21 = be[4], b22 = be[5], b23 = be[6], b24 = be[7];
    const b31 = be[8], b32 = be[9], b33 = be[10], b34 = be[11];
    const b41 = be[12], b42 = be[13], b43 = be[14], b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;

    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;

    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;

    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
  }

  /**
   * Translates this matrix by the given vector (post-multiplication).
   * @param {number} x - The x translation.
   * @param {number} y - The y translation.
   * @param {number} z - The z translation.
   * @returns {Matrix4} This matrix for chaining.
   */
  translate(x, y, z) {
    const translationMatrix = new Matrix4().makeTranslation(x, y, z);
    return this.multiply(translationMatrix);
  }

  /**
   * Rotates this matrix around the X axis (post-multiplication).
   * @param {number} angleDeg - The rotation angle in degrees.
   * @returns {Matrix4} This matrix for chaining.
   */
  rotateX(angleDeg) {
    if (angleDeg === 0) return this;
    const rotationMatrix = new Matrix4().makeRotationX(degToRad(angleDeg));
    return this.multiply(rotationMatrix);
  }

  /**
   * Rotates this matrix around the Y axis (post-multiplication).
   * @param {number} angleDeg - The rotation angle in degrees.
   * @returns {Matrix4} This matrix for chaining.
   */
  rotateY(angleDeg) {
    if (angleDeg === 0) return this;
    const rotationMatrix = new Matrix4().makeRotationY(degToRad(angleDeg));
    return this.multiply(rotationMatrix);
  }

  /**
   * Rotates this matrix around the Z axis (post-multiplication).
   * @param {number} angleDeg - The rotation angle in degrees.
   * @returns {Matrix4} This matrix for chaining.
   */
  rotateZ(angleDeg) {
    if (angleDeg === 0) return this;
    const rotationMatrix = new Matrix4().makeRotationZ(degToRad(angleDeg));
    return this.multiply(rotationMatrix);
  }

  /**
   * Scales this matrix by the given factors (post-multiplication).
   * @param {number} x - The x scale factor.
   * @param {number} y - The y scale factor.
   * @param {number} z - The z scale factor.
   * @returns {Matrix4} This matrix for chaining.
   */
  scale(x, y, z) {
    const scalingMatrix = new Matrix4().makeScale(x, y, z);
    return this.multiply(scalingMatrix);
  }

  /**
   * Create a column-major translation matrix.
   * @param {number} x - The x translation.
   * @param {number} y - The y translation.
   * @param {number} z - The z translation.
   * @returns {Matrix4} This matrix for chaining.
   */
  makeTranslation(x, y, z) {
    this.set(
      1, 0, 0, 0,  // Col 1
      0, 1, 0, 0,  // Col 2
      0, 0, 1, 0,  // Col 3
      x, y, z, 1   // Col 4 (tx, ty, tz, 1)
    );
    return this;
  }

  /**
   * Create a column-major rotation matrix around the X axis.
   * @param {number} angleRad - The rotation angle in radians.
   * @returns {Matrix4} This matrix for chaining.
   */
  makeRotationX(angleRad) {
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    this.set(
      1, 0,  0, 0,  // Col 1
      0, c,  s, 0,  // Col 2 (m01, m11, m21, m31)
      0, -s, c, 0,  // Col 3 (m02, m12, m22, m32)
      0, 0,  0, 1   // Col 4
    );
    return this;
  }

  /**
   * Create a column-major rotation matrix around the Y axis.
   * @param {number} angleRad - The rotation angle in radians.
   * @returns {Matrix4} This matrix for chaining.
   */
  makeRotationY(angleRad) {
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    this.set(
       c, 0, -s, 0,  // Col 1 (m00, m10, m20, m30)
       0, 1, 0,  0,  // Col 2
       s, 0, c,  0,  // Col 3 (m02, m12, m22, m32)
       0, 0, 0,  1   // Col 4
    );
    return this;
  }

  /**
   * Create a column-major rotation matrix around the Z axis.
   * @param {number} angleRad - The rotation angle in radians.
   * @returns {Matrix4} This matrix for chaining.
   */
  makeRotationZ(angleRad) {
    const c = Math.cos(angleRad);
    const s = Math.sin(angleRad);
    this.set(
      c, s,  0, 0,  // Col 1 (m00, m10, m20, m30)
     -s, c,  0, 0,  // Col 2 (m01, m11, m21, m31)
      0, 0,  1, 0,  // Col 3
      0, 0,  0, 1   // Col 4
    );
    return this;
  }

  /**
   * Create a column-major scaling matrix.
   * @param {number} x - The x scale factor.
   * @param {number} y - The y scale factor.
   * @param {number} z - The z scale factor.
   * @returns {Matrix4} This matrix for chaining.
   */
  makeScale(x, y, z) {
    this.set(
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    );
    return this;
  }

  /**
   * Create a column-major perspective projection matrix.
   * Matches the WebGL/OpenGL convention.
   * @param {number} fovRad - The field of view in radians.
   * @param {number} aspect - The aspect ratio (width / height).
   * @param {number} near - The near clipping plane distance.
   * @param {number} far - The far clipping plane distance.
   * @returns {Matrix4} This matrix for chaining.
   */
  makePerspective(fovRad, aspect, near, far) {
    const top = near * Math.tan(fovRad * 0.5);
    const height = 2 * top;
    const width = aspect * height;
    const left = -width / 2;
    const right = left + width;
    const bottom = -top;
    
    const x = 2 * near / (right - left);
    const y = 2 * near / (top - bottom);
    
    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = -(far + near) / (far - near);
    const d = -2 * far * near / (far - near);
    
    // Set using standard Column-Major perspective matrix layout
    this.set(
      x, 0, 0,  0, // Col 1
      0, y, 0,  0, // Col 2
      a, b, c, -1, // Col 3
      0, 0, d,  0  // Col 4
    );
    return this;
  }
  
  /**
   * Creates a clone of this matrix.
   * @returns {Matrix4} A new matrix with the same elements.
   */
  clone() {
    return new Matrix4().copy(this);
  }

  /**
   * Invert this matrix (column-major).
   * @returns {Matrix4} This matrix for chaining.
   */
  invert() {
    // Based on https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js
    const te = this.elements;
    const n11 = te[0], n21 = te[1], n31 = te[2], n41 = te[3];
    const n12 = te[4], n22 = te[5], n32 = te[6], n42 = te[7];
    const n13 = te[8], n23 = te[9], n33 = te[10], n43 = te[11];
    const n14 = te[12], n24 = te[13], n34 = te[14], n44 = te[15];

    const t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
    const t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
    const t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
    const t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if ( det === 0 ) {
        console.warn( "Matrix4.invert(): determinant is zero, matrix cannot be inverted." );
        return this.identity();
    }

    const detInv = 1 / det;

    te[ 0 ] = t11 * detInv;
    te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
    te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
    te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

    te[ 4 ] = t12 * detInv;
    te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
    te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
    te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

    te[ 8 ] = t13 * detInv;
    te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
    te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
    te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

    te[ 12 ] = t14 * detInv;
    te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
    te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
    te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

    return this;
  }

  /**
   * Create a Column-Major orthographic projection matrix that matches the WebGL/OpenGL convention.
   * @param {number} left - Left plane.
   * @param {number} right - Right plane.
   * @param {number} top - Top plane.
   * @param {number} bottom - Bottom plane.
   * @param {number} near - Near plane.
   * @param {number} far - Far plane.
   * @returns {Matrix4} This matrix for chaining.
   */
  makeOrthographic(left, right, top, bottom, near, far) {
    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    const sx = -2 * lr;
    const sy = -2 * bt;
    const sz = 2 * nf;

    const tx = (left + right) * lr;
    const ty = (top + bottom) * bt;
    const tz = (near + far) * nf;

    // Set using Column-Major element order
    this.set(
      sx, 0,  0,  0,  // Col 1 (m00, m10, m20, m30)
      0,  sy, 0,  0,  // Col 2 (m01, m11, m21, m31)
      0,  0,  sz, 0,  // Col 3 (m02, m12, m22, m32)
      tx, ty, tz, 1   // Col 4 (m03, m13, m23, m33)
    );
    return this;
  }

  /**
   * Applies this matrix transformation to a 3D vector (assuming w=1 for input).
   * Uses column-major matrix * column vector multiplication.
   * Returns the transformed coordinates in homogeneous form (x, y, z, w).
   * Does NOT perform perspective division.
   * @param {Vector3} vector - The 3D vector to transform.
   * @returns {{x: number, y: number, z: number, w: number}} The transformed homogeneous coordinates.
   */
  applyToVector3(vector) {
    const e = this.elements;
    const x = vector.x, y = vector.y, z = vector.z;

    const resX = e[0] * x + e[4] * y + e[8] * z + e[12]; // Row 1
    const resY = e[1] * x + e[5] * y + e[9] * z + e[13]; // Row 2
    const resZ = e[2] * x + e[6] * y + e[10] * z + e[14]; // Row 3
    const resW = e[3] * x + e[7] * y + e[11] * z + e[15]; // Row 4

    return { x: resX, y: resY, z: resZ, w: resW };
  }

  /**
  * Create a view matrix looking from eye towards target.
  * @param {Vector3} eye - Position of the camera.
  * @param {Vector3} target - Point the camera is looking at.
  * @param {Vector3} up - Up direction vector.
  * @returns {Matrix4} This matrix for chaining.
  */
  makeLookAt(eye, target, up) {
    const z = new Vector3().subVectors(eye, target); // Forward vector (view direction)

    if (z.lengthSq() === 0) {
        // Eye and target are at the same position
        z.z = 1;
    }
    z.normalize();

    const x = new Vector3().crossVectors(up, z); // Right vector

    if (x.lengthSq() === 0) {
        // Up and z are parallel
        if (Math.abs(up.z) === 1) {
            z.x += 0.0001; // Slightly perturb z if it's pointing straight up/down Z
        } else {
            z.z += 0.0001; // Slightly perturb z otherwise
        }
        z.normalize();
        x.crossVectors(up, z);
    }
    x.normalize();

    const y = new Vector3().crossVectors(z, x); // Recalculated Up vector

    // Set using standard Column-Major View Matrix layout
    this.set(
        x.x, y.x, z.x, 0, // Col 1 (Rotation part transposed)
        x.y, y.y, z.y, 0, // Col 2
        x.z, y.z, z.z, 0, // Col 3
        -x.dot(eye), -y.dot(eye), -z.dot(eye), 1 // Col 4 (Translation part)
    );

    return this;
  }

  // Using prototype's transformPoint logic which modifies the input point
  // and performs perspective division.
  transformPoint(point) {
    const e = this.elements;
    const x = point.x, y = point.y, z = point.z;
    
    // Calculate w (denominator for perspective division)
    // Using Column-Major indexing: Row 4 -> indices 3, 7, 11, 15
    const wInv = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    
    if (!isFinite(wInv)) {
        console.warn("transformPoint: w is zero or infinite", wInv);
        // Set point to origin or handle as appropriate
        point.x = 0; point.y = 0; point.z = 0;
        return point;
    }
    
    // Apply transformation and perspective division
    // Using Column-Major indexing:
    // Row 1 -> indices 0, 4, 8, 12
    // Row 2 -> indices 1, 5, 9, 13
    // Row 3 -> indices 2, 6, 10, 14
    point.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * wInv;
    point.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * wInv;
    point.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * wInv;
    
    return point;
  }
} 