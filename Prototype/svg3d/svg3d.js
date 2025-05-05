// ---- Math Utilities ----
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    
    clone() {
      return new Vector3(this.x, this.y, this.z);
    }
    
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;
    }
    
    divideScalar(s) {
      if (s !== 0) {
        this.x /= s;
        this.y /= s;
        this.z /= s;
      }
      return this;
    }
    
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    
    cross(v) {
      const x = this.y * v.z - this.z * v.y;
      const y = this.z * v.x - this.x * v.z;
      const z = this.x * v.y - this.y * v.x;
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
  }

  class Vector2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    
    set(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
    
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    }
    
    clone() {
      return new Vector2(this.x, this.y);
    }
    
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
    
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      return this;
    }
    
    divideScalar(s) {
      if (s !== 0) {
        this.x /= s;
        this.y /= s;
      }
      return this;
    }
    
    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
  }

  class Matrix4 {
    constructor() {
      // Elements stored in column-major order to match WebGL/OpenGL convention
      this.elements = [
        1, 0, 0, 0,  // Column 1
        0, 1, 0, 0,  // Column 2
        0, 0, 1, 0,  // Column 3
        0, 0, 0, 1   // Column 4
      ];
    }
    
    copy(m) {
      const te = this.elements;
      const me = m.elements;
      
      for (let i = 0; i < 16; i++) {
        te[i] = me[i];
      }
      
      return this;
    }
    
    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
      const te = this.elements;
      
      // Set in column-major order
      te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
      te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
      te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
      te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
      
      return this;
    }
    
    identity() {
      return this.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
    }
    
    clone() {
      return new Matrix4().copy(this);
    }
    
    multiply(m) {
      // In column-major WebGL convention, multiply this * m
      return this.multiplyMatrices(this, m);
    }
    
    premultiply(m) {
      // In column-major WebGL convention, multiply m * this
      return this.multiplyMatrices(m, this);
    }
    
    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;
      
      // Column-major multiplication implementation
      const a11 = ae[0], a21 = ae[1], a31 = ae[2], a41 = ae[3];
      const a12 = ae[4], a22 = ae[5], a32 = ae[6], a42 = ae[7];
      const a13 = ae[8], a23 = ae[9], a33 = ae[10], a43 = ae[11];
      const a14 = ae[12], a24 = ae[13], a34 = ae[14], a44 = ae[15];
      
      const b11 = be[0], b21 = be[1], b31 = be[2], b41 = be[3];
      const b12 = be[4], b22 = be[5], b32 = be[6], b42 = be[7];
      const b13 = be[8], b23 = be[9], b33 = be[10], b43 = be[11];
      const b14 = be[12], b24 = be[13], b34 = be[14], b44 = be[15];
      
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
    
    makeTranslation(x, y, z) {
      // Column-major translation matrix
      return this.set(
        1, 0, 0, x,
        0, 1, 0, y,
        0, 0, 1, z,
        0, 0, 0, 1
      );
    }
    
    makeRotationX(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      
      // Column-major rotation X matrix
      return this.set(
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1
      );
    }
    
    makeRotationY(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      
      // Column-major rotation Y matrix
      return this.set(
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1
      );
    }
    
    makeRotationZ(theta) {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      
      // Column-major rotation Z matrix
      return this.set(
        c, s, 0, 0,
        -s, c, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
    }
    
    // Invert the matrix - needed for camera view matrix
    invert() {
      // Based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
      // Adapted for column-major format
      const te = this.elements;
        
      // Cache elements for readability
      const m11 = te[0], m21 = te[1], m31 = te[2], m41 = te[3];
      const m12 = te[4], m22 = te[5], m32 = te[6], m42 = te[7];
      const m13 = te[8], m23 = te[9], m33 = te[10], m43 = te[11];
      const m14 = te[12], m24 = te[13], m34 = te[14], m44 = te[15];

      // Compute cofactors
      const t11 = m22 * (m33 * m44 - m43 * m34) - m23 * (m32 * m44 - m42 * m34) + m24 * (m32 * m43 - m42 * m33);
      const t12 = m21 * (m33 * m44 - m43 * m34) - m23 * (m31 * m44 - m41 * m34) + m24 * (m31 * m43 - m41 * m33);
      const t13 = m21 * (m32 * m44 - m42 * m34) - m22 * (m31 * m44 - m41 * m34) + m24 * (m31 * m42 - m41 * m32);
      const t14 = m21 * (m32 * m43 - m42 * m33) - m22 * (m31 * m43 - m41 * m33) + m23 * (m31 * m42 - m41 * m32);
      
      // Compute determinant
      const det = m11 * t11 - m12 * t12 + m13 * t13 - m14 * t14;
      
      if (det === 0) {
        return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
      
      const detInv = 1 / det;
      
      // Compute remaining cofactors
      const t21 = m12 * (m33 * m44 - m43 * m34) - m13 * (m32 * m44 - m42 * m34) + m14 * (m32 * m43 - m42 * m33);
      const t22 = m11 * (m33 * m44 - m43 * m34) - m13 * (m31 * m44 - m41 * m34) + m14 * (m31 * m43 - m41 * m33);
      const t23 = m11 * (m32 * m44 - m42 * m34) - m12 * (m31 * m44 - m41 * m34) + m14 * (m31 * m42 - m41 * m32);
      const t24 = m11 * (m32 * m43 - m42 * m33) - m12 * (m31 * m43 - m41 * m33) + m13 * (m31 * m42 - m41 * m32);
      
      const t31 = m12 * (m23 * m44 - m43 * m24) - m13 * (m22 * m44 - m42 * m24) + m14 * (m22 * m43 - m42 * m23);
      const t32 = m11 * (m23 * m44 - m43 * m24) - m13 * (m21 * m44 - m41 * m24) + m14 * (m21 * m43 - m41 * m23);
      const t33 = m11 * (m22 * m44 - m42 * m24) - m12 * (m21 * m44 - m41 * m24) + m14 * (m21 * m42 - m41 * m22);
      const t34 = m11 * (m22 * m43 - m42 * m23) - m12 * (m21 * m43 - m41 * m23) + m13 * (m21 * m42 - m41 * m22);
      
      const t41 = m12 * (m23 * m34 - m33 * m24) - m13 * (m22 * m34 - m32 * m24) + m14 * (m22 * m33 - m32 * m23);
      const t42 = m11 * (m23 * m34 - m33 * m24) - m13 * (m21 * m34 - m31 * m24) + m14 * (m21 * m33 - m31 * m23);
      const t43 = m11 * (m22 * m34 - m32 * m24) - m12 * (m21 * m34 - m31 * m24) + m14 * (m21 * m32 - m31 * m22);
      const t44 = m11 * (m22 * m33 - m32 * m23) - m12 * (m21 * m33 - m31 * m23) + m13 * (m21 * m32 - m31 * m22);
      
      // Set inverse matrix using adjugate / determinant
      te[0] = t11 * detInv;
      te[1] = -t12 * detInv;
      te[2] = t13 * detInv;
      te[3] = -t14 * detInv;
      
      te[4] = -t21 * detInv;
      te[5] = t22 * detInv;
      te[6] = -t23 * detInv;
      te[7] = t24 * detInv;
      
      te[8] = t31 * detInv;
      te[9] = -t32 * detInv;
      te[10] = t33 * detInv;
      te[11] = -t34 * detInv;
      
      te[12] = -t41 * detInv;
      te[13] = t42 * detInv;
      te[14] = -t43 * detInv;
      te[15] = t44 * detInv;
      
      return this;
    }
    
    makePerspective(fov, aspect, near, far) {
      const top = near * Math.tan(fov * 0.5);
      const height = 2 * top;
      const width = aspect * height;
      const left = -width / 2;
      const right = left + width;
      const bottom = -top;
      
      // Column-major perspective projection matrix
      const x = 2 * near / (right - left);
      const y = 2 * near / (top - bottom);
      
      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);
      const c = -(far + near) / (far - near);
      const d = -2 * far * near / (far - near);
      
      return this.set(
        x, 0, 0, 0,
        0, y, 0, 0,
        a, b, c, -1,
        0, 0, d, 0
      );
    }
    
    lookAt(eye, target, up) {
      if (!eye || !target || !up) return this;
      
      // Calculate the orthonormal basis vectors for the camera
      const z = new Vector3().copy(eye).sub(target).normalize();
      
      if (z.length() === 0) {
        z.z = 1;
      }
      
      const x = new Vector3().copy(up).cross(z).normalize();
      
      if (x.length() === 0) {
        z.z += 0.0001;
        x.copy(up).cross(z).normalize();
      }
      
      const y = new Vector3().copy(z).cross(x);
      
      // Column-major view matrix construction
      this.set(
        x.x, y.x, z.x, 0,
        x.y, y.y, z.y, 0,
        x.z, y.z, z.z, 0,
        0, 0, 0, 1
      );
      
      // Apply translation
      const te = this.elements;
      te[12] = -x.dot(eye);
      te[13] = -y.dot(eye);
      te[14] = -z.dot(eye);
      
      return this;
    }
    
    transformPoint(point) {
      const e = this.elements;
      const x = point.x, y = point.y, z = point.z;
      
      // Column-major point transformation (treating the point as a column vector)
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      
      const newX = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
      const newY = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
      const newZ = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
      
      point.x = newX;
      point.y = newY;
      point.z = newZ;
      
      return point;
    }
  }

  // ---- Intersection Utilities ----
  class Line3D {
    constructor(p1, p2) {
      this.p1 = p1.clone();
      this.p2 = p2.clone();
    }
    
    // Get a point along the line based on parameter t (0-1)
    getPoint(t) {
      return new Vector3(
        this.p1.x + (this.p2.x - this.p1.x) * t,
        this.p1.y + (this.p2.y - this.p1.y) * t,
        this.p1.z + (this.p2.z - this.p1.z) * t
      );
    }
    
    // Get the direction vector of the line
    getDirection() {
      return new Vector3(
        this.p2.x - this.p1.x,
        this.p2.y - this.p1.y,
        this.p2.z - this.p1.z
      ).normalize();
    }
  }
  
  class Plane3D {
    constructor(p1, p2, p3) {
      this.p1 = p1.clone();
      
      // Calculate plane normal using cross product of two edges
      const v1 = new Vector3(
        p2.x - p1.x,
        p2.y - p1.y,
        p2.z - p1.z
      );
      
      const v2 = new Vector3(
        p3.x - p1.x,
        p3.y - p1.y,
        p3.z - p1.z
      );
      
      this.normal = new Vector3().copy(v1).cross(v2).normalize();
      
      // Calculate plane constant: ax + by + cz + d = 0
      // d = -(ax + by + cz) for a point on the plane
      this.d = -(this.normal.x * p1.x + this.normal.y * p1.y + this.normal.z * p1.z);
    }
    
    // Get signed distance from point to plane
    distanceToPoint(point) {
      return this.normal.x * point.x + this.normal.y * point.y + this.normal.z * point.z + this.d;
    }
    
    // Check if a point is in front of, behind, or on the plane
    classifyPoint(point, epsilon = 0.00001) {
      const dist = this.distanceToPoint(point);
      if (dist > epsilon) return 1;      // In front
      if (dist < -epsilon) return -1;    // Behind
      return 0;                           // On plane
    }
    
    // Find intersection of line with plane
    intersectLine(line) {
      const direction = line.getDirection();
      const denominator = this.normal.dot(direction);
      
      // Line is parallel to plane
      if (Math.abs(denominator) < 0.00001) return null;
      
      // Calculate t where the line intersects the plane
      const t = -(this.normal.dot(line.p1) + this.d) / denominator;
      
      // Check if intersection is within line segment
      if (t < 0 || t > 1) return null;
      
      // Return the intersection point
      return line.getPoint(t);
    }
  }
  
  class IntersectionHelper {
    // Detect if two triangles intersect
    static trianglesIntersect(t1p1, t1p2, t1p3, t2p1, t2p2, t2p3) {
      // Create planes for both triangles
      const plane1 = new Plane3D(t1p1, t1p2, t1p3);
      const plane2 = new Plane3D(t2p1, t2p2, t2p3);
      
      // Classify triangle 2 vertices against plane 1
      const t2p1Class = plane1.classifyPoint(t2p1);
      const t2p2Class = plane1.classifyPoint(t2p2);
      const t2p3Class = plane1.classifyPoint(t2p3);
      
      // If all points of triangle 2 are on same side of plane 1, no intersection
      if (t2p1Class > 0 && t2p2Class > 0 && t2p3Class > 0) return false;
      if (t2p1Class < 0 && t2p2Class < 0 && t2p3Class < 0) return false;
      
      // Classify triangle 1 vertices against plane 2
      const t1p1Class = plane2.classifyPoint(t1p1);
      const t1p2Class = plane2.classifyPoint(t1p2);
      const t1p3Class = plane2.classifyPoint(t1p3);
      
      // If all points of triangle 1 are on same side of plane 2, no intersection
      if (t1p1Class > 0 && t1p2Class > 0 && t1p3Class > 0) return false;
      if (t1p1Class < 0 && t1p2Class < 0 && t1p3Class < 0) return false;
      
      // Triangles potentially intersect - for full check need to check if intersection
      // line segment passes through both triangles
      return true;
    }
    
    // Find intersection between a triangle and a plane
    static trianglePlaneIntersection(p1, p2, p3, plane) {
      // Create lines for each edge of the triangle
      const lines = [
        new Line3D(p1, p2),
        new Line3D(p2, p3),
        new Line3D(p3, p1)
      ];
      
      // Find intersections of each line with the plane
      const intersections = [];
      lines.forEach(line => {
        const intersection = plane.intersectLine(line);
        if (intersection) {
          intersections.push(intersection);
        }
      });
      
      return intersections;
    }
    
    // Subdivide a triangle along an intersection plane
    static subdivideTriangle(p1, p2, p3, plane) {
      // Classify each vertex against the plane
      const p1Class = plane.classifyPoint(p1);
      const p2Class = plane.classifyPoint(p2);
      const p3Class = plane.classifyPoint(p3);
      
      // Find intersection points
      const intersections = this.trianglePlaneIntersection(p1, p2, p3, plane);
      
      // If we don't have exactly 2 intersection points, return the original triangle
      if (intersections.length !== 2) {
        return [{p1, p2, p3}];
      }
      
      // Create new triangles based on subdivision
      const i1 = intersections[0];
      const i2 = intersections[1];
      
      // Arrange vertices based on which side of plane they're on
      // Front side triangles
      const frontTriangles = [];
      // Back side triangles
      const backTriangles = [];
      
      // Case 1: One vertex on one side, two on the other
      if (p1Class * p2Class < 0 && p1Class * p3Class < 0) {
        // p1 is on one side, p2 and p3 on the other
        if (p1Class > 0) {
          frontTriangles.push({p1, p2: i1, p3: i2});
          backTriangles.push({p1: i1, p2, p3});
          backTriangles.push({p1: i1, p2: p3, p3: i2});
        } else {
          frontTriangles.push({p1: i1, p2, p3});
          frontTriangles.push({p1: i1, p2: p3, p3: i2});
          backTriangles.push({p1, p2: i1, p3: i2});
        }
      }
      else if (p2Class * p1Class < 0 && p2Class * p3Class < 0) {
        // p2 is on one side, p1 and p3 on the other
        if (p2Class > 0) {
          frontTriangles.push({p1: p2, p2: i1, p3: i2});
          backTriangles.push({p1, p2: i1, p3});
          backTriangles.push({p1: i1, p2: p2, p3: i2});
        } else {
          frontTriangles.push({p1, p2: i1, p3});
          frontTriangles.push({p1: i1, p2: p2, p3: i2});
          backTriangles.push({p1: p2, p2: i1, p3: i2});
        }
      }
      else if (p3Class * p1Class < 0 && p3Class * p2Class < 0) {
        // p3 is on one side, p1 and p2 on the other
        if (p3Class > 0) {
          frontTriangles.push({p1: p3, p2: i1, p3: i2});
          backTriangles.push({p1, p2, p3: i1});
          backTriangles.push({p1: i1, p2: i2, p3: p3});
        } else {
          frontTriangles.push({p1, p2, p3: i1});
          frontTriangles.push({p1: i1, p2: i2, p3: p3});
          backTriangles.push({p1: p3, p2: i1, p3: i2});
        }
      }
      
      // Return all triangles with their depth classifications
      return {
        front: frontTriangles,
        back: backTriangles
      };
    }
    
    // Calculate intersection line between two planes
    static planePlaneIntersection(planeA, planeB) {
      // Direction is cross product of normals
      const direction = new Vector3().copy(planeA.normal).cross(planeB.normal);
      
      // Check if planes are parallel (cross product is zero)
      const dirLength = direction.length();
      if (dirLength < 0.00001) return null;
      
      // Normalize direction
      direction.divideScalar(dirLength);
      
      // Find a point on the intersection line
      // Solve system of equations:
      // planeA.normal.x * p.x + planeA.normal.y * p.y + planeA.normal.z * p.z + planeA.d = 0
      // planeB.normal.x * p.x + planeB.normal.y * p.y + planeB.normal.z * p.z + planeB.d = 0
      
      // If direction.x is not 0, we can set p.y = p.z = 0 and solve for p.x
      let point;
      if (Math.abs(direction.x) > 0.00001) {
        const pz = 0;
        const py = 0;
        const px = -(planeA.d + planeA.normal.y * py + planeA.normal.z * pz) / planeA.normal.x;
        point = new Vector3(px, py, pz);
      } 
      // If direction.y is not 0, we can set p.x = p.z = 0 and solve for p.y
      else if (Math.abs(direction.y) > 0.00001) {
        const pz = 0;
        const px = 0;
        const py = -(planeA.d + planeA.normal.x * px + planeA.normal.z * pz) / planeA.normal.y;
        point = new Vector3(px, py, pz);
      }
      // If direction.z is not 0, we can set p.x = p.y = 0 and solve for p.z
      else if (Math.abs(direction.z) > 0.00001) {
        const px = 0;
        const py = 0;
        const pz = -(planeA.d + planeA.normal.x * px + planeA.normal.y * py) / planeA.normal.z;
        point = new Vector3(px, py, pz);
      }
      else {
        // This shouldn't happen if we correctly checked for parallel planes
        return null;
      }
      
      return {
        point: point,
        direction: direction
      };
    }
    
    // Generate visual indicators for intersections
    static generateIntersectionMarkers(planeA, planeB, boundingBoxMin, boundingBoxMax) {
      const intersection = this.planePlaneIntersection(planeA, planeB);
      if (!intersection) return [];
      
      // Calculate bounding box dimensions
      const boxWidth = boundingBoxMax.x - boundingBoxMin.x;
      const boxHeight = boundingBoxMax.y - boundingBoxMin.y;
      const boxDepth = boundingBoxMax.z - boundingBoxMin.z;
      const boxSize = Math.sqrt(boxWidth * boxWidth + boxHeight * boxHeight + boxDepth * boxDepth);
      
      // Generate points along the intersection line within the bounding box
      const points = [];
      const center = new Vector3(
        (boundingBoxMin.x + boundingBoxMax.x) / 2,
        (boundingBoxMin.y + boundingBoxMax.y) / 2,
        (boundingBoxMin.z + boundingBoxMax.z) / 2
      );
      
      // Create points along the intersection line, centered at the bounding box center
      const numPoints = 10;
      const stepSize = boxSize / (numPoints - 1);
      
      for (let i = 0; i < numPoints; i++) {
        const t = (i - (numPoints - 1) / 2) * stepSize;
        const point = new Vector3(
          intersection.point.x + t * intersection.direction.x,
          intersection.point.y + t * intersection.direction.y,
          intersection.point.z + t * intersection.direction.z
        );
        
        // Check if the point is within the bounding box
        if (
          point.x >= boundingBoxMin.x && point.x <= boundingBoxMax.x &&
          point.y >= boundingBoxMin.y && point.y <= boundingBoxMax.y &&
          point.z >= boundingBoxMin.z && point.z <= boundingBoxMax.z
        ) {
          points.push(point);
        }
      }
      
      return points;
    }
  }

  // ---- Scene Graph ----
  class Object3D {
    constructor() {
      // Generate unique ID for each object
      this.id = Object3D.nextId++;
      
      this.position = new Vector3();
      this.rotation = new Vector3();
      this.scale = new Vector3(1, 1, 1);
      this.matrix = new Matrix4();
      this.worldMatrix = new Matrix4();
      this.children = [];
      this.parent = null;
      this.visible = true;
      this.type = 'Object3D';
      this.name = '';
    }
    
    // Position setters with method chaining
    setPosition(x, y, z) {
      if (arguments.length === 1 && x instanceof Vector3) {
        this.position.copy(x);
      } else {
        this.position.set(x, y, z);
      }
      return this;
    }
    
    // Rotation setters with method chaining
    setRotation(x, y, z) {
      if (arguments.length === 1 && x instanceof Vector3) {
        this.rotation.copy(x);
      } else {
        this.rotation.set(x, y, z);
      }
      return this;
    }
    
    // Scale setters with method chaining
    setScale(x, y, z) {
      if (arguments.length === 1) {
        if (x instanceof Vector3) {
          this.scale.copy(x);
        } else {
          // Single number - uniform scale
          this.scale.set(x, x, x);
        }
      } else {
        this.scale.set(x, y, z);
      }
      return this;
    }
    
    // Name setter with method chaining
    setName(name) {
      this.name = name;
      return this;
    }
    
    // Visibility setter with method chaining
    setVisible(visible) {
      this.visible = visible;
      return this;
    }
    
    // Consistent getters
    getPosition() {
      return this.position.clone();
    }
    
    getRotation() {
      return this.rotation.clone();
    }
    
    getScale() {
      return this.scale.clone();
    }
    
    getName() {
      return this.name;
    }
    
    getType() {
      return this.type;
    }
    
    isVisible() {
      return this.visible;
    }
    
    add(object) {
      if (object === this) return this;
      
      if (object.parent !== null) {
        object.parent.remove(object);
      }
      
      object.parent = this;
      this.children.push(object);
      
      return this;
    }
    
    remove(object) {
      const index = this.children.indexOf(object);
      
      if (index !== -1) {
        object.parent = null;
        this.children.splice(index, 1);
      }
      
      return this;
    }
    
    updateMatrix() {
      // Create transformation matrices
      const translation = new Matrix4().makeTranslation(
        this.position.x, 
        this.position.y, 
        this.position.z
      );
      
      const rotationX = new Matrix4().makeRotationX(this.rotation.x);
      const rotationY = new Matrix4().makeRotationY(this.rotation.y);
      const rotationZ = new Matrix4().makeRotationZ(this.rotation.z);
      
      // Combine transformations in column-major order: Rz * Rx * Ry * T
      // This is equivalent to T * Ry * Rx * Rz in row-major order
      this.matrix.identity()
        .multiply(rotationZ)
        .multiply(rotationX)
        .multiply(rotationY)
        .multiply(translation);
      
      return this;
    }
    
    updateWorldMatrix(forceUpdate = false) {
      if (this.parent === null) {
        this.updateMatrix();
        this.worldMatrix.copy(this.matrix);
      } else {
        if (forceUpdate) this.updateMatrix();
        // In column-major, multiply parent's world matrix by object's local matrix
        this.worldMatrix.copy(this.matrix).premultiply(this.parent.worldMatrix);
      }
      
      // Update children
      this.children.forEach(child => {
        child.updateWorldMatrix(forceUpdate);
      });
      
      return this;
    }
    
    // Apply a callback function to this object and all descendants
    traverse(callback) {
      callback(this);
      
      this.children.forEach(child => {
        child.traverse(callback);
      });
      
      return this;
    }
    
    // Find a child by name (return first match)
    getObjectByName(name) {
      if (this.name === name) return this;
      
      for (let i = 0; i < this.children.length; i++) {
        const found = this.children[i].getObjectByName(name);
        if (found) return found;
      }
      
      return null;
    }
    
    // Find all children of a specific type
    getObjectsByType(type) {
      const result = [];
      
      this.traverse(object => {
        if (object.type === type) {
          result.push(object);
        }
      });
      
      return result;
    }
  }

  // Static counter for unique IDs
  Object3D.nextId = 1;

  class Mesh extends Object3D {
    constructor(geometry, material) {
      super();
      this.geometry = geometry;
      
      // Handle materials
      if (Array.isArray(material)) {
        this.materials = material;
        this.material = material[0]; // Default material
      } else {
        this.material = material || new Material();
        this.materials = [this.material];
      }
      
      this.type = 'Mesh';
      this.wireframe = false;
      
      // Store materials with faces if not already assigned
      this.updateFaceMaterials();
    }
    
    setGeometry(geometry) {
      this.geometry = geometry;
      this.updateFaceMaterials();
      return this;
    }
    
    setMaterial(material) {
      if (Array.isArray(material)) {
        this.materials = material;
        this.material = material[0];
      } else {
        this.material = material;
        this.materials = [material];
      }
      this.updateFaceMaterials();
      return this;
    }
    
    // Assign materials to faces if not already assigned
    updateFaceMaterials() {
      if (!this.geometry || !this.geometry.faces) return this;
      
      for (let i = 0; i < this.geometry.faces.length; i++) {
        const face = this.geometry.faces[i];
        
        // If face doesn't have a material, assign one
        if (!face.material) {
          // If we have multiple materials, assign based on face index
          if (this.materials.length > 1) {
            const materialIndex = i % this.materials.length;
            face.material = this.materials[materialIndex];
          } else {
            face.material = this.material;
          }
        }
      }
      
      return this;
    }
    
    setWireframe(wireframe) {
      this.wireframe = wireframe;
      return this;
    }
    
    // Factory methods to create basic shapes
    static createBox(width = 1, height = 1, depth = 1, material) {
      const geometry = Geometry.createBox(width, height, depth);
      return new Mesh(geometry, material);
    }
    
    static createSphere(radius = 1, widthSegments = 16, heightSegments = 12, material) {
      const geometry = Geometry.createSphere(radius, widthSegments, heightSegments);
      return new Mesh(geometry, material);
    }
    
    static createPlane(width = 1, height = 1, widthSegments = 1, heightSegments = 1, material) {
      const geometry = Geometry.createPlane(width, height, widthSegments, heightSegments);
      return new Mesh(geometry, material);
    }
  }

  // Scene - Root container
  class Scene extends Object3D {
    constructor() {
      super();
      this.background = '#000000';
      this.type = 'Scene';
    }
  }

  // ---- Camera Classes ----
  /**
   * The base ProjectionMode class - defines the interface for all projection modes
   */
  class ProjectionMode {
    constructor(camera) {
      this.camera = camera;
    }
    
    updateProjectionMatrix() {
      // Base implementation to be overridden
      console.warn("ProjectionMode.updateProjectionMatrix() not implemented");
      return this;
    }
    
    get type() {
      return 'base';
    }
  }

  /**
   * MatrixProjection - Core implementation of different projection types
   * 
   * This class provides a unified approach to creating different types of
   * projection matrices (perspective, orthographic, oblique) with consistent
   * behavior. It handles frustum calculation and matrix construction for
   * all projection types.
   */
  class MatrixProjection {
    /**
     * Create a new MatrixProjection
     * 
     * @param {Camera} camera - The camera this projection belongs to
     * @param {Object} options - Configuration options
     * @param {string} [options.type='perspective'] - Projection type ('perspective', 'orthographic', 'oblique')
     * @param {number} [options.near=0.1] - Near clipping plane
     * @param {number} [options.far=2000] - Far clipping plane
     * @param {number} [options.fov=50] - Field of view in degrees (perspective mode)
     * @param {number} [options.aspect=1] - Aspect ratio (perspective mode)
     * @param {number} [options.zoom=1] - Zoom factor (orthographic mode)
     * @param {Object} [options.obliqueAngle={x:45,y:45}] - Oblique projection angles (oblique mode)
     */
    constructor(camera, options = {}) {
      this.camera = camera;
      
      // Core configuration options
      this.config = {
        // Projection type
        type: options.type || 'perspective', // 'perspective', 'orthographic', 'oblique'
        
        // Common parameters
        near: options.near !== undefined ? options.near : 0.1,
        far: options.far !== undefined ? options.far : 2000,
        
        // Perspective-specific parameters
        fov: options.fov || 50,              // Field of view (degrees)
        aspect: options.aspect || 1,         // Aspect ratio
        
        // Orthographic-specific parameters
        zoom: options.zoom !== undefined ? options.zoom : 1,
        
        // Oblique projection parameters
        obliqueAngle: options.obliqueAngle || { x: 45, y: 45 }, // in degrees
      };
      
      // Internal calculated values
      this._frustum = {
        left: 0, right: 0, top: 0, bottom: 0
      };
      
      // Initialize
      this._updateFrustum();
    }
    
    /**
     * Update the frustum dimensions based on current settings
     * @private
     */
    _updateFrustum() {
      const c = this.config;
      const f = this._frustum;
      
      if (c.type === 'perspective' || c.type === 'oblique') {
        // Calculate frustum based on FOV
        const tanHalfFov = Math.tan((c.fov * Math.PI / 180) / 2);
        f.top = c.near * tanHalfFov;
        f.bottom = -f.top;
        f.right = f.top * c.aspect;
        f.left = -f.right;
      } 
      else { // orthographic
        // Calculate orthographic frustum with consistent sizing
        // Base size of 10 units at zoom=1
        const baseSize = 10; 
        
        // Calculate dimensions with zoom applied
        const size = baseSize / c.zoom;
        
        // Apply aspect ratio
        if (c.aspect >= 1) {
          // Landscape
          f.right = size * c.aspect / 2;
          f.left = -f.right;
          f.top = size / 2;
          f.bottom = -f.top;
        } else {
          // Portrait
          f.right = size / 2;
          f.left = -f.right;
          f.top = size / c.aspect / 2;
          f.bottom = -f.top;
        }
      }
    }
    
    /**
     * Update the projection matrix
     * 
     * This method calculates the appropriate projection matrix
     * based on the current projection type and parameters.
     * 
     * @returns {MatrixProjection} The projection instance for method chaining
     */
    updateProjectionMatrix() {
      // Make sure frustum is up to date
      this._updateFrustum();
      
      const c = this.config;
      const f = this._frustum;
      
      // Create the appropriate matrix based on projection type
      if (c.type === 'perspective') {
        this._makePerspectiveMatrix(f.left, f.right, f.top, f.bottom, c.near, c.far);
      } 
      else if (c.type === 'orthographic') {
        this._makeOrthographicMatrix(f.left, f.right, f.top, f.bottom, c.near, c.far);
      }
      else if (c.type === 'oblique') {
        // For oblique, start with orthographic and then apply oblique shear
        this._makeOrthographicMatrix(f.left, f.right, f.top, f.bottom, c.near, c.far);
        this._applyObliqueProjection(c.obliqueAngle.x, c.obliqueAngle.y);
      }
      
      return this;
    }
    
    /**
     * Create a perspective projection matrix
     * @private
     */
    _makePerspectiveMatrix(left, right, top, bottom, near, far) {
      const te = this.camera.projectionMatrix.elements;
      
      const x = 2 * near / (right - left);
      const y = 2 * near / (top - bottom);
      
      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);
      const c = -(far + near) / (far - near);
      const d = -2 * far * near / (far - near);
      
      te[0] = x;    te[4] = 0;    te[8] = a;     te[12] = 0;
      te[1] = 0;    te[5] = y;    te[9] = b;     te[13] = 0;
      te[2] = 0;    te[6] = 0;    te[10] = c;    te[14] = d;
      te[3] = 0;    te[7] = 0;    te[11] = -1;   te[15] = 0;
    }
    
    /**
     * Create an orthographic projection matrix
     * @private
     */
    _makeOrthographicMatrix(left, right, top, bottom, near, far) {
      const te = this.camera.projectionMatrix.elements;
      
      const w = 1.0 / (right - left);
      const h = 1.0 / (top - bottom);
      const p = 1.0 / (far - near);
      
      // Fix for the orthographic projection:
      // Flip both X and Y scaling to match the perspective handedness convention
      // This ensures consistent coordinate system between projection modes
      
      te[0] = -2 * w;  te[4] = 0;       te[8] = 0;        te[12] = (right + left) * w;
      te[1] = 0;       te[5] = -2 * h;  te[9] = 0;        te[13] = (top + bottom) * h;
      te[2] = 0;       te[6] = 0;       te[10] = -1 * p;  te[14] = -(far + near) * p / 2;
      te[3] = 0;       te[7] = 0;       te[11] = 0;       te[15] = 1;
    }
    
    /**
     * Apply oblique projection modification to the matrix
     * 
     * This transforms an orthographic projection into an oblique projection
     * by applying shearing factors based on specified angles.
     * 
     * @param {number} angleX - X-axis shear angle in degrees
     * @param {number} angleY - Y-axis shear angle in degrees
     * @private
     */
    _applyObliqueProjection(angleX, angleY) {
      const te = this.camera.projectionMatrix.elements;
      
      // Convert angles from degrees to radians
      const radX = angleX * Math.PI / 180;
      const radY = angleY * Math.PI / 180;
      
      // Calculate oblique factors
      const cotX = 1 / Math.tan(radX);
      const cotY = 1 / Math.tan(radY);
      
      // Apply to the projection matrix
      te[8] = cotX;
      te[9] = cotY;
    }
    
    /**
     * Apply a preset configuration
     * 
     * This method provides easy access to common projection configurations.
     * 
     * Available presets:
     * - standard: Default perspective projection
     * - wide: Wide-angle perspective (75° FOV)
     * - narrow: Narrow perspective (25° FOV)
     * - ortho: Standard orthographic projection
     * - isometric: True isometric projection (equal angles)
     * - dimetric: Dimetric projection (unequal angles)
     * - cabinet: Cabinet projection (45° elevation)
     * 
     * @param {string} name - Name of the preset to apply
     * @returns {MatrixProjection} The projection instance for method chaining
     * 
     * @example
     * // Apply isometric projection
     * camera.perspective.setPreset('isometric');
     * camera.updateProjectionMatrix();
     */
    setPreset(name) {
      switch (name) {
        case 'standard':
          this.config.type = 'perspective';
          this.config.fov = 50;
          this.config.near = 0.1;
          this.config.far = 2000;
          break;
          
        case 'wide':
          this.config.type = 'perspective';
          this.config.fov = 75;
          break;
          
        case 'narrow':
          this.config.type = 'perspective';
          this.config.fov = 25; // Telephoto-like narrow FOV
          break;
          
        case 'ortho':
          this.config.type = 'orthographic';
          this.config.zoom = 1;
          break;
          
        case 'isometric':
          this.config.type = 'oblique';
          this.config.obliqueAngle = { x: 45, y: 35.264 }; // True isometric angles
          break;
          
        case 'dimetric':
          this.config.type = 'oblique';
          this.config.obliqueAngle = { x: 45, y: 30 };
          break;
          
        case 'cabinet':
          this.config.type = 'oblique';
          this.config.obliqueAngle = { x: 63.4, y: 45 }; // Cabinet projection
          break;
          
        default:
          console.warn(`Unknown preset: ${name}. Using 'standard' instead.`);
          this.setPreset('standard');
      }
      
      this._updateFrustum();
      return this;
    }
  }

  class PerspectiveProjection extends ProjectionMode {
    constructor(camera, fov = 50, aspect = 1, near = 0.1, far = 2000) {
      super(camera);
      this.fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
    }
    
    updateProjectionMatrix() {
      // Convert FOV from degrees to radians
      const fovRad = this.fov * (Math.PI / 180);
      
      // Create the perspective projection matrix
      this.camera.projectionMatrix.makePerspective(
        fovRad, 
        this.aspect || this.camera.aspect, 
        this.near, 
        this.far
      );
      
      return this;
    }
    
    get type() {
      return 'perspective';
    }
  }

  class OrthographicProjection extends ProjectionMode {
    constructor(camera, left = -10, right = 10, top = 10, bottom = -10, near = 0.1, far = 2000) {
      super(camera);
      this.left = left;
      this.right = right;
      this.top = top;
      this.bottom = bottom;
      this.near = near;
      this.far = far;
      this.zoom = 1;
    }
    
    updateProjectionMatrix() {
      const dx = (this.right - this.left) / (2 * this.zoom);
      const dy = (this.top - this.bottom) / (2 * this.zoom);
      const cx = (this.right + this.left) / 2;
      const cy = (this.top + this.bottom) / 2;
      
      let left = cx - dx;
      let right = cx + dx;
      let top = cy + dy;
      let bottom = cy - dy;
      
      // In OpenGL/WebGL column-major format, the orthographic matrix has this structure:
      // 2/(r-l)      0            0           -(r+l)/(r-l)
      //    0      2/(t-b)         0           -(t+b)/(t-b)
      //    0         0        -2/(f-n)        -(f+n)/(f-n)
      //    0         0            0                 1
      
      const w = 1.0 / (right - left);
      const h = 1.0 / (top - bottom);
      const p = 1.0 / (this.far - this.near);
      
      // Calculate matrix elements
      const te = this.camera.projectionMatrix.elements;
      
      // Fixed orthographic projection with both X and Y flipping for consistent handedness
      te[0] = -2 * w;  te[4] = 0;       te[8] = 0;        te[12] = (right + left) * w;
      te[1] = 0;       te[5] = -2 * h;  te[9] = 0;        te[13] = (top + bottom) * h;
      te[2] = 0;       te[6] = 0;       te[10] = -1 * p;  te[14] = -(this.far + this.near) * p / 2;
      te[3] = 0;       te[7] = 0;       te[11] = 0;       te[15] = 1;
      
      return this;
    }
    
    setSize(width, height) {
      const aspect = width / height;
      
      if (aspect > 1) {
        // Landscape
        this.left = -10 * aspect;
        this.right = 10 * aspect;
        this.top = 10;
        this.bottom = -10;
      } else {
        // Portrait
        this.left = -10;
        this.right = 10;
        this.top = 10 / aspect;
        this.bottom = -10 / aspect;
      }
      
      return this;
    }
    
    get type() {
      return 'orthographic';
    }
  }

  /**
   * Camera class for 3D rendering
   * 
   * The Camera class provides a unified API for creating and controlling cameras in a 3D scene.
   * It supports multiple projection modes including perspective and orthographic projection,
   * and provides methods for configuring camera properties, positioning, and orientation.
   * 
   * Key features:
   * - Multiple projection modes (perspective, orthographic)
   * - Matrix-based projection for consistent rendering
   * - Fluent API with method chaining
   * - Scene-graph integration through Object3D inheritance
   * 
   * The camera uses a matrix-based projection system that provides consistent results
   * across different projection modes, making it easy to switch between modes while
   * maintaining the visible area of the scene.
   * 
   * @extends Object3D
   */
  class Camera extends Object3D {
    /**
     * Create a new Camera
     * @param {string} initialMode - Initial projection mode ('perspective' or 'orthographic')
     */
    constructor(initialMode = 'perspective') {
      super();
      this.viewMatrix = new Matrix4();
      this.projectionMatrix = new Matrix4();
      this.viewProjectionMatrix = new Matrix4();
      this.aspect = 1;
      
      // Create registry for all modes (built-in and custom)
      this.projectionModes = {};
      
      // Create and register built-in modes using MatrixProjection
      this.perspective = new MatrixProjection(this, {
        type: 'perspective',
        fov: 50,
        aspect: 1,
        near: 0.1,
        far: 2000
      });
      
      this.orthographic = new MatrixProjection(this, {
        type: 'orthographic',
        left: -10,
        right: 10,
        top: 10,
        bottom: -10,
        near: 0.1,
        far: 2000,
        zoom: 1
      });
      
      // Register the built-in modes
      this.registerProjectionMode('perspective', this.perspective);
      this.registerProjectionMode('orthographic', this.orthographic);
      
      // Set initial mode
      this.setProjectionMode(initialMode);
    }
    
    /**
     * Configure camera for a specific viewport
     * 
     * This method sets up both perspective and orthographic projections
     * in a single call, making it easy to initialize the camera.
     * 
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     * @param {number} fov - Field of view in degrees (for perspective mode)
     * @param {number} near - Near clipping plane
     * @param {number} far - Far clipping plane
     * @param {number} zoom - Zoom factor (for orthographic mode)
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Initialize camera for a 800x600 viewport
     * camera.setupForViewport(800, 600, 45, 0.1, 100, 1.0);
     */
    setupForViewport(width, height, fov = 45, near = 0.1, far = 100, zoom = 1) {
      const aspect = width / height;
      
      // Configure perspective
      this.setPerspectiveParameters(fov, aspect, near, far);
      
      // Configure orthographic
      // Set basic ortho parameters
      this.orthographic.config.near = near;
      this.orthographic.config.far = far;
      this.orthographic.config.zoom = zoom;
      
      // Calculate orthographic bounds based on aspect ratio
      this.setOrthographicSize(width, height);
      
      // Update all matrices
      this.updateAll();
      
      return this;
    }
    
    /**
     * Update all camera matrices in the correct order
     * 
     * This method updates local, world, view, and projection matrices,
     * ensuring that all transformations are correctly applied.
     * 
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Update all camera matrices after changing position
     * camera.position.set(0, 10, 20);
     * camera.updateAll();
     */
    updateAll() {
      this.updateMatrix();
      this.updateWorldMatrix();
      this.updateViewMatrix();
      this.updateProjectionMatrix();
      return this;
    }
    
    /**
     * Set the field of view for perspective projection
     * @param {number} fov - Field of view in degrees
     * @returns {Camera} The camera instance for method chaining
     */
    setFov(fov) {
      this.perspective.config.fov = fov;
      if (this.activeMode === this.perspective) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set aspect ratio for perspective projection
     * @param {number} aspect - Aspect ratio (width/height)
     * @returns {Camera} The camera instance for method chaining
     */
    setAspect(aspect) {
      this.aspect = aspect;
      this.perspective.config.aspect = aspect;
      if (this.activeMode === this.perspective) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set near clipping plane distance
     * 
     * The near clipping plane defines where rendering begins in the scene.
     * Objects closer to the camera than this distance will be clipped.
     * 
     * @param {number} near - Near clipping plane distance
     * @returns {Camera} The camera instance for method chaining
     */
    setNear(near) {
      this.activeMode.config.near = near;
      this.updateProjectionMatrix();
      return this;
    }
    
    /**
     * Set far clipping plane distance
     * 
     * The far clipping plane defines the maximum render distance.
     * Objects farther from the camera than this distance will be clipped.
     * 
     * @param {number} far - Far clipping plane distance
     * @returns {Camera} The camera instance for method chaining
     */
    setFar(far) {
      this.activeMode.config.far = far;
      this.updateProjectionMatrix();
      return this;
    }
    
    /**
     * Set zoom factor for orthographic projection
     * 
     * Higher zoom values make objects appear larger in orthographic mode.
     * 
     * @param {number} zoom - Zoom factor (1.0 is normal scale)
     * @returns {Camera} The camera instance for method chaining
     */
    setZoom(zoom) {
      this.orthographic.config.zoom = zoom;
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set orthographic frustum boundaries directly
     * 
     * This method allows direct control over the orthographic view volume.
     * 
     * @param {number} left - Left boundary
     * @param {number} right - Right boundary
     * @param {number} top - Top boundary
     * @param {number} bottom - Bottom boundary
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicFrustum(left, right, top, bottom) {
      this.orthographic.config.left = left;
      this.orthographic.config.right = right;
      this.orthographic.config.top = top;
      this.orthographic.config.bottom = bottom;
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Set orthographic size based on viewport dimensions
     * 
     * This automatically calculates appropriate orthographic bounds
     * to match the given aspect ratio.
     * 
     * @param {number} width - Viewport width
     * @param {number} height - Viewport height
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicSize(width, height) {
      const aspect = width / height;
      this.orthographic.config.aspect = aspect;
      
      // The frustum will be calculated in MatrixProjection._updateFrustum
      // This automatically handles the aspect ratio adjustment
      
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Configure all perspective projection parameters
     * 
     * @param {number} fov - Field of view in degrees
     * @param {number} aspect - Aspect ratio (width/height)
     * @param {number} near - Near clipping plane distance
     * @param {number} far - Far clipping plane distance
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Set up perspective with 60° FOV
     * camera.setPerspectiveParameters(60, window.innerWidth/window.innerHeight, 0.1, 1000);
     */
    setPerspectiveParameters(fov, aspect, near, far) {
      this.perspective.config.fov = fov;
      this.perspective.config.aspect = aspect;
      this.perspective.config.near = near;
      this.perspective.config.far = far;
      this.aspect = aspect;
      if (this.activeMode === this.perspective) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Configure all orthographic projection parameters
     * 
     * @param {number} left - Left boundary
     * @param {number} right - Right boundary
     * @param {number} top - Top boundary
     * @param {number} bottom - Bottom boundary
     * @param {number} near - Near clipping plane distance
     * @param {number} far - Far clipping plane distance
     * @param {number} zoom - Zoom factor (1.0 is normal scale)
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicParameters(left, right, top, bottom, near, far, zoom = 1) {
      this.orthographic.config.left = left;
      this.orthographic.config.right = right;
      this.orthographic.config.top = top;
      this.orthographic.config.bottom = bottom;
      this.orthographic.config.near = near;
      this.orthographic.config.far = far;
      this.orthographic.config.zoom = zoom;
      if (this.activeMode === this.orthographic) {
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Get the current projection mode
     * @returns {string} The current projection mode ('perspective' or 'orthographic')
     */
    getProjectionMode() {
      return this.activeMode ? this.activeMode.config.type : null;
    }
    
    /**
     * Get all camera parameters for the current mode
     * @returns {Object} Camera parameters object
     */
    getParameters() {
      const common = {
        mode: this.getProjectionMode(),
        position: this.position.clone(),
        near: this.activeMode.config.near,
        far: this.activeMode.config.far
      };
      
      if (this.activeMode === this.perspective) {
        return {
          ...common,
          fov: this.perspective.config.fov,
          aspect: this.perspective.config.aspect
        };
      } else if (this.activeMode === this.orthographic) {
        return {
          ...common,
          left: this.orthographic.config.left,
          right: this.orthographic.config.right,
          top: this.orthographic.config.top,
          bottom: this.orthographic.config.bottom,
          zoom: this.orthographic.config.zoom
        };
      }
      
      return common;
    }
    
    /**
     * Register a new projection mode
     * 
     * This allows extending the camera with custom projection modes.
     * 
     * @param {string} name - Name of the projection mode
     * @param {Object} mode - Projection mode implementation
     * @returns {Camera} The camera instance for method chaining
     */
    registerProjectionMode(name, mode) {
      this.projectionModes[name] = mode;
      return this;
    }
    
    /**
     * Switch to a specific projection mode
     * 
     * @param {string} name - Name of the projection mode to use
     * @returns {Camera} The camera instance for method chaining
     */
    setProjectionMode(name) {
      if (this.projectionModes[name]) {
        this.activeMode = this.projectionModes[name];
        this.isOrthographic = (name === 'orthographic');
        this.updateProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Switch to perspective projection mode
     * @returns {Camera} The camera instance for method chaining
     */
    setPerspectiveMode() {
      return this.setProjectionMode('perspective');
    }
    
    /**
     * Switch to orthographic projection mode
     * @returns {Camera} The camera instance for method chaining
     */
    setOrthographicMode() {
      return this.setProjectionMode('orthographic');
    }
    
    /**
     * Update the projection matrix
     * 
     * This updates the projection matrix based on the current
     * projection mode and its parameters.
     * 
     * @returns {Camera} The camera instance for method chaining
     */
    updateProjectionMatrix() {
      if (this.activeMode) {
        this.activeMode.updateProjectionMatrix();
        this.updateViewProjectionMatrix();
      }
      return this;
    }
    
    /**
     * Update the view matrix
     * @returns {Camera} The camera instance for method chaining
     */
    updateViewMatrix() {
      // Called by the renderer or OrbitController
      return this;
    }
    
    /**
     * Make the camera look at a specific target point
     * 
     * This points the camera at the target and computes
     * the appropriate view matrix.
     * 
     * @param {Vector3} target - The point to look at
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Make camera look at the origin
     * camera.lookAt(new Vector3(0, 0, 0));
     */
    lookAt(target) {
      // Calculate direction from camera to target
      const lookDir = new Vector3().copy(target).sub(this.position).normalize();
      
      // Calculate right vector as cross product of world up and look direction
      const worldUp = new Vector3(0, 1, 0);
      const right = new Vector3().copy(worldUp).cross(lookDir).normalize();
      
      // Calculate camera up vector as cross product of look direction and right
      const up = new Vector3().copy(lookDir).cross(right).normalize();
      
      // Set the view matrix in column-major format
      this.viewMatrix.set(
        right.x, right.y, right.z, 0,
        up.x, up.y, up.z, 0,
        lookDir.x, lookDir.y, lookDir.z, 0,
        0, 0, 0, 1
      );
      
      // Apply translation component
      const te = this.viewMatrix.elements;
      te[12] = -right.dot(this.position);
      te[13] = -up.dot(this.position);
      te[14] = -lookDir.dot(this.position);
      
      // Update the combined view-projection matrix
      this.updateViewProjectionMatrix();
      
      return this;
    }
    
    /**
     * Position camera in an orbit around a target point
     * 
     * This method places the camera at a specific spherical position
     * relative to the target point and ensures the camera is looking
     * at the target.
     * 
     * @param {Vector3} target - The point to orbit around
     * @param {number} distance - Distance from target
     * @param {number} phi - Vertical angle in radians (0 = top, π = bottom)
     * @param {number} theta - Horizontal angle in radians (0 = front)
     * @returns {Camera} The camera instance for method chaining
     * 
     * @example
     * // Position camera at 45° angles looking at origin
     * const target = new Vector3(0, 0, 0);
     * camera.orbit(target, 10, Math.PI/4, Math.PI/4);
     */
    orbit(target, distance, phi, theta) {
      // Calculate position in spherical coordinates
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      // Calculate position in spherical coordinates relative to target
      this.position.x = target.x + distance * sinPhi * sinTheta;
      this.position.y = target.y + distance * cosPhi;
      this.position.z = target.z + distance * sinPhi * cosTheta;
      
      // Make the camera look at the target
      this.lookAt(target);
      
      return this;
    }
    
    /**
     * Update the combined view-projection matrix
     * 
     * This combines the view and projection matrices to create
     * the final transformation matrix for rendering.
     * 
     * @returns {Camera} The camera instance for method chaining
     */
    updateViewProjectionMatrix() {
      // Combine view and projection matrices
      this.viewProjectionMatrix.copy(this.projectionMatrix).multiply(this.viewMatrix);
      return this;
    }
  }

  /**
   * ViewCamera - Extended camera with standard views support
   * 
   * The ViewCamera extends the base Camera with predefined views
   * and provides an API for managing and switching between these views.
   * 
   * Predefined views include:
   * - front, back, top, bottom, left, right
   * - user (customizable)
   * 
   * @extends Camera
   */
  class ViewCamera extends Camera {
    /**
     * Create a new ViewCamera
     * @param {string} initialMode - Initial projection mode ('perspective' or 'orthographic')
     */
    constructor(initialMode = 'perspective') {
      super(initialMode);
      
      // Define standard views (phi = vertical angle, theta = horizontal angle)
      this.views = {
        front: { phi: Math.PI/2, theta: 0 },
        back: { phi: Math.PI/2, theta: Math.PI },
        top: { phi: 0, theta: 0 },
        bottom: { phi: Math.PI, theta: 0 },
        left: { phi: Math.PI/2, theta: Math.PI/2 },
        right: { phi: Math.PI/2, theta: -Math.PI/2 },
        user: { phi: Math.PI/4, theta: Math.PI/4 } // Default user view
      };
      
      // Event system for view changes
      this.onViewChange = null; // Callback for view changes
      this.currentView = 'user'; // Track current view name
    }
    
    /**
     * Set camera to a predefined view
     * 
     * @param {string} viewName - Name of the predefined view
     * @returns {ViewCamera} The camera instance for method chaining
     * 
     * @example
     * // Set to top view
     * camera.setView('top');
     */
    setView(viewName) {
      if (!this.views[viewName]) {
        console.warn(`View "${viewName}" not found`);
        return this;
      }
      
      this.currentView = viewName;
      
      // Trigger event with view data
      if (typeof this.onViewChange === 'function') {
        this.onViewChange(viewName, this.views[viewName]);
      }
      
      return this;
    }
    
    /**
     * Save current angles as user view
     * 
     * @param {number} phi - Vertical angle in radians
     * @param {number} theta - Horizontal angle in radians
     * @returns {ViewCamera} The camera instance for method chaining
     */
    saveUserView(phi, theta) {
      this.views.user = { phi, theta };
      return this;
    }
    
    /**
     * Register a callback for view changes
     * 
     * @param {Function} callback - Function to call when view changes
     * @returns {ViewCamera} The camera instance for method chaining
     */
    registerViewChangeCallback(callback) {
      if (typeof callback === 'function') {
        this.onViewChange = callback;
      }
      return this;
    }
    
    /**
     * Add a custom view
     * 
     * @param {string} name - Name of the view
     * @param {number} phi - Vertical angle in radians
     * @param {number} theta - Horizontal angle in radians
     * @returns {ViewCamera} The camera instance for method chaining
     * 
     * @example
     * // Add a custom 3/4 view
     * camera.addView('threeQuarter', Math.PI/4, Math.PI/4);
     */
    addView(name, phi, theta) {
      if (typeof name !== 'string' || name.trim() === '') {
        console.warn('Invalid view name');
        return this;
      }
      
      this.views[name] = { phi, theta };
      return this;
    }
    
    /**
     * Remove a custom view
     * 
     * @param {string} name - Name of the view to remove
     * @returns {ViewCamera} The camera instance for method chaining
     */
    removeView(name) {
      // Don't allow removing standard views
      const standardViews = ['front', 'back', 'top', 'bottom', 'left', 'right', 'user'];
      if (standardViews.includes(name)) {
        console.warn(`Cannot remove standard view: ${name}`);
        return this;
      }
      
      delete this.views[name];
      return this;
    }
    
    /**
     * Get the name of the current view
     * @returns {string} Name of the current view
     */
    getCurrentView() {
      return this.currentView;
    }
    
    /**
     * Get list of all available views
     * @returns {string[]} Array of view names
     */
    getAvailableViews() {
      return Object.keys(this.views);
    }
  }

  // ---- Material ----
  class Texture {
    constructor(options = {}) {
      this.image = options.image || null;
      this.url = options.url || null;
      this.color = options.color || '#FFFFFF';
      this.loaded = false;
      this.repeat = options.repeat || { x: 1, y: 1 };
      this.offset = options.offset || { x: 0, y: 0 };
      this.rotation = options.rotation || 0;
      this.flipY = options.flipY !== undefined ? options.flipY : true;
      this.onLoad = options.onLoad || null;
      this.onError = options.onError || null;
      this.mipmaps = []; // Storage for mipmap levels
      
      // Load image if URL is provided
      if (this.url) {
        this.load(this.url);
      } else if (this.image) {
        this.loaded = true;
        // Generate mipmaps if requested
        if (options.generateMipmaps) {
          this.generateMipmap();
        }
      }
    }
    
    load(url) {
      this.url = url;
      this.loaded = false;
      
      const image = new Image();
      image.crossOrigin = "Anonymous";
      
      image.onload = () => {
        this.image = image;
        this.loaded = true;
        
        // Generate mipmaps when the image loads
        this.generateMipmap();
        
        if (this.onLoad) this.onLoad(this);
      };
      
      image.onerror = (err) => {
        console.error(`Failed to load texture: ${url}`, err);
        if (this.onError) this.onError(err);
      };
      
      image.src = url;
      return this;
    }
    
    // Generate mipmaps for the texture
    generateMipmap() {
      if (!this.image || !this.loaded) return;
      
      this.mipmaps = [];
      let size = Math.max(this.image.width, this.image.height);
      
      // Generate scaled versions
      while (size > 8) { // Don't go smaller than 8x8
        size = Math.floor(size / 2);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // Maintain aspect ratio
        const aspectRatio = this.image.width / this.image.height;
        let drawWidth = size;
        let drawHeight = size;
        
        if (aspectRatio > 1) {
          // Image is wider than tall
          drawHeight = size / aspectRatio;
        } else {
          // Image is taller than wide
          drawWidth = size * aspectRatio;
        }
        
        // Draw the image scaled down
        ctx.drawImage(this.image, 0, 0, drawWidth, drawHeight);
        
        const mipImage = new Image();
        mipImage.src = canvas.toDataURL();
        this.mipmaps.push(mipImage);
      }
      
      return this;
    }
    
    setRepeat(x, y) {
      this.repeat.x = x;
      this.repeat.y = y;
      return this;
    }
    
    setOffset(x, y) {
      this.offset.x = x;
      this.offset.y = y;
      return this;
    }
    
    setRotation(angle) {
      this.rotation = angle;
      return this;
    }
    
    setFlipY(flip) {
      this.flipY = flip;
      return this;
    }
    
    clone() {
      return new Texture({
        image: this.image,
        url: this.url,
        color: this.color,
        repeat: { x: this.repeat.x, y: this.repeat.y },
        offset: { x: this.offset.x, y: this.offset.y },
        rotation: this.rotation,
        flipY: this.flipY
      });
    }
    
    // Create a texture from a color (useful fallback)
    static fromColor(color) {
      return new Texture({ color });
    }
    
    // Create a texture from a URL
    static fromURL(url, onLoad, onError) {
      return new Texture({ url, onLoad, onError });
    }
    
    // Create a texture from an image element
    static fromImage(image, generateMipmaps = true) {
      return new Texture({ image, generateMipmaps });
    }
    
    // Create a checkerboard pattern (useful for testing)
    static createCheckerboard(size = 64, color1 = '#FFFFFF', color2 = '#000000') {
      const canvas = document.createElement('canvas');
      canvas.width = size * 2;
      canvas.height = size * 2;
      
      const ctx = canvas.getContext('2d');
      
      // Draw checkerboard
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = color2;
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          if ((x + y) % 2 === 0) {
            ctx.fillRect(x * size, y * size, size, size);
          }
        }
      }
      
      // Create image from canvas
      const image = new Image();
      image.src = canvas.toDataURL();
      
      const texture = new Texture({ image });
      texture.generateMipmap(); // Generate mipmaps for the checkerboard
      return texture;
    }
  }

  class Material {
    constructor(options = {}) {
      // Handle both traditional constructor style (color, opacity)
      // and options object style
      if (typeof options === 'string') {
        // Old style: first argument is color
        this.color = options;
        this.opacity = arguments[1] !== undefined ? arguments[1] : 1.0;
        options = {};
      } else {
        // New style: options object
        this.color = options.color || '#FFFFFF';
        this.opacity = options.opacity !== undefined ? options.opacity : 1.0;
      }
      
      // Basic properties
      this.wireframe = options.wireframe || false;
      this.transparent = this.opacity < 1.0;
      this.side = options.side || 'front'; // 'front', 'back', 'double'
      
      // Texture maps
      this.map = options.map || null;         // Color/diffuse map
      this.normalMap = options.normalMap || null;   // Normal map
      this.specularMap = options.specularMap || null; // Specular map
      this.alphaMap = options.alphaMap || null;    // Alpha/transparency map
      
      // Lighting properties
      this.shading = options.shading || 'flat';  // 'flat', 'smooth', 'phong'
      this.shininess = options.shininess || 30;
      this.specular = options.specular || '#111111';
      this.emissive = options.emissive || '#000000';
      
      // Advanced rendering options
      this.blending = options.blending || 'normal'; // 'normal', 'additive', 'multiply'
      this.fog = options.fog !== undefined ? options.fog : true;
    }
    
    setColor(color) {
      this.color = color;
      return this;
    }
    
    setOpacity(value) {
      this.opacity = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
      this.transparent = this.opacity < 1.0;
      return this;
    }
    
    setWireframe(wireframe) {
      this.wireframe = wireframe;
      return this;
    }
    
    setSide(side) {
      if (['front', 'back', 'double'].includes(side)) {
        this.side = side;
      }
      return this;
    }
    
    // Texture setters
    setMap(texture) {
      this.map = texture;
      return this;
    }
    
    setNormalMap(texture) {
      this.normalMap = texture;
      return this;
    }
    
    setSpecularMap(texture) {
      this.specularMap = texture;
      return this;
    }
    
    setAlphaMap(texture) {
      this.alphaMap = texture;
      return this;
    }
    
    // Lighting property setters
    setShading(shading) {
      if (['flat', 'smooth', 'phong'].includes(shading)) {
        this.shading = shading;
      }
      return this;
    }
    
    setShininess(shininess) {
      this.shininess = shininess;
      return this;
    }
    
    setSpecular(color) {
      this.specular = color;
      return this;
    }
    
    setEmissive(color) {
      this.emissive = color;
      return this;
    }
    
    // Advanced options
    setBlending(blending) {
      if (['normal', 'additive', 'multiply'].includes(blending)) {
        this.blending = blending;
      }
      return this;
    }
    
    setFog(fog) {
      this.fog = fog;
      return this;
    }
    
    // Clone the material
    clone() {
      const newMaterial = new Material({
        color: this.color,
        opacity: this.opacity,
        wireframe: this.wireframe,
        side: this.side,
        shading: this.shading,
        shininess: this.shininess,
        specular: this.specular,
        emissive: this.emissive,
        blending: this.blending,
        fog: this.fog
      });
      
      // Clone textures if they exist
      if (this.map) newMaterial.map = this.map.clone();
      if (this.normalMap) newMaterial.normalMap = this.normalMap.clone();
      if (this.specularMap) newMaterial.specularMap = this.specularMap.clone();
      if (this.alphaMap) newMaterial.alphaMap = this.alphaMap.clone();
      
      return newMaterial;
    }
    
    // Create a basic material
    static basic(color, opacity = 1.0) {
      return new Material({
        color,
        opacity,
        shading: 'flat'
      });
    }
    
    // Create a phong material
    static phong(color, options = {}) {
      return new Material({
        color,
        opacity: options.opacity || 1.0,
        shininess: options.shininess || 30,
        specular: options.specular || '#FFFFFF',
        shading: 'phong'
      });
    }
    
    // Create a wireframe material
    static wireframe(color = '#000000', opacity = 1.0) {
      return new Material({
        color,
        opacity,
        wireframe: true
      });
    }
    
    // Create a textured material
    static textured(textureUrl, options = {}) {
      const material = new Material({
        color: '#FFFFFF',
        opacity: options.opacity || 1.0,
        shading: options.shading || 'flat'
      });
      
      // Create and set the texture
      const texture = Texture.fromURL(textureUrl);
      material.setMap(texture);
      
      return material;
    }
  }

  // ---- Geometry ----
  class Face {
    constructor(a, b, c, normal = new Vector3(), material = null) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.normal = normal;
      this.material = material;
      this.depth = 0; // Will be calculated during rendering
      
      // Indices for UVs and normals (defaults to vertex indices if not specified)
      this.uv = [a, b, c];
      this.normalIndex = [a, b, c];
    }
    
    calculateDepth(vertices) {
      const za = vertices[this.a].z;
      const zb = vertices[this.b].z;
      const zc = vertices[this.c].z;
      // Depth for painter's algorithm sorting
      this.depth = (za + zb + zc) / 3;
      return this;
    }
    
    // Set UV indices explicitly
    setUV(a, b, c) {
      this.uv = [a, b, c];
      return this;
    }
    
    // Set normal indices explicitly
    setNormals(a, b, c) {
      this.normalIndex = [a, b, c];
      return this;
    }
  }

  class Geometry {
    constructor() {
      this.vertices = [];
      this.normals = [];
      this.uvs = [];
      this.faces = [];
      this.boundingBox = {
        min: new Vector3(Infinity, Infinity, Infinity),
        max: new Vector3(-Infinity, -Infinity, -Infinity)
      };
      this.boundingSphere = {
        center: new Vector3(),
        radius: 0
      };
    }

    addVertex(x, y, z) {
      if (x instanceof Vector3) {
        this.vertices.push(x.clone());
      } else {
        this.vertices.push(new Vector3(x, y, z));
      }
      this.computeBoundingBox();
      return this.vertices.length - 1; // Return index
    }

    addNormal(x, y, z) {
      if (x instanceof Vector3) {
        this.normals.push(x.clone());
      } else {
        this.normals.push(new Vector3(x, y, z));
      }
      return this.normals.length - 1; // Return index
    }

    addUV(u, v) {
      if (u instanceof Vector2) {
        this.uvs.push(u.clone());
      } else {
        this.uvs.push(new Vector2(u, v));
      }
      return this.uvs.length - 1; // Return index
    }

    addFace(a, b, c, material = null) {
      // Calculate face normal if we have vertices
      let normal = new Vector3();
      
      if (this.vertices.length > 0) {
        const va = this.vertices[a];
        const vb = this.vertices[b];
        const vc = this.vertices[c];
        
        const edge1 = new Vector3().copy(vb).sub(va);
        const edge2 = new Vector3().copy(vc).sub(va);
        normal.copy(edge1).cross(edge2).normalize();
      }
      
      const face = new Face(a, b, c, normal, material);
      this.faces.push(face);
      return face;
    }

    computeBoundingBox() {
      // Reset bounding box
      this.boundingBox.min.set(Infinity, Infinity, Infinity);
      this.boundingBox.max.set(-Infinity, -Infinity, -Infinity);
      
      // Compute min/max from vertices
      for (const vertex of this.vertices) {
        this.boundingBox.min.x = Math.min(this.boundingBox.min.x, vertex.x);
        this.boundingBox.min.y = Math.min(this.boundingBox.min.y, vertex.y);
        this.boundingBox.min.z = Math.min(this.boundingBox.min.z, vertex.z);
        
        this.boundingBox.max.x = Math.max(this.boundingBox.max.x, vertex.x);
        this.boundingBox.max.y = Math.max(this.boundingBox.max.y, vertex.y);
        this.boundingBox.max.z = Math.max(this.boundingBox.max.z, vertex.z);
      }
      
      return this;
    }

    computeBoundingSphere() {
      this.computeBoundingBox();
      
      // Use bounding box center as sphere center
      this.boundingSphere.center.set(
        (this.boundingBox.min.x + this.boundingBox.max.x) / 2,
        (this.boundingBox.min.y + this.boundingBox.max.y) / 2,
        (this.boundingBox.min.z + this.boundingBox.max.z) / 2
      );
      
      // Find the radius
      let maxRadiusSquared = 0;
      for (const vertex of this.vertices) {
        const dx = vertex.x - this.boundingSphere.center.x;
        const dy = vertex.y - this.boundingSphere.center.y;
        const dz = vertex.z - this.boundingSphere.center.z;
        
        const distanceSquared = dx * dx + dy * dy + dz * dz;
        maxRadiusSquared = Math.max(maxRadiusSquared, distanceSquared);
      }
      
      this.boundingSphere.radius = Math.sqrt(maxRadiusSquared);
      
      return this;
    }

    computeVertexNormals() {
      // Initialize normals array if empty
      if (this.normals.length !== this.vertices.length) {
        this.normals = [];
        for (let i = 0; i < this.vertices.length; i++) {
          this.normals.push(new Vector3());
        }
      } else {
        // Reset existing normals
        for (let i = 0; i < this.normals.length; i++) {
          this.normals[i].set(0, 0, 0);
        }
      }
      
      // Accumulate face normals to vertices
      for (const face of this.faces) {
        const vA = this.vertices[face.a];
        const vB = this.vertices[face.b];
        const vC = this.vertices[face.c];
        
        const edge1 = new Vector3().copy(vB).sub(vA);
        const edge2 = new Vector3().copy(vC).sub(vA);
        const normal = new Vector3().copy(edge1).cross(edge2).normalize();
        
        // Add face normal to each vertex normal
        this.normals[face.a].add(normal);
        this.normals[face.b].add(normal);
        this.normals[face.c].add(normal);
      }
      
      // Normalize all vertex normals
      for (let i = 0; i < this.normals.length; i++) {
        this.normals[i].normalize();
      }
      
      return this;
    }

    // Create common primitive shapes
    static createBox(width = 1, height = 1, depth = 1) {
      const geometry = new Geometry();
      
      // Half dimensions
      const w = width / 2;
      const h = height / 2;
      const d = depth / 2;
      
      // Vertices (8 corners of the box)
      geometry.addVertex(-w, -h, -d); // 0: left bottom back
      geometry.addVertex( w, -h, -d); // 1: right bottom back
      geometry.addVertex( w,  h, -d); // 2: right top back
      geometry.addVertex(-w,  h, -d); // 3: left top back
      geometry.addVertex(-w, -h,  d); // 4: left bottom front
      geometry.addVertex( w, -h,  d); // 5: right bottom front
      geometry.addVertex( w,  h,  d); // 6: right top front
      geometry.addVertex(-w,  h,  d); // 7: left top front
      
      // UVs for box
      geometry.addUV(0, 0);  // 0: bottom left
      geometry.addUV(1, 0);  // 1: bottom right
      geometry.addUV(1, 1);  // 2: top right
      geometry.addUV(0, 1);  // 3: top left
      
      // Faces (2 triangles per side of the box)
      // Front
      const frontFace1 = geometry.addFace(4, 5, 6);
      frontFace1.setUV(0, 1, 2); // bottom-left, bottom-right, top-right
      
      const frontFace2 = geometry.addFace(4, 6, 7);
      frontFace2.setUV(0, 2, 3); // bottom-left, top-right, top-left
      
      // Back
      const backFace1 = geometry.addFace(1, 0, 3);
      backFace1.setUV(1, 0, 3); // bottom-right, bottom-left, top-left
      
      const backFace2 = geometry.addFace(1, 3, 2);
      backFace2.setUV(1, 3, 2); // bottom-right, top-left, top-right
      
      // Top
      const topFace1 = geometry.addFace(7, 6, 2);
      topFace1.setUV(0, 1, 2); // bottom-left, bottom-right, top-right
      
      const topFace2 = geometry.addFace(7, 2, 3);
      topFace2.setUV(0, 2, 3); // bottom-left, top-right, top-left
      
      // Bottom
      const bottomFace1 = geometry.addFace(0, 1, 5);
      bottomFace1.setUV(3, 2, 1); // top-left, top-right, bottom-right
      
      const bottomFace2 = geometry.addFace(0, 5, 4);
      bottomFace2.setUV(3, 1, 0); // top-left, bottom-right, bottom-left
      
      // Left
      const leftFace1 = geometry.addFace(0, 4, 7);
      leftFace1.setUV(0, 1, 2); // bottom-left, bottom-right, top-right
      
      const leftFace2 = geometry.addFace(0, 7, 3);
      leftFace2.setUV(0, 2, 3); // bottom-left, top-right, top-left
      
      // Right
      const rightFace1 = geometry.addFace(5, 1, 2);
      rightFace1.setUV(1, 0, 3); // bottom-right, bottom-left, top-left
      
      const rightFace2 = geometry.addFace(5, 2, 6);
      rightFace2.setUV(1, 3, 2); // bottom-right, top-left, top-right
      
      // Compute normals and bounds
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      
      return geometry;
    }
    
    static createSphere(radius = 1, widthSegments = 16, heightSegments = 12) {
      const geometry = new Geometry();
      
      // Generate vertices and UVs
      for (let y = 0; y <= heightSegments; y++) {
        const v = y / heightSegments;
        const phi = v * Math.PI;
        
        for (let x = 0; x <= widthSegments; x++) {
          const u = x / widthSegments;
          const theta = u * Math.PI * 2;
          
          // Vertex position (spherical coordinates to cartesian)
          const sinPhiRadius = Math.sin(phi) * radius;
          const px = -sinPhiRadius * Math.cos(theta);
          const py = Math.cos(phi) * radius; 
          const pz = sinPhiRadius * Math.sin(theta);
          
          // Add vertex
          geometry.addVertex(px, py, pz);
          
          // Add normal (normalized vertex position)
          const nx = px / radius;
          const ny = py / radius;
          const nz = pz / radius;
          geometry.addNormal(nx, ny, nz);
          
          // Add UV
          geometry.addUV(u, v);
        }
      }
      
      // Generate faces
      for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < widthSegments; x++) {
          const verticesPerRow = widthSegments + 1;
          const a = y * verticesPerRow + x;
          const b = a + 1;
          const c = a + verticesPerRow;
          const d = c + 1;
          
          // Two triangles per segment
          const face1 = geometry.addFace(a, b, d);
          const face2 = geometry.addFace(a, d, c);
          
          // UV indices match vertex indices for the sphere
          face1.setUV(a, b, d);
          face2.setUV(a, d, c);
        }
      }
      
      // Compute bounds
      geometry.computeBoundingSphere();
      
      return geometry;
    }
    
    static createPlane(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
      const geometry = new Geometry();
      
      const halfWidth = width / 2;
      const halfHeight = height / 2;
      
      // Generate vertices
      for (let y = 0; y <= heightSegments; y++) {
        const v = y / heightSegments;
        const py = v * height - halfHeight;
        
        for (let x = 0; x <= widthSegments; x++) {
          const u = x / widthSegments;
          const px = u * width - halfWidth;
          
          // Add vertex (plane is in XY plane, facing +Z)
          geometry.addVertex(px, py, 0);
          
          // Add normal (all facing +Z)
          geometry.addNormal(0, 0, 1);
          
          // Add UV
          geometry.addUV(u, v);
        }
      }
      
      // Generate faces
      for (let y = 0; y < heightSegments; y++) {
        for (let x = 0; x < widthSegments; x++) {
          const verticesPerRow = widthSegments + 1;
          const a = y * verticesPerRow + x;
          const b = a + 1;
          const c = a + verticesPerRow;
          const d = c + 1;
          
          // Two triangles per segment
          const face1 = geometry.addFace(a, b, d);
          const face2 = geometry.addFace(a, d, c);
          
          // UV indices match vertex indices for the plane
          face1.setUV(a, b, d);
          face2.setUV(a, d, c);
        }
      }
      
      // Compute bounds
      geometry.computeBoundingSphere();
      
      return geometry;
    }
  }

  // ---- SVG Renderer ----
  class SVGRenderer {
    constructor(container, width = 800, height = 600) {
      this.container = container;
      this.width = width;
      this.height = height;
      this.svg = null;
      this.showWireframe = true;
      this.renderMode = 'normal'; // 'normal', 'depth', 'wireframe', 'solid'
      this.handleIntersections = true;
      this.showIntersectionLines = true;
      this.intersectionMarkers = null;
      this.lightDirection = new Vector3(1, 1, 1).normalize();
      this.renderableFaces = [];
      this.backfaceCullingEnabled = true;
      this.intersectionThreshold = 0.05;
      this.planeDepthBias = 0.01; // Small bias for plane depth to avoid z-fighting
      
      // New properties for improved material system
      this.patternCache = new Map();
      this.textureLoadPromises = new Map();
      this.minUV = { x: Infinity, y: Infinity, z: Infinity };
      this.maxUV = { x: -Infinity, y: -Infinity, z: -Infinity };
      
      this.initialize();
    }
    
    initialize() {
      // Create SVG element with namespaces
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('width', this.width);
      this.svg.setAttribute('height', this.height);
      this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
      this.svg.style.backgroundColor = '#111';
      
      // Create a group for the scene
      this.sceneGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.svg.appendChild(this.sceneGroup);
      
      // Add SVG to container
      this.container.appendChild(this.svg);
    }
    
    setSize(width, height) {
      this.width = width;
      this.height = height;
      
      this.svg.setAttribute('width', width);
      this.svg.setAttribute('height', height);
      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Update camera aspect ratio if it exists
      if (this.camera) {
        // Handle different camera types
        if (this.camera.perspective) {
          // Camera with perspective projection mode
          this.camera.perspective.aspect = width / height;
          this.camera.updateProjectionMatrix();
        } else if (this.camera.aspect) {
          // Direct aspect ratio property
          this.camera.aspect = width / height;
          this.camera.updateProjectionMatrix();
        }
      }
      
      return this;
    }
    
    setRenderMode(mode) {
      if (['normal', 'depth', 'wireframe', 'solid'].includes(mode)) {
        this.renderMode = mode;
      }
      return this;
    }
    
    toggleWireframe() {
      this.showWireframe = !this.showWireframe;
      return this;
    }
    
    getWireframeState() {
      return this.showWireframe;
    }
    
    // Calculate depth color - converts depth to a color gradient
    getDepthColor(depth) {
      // Map depth to a value between 0 and 1
      const normalizedDepth = Math.max(0, Math.min(1, 
        (depth - this.depthNear) / (this.depthFar - this.depthNear)
      ));
      
      // Convert to a grayscale color (white=near, black=far)
      const colorValue = Math.floor(255 * (1 - normalizedDepth));
      return `rgb(${colorValue},${colorValue},${colorValue})`;
    }
    
    // Generate a hue color for depth visualization
    getDepthColorHue(depth) {
      // Map depth to a hue value (0-360)
      // Near objects are blue (240), far objects are red (0)
      const normalizedDepth = Math.max(0, Math.min(1, 
        (depth - this.depthNear) / (this.depthFar - this.depthNear)
      ));
      
      // Convert to hue (far = red, near = blue)
      const hue = 240 - (normalizedDepth * 240);
      return `hsl(${hue}, 100%, 50%)`;
    }
    
    toggleIntersectionHandling() {
      this.handleIntersections = !this.handleIntersections;
      return this;
    }
    
    getIntersectionHandlingState() {
      return this.handleIntersections;
    }
    
    toggleIntersectionLines() {
      this.showIntersectionLines = !this.showIntersectionLines;
      return this;
    }
    
    getIntersectionLinesState() {
      return this.showIntersectionLines;
    }
    
    // NEW: Parse color from hex to RGB object
    parseColor(hexColor) {
      return {
        r: parseInt(hexColor.slice(1, 3), 16),
        g: parseInt(hexColor.slice(3, 5), 16),
        b: parseInt(hexColor.slice(5, 7), 16)
      };
    }
    
    // NEW: Calculate color with lighting applied
    calculateLitColor(base, specular, emissive, intensity, shininess) {
      // Apply diffuse lighting
      const r = Math.min(255, Math.floor(base.r * intensity) + emissive.r);
      const g = Math.min(255, Math.floor(base.g * intensity) + emissive.g);
      const b = Math.min(255, Math.floor(base.b * intensity) + emissive.b);
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // NEW: Calculate face normal
    calculateFaceNormal(vertices) {
      const v0 = vertices[0];
      const v1 = vertices[1];
      const v2 = vertices[2];
      
      const edge1 = new Vector3(v1.x - v0.x, v1.y - v0.y, v1.z - v0.z);
      const edge2 = new Vector3(v2.x - v0.x, v2.y - v0.y, v2.z - v0.z);
      
      return new Vector3().copy(edge1).cross(edge2).normalize();
    }
    
    // NEW: Get appropriate axes for UV mapping
    getUVAxes(normal) {
      const absX = Math.abs(normal.x);
      const absY = Math.abs(normal.y);
      const absZ = Math.abs(normal.z);
      
      if (absX >= absY && absX >= absZ) {
        // X is dominant, use YZ plane
        return ['y', 'z'];
      } else if (absY >= absX && absY >= absZ) {
        // Y is dominant, use XZ plane
        return ['x', 'z'];
      } else {
        // Z is dominant, use XY plane
        return ['x', 'y'];
      }
    }
    
    // NEW: Calculate screen area of a face
    calculateScreenArea(points) {
      if (points.length < 3) return 0;
      
      // Simple polygon area formula
      let area = 0;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        area += (points[j].x + points[i].x) * (points[j].y - points[i].y);
      }
      return Math.abs(area) / 2;
    }
    
    // NEW: Prepare UV bounds for better texture mapping
    prepareUVBounds(scene) {
      this.minUV = { x: Infinity, y: Infinity, z: Infinity };
      this.maxUV = { x: -Infinity, y: -Infinity, z: -Infinity };
      
      // Traverse scene to find object bounds
      scene.traverse(object => {
        if (object instanceof Mesh && object.geometry && object.geometry.vertices) {
          // Calculate bounds from vertices
          object.geometry.vertices.forEach(v => {
            const worldV = v.clone();
            object.worldMatrix.transformPoint(worldV);
            
            this.minUV.x = Math.min(this.minUV.x, worldV.x);
            this.minUV.y = Math.min(this.minUV.y, worldV.y);
            this.minUV.z = Math.min(this.minUV.z, worldV.z);
            
            this.maxUV.x = Math.max(this.maxUV.x, worldV.x);
            this.maxUV.y = Math.max(this.maxUV.y, worldV.y);
            this.maxUV.z = Math.max(this.maxUV.z, worldV.z);
          });
        }
      });
    }
    
    // NEW: Calculate better UVs for a face
    calculateUVs(face) {
      // If the face already has UVs stored, use those
      if (face.uvs) {
        return face.uvs;
      }
      
      // Otherwise use improved planar mapping
      const vertices = face.points.map(p => p.worldPos);
      
      // Find a reasonable UV plane
      const normal = this.calculateFaceNormal(vertices);
      
      // Get the coordinate system for UVs
      const [uAxis, vAxis] = this.getUVAxes(normal);
      
      // Map UVs using the chosen axes
      return vertices.map(v => ({
        u: (v[uAxis] - this.minUV[uAxis]) / (this.maxUV[uAxis] - this.minUV[uAxis] || 1),
        v: 1 - ((v[vAxis] - this.minUV[vAxis]) / (this.maxUV[vAxis] - this.minUV[vAxis] || 1))
      }));
    }
    
    // NEW: Get or create a pattern for a texture
    getTexturePattern(texture, faceMapId) {
      // Create a more consistent key based on texture source
      const textureSource = texture.image.src || texture.url;
      // Use object hash as cache key for textures without URLs
      const cacheKey = textureSource || 
        `texture-${texture.color}-${JSON.stringify(texture.repeat)}-${JSON.stringify(texture.offset)}`;
      
      if (this.patternCache.has(cacheKey)) {
        return this.patternCache.get(cacheKey);
      }
      
      // Create a unique ID for this pattern - use a hash of the src
      const hash = textureSource.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const patternId = `pattern-${Math.abs(hash)}`;
      
      // Store in cache
      this.patternCache.set(cacheKey, patternId);
      console.log('Created new pattern base ID:', patternId, 'for texture:', textureSource);
      return patternId;
    }
    
    // NEW: Select appropriate mipmap level for texture
    selectMipmapLevel(face, texture) {
      if (!texture.mipmaps || texture.mipmaps.length === 0) return texture.image;
      
      // Calculate approximate screen size of face
      const points = face.points;
      const area = this.calculateScreenArea(points);
      const textureArea = texture.image.width * texture.image.height;
      
      // Select appropriate mipmap level
      const ratio = area / textureArea;
      const level = Math.min(
        texture.mipmaps.length - 1,
        Math.max(0, Math.floor(-Math.log2(ratio)))
      );
      
      return level === 0 ? texture.image : texture.mipmaps[level - 1];
    }
    
    // NEW: Update a face with texture after it's loaded
    updateTexturedFace(polygon, texture, face) {
      // Extract face info from either the face object or the polygon attributes
      let faceMapId, faceIndex;
      
      if (face && face.faceMapId) {
        // If face object is provided, extract info from it
        faceMapId = face.faceMapId;
        faceIndex = face.faceGeometryIndex;
        console.log(`Updating face ${faceMapId} with loaded texture:`, texture.url);
      } else {
        // Otherwise try to get from polygon attributes
        faceMapId = polygon.getAttribute('data-face-map-id');
        faceIndex = parseInt(polygon.getAttribute('data-face-index'), 10);
        console.log(`Updating face by ID ${faceMapId || 'unknown'} with loaded texture:`, texture.url);
      }
      
      try {
        // Make sure we have a valid polygon and texture
        if (!polygon || !texture || !texture.loaded) {
          console.warn('Invalid polygon or texture for update');
          return;
        }
        
        // If no faceMapId, try to use faceIndex as fallback
        if (!faceMapId && !isNaN(faceIndex)) {
          faceMapId = `face-${faceIndex}`;
        }
        
        // If still no faceMapId, generate a random one as last resort
        if (!faceMapId) {
          faceMapId = `random-${Math.floor(Math.random() * 1000)}`;
          console.warn('Face mapping ID not provided, using random ID:', faceMapId);
        }
        
        // Create a unique pattern ID based on the texture source and face map ID
        const textureSource = texture.image.src || texture.url;
        const hash = textureSource.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        const patternId = `pattern-async-${Math.abs(hash)}-${faceMapId}`;
        
        // Check if we need to create the pattern
        if (!document.getElementById(patternId)) {
          console.log('Creating pattern for async texture update:', patternId);
          
          // Create defs element if needed
          let defsSvg = this.svg.querySelector('defs');
          if (!defsSvg) {
            console.log('Creating new defs section for texture update');
            defsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this.svg.insertBefore(defsSvg, this.svg.firstChild);
          }
          
          // Create pattern element
          const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
          pattern.setAttribute('id', patternId);
          pattern.setAttribute('patternUnits', 'userSpaceOnUse');
          pattern.setAttribute('width', texture.image.width);
          pattern.setAttribute('height', texture.image.height);
          
          // Create a patternTransform based on the face ID
          let transform = '';
          
          // Extract object and face IDs from the face map ID
          let [objectId, faceGeometryIndex] = faceMapId.split('-');
          
          // Convert to number, or use 0 if we can't parse it
          faceGeometryIndex = parseInt(faceGeometryIndex, 10) || 0;
          
          // For a box geometry, the faces are grouped in pairs (2 triangles per face)
          const faceNumber = faceGeometryIndex % 12; // 12 triangles in a box (6 faces * 2 triangles)
          const cubeFace = Math.floor(faceNumber / 2) % 6;
          
          // Apply rotation for each face to create a more 3D-like effect
          switch (cubeFace) {
            case 0: // Front face - no rotation
              break;
            case 1: // Back face - 180 degrees
              transform += `rotate(180, ${texture.image.width/2}, ${texture.image.height/2}) `;
              break;
            case 2: // Top face - 90 degrees
              transform += `rotate(90, ${texture.image.width/2}, ${texture.image.height/2}) `;
              break;
            case 3: // Bottom face - 270 degrees
              transform += `rotate(270, ${texture.image.width/2}, ${texture.image.height/2}) `;
              break;
            case 4: // Left face - 90 degrees + flip
              transform += `rotate(90, ${texture.image.width/2}, ${texture.image.height/2}) scale(-1, 1) `;
              break;
            case 5: // Right face - 270 degrees + flip
              transform += `rotate(270, ${texture.image.width/2}, ${texture.image.height/2}) scale(-1, 1) `;
              break;
          }
          
          // Apply standard transformations
          if (texture.repeat.x !== 1 || texture.repeat.y !== 1) {
            const scaleX = 1 / texture.repeat.x;
            const scaleY = 1 / texture.repeat.y;
            transform += `scale(${scaleX} ${scaleY}) `;
          }
          
          if (texture.offset.x !== 0 || texture.offset.y !== 0) {
            transform += `translate(${texture.offset.x * texture.image.width} ${texture.offset.y * texture.image.height}) `;
          }
          
          if (texture.rotation !== 0) {
            transform += `rotate(${texture.rotation * 180 / Math.PI}, ${texture.image.width/2}, ${texture.image.height/2}) `;
          }
          
          if (texture.flipY) {
            transform += `scale(1 -1) translate(0 -${texture.image.height}) `;
          }
          
          if (transform) {
            pattern.setAttribute('patternTransform', transform);
          }
          
          // Add image to pattern
          const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
          image.setAttribute('x', '0');
          image.setAttribute('y', '0');
          image.setAttribute('width', texture.image.width);
          image.setAttribute('height', texture.image.height);
          
          // Use both href attributes for maximum compatibility
          try {
            image.setAttribute('href', texture.image.src);
          } catch (e) {
            console.warn('Error setting href attribute:', e);
          }
          
          image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', texture.image.src);
          
          pattern.appendChild(image);
          defsSvg.appendChild(pattern);
          
          console.log('Created pattern for texture update with image:', texture.image.src);
        }
        
        // Update the polygon's fill with standard format first
      polygon.setAttribute('fill', `url(#${patternId})`);
        
        // Add debug info
        polygon.setAttribute('data-textured', 'true');
        polygon.setAttribute('data-pattern-id', patternId);
        polygon.setAttribute('data-face-map-id', faceMapId);
        
        // Set opacity to 1 to ensure visibility
        polygon.setAttribute('fill-opacity', '1');
        
        // Remove the pending flag
      polygon.removeAttribute('data-pending-texture');
        
        console.log(`Polygon updated with texture pattern: ${patternId} for face: ${faceMapId}`);
      } catch (e) {
        console.error('Error updating textured face:', e);
      }
    }
    
    render(scene, camera) {
      this.camera = camera;
      
      // Clear previous rendering
      while (this.sceneGroup.firstChild) {
        this.sceneGroup.removeChild(this.sceneGroup.firstChild);
      }
      
      // Reset renderable faces array for global sorting
      this.renderableFaces = [];
      this.intersectionMarkers = [];
      
      // NEW: Prepare UV bounds for better texture mapping
      this.prepareUVBounds(scene);
      
      // Update camera matrices
      camera.updateMatrix();
      camera.updateWorldMatrix();
      camera.updateViewMatrix();
      camera.updateViewProjectionMatrix();
      
      // Process the scene graph to collect all renderable faces
      this.processObject(scene, camera);
      
      // Sort all faces by depth (furthest first) - Painter's algorithm globally across all objects
      this.renderableFaces.sort((a, b) => b.depth - a.depth);
      
      // Render all faces in order
      this.renderFaces();
      
      // Render intersection markers if enabled
      if (this.handleIntersections && this.showIntersectionLines) {
        this.renderIntersectionMarkers();
      }
    }
    
    processObject(object, camera) {
      if (!object.visible) return;
      
      // Update object's matrix
      object.updateMatrix();
      object.updateWorldMatrix();
      
      // Process faces for all Mesh objects
      if (object instanceof Mesh) {
        // Debug: Check if this mesh has a texture
        if (object.material && object.material.map) {
          console.log(`Processing mesh with texture: ${object.name}`, {
            materialHasMap: !!object.material.map,
            textureLoaded: object.material.map ? object.material.map.loaded : false,
            textureURL: object.material.map ? object.material.map.url : 'none',
            materialColor: object.material.color,
            materialOpacity: object.material.opacity
          });
        }
        
        this.processFaces(object, camera);
      }
      
      // Process children
      object.children.forEach(child => {
        this.processObject(child, camera);
      });
    }
    
    // Generic method to process faces for any Mesh object
    processFaces(mesh, camera) {
      // Project all vertices
      const projectedVertices = [];
      
      for (let i = 0; i < mesh.geometry.vertices.length; i++) {
        projectedVertices.push(this.projectVertex(mesh.geometry.vertices[i], mesh, camera, true));
      }
      
      // Process each face
      const facesToProcess = [];
      
      // Debug info for faces with textures
      let texturedFacesCount = 0;
      
      mesh.geometry.faces.forEach((face, faceGeometryIndex) => {
        // Debug textures: Check if material has map
        const faceMaterial = face.material || mesh.material;
        if (faceMaterial && faceMaterial.map) {
          texturedFacesCount++;
        }
        
        // Get the projected vertices for this face
        const va = projectedVertices[face.a];
        const vb = projectedVertices[face.b];
        const vc = projectedVertices[face.c];
        
        // Calculate face normal in world space for backface culling
        const edge1 = new Vector3(
          vb.worldPos.x - va.worldPos.x,
          vb.worldPos.y - va.worldPos.y,
          vb.worldPos.z - va.worldPos.z
        );
        
        const edge2 = new Vector3(
          vc.worldPos.x - va.worldPos.x,
          vc.worldPos.y - va.worldPos.y,
          vc.worldPos.z - va.worldPos.z
        );
        
        const normal = new Vector3().copy(edge1).cross(edge2).normalize();
        
        // Calculate view direction from face to camera
        const center = new Vector3(
          (va.worldPos.x + vb.worldPos.x + vc.worldPos.x) / 3,
          (va.worldPos.y + vb.worldPos.y + vc.worldPos.y) / 3,
          (va.worldPos.z + vb.worldPos.z + vc.worldPos.z) / 3
        );
        
        const viewDirection = new Vector3(
          camera.position.x - center.x,
          camera.position.y - center.y,
          camera.position.z - center.z
        ).normalize();
        
        // Dot product - if positive, face is visible to camera
        const dot = normal.dot(viewDirection);
        
        // Use a small epsilon value to prevent faces from disappearing when almost perpendicular
        // This allows faces that are very slightly facing away to still be rendered
        const BACKFACE_CULLING_EPSILON = this.backfaceCullingEnabled ? -0.01 : -0.05; // Tighter tolerance when enabled
        
        // Special handling for very thin objects (like planes)
        const isVeryThin = Math.abs(normal.dot(viewDirection)) < 0.1;
        
        // Check if this is a plane mesh
        const isPlane = mesh.geometry.vertices.every(v => Math.abs(v.z) < 0.001);
        
        // Only collect faces facing the camera or almost perpendicular
        if (dot > BACKFACE_CULLING_EPSILON || (isVeryThin && isPlane)) {
          // Calculate the distance from camera to each vertex and take the minimum
          // This ensures that the closest point of the face is used for depth sorting
          const d1 = this.calculatePointDistance(va.worldPos, camera.position);
          const d2 = this.calculatePointDistance(vb.worldPos, camera.position);
          const d3 = this.calculatePointDistance(vc.worldPos, camera.position);
          
          // Use minimum distance for more accurate depth sorting
          const depth = Math.min(d1, d2, d3);
          
          // Store UV data if available
          let uvs = null;
          if (mesh.geometry.uvs && mesh.geometry.uvs.length > 0 && face.uv) {
            uvs = [
              mesh.geometry.uvs[face.uv[0]],
              mesh.geometry.uvs[face.uv[1]],
              mesh.geometry.uvs[face.uv[2]]
            ];
          }
          
          // Store face data for potential intersection processing
          facesToProcess.push({
            vertices: [mesh.geometry.vertices[face.a], mesh.geometry.vertices[face.b], mesh.geometry.vertices[face.c]],
            worldVertices: [va.worldPos, vb.worldPos, vc.worldPos],
            screenPoints: [va, vb, vc],
            uvs: uvs,
            depth: depth,
            normal: normal,
            material: face.material || mesh.material,
            objectId: mesh.id,
            objectType: mesh.type,
            // Store face geometry index for consistent texture mapping
            faceGeometryIndex: faceGeometryIndex,
            // Generate a stable mapping key for textures
            faceMapId: `${mesh.id}-${faceGeometryIndex}`
          });
        }
      });
      
      // Debug texture info summary
      if (texturedFacesCount > 0) {
        console.log(`Found ${texturedFacesCount} faces with textures in ${mesh.name || 'unnamed mesh'}`);
      }
      
      // Process intersections if enabled
      if (this.handleIntersections && facesToProcess.length > 0) {
        this.processIntersections(facesToProcess);
      } else {
        // If intersection handling is disabled, just add faces directly
        facesToProcess.forEach(face => {
          // Debug: Check if face material has texture
          if (face.material && face.material.map) {
            console.log('Adding face with texture to renderableFaces:', {
              materialColor: face.material.color,
              textureLoaded: face.material.map.loaded,
              textureURL: face.material.map.url,
              faceMapId: face.faceMapId
            });
          }
          
          this.renderableFaces.push({
            points: face.screenPoints,
            depth: face.depth,
            material: face.material,
            objectId: face.objectId,
            uvs: face.uvs,
            faceGeometryIndex: face.faceGeometryIndex,
            faceMapId: face.faceMapId
          });
        });
      }
    }
    
    // Helper method to calculate distance between two points in 3D space
    calculatePointDistance(point1, point2) {
      const dx = point1.x - point2.x;
      const dy = point1.y - point2.y;
      const dz = point1.z - point2.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    // Process potential intersections between faces
    processIntersections(faces) {
      // Reset intersection markers
      this.intersectionMarkers = [];
      
      // If we have very few faces, don't bother with intersection checks
      if (faces.length < 2) {
        // Just add the original faces and return
        faces.forEach(face => {
          this.renderableFaces.push({
            points: face.screenPoints,
            depth: face.depth,
            material: face.material,
            objectId: face.objectId,
            isSubdivided: false
          });
        });
        return;
      }
      
      // Track which faces have been processed
      const processedFaces = new Set();
      
      // Calculate world-space bounding box to help generate intersection markers
      let worldMin = new Vector3(Infinity, Infinity, Infinity);
      let worldMax = new Vector3(-Infinity, -Infinity, -Infinity);
      
      faces.forEach(face => {
        face.worldVertices.forEach(vertex => {
          worldMin.x = Math.min(worldMin.x, vertex.x);
          worldMin.y = Math.min(worldMin.y, vertex.y);
          worldMin.z = Math.min(worldMin.z, vertex.z);
          
          worldMax.x = Math.max(worldMax.x, vertex.x);
          worldMax.y = Math.max(worldMax.y, vertex.y);
          worldMax.z = Math.max(worldMax.z, vertex.z);
        });
      });
      
      // Add some padding to the bounding box
      worldMin.x -= 1;
      worldMin.y -= 1;
      worldMin.z -= 1;
      worldMax.x += 1;
      worldMax.y += 1;
      worldMax.z += 1;
      
      // Check for potential intersections
      for (let i = 0; i < faces.length; i++) {
        for (let j = i + 1; j < faces.length; j++) {
          const faceA = faces[i];
          const faceB = faces[j];
          
          // Skip faces from the same object
          if (faceA.objectId === faceB.objectId) continue;
          
          // Early rejection test - if the depth difference is large, they can't intersect
          // This now uses the closest point from each face for a more accurate test
          if (Math.abs(faceA.depth - faceB.depth) > this.intersectionThreshold) continue;
          
          // Check if triangles potentially intersect using a more accurate method
          // that considers the actual 3D geometry rather than just depth
          const intersects = IntersectionHelper.trianglesIntersect(
            faceA.worldVertices[0], faceA.worldVertices[1], faceA.worldVertices[2],
            faceB.worldVertices[0], faceB.worldVertices[1], faceB.worldVertices[2]
          );
          
          if (intersects) {
            // Create planes for both faces
            const planeA = new Plane3D(
              faceA.worldVertices[0], faceA.worldVertices[1], faceA.worldVertices[2]
            );
            
            const planeB = new Plane3D(
              faceB.worldVertices[0], faceB.worldVertices[1], faceB.worldVertices[2]
            );
            
            // Generate intersection markers if enabled
            if (this.showIntersectionLines) {
              const markers = IntersectionHelper.generateIntersectionMarkers(
                planeA, planeB, worldMin, worldMax
              );
              
              markers.forEach(marker => {
                // Project marker to screen space
                const projectedMarker = this.projectVertex(marker, { worldMatrix: new Matrix4() }, this.camera);
                
                // Calculate depth
                const depth = this.calculatePointDistance(marker, this.camera.position);
                
                // Store marker for rendering
                this.intersectionMarkers.push({
                  point: projectedMarker,
                  depth: depth
                });
              });
            }
            
            // Subdivide face A along plane B
            const subdividedA = IntersectionHelper.subdivideTriangle(
              faceA.worldVertices[0], faceA.worldVertices[1], faceA.worldVertices[2], planeB
            );
            
            // Subdivide face B along plane A
            const subdividedB = IntersectionHelper.subdivideTriangle(
              faceB.worldVertices[0], faceB.worldVertices[1], faceB.worldVertices[2], planeA
            );
            
            // Only process subdivided faces if they exist
            if (subdividedA) {
              this.processSubdividedFaces(subdividedA, faceA, true);
              processedFaces.add(i);
            }
            
            if (subdividedB) {
              this.processSubdividedFaces(subdividedB, faceB, false);
              processedFaces.add(j);
            }
          }
        }
      }
      
      // Add any unprocessed faces (those that didn't intersect with others)
      faces.forEach((face, index) => {
        if (!processedFaces.has(index)) {
          this.renderableFaces.push({
            points: face.screenPoints,
            depth: face.depth,
            material: face.material,
            objectId: face.objectId,
            isSubdivided: false
          });
        }
      });
    }
    
    // Process subdivided faces from intersection
    processSubdividedFaces(subdivided, originalFace, isFront) {
      // Extract material and screen points from the original face
      const material = originalFace.material;
      const originalScreenPoints = originalFace.screenPoints;
      
      // Process front faces and back faces
      const subset = isFront ? subdivided.front : subdivided.back;
      
      // Skip if the subset is empty
      if (!subset || subset.length === 0) return;
      
      // Process each triangle in the subset
      subset.forEach(triangle => {
        // Get world-space points
        const p1 = triangle[0];
        const p2 = triangle[1];
        const p3 = triangle[2];
        
        // Project to screen space
        const s1 = this.projectVertex(p1, { worldMatrix: new Matrix4() }, this.camera);
        const s2 = this.projectVertex(p2, { worldMatrix: new Matrix4() }, this.camera);
        const s3 = this.projectVertex(p3, { worldMatrix: new Matrix4() }, this.camera);
        
        // Combine into a list
        const screenPoints = [s1, s2, s3];
        
        // Calculate depth based on the minimum distance to camera
        const d1 = this.calculatePointDistance(p1, this.camera.position);
        const d2 = this.calculatePointDistance(p2, this.camera.position);
        const d3 = this.calculatePointDistance(p3, this.camera.position);
        const depth = Math.min(d1, d2, d3);
        
        // Add subdivided face with depth based on true geometric distance
        this.renderableFaces.push({
          points: screenPoints,
          depth: depth,
          material: material,
          objectId: originalFace.objectId,
          isSubdivided: true,
          isFront: isFront
        });
      });
    }
    
    // Render all sorted faces
    renderFaces() {
      // First pass: update depth range for visualization modes
      if (this.renderMode === 'depth' || this.renderMode === 'color-depth') {
        // Find min and max depth in the current frame
        let minDepth = Infinity;
        let maxDepth = -Infinity;
        
        this.renderableFaces.forEach(face => {
          minDepth = Math.min(minDepth, face.depth);
          maxDepth = Math.max(maxDepth, face.depth);
        });
        
        // Add a small padding to avoid division by zero
        if (maxDepth - minDepth < 0.001) {
          maxDepth = minDepth + 0.001;
        }
        
        // Update depth range
        this.depthNear = minDepth;
        this.depthFar = maxDepth;
      }
      
      // More precise sorting function that respects object type and depth
      const sortFaces = (a, b) => {
        // First compare by depth (back to front for painter's algorithm)
        const depthDifference = b.depth - a.depth;
        
        // If depth difference is very small, use additional sorting criteria
        if (Math.abs(depthDifference) < 0.001) {
          // If faces are from the same object, preserve original order
          if (a.objectId === b.objectId) {
            return 0;
          }
          
          // If one is subdivided and the other is not, render subdivided first
          if (a.isSubdivided !== b.isSubdivided) {
            return a.isSubdivided ? -1 : 1;
          }
          
          // If both are subdivided, sort by isFront parameter
          if (a.isSubdivided && b.isSubdivided) {
            if (a.isFront !== b.isFront) {
              return a.isFront ? -1 : 1;
            }
          }
          
          // If still tied, prefer opaque objects before transparent
          if ((a.material.opacity === 1) !== (b.material.opacity === 1)) {
            return a.material.opacity === 1 ? -1 : 1;
          }
          
          // Last resort: sort by objectId for consistency
          return a.objectId - b.objectId;
        }
        
        // Otherwise, use standard back-to-front sorting
        return depthDifference;
      };
      
      // For normal rendering, separate transparent and opaque faces
      if (this.renderMode === 'normal') {
        // Separate transparent and opaque faces
        const opaqueFaces = [];
        const transparentFaces = [];
        
        this.renderableFaces.forEach(face => {
          if (face.material.opacity < 1) {
            transparentFaces.push(face);
          } else {
            opaqueFaces.push(face);
          }
        });
        
        // Sort both sets of faces using our improved sorting function
        opaqueFaces.sort(sortFaces);
        transparentFaces.sort(sortFaces);
        
        // Combine: render opaque faces first, then transparent
        this.renderableFaces = [...opaqueFaces, ...transparentFaces];
      } else {
        // For all other modes, use our improved sorting
        this.renderableFaces.sort(sortFaces);
      }
      
      // Always create defs section - we'll need it for patterns
      let defsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        this.svg.appendChild(defsSvg);
      console.log('Created defs section for SVG rendering');
      
      // Helper to create pattern for texture
      const createPatternForTexture = (texture, face, currentFaceIndex) => {
        // Extract the face map ID for consistent pattern mapping
        // If face object has a mapId use it, otherwise use the current face index
        const faceMapId = (face && face.faceMapId) 
          ? face.faceMapId 
          : `face-${currentFaceIndex}`;
        
        // Get cached or new pattern ID
        const patternId = this.getTexturePattern(texture, faceMapId);
        
        // Create a unique ID based on face map ID
        const uniquePatternId = `${patternId}-${faceMapId}`;
        
        // Check if pattern already exists in DOM
        if (document.getElementById(uniquePatternId)) {
          console.log('Using existing pattern:', uniquePatternId);
          return uniquePatternId;
        }
        
        // Make sure defsSvg exists
        if (!defsSvg) {
          console.warn('defsSvg element not created before pattern creation');
          defsSvg = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          this.svg.appendChild(defsSvg);
        }
        
        console.log('Creating new pattern:', uniquePatternId, 'for texture:', texture.url, 'with faceMapId:', faceMapId);
        
        // Create pattern element
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', uniquePatternId);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('width', texture.image.width);
        pattern.setAttribute('height', texture.image.height);
        
        // Create a patternTransform based on the face's position and orientation
        let transform = '';
        
        // Extract object and face IDs from the face map ID
        const parts = faceMapId.split('-');
        const objectId = parts[0];
        const faceGeometryIndex = parseInt(parts[1], 10) || 0;
        
        const faceNumber = faceGeometryIndex % 12; // 12 triangles in a box (6 faces * 2 triangles)
        
        // Calculate which cube face (0-5) this triangle belongs to
        // For a box geometry, the faces are grouped in pairs (2 triangles per face)
        const cubeFace = Math.floor(faceNumber / 2) % 6;
        
        // Apply rotation for each face to create a more 3D-like effect
        // This uses the actual cube face index (0-5) for consistent mapping
        switch (cubeFace) {
          case 0: // Front face - no rotation
            break;
          case 1: // Back face - 180 degrees
            transform += `rotate(180, ${texture.image.width/2}, ${texture.image.height/2}) `;
            break;
          case 2: // Top face - 90 degrees
            transform += `rotate(90, ${texture.image.width/2}, ${texture.image.height/2}) `;
            break;
          case 3: // Bottom face - 270 degrees
            transform += `rotate(270, ${texture.image.width/2}, ${texture.image.height/2}) `;
            break;
          case 4: // Left face - 90 degrees + flip
            transform += `rotate(90, ${texture.image.width/2}, ${texture.image.height/2}) scale(-1, 1) `;
            break;
          case 5: // Right face - 270 degrees + flip
            transform += `rotate(270, ${texture.image.width/2}, ${texture.image.height/2}) scale(-1, 1) `;
            break;
        }
        
        // Apply standard texture transformations
        // Apply repeat
        if (texture.repeat.x !== 1 || texture.repeat.y !== 1) {
          const scaleX = 1 / texture.repeat.x;
          const scaleY = 1 / texture.repeat.y;
          transform += `scale(${scaleX} ${scaleY}) `;
        }
        
        // Apply offset
        if (texture.offset.x !== 0 || texture.offset.y !== 0) {
          transform += `translate(${texture.offset.x * texture.image.width} ${texture.offset.y * texture.image.height}) `;
        }
        
        // Apply rotation (around center)
        if (texture.rotation !== 0) {
          transform += `rotate(${texture.rotation * 180 / Math.PI}, ${texture.image.width/2}, ${texture.image.height/2}) `;
        }
        
        // Apply vertical flip if needed
        if (texture.flipY) {
          transform += `scale(1 -1) translate(0 -${texture.image.height}) `;
        }
        
        if (transform) {
          pattern.setAttribute('patternTransform', transform);
        }
        
        // Use the image directly, avoiding the mipmap selection since we don't have face here
        const imageToUse = texture.image;
        
        // Add image to pattern
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', imageToUse.width);
        image.setAttribute('height', imageToUse.height);
        
        // Try direct href first (modern SVG)
        try {
          image.setAttribute('href', imageToUse.src);
        } catch (e) {
          console.warn('Error setting href attribute:', e);
        }
        
        // Always set xlink:href for maximum compatibility 
        try {
          // Use proper namespace
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', imageToUse.src);
        } catch (e) {
          console.error('Error setting xlink:href attribute:', e);
        }
        
        pattern.appendChild(image);
        
        // Log detailed info about the image being added
        console.log('Adding image to pattern:', {
          src: imageToUse.src,
          width: imageToUse.width, 
          height: imageToUse.height,
          complete: imageToUse.complete,
          patternId: uniquePatternId,
          cubeFace: cubeFace
        });
        
        // Add pattern to defs
        defsSvg.appendChild(pattern);
        
        return uniquePatternId;
      };
      
      // NEW: Render textured face with error handling
      const renderTexturedFace = (face, polygon, faceIndex) => {
        try {
          if (face.material.map && face.material.map.loaded) {
            console.log('Rendering textured face:', faceIndex, 'with mapId:', face.faceMapId || `face-${faceIndex}`);
            
            // If faceMapId is undefined, add one for consistency
            if (!face.faceMapId) {
              face.faceMapId = `face-${faceIndex}`;
              console.log('Added missing faceMapId:', face.faceMapId);
            }
            
            // Apply texture using pattern with face-specific mapping ID
            const patternId = createPatternForTexture(face.material.map, face, faceIndex);
            
            // IMPORTANT: Make sure the fill attribute gets set properly
            // Try direct DOM manipulation to ensure pattern is applied
            const patternUrl = `url(#${patternId})`;
            polygon.setAttribute('fill', patternUrl);
            console.log(`Applied pattern ID ${patternId} to polygon ${faceIndex} with fill attribute: ${patternUrl}`);
            
            // Add data attributes for debugging
            polygon.setAttribute('data-face-index', faceIndex);
            polygon.setAttribute('data-pattern-id', patternId);
            polygon.setAttribute('data-face-map-id', face.faceMapId);
            
            // Check SVG namespace
            const svgNS = polygon.namespaceURI;
            console.log('SVG namespace:', svgNS);
            
            // Explicitly set the stroke to none to ensure it doesn't override
            // the texture visibility
            polygon.setAttribute('stroke', 'none');
            
            // Set opacity explicitly to 1 for textured faces to ensure visibility
            polygon.setAttribute('fill-opacity', '1');
            
            // Mark the polygon as textured for debugging
            polygon.setAttribute('data-textured', 'true');
          } else if (face.material.map && !face.material.map.loaded) {
            console.log('Texture not yet loaded:', face.material.map.url);
            // Fallback for loading textures
            polygon.setAttribute('fill', face.material.color);
            polygon.setAttribute('data-pending-texture', 'true');
            polygon.setAttribute('data-face-index', faceIndex);
            if (face.faceMapId) {
              polygon.setAttribute('data-face-map-id', face.faceMapId);
            }
            
            // When texture loads, update the polygon
            if (face.material.map.onLoad === null) {
              face.material.map.onLoad = (loadedTexture) => {
                console.log(`Texture loaded for face ${faceIndex} (${face.faceMapId || 'unknown'}), updating:`, loadedTexture.url);
                // Store the face information for proper pattern creation
                polygon.setAttribute('data-face-index', faceIndex);
                if (face.faceMapId) {
                  polygon.setAttribute('data-face-map-id', face.faceMapId);
                }
                // Create a simple face object with required properties
                const simpleFace = {
                  faceMapId: face.faceMapId,
                  faceGeometryIndex: face.faceGeometryIndex
                };
                this.updateTexturedFace(polygon, loadedTexture, simpleFace);
              };
            }
          } else {
            // No texture, just use material color
            polygon.setAttribute('fill', face.material.color);
          }
        } catch (e) {
          console.error('Error rendering textured face:', e);
          // Fallback to material color
          polygon.setAttribute('fill', face.material.color);
        }
      };
      
      // Render sorted faces
      this.renderableFaces.forEach((face, faceIndex) => {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        
        // Set points attribute
        const pointsAttr = face.points.map(p => `${p.x},${p.y}`).join(' ');
        polygon.setAttribute('points', pointsAttr);
        
        // NEW: Apply blending mode if specified
        if (face.material.blending && face.material.blending !== 'normal') {
          switch (face.material.blending) {
            case 'additive':
              polygon.setAttribute('mix-blend-mode', 'screen');
              break;
            case 'multiply':
              polygon.setAttribute('mix-blend-mode', 'multiply');
              break;
          }
        }
        
        // Apply styling based on render mode
        switch (this.renderMode) {
          case 'normal':
            // NEW: Check for phong shading
            if (face.material.shading === 'phong') {
              // Calculate lighting based on face normal and light direction
              const normal = face.normal || this.calculateFaceNormal(face.points.map(p => p.worldPos));
              const lightIntensity = Math.max(0.1, normal.dot(this.lightDirection));
              
              // Apply material properties
              const baseColor = this.parseColor(face.material.color);
              const specularColor = this.parseColor(face.material.specular);
              const emissiveColor = this.parseColor(face.material.emissive);
              
              // Calculate final color with lighting
              const finalColor = this.calculateLitColor(
                baseColor, 
                specularColor,
                emissiveColor,
                lightIntensity,
                face.material.shininess
              );
              
              polygon.setAttribute('fill', finalColor);
            }
            // Regular material rendering or apply texture
            else if (face.material.map) {
              console.log('Face with texture found:', {
                materialMap: !!face.material.map,
                mapLoaded: face.material.map ? face.material.map.loaded : false,
                mapURL: face.material.map ? face.material.map.url : 'none',
                faceIndex: faceIndex,
                faceMapId: face.faceMapId || `face-${faceIndex}`
              });
              renderTexturedFace(face, polygon, faceIndex);
            }
            else if (face.isSubdivided) {
              // Use a slightly different color to indicate subdivision
              const originalColor = face.material.color;
              let highlightColor = originalColor;
              
              // Alter the color slightly to show it's subdivided
              if (face.isFront) {
                // Brighter for front faces
                highlightColor = this.adjustColor(originalColor, 1.2);
              } else {
                // Darker for back faces
                highlightColor = this.adjustColor(originalColor, 0.8);
              }
              
              polygon.setAttribute('fill', highlightColor);
              // Add a special stroke to highlight intersection boundaries
              polygon.setAttribute('stroke', '#fff');
              polygon.setAttribute('stroke-width', '1.5');
              polygon.setAttribute('stroke-opacity', '0.8');
            } else {
              polygon.setAttribute('fill', face.material.color);
              // Only add stroke if wireframe is enabled
              if (this.showWireframe || face.material.wireframe) {
                polygon.setAttribute('stroke', '#000');
                polygon.setAttribute('stroke-width', '1');
              } else {
                polygon.setAttribute('stroke', 'none');
              }
            }
            polygon.setAttribute('fill-opacity', face.material.opacity.toString());
            
            // NEW: Apply normal map if available
            if (face.material.normalMap && face.material.normalMap.loaded) {
              // Create a filter to simulate normal mapping
              const filterId = `normalmap-${faceIndex}`;
              const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
              filter.setAttribute('id', filterId);
              
              // Create lighting effect with normal map
              const lighting = document.createElementNS('http://www.w3.org/2000/svg', 'feDiffuseLighting');
              lighting.setAttribute('in', 'SourceGraphic');
              lighting.setAttribute('surfaceScale', '5');
              
              // Add light source
              const distantLight = document.createElementNS('http://www.w3.org/2000/svg', 'feDistantLight');
              distantLight.setAttribute('azimuth', '45');
              distantLight.setAttribute('elevation', '45');
              
              lighting.appendChild(distantLight);
              filter.appendChild(lighting);
              defsSvg.appendChild(filter);
              
              // Apply the filter
              polygon.setAttribute('filter', `url(#${filterId})`);
            }
            break;
            
          case 'depth':
            // Depth visualization - white is near, black is far
            // Normalize depth for visualization
            const normalizedDepth = (face.depth - this.depthNear) / (this.depthFar - this.depthNear);
            // Convert to grayscale (darker = further away)
            const colorValue = Math.floor(255 * (1 - normalizedDepth));
            polygon.setAttribute('fill', `rgb(${colorValue},${colorValue},${colorValue})`);
            // Only add stroke if wireframe is enabled
            if (this.showWireframe) {
              polygon.setAttribute('stroke', '#333');
              polygon.setAttribute('stroke-width', '1');
            } else {
              polygon.setAttribute('stroke', 'none');
            }
            polygon.setAttribute('fill-opacity', '1.0'); // Always opaque for depth view
            break;
            
          case 'wireframe':
            // Just show lines
            polygon.setAttribute('fill', 'none');
            polygon.setAttribute('stroke', '#fff');
            polygon.setAttribute('stroke-width', '1');
            break;
            
          case 'solid':
            // Solid color based on object, ignore transparency
            polygon.setAttribute('fill', face.material.color);
            // Only add stroke if wireframe is enabled
            if (this.showWireframe) {
              polygon.setAttribute('stroke', '#000');
              polygon.setAttribute('stroke-width', '1');
            } else {
              polygon.setAttribute('stroke', 'none');
            }
            polygon.setAttribute('fill-opacity', '1.0'); // Always fully opaque
            break;
        }
        
        // Store depth as data attribute for debugging
        polygon.setAttribute('data-depth', face.depth.toFixed(2));
        if (face.objectId) {
          polygon.setAttribute('data-object-id', face.objectId);
        }
        
        // Add a transparency flag for debugging
        if (face.material.transparent) {
          polygon.setAttribute('data-transparent', 'true');
        }
        
        this.sceneGroup.appendChild(polygon);
      });
      
      // Clean up defs if created
      if (defsSvg && defsSvg.childNodes.length === 0) {
        this.svg.removeChild(defsSvg);
      }
    }
    
    // Helper to adjust a color's brightness
    adjustColor(hexColor, factor) {
      // Convert hex to RGB
      let r = parseInt(hexColor.slice(1, 3), 16);
      let g = parseInt(hexColor.slice(3, 5), 16);
      let b = parseInt(hexColor.slice(5, 7), 16);
      
      // Adjust brightness
      r = Math.min(255, Math.max(0, Math.floor(r * factor)));
      g = Math.min(255, Math.max(0, Math.floor(g * factor)));
      b = Math.min(255, Math.max(0, Math.floor(b * factor)));
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Project a vertex from 3D to 2D screen space
    projectVertex(vertex, object, camera, storeWorldPos = false) {
      // Clone vertex to avoid modifying original
      const v = vertex.clone();
      
      // Transform to world space (Object Space -> World Space)
      object.worldMatrix.transformPoint(v);
      
      // Store world position for possible use
      const worldPos = v.clone();
      
      // Transform to view space (World Space -> View Space)
      camera.viewMatrix.transformPoint(v);
      
      // Store view space Z if needed
      const viewZ = v.z;
      
      // Apply projection matrix to get clip space coordinates
      const clipSpacePos = vertex.clone();
      
      // In column-major order:
      // First transform to world space
      object.worldMatrix.transformPoint(clipSpacePos);
      // Then to view space
      camera.viewMatrix.transformPoint(clipSpacePos);
      // Then to clip space
      camera.projectionMatrix.transformPoint(clipSpacePos);
      
      // Perspective division to get NDC coordinates
      // Only needed for perspective projection, not for orthographic
      const isOrthographic = camera.activeMode && camera.activeMode.type === 'orthographic';
      if (!isOrthographic && clipSpacePos.z !== 0) {
        clipSpacePos.x /= Math.abs(clipSpacePos.z);
        clipSpacePos.y /= Math.abs(clipSpacePos.z);
      }
      
      // Convert from NDC to screen coordinates
      const screenX = (clipSpacePos.x + 1) * 0.5 * this.width;
      const screenY = (clipSpacePos.y + 1) * 0.5 * this.height; // No longer need to flip Y
      
      return {
        x: screenX,
        y: screenY,
        z: viewZ,
        worldPos: worldPos
      };
    }
    
    renderCube(cube, camera) {
      // This method is now just a wrapper for processFaces
      // The actual rendering is done globally after sorting all faces
      this.processFaces(cube, camera);
    }
    
    // Render intersection markers
    renderIntersectionMarkers() {
      // Sort markers by depth
      this.intersectionMarkers.sort((a, b) => b.depth - a.depth);
      
      // Render each marker
      this.intersectionMarkers.forEach(marker => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', marker.point.x);
        circle.setAttribute('cy', marker.point.y);
        circle.setAttribute('r', '3');
        circle.setAttribute('fill', '#ffff00');
        circle.setAttribute('stroke', '#000000');
        circle.setAttribute('stroke-width', '1');
        
        this.sceneGroup.appendChild(circle);
      });
    }
    
    // Toggle backface culling
    setBackfaceCulling(enabled) {
      this.backfaceCullingEnabled = enabled;
    }
    
    // Get backface culling state
    getBackfaceCullingState() {
      return this.backfaceCullingEnabled;
    }
  }

  // ---- Animation Loop ----
  class RenderLoop {
    constructor(renderer, scene, camera, controllers = [], minimap = null) {
      this.renderer = renderer;
      this.scene = scene;
      this.camera = camera;
      this.controllers = Array.isArray(controllers) ? controllers : [controllers];
      this.minimap = minimap;
      this.lastTime = 0;
      this.fps = 60;
      this.frameCount = 0;
      this.lastFpsUpdate = 0;
      this.isRunning = false;
      this.animationId = null;
      
      // Stats tracking
      this.meshCount = 0;
      this.faceCount = 0;
    }
    
    start() {
      this.isRunning = true;
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    stop() {
      this.isRunning = false;
      cancelAnimationFrame(this.animationId);
    }
    
    updateStats() {
      // Count meshes and faces in the scene (can be overridden)
      this.meshCount = 0;
      this.faceCount = 0;
      
      const countObjects = (object) => {
        // Check if object has faces (shape objects will have faces)
        if (object.faces) {
          this.meshCount++;
          this.faceCount += object.faces.length;
        }
        
        if (object.children) {
          object.children.forEach(child => {
            countObjects(child);
          });
        }
      };
      
      countObjects(this.scene);
      
      // Update minimap if available
      if (this.minimap) {
        this.minimap.update();
      }
    }
    
    animate(time) {
      if (!this.isRunning) return;
      
      // Calculate delta time
      const deltaTime = (time - this.lastTime) / 1000; // in seconds
      this.lastTime = time;
      
      // Update FPS calculation
      this.frameCount++;
      if (time - this.lastFpsUpdate > 1000) { // Update FPS every second
        this.fps = this.frameCount * 1000 / (time - this.lastFpsUpdate);
        this.frameCount = 0;
        this.lastFpsUpdate = time;
        
        // Update stats
        this.updateStats();
      }
      
      // Update controllers
      this.controllers.forEach(controller => {
        if (controller && typeof controller.update === 'function') {
          controller.update(deltaTime);
        }
      });
      
      // Render the scene
      this.renderer.render(this.scene, this.camera);
      
      // Continue animation loop
      this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
  }